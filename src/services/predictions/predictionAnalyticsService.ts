/**
 * Prediction Analytics Service
 * Transforma datos de Firestore → PredictionRow[] para tabla de análisis
 * US-1007: PredictionAnalysisTable
 */

import type { PredictionRow } from '../../components/Analytics/PredictionAnalysisTable'
import { getRecentForecasts, type ForecastDoc, type ForecastSnapshot } from '../firebase/firebaseWeatherService'
import { getRecentClassificationReports, getRecentWeatherReports } from '../firebase/classificationReportService'
import { getForecastCache } from '../cache/cacheService'

// REF-001 (sprint-11): fallbacks a raw_condition_code/classified eliminados.
// pgo_condition es la unica fuente — calculado por la CF al momento del sync.
function classifySnapshot(snapshot: ForecastSnapshot): string {
  return snapshot.pgo_condition
}

/**
 * Obtener predicciones para análisis (últimas 24h)
 * Primero intenta caché local (rápido), sino consulta Firestore
 * US-1008: Caché Inteligente
 *
 * @returns Promise<PredictionRow[]> — filas listas para tabla
 */
export async function fetchPredictions(preloadedDocs?: ForecastDoc[]): Promise<PredictionRow[]> {
  try {
    // 1. Usar docs pre-cargados si se pasan (evita doble lookup de caché)
    let forecasts: ForecastDoc[] = preloadedDocs ?? await getForecastCache()
    let source = preloadedDocs ? 'preloaded' : 'cache'

    // Si caché vacío, cargar de Firestore
    if (forecasts.length === 0) {
      forecasts = await getRecentForecasts('24h')
      source = 'firestore'
    }

    console.log(`[PredictionAnalytics] Loaded ${forecasts.length} forecasts from ${source}`)

    if (!forecasts.length) {
      console.warn('[PredictionAnalytics] No forecasts found in last 24h')
      return []
    }

    // 2. Cargar reportes de clasificación + clima real (para obtener el "actual" confirmado)
    // BUG-008 FIX: Leer ambas colecciones (classification_reports + weather_reports)
    const classificationReports = await getRecentClassificationReports(24)
    const weatherReports = await getRecentWeatherReports(24)

    // 3. Crear índice unificado por city|date_hour para búsqueda O(1)
    // Soporta tanto ClassificationReport como WeatherReport (ambos con campo should_be/reported_condition)
    const reportIndex = new Map<string, { should_be?: string }>()

    // Agregar reportes de clasificación
    classificationReports.forEach(report => {
      const key = `${report.city_id}|${report.date_hour}`
      reportIndex.set(key, { should_be: report.should_be })
    })

    // Agregar reportes de clima real (weather_reports)
    // Si hay conflicto (ambas colecciones tienen reporte), usa classification_reports (ya está en índice)
    weatherReports.forEach(report => {
      const key = `${report.city_id}|${report.date_hour}`
      if (!reportIndex.has(key)) {
        reportIndex.set(key, { should_be: report.reported_condition })
      }
    })

    // 4. Transformar a PredictionRow[]
    const rows: PredictionRow[] = []

    forecasts.forEach(forecast => {
      // ✅ CORRECCIÓN: Tomar SOLO snapshots[0] (la predicción "actual")
      // Los otros snapshots [1-11] se usan para LOOKBACK solamente
      if (forecast.snapshots.length === 0) {
        console.warn(`[PredictionAnalytics] Forecast for ${forecast.city_id} has no snapshots`)
        return
      }

      const snapshot = forecast.snapshots[0]
      const queryTime = timestampToDate(forecast.created_at)

      // Buscar reporte de confirmación para esta city+date_hour
      const reportKey = `${forecast.city_id}|${forecast.date_hour}`
      const report = reportIndex.get(reportKey)

      // prediction = pgo_condition del snapshot (calculado por CF)
      // actual = should_be del reporte manual (confirmacion del usuario)
      const predictedCondition = classifySnapshot(snapshot)

      const row: PredictionRow = {
        queryTime,
        hour: snapshot.hour,
        cityId: forecast.city_id,
        cityName: forecast.city_name,
        timezone: forecast.timezone || 0,
        targetHour: forecast.target_hour,
        localTimeUser: forecast.local_time_user || '',
        prediction: predictedCondition,
        actual: report?.should_be ?? null,
        correct: report ? predictedCondition === report.should_be : null,
        lat: forecast.lat,
        lon: forecast.lon,
        dateHour: forecast.date_hour,
      }

      rows.push(row)
    })

    console.log(`[PredictionAnalytics] ✅ Generated ${rows.length} prediction rows (${classificationReports.length} + ${weatherReports.length} reports loaded)`)
    return rows
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[PredictionAnalytics] Error fetching predictions:', errorMsg)
    return []
  }
}

/**
 * Convertir Firestore Timestamp a Date
 */
function timestampToDate(ts: unknown): Date {
  // Validación explícita: rechaza null/undefined, acepta 0 válido
  if (ts === null || ts === undefined) return new Date()

  // Si es Timestamp de Firebase (tiene método toDate)
  const tsObj = ts as Record<string, unknown>
  if (typeof tsObj.toDate === 'function') {
    return (tsObj.toDate as () => Date)()
  }

  // Si es número (milisegundos)
  if (typeof ts === 'number') {
    return new Date(ts)
  }

  // Si es string ISO
  if (typeof ts === 'string') {
    return new Date(ts)
  }

  return new Date()
}

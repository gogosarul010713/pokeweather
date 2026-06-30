/**
 * Prediction Analytics Service
 * Transforma datos de Firestore → PredictionRow[] para tabla de análisis
 * US-1007: PredictionAnalysisTable
 */

import type { PredictionRow } from '../../components/Analytics/PredictionAnalysisTable'
import { getRecentForecasts, type ForecastDoc, type ForecastSnapshot } from '../firebase/firebaseWeatherService'
import { getRecentWeatherReports, type WeatherReport } from '../firebase/classificationReportService'
import { getForecastCache } from '../cache/cacheService'

/**
 * Construye indice city_id|date_hour → reporte para busqueda O(1).
 * Compartido entre fetchPredictions y cleanupService (evita duplicar regla de negocio).
 */
export function buildReportIndex(reports: WeatherReport[]): Map<string, { should_be?: string }> {
  const index = new Map<string, { should_be?: string }>()
  reports.forEach(r => index.set(`${r.city_id}|${r.date_hour}`, { should_be: r.reported_condition }))
  return index
}

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

    // 2. Cargar reportes de clima real (para obtener el "actual" confirmado)
    // REF-004: classification_reports eliminada (D-047) — siempre estuvo vacia, ver decision-log
    const weatherReports = await getRecentWeatherReports(24)

    // 3. Crear índice por city|date_hour para búsqueda O(1)
    const reportIndex = buildReportIndex(weatherReports)

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

    console.log(`[PredictionAnalytics] ✅ Generated ${rows.length} prediction rows (${weatherReports.length} reports loaded)`)
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

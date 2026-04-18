/**
 * Prediction Analytics Service
 * Transforma datos de Firestore → PredictionRow[] para tabla de análisis
 * US-1007: PredictionAnalysisTable
 */

import type { PredictionRow, LookbackItem } from '../../components/Analytics/PredictionAnalysisTable'
import { getRecentForecasts, type ForecastDoc } from '../firebase/firebaseWeatherService'
import { getRecentClassificationReports, type ClassificationReport } from '../firebase/classificationReportService'

/**
 * Obtener predicciones para análisis (últimas 24h)
 * Procesa snapshots de Firestore y genera lookback
 *
 * @returns Promise<PredictionRow[]> — filas listas para tabla
 */
export async function fetchPredictions(): Promise<PredictionRow[]> {
  try {
    // 1. Cargar forecasts recientes desde Firestore
    const forecasts = await getRecentForecasts('24h')

    if (!forecasts.length) {
      console.warn('[PredictionAnalytics] No forecasts found in last 24h')
      return []
    }

    // 2. Cargar reportes de clasificación (para obtener el "actual" confirmado)
    const reports = await getRecentClassificationReports(24)

    // 3. Crear índice por city|date_hour para búsqueda O(1)
    const reportIndex = new Map<string, ClassificationReport>()
    reports.forEach(report => {
      const key = `${report.city_id}|${report.date_hour}`
      reportIndex.set(key, report)
    })

    // 4. Transformar a PredictionRow[]
    const rows: PredictionRow[] = []

    forecasts.forEach(forecast => {
      forecast.snapshots.forEach(snapshot => {
        const queryTime = timestampToDate(forecast.created_at)

        // Buscar reporte de confirmación para esta city+hour
        const reportKey = `${forecast.city_id}|${forecast.date_hour}`
        const report = reportIndex.get(reportKey)

        // Crear row con campos básicos
        // Nota: prediction y actual son CONDICIONES CLIMÁTICAS, no tipos Pokémon
        const row: PredictionRow = {
          queryTime,
          hour: snapshot.hour,
          cityId: forecast.city_id,
          cityName: forecast.city_name,
          prediction: snapshot.classified || 'Unknown',
          actual: report?.should_be ?? null, // null = "Sin datos"
          correct: report ? snapshot.classified === report.should_be : null,
          lookback12h: [], // Se calcula abajo
        }

        // 5. Generar lookback: buscar en forecasts previos de ESTA CIUDAD
        // Lookback es: "¿en las últimas 12h, qué condición habría sido correcta?"
        row.lookback12h = generateLookback(
          forecast.city_id,
          snapshot.hour,
          queryTime,
          forecasts,
          reportIndex
        )

        rows.push(row)
      })
    })

    console.log(`[PredictionAnalytics] ✅ Generated ${rows.length} prediction rows (${reports.length} reports loaded)`)
    return rows
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[PredictionAnalytics] Error fetching predictions:', errorMsg)
    return []
  }
}

/**
 * Nota: Confianza por row individual no es significativa
 * La confianza real es acumulada (ej: 88/100 aciertos en Auckland)
 * Future work: Agregar dashboard de confianza acumulada por ciudad/hora
 * Para ahora: No se usa en tabla individual (columna removida)
 */

/**
 * Generar lookback 12h: encontrar qué condición climática habría sido correcta
 * en las 12 horas previas a esta predicción
 *
 * Busca en reports si la predicción (classified) coincidía con lo real (should_be)
 */
function generateLookback(
  cityId: string,
  targetHour: number,
  targetTime: Date,
  allForecasts: ForecastDoc[],
  reportIndex: Map<string, ClassificationReport>
): LookbackItem[] {
  const lookbackItems: LookbackItem[] = []

  // Buscar en forecasts de la misma ciudad
  const citySamples = allForecasts.filter(f => f.city_id === cityId)

  if (!citySamples.length) {
    return lookbackItems
  }

  // Para cada hora en las últimas 12h antes de targetTime
  for (let hoursAgo = 1; hoursAgo <= 12; hoursAgo++) {
    const checkTime = new Date(targetTime.getTime() - hoursAgo * 60 * 60 * 1000)

    // Buscar un forecast cercano a checkTime (dentro de 30 min)
    const nearbyForecast = citySamples.find(f => {
      const forecastTime = timestampToDate(f.created_at)
      const diff = Math.abs(forecastTime.getTime() - checkTime.getTime())
      return diff < 30 * 60 * 1000 // 30 minutos
    })

    if (nearbyForecast) {
      // Encontrar el snapshot de la hora correspondiente
      const targetSnapshot = nearbyForecast.snapshots.find(
        s => s.hour === targetHour
      )

      if (targetSnapshot) {
        // Buscar el reporte para esta fecha_hora
        const reportKey = `${cityId}|${nearbyForecast.date_hour}`
        const report = reportIndex.get(reportKey)

        // ¿Esta condición habría sido correcta?
        // Solo sí hay reporte (si no hay, no sabemos qué fue real)
        const wouldBeCorrect = report
          ? targetSnapshot.classified === report.should_be
          : false

        // Si no hay reporte, omitir este item (no incluir si no hay confirmación)
        if (report) {
          lookbackItems.push({
            hoursAgo,
            condition: targetSnapshot.classified || 'Unknown',
            wouldBeCorrect,
            timestamp: `${String(targetSnapshot.hour).padStart(2, '0')}:00`,
          })
        }
      }
    }
  }

  // Ordenar por hoursAgo (más reciente primero)
  return lookbackItems.sort((a, b) => a.hoursAgo - b.hoursAgo)
}

/**
 * Convertir Firestore Timestamp a Date
 */
function timestampToDate(ts: any): Date {
  if (!ts) return new Date()

  // Si es Timestamp de Firebase
  if (typeof ts.toDate === 'function') {
    return ts.toDate()
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

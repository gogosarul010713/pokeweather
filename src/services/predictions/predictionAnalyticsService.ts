/**
 * Prediction Analytics Service
 * Transforma datos de Firestore → PredictionRow[] para tabla de análisis
 * US-1007: PredictionAnalysisTable
 */

import type { PredictionRow, LookbackItem } from '../../components/Analytics/PredictionAnalysisTable'
import { getRecentForecasts, type ForecastDoc } from '../firebase/firebaseWeatherService'
import { getRecentClassificationReports, type ClassificationReport } from '../firebase/classificationReportService'
import { getForecastCache } from '../cache/cacheService'

/**
 * Obtener predicciones para análisis (últimas 24h)
 * Primero intenta caché local (rápido), sino consulta Firestore
 * US-1008: Caché Inteligente
 *
 * @returns Promise<PredictionRow[]> — filas listas para tabla
 */
export async function fetchPredictions(): Promise<PredictionRow[]> {
  try {
    // 1. Intentar caché local primero
    let forecasts = await getForecastCache()
    let source = 'cache'

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
      // ✅ CORRECCIÓN: Tomar SOLO snapshots[0] (la predicción "actual")
      // Los otros snapshots [1-11] se usan para LOOKBACK solamente
      if (forecast.snapshots.length === 0) {
        console.warn(`[PredictionAnalytics] Forecast for ${forecast.city_id} has no snapshots`)
        return
      }

      const snapshot = forecast.snapshots[0]
      const queryTime = timestampToDate(forecast.created_at)

      // Buscar reporte de confirmación para esta city+date_hour
      // El reporte se crea en classification_reports con la fecha_hora del pronóstico
      const reportKey = `${forecast.city_id}|${forecast.date_hour}`
      const report = reportIndex.get(reportKey)

      // Crear row con campos básicos
      // Nota: prediction = calculated_condition (lo que el algoritmo determinó)
      //       actual = should_be (lo que realmente fue, según reportes manuales)
      const row: PredictionRow = {
        queryTime,
        hour: snapshot.hour, // Hora para la cual se predice (ej: 9 si consulta a las 8 AM)
        cityId: forecast.city_id,
        cityName: forecast.city_name,
        timezone: forecast.timezone || 0, // ✅ Para calcular hora local de la ciudad
        localTimeUser: forecast.local_time_user || '', // ✅ Hora local del usuario cuando se obtuvo
        prediction: forecast.calculated_condition || 'Unknown', // ✅ Lo que el algoritmo mostró
        actual: report?.should_be ?? null, // null = "Sin datos" (no confirmado aún)
        correct: report ? forecast.calculated_condition === report.should_be : null,
        lookback12h: [], // Se calcula abajo
        lat: forecast.lat,
        lon: forecast.lon,
      }

      // 5. Generar lookback: buscar en forecasts previos de ESTA CIUDAD
      // Lookback es: "¿en las últimas 12h, qué condición habría sido correcta para esta hora?"
      row.lookback12h = generateLookback(
        forecast.city_id,
        snapshot.hour, // Buscamos predicciones para ESTA HORA en forecasts anteriores
        queryTime,
        forecasts,
        reportIndex
      )

      rows.push(row)
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
 * US-1107: Generar lookback 12h — predicciones anteriores que predijeron la misma hora
 *
 * Para cada hora en las últimas 12h, busca qué condición se predijo para targetHour
 * y compara con lo real (reportIndex).
 *
 * Ej: Si targetHour=4 y targetTime=04:00, busca:
 *   - 03:00: ¿qué se predijo para 04:00?
 *   - 02:00: ¿qué se predijo para 04:00?
 *   - ... (hasta 16:00 del día anterior)
 *
 * Retorna array ordenado DESC por hoursAgo (1h atrás, 2h atrás, ... 12h atrás)
 */
function generateLookback(
  cityId: string,
  targetHour: number,
  targetTime: Date,
  allForecasts: ForecastDoc[],
  reportIndex: Map<string, ClassificationReport>
): LookbackItem[] {
  const lookbackItems: LookbackItem[] = []

  // 1. Filtrar forecasts de esta ciudad solamente
  const citySamples = allForecasts.filter(f => f.city_id === cityId)

  if (!citySamples.length) {
    return lookbackItems
  }

  // 2. Ordenar DESC por created_at (para búsqueda eficiente)
  const sortedByTime = citySamples.sort((a, b) => {
    const timeA = timestampToDate(a.created_at).getTime()
    const timeB = timestampToDate(b.created_at).getTime()
    return timeB - timeA
  })

  // 3. Para cada hora en las últimas 12h antes de targetTime
  for (let hoursAgo = 0.5; hoursAgo <= 12; hoursAgo += 0.5) {
    const checkTime = new Date(targetTime.getTime() - hoursAgo * 60 * 60 * 1000)

    // Buscar forecast más cercano en el tiempo (dentro de ±15 min)
    const nearbyForecast = sortedByTime.find(f => {
      const forecastTime = timestampToDate(f.created_at)
      const diff = Math.abs(forecastTime.getTime() - checkTime.getTime())
      return diff < 15 * 60 * 1000 // ±15 minutos
    })

    if (!nearbyForecast) continue

    // 4. Encontrar snapshot que predice para targetHour
    const targetSnapshot = nearbyForecast.snapshots.find(
      s => s.hour === targetHour
    )

    if (!targetSnapshot) continue

    // 5. Buscar reporte de confirmación para esta fecha_hora
    const reportKey = `${cityId}|${nearbyForecast.date_hour}`
    const report = reportIndex.get(reportKey)

    // 6. Determinar si habría sido correcto
    const wouldBeCorrect = report
      ? targetSnapshot.classified === report.should_be
      : false

    // 7. Incluir solo si hay confirmación real (report exists)
    if (report) {
      lookbackItems.push({
        hoursAgo: Math.round(hoursAgo * 10) / 10, // Redondear a 1 decimal
        condition: targetSnapshot.classified || 'Unknown',
        wouldBeCorrect,
        timestamp: timestampToDate(nearbyForecast.created_at).toISOString(), // Convertir a ISO string
      })
    }
  }

  // 8. Ordenar DESC por hoursAgo (recientes primero: 0.5h, 1.5h, 2.5h, ...)
  return lookbackItems.sort((a, b) => b.hoursAgo - a.hoursAgo)
}

/**
 * Convertir Firestore Timestamp a Date
 */
function timestampToDate(ts: any): Date {
  // Validación explícita: rechaza null/undefined, acepta 0 válido
  if (ts === null || ts === undefined) return new Date()

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

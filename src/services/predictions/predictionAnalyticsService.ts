/**
 * Prediction Analytics Service
 * Transforma datos de Firestore → PredictionRow[] para tabla de análisis
 * US-1007: PredictionAnalysisTable
 */

import type { PredictionRow, LookbackItem } from '../../components/Analytics/PredictionAnalysisTable'
import { getRecentForecasts, type ForecastDoc, type ForecastSnapshot } from '../firebase/firebaseWeatherService'

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

    // 2. Transformar a PredictionRow[]
    const rows: PredictionRow[] = []

    forecasts.forEach(forecast => {
      forecast.snapshots.forEach(snapshot => {
        const queryTime = timestampToDate(forecast.created_at)

        // Crear row con campos básicos
        const row: PredictionRow = {
          queryTime,
          hour: snapshot.hour,
          cityId: forecast.city_id,
          cityName: forecast.city_name,
          prediction: snapshot.classified || 'Unknown',
          confidence: estimateConfidence(snapshot),
          actual: snapshot.types?.[0] || 'Unknown',
          correct: snapshot.types?.includes(snapshot.classified) ?? false,
          lookback12h: [], // Se calcula abajo
        }

        // 3. Generar lookback: buscar en forecasts previos de ESTA CIUDAD
        // Lookback es: "¿en las últimas 12h, qué tipos habría sido correcto?"
        row.lookback12h = generateLookback(
          forecast.city_id,
          snapshot.hour,
          queryTime,
          forecasts
        )

        rows.push(row)
      })
    })

    console.log(`[PredictionAnalytics] ✅ Generated ${rows.length} prediction rows`)
    return rows
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[PredictionAnalytics] Error fetching predictions:', errorMsg)
    return []
  }
}

/**
 * Estimar confianza del modelo (placeholder)
 * Idea futura: usar accuracy_report de Firestore
 */
function estimateConfidence(snapshot: ForecastSnapshot): number {
  // Placeholder: confianza basada en condiciones
  // En datos reales, vendría del report de precisión
  const baseConfidence = 75
  const windModifier = snapshot.is_windy_override ? 5 : 0
  const extremeModifier = snapshot.is_windy_override ? 10 : 0

  return Math.min(99, baseConfidence + windModifier + extremeModifier)
}

/**
 * Generar lookback 12h: encontrar qué tipos habría sido correcto
 * en las 12 horas previas a esta predicción
 */
function generateLookback(
  cityId: string,
  targetHour: number,
  targetTime: Date,
  allForecasts: ForecastDoc[]
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
        // ¿Este tipo habría sido correcto?
        // Nota: no sabemos el "actual" de hace 12h, así que usamos el classified
        // En datos reales, tendrás accuracy_report.actual_types_seen
        const wouldBeCorrect = targetSnapshot.types?.includes(targetSnapshot.classified) ?? false

        lookbackItems.push({
          hoursAgo,
          pokemonType: targetSnapshot.classified || 'Unknown',
          wouldBeCorrect,
        })
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

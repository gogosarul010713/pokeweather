// firebaseWeatherService.ts
// Persistencia de pronósticos climáticos en Firestore
// US-801: Guardar 12 horas de pronóstico clasificado a Pokémon GO

import { db } from './firebaseConfig'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import type { City } from '../../store/useStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ForecastSnapshot {
  hour: number
  raw_condition_code: number
  raw_condition_text: string
  classified: string
  types: string[]
  temperature_c: number
  wind_kmh: number
  precipitation_mm: number
  humidity_pct: number
  is_windy_override: boolean
}

export interface ForecastDoc {
  city_id: string
  city_name: string
  country: string
  region: string
  lat: number
  lon: number
  date_hour: string
  snapshots: ForecastSnapshot[]
  ttl: Timestamp
  created_at: Timestamp
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Guardar pronóstico de 12 horas en Firestore
 * Path: /city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}
 *
 * @param city - Ciudad con datos estáticos y actuales
 * @param snapshots - Array de 12 ForecastSnapshot (1 por hora)
 *
 * @returns Promise<void>
 *   - Resolve: sin errores (exitoso o falla silenciosa)
 *   - Nunca rechaza (falla silenciosa si no está inicializado)
 *
 * @throws Never — try-catch interno, no rethrow
 */
export async function saveCityForecast(
  city: City,
  snapshots: ForecastSnapshot[]
): Promise<void> {
  // Validación: Firebase no inicializado
  if (!db) {
    console.warn('[Firebase] Firestore not initialized, skipping save')
    return
  }

  // Validación: array vacío
  if (snapshots.length === 0) {
    console.warn(`[Firebase] No forecasts to save for ${city.id}`)
    return
  }

  // Validación: array incompleto
  if (snapshots.length < 12) {
    console.warn(
      `[Firebase] Warning: ${city.id} has ${snapshots.length} snapshots (expected 12)`
    )
  }

  try {
    const now = new Date()
    const dateHour = formatDateHour(now) // "2026-04-08-14"
    const ttl = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // now + 7 días

    const forecastDoc: ForecastDoc = {
      city_id: city.id,
      city_name: city.name,
      country: city.country,
      region: city.region,
      lat: city.lat,
      lon: city.lon,
      date_hour: dateHour,
      snapshots,
      ttl: Timestamp.fromDate(ttl),
      created_at: Timestamp.now(),
    }

    // Firestore path: /city_weather/{city_id}/forecasts/{date_hour}
    const docRef = doc(db, 'city_weather', city.id, 'forecasts', dateHour)

    // Escribir documento (sin merge = overwrite si existe)
    await setDoc(docRef, forecastDoc, { merge: false })

    console.log(`[Firebase] ✅ Saved forecast for ${city.id} at ${dateHour}`)
  } catch (error) {
    // Falla silenciosa: log pero no rethrow
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn(
      `[Firebase] ⚠️ Error saving forecast for ${city.id}:`,
      errorMessage
    )
    // No rethrow — no bloquea ciclo de carga
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formatear Date a YYYY-MM-DD-HH (ISO con hora)
 * @example formatDateHour(new Date(2026,3,8,14,0,0)) → "2026-04-08-14"
 */
function formatDateHour(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')

  return `${year}-${month}-${day}-${hour}`
}

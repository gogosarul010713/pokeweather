// firebaseWeatherService.ts
// Persistencia de pronósticos climáticos en Firestore
// US-801: Guardar 12 horas de pronóstico clasificado a Pokémon GO

import { db } from './firebaseConfig'
import { doc, setDoc, Timestamp, collectionGroup, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
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
 * @param snapshots - Array de ForecastSnapshot (1 por hora). Puede estar vacío (caché geoespacial hit).
 *
 * @returns Promise<void>
 *   - Resolve: sin errores (exitoso o falla silenciosa)
 *   - Nunca rechaza (falla silenciosa si no está inicializado)
 *
 * @throws Never — try-catch interno, no rethrow
 */
export async function saveCityForecast(
  city: City,
  snapshots: ForecastSnapshot[] = []
): Promise<void> {
  // Validación: Firebase no inicializado
  if (!db) {
    console.error('[Firebase] ❌ CRITICAL: Firestore not initialized (db is null), skipping save for', city.id)
    return
  }

  // Validación: array incompleto (pero no rechazamos si está vacío — caché geoespacial hit)
  if (snapshots.length > 0 && snapshots.length < 12) {
    console.warn(
      `[Firebase] Warning: ${city.id} has ${snapshots.length} snapshots (expected 12)`
    )
  }
  if (snapshots.length === 0) {
    console.log(`[Firebase] ℹ️ ${city.id}: No snapshots (from cache), saving aggregated data only`)
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
 * Obtener pronósticos recientes desde Firestore (últimas N horas)
 * Query: collectionGroup('forecasts') filtrado por created_at
 *
 * @param timeRange - '1h' | '6h' | '24h' | '7d'
 * @returns Promise<ForecastDoc[]> — array de documentos (vacío si offline o error)
 */
export async function getRecentForecasts(
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<ForecastDoc[]> {
  if (!db) {
    console.warn('[Firebase] Firestore not initialized, returning empty forecasts')
    return []
  }

  try {
    // Calcular timestamp mínimo según rango
    const now = new Date()
    let hoursBack: number

    switch (timeRange) {
      case '1h':
        hoursBack = 1
        break
      case '6h':
        hoursBack = 6
        break
      case '24h':
        hoursBack = 24
        break
      case '7d':
        hoursBack = 7 * 24
        break
      default:
        hoursBack = 24
    }

    const minDate = new Date(now.getTime() - hoursBack * 60 * 60 * 1000)

    // Query: todos los forecasts creados en el rango, ordenados desc
    const q = query(
      collectionGroup(db, 'forecasts'),
      where('created_at', '>=', Timestamp.fromDate(minDate)),
      orderBy('created_at', 'desc'),
      limit(500) // max 500 documentos (suficiente para ~40 ciudades × múltiples horas)
    )

    const snapshot = await getDocs(q)
    const documents: ForecastDoc[] = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        city_id: data.city_id,
        city_name: data.city_name,
        country: data.country,
        region: data.region,
        lat: data.lat,
        lon: data.lon,
        date_hour: data.date_hour,
        snapshots: data.snapshots || [],
        ttl: data.ttl,
        created_at: data.created_at,
      } as ForecastDoc
    })

    console.log(`[Firebase] ✅ Loaded ${documents.length} forecasts from last ${timeRange}`)
    return documents
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn(`[Firebase] ⚠️ Error loading forecasts:`, errorMessage)
    return []
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

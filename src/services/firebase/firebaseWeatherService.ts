// firebaseWeatherService.ts
// Persistencia de pronósticos climáticos en Firestore
// US-801: Guardar 12 horas de pronóstico clasificado a Pokémon GO
// US-901: Dynamic imports (lazy Firestore SDK)

import { getDb } from './firebaseConfig'
import type { Timestamp } from 'firebase/firestore'
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
  // ✅ NEW: Clima calculado por el algoritmo (snapshots[0] procesado)
  // Se usa para comparar: calculated vs actual (en reportes manuales)
  calculated_condition: string
  // ✅ NEW: Timezone de la ciudad (offset en horas, ej: -5, +1, +9)
  // Se usa para calcular hora local de la ciudad en análisis de predicciones
  timezone: number
  // ✅ NEW: Hora local del usuario (DD/MM HH:MM) cuando se obtuvo el dato
  // Persiste en Firebase para análisis histórico
  local_time_user: string
  ttl: Timestamp
  created_at: Timestamp
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Obtener hora local del usuario (máquina local)
 * Formato: DD/MM HH:MM
 */
function getLocalTimeUser(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const mins = String(now.getMinutes()).padStart(2, '0')
  return `${day}/${month} ${hours}:${mins}`
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
  // Dynamic import Firestore functions (lazy)
  const { doc, setDoc, Timestamp } = await import('firebase/firestore')

  // Lazy initialize Firebase if needed
  const db = await getDb()

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

    // FIX US-1007: Redondear a la SIGUIENTE hora completa
    // Razón: AccuWeather pronósticos son para "las siguientes 12 horas" desde esa hora
    // Si consultamos a las 9:34 PM, guardamos como si fuera 10:00 PM para coherencia
    const nextHour = new Date(now)
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
    const dateHour = formatDateHour(nextHour) // "2026-04-08-22" (siguiente hora)

    const ttl = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // now + 7 días

    // ✅ Calcular condición: tomar snapshots[0] (la predicción "ahora")
    const calculatedCondition = snapshots.length > 0
      ? (snapshots[0].classified || 'Unknown')
      : 'Unknown'

    const forecastDoc: ForecastDoc = {
      city_id: city.id,
      city_name: city.name,
      country: city.country,
      region: city.region,
      lat: city.lat,
      lon: city.lon,
      date_hour: dateHour,
      snapshots,
      calculated_condition: calculatedCondition,
      timezone: city.timezone,
      local_time_user: getLocalTimeUser(),
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
 * STRATEGY: Procesar sin índice Firestore
 * - Obtiene todos los forecasts (sin where/orderBy)
 * - Filtra + ordena en memoria (JavaScript)
 * - Razón: Firestore requiere índice para collectionGroup().where().orderBy()
 *
 * @param timeRange - '1h' | '6h' | '24h' | '7d'
 * @returns Promise<ForecastDoc[]> — array de documentos (vacío si offline o error)
 */
export async function getRecentForecasts(
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h',
  since?: number
): Promise<ForecastDoc[]> {
  // Dynamic import Firestore functions (lazy)
  const { collectionGroup, getDocs, query, where, orderBy, Timestamp } = await import('firebase/firestore')

  // Lazy initialize Firebase if needed
  const db = await getDb()

  if (!db) {
    console.warn('[Firebase] Firestore not initialized, returning empty forecasts')
    return []
  }

  try {
    // Determinar minDate: `since` tiene precedencia, sino usar timeRange
    let minDate: Timestamp
    if (since !== undefined && since > 0) {
      minDate = Timestamp.fromMillis(since)
    } else {
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

      minDate = Timestamp.fromDate(new Date(Date.now() - hoursBack * 60 * 60 * 1000))
    }

    // ⚠️ NOTA: Firestore requiere índices COLLECTION_GROUP para where() en collectionGroup
    // Estrategia: obtener todos los docs y filtrar en memoria (compatible con current volume ~45 docs)
    // Futuro: cuando volumen crezca, crear índices COLLECTION_GROUP o usar batch queries
    const allSnapshot = await getDocs(collectionGroup(db, 'forecasts'))

    // Mapear + filtrar + ordenar en memoria
    const documents: ForecastDoc[] = allSnapshot.docs
      .map(doc => {
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
          calculated_condition: data.calculated_condition || 'Unknown',
          timezone: data.timezone ?? 0,
          local_time_user: data.local_time_user || '',
          ttl: data.ttl,
          created_at: data.created_at,
        }
      })
      .filter(doc => {
        // Filtrar por minDate o since
        const docTime = doc.created_at?.toMillis?.() ?? 0
        const minTime = minDate.toMillis?.() ?? minDate.getTime?.() ?? 0
        return docTime >= minTime
      })
      .sort((a, b) => {
        const timeA = a.created_at?.toMillis?.() ?? 0
        const timeB = b.created_at?.toMillis?.() ?? 0
        return timeB - timeA // DESC order
      })
      .slice(0, 500) // limit

    const sinceLabel = since ? new Date(since).toLocaleString() : timeRange
    console.log(`[Firebase] ✅ Query delta (since=${sinceLabel}) → ${documents.length} docs`)
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

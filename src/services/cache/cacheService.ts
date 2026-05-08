// Caché de datos climáticos en IndexedDB y locationKeys en localStorage.
// TTL dinámico: expira a HH:00:00 de la próxima hora (Lazy Load strategy).
// LocationKeys son permanentes.
//
// SPRINT 7 — US-605: Caché geoespacial optimizado
// La clave primaria del caché es locationKey (no city.id).
// Múltiples ciudades en la misma celda S2 nivel 10 comparten locationKey
// → Reutilizan la misma entrada de caché (eficiencia -33% API calls)

import { get, set, del, clear } from 'idb-keyval'
import { msUntilNextHour } from '../../utils/timeUtils'
import type { WeatherCondition } from '../../config/weatherImages'

const KEY_PREFIX_WEATHER = 'pwe-weather-'
const KEY_PREFIX_LOC     = 'pwe-loc-'

// Datos que se almacenan en caché (sin city-specific fields)
export interface WeatherData {
  condition: WeatherCondition
  boostedTypes: string[]
  isExtreme: boolean
  tempC: number
  feelsLike: number
  humidity: number
  windKmh: number
  gustKmh: number
  weatherIcon: number
  timezone: number
  updatedAt: number
  weatherImage: string
  // ⚠️ NO incluir: id, name, lat, lon (específicos de cada ciudad)
}

interface WeatherCacheEntry {
  data: WeatherData
  savedAt: number
  expiresAt: number  // Timestamp absoluto cuando expira (HH:00:00 próxima hora)
}

// ─── Datos climáticos — IndexedDB ─────────────────────────────────────────────
// CLAVE PRIMARIA: locationKey (AccuWeather)
// Beneficio: Dos ciudades con mismo locationKey = comparten caché
// Ejemplo: Shibuya + Harajuku (misma S2 cell nivel 10) → 1 entrada en IndexedDB

/**
 * Obtiene datos climáticos en caché por locationKey de AccuWeather.
 * @param locationKey ID de ubicación AccuWeather (ej: "348205" para Tokio)
 * @returns Datos climáticos o null si no está caché o está expirado
 */
export const getCachedWeather = async (locationKey: string): Promise<WeatherData | null> => {
  try {
    const entry = await get<WeatherCacheEntry>(`${KEY_PREFIX_WEATHER}${locationKey}`)
    if (!entry) return null

    // Verifica expiración absoluta: si now >= expiresAt, está expirado
    if (Date.now() >= entry.expiresAt) {
      await del(`${KEY_PREFIX_WEATHER}${locationKey}`)
      return null
    }

    return entry.data
  } catch {
    return null   // IndexedDB no disponible — falla silenciosamente
  }
}

/**
 * Almacena datos climáticos en caché por locationKey.
 * TTL: dinámico hasta la próxima HH:00:00 (compatibilitad con Pokémon GO)
 * @param locationKey ID de ubicación AccuWeather
 * @param data Datos climáticos a almacenar
 */
export const setCachedWeather = async (locationKey: string, data: WeatherData): Promise<void> => {
  try {
    const now = Date.now()
    // TTL dinámico: expira a la próxima HH:00:00
    const ttl = msUntilNextHour()
    const expiresAt = now + ttl

    await set(`${KEY_PREFIX_WEATHER}${locationKey}`, { data, savedAt: now, expiresAt })
  } catch { /* silencioso */ }
}

// ─── Location Keys de AccuWeather — localStorage (permanentes) ───────────────

export const getCachedLocationKey = (s2Key: string): string | null =>
  localStorage.getItem(`${KEY_PREFIX_LOC}${s2Key}`)

export const setCachedLocationKey = (s2Key: string, locationKey: string): void =>
  localStorage.setItem(`${KEY_PREFIX_LOC}${s2Key}`, locationKey)

// ─── Last Update Hour — localStorage (para Lazy Load) ──────────────────────────
// Guarda el timestamp de la última actualización por hora completa.
// Permite determinar si ha pasado una hora sin consultar más.

const KEY_LAST_UPDATE_HOUR = 'pwe-lastUpdateHour'

export const getLastUpdateHour = (): number | null => {
  const stored = localStorage.getItem(KEY_LAST_UPDATE_HOUR)
  return stored ? parseInt(stored, 10) : null
}

export const setLastUpdateHour = (): void => {
  // Guardar la hora actual (timestamp de HH:00:00)
  const now = new Date()
  const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0)
  localStorage.setItem(KEY_LAST_UPDATE_HOUR, hourStart.getTime().toString())
}

export const shouldRefreshCities = (): boolean => {
  const lastHourStart = getLastUpdateHour()

  // Primera vez: no hay registro
  if (lastHourStart === null) return true

  // Obtener la hora actual (HH:00:00)
  const now = new Date()
  const currentHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0)

  // Comparar: si pasó una hora, refrescar
  return currentHourStart.getTime() > lastHourStart
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

export const clearWeatherCache = (): Promise<void> => clear()

// ─── Caché de ForecastDocs (Firestore → local) ────────────────────────────────
// Propósito: evitar re-fetch a Firestore al abrir PredictionAnalysisTable
// Estrategia: idb-keyval key única + merge deduplicado

import type { ForecastDoc } from '../firebase/firebaseWeatherService'

const KEY_FORECAST_CACHE = 'pwe-forecast-cache'
const KEY_LAST_SYNC      = 'pwe-lastSync'
const FORECAST_TTL_MS    = 7 * 24 * 60 * 60 * 1000 // 7 días

export const getForecastCache = async (): Promise<ForecastDoc[]> => {
  try {
    return (await get<ForecastDoc[]>(KEY_FORECAST_CACHE)) ?? []
  } catch {
    return []
  }
}

export const setForecastCache = async (docs: ForecastDoc[]): Promise<void> => {
  try {
    // Convertir Timestamps de Firebase a milisegundos (para serializar a IndexedDB)
    // IMPORTANTE: si ya es número (docs re-serializados), preservar el valor original
    const now = Date.now()
    const serialized = docs.map(doc => ({
      ...doc,
      created_at: typeof doc.created_at === 'number' ? doc.created_at : doc.created_at?.toMillis?.() ?? now,
      ttl: typeof doc.ttl === 'number' ? doc.ttl : doc.ttl?.toMillis?.() ?? now,
    }))
    await set(KEY_FORECAST_CACHE, serialized)
  } catch { /* silencioso */ }
}

export const mergeForecastDocs = (
  cached: ForecastDoc[],
  incoming: ForecastDoc[]
): ForecastDoc[] => {
  const map = new Map<string, ForecastDoc>()
  for (const doc of cached) map.set(`${doc.city_id}-${doc.date_hour}`, doc)
  for (const doc of incoming) map.set(`${doc.city_id}-${doc.date_hour}`, doc)
  return Array.from(map.values())
}

export const cleanExpiredForecastDocs = (docs: ForecastDoc[]): ForecastDoc[] => {
  const cutoff = Date.now() - FORECAST_TTL_MS
  return docs.filter(doc => {
    // created_at puede ser Timestamp (Firestore) o number (serializado en IndexedDB)
    const createdAt = typeof doc.created_at === 'number'
      ? doc.created_at
      : doc.created_at?.toMillis?.() ?? 0
    return createdAt > cutoff
  })
}

// ─── Last Sync Timestamp — localStorage (síncrono) ───────────────────────────

export const getLastSyncTimestamp = (): number =>
  parseInt(localStorage.getItem(KEY_LAST_SYNC) ?? '0', 10)

export const setLastSyncTimestamp = (ts: number): void =>
  localStorage.setItem(KEY_LAST_SYNC, String(ts))

// ─── Metadata para Delta Sync (US-1105) ────────────────────────────────────────
// Estructura: documents + lastSyncTime para queries delta

export interface PredictionsCacheMetadata {
  documents: ForecastDoc[]
  lastSyncTime: number
  cachedAt: number
  expiresAt: number
}

const KEY_PREDICTIONS_CACHE = 'pwe-predictions-cache'
const PREDICTIONS_CACHE_TTL_MS = 60 * 60 * 1000 // 60 minutos

/**
 * Obtener metadata de caché de predicciones (documents + lastSyncTime)
 * @returns {documents, lastSyncTime, ...} o null si no existe
 */
export const getPredictionsCacheMetadata = async (): Promise<PredictionsCacheMetadata | null> => {
  try {
    const cached = await get<PredictionsCacheMetadata>(KEY_PREDICTIONS_CACHE)
    return cached ?? null
  } catch {
    return null
  }
}

/**
 * Guardar metadata de caché de predicciones (documents + lastSyncTime)
 * TTL: 60 minutos por defecto
 * @param docs Array de ForecastDoc
 * @param options {ttl?: number} TTL en ms
 */
export const setPredictionsCacheMetadata = async (
  docs: ForecastDoc[],
  options?: { ttl?: number }
): Promise<void> => {
  try {
    const ttl = options?.ttl ?? PREDICTIONS_CACHE_TTL_MS
    const now = Date.now()

    // Serializar Timestamps (timestamps se convierten a números para IndexedDB)
    // IMPORTANTE: si ya es número (docs re-serializados), preservar el valor original
    const serialized = docs.map(doc => ({
      ...doc,
      created_at: typeof doc.created_at === 'number' ? doc.created_at : doc.created_at?.toMillis?.() ?? now,
      ttl: typeof doc.ttl === 'number' ? doc.ttl : doc.ttl?.toMillis?.() ?? now,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any as ForecastDoc[]

    const metadata: PredictionsCacheMetadata = {
      documents: serialized,
      lastSyncTime: now,
      cachedAt: now,
      expiresAt: now + ttl,
    }

    await set(KEY_PREDICTIONS_CACHE, metadata)
  } catch { /* silencioso */ }
}

/**
 * Validar si caché de predicciones es válido (no expirado)
 * @param metadata Metadata del caché
 * @returns true si es válido
 */
const MOCK_CITY_IDS = new Set(['sydney', 'tokyo', 'london'])

export const isPredictionsCacheValid = (metadata: PredictionsCacheMetadata | null): boolean => {
  if (!metadata) return false
  if (metadata.expiresAt <= Date.now()) return false
  // Invalidar si el caché contiene city_ids de mock (datos de cuando Firebase no estaba inicializado)
  const hasMockData = metadata.documents.some(doc => MOCK_CITY_IDS.has(doc.city_id))
  return !hasMockData
}

// ─── Cleanup Functions (US-1102) ───────────────────────────────────────────────

/**
 * Limpia TODAS las tablas de IndexedDB
 * @returns Promesa con cuenta de registros eliminados
 */
export const cleanupAllIndexedDb = async (): Promise<{ deletedRecords: number }> => {
  try {
    // Obtener count de records antes de limpiar
    const forecastCount = (await get<ForecastDoc[]>(KEY_FORECAST_CACHE)) ?? []
    const predictionsCache = await get<PredictionsCacheMetadata>(KEY_PREDICTIONS_CACHE)
    const totalRecords = forecastCount.length + (predictionsCache ? 1 : 0) + 5 // +5 por otros keys

    // Limpiar todos los datos usando clear() (limpia toda la DB)
    await clear()

    return { deletedRecords: totalRecords }
  } catch (error) {
    console.error('IndexedDB cleanup failed:', error)
    throw new Error(`Cleanup IndexedDB failed: ${(error as Error).message}`)
  }
}

/**
 * Limpia TODOS los datos de localStorage que comienzan con pwe-*
 * @returns void
 */
export const cleanupAllLocalStorage = (): void => {
  try {
    const keysToDelete: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('pwe-') || key.startsWith('pw-'))) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('localStorage cleanup failed:', error)
    throw new Error(`Cleanup localStorage failed: ${(error as Error).message}`)
  }
}

/**
 * Calcula tamaño estimado de IndexedDB
 * @returns Promesa con tamaño humano-legible (ej: "2.5 MB")
 */
export const getIndexedDbSize = async (): Promise<string> => {
  try {
    // Estimación: cada ForecastDoc es ~500 bytes, cada weather entry ~200 bytes
    const forecasts = (await get<ForecastDoc[]>(KEY_FORECAST_CACHE)) ?? []
    const predictions = (await get<PredictionsCacheMetadata>(KEY_PREDICTIONS_CACHE)) ?? null

    let sizeBytes = 0
    sizeBytes += forecasts.length * 500 // ~500 bytes por ForecastDoc
    sizeBytes += (predictions?.documents?.length ?? 0) * 500

    // Contar localStorage size (approximado)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key ?? '')
      if (key?.startsWith('pwe-')) {
        sizeBytes += (key.length + (value?.length ?? 0)) * 2 // UTF-16
      }
    }

    if (sizeBytes === 0) return '0 MB'
    if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
  } catch {
    return 'N/A'
  }
}

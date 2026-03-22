// Caché de datos climáticos en IndexedDB y locationKeys en localStorage.
// TTL 60 min para datos de clima. LocationKeys son permanentes.

import { get, set, del, clear } from 'idb-keyval'

const WEATHER_TTL_MS     = 60 * 60 * 1000   // 60 minutos
const KEY_PREFIX_WEATHER = 'pwe-weather-'
const KEY_PREFIX_LOC     = 'pwe-loc-'

interface WeatherCacheEntry {
  data: unknown
  savedAt: number
}

// ─── Datos climáticos — IndexedDB ─────────────────────────────────────────────

export const getCachedWeather = async (s2Key: string): Promise<unknown | null> => {
  try {
    const entry = await get<WeatherCacheEntry>(`${KEY_PREFIX_WEATHER}${s2Key}`)
    if (!entry) return null
    if (Date.now() - entry.savedAt > WEATHER_TTL_MS) {
      await del(`${KEY_PREFIX_WEATHER}${s2Key}`)
      return null
    }
    return entry.data
  } catch {
    return null   // IndexedDB no disponible — falla silenciosamente
  }
}

export const setCachedWeather = async (s2Key: string, data: unknown): Promise<void> => {
  try {
    await set(`${KEY_PREFIX_WEATHER}${s2Key}`, { data, savedAt: Date.now() })
  } catch { /* silencioso */ }
}

// ─── Location Keys de AccuWeather — localStorage (permanentes) ───────────────

export const getCachedLocationKey = (s2Key: string): string | null =>
  localStorage.getItem(`${KEY_PREFIX_LOC}${s2Key}`)

export const setCachedLocationKey = (s2Key: string, locationKey: string): void =>
  localStorage.setItem(`${KEY_PREFIX_LOC}${s2Key}`, locationKey)

// ─── Utilidades ───────────────────────────────────────────────────────────────

export const clearWeatherCache = (): Promise<void> => clear()

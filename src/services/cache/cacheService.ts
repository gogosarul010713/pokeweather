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
// IMPORTANTE: La clave del caché es city.id (no s2Key).
// Dos ciudades cercanas pueden compartir s2Key (mismo nivel S2) pero deben
// tener cachés separados para evitar sobrescribir datos entre ellas.

export const getCachedWeather = async (cityId: string): Promise<unknown | null> => {
  try {
    const entry = await get<WeatherCacheEntry>(`${KEY_PREFIX_WEATHER}${cityId}`)
    if (!entry) return null
    if (Date.now() - entry.savedAt > WEATHER_TTL_MS) {
      await del(`${KEY_PREFIX_WEATHER}${cityId}`)
      return null
    }
    return entry.data
  } catch {
    return null   // IndexedDB no disponible — falla silenciosamente
  }
}

export const setCachedWeather = async (cityId: string, data: unknown): Promise<void> => {
  try {
    await set(`${KEY_PREFIX_WEATHER}${cityId}`, { data, savedAt: Date.now() })
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

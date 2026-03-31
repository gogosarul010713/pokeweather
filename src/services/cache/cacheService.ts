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

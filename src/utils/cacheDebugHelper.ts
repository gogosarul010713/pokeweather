/**
 * src/utils/cacheDebugHelper.ts
 * Utilidades para inspeccionar y gestionar caché (US-606)
 * Funciona con localStorage (LocationKeys) e IndexedDB (Weather data)
 */

import { del, entries as getEntries } from 'idb-keyval'
import type { CacheEntry, CacheMetrics, CacheEntryStatus } from '../types/cache'

const CACHE_PREFIX_LOCATION = 'pwe-loc-'
const CACHE_PREFIX_WEATHER = 'pwe-w-'

/**
 * Obtiene todas las LocationKeys de localStorage
 */
export async function getAllLocationKeys(): Promise<CacheEntry[]> {
  const entries: CacheEntry[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(CACHE_PREFIX_LOCATION)) continue

    const value = localStorage.getItem(key)
    const entry: CacheEntry = {
      id: key,
      type: 'locationKey',
      key,
      value: value ? JSON.parse(value) : value,
      savedAt: Date.now(), // localStorage no guarda timestamp, estimamos ahora
      size: new Blob([value || '']).size,
    }
    entries.push(entry)
  }

  return entries
}

/**
 * Obtiene todos los Weather entries de IndexedDB
 */
export async function getAllWeatherEntries(): Promise<CacheEntry[]> {
  const entries: CacheEntry[] = []

  try {
    const dbEntries = await getEntries()

    for (const [key, value] of dbEntries) {
      if (typeof key !== 'string' || !key.startsWith(CACHE_PREFIX_WEATHER)) continue

      // Los weather entries tienen estructura: { data, expiresAt }
      const weatherData = value as any
      const entry: CacheEntry = {
        id: key,
        type: 'weather',
        key,
        value: weatherData?.data || weatherData,
        savedAt: weatherData?.savedAt || Date.now(),
        expiresAt: weatherData?.expiresAt,
        size: new Blob([JSON.stringify(weatherData)]).size,
      }
      entries.push(entry)
    }
  } catch (error) {
    console.error('Error reading IndexedDB:', error)
  }

  return entries
}

/**
 * Calcula el estado de una entrada (válida, expirando, expirada)
 */
export function getCacheEntryStatus(entry: CacheEntry): CacheEntryStatus {
  if (!entry.expiresAt) return 'valid' // LocationKeys no expiran

  const now = Date.now()
  const timeLeft = entry.expiresAt - now
  const EXPIRING_THRESHOLD = 5 * 60 * 1000 // 5 minutos

  if (timeLeft < 0) return 'expired'
  if (timeLeft < EXPIRING_THRESHOLD) return 'expiring'
  return 'valid'
}

/**
 * Calcula métricas del caché
 */
export async function calculateCacheMetrics(
  locationKeys: CacheEntry[],
  weatherEntries: CacheEntry[]
): Promise<CacheMetrics> {
  const allEntries = [...locationKeys, ...weatherEntries]
  const totalSize = allEntries.reduce((sum, e) => sum + e.size, 0)
  const storageLimitMB = 10 // Límite aproximado de 10MB
  const storageLimitBytes = storageLimitMB * 1024 * 1024

  const validCount = allEntries.filter(e => getCacheEntryStatus(e) === 'valid').length
  const expiringCount = allEntries.filter(e => getCacheEntryStatus(e) === 'expiring').length
  const expiredCount = allEntries.filter(e => getCacheEntryStatus(e) === 'expired').length

  return {
    totalEntries: allEntries.length,
    locationKeyCount: locationKeys.length,
    weatherCount: weatherEntries.length,
    validCount,
    expiredCount,
    expiringCount,
    totalSize,
    storagePercentage: Math.round((totalSize / storageLimitBytes) * 100),
  }
}

/**
 * Formatea bytes a KB/MB
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i]
}

/**
 * Convierte timestamp a tiempo relativo ("Hace 2 minutos")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Hace unos segundos'
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffHour < 24) return `Hace ${diffHour}h`
  return `Hace ${diffDay}d`
}

/**
 * Convierte timestamp a formato ISO legible
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Calcula tiempo restante hasta expiración
 */
export function getTimeUntilExpiration(expiresAt: number | undefined): string {
  if (!expiresAt) return '—'

  const now = Date.now()
  const timeLeft = expiresAt - now
  const MINUTE = 60 * 1000
  const HOUR = 60 * MINUTE

  if (timeLeft < 0) return 'Expirado'
  if (timeLeft < MINUTE) return `${Math.round(timeLeft / 1000)}s`
  if (timeLeft < HOUR) return `${Math.round(timeLeft / MINUTE)}min`
  return `${Math.round(timeLeft / HOUR)}h`
}

/**
 * Elimina múltiples entradas de caché
 */
export async function deleteMultipleCacheEntries(ids: Set<string>): Promise<void> {
  for (const id of ids) {
    if (id.startsWith(CACHE_PREFIX_LOCATION)) {
      // Es una LocationKey en localStorage
      localStorage.removeItem(id)
    } else if (id.startsWith(CACHE_PREFIX_WEATHER)) {
      // Es una Weather entry en IndexedDB
      await del(id)
    }
  }
}

/**
 * Limpia TODO el caché (LocationKeys + Weather)
 */
export async function clearAllCache(): Promise<void> {
  // Limpiar localStorage: todas las claves con prefijo pwe-loc-
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith(CACHE_PREFIX_LOCATION)) {
      localStorage.removeItem(key)
    }
  }

  // Limpiar IndexedDB: todas las claves con prefijo pwe-w-
  try {
    const dbEntries = await getEntries()
    for (const [key] of dbEntries) {
      if (typeof key === 'string' && key.startsWith(CACHE_PREFIX_WEATHER)) {
        await del(key)
      }
    }
  } catch (error) {
    console.error('Error clearing IndexedDB:', error)
  }
}

/**
 * Obtiene el nombre de ciudad a partir de una clave de caché
 * Heurística: busca en el valor si contiene "cityName" o similar
 */
export function extractCityNameFromEntry(entry: CacheEntry): string {
  if (entry.type === 'locationKey') {
    // LocationKey: el valor es el accuLocationKey (ej: "328409_PC")
    return entry.key.replace(CACHE_PREFIX_LOCATION, 'Unknown')
  }

  // Weather: intenta extraer del objeto
  const value = entry.value
  if (value && typeof value === 'object') {
    return value.cityName || value.city || 'Unknown'
  }

  return 'Unknown'
}

/**
 * Carga TODOS los datos de caché (LocationKeys + Weather)
 */
export async function loadAllCacheData(): Promise<{
  locationKeys: CacheEntry[]
  weatherEntries: CacheEntry[]
}> {
  const [locationKeys, weatherEntries] = await Promise.all([
    getAllLocationKeys(),
    getAllWeatherEntries(),
  ])

  return { locationKeys, weatherEntries }
}

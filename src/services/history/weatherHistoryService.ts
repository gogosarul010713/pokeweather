/**
 * weatherHistoryService.ts
 * Servicio de persistencia de snapshots climáticos para análisis de precisión.
 *
 * Guarda automáticamente un snapshot por ciudad por hora (deduplicación por bucket HH:00).
 * Permite llenar "actualCondition" (observación manual en Pokémon GO) para medir precisión.
 * Auto-cleanup de datos > N días configurables (default 7).
 *
 * Storage: IndexedDB con key prefix `pwe-hist-`
 * Configuración: localStorage `pwe-history-retention-days`
 */

import { get, set, del, keys } from 'idb-keyval'

// ─── Types ────────────────────────────────────────────────────────────────

export interface WeatherSnapshot {
  snapshotId: string       // `${cityId}-${YYYYMMDDH}` — clave única
  cityId: string
  cityName: string
  cityCountry: string
  cityRegion: string
  capturedAt: number       // timestamp exacto cuando se capturó
  condition: string        // lo que clasificó el algoritmo (sunny/rain/etc)
  weatherIcon: number      // iconID de AccuWeather para debugging
  tempC: number
  windKmh: number
  gustKmh: number
  visibilityKm: number
  boostedTypes: string[]   // Pokémon GO types boosted por esta condición
  isExtreme: boolean       // si AccuWeather retornó alertas extremas
  actualCondition?: string // lo que vio el usuario en Pokémon GO (llena manualmente)
  verifiedAt?: number      // timestamp cuando se llenó actualCondition
  isCorrect?: boolean      // auto-computed: actualCondition === condition
}


// ─── Config ───────────────────────────────────────────────────────────────

const KEY_PREFIX = 'pwe-hist-'
const STORAGE_RETENTION_KEY = 'pwe-history-retention-days'
const DEFAULT_RETENTION_DAYS = 7

// ─── Helper: Generar snapshot ID (hour bucket) ─────────────────────────

function getSnapshotId(cityId: string, date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  return `${cityId}-${year}${month}${day}${hour}`
}

// ─── Configuración de retención ────────────────────────────────────────

export const getRetentionDays = (): number => {
  const stored = localStorage.getItem(STORAGE_RETENTION_KEY)
  return stored ? parseInt(stored, 10) : DEFAULT_RETENTION_DAYS
}

export const setRetentionDays = (days: number): void => {
  if (![7, 14, 30].includes(days)) {
    console.warn(`⚠️ Invalid retention days: ${days}. Using default.`)
    return
  }
  localStorage.setItem(STORAGE_RETENTION_KEY, String(days))
  console.log(`📅 Historia: retención configurada a ${days} días`)
}

// ─── Guardar snapshots (batch) ────────────────────────────────────────

/**
 * Guarda snapshots para un lote de ciudades — solo si no existen en esa hora.
 * @param cities Array de ciudades con datos climáticos frescos
 * @example
 * const cities = await loadCities() // from API
 * await saveSnapshots(cities)
 */
export const saveSnapshots = async (cities: { id: string; name: string; country: string; region: string; condition: string; weatherIcon: number; tempC: number; windKmh: number; gustKmh: number; visibilityKm: number; boostedTypes: string[]; isExtreme: boolean }[]): Promise<void> => {
  if (cities.length === 0) return

  const now = new Date()
  const saved: string[] = []
  const skipped: string[] = []

  for (const city of cities) {
    const snapshotId = getSnapshotId(city.id, now)
    const key = `${KEY_PREFIX}${snapshotId}`

    try {
      // Verificar si ya existe en esta hora
      const existing = await get<WeatherSnapshot>(key)
      if (existing) {
        skipped.push(city.id)
        continue
      }

      // Crear snapshot
      const snapshot: WeatherSnapshot = {
        snapshotId,
        cityId: city.id,
        cityName: city.name,
        cityCountry: city.country,
        cityRegion: city.region,
        capturedAt: now.getTime(),
        condition: city.condition,
        weatherIcon: city.weatherIcon,
        tempC: city.tempC,
        windKmh: city.windKmh,
        gustKmh: city.gustKmh,
        visibilityKm: city.visibilityKm,
        boostedTypes: city.boostedTypes,
        isExtreme: city.isExtreme,
      }

      // Guardar
      await set(key, snapshot)
      saved.push(city.id)
    } catch (error) {
      console.error(`❌ Error guardando snapshot ${snapshotId}:`, error)
    }
  }

  console.log(`💾 Historial: ${saved.length} snapshots guardados, ${skipped.length} ya existían (misma hora)`)
}

// ─── Limpiar histórico viejo ─────────────────────────────────────────

/**
 * Elimina snapshots más antiguos que N días.
 * Se ejecuta automáticamente al iniciar la app.
 */
export const clearOldSnapshots = async (retentionDays?: number): Promise<void> => {
  const days = retentionDays ?? getRetentionDays()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  cutoffDate.setHours(0, 0, 0, 0)

  try {
    const allKeys = await keys()
    const historyKeys = allKeys
      .map((k) => String(k))
      .filter((k) => k.startsWith(KEY_PREFIX))

    let deleted = 0

    for (const key of historyKeys) {
      const snapshot = await get<WeatherSnapshot>(key)
      if (snapshot && new Date(snapshot.capturedAt) < cutoffDate) {
        await del(key)
        deleted++
      }
    }

    if (deleted > 0) {
      console.log(`🗑️ Limpieza histórica: ${deleted} snapshots antiguos eliminados (>${days} días)`)
    }
  } catch (error) {
    console.error('❌ Error limpiando histórico viejo:', error)
  }
}


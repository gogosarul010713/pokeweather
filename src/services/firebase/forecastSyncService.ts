// forecastSyncService.ts
// Sincronización inteligente: Firestore → caché local (IndexedDB)
// Ejecuta al montar la app (background, non-blocking)
// Luego PredictionAnalysisTable lee del caché (sin consultar Firestore)

import { getRecentForecasts } from './firebaseWeatherService'
import {
  getLastSyncTimestamp,
  setLastSyncTimestamp,
  getForecastCache,
  setForecastCache,
  mergeForecastDocs,
  cleanExpiredForecastDocs,
} from '../cache/cacheService'

export async function syncForecastsOnLoad(): Promise<void> {
  const start = performance.now()

  try {
    const lastSync = getLastSyncTimestamp()
    const sinceLabel = lastSync ? new Date(lastSync).toLocaleTimeString() : 'never'
    console.log(`[Sync] Started — lastSync: ${sinceLabel}`)

    // 1. Delta: solo docs nuevos desde último sync
    const newDocs = await getRecentForecasts('7d', lastSync || undefined)
    const cached = await getForecastCache()

    // 2. Merge + cleanup
    const merged = mergeForecastDocs(cached, newDocs)
    const cleaned = cleanExpiredForecastDocs(merged)
    const removed = merged.length - cleaned.length

    // 3. Persistir solo si hay cambios
    if (newDocs.length > 0 || removed > 0) {
      await setForecastCache(cleaned)
      setLastSyncTimestamp(Date.now())
    }

    const elapsed = (performance.now() - start).toFixed(0)
    console.log(
      `[Sync] Delta: ${newDocs.length} new, ${cached.length} cached → ${merged.length} merged. ` +
      `Cleaned ${removed} expired. Saved ${cleaned.length} docs. (${elapsed}ms)`
    )
  } catch (error) {
    // Falla silenciosa — cache viejo sigue disponible
    const msg = error instanceof Error ? error.message : String(error)
    console.warn('[Sync] Error (non-blocking):', msg)
  }
}

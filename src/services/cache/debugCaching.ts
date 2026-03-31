/**
 * debugCaching.ts
 * Herramientas para inspeccionar, validar y limpiar el caching en desarrollo.
 *
 * Uso en console del navegador:
 *   import { checkCacheStatus, clearAllCache, showCacheMetrics } from 'src/data/debugCaching'
 *   await checkCacheStatus()
 *   await showCacheMetrics()
 *   await clearAllCache()
 */

import { get, keys, del } from 'idb-keyval'

const KEY_PREFIX_WEATHER = 'pwe-weather-'
const KEY_PREFIX_LOC = 'pwe-loc-'

/**
 * Inspecciona el estado del caché
 */
export async function checkCacheStatus(): Promise<void> {
  console.log('🔍 Inspeccionando estado del caché...\n')

  // LocationKeys en localStorage
  const locKeys = Object.keys(localStorage).filter((k) => k.startsWith(KEY_PREFIX_LOC))
  console.log(`📍 LocationKeys en localStorage: ${locKeys.length}`)
  locKeys.forEach((key) => {
    const locKey = localStorage.getItem(key)
    console.log(`   ${key.replace(KEY_PREFIX_LOC, '')} → ${locKey}`)
  })

  // Weather data en IndexedDB
  const allKeys = await keys()
  const weatherKeys = allKeys.filter((k) => String(k).startsWith(KEY_PREFIX_WEATHER))
  console.log(`\n🌦️ Weather data en IndexedDB: ${weatherKeys.length} entradas`)

  for (const key of weatherKeys.slice(0, 5)) {
    const entry = await get(key)
    if (entry) {
      console.log(`   ${key}:`)
      console.log(`     Guardado: ${new Date(entry.savedAt).toLocaleString('es-ES')}`)
      console.log(`     Edad: ${Math.round((Date.now() - entry.savedAt) / 1000)}s`)
    }
  }

  if (weatherKeys.length > 5) {
    console.log(`   ... y ${weatherKeys.length - 5} más`)
  }

  // Timestamp de última actualización (en Zustand store)
  const lastUpdated = localStorage.getItem('pwe-lastUpdated')
  if (lastUpdated) {
    const timestamp = parseInt(lastUpdated, 10)
    const date = new Date(timestamp)
    const minutesAgo = Math.round((Date.now() - timestamp) / 1000 / 60)
    console.log(
      `\n⏰ Última actualización: ${date.toLocaleString('es-ES')} (hace ${minutesAgo} min)`
    )
  } else {
    console.log(`\n⏰ Última actualización: Nunca (app recién iniciada)`)
  }

  console.log(
    `\n✅ Total caché: ${locKeys.length} LocationKeys + ${weatherKeys.length} Weather entries`
  )
}

/**
 * Muestra métricas de consumo de API (si están disponibles)
 */
export async function showCacheMetrics(): Promise<void> {
  console.log('📊 Métricas de caché:\n')

  const metrics = localStorage.getItem('pwe-batch-metrics')
  if (metrics) {
    try {
      const data = JSON.parse(metrics)
      console.log(`Total API calls: ${data.totalCalls}`)
      console.log(`Cache hits: ${data.cachedHits}`)
      console.log(`Execution time: ${data.executionMs}ms`)
      console.log(`Accuracy: ${data.accuracy}%`)
    } catch {
      console.log('No metrics available yet')
    }
  } else {
    console.log('No metrics saved. Run a batch load first.')
  }
}

/**
 * Limpia TODO el caché (LocationKeys + Weather data + Zustand state)
 * ⚠️ DESTRUCTIVA: la app necesitará recargar clima desde cero
 */
export async function clearAllCache(): Promise<void> {
  console.log('⚠️ Limpiando TODOS los datos de caché...\n')

  // 1. Limpiar localStorage (LocationKeys)
  const locKeys = Object.keys(localStorage).filter((k) => k.startsWith(KEY_PREFIX_LOC))
  locKeys.forEach((key) => {
    localStorage.removeItem(key)
  })
  console.log(`✅ Eliminados ${locKeys.length} LocationKeys de localStorage`)

  // 2. Limpiar IndexedDB (Weather data)
  const allKeys = await keys()
  const weatherKeys = allKeys.filter((k) => String(k).startsWith(KEY_PREFIX_WEATHER))
  for (const key of weatherKeys) {
    await del(key)
  }
  console.log(`✅ Eliminadas ${weatherKeys.length} entradas de Weather data`)

  // 3. Limpiar Zustand state (en localStorage)
  const zustandKeys = [
    'pwe-lastUpdated',
    'pwe-batch-metrics',
    'pwe-app-store', // Zustand persisted state si existe
  ]
  zustandKeys.forEach((key) => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`✅ Eliminado ${key}`)
    }
  })

  console.log(`\n🔄 Caché completamente limpio.`)
  console.log('💡 Tip: Recarga la app (Ctrl+R) para cargar datos frescos desde AccuWeather.')
}

/**
 * Muestra el TTL de cada entrada de caché
 * (cuánto tiempo falta antes de que expire)
 */
export async function showCacheTTL(): Promise<void> {
  console.log('⏱️ TTL (Time To Live) de entradas caché:\n')

  const allKeys = await keys()
  const weatherKeys = allKeys.filter((k) => String(k).startsWith(KEY_PREFIX_WEATHER))

  if (weatherKeys.length === 0) {
    console.log('No hay entradas de weather caché.')
    return
  }

  const now = Date.now()
  const entries = []

  for (const key of weatherKeys) {
    const entry = await get(key)
    if (entry && entry.expiresAt) {
      const ttlMs = entry.expiresAt - now
      const ttlMin = Math.round(ttlMs / 1000 / 60)
      const status = ttlMs > 0 ? '✅ Válido' : '❌ Expirado'

      entries.push({
        key: String(key),
        ttlMin,
        status,
      })
    }
  }

  // Ordenar por TTL (próximos a expirar primero)
  entries.sort((a, b) => a.ttlMin - b.ttlMin)

  entries.slice(0, 10).forEach((e) => {
    console.log(`${e.status} | ${e.ttlMin}min | ${e.key}`)
  })

  if (entries.length > 10) {
    console.log(`... y ${entries.length - 10} más`)
  }

  const validEntries = entries.filter((e) => e.ttlMin > 0)
  console.log(`\nTotal: ${validEntries.length}/${entries.length} válidas`)
}

/**
 * Exporta caché a JSON para inspección
 */
export async function exportCacheAsJSON(): Promise<void> {
  console.log('📥 Exportando caché como JSON...\n')

  const allKeys = await keys()
  const weatherKeys = allKeys.filter((k) => String(k).startsWith(KEY_PREFIX_WEATHER))

  const cacheData: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    locationKeys: {},
    weatherData: {},
  }

  // LocationKeys
  Object.keys(localStorage)
    .filter((k) => k.startsWith(KEY_PREFIX_LOC))
    .forEach((k) => {
      const s2Key = k.replace(KEY_PREFIX_LOC, '')
      ;(cacheData.locationKeys as Record<string, string | null>)[s2Key] = localStorage.getItem(k)
    })

  // Weather data (primeras 5 para no saturar)
  for (const key of weatherKeys.slice(0, 5)) {
    const entry = await get(key)
    if (entry) {
      ;(cacheData.weatherData as Record<string, unknown>)[String(key)] = {
        condition: (entry.data as { condition?: string }).condition,
        tempC: (entry.data as { tempC?: number }).tempC,
        savedAt: new Date((entry.savedAt as number) || 0).toISOString(),
        expiresAt: new Date((entry.expiresAt as number) || 0).toISOString(),
      }
    }
  }

  console.log(JSON.stringify(cacheData, null, 2))
}

/**
 * Muestra un resumen visual del estado del caché
 */
export async function cacheSummary(): Promise<void> {
  console.clear()
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           🗂️  CACHE STATUS SUMMARY — Pokémon Weather         ║
╚═══════════════════════════════════════════════════════════════╝
  `)

  const locKeys = Object.keys(localStorage).filter((k) => k.startsWith(KEY_PREFIX_LOC))
  const allKeys = await keys()
  const weatherKeys = allKeys.filter((k) => String(k).startsWith(KEY_PREFIX_WEATHER))

  console.log(`📍 LocationKeys (localStorage): ${locKeys.length}`)
  console.log(`🌦️  Weather data (IndexedDB): ${weatherKeys.length}`)

  const lastUpdated = localStorage.getItem('pwe-lastUpdated')
  if (lastUpdated) {
    const timestamp = parseInt(lastUpdated, 10)
    const minutesAgo = Math.round((Date.now() - timestamp) / 1000 / 60)
    console.log(`\n⏰ Última actualización: Hace ${minutesAgo} minutos`)
  }

  console.log(`
  📝 COMANDOS DISPONIBLES:

  await checkCacheStatus()          → Inspecciona caché detallado
  await showCacheTTL()              → Muestra cuándo expira cada entrada
  await showCacheMetrics()          → Métricas de consumo de API
  await exportCacheAsJSON()         → Exporta caché como JSON
  await clearAllCache()             → ⚠️ LIMPIA TODO el caché

  💡 Tip: Copia cualquier comando en la console del navegador (F12)
  `)
}

// Auto-export de funciones para fácil acceso en console
if (typeof window !== 'undefined') {
  ;(window as any).pweCache = {
    checkCacheStatus,
    showCacheTTL,
    showCacheMetrics,
    exportCacheAsJSON,
    clearAllCache,
    cacheSummary,
  }
  console.log('✅ Debug cache tools disponibles. Usa: pweCache.cacheSummary()')
}

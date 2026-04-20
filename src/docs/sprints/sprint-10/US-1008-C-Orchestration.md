# US-1008-C: Integración syncFirestoreToCache() (Orquestación)

**Story Points:** 2 SP  
**Epic:** Optimización Firestore — Caché Inteligente  
**Prioridad:** Alta  
**Status:** Backlog Sprint 10

---

## 📋 Descripción

Crear función `syncFirestoreToCache()` que orquesta el sync delta completo:

1. Leer `lastSyncTimestamp` de localStorage
2. Query Firestore: `created_at > lastSync` (delta)
3. Persistir nuevos docs en IndexedDB
4. Limpiar expirados (TTL 7 días)
5. Actualizar `lastSyncTimestamp`

Integrar en app para ejecutar automáticamente al cargar.

---

## ✅ Acceptance Criteria

1. ✅ Función `syncFirestoreToCache()` ejecuta 5 pasos en orden
2. ✅ Sync automático al montar app (integrado en `batchWeatherService`)
3. ✅ No bloquea UI (async/await, no wait síncrono)
4. ✅ Fallback graceful si Firestore falla (usa cache viejo, no error)
5. ✅ Logging detallado:
   - `[Sync] Started at HH:MM:SS`
   - `[Sync] Query delta: ${newDocs.length} docs`
   - `[Sync] Persisted ${persisted.length}, cleaned ${expired.length}`
   - `[Sync] Completed in ${elapsed}ms`
6. ✅ Performance: sync total <500ms (incluyendo Firestore query)
7. ✅ Error handling: catch en try-catch, no rethrow (falla silenciosa)
8. ✅ Integración en `batchWeatherService.ts` (llamar en useEffect setup)

---

## 📝 Implementación

**Files:**
- `src/services/cache/cacheService.ts` (agregar `syncFirestoreToCache()`)
- `src/services/weather/batchWeatherService.ts` (llamar en hook)

**Nueva función:**

```typescript
/**
 * Sincronizar pronósticos de Firestore a caché local (IndexedDB)
 * Detecta documentos nuevos por timestamp y persiste solo el delta
 * 
 * Flujo:
 * 1. Leer lastSyncTimestamp de localStorage
 * 2. Query Firestore: created_at > lastSync
 * 3. Persistir nuevos docs en IndexedDB
 * 4. Limpiar docs expirados (TTL)
 * 5. Actualizar lastSyncTimestamp
 */
export async function syncFirestoreToCache(): Promise<void>
```

**Pseudocódigo:**

```typescript
export async function syncFirestoreToCache(): Promise<void> {
  const startTime = performance.now()
  
  try {
    console.log('[Sync] Started at', new Date().toLocaleTimeString())
    
    // 1. Leer lastSync
    const lastSync = getLastSyncTimestamp()
    
    // 2. Query delta a Firestore
    const newDocs = await getRecentForecasts('24h', lastSync)
    console.log(`[Sync] Query delta: ${newDocs.length} docs`)
    
    // 3. Persistir en IndexedDB
    let persisted = 0
    for (const doc of newDocs) {
      await persistForecastToIndexedDB(doc)
      await upsertForecastIndex(doc.city_id, doc.date_hour, doc.city_id)
      persisted++
    }
    
    // 4. Limpiar expirados
    const cleaned = await cleanExpiredForecasts()
    
    // 5. Actualizar timestamp
    await setLastSyncTimestamp(Date.now())
    
    const elapsed = performance.now() - startTime
    console.log(`[Sync] Persisted ${persisted}, cleaned ${cleaned} in ${elapsed.toFixed(0)}ms`)
    
  } catch (error) {
    // Falla silenciosa
    console.warn('[Sync] Error:', error instanceof Error ? error.message : String(error))
    // No rethrow — cache viejo sigue disponible
  }
}
```

**Integración en batchWeatherService:**

```typescript
// En useWeather.ts o donde se llame al batch
useEffect(() => {
  // Sync caché al montar
  syncFirestoreToCache().catch(err => 
    console.warn('[App] Sync error (non-blocking):', err.message)
  )
}, []) // Ejecutar solo una vez al montar
```

---

## 🧪 Testing

**Integration tests:**
- Sync delta: Query trae 10 docs nuevos, no los 100 viejos (network intercept)
- Segundo sync: Query trae 0 docs nuevos (cache hits, sin network call)
- TTL cleanup: Docs > 7d+1h eliminados automáticamente
- Fallback: Si Firestore falla, cache viejo sigue disponible (UI no se rompe)
- Performance: Sync total <500ms (validar con console.time)

**Manual testing:**
- Abrir DevTools → Network tab
- Sync 1: ver 1 query a Firestore (collection group query)
- Sync 2 (3 min después): ver 0 queries (cache hit)
- IndexedDB inspection: ver docs en `forecasts_data` + `forecasts_index`

---

## 🔗 Dependencias

- Depende de: US-1008-A + US-1008-B (necesita ambas funciones)
- Requerido por: US-1008-D (tests de integración)

---

## 📊 Notas

- Falla silenciosa es intencional (cache viejo es mejor que error)
- Logging detallado para debugging (puedes desactivar en prod si lo prefieres)
- Performance <500ms es realista: query ~200ms + IndexedDB ops ~100ms + overhead ~200ms

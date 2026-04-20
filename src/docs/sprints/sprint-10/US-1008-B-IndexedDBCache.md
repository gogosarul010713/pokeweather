# US-1008-B: Crear cacheService expandido (IndexedDB + TTL)

**Story Points:** 2 SP  
**Epic:** Optimización Firestore — Caché Inteligente  
**Prioridad:** Alta  
**Status:** Backlog Sprint 10

---

## 📋 Descripción

Expandir `cacheService.ts` para guardar pronósticos en IndexedDB con:
- Tabla `forecasts_index` para O(1) lookup por (city_id, date_hour)
- TTL automático (7 días + 1h margin)
- Funciones de sync: persistencia, cleanup, retrieval

---

## ✅ Acceptance Criteria

1. ✅ IndexedDB storage <50MB (validar con DevTools)
2. ✅ Lookup por (city_id, date_hour) en <10ms (IndexedDB inspection)
3. ✅ TTL automático: docs > 7 días + 1h eliminados en `cleanExpiredForecasts()`
4. ✅ Merge sin duplicados (by city_id + date_hour)
5. ✅ Función `persistForecastToIndexedDB(doc)` guarda con `expiresAt`
6. ✅ Función `upsertForecastIndex(city_id, date_hour)` crea entrada O(1)
7. ✅ Función `cleanExpiredForecasts()` elimina docs expirados
8. ✅ TypeScript types: crear `src/utils/cacheTypes.ts` con interfaces
9. ✅ Logging: `[Cache] Stored ${docs.length} forecasts, cleaned ${expired.length} expired`

---

## 📝 Implementación

**Files:**
- `src/services/cache/cacheService.ts` (expandir)
- `src/utils/cacheTypes.ts` (nuevo)

**Nuevas funciones:**

```typescript
// Obtener timestamp última sincronización
export async function getLastSyncTimestamp(): Promise<number>

// Guardar timestamp última sincronización
export async function setLastSyncTimestamp(timestamp: number): Promise<void>

// Persistir pronóstico en IndexedDB con expiresAt
export async function persistForecastToIndexedDB(doc: ForecastDoc): Promise<void>

// Crear entrada en índice para O(1) lookup
export async function upsertForecastIndex(
  city_id: string,
  date_hour: string,
  doc_id: string
): Promise<void>

// Limpiar documentos expirados (TTL 7d + 1h)
export async function cleanExpiredForecasts(): Promise<number>

// Recuperar pronósticos por (city_id, date_hour)
export async function getForecastFromCache(
  city_id: string,
  date_hour: string
): Promise<ForecastDoc | null>
```

**IndexedDB Schema:**

```typescript
// Store: forecasts_data
// Key: "{city_id}-{date_hour}"
// Value: ForecastDoc + { expiresAt: number }

// Store: forecasts_index
// Key: "{city_id}-{date_hour}"
// Value: { city_id, date_hour, doc_id, expiresAt }

// Store: sync_metadata
// Key: "lastSync"
// Value: { timestamp: number, lastClean: number }
```

---

## 🧪 Testing

**Unit tests:**
- `persistForecastToIndexedDB()` guarda con `expiresAt` correcto
- `getForecastFromCache()` retrieves por (city_id, date_hour)
- `cleanExpiredForecasts()` elimina solo docs expirados (>7d+1h)
- Deduplicación: mismo (city_id, date_hour) actualiza, no duplica
- `getLastSyncTimestamp()` persiste entre lecturas/escrituras

**Integration:**
- Storage <50MB después de persistir 100 ciudades × 100 docs
- Lookup speed <10ms (medir con `performance.now()`)

---

## 🔗 Dependencias

- Depende de: US-1008-A (aunque puede desarrollarse en paralelo)
- Requerido por: US-1008-C (syncFirestoreToCache necesita estas funciones)

---

## 📊 Notas

- Usar IndexedDB nativo (idb-keyval es muy simple, no permite índices)
- TTL margin 1h es seguro para eventual consistency
- localStorage para lastSync (más rápido que IndexedDB para lectura síncrona)

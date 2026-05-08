# US-1008-B: Cache Local de Pronósticos (idb-keyval + localStorage)

**Story Points:** 1 SP
**Epic:** Optimización Firestore — Caché Inteligente
**Prioridad:** Alta
**Status:** Backlog Sprint 10

---

## Decisión de diseño

El diseño anterior proponía 3 IndexedDB stores nativos (`forecasts_data`, `forecasts_index`, `sync_metadata`).
Eso es innecesario para el volumen actual y crea complejidad sin beneficio.

**Enfoque simplificado:**
- `idb-keyval` (ya instalado) → guardar el array completo `ForecastDoc[]` bajo una sola clave
- `localStorage` → guardar `lastSyncTimestamp` (lectura síncrona, valor simple)
- Una función `mergeForecastDocs()` para deduplicar sin índices

Tamaño estimado: 240 docs × ~2KB = ~480KB → dentro del límite de idb-keyval.

---

## ✅ Acceptance Criteria

1. `getForecastCache()` devuelve `ForecastDoc[]` desde IndexedDB (vacío si no existe)
2. `setForecastCache(docs)` sobreescribe el cache completo en IndexedDB
3. `mergeForecastDocs(cached, newDocs)` deduplica por `city_id + date_hour`
4. `cleanExpiredForecastDocs(docs)` filtra docs con `created_at` > 7 días
5. `getLastSyncTimestamp()` lee de localStorage (síncrono, retorna `number`, 0 si no existe)
6. `setLastSyncTimestamp(ts)` escribe en localStorage
7. Sin cambios en la lógica existente de WeatherData (no mezclar dominios)

---

## Implementación

**File:** `src/services/cache/cacheService.ts` (agregar al final — no tocar código existente)

```typescript
// ─── Caché de ForecastDocs (Firestore → local) ────────────────────────────────
// Propósito: evitar re-fetch a Firestore al abrir PredictionAnalysisTable
// Estrategia: idb-keyval key única + merge deduplicado

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
    await set(KEY_FORECAST_CACHE, docs)
  } catch { /* silencioso */ }
}

export const mergeForecastDocs = (
  cached: ForecastDoc[],
  incoming: ForecastDoc[]
): ForecastDoc[] => {
  const map = new Map<string, ForecastDoc>()
  for (const doc of cached)  map.set(`${doc.city_id}-${doc.date_hour}`, doc)
  for (const doc of incoming) map.set(`${doc.city_id}-${doc.date_hour}`, doc) // incoming tiene precedencia
  return Array.from(map.values())
}

export const cleanExpiredForecastDocs = (docs: ForecastDoc[]): ForecastDoc[] => {
  const cutoff = Date.now() - FORECAST_TTL_MS
  return docs.filter(doc => {
    const createdAt = doc.created_at?.toMillis?.() ?? 0
    return createdAt > cutoff
  })
}

// ─── Last Sync Timestamp — localStorage (síncrono) ───────────────────────────

export const getLastSyncTimestamp = (): number =>
  parseInt(localStorage.getItem(KEY_LAST_SYNC) ?? '0', 10)

export const setLastSyncTimestamp = (ts: number): void =>
  localStorage.setItem(KEY_LAST_SYNC, String(ts))
```

**Import necesario al inicio del archivo:**

```typescript
import type { ForecastDoc } from '../firebase/firebaseWeatherService'
```

---

## Por qué NO IndexedDB nativo con múltiples stores

| Criterio | 3 stores nativos (diseño anterior) | idb-keyval key única (este diseño) |
|----------|--------------------------------------|-------------------------------------|
| Líneas de código | ~80 líneas + schema | ~30 líneas |
| Lookup por city_id | O(1) con índice | O(n) con Map en merge |
| Volumen actual | ~45 docs | ~45 docs |
| Volumen máx estimado | ~2,500 docs | ~2,500 docs |
| Problema O(n) con Map | No aplica a <2,500 docs | Irrelevante |
| Complejidad de tests | Alta (mock IDBDatabase) | Baja (mock idb-keyval) |

O(n) en merge solo importa con >10,000 docs. No es ese caso.

---

## Testing

- `getForecastCache()` devuelve `[]` cuando no hay datos
- `setForecastCache()` persiste entre llamadas
- `mergeForecastDocs()`: doc existente se actualiza, no duplica
- `mergeForecastDocs()`: doc nuevo se agrega
- `cleanExpiredForecastDocs()`: doc con created_at > 7d eliminado, doc < 7d preservado
- `getLastSyncTimestamp()` retorna 0 si no hay sync previo

---

## Dependencias

- Depende de: nada (puede desarrollarse en paralelo con A)
- Requerido por: US-1008-C (usa estas funciones en syncForecastsOnLoad)

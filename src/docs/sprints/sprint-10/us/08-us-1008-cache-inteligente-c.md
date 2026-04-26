# US-1008-C: Orquestación syncForecastsOnLoad()

**Story Points:** 1 SP
**Epic:** Optimización Firestore — Caché Inteligente
**Prioridad:** Alta
**Status:** Backlog Sprint 10

---

## Flujo general

```
App monta
  └─ syncForecastsOnLoad() [background, non-blocking]
       1. Leer lastSyncTimestamp (localStorage)
       2. getRecentForecasts('7d', since=lastSync) → nuevos docs
       3. getForecastCache() → docs ya guardados localmente
       4. mergeForecastDocs(cached, newDocs) → sin duplicados
       5. cleanExpiredForecastDocs(merged) → remover > 7 días
       6. setForecastCache(cleaned) → persistir en idb-keyval
       7. setLastSyncTimestamp(Date.now())

Usuario abre PredictionAnalysisTable
  └─ getForecastCache() → ForecastDoc[] (sin llamar Firestore)
       └─ Render tabla inmediato
```

---

## ✅ Acceptance Criteria

1. `syncForecastsOnLoad()` ejecuta los 7 pasos en orden
2. Se llama en `App.tsx` → `useEffect([], [])` (solo al montar, una vez)
3. **No bloquea UI** — async, fire-and-forget desde App.tsx
4. Si Firestore falla: cache viejo disponible, sin error visible al usuario
5. `PredictionAnalysisTable` lee de `getForecastCache()`, **no llama Firestore**
6. Logs:
   - `[Sync] Started — lastSync: ${date | 'never'}`
   - `[Sync] Delta: ${newDocs.length} new, ${cached.length} cached → ${merged.length} merged`
   - `[Sync] Cleaned ${removed} expired. Saved ${final.length} docs. (${elapsed}ms)`
7. Segundo sync (mismo día): `newDocs.length = 0`, cache intacto, sin writes innecesarios

---

## Implementación

### syncForecastsOnLoad() — nuevo archivo

**File:** `src/services/firebase/forecastSyncService.ts` (nuevo, no contaminar cacheService ni batchWeatherService)

```typescript
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

    // Delta: solo docs nuevos desde último sync
    const newDocs = await getRecentForecasts('7d', lastSync || undefined)
    const cached  = await getForecastCache()

    // Merge + cleanup
    const merged  = mergeForecastDocs(cached, newDocs)
    const cleaned = cleanExpiredForecastDocs(merged)
    const removed = merged.length - cleaned.length

    // Persistir solo si hay cambios
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
```

### Integración en App.tsx

```typescript
// src/App.tsx — agregar import y useEffect
import { syncForecastsOnLoad } from './services/firebase/forecastSyncService'

// Dentro del componente App:
useEffect(() => {
  syncForecastsOnLoad() // fire-and-forget — no await, no bloquea render
}, [])
```

### PredictionAnalysisDemo — leer de cache

El componente que monta la tabla debe leer de cache, no de Firestore:

```typescript
// src/components/Analytics/PredictionAnalysisDemo.tsx
import { getForecastCache } from '../../services/cache/cacheService'

// En el useEffect o al abrir el panel:
const docs = await getForecastCache()
// ... transformar ForecastDoc[] → PredictionRow[] como antes
```

---

## Por qué NO en batchWeatherService

| Candidato | Propósito real | ¿Correcto para sync? |
|-----------|---------------|----------------------|
| `batchWeatherService.ts` | Escribe AccuWeather → Firestore | ❌ flujo opuesto |
| `forecastSyncService.ts` (nuevo) | Lee Firestore → cache local | ✅ responsabilidad única |
| `App.tsx` (solo el trigger) | Punto de entrada de la app | ✅ orquesta el arranque |

---

## Escenarios de sync

| Escenario | Resultado esperado |
|-----------|-------------------|
| Primera vez (sin lastSync) | Trae todos los docs de '7d', persiste |
| Reload el mismo día | `since=lastSync` → 0-5 docs nuevos, merge rápido |
| Firestore offline | Cache viejo disponible, sin error visible |
| Cache IndexedDB corrupto | `getForecastCache()` retorna `[]`, sync parte desde cero |

---

## Dependencias

- Depende de: US-1008-A + US-1008-B (ambas implementadas)
- Requerido por: US-1008-D (tests de integración)

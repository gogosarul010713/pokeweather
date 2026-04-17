# 💾 US-806 — Caché IndexedDB de Nidos

**Sprint:** 8 (Fase 1) | **SP:** 2 | **Prioridad:** P0 | **Status:** ⏳ Pendiente | **Dep:** US-801

---

## Historia

> Como sistema, quiero cachear nidos para sesiones posteriores sin re-descargar JSON.

---

## Criterios

- [ ] nestCacheService.ts implementado
- [ ] Colección "nests_data" separada de "weather_data"
- [ ] Segunda sesión: carga desde caché (< 100ms)
- [ ] Persistencia entre recargas de página
- [ ] Métodos: `getNest()`, `setNest()`, `getAllNests()`, `clearCache()`

---

## Implementación

### nestCacheService.ts (~90 líneas)

```typescript
import { idbKeyval } from 'idb-keyval'
import type { Nest } from '@/types/nest'

const STORE_NAME = 'nests_data'

export async function getNest(nestId: string): Promise<Nest | null> {
  try {
    const customStore = idbKeyval.createStore('pokeweather', STORE_NAME)
    const nest = await idbKeyval.get(nestId, customStore)
    return nest || null
  } catch (error) {
    console.error(`[Nests Cache] Error getting ${nestId}:`, error)
    return null
  }
}

export async function setNest(nestId: string, nest: Nest): Promise<void> {
  try {
    const customStore = idbKeyval.createStore('pokeweather', STORE_NAME)
    await idbKeyval.set(nestId, nest, customStore)
  } catch (error) {
    console.error(`[Nests Cache] Error setting ${nestId}:`, error)
  }
}

export async function getAllNests(): Promise<Nest[]> {
  try {
    const customStore = idbKeyval.createStore('pokeweather', STORE_NAME)
    const nests: Nest[] = []
    let cursor = await customStore.openCursor()
    
    while (cursor) {
      if (isValidNest(cursor.value)) {
        nests.push(cursor.value)
      }
      cursor = await cursor.continue()
    }
    
    return nests
  } catch (error) {
    console.error('[Nests Cache] Error getting all:', error)
    return []
  }
}

export async function clearNestCache(): Promise<void> {
  try {
    const customStore = idbKeyval.createStore('pokeweather', STORE_NAME)
    await idbKeyval.clear(customStore)
  } catch (error) {
    console.error('[Nests Cache] Error clearing:', error)
  }
}

function isValidNest(obj: unknown): obj is Nest {
  if (!obj || typeof obj !== 'object') return false
  const n = obj as Record<string, unknown>
  return typeof n.id === 'string' && typeof n.name === 'string'
}
```

**Ubicación:** `src/services/nests/nestCacheService.ts`

---

## Integración en useNests.ts

```typescript
// En loadFromCacheOrJson():
const cached = await nestCacheService.getAllNests()
if (cached.length > 0) {
  console.log(`Loaded ${cached.length} from cache`)
  return cached
}

// En run():
const nests = await loadFromCacheOrJson()
await setNestCache(nests) // Guardar si es primera vez
```

---

## Validación

### Test 1: Primera carga
```
[useNests] Loaded 5 nests from JSON
[useNests] Saving 5 nests to IndexedDB...
```

### Test 2: Segunda carga (reload)
```
[useNests] Loaded 5 nests from cache  ← ¡de cache!
```

### Test 3: IndexedDB
- DevTools → Application → IndexedDB → pokeweather
- ObjectStore: `nests_data` con 5 documentos

---

**Última actualización:** 2026-04-12


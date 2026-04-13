# 📋 Sesión 1: Servicios, Hook y Store

**Duración:** ~2 horas  
**Objetivo:** Cargar nidos desde JSON → IndexedDB → Zustand  
**Rama:** `feature/nests`  

---

## ✅ Checklist Sesión 1

### Paso 1: Crear nestService.ts (15 min)
- [ ] Crear `src/services/nests/`
- [ ] Crear `src/services/nests/nestService.ts`
- [ ] Implementar `getPokemonTypeColor()`
- [ ] Implementar `getBadgeIcon()`
- [ ] Validar exports

### Paso 2: Crear nestCacheService.ts (20 min)
- [ ] Crear `src/services/nests/nestCacheService.ts`
- [ ] Implementar CRUD IndexedDB
- [ ] Validar colección `nests_data`

### Paso 3: Crear useNests.ts (20 min)
- [ ] Crear `src/hooks/useNests.ts`
- [ ] Implementar `loadNests()`
- [ ] Implementar `run()`

### Paso 4: Extender useStore.ts (25 min)
- [ ] Leer `src/store/useStore.ts`
- [ ] Agregar nests slice
- [ ] Agregar actions
- [ ] Validar types

### Validación (15 min)
- [ ] 5 nidos en consola
- [ ] IndexedDB visible
- [ ] Build sin errores

---

## 📝 Paso 1: nestService.ts

**Ubicación:** `src/services/nests/nestService.ts`

**Contenido:**

```typescript
/**
 * Servicios de utilidad para Nidos de Pokémon
 * - Mapeos de colores
 * - Helpers de badges
 * - Utilidades de cálculo
 */

import type { PokemonType, BadgeType } from '@/types/nest'

/**
 * Mapea tipo Pokémon a color hexadecimal
 * Utiliza la misma paleta que el sistema de clima
 */
export function getPokemonTypeColor(type: PokemonType): string {
  const colorMap: Record<PokemonType, string> = {
    fire: '#FF6B35',
    water: '#6890F0',
    grass: '#78C850',
    normal: '#A8A878',
    electric: '#F8D030',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  }

  return colorMap[type] || '#9C9C9C'
}

/**
 * Obtiene el icono visual para un badge
 */
export function getBadgeIcon(badge: BadgeType): string {
  const iconMap: Record<BadgeType, string> = {
    verified: '✓',
    hot: '🔥',
    new: '⭐',
    common_spawn: '➕',
  }

  return iconMap[badge]
}

/**
 * Obtiene la etiqueta legible de un badge
 */
export function getBadgeLabel(badge: BadgeType): string {
  const labelMap: Record<BadgeType, string> = {
    verified: 'Verificado',
    hot: 'Activo',
    new: 'Nuevo',
    common_spawn: 'Apariciones comunes',
  }

  return labelMap[badge]
}

/**
 * Calcula distancia entre dos coordenadas (Haversine)
 * Retorna distancia en metros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Radio tierra en metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Formato legible para distancia (metros → km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * Valida que un objeto sea un Nest válido
 */
export function isValidNest(obj: unknown): obj is any {
  // Type guard básico
  if (!obj || typeof obj !== 'object') return false
  const n = obj as Record<string, unknown>

  return (
    typeof n.id === 'string' &&
    typeof n.name === 'string' &&
    typeof n.lat === 'number' &&
    typeof n.lon === 'number' &&
    Array.isArray(n.nestPokemon) &&
    Array.isArray(n.badges)
  )
}
```

**Tamaño:** ~120 líneas

---

## 📝 Paso 2: nestCacheService.ts

**Ubicación:** `src/services/nests/nestCacheService.ts`

**Contenido:**

```typescript
/**
 * Servicio de caché para Nidos en IndexedDB
 * Colección: nests_data
 */

import { idbKeyval } from 'idb-keyval'
import type { Nest } from '@/types/nest'

const STORE_NAME = 'nests_data'

/**
 * Obtiene un nido específico por ID
 */
export async function getNest(nestId: string): Promise<Nest | null> {
  try {
    const customStore = idbKeyval.createStore('pokeweather', STORE_NAME)
    const nest = await idbKeyval.get(nestId, customStore)
    return nest || null
  } catch (error) {
    console.error(`[Nests Cache] Error getting nest ${nestId}:`, error)
    return null
  }
}

/**
 * Guarda un nido en la caché
 */
export async function setNest(nestId: string, nest: Nest): Promise<void> {
  try {
    const customStore = idbKeyval.createStore('pokeweather', STORE_NAME)
    await idbKeyval.set(nestId, nest, customStore)
  } catch (error) {
    console.error(`[Nests Cache] Error setting nest ${nestId}:`, error)
  }
}

/**
 * Obtiene todos los nidos de la caché
 */
export async function getAllNests(): Promise<Nest[]> {
  try {
    const customStore = idbKeyval.createStore('pokeweather', STORE_NAME)
    const nests: Nest[] = []

    // Iterar sobre todas las claves
    let cursor = await customStore.openCursor()
    while (cursor) {
      const value = cursor.value as Nest
      if (value && isValidNest(value)) {
        nests.push(value)
      }
      cursor = await cursor.continue()
    }

    return nests
  } catch (error) {
    console.error('[Nests Cache] Error getting all nests:', error)
    return []
  }
}

/**
 * Limpia toda la caché de nidos
 */
export async function clearNestCache(): Promise<void> {
  try {
    const customStore = idbKeyval.createStore('pokeweather', STORE_NAME)
    await idbKeyval.clear(customStore)
    console.log('[Nests Cache] Cache cleared')
  } catch (error) {
    console.error('[Nests Cache] Error clearing cache:', error)
  }
}

/**
 * Valida estructura básica de Nest
 */
function isValidNest(obj: unknown): obj is Nest {
  if (!obj || typeof obj !== 'object') return false
  const n = obj as Record<string, unknown>

  return (
    typeof n.id === 'string' &&
    typeof n.name === 'string' &&
    typeof n.lat === 'number' &&
    typeof n.lon === 'number'
  )
}
```

**Tamaño:** ~90 líneas

---

## 📝 Paso 3: useNests.ts

**Ubicación:** `src/hooks/useNests.ts`

**Contenido:**

```typescript
/**
 * Hook para cargar y orquestar nidos
 * Flujo: JSON → IndexedDB → Zustand
 */

import { useEffect, useRef } from 'react'
import type { Nest } from '@/types/nest'
import { useStore } from '@/store/useStore'
import * as nestCacheService from '@/services/nests/nestCacheService'

let nestsData: Nest[] | null = null

export function useNests() {
  const { setNests } = useStore()
  const initialized = useRef(false)

  /**
   * Carga nidos desde nests.json
   */
  async function loadNests(): Promise<Nest[]> {
    console.log('[useNests] Loading nests from JSON...')

    try {
      const response = await fetch('/src/data/nests.json')
      if (!response.ok) {
        throw new Error(`Failed to fetch nests: ${response.statusText}`)
      }

      const json = (await response.json()) as { nests: Nest[] }
      const nests = json.nests

      console.log(`[useNests] Loaded ${nests.length} nests from JSON`)
      return nests
    } catch (error) {
      console.error('[useNests] Error loading nests:', error)
      return []
    }
  }

  /**
   * Guarda nidos en IndexedDB
   */
  async function setNestCache(nests: Nest[]): Promise<void> {
    console.log(`[useNests] Saving ${nests.length} nests to IndexedDB...`)

    for (const nest of nests) {
      await nestCacheService.setNest(nest.id, nest)
    }

    console.log('[useNests] Nests saved to cache')
  }

  /**
   * Carga desde caché si existe, sino desde JSON
   */
  async function loadFromCacheOrJson(): Promise<Nest[]> {
    // Intentar desde caché primero
    const cached = await nestCacheService.getAllNests()

    if (cached.length > 0) {
      console.log(`[useNests] Loaded ${cached.length} nests from cache`)
      return cached
    }

    // Fallback a JSON
    const fromJson = await loadNests()
    if (fromJson.length > 0) {
      await setNestCache(fromJson)
    }

    return fromJson
  }

  /**
   * Entry point: carga nidos y actualiza store
   */
  async function run(onReady?: () => void): Promise<void> {
    if (initialized.current) {
      console.log('[useNests] Already initialized, skipping')
      return
    }

    initialized.current = true

    try {
      // Cargar
      const nests = await loadFromCacheOrJson()

      // Actualizar store
      setNests(nests)

      // Callback
      onReady?.()

      console.log('[useNests] Initialization complete')
    } catch (error) {
      console.error('[useNests] Error during initialization:', error)
    }
  }

  /**
   * Hook de inicialización automática
   */
  function useInitialize(enabled = true) {
    useEffect(() => {
      if (enabled) {
        run()
      }
    }, [enabled])
  }

  return { run, loadNests, setNestCache, useInitialize }
}
```

**Tamaño:** ~130 líneas

---

## 📝 Paso 4: Extender useStore.ts

**Ubicación:** `src/store/useStore.ts`

**Cambios:**

```typescript
// IMPORTAR TIPOS
import type { Nest } from '@/types/nest'

// AGREGAR TYPE (antes de create)
type NestsSlice = {
  // State
  nests: Nest[]
  selectedNest: Nest | null
  nestFavorites: string[]
  currentMode: 'clima' | 'nests'

  // Actions
  setNests: (nests: Nest[]) => void
  setSelectedNest: (nest: Nest | null) => void
  toggleNestFavorite: (nestId: string) => void
  setCurrentMode: (mode: 'clima' | 'nests') => void
}

// AGREGAR EN create() → (set, get) => ({ ... })
// NESTOS SLICE:
nests: [],
selectedNest: null,
nestFavorites: [],
currentMode: 'clima',

setNests: (nests) => set({ nests }),
setSelectedNest: (nest) => set({ selectedNest: nest }),

toggleNestFavorite: (nestId) => {
  const { nestFavorites } = get()
  const updated = nestFavorites.includes(nestId)
    ? nestFavorites.filter(id => id !== nestId)
    : [...nestFavorites, nestId]
  set({ nestFavorites: updated })
},

setCurrentMode: (mode) => set({ currentMode: mode }),

// DERIVADA (para filtros futuros)
getFilteredNests: () => {
  const { nests } = get()
  return nests // Por ahora retorna todos
},
```

**Total líneas a agregar:** ~50

---

## ✅ Validación: Paso Final

### Test 1: Consola (5 min)
1. Abre `src/App.tsx`
2. Agrega en el useEffect:
   ```typescript
   const { run } = useNests()
   run(() => {
     const { nests } = useStore.getState()
     console.log('✅ Nests loaded:', nests)
   })
   ```
3. Abre el navegador (npm run dev)
4. Abre DevTools → Console
5. **Espera ver:** `✅ Nests loaded: [5 nests]`

### Test 2: IndexedDB (5 min)
1. DevTools → Application → IndexedDB → pokeweather
2. **Espera ver:** ObjectStore `nests_data` con 5 documentos
3. Cada documento debe tener un `id` (clave) y `data` (objeto Nest)

### Test 3: Build (5 min)
```bash
npm run build
```
**Espera:**
- ✅ Build exitoso
- ❌ NO TypeErrors
- ❌ NO warnings sobre missing types

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'nests.json'"
**Solución:** Verificar ruta en `loadNests()` es `/src/data/nests.json`

### Error: "idbKeyval is not defined"
**Solución:** Verificar que ya está instalado `npm install idb-keyval`

### nests[] está vacío en store
**Solución:** Llamar `useNests().run()` ANTES de usar nests del store

### IndexedDB.nests_data no aparece
**Solución:** Verificar que createStore('pokeweather', 'nests_data') es exacto

---

## 📝 Notas

- **No tocar Clima:** Los cambios solo tocan `src/services/nests/`, `src/hooks/useNests.ts`, `src/store/useStore.ts`
- **TypeScript Strict:** Todas las funciones tienen tipos explícitos
- **Logging:** Cada función principal tiene `console.log` para debugging
- **Caché idempotente:** Guardar el mismo nido múltiples veces es seguro

---

## ✨ Próximo Paso

Una vez validado, pasar a **Sesión 2: Componentes**

```bash
# Verificar que está todo en orden:
npm run build
# ✅ PASSED

# Validar tipos:
# ✅ PASSED

# Commit:
git add -A
git commit -m "feat(nests): Servicios, hook y store - Sesión 1"
```

---

**Última actualización:** 2026-04-10  
**Rama:** feature/nests  
**Sesión:** 1 de 3


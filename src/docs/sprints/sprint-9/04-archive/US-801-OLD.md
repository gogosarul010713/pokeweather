# 📋 US-801 — Carga Estática de Nidos

**Sprint:** 8 (Fase 1)  
**Story Points:** 2 SP  
**Prioridad:** P0 (bloqueante para resto)  
**Status:** ⏳ Pendiente  

---

## Historia de Usuario

> Como usuario, quiero que los nidos se carguen automáticamente al iniciar la app para poder verlos y interactuar con ellos sin esperas.

---

## Criterios de Aceptación

- [ ] 5 nidos cargados desde `src/data/nests.json`
- [ ] Datos guardados en `IndexedDB.nests_data` (caché)
- [ ] Datos cargados a `Zustand.nests[]` (state)
- [ ] Tiempo de carga < 1 segundo (desde caché en sesión 2)
- [ ] Tipos TypeScript 100% (sin `any`)
- [ ] Sin afectar carga de ciudades (clima)
- [ ] Logging visible en consola

---

## Archivos a Crear/Modificar

### Crear:
1. `src/services/nests/nestService.ts` — Utilidades y mapeos
2. `src/services/nests/nestCacheService.ts` — CRUD IndexedDB NO ES NECESARIO, NO LO IMPLEMENTES, SE UTILIZARA SOLO EL JSON
3. `src/hooks/useNests.ts` — Hook orquestación

### Modificar:
1. `src/store/useStore.ts` — Agregar nests slice

### YA EXISTE:
1. `src/types/nest.ts` ✅
2. `src/data/nests.json` ✅

---

## Flujo de Datos

```
START
  ↓
useNests.run()
  ├─ Primera sesión:
  │  ├─ loadNests() → fetch nests.json
  │  ├─ setNestCache() → IndexedDB.nests_data
  │  └─ setNests() → Zustand.nests[]
  │
  └─ Segunda sesión:
     ├─ loadFromCacheOrJson() → intenta IndexedDB
     ├─ Si existe → retorna 5 nidos (< 100ms)
     └─ Si no existe → fetch JSON y cachea
```

---

## Archivos a Crear Detallados

### 1. nestService.ts (~120 líneas)

**Responsabilidad:** Mapeos, utilidades, helpers

**Funciones principales:**
```typescript
getPokemonTypeColor(type: PokemonType): string
getBadgeIcon(badge: BadgeType): string
getBadgeLabel(badge: BadgeType): string
calculateDistance(lat1, lon1, lat2, lon2): number
formatDistance(meters: number): string
isValidNest(obj: unknown): obj is Nest
```

**Ubicación:** `src/services/nests/nestService.ts`

---

### 2. nestCacheService.ts (~90 líneas)

**Responsabilidad:** Persistencia en IndexedDB

**Funciones principales:**
```typescript
getNest(nestId: string): Promise<Nest | null>
setNest(nestId: string, nest: Nest): Promise<void>
getAllNests(): Promise<Nest[]>
clearNestCache(): Promise<void>
```

**Detalles:**
- Usar `idbKeyval` (ya instalado)
- Colección: `nests_data` (separada de `weather_data`)
- Clave: `nestId` (string)
- Manejo de errores: try/catch con logging

**Ubicación:** `src/services/nests/nestCacheService.ts`

---

### 3. useNests.ts (~130 líneas)

**Responsabilidad:** Orquestación de carga

**Funciones principales:**
```typescript
loadNests(): Promise<Nest[]>
  // Fetch nests.json

setNestCache(nests: Nest[]): Promise<void>
  // Guardar en IndexedDB

loadFromCacheOrJson(): Promise<Nest[]>
  // Intentar cache primero, fallback JSON

run(onReady?: () => void): Promise<void>
  // Entry point principal

useInitialize(enabled = true): void
  // Hook de auto-inicialización
```

**Detalles:**
- Usar `useRef(initialized)` para evitar doble-carga
- Usar `useStore().setNests()` para actualizar state
- Logging a cada paso
- Callback `onReady` opcional

**Ubicación:** `src/hooks/useNests.ts`

---

### 4. useStore.ts (Extender ~50 líneas)

**Qué agregar:**

```typescript
// NUEVO: Nests slice
nests: Nest[]
selectedNest: Nest | null
nestFavorites: string[]
currentMode: 'clima' | 'nests'

setNests: (nests: Nest[]) => void
setSelectedNest: (nest: Nest | null) => void
toggleNestFavorite: (nestId: string) => void
setCurrentMode: (mode: 'clima' | 'nests') => void

// DERIVADAS
getFilteredNests: () => Nest[]
getFavoriteNests: () => Nest[]
isFavorite: (nestId: string) => boolean
```

**Ubicación:** `src/store/useStore.ts`

---

## Datos: nests.json

**YA EXISTE en:** `src/data/nests.json`

**Estructura:** 5 nidos con:
- Identificadores únicos (id)
- Coordenadas (lat, lon)
- Ubicación (city, country, region)
- Pokémon nidificado (tipo, spawn%)
- Metadatos (descoberto, verificado)
- Badges (verified, hot, etc)

**Ejemplo:**
```json
{
  "nests": [
    {
      "id": "shinjuku-sandshrew",
      "name": "Shinjuku Central Park",
      "lat": 35.6839,
      "lon": 139.7462,
      ...
    }
    // 4 más
  ]
}
```

---

## Validación

### Test 1: Console Logging (2 min)
```typescript
// En App.tsx useEffect:
const { run } = useNests()
run(() => {
  const { nests } = useStore.getState()
  console.log('✅ Nests loaded:', nests)
  console.log('Count:', nests.length)
})
```

**Esperar en DevTools Console:**
```
[useNests] Loading nests from JSON...
[useNests] Loaded 5 nests from JSON
[useNests] Saving 5 nests to IndexedDB...
[useNests] Nests saved to cache
[useNests] Initialization complete
✅ Nests loaded: [Nest, Nest, Nest, Nest, Nest]
Count: 5
```

### Test 2: IndexedDB (3 min)
1. DevTools → Application
2. IndexedDB → pokeweather
3. **Esperar ver:**
   - ObjectStore: `nests_data` ✅
   - Documentos: 5 con IDs (keys)
   - Cada uno con objeto `Nest` completo

### Test 3: Build (5 min)
```bash
npm run build
# Esperar: ✅ EXIT 0
# Esperar: ❌ ZERO TypeErrors
```

### Test 4: Segunda Sesión (2 min)
1. Recargar página (F5)
2. Abrir DevTools Console
3. **Esperar ver:**
   ```
   [useNests] Loading nests from JSON...
   [useNests] Loaded 5 nests from cache  ← ¡de cache!
   [useNests] Initialization complete
   ```

---

## Criterios de Éxito

✅ 5 nidos en `useStore().nests[]`  
✅ IndexedDB.nests_data tiene 5 documentos  
✅ Segunda carga es más rápida (desde cache)  
✅ Logging en consola es claro  
✅ TypeScript: 0 errores  
✅ Build: PASSED  

---

## Notas Importantes

- **Independencia:** No modificar nada relacionado a Clima
- **Logging:** Cada paso debe tener `console.log`
- **Errores:** Usar try/catch para operaciones async
- **Tipos:** Todas las funciones deben tener tipos explícitos
- **Caché:** Usar colección `nests_data` (no `weather_data`)

---

## Checklist Sesión 1

- [ ] nestService.ts creado ✅
- [ ] nestCacheService.ts creado ✅
- [ ] useNests.ts creado ✅
- [ ] useStore.ts extendido ✅
- [ ] npm run build → PASSED ✅
- [ ] 5 nidos en consola ✅
- [ ] IndexedDB visible ✅
- [ ] Commit: `feat(nests): Servicios, hook y store`

---

**Última actualización:** 2026-04-12  
**Rama:** feature/nests  
**Dependencias:** Ninguna  
**Bloqueante para:** US-802, US-803, US-804, US-805, US-806, US-807


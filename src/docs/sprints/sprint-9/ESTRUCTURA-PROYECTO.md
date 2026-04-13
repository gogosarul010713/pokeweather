# 📁 Estructura de Proyecto — Qué Crear y Dónde

**Rama:** `feature/nests`  
**Última actualización:** 2026-04-10  

---

## 🎯 Checklist de Archivos a Crear

Total: **18+ archivos**

---

## ✅ SESIÓN 1: Tipos, Servicios, Store

### 📝 Tipos (1 archivo)

**YA EXISTE:**
- ✅ `src/types/nest.ts` — Interfaces Nest, NestPokemon, etc.
- ✅ `src/data/nests.json` — 5 nidos de ejemplo

### 🛠️ Servicios (2 archivos)

#### `src/services/nests/nestService.ts` (CREAR)

**Responsabilidad:**
- Mapeos de tipo Pokémon → color hex
- Helpers para badges (icono + label)
- Utilidades de cálculo (distancia, etc)

**Función principal:**
```typescript
export function getPokemonTypeColor(type: PokemonType): string {
  const colorMap: Record<PokemonType, string> = {
    fire: '#FF6B35',
    water: '#6890F0',
    // ... 16 más
  }
  return colorMap[type] || '#9C9C9C'
}

export function getBadgeIcon(badge: BadgeType): string {
  return { verified: '✓', hot: '🔥', new: '⭐', common_spawn: '➕' }[badge]
}
```

**Ubicación:** `src/services/nests/`  
**Size estimado:** ~50 líneas

---

#### `src/services/nests/nestCacheService.ts` (CREAR)

**Responsabilidad:**
- CRUD en IndexedDB.nests_data
- Persistencia entre sesiones

**Funciones principales:**
```typescript
export async function getNest(nestId: string): Promise<Nest | null>
export async function setNest(nestId: string, nest: Nest): Promise<void>
export async function getAllNests(): Promise<Nest[]>
export async function clearNestCache(): Promise<void>
```

**Ubicación:** `src/services/nests/`  
**Size estimado:** ~80 líneas

---

### 🪝 Hooks (1 archivo)

#### `src/hooks/useNests.ts` (CREAR)

**Responsabilidad:**
- Cargar nests.json
- Guardar en IndexedDB
- Actualizar Zustand
- Entry point para inicialización

**Estructura:**
```typescript
export function useNests() {
  const { setNests } = useStore()
  
  async function loadNests() {
    // fetch nests.json
  }
  
  async function run(onReady?: () => void) {
    await loadNests()
    // → IndexedDB
    // → Zustand
    onReady?.()
  }
  
  return { run }
}
```

**Ubicación:** `src/hooks/`  
**Size estimado:** ~100 líneas

---

### 🏪 Store (1 archivo a modificar)

#### `src/store/useStore.ts` (EXTENDER)

**Agregar slice de nests:**

```typescript
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
```

**Ubicación:** `src/store/`  
**Líneas a agregar:** ~50

---

## ✅ SESIÓN 2: Componentes

### 🗺️ Componentes de Mapa (4 archivos)

#### `src/components/Nests/NestMapView.tsx` (CREAR)

**Responsabilidad:**
- Contenedor principal del mapa de nidos
- Renderiza MapContainer + NestPin[] + NestTooltip

**Props:**
```typescript
interface Props {}  // Sin props, lee del store
```

**Estructura:**
```tsx
export function NestMapView() {
  const { nests, selectedNest } = useStore()
  const { setSelectedNest } = useStore()
  
  return (
    <MapContainer {...config}>
      {/* TileLayer */}
      {nests.map(nest => (
        <NestPin
          key={nest.id}
          nest={nest}
          isSelected={selectedNest?.id === nest.id}
          onClick={() => setSelectedNest(nest)}
        />
      ))}
      {selectedNest && <NestTooltip nest={selectedNest} />}
      <NestLegend />
    </MapContainer>
  )
}
```

**Ubicación:** `src/components/Nests/`  
**Size estimado:** ~80 líneas

---

#### `src/components/Nests/NestPin.tsx` (CREAR)

**Responsabilidad:**
- Renderizar marcador SVG (gota púrpura)
- Estados: normal, hover, selected
- Interacción: onClick, tooltip

**Props:**
```typescript
interface Props {
  nest: Nest
  isSelected: boolean
  onClick: () => void
}
```

**Estructura:**
```tsx
export function NestPin({ nest, isSelected, onClick }: Props) {
  const color = getPokemonTypeColor(nest.nestPokemon[0].type)
  
  return (
    <Marker
      position={[nest.lat, nest.lon]}
      icon={L.divIcon({
        className: isSelected ? 'nest-pin selected' : 'nest-pin',
        html: `<svg>...</svg>`, // gota púrpura
      })}
      onClick={onClick}
    />
  )
}

// CSS:
// .nest-pin { fill: var(--nest-primary) }
// .nest-pin.selected { fill: var(--nest-hover) }
```

**Ubicación:** `src/components/Nests/`  
**Size estimado:** ~100 líneas (con SVG)

---

#### `src/components/Nests/NestTooltip.tsx` (CREAR)

**Responsabilidad:**
- Popup información rápida
- 3 líneas: nombre, pokémon, badges
- Botones: copiar coords, ver detalle

**Props:**
```typescript
interface Props {
  nest: Nest
}
```

**Ubicación:** `src/components/Nests/`  
**Size estimado:** ~120 líneas

---

#### `src/components/Nests/NestLegend.tsx` (CREAR)

**Responsabilidad:**
- Leyenda del mapa de nidos
- Colores por tipo Pokémon
- Explicación de badges

**Ubicación:** `src/components/Nests/`  
**Size estimado:** ~100 líneas

---

### 📋 Componentes de Sidebar (3 archivos)

#### `src/components/Nests-Sidebar/NestFeed.tsx` (CREAR)

**Responsabilidad:**
- Listado scroll de nidos
- Mapa nests → NestCard[]
- Auto-scroll al seleccionar

**Props:**
```typescript
interface Props {}  // Lee del store
```

**Ubicación:** `src/components/Nests-Sidebar/`  
**Size estimado:** ~100 líneas

---

#### `src/components/Nests-Sidebar/NestCard.tsx` (CREAR)

**Responsabilidad:**
- Card individual en lista
- Nombre + país + tipo Pokémon
- Click → selecciona nido

**Props:**
```typescript
interface Props {
  nest: Nest
  isSelected: boolean
  onClick: () => void
}
```

**Ubicación:** `src/components/Nests-Sidebar/`  
**Size estimado:** ~80 líneas

---

#### `src/components/Nests-Sidebar/NestDetail.tsx` (CREAR)

**Responsabilidad:**
- Panel modal lado derecho
- Información completa: nombre, coords, pokémon, badges, notas
- Botón favorito (⭐)
- Botón cerrar (X)

**Props:**
```typescript
interface Props {
  nest: Nest | null
  onClose: () => void
}
```

**Ubicación:** `src/components/Nests-Sidebar/`  
**Size estimado:** ~150 líneas

---

### 🎯 Header (1 archivo)

#### `src/components/Header/ModeToggle.tsx` (CREAR)

**Responsabilidad:**
- Toggle: 🌞 CLIMA | 🏠 NIDOS
- Botones con estado activo/inactivo
- onClick → setCurrentMode()

**Props:**
```typescript
interface Props {}  // Lee del store
```

**Ubicación:** `src/components/Header/`  
**Size estimado:** ~70 líneas

---

## ✅ SESIÓN 3: Integración

### 🔄 Archivos a Modificar

#### `src/App.tsx` (MODIFICAR)

**Cambios:**
1. Importar useNests
2. useEffect → useNests.run()
3. Renderización condicional:
   ```tsx
   {currentMode === 'clima' ? (
     <>
       <MapView />
       <LocationFeed />
     </>
   ) : (
     <>
       <NestMapView />
       <NestFeed />
     </>
   )}
   ```

**Size cambios:** ~20 líneas

---

#### `src/components/Header/Header.tsx` (MODIFICAR)

**Cambios:**
1. Importar ModeToggle
2. Renderizar ModeToggle en header

**Size cambios:** ~5 líneas

---

#### `src/store/useStore.ts` (YA MODIFICADO en Sesión 1)

---

## 📊 Resumen

| Sesión | Archivos | Lineal | Total |
|--------|----------|--------|-------|
| **1** | 4 + 1 modify | ~280 | 280 |
| **2** | 7 new | ~630 | 910 |
| **3** | 2 modify + 1 export | ~25 | 935 |
| **Total** | **14 new + 3 modify** | **935** | **935** |

---

## 🎨 CSS Variables (index.css - agregar)

```css
/* Nidos - Colores primarios */
:root {
  --nest-primary: #9C27B0;      /* Púrpura */
  --nest-hover: #7B1FA2;        /* Púrpura oscuro */
  --nest-light: #E1BEE7;        /* Púrpura claro */
  
  --nest-icon: #FFF;            /* Blanco para icono en pin */
  
  /* Badge colors */
  --badge-verified: #3FB950;    /* Verde */
  --badge-hot: #D29922;         /* Naranja */
  --badge-new: #58A6FF;         /* Azul */
  --badge-common: #6E7681;      /* Gris */
}
```

---

## 📋 Checklist de Carpetas a Crear

- [ ] `src/services/nests/`
- [ ] `src/components/Nests/`
- [ ] `src/components/Nests-Sidebar/`

---

## 🔗 Importaciones Clave

### En componentes
```typescript
import { Nest, PokemonType } from '@/types/nest'
import { useStore } from '@/store/useStore'
import { getPokemonTypeColor } from '@/services/nests/nestService'
```

### En servicios
```typescript
import { idbKeyval } from 'idb-keyval'
import { Nest } from '@/types/nest'
```

### En hooks
```typescript
import { useStore } from '@/store/useStore'
import * as nestCacheService from '@/services/nests/nestCacheService'
```

---

## 🚀 Orden de Creación Recomendado

### Sesión 1 (orden importa — dependencias)
1. `nestService.ts` ← funciones utilidad
2. `nestCacheService.ts` ← CRUD
3. `useNests.ts` ← hook orquestación (usa los 2 anteriores)
4. Extender `useStore.ts` ← store

### Sesión 2 (orden flexible)
1. `NestMapView.tsx` ← contenedor principal
2. `NestPin.tsx` ← componente principal del mapa
3. `NestTooltip.tsx` ← usa NestMapView
4. `NestLegend.tsx` ← leyenda
5. `NestFeed.tsx` ← contenedor sidebar
6. `NestCard.tsx` ← componente individual
7. `NestDetail.tsx` ← usa NestCard

### Sesión 3 (orden importa — integración)
1. `ModeToggle.tsx` ← componente independiente
2. Actualizar `Header.tsx` ← integra ModeToggle
3. Actualizar `App.tsx` ← integra todo

---

**Última actualización:** 2026-04-10  
**Rama:** feature/nests


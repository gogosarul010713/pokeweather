# Sprint 9 Sesion 3 — Migracion activeTab → activeLayers

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el modelo de capa exclusiva (`activeTab: string`) por capas independientes (`activeLayers: { clima, nidos, gyms, stops, rutas }`) para que Clima y Nidos puedan estar activos simultaneamente, con toggles en el Header, filtros adaptativos en el Sidebar, y un feed unificado.

**Architecture:** El store Zustand es la unica fuente de verdad — `activeLayers` reemplaza `activeTab` por completo. `MapView`, `Header`, `Sidebar`, `FilterPanel` y `LocationFeed` reaccionan a `activeLayers` en lugar de comparar strings. US-826 es el desbloqueo: sin ella, las demas US no compilan. La implementacion sigue el orden de dependencias del INDEX actualizado.

**Tech Stack:** React 18, TypeScript, Zustand 4, Vite 5, Leaflet/react-leaflet, CSS inline por componente (no CSS Modules).

## Global Constraints

- Cero colores hardcodeados — todo via `var(--x)` del design system, EXCEPTO los colores de capa que son constantes de producto: clima `#3b82f6`, nidos `#22c55e`, gyms `#f97316`, stops `#a78bfa`, rutas `#f59e0b`
- Un `<style>` por componente con prefijo de clase unico obligatorio
- No CSS Modules — estilos inline o `<style>` tag dentro del componente
- `activeTab` no debe aparecer en ningun `.tsx/.ts` al terminar (verificar con grep)
- `MapView.tsx` permanece como archivo unico (DEC-903)
- `FilterPanelClima` y `FilterPanelNests` no cambian internamente — solo su visibilidad cambia
- localStorage key `pwe-activeTab` se abandona; nueva key `pwe-activeLayers` con valor JSON
- Build TypeScript sin errores: `npx tsc --noEmit` debe pasar en cada tarea

---

## Mapa de archivos

### Archivos nuevos a crear

| Archivo | Responsabilidad |
|---|---|
| `src/types/layers.ts` | Tipos `LayerKey`, `ActiveLayers`, constante `DEFAULT_LAYERS` |
| `src/components/Header/LayerToggles.tsx` | Cinco botones de capa en el Header (US-823) |
| `src/components/Sidebar/SidebarFilterPanel.tsx` | Wrapper adaptivo de filtros en Sidebar (US-821) |

### Archivos a modificar

| Archivo | Que cambia |
|---|---|
| `src/store/useStore.ts` | Eliminar `activeTab`/`setActiveTab`; agregar `activeLayers`, `toggleLayer`, `setLayer` |
| `src/components/Map/MapView.tsx` | Condiciones de pins: `activeLayers.clima` / `activeLayers.nidos` |
| `src/components/Header/Header.tsx` | Remover consumo de `activeTab`; integrar `<LayerToggles />` |
| `src/components/Header/FilterPanel.tsx` | Vaciar/eliminar (se mueve al Sidebar) |
| `src/components/Sidebar/Sidebar.tsx` | Agregar `<SidebarFilterPanel>` arriba del feed; remover Overlay de modo todo; agregar NestFeed condicional |
| `src/components/Sidebar/LocationFeed.tsx` | Feed unificado con `FeedItem` (clima + nidos) |
| `src/components/Sidebar/LocationCard.tsx` | Tags por capa activa |
| `src/App.tsx` | Eliminar logica de `activeTab`/`previousTab`/toast todo; layout raiz |

### Archivos a crear (feed unificado, US-818)

| Archivo | Responsabilidad |
|---|---|
| `src/types/feed.ts` | Tipo `FeedItem` — unidad de lugar con datos de clima y/o nidos |
| `src/components/Sidebar/NestCard.tsx` | Tarjeta individual de nido (vista de solo nidos) |

### Docs a actualizar (al final)

| Archivo | Accion |
|---|---|
| `src/docs/sprints/sprint-9/US/US-821.md` | Reemplazar con version de update-docs |
| `src/docs/sprints/sprint-9/US/US-823.md` | Reemplazar con version de update-docs |
| `src/docs/sprints/sprint-9/US/US-824.md` | Reemplazar con version de update-docs |
| `src/docs/sprints/sprint-9/US/US-818.md` | Reemplazar con version de update-docs |
| `src/docs/sprints/sprint-9/00-INDEX.md` | Reemplazar con version de update-docs |
| `src/docs/sprints/sprint-9/decisions.md` | Agregar DEC-901, DEC-902, DEC-903 |

---

## Task 1: US-826 — Tipos y store base (activeLayers)

**Files:**
- Create: `src/types/layers.ts`
- Modify: `src/store/useStore.ts`

**Interfaces:**
- Produces: `LayerKey`, `ActiveLayers`, `activeLayers`, `toggleLayer(key: LayerKey)`, `setLayer(key: LayerKey, value: boolean)` — consumidos por todas las tareas siguientes

- [ ] **Step 1: Crear `src/types/layers.ts`**

```ts
export type LayerKey = 'clima' | 'nidos' | 'gyms' | 'stops' | 'rutas'

export interface ActiveLayers {
  clima: boolean
  nidos: boolean
  gyms: boolean
  stops: boolean
  rutas: boolean
}

export const DEFAULT_LAYERS: ActiveLayers = {
  clima: true,
  nidos: false,
  gyms: false,
  stops: false,
  rutas: false,
}
```

- [ ] **Step 2: Actualizar la interfaz `AppStore` en `src/store/useStore.ts`**

Localizar el bloque `interface AppStore` (linea ~58). Reemplazar:
```ts
// ELIMINAR estas lineas:
  activeTab: 'clima' | 'nidos' | 'todo'
  setActiveTab: (tab: 'clima' | 'nidos' | 'todo') => void
```
Agregar en su lugar:
```ts
  activeLayers: ActiveLayers
  toggleLayer: (layer: LayerKey) => void
  setLayer: (layer: LayerKey, value: boolean) => void
```

- [ ] **Step 3: Agregar import de tipos en `useStore.ts`**

Al inicio del archivo, agregar despues del import de `Nest`:
```ts
import type { ActiveLayers, LayerKey } from '../types/layers'
import { DEFAULT_LAYERS } from '../types/layers'
```

- [ ] **Step 4: Reemplazar el estado inicial `activeTab` por `activeLayers` en el store**

Localizar la linea ~161:
```ts
// ELIMINAR:
  activeTab: (localStorage.getItem('pwe-activeTab') as 'clima' | 'nidos' | 'todo') || 'clima',
```
Reemplazar por:
```ts
  activeLayers: (() => {
    try {
      const stored = localStorage.getItem('pwe-activeLayers')
      if (!stored) return DEFAULT_LAYERS
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_LAYERS, ...parsed }
    } catch {
      return DEFAULT_LAYERS
    }
  })(),
```

- [ ] **Step 5: Reemplazar la action `setActiveTab` por `toggleLayer` y `setLayer`**

Localizar la action `setActiveTab` (~linea 258):
```ts
// ELIMINAR:
  setActiveTab: (tab) => {
    localStorage.setItem('pwe-activeTab', tab)
    set({ activeTab: tab })
  },
```
Reemplazar por:
```ts
  toggleLayer: (layer) =>
    set((state) => {
      const next = { ...state.activeLayers, [layer]: !state.activeLayers[layer] }
      localStorage.setItem('pwe-activeLayers', JSON.stringify(next))
      return { activeLayers: next }
    }),

  setLayer: (layer, value) =>
    set((state) => {
      const next = { ...state.activeLayers, [layer]: value }
      localStorage.setItem('pwe-activeLayers', JSON.stringify(next))
      return { activeLayers: next }
    }),
```

- [ ] **Step 6: Verificar TypeScript**

```powershell
cd c:\Workspace\React\pokeweather-nests
npx tsc --noEmit 2>&1 | head -40
```

Errores esperados en este paso: referencias a `activeTab` en `MapView.tsx`, `Header.tsx`, `FilterPanel.tsx`, `Sidebar.tsx`, `App.tsx`. Son esperados — se resuelven en las tareas siguientes. Lo que NO debe haber son errores dentro del propio `useStore.ts`.

- [ ] **Step 7: Commit**

```powershell
git add src/types/layers.ts src/store/useStore.ts
git commit -m "feat(us-826): Migrar activeTab a activeLayers en store"
```

---

## Task 2: US-826 — Actualizar consumidores directos de activeTab

**Files:**
- Modify: `src/components/Map/MapView.tsx`
- Modify: `src/components/Header/Header.tsx`
- Modify: `src/components/Header/FilterPanel.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `activeLayers: ActiveLayers`, `toggleLayer`, `setLayer` de `useStore`
- Produces: build limpio sin referencias a `activeTab` en estos 4 archivos

- [ ] **Step 1: Actualizar `MapView.tsx`**

Localizar (~linea 74):
```tsx
// REEMPLAZAR:
  const activeTab = useStore((s) => s.activeTab)
```
Por:
```tsx
  const activeLayers = useStore((s) => s.activeLayers)
```

Localizar (~linea 169-185) los condicionales de pins:
```tsx
// REEMPLAZAR:
          {(activeTab === 'clima' || activeTab === 'todo') &&
            filteredCities.map((city) => (
              <MapPin ... />
            ))
          }

          {(activeTab === 'nidos' || activeTab === 'todo') &&
            nests.map((nest) => (
              <NestPin key={nest.id} nest={nest} />
            ))
          }
```
Por:
```tsx
          {activeLayers.clima &&
            filteredCities.map((city) => (
              <MapPin
                key={city.id}
                city={city}
                badges={badgesByCity.get(city.id)}
              />
            ))
          }

          {activeLayers.nidos &&
            nests.map((nest) => (
              <NestPin key={nest.id} nest={nest} />
            ))
          }
```

- [ ] **Step 2: Actualizar `Header.tsx`**

Localizar (~linea 21-22):
```tsx
// ELIMINAR estas dos lineas:
  const activeTab = useStore((s) => s.activeTab)
```

Localizar (~linea 251) el condicional que usa `activeTab`:
```tsx
// ELIMINAR este bloque completo:
          {activeTab !== 'todo' && (
            <div className="hd-filter-panel">
              <FilterPanel />
            </div>
          )}
```
El `<FilterPanel>` del Header desaparece — se movera al Sidebar en Task 4.

- [ ] **Step 3: Vaciar `src/components/Header/FilterPanel.tsx`**

El archivo existente usa `activeTab` y renderiza en el Header. Reemplazar su contenido completo con un componente vacio que sirve como tombstone hasta que se elimine completamente:

```tsx
// Este componente fue movido a src/components/Sidebar/SidebarFilterPanel.tsx (US-821)
export default function FilterPanel() {
  return null
}
```

- [ ] **Step 4: Limpiar `App.tsx` de referencias a activeTab**

En `App.tsx` eliminar:
1. La linea `const [showTodoToast, setShowTodoToast] = useState(false)` (~linea 18)
2. La linea `const [previousTab, setPreviousTab] = useState<'clima' | 'nidos' | 'todo'>('clima')` (~linea 19)
3. La linea `const activeTab = useStore((s) => s.activeTab)` (~linea 21)
4. El `useEffect` completo que maneja `showTodoToast` (~lineas 66-71):
```tsx
// ELIMINAR:
  useEffect(() => {
    if (activeTab === 'todo' && previousTab !== 'todo') {
      setShowTodoToast(true)
    }
    setPreviousTab(activeTab)
  }, [activeTab, previousTab])
```
5. El bloque del Toast de modo Todo (~lineas 213-220):
```tsx
// ELIMINAR:
        {showTodoToast && (
          <Toast
            message="Mostrando Clima y Nidos simultáneamente en el mapa"
            duration={4000}
            onDismiss={() => setShowTodoToast(false)}
          />
        )}
```

- [ ] **Step 5: Verificar TypeScript — debe estar limpio**

```powershell
npx tsc --noEmit 2>&1 | head -40
```

Resultado esperado: 0 errores (o solo errores de los archivos de Sidebar que todavia usan `activeTab` — `Sidebar.tsx` y `LocationFeed.tsx`, que se resuelven en Tasks siguientes).

- [ ] **Step 6: Verificar que activeTab no aparece en los 4 archivos modificados**

```powershell
Select-String -Path "src/components/Map/MapView.tsx","src/components/Header/Header.tsx","src/components/Header/FilterPanel.tsx","src/App.tsx" -Pattern "activeTab"
```

Resultado esperado: 0 matches.

- [ ] **Step 7: Commit**

```powershell
git add src/components/Map/MapView.tsx src/components/Header/Header.tsx src/components/Header/FilterPanel.tsx src/App.tsx
git commit -m "feat(us-826): Actualizar consumidores de activeTab a activeLayers"
```

---

## Task 3: US-823 — LayerToggles en Header

**Files:**
- Create: `src/components/Header/LayerToggles.tsx`
- Modify: `src/components/Header/Header.tsx`

**Interfaces:**
- Consumes: `activeLayers: ActiveLayers`, `toggleLayer(key: LayerKey)` de `useStore`; `LayerKey` de `src/types/layers.ts`
- Produces: componente `LayerToggles` visible en Header con 5 botones

- [ ] **Step 1: Crear `src/components/Header/LayerToggles.tsx`**

```tsx
import { useStore } from '../../store/useStore'
import type { LayerKey } from '../../types/layers'

interface LayerConfig {
  key: LayerKey
  label: string
  icon: string
  color: string
  available: boolean
}

const LAYERS: LayerConfig[] = [
  { key: 'clima',  label: 'Clima',       icon: '🌤',  color: '#3b82f6', available: true },
  { key: 'nidos',  label: 'Nidos',       icon: '🪺',  color: '#22c55e', available: true },
  { key: 'gyms',   label: 'Gimnasios',   icon: '🏟',  color: '#f97316', available: false },
  { key: 'stops',  label: 'PokéParadas', icon: '🔵',  color: '#a78bfa', available: false },
  { key: 'rutas',  label: 'Rutas',       icon: '🗺',  color: '#f59e0b', available: false },
]

export default function LayerToggles() {
  const activeLayers = useStore((s) => s.activeLayers)
  const toggleLayer  = useStore((s) => s.toggleLayer)

  return (
    <>
      <style>{`
        .lt-root {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .lt-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 20px;
          border: 1px solid;
          font-size: 12px;
          font-family: 'Exo 2', sans-serif;
          font-weight: 500;
          transition: all 0.15s;
          white-space: nowrap;
          background: none;
        }

        .lt-btn:not(:disabled) {
          cursor: pointer;
        }

        .lt-btn:disabled {
          opacity: 0.45;
          cursor: default;
        }

        .lt-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .lt-label {
            display: none;
          }
          .lt-btn {
            padding: 5px 7px;
          }
        }
      `}</style>

      <div className="lt-root">
        {LAYERS.map(({ key, label, icon, color, available }) => {
          const isActive = activeLayers[key]

          const activeStyle: React.CSSProperties = isActive && available
            ? { borderColor: color + '60', background: color + '20', color }
            : { borderColor: 'var(--border-default)', background: 'transparent', color: 'var(--text-secondary)' }

          return (
            <button
              key={key}
              className="lt-btn"
              style={activeStyle}
              onClick={() => available && toggleLayer(key)}
              disabled={!available}
              title={available ? undefined : 'Próximamente'}
              aria-pressed={isActive}
              type="button"
            >
              <span
                className="lt-dot"
                style={{
                  background: isActive && available ? color : 'currentColor',
                  opacity: isActive && available ? 1 : 0.4,
                }}
              />
              <span className="lt-label">{label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Integrar `LayerToggles` en `Header.tsx`**

Agregar el import al inicio de `Header.tsx`:
```tsx
import LayerToggles from './LayerToggles'
```

En el JSX del Header, dentro de `<div className="hd-filter-panel">` (que quedara vacio tras Task 2), agregar `<LayerToggles />`. Si el bloque `hd-filter-panel` ya fue eliminado en Task 2, agregarlo de nuevo con este contenido:
```tsx
          <div className="hd-filter-panel">
            <LayerToggles />
          </div>
```

- [ ] **Step 3: Verificar TypeScript**

```powershell
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 4: Verificar en browser**

```powershell
npm run dev
```

Abrir `http://localhost:5173`. Verificar:
- 5 botones visibles en el header (Clima activo por default, los otros 3 grisaceos/disabled)
- Click en "Nidos" activa la capa (boton se colorea verde)
- Click en "Clima" (activo) lo desactiva
- Los pins del mapa aparecen/desaparecen segun la capa activa
- Gimnasios/PokéParadas/Rutas no responden al click

- [ ] **Step 5: Commit**

```powershell
git add src/components/Header/LayerToggles.tsx src/components/Header/Header.tsx
git commit -m "feat(us-823): LayerToggles en Header — 5 botones de capa independientes"
```

---

## Task 4: US-824 — Layout raiz: mapa como protagonista

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Sidebar/Sidebar.tsx`
- Modify: `src/components/Map/MapView.tsx`

**Interfaces:**
- Consumes: `sidebarOpen: boolean`, `setSidebarOpen` de `useStore`
- Produces: layout `display:flex` donde sidebar tiene ancho fijo animado y MapView ocupa `flex:1`

- [ ] **Step 1: Actualizar layout raiz en `App.tsx`**

El `<div className="app-body">` actual usa `margin-top: 80px`. Convertir a layout flex sin margen superior (el header ya es `position: fixed`):

Reemplazar el bloque de estilos `.app-body` y `.app-map-area` en el `<style>` de App.tsx:
```css
        .app-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .app-body {
          display: flex;
          flex-direction: row;
          flex: 1;
          margin-top: 80px;
          height: calc(100vh - 80px);
          overflow: hidden;
        }

        .app-map-area {
          flex: 1;
          position: relative;
          overflow: hidden;
          z-index: 0;
        }

        @media (max-width: 767px) {
          .app-body {
            flex-direction: column;
            margin-top: 96px;
            height: calc(100vh - 96px);
          }
        }
```

Eliminar del JSX el bloque `<div className="app-list-area">` (ya no se usa):
```tsx
// ELIMINAR:
          <div className="app-list-area">
            <LocationFeed cities={filteredCities} />
          </div>
```

- [ ] **Step 2: Actualizar `Sidebar.tsx` — ancho animado en lugar de transform**

Reemplazar el CSS del sidebar para usar `width` + `transition` (que anima suavemente) en lugar de `transform: translateX`:

```tsx
// En el <style> de Sidebar.tsx, reemplazar .sb-root y .sb-root.sb-collapsed:
        .sb-root {
          width: 280px;
          min-width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-default);
          overflow: hidden;
          height: 100%;
          transition: width 300ms ease, min-width 300ms ease;
          position: relative;
          z-index: 20;
        }

        .sb-root.sb-collapsed {
          width: 0;
          min-width: 0;
        }
```

Eliminar tambien el wrapper `.sb-wrapper` si el toggle ahora es `position: fixed` independiente — verificar que `SidebarToggle` sigue funcionando tras el cambio.

- [ ] **Step 3: Actualizar z-index en `MapView.tsx`**

En el `<style>` de MapView, en la clase `.mv-root`:
```css
        .mv-root {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 0;
        }
```

- [ ] **Step 4: Verificar en browser**

```powershell
npm run dev
```

Verificar:
- Mapa ocupa todo el espacio restante del viewport
- Colapsar sidebar anima suavemente en 300ms y el mapa se expande
- Header siempre visible encima de todo
- No hay scroll vertical en la pagina principal
- Layout correcto en desktop (1280px+) y tablet (768-1023px)

- [ ] **Step 5: Commit**

```powershell
git add src/App.tsx src/components/Sidebar/Sidebar.tsx src/components/Map/MapView.tsx
git commit -m "feat(us-824): Layout mapa como protagonista — sidebar animado width 0/280"
```

---

## Task 5: US-821 — SidebarFilterPanel adaptivo por capas activas

**Files:**
- Create: `src/components/Sidebar/SidebarFilterPanel.tsx`
- Modify: `src/components/Sidebar/Sidebar.tsx`

**Interfaces:**
- Consumes: `activeLayers: ActiveLayers` de `useStore`; `FilterPanelClima` de `Header/FilterPanelClima.tsx`; `FilterPanelNests` de `Header/FilterPanelNests.tsx`
- Produces: componente `SidebarFilterPanel` que muestra secciones de filtros segun capas activas

- [ ] **Step 1: Crear `src/components/Sidebar/SidebarFilterPanel.tsx`**

```tsx
import { useStore } from '../../store/useStore'
import FilterPanelClima from '../Header/FilterPanelClima'
import FilterPanelNests from '../Header/FilterPanelNests'

const LAYER_COLORS = {
  clima: '#3b82f6',
  nidos: '#22c55e',
} as const

export default function SidebarFilterPanel() {
  const activeLayers = useStore((s) => s.activeLayers)
  const hasAny = activeLayers.clima || activeLayers.nidos

  return (
    <>
      <style>{`
        .sfp-root {
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .sfp-empty {
          padding: 10px 12px;
          font-size: 12px;
          color: var(--text-secondary);
          text-align: center;
          font-family: 'Exo 2', sans-serif;
        }

        .sfp-section {
          padding: 8px 12px;
        }

        .sfp-section + .sfp-section {
          border-top: 1px solid var(--border-default);
        }

        .sfp-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          font-family: 'Exo 2', sans-serif;
        }

        .sfp-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>

      <div className="sfp-root">
        {!hasAny && (
          <div className="sfp-empty">
            Activa una capa para ver filtros
          </div>
        )}

        {activeLayers.clima && (
          <div className="sfp-section">
            <div className="sfp-label" style={{ color: LAYER_COLORS.clima }}>
              <span className="sfp-dot" style={{ background: LAYER_COLORS.clima }} />
              Clima
            </div>
            <FilterPanelClima />
          </div>
        )}

        {activeLayers.nidos && (
          <div className="sfp-section">
            <div className="sfp-label" style={{ color: LAYER_COLORS.nidos }}>
              <span className="sfp-dot" style={{ background: LAYER_COLORS.nidos }} />
              Nidos
            </div>
            <FilterPanelNests />
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Integrar `SidebarFilterPanel` en `Sidebar.tsx`**

Agregar el import:
```tsx
import SidebarFilterPanel from './SidebarFilterPanel'
```

En el JSX, dentro de `.sb-content`, agregar antes del `LocationFeed`:
```tsx
        <div className="sb-content" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SidebarFilterPanel />
            {/* LocationFeed — se actualiza en Task 6 */}
            {activeLayers.clima && (
              <LocationFeed cities={cities} />
            )}
          </div>
        </div>
```

Agregar el consumo de `activeLayers` en Sidebar:
```tsx
  const activeLayers = useStore((s) => s.activeLayers)
```

Eliminar de Sidebar.tsx:
- `const activeTab = useStore((s) => s.activeTab)` 
- El `<Overlay isActive={activeTab === 'todo'} ...>` — ya no existe modo todo

- [ ] **Step 3: Verificar que FilterPanelClima y FilterPanelNests no rompieron**

`FilterPanelClima` usa clases CSS `.fp-root`, `.fp-filters`, etc. y `FilterPanelNests` usa `.fpn-root`. Ambos componentes tienen `height: 48px` en su raiz — dentro del sidebar esto puede verse comprimido. Verificar visualmente y si es necesario ajustar en sus `<style>`:

```css
/* En FilterPanelClima, cambiar .fp-root si es necesario: */
.fp-root {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;   /* wrap en lugar de overflow horizontal */
  height: auto;      /* auto en lugar de 48px fijo */
  padding: 4px 0;
}
```

Si se cambia, aplicar el mismo patron a `.fpn-root` en `FilterPanelNests.tsx`.

- [ ] **Step 4: Verificar TypeScript**

```powershell
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 5: Verificar en browser**

- Con solo Clima activo: solo seccion Clima visible en sidebar top
- Con solo Nidos activo: solo seccion Nidos
- Con ambos activos: ambas secciones con label de color
- Con ninguno activo: mensaje "Activa una capa para ver filtros"
- Los filtros funcionan (cambiar condicion filtra el feed)

- [ ] **Step 6: Commit**

```powershell
git add src/components/Sidebar/SidebarFilterPanel.tsx src/components/Sidebar/Sidebar.tsx
git commit -m "feat(us-821): Filtros adaptativos en sidebar por capas activas"
```

---

## Task 6: US-818 — Feed unificado y NestCard

**Files:**
- Create: `src/types/feed.ts`
- Create: `src/components/Sidebar/NestCard.tsx`
- Modify: `src/components/Sidebar/LocationFeed.tsx`
- Modify: `src/components/Sidebar/LocationCard.tsx`
- Modify: `src/components/Sidebar/Sidebar.tsx`

**Interfaces:**
- Consumes: `activeLayers`, `nests: Nest[]`, `cities: City[]` de `useStore`; tipo `Nest` de `src/types/nest.ts`
- Produces: `FeedItem` (tipo unificado); `LocationFeed` con lista unificada; `NestCard` para items de nido

- [ ] **Step 1: Verificar la estructura real del tipo `Nest`**

```powershell
Get-Content src/types/nest.ts
```

Anotar los campos disponibles. El feed unificado solo usa: `id`, `name`, `lat`, `lng` (ojo: el JSON usa `lng` no `lon`), campos de pokemon.

- [ ] **Step 2: Crear `src/types/feed.ts`**

```ts
import type { City } from '../store/useStore'
import type { Nest } from './nest'

export interface FeedItem {
  id: string
  name: string
  location: string      // ciudad, pais — para mostrar bajo el nombre
  lat: number
  lon: number
  climaData: City | null
  nidoData: Nest | null
}
```

- [ ] **Step 3: Crear `src/components/Sidebar/NestCard.tsx`**

```tsx
import { useStore } from '../../store/useStore'
import type { Nest } from '../../types/nest'
import { TYPE_IMAGES } from '../../config/pokemonTypes'

interface NestCardProps {
  nest: Nest
  isActive: boolean
}

export default function NestCard({ nest, isActive }: NestCardProps) {
  const setSelectedNest = useStore((s) => s.setSelectedNest)
  const selectedNest    = useStore((s) => s.selectedNest)

  const primaryType = Array.isArray(nest.pokemonType)
    ? nest.pokemonType[0]
    : (nest as any).type ?? ''

  return (
    <>
      <style>{`
        .nc-root {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          cursor: pointer;
          transition: background 150ms ease;
          background: transparent;
        }

        .nc-root:hover {
          background: var(--bg-tertiary);
        }

        .nc-root.nc-active {
          background: rgba(34, 197, 94, 0.08);
          border-color: rgba(34, 197, 94, 0.4);
        }

        .nc-sprite {
          width: 40px;
          height: 40px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .nc-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }

        .nc-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Exo 2', sans-serif;
        }

        .nc-location {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nc-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }

        .nc-type-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 500;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .nc-type-icon {
          width: 12px;
          height: 12px;
          object-fit: contain;
        }
      `}</style>

      <div
        className={`nc-root ${isActive ? 'nc-active' : ''}`}
        onClick={() => setSelectedNest(selectedNest?.id === nest.id ? null : nest)}
      >
        <img
          className="nc-sprite"
          src={`/pokemon/${(nest.pokemon ?? '').toLowerCase()}.png`}
          alt={nest.pokemon ?? nest.name}
          onError={(e) => { e.currentTarget.style.opacity = '0' }}
        />

        <div className="nc-body">
          <div className="nc-name">{nest.name}</div>
          <div className="nc-location">
            {[nest.city, nest.country].filter(Boolean).join(', ')}
          </div>
        </div>

        <div className="nc-right">
          {primaryType && (
            <span className="nc-type-pill">
              {TYPE_IMAGES[primaryType] && (
                <img
                  className="nc-type-icon"
                  src={TYPE_IMAGES[primaryType]}
                  alt={primaryType}
                />
              )}
              {primaryType}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Actualizar `LocationFeed.tsx` para feed unificado**

Reemplazar el contenido de `LocationFeed.tsx` para que soporte ambas capas. El componente recibe `cities` como prop (igual que ahora) pero ademas lee `nests` del store:

```tsx
import { useMemo, useEffect, useRef } from 'react'
import { useStore, type City } from '../../store/useStore'
import { calculateBadges } from '../../services/weather/weatherService'
import LocationCard from './LocationCard'
import NestCard from './NestCard'
import type { Nest } from '../../types/nest'

interface LocationFeedProps {
  cities: City[]
}

export default function LocationFeed({ cities }: LocationFeedProps) {
  const selectedCity    = useStore((s) => s.selectedCity)
  const selectedNest    = useStore((s) => s.selectedNest)
  const sidebarMode     = useStore((s) => s.sidebarMode)
  const favorites       = useStore((s) => s.favorites)
  const badgeFilter     = useStore((s) => s.badgeFilter)
  const loadingStatus   = useStore((s) => s.loadingStatus)
  const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter      = useStore((s) => s.typeFilter)
  const regionFilter    = useStore((s) => s.regionFilter)
  const activeLayers    = useStore((s) => s.activeLayers)
  const nests           = useStore((s) => s.nests)
  const nestTypeFilter  = useStore((s) => s.nestTypeFilter)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const activeFilterCount =
    (regionFilter !== 'todas' ? 1 : 0) +
    conditionFilter.length +
    typeFilter.length

  const badgesByCity = useMemo(() => {
    if (cities.length === 0) return new Map()
    const calc = calculateBadges(cities)
    const badges = new Map<string, string[]>()
    cities.forEach(city => badges.set(city.id, calc(city)))
    return badges
  }, [cities])

  const displayedCities = useMemo(() => {
    if (!activeLayers.clima) return []
    let result = [...cities]
    if (sidebarMode === 'favorites') {
      result = result.filter((c) => favorites.includes(c.id))
    }
    if (badgeFilter.length > 0) {
      result = result.filter(city => {
        const cityBadges = badgesByCity.get(city.id) || []
        return cityBadges.some((b: string) => badgeFilter.includes(b))
      })
    }
    return result
  }, [cities, sidebarMode, favorites, badgeFilter, badgesByCity, activeLayers.clima])

  const displayedNests = useMemo(() => {
    if (!activeLayers.nidos) return []
    if (nestTypeFilter.length === 0) return nests
    return nests.filter((nest) => {
      const types = Array.isArray(nest.pokemonType) ? nest.pokemonType : [(nest as any).type ?? '']
      return types.some((t: string) => nestTypeFilter.includes(t))
    })
  }, [nests, nestTypeFilter, activeLayers.nidos])

  const hasAny = activeLayers.clima || activeLayers.nidos
  const totalCount = displayedCities.length + displayedNests.length

  useEffect(() => {
    if (!selectedCity || !scrollContainerRef.current) return
    const activeCard = scrollContainerRef.current.querySelector(
      `[data-city-id="${selectedCity.id}"]`
    ) as HTMLElement | null
    if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedCity?.id])

  return (
    <>
      <style>{`
        .lf-root {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-default);
          overflow: hidden;
        }

        .lf-header {
          display: flex;
          align-items: center;
          padding: 0 8px;
          height: 28px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
          gap: 6px;
        }

        .lf-header-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: var(--text-secondary);
          flex: 1;
        }

        .lf-actions {
          display: none;
        }

        @media (max-width: 767px) {
          .lf-actions {
            display: flex;
            align-items: center;
            gap: 6px;
          }
        }

        .lf-action-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .lf-action-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        .lf-action-btn.active {
          background: rgba(88, 166, 255, 0.12);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .lf-action-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--ui-accent);
          color: var(--bg-primary);
          border-radius: 8px;
          font-size: 9px;
          font-weight: 700;
          min-width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 2px;
          pointer-events: none;
        }

        .lf-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
        }

        .lf-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: var(--text-secondary);
        }

        .lf-section-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 0 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .lf-section-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .lf-scroll::-webkit-scrollbar { width: 4px; }
        .lf-scroll::-webkit-scrollbar-track { background: transparent; }
        .lf-scroll::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
        .lf-scroll::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
      `}</style>

      <div className="lf-root">
        <div className="lf-header">
          <span className="lf-header-label">
            {sidebarMode === 'favorites' ? '⭐ Favoritos' : '📋 Lugares'} • {totalCount}
          </span>

          <div className="lf-actions">
            <button
              className={`lf-action-btn${activeFilterCount > 0 ? ' active' : ''}`}
              onClick={() => setIsFilterPanelOpen(true)}
              title="Filtros"
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <circle cx="8" cy="6" r="2" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <circle cx="16" cy="12" r="2" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="12" cy="18" r="2" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="lf-action-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {!hasAny ? (
          <div className="lf-empty">
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺</div>
              <div>Activa una capa para ver resultados</div>
            </div>
          </div>
        ) : totalCount === 0 ? (
          <div className="lf-empty">
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div>Sin resultados</div>
            </div>
          </div>
        ) : (
          <div
            className={`lf-scroll ${loadingStatus === 'loading' ? 'fade-refresh' : ''}`}
            ref={scrollContainerRef}
          >
            {activeLayers.clima && displayedCities.length > 0 && (
              <>
                {activeLayers.nidos && (
                  <div className="lf-section-label" style={{ color: '#3b82f6' }}>
                    <span className="lf-section-dot" style={{ background: '#3b82f6' }} />
                    Clima
                  </div>
                )}
                {displayedCities.map((city) => (
                  <div key={city.id} data-city-id={city.id}>
                    <LocationCard
                      city={city}
                      isActive={selectedCity?.id === city.id}
                    />
                  </div>
                ))}
              </>
            )}

            {activeLayers.nidos && displayedNests.length > 0 && (
              <>
                {activeLayers.clima && (
                  <div className="lf-section-label" style={{ color: '#22c55e' }}>
                    <span className="lf-section-dot" style={{ background: '#22c55e' }} />
                    Nidos
                  </div>
                )}
                {displayedNests.map((nest) => (
                  <NestCard
                    key={nest.id}
                    nest={nest}
                    isActive={selectedNest?.id === nest.id}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 5: Actualizar `Sidebar.tsx` — remover condicional de capa en LocationFeed**

El `LocationFeed` ahora maneja internamente que mostrar segun `activeLayers`. En `Sidebar.tsx`, simplificar:
```tsx
            {/* LocationFeed — maneja internamente clima y nidos */}
            <LocationFeed cities={cities} />
```
Eliminar el `{activeLayers.clima && <LocationFeed cities={cities} />}` que se puso en Task 5 Step 2.

- [ ] **Step 6: Verificar TypeScript**

```powershell
npx tsc --noEmit 2>&1 | head -40
```

Posibles errores: campos de `Nest` que no existen (ej: `nest.pokemon`, `nest.pokemonType`, `nest.city`). Verificar con el tipo real de `Nest` y ajustar `NestCard` y `LocationFeed` segun los campos disponibles.

- [ ] **Step 7: Verificar en browser**

- Con Clima activo: lista de ciudades con LocationCard
- Con Nidos activo: lista de nidos con NestCard
- Con ambos activos: ambas secciones con label de color separando
- Clic en NestCard selecciona el nido
- Sin capas activas: mensaje "Activa una capa para ver resultados"

- [ ] **Step 8: Verificar que no hay referencias a activeTab en ningun archivo**

```powershell
Select-String -Path "src/**/*.tsx","src/**/*.ts" -Pattern "activeTab" -Recurse | Where-Object { $_.Path -notmatch "archive" }
```

Resultado esperado: 0 matches fuera de archive.

- [ ] **Step 9: Commit**

```powershell
git add src/types/feed.ts src/components/Sidebar/NestCard.tsx src/components/Sidebar/LocationFeed.tsx src/components/Sidebar/Sidebar.tsx
git commit -m "feat(us-818): Feed unificado clima+nidos con NestCard"
```

---

## Task 7: Actualizar documentacion

**Files:**
- Replace: `src/docs/sprints/sprint-9/US/US-821.md`
- Replace: `src/docs/sprints/sprint-9/US/US-823.md`
- Replace: `src/docs/sprints/sprint-9/US/US-824.md`
- Replace: `src/docs/sprints/sprint-9/US/US-818.md`
- Replace: `src/docs/sprints/sprint-9/00-INDEX.md`
- Modify: `src/docs/sprints/sprint-9/decisions.md`

- [ ] **Step 1: Reemplazar los 5 archivos de US con las versiones de update-docs**

```powershell
Copy-Item "src/docs/sprints/sprint-9/update-docs/US-821.md" "src/docs/sprints/sprint-9/US/US-821.md" -Force
Copy-Item "src/docs/sprints/sprint-9/update-docs/US-823.md" "src/docs/sprints/sprint-9/US/US-823.md" -Force
Copy-Item "src/docs/sprints/sprint-9/update-docs/US-824.md" "src/docs/sprints/sprint-9/US/US-824.md" -Force
Copy-Item "src/docs/sprints/sprint-9/update-docs/US-818.md" "src/docs/sprints/sprint-9/US/US-818.md" -Force
Copy-Item "src/docs/sprints/sprint-9/update-docs/00-INDEX.md" "src/docs/sprints/sprint-9/00-INDEX.md" -Force
```

- [ ] **Step 2: Agregar US-826 al directorio /US/**

```powershell
Copy-Item "src/docs/sprints/sprint-9/update-docs/US-826.md" "src/docs/sprints/sprint-9/US/US-826.md"
```

- [ ] **Step 3: Agregar las decisiones DEC-901/902/903 a decisions.md**

Abrir `src/docs/sprints/sprint-9/decisions.md` y agregar al final el contenido completo del archivo `src/docs/sprints/sprint-9/update-docs/decisions.md`.

- [ ] **Step 4: Actualizar status de US en los archivos reemplazados**

En cada US reemplazada, cambiar `Status: Pendiente` → `Status: Done` y agregar la fecha de implementacion 2026-06-21.

- [ ] **Step 5: Commit**

```powershell
git add src/docs/
git commit -m "docs(sprint-9): Actualizar INDEX, US-818/821/823/824/826 y decisions post-sesion-3"
```

---

## Self-Review

### Spec coverage

| Requisito | Tarea |
|---|---|
| `activeTab` eliminado del store | Task 1 |
| `activeLayers` con 5 capas booleanas | Task 1 |
| `toggleLayer` y `setLayer` | Task 1 |
| localStorage `pwe-activeLayers` | Task 1 |
| `MapView` usa `activeLayers.clima/nidos` | Task 2 |
| `Header` sin consumo de `activeTab` | Task 2 |
| `FilterPanel` del Header vaciado | Task 2 |
| App limpia de toast/estado todo | Task 2 |
| `LayerToggles` con 5 botones en Header | Task 3 |
| Capas futuras disabled con tooltip | Task 3 |
| Layout sidebar ancho animado + mapa flex:1 | Task 4 |
| Z-index scale documentado | Task 4 |
| `SidebarFilterPanel` wrapper adaptivo | Task 5 |
| Filtros preservados al desactivar/reactivar capa | Task 5 (estado en Zustand, no local) |
| Feed unificado clima+nidos | Task 6 |
| `NestCard` con sprite, nombre, tipo | Task 6 |
| Labels de seccion con color por capa | Task 6 |
| Empty state sin capas activas | Task 6 |
| Docs actualizadas | Task 7 |
| No hay referencias a `activeTab` en codigo | Task 6 Step 8 |

### Gaps detectados

- **`FilterPanelClima` tiene `height: 48px` fijo** — dentro del sidebar esto puede causar overflow o que el componente se vea cortado. Task 5 Step 3 cubre el ajuste pero debe verificarse visualmente.
- **`Nest.pokemon` y `Nest.pokemonType`** — Task 6 Step 1 exige verificar el tipo real antes de escribir `NestCard`. Si los campos tienen nombres distintos (ej: `nest.pokemonName`, `nest.types`), ajustar en NestCard.
- **`LocationCard` no se modifica** — la nueva arquitectura no cambia `LocationCard` porque los items de clima siguen siendo `City`. El feed unificado de DEC-902 (tags por capa en cada card) es una evolucion futura; esta sesion solo muestra las dos listas separadas con label de color.

### Placeholder scan

Ningun step tiene "TBD", "TODO" o "implement later". Todos los snippets estan completos.

### Type consistency

- `LayerKey` definido en Task 1, consumido en Tasks 2, 3, 5 — consistente
- `ActiveLayers` definido en Task 1, consumido en Tasks 2, 3, 4, 5, 6 — consistente
- `toggleLayer(key: LayerKey)` definido en Task 1, llamado en Task 3 — consistente
- `FeedItem` definido en Task 6 Step 2 pero no es consumido por otros componentes en este plan — se crea como tipo de referencia para futuras iteraciones
- `NestCard` recibe `nest: Nest` e `isActive: boolean` — consumido en `LocationFeed` con esas props — consistente

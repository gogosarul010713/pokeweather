# 📱 Sprint 7 US-702: Mobile Layout (<768px) v2

**Status:** ✅ COMPLETED (2026-04-01)  
**Commit:** 64ca863 — feat(US-702): Mobile responsive layout v2

---

## Overview

Redefinición de US-702 con diseño mejorado para mobile. En lugar de simplemente adaptar el layout tablet, se implementó una arquitectura completamente nueva optimizada para teléfonos:

- **Split Layout Vertical:** Mapa 40vh + LocationFeed 60vh
- **FilterPanelModal:** Bottom-sheet modal para filtros (patrón familiar)
- **Header Compacto:** 60px (reducido de 80px)
- **Sidebar Oculto:** Completamente hidden en <768px

---

## Design Rationale

### Problema Original
Viewport mobile (~375px) muy estrecho para:
- Sidebar 280px + Map legible
- Filtros en header (difícil de alcanzar en phone)
- Header 80px consume espacio precioso

### Solución
**Split layout vertical** que prioriza:
1. **Mapa (40vh):** Visible siempre, taps interactivas en pins
2. **Lista (60vh):** Scroll principal, buscar ciudades
3. **Filtros (modal):** On-demand, no compite con contenido
4. **Header (60px):** Ultra-compacto, todos los controles caben

---

## Visual Design

### Mobile State (<768px)

```
┌─────────────────────────────────────────┐ (z-1001, h=60px)
│ 🔴 Logo  [🔍]  [⚙️] [☰] [📊] [🌙]      │ Header (compacto)
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐ (z-1, h=40vh)
│         🗺️ MAPA LEAFLET                │ Map (interactive)
│    (Pins clickeables, zoom ±)           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐ (z-1, h=60vh, scroll)
│ 📋 Ciudades • 5                          │ LocationFeed header
├─────────────────────────────────────────┤
│ 🌤️ Pier 39, San Francisco         ❤️   │ LocationCard
├─────────────────────────────────────────┤
│ ⛅ Times Square, New York          🤍   │ (clickeable)
├─────────────────────────────────────────┤
│ 🌧️ La Rambla, Barcelona           ❤️   │
└─────────────────────────────────────────┘
```

### FilterPanelModal (on-demand)

```
╔═════════════════════════════════════════╗ (z-500, bottom-sheet)
║               ───────  (drag handle)    ║
╠═════════════════════════════════════════╣
║  Filtrar ciudades                       ║
║  [Región ▼] [Clima (3) ▼]              ║ Dropdowns
╠═════════════════════════════════════════╣
║  ☀️ CONDICIONES CLIMÁTICAS              ║
║  [☀️ Soleado]  [⛅ Parcial]  [☁️ Nublado] ║
║  [🌫️ Niebla]   [🌧️ Lluvia]   [❄️ Nieve]  ║
║  [💨 Ventoso]                          ║
╠═════════════════════════════════════════╣
║  ⚡ TIPOS POKÉMON                       ║
║  Próximamente disponible                ║
╠═════════════════════════════════════════╣
║          ✓ APLICAR FILTROS             ║ Primary button
╠═════════════════════════════════════════╣
║  Filtros activos: 2  [Limpiar todos]   ║ Footer
╚═════════════════════════════════════════╝
```

---

## Implementation Details

### 1. FilterPanelModal Component (`src/components/UI/FilterPanelModal.tsx`)

**Features:**
- **Bottom-sheet pattern:** position fixed, bottom: 0, max-height 85vh
- **Drag handle:** Visual affordance (4px × 40px strip)
- **Backdrop:** Clickeable, z-index 499 (behind modal)
- **Animations:**
  - Modal: `slideUp 300ms ease` (transform translateY)
  - Backdrop: `fadeIn 200ms ease` (opacity)
- **Dropdowns:**
  - Región: CustomSelect (single-select)
  - Clima: CustomSelect (multi-select) + visual counter
- **Grid 3-cols:**
  - Climate conditions: 7 toggle buttons (☀️, ⛅, ☁️, etc.)
  - Types: Placeholder section ("Próximamente")
- **Actions:**
  - "Aplicar Filtros" button: Closes modal, filters persist
  - "Limpiar todos" button: Resets all filters, region to 'todas'
- **Footer Meta:** Shows "Filtros activos: N"

**Key Code:**
```tsx
interface FilterPanelModalProps {
  isOpen: boolean
  onClose: () => void
}

// Reads from store:
// - regionFilter (single string)
// - conditionFilter (array of strings)
// - setRegionFilter, setConditionFilter, clearConditions

// Actions:
// - handleToggleCondition() → add/remove from array
// - handleApply() → onClose()
// - handleClearAll() → reset filters + region
```

---

### 2. Store Updates (`src/store/useStore.ts`)

**New State:**
```typescript
isFilterPanelOpen: boolean = false
```

**New Actions:**
```typescript
setIsFilterPanelOpen: (open: boolean) => void
toggleFilterPanel: () => void
```

---

### 3. Mobile Layout CSS (`src/index.css`)

**Media Query:** `@media (max-width: 767px)`

**Header:**
```css
.hd-root {
  height: 60px;     /* 80px → 60px */
  padding: 0 8px;   /* reduced padding */
  gap: 8px;
}

.fp-root { display: none; }  /* FilterPanel hidden */
.hd-filter-btn { display: flex !important; }  /* ⚙️ visible */
```

**Layout Split:**
```css
.app-body {
  flex-direction: column;  /* vertical */
  height: calc(100vh - 60px);
}

.app-map-area {
  height: 40vh;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-default);
}

.lf-root {
  height: 60vh;
  flex: 1;
  overflow-y: auto;
}
```

**Sidebar:**
```css
.sb-root { display: none; }  /* completely hidden */
```

---

### 4. Header Button (`src/components/Header/Header.tsx`)

**New Button:**
```tsx
<button
  className="hd-filter-btn"     // display: none → flex @media
  onClick={() => setIsFilterPanelOpen(true)}
  aria-label="Open filters panel"
  title="Filtros"
>
  ⚙️
</button>
```

**Styling:**
```css
.hd-filter-btn {
  display: none;  /* hidden on desktop/tablet */
  width: 32px;
  height: 32px;
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  cursor: pointer;
  transition: background 200ms ease;
}

@media (max-width: 767px) {
  .hd-filter-btn { display: flex !important; }
}
```

---

### 5. LocationFeed Mobile CSS

**Compact spacing in mobile:**
```css
@media (max-width: 767px) {
  .lf-header {
    padding: 10px 8px;
    font-size: 12px;
  }
  .lf-scroll {
    gap: 6px;
    padding: 6px;
  }
  .lf-empty {
    padding: 16px;
  }
}
```

---

## Z-index Stack

| Layer | z-index | Component | Purpose |
|-------|---------|-----------|---------|
| 0 | 1 | MapView | Base layer |
| 1 | 1 | LocationFeed | List container |
| 2 | 499 | FilterPanelBackdrop | Backdrop (behind modal) |
| 3 | 500 | FilterPanelModal | Bottom-sheet modal |
| 4 | 500 | LocationDetailModal | Modal (same z, mutually exclusive) |
| 5 | 1001 | Header | Always on top |

---

## Interaction Flow

### Initial State
1. Mapa 40% + LocationFeed 60% visible
2. User can scroll list, see pins on map

### Open Filters (click ⚙️)
1. Backdrop fades in (z-499)
2. Modal slides up (z-500)
3. User selects filters interactively
4. Contador "Filtros activos: N" updates in real-time

### Apply or Close
- **Click "Aplicar"** → Modal closes, filters persist
- **Click backdrop** → Modal closes, filters persist
- **Click "Limpiar todos"** → Resets, modal stays open

### Reactive Filtering
- After modal closes, LocationFeed updates filtered cities
- Map pins update reactively (no page reload)

---

## Responsive Behavior

| Breakpoint | Layout | Sidebar | FilterPanel | Header |
|------------|--------|---------|-------------|--------|
| **≥1024px** | Row (sidebar + map) | Visible | In header | 80px |
| **768–1023px** | Row + drawer | Drawer overlay | In header + hidden | 80px |
| **<768px** | Column (map 40% + list 60%) | Hidden | Bottom-sheet modal | 60px |

---

## Performance Considerations

### Animations
- **Transform:** `translateY()` for modal (GPU accelerated)
- **Opacity:** `fadeIn` for backdrop (cheap)
- **Duration:** 300ms slideUp + 200ms fadeIn = smooth but snappy
- **No layout shifts:** Fixed positioning avoids reflows

### Rendering
- **FilterPanelModal:** Only renders when `isOpen=true`
- **App.tsx:** Always renders (conditional visibility)
- **No prop drilling:** Uses Zustand store for state

### Mobile Viewport
- **Header:** 60px ↓ from 80px = 3.3% extra screen space
- **LocationFeed:** Scrolleable, uses overflow-y auto
- **Map:** 40vh = ~160–192px depending on device

---

## Testing Checklist

✅ **Desktop (≥1024px)**
- Sidebar visible (no changes from Sprint 6)
- FilterPanel in header
- ⚙️ button NOT visible (CSS display: none)
- Header 80px

✅ **Tablet (768–1023px)**
- Drawer sidebar (US-701)
- Toggle button (≡) visible
- FilterPanel hidden (CSS display: none)
- Header 80px

✅ **Mobile (<768px)**
- Header 60px (reduced from 80px)
- Layout: Mapa 40vh + LocationFeed 60vh (vertical)
- ⚙️ button visible in header
- FilterPanel hidden (modal replaces it)
- Sidebar hidden (display: none)
- Click ⚙️ → FilterPanelModal appears
- Grid 3-cols: Climate conditions clickeable
- Click "Aplicar" → modal closes, filters apply
- Click backdrop → modal closes
- LocationFeed scrolleable
- Auto-scroll to selected city works

✅ **Animations**
- Modal slideUp: 300ms smooth
- Backdrop fadeIn: 200ms smooth
- No jank, GPU-accelerated

✅ **Build**
- `npm run build` ✅ PASS
- No TS errors
- CSS media queries valid

---

## Commands

```bash
# Build
npm run build

# Dev server
npm run dev

# DevTools testing (F12):
# 1. Toggle device toolbar (Ctrl+Shift+M)
# 2. Set viewport to 375px width (iPhone SE)
# 3. Test each interaction above
# 4. Resize to 768px, 1024px, 1200px to verify transitions
```

---

## Key Decisions

**Why split 40/60 vs 50/50?**
- Mapa 40vh = sufficient to see region, zoom controls
- Lista 60vh = dominant in mobile, primary user action is finding cities
- Ratio optimized for UX: "find city then see on map"

**Why bottom-sheet modal vs inline?**
- Mobile screen ~375px too narrow for inline filters
- Drawer/modal pattern reduces clutter
- Familiar to users (iOS/Android standard)
- Patrón reutilizable para futuras features

**Why header reduce de 80px a 60px?**
- Mobile: 20px = ~3.3% extra usable space
- 60px aún legible, botones visible
- FilterPanel se mueve a modal, libera espacio horizontal

**Why sidebar completely oculto?**
- <768px no hay espacio para drawer
- LocationFeed en main area + modals = completo
- Hamburguesa ≡ (<1024px) innecesaria en mobile

---

## Sprint 7 Completion

| US | Fase | Status | Commit |
|----|------|--------|--------|
| US-701 | 1 (Tablet) | ✅ | 2180ddc |
| US-702 | 3 (Mobile) | ✅ | 64ca863 |

**Responsive Status:** 100% complete
- Desktop: ✅
- Tablet: ✅
- Mobile: ✅

---

## Next Steps

1. **Mobile refinements (if needed):**
   - Test on actual devices (iOS/Android)
   - Tune animation timings
   - Adjust spacing based on feedback

2. **Accessibility improvements:**
   - Add ARIA labels to FilterPanelModal
   - Keyboard navigation in grids
   - Focus management (trap in modal)

3. **Performance monitoring:**
   - Measure modal open/close latency
   - Profile scrolling performance (LocationFeed)
   - Check bundle size impact

4. **Feature additions (future sprints):**
   - Types filter (currently placeholder)
   - Swipe-to-dismiss modal (Framer Motion?)
   - Persistent filter state (localStorage?)

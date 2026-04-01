# 📱 Mobile Filters Architecture — MT-2.3-EARLY

**Status:** ✅ COMPLETED (2026-04-01)  
**Commit:** (pending)

---

## Overview

Implementación de FilterPanelModal (bottom-sheet) para mobile, resolviendo el problema de overflow de filtros en Header. Los filtros ahora tienen dos interfaces:
- **Desktop/Tablet (≥768px):** FilterPanel inline en Header (original)
- **Mobile (<768px):** FilterPanelModal bottom-sheet (new)

---

## Architecture

### Components

#### 1. **FilterPanel** (Desktop/Tablet)
- **Location:** `src/components/Header/FilterPanel.tsx`
- **Behavior:** Inline en Header, siempre visible
- **Media Query:** `display: none` en mobile (<768px)
- **Contains:**
  - CustomSelect (Región)
  - CustomSelect (Clima multi-select)
  - CustomSelect (Ordenar)
  - SearchInput

#### 2. **FilterPanelModal** (Mobile)
- **Location:** `src/components/UI/FilterPanelModal.tsx`
- **Behavior:** Bottom-sheet modal, on-demand
- **Trigger:** Button ⚙️ en Header (mobile only)
- **Features:**
  - Drag handle (visual affordance)
  - Región dropdown
  - Clima grid (3 cols, toggles)
  - Pokémon types (placeholder)
  - Aplicar Filtros button
  - Limpiar Todos link
  - Filter count badge

#### 3. **Header Updates**
- **File:** `src/components/Header/Header.tsx`
- **Changes:**
  - Import FilterPanelModal
  - Render filter button (mobile only)
  - Wrap FilterPanel en div con clase "hd-filter-panel"
  - Show/hide via media queries

#### 4. **Store Updates**
- **File:** `src/store/useStore.ts`
- **New State:** `isFilterPanelOpen: boolean`
- **New Action:** `setIsFilterPanelOpen(open: boolean)`

---

## Visual Design

### Mobile (<768px)

```
┌────────────────────────────────────┐
│ Logo  [🔍]  [⚙️] [📊] [🌙]         │ Header 80px
└────────────────────────────────────┘
  ⚙️ = Filter button (badge shows count if > 0)
```

### FilterPanelModal (Bottom-Sheet)

```
╔════════════════════════════════════╗ z-500
║          ───────────────  (handle) ║
╠════════════════════════════════════╣
║  [Región ▼]                        ║ Dropdowns
╠════════════════════════════════════╣
║  ☀️ CONDICIONES CLIMÁTICAS         ║
║  [☀️] [⛅] [☁️]                     ║ Grid 3 cols
║  [🌫️] [🌧️] [❄️]                     ║
║  [💨]                              ║
╠════════════════════════════════════╣
║  ⚡ TIPOS POKÉMON                  ║
║  Próximamente disponible           ║
╠════════════════════════════════════╣
║      ✓ APLICAR FILTROS            ║ Primary button
╠════════════════════════════════════╣
║  Filtros: 0  [Limpiar Todos]      ║ Footer meta
╚════════════════════════════════════╝
```

### Desktop/Tablet (≥768px)

```
┌────────────────────────────────────┐
│ Logo [Región▼][Clima▼][Ordenar▼][🔍] │ Header 80px
│              (FilterPanel inline)    │
└────────────────────────────────────┘
```

---

## CSS Media Queries

### Mobile (<768px)

```css
@media (max-width: 767px) {
  .hd-filter-btn {
    display: flex;  /* Show button */
  }

  .hd-filter-panel {
    display: none;  /* Hide inline FilterPanel */
  }
}
```

### Desktop/Tablet (≥768px)

```css
/* Default: FilterPanel visible, button hidden */
.hd-filter-btn { display: none; }
.hd-filter-panel { display: flex; } /* implicit */
```

---

## State Management

### Zustand Store (`useStore.ts`)

```typescript
// State
isFilterPanelOpen: boolean = false

// Action
setIsFilterPanelOpen: (open: boolean) => void
```

### Usage in Header

```tsx
const isFilterPanelOpen = useStore((s) => s.isFilterPanelOpen)
const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)

// Open modal
<button onClick={() => setIsFilterPanelOpen(true)}>⚙️</button>

// Close modal
<FilterPanelModal
  isOpen={isFilterPanelOpen}
  onClose={() => setIsFilterPanelOpen(false)}
/>
```

---

## Interactions

### Open Filter Modal (Mobile)
1. User taps ⚙️ button in Header
2. `setIsFilterPanelOpen(true)` in store
3. FilterPanelModal renders with slide-up animation (300ms)

### Apply Filters
1. User selects region, climate conditions
2. Clicks "Aplicar Filtros" button
3. Modal closes: `onClose()` → `setIsFilterPanelOpen(false)`
4. Filters persist in store (shared with LocationFeed)

### Clear All Filters
1. Click "Limpiar Todos" link
2. Reset `regionFilter → 'todas'`
3. Reset `conditionFilter → []`
4. Modal stays open for further adjustments

### Close without Applying
1. Tap backdrop
2. Modal slides down, closes

---

## Animation Details

### Modal Entry (slideUp)
```css
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
animation: slideUp 300ms ease;
```

### Backdrop (fadeIn)
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 200ms ease;
```

---

## Z-Index Stack (Mobile)

```
z-500  FilterPanelModal + Backdrop
z-499  Backdrop (dark overlay)
z-1001 Header
z-0    Map + LocationFeed
```

---

## Implementation Details

### FilterPanelModal Props

```typescript
interface FilterPanelModalProps {
  isOpen: boolean
  onClose: () => void
}
```

### FilterPanelModal Reads from Store
- `regionFilter` (current value)
- `conditionFilter` (array of selected)
- `setRegionFilter` (setter)
- `setConditionFilter` (setter)
- `clearConditions` (reset)

### Condition Button Behavior

```tsx
.fpm-condition-btn.active {
  background: rgba(88, 166, 255, 0.2);
  border-color: var(--ui-accent);
  color: var(--ui-accent);
}

// Toggle logic
if (isActive) {
  remove from array
} else {
  add to array
}
```

---

## Filter Count Badge

**When shown:** conditionFilter.length > 0  
**Position:** Top-right of ⚙️ button  
**Color:** Error red (–ui-error)  
**Size:** 20×20px, centered count

---

## Known Limitations

1. **Pokémon Types:** Placeholder section, not yet implemented
   - Reserved space in modal
   - Shows "Próximamente disponible"

2. **Search:** Not in FilterPanelModal
   - SearchInput remains in Header FilterPanel (desktop)
   - Mobile users search via LocationFeed list scroll

3. **Sort Mode:** Not in FilterPanelModal
   - Only available in desktop FilterPanel
   - Can be added to modal in future sprint

---

## Testing Checklist

- [ ] Mobile (<768px): ⚙️ button visible, FilterPanel hidden
- [ ] Desktop (≥768px): ⚙️ button hidden, FilterPanel visible
- [ ] Click ⚙️ → modal opens with slide-up animation
- [ ] Click condition buttons → toggle active state
- [ ] Click "Aplicar Filtros" → modal closes, filters apply
- [ ] Click "Limpiar Todos" → reset region + conditions
- [ ] Tap backdrop → modal closes
- [ ] Filter badge shows count when > 0
- [ ] Drag handle visible (visual affordance)
- [ ] Z-index correct (modal above header)

---

## Future Improvements

1. **Drag-to-dismiss:** Implement actual drag on handle to close
2. **Pokémon types:** Implement badge-style toggles for types
3. **Persist modal size:** Remember last opened height
4. **Search in modal:** Add SearchInput to FilterPanelModal
5. **Sort in modal:** Add sort options to mobile interface

---

## Related Files

- `src/components/UI/FilterPanelModal.tsx` — New bottom-sheet component
- `src/components/Header/Header.tsx` — Updated with filter button + modal
- `src/store/useStore.ts` — New `isFilterPanelOpen` state
- `src/docs/28-us702-mobile-responsive.md` — Original design reference

---

## References

- **Design Spec:** `28-us702-mobile-responsive.md` (FilterPanelModal section, lines 59-80)
- **Bottom-Sheet Pattern:** Material Design guidelines
- **Animations:** 300ms slide-up (standard mobile UX)

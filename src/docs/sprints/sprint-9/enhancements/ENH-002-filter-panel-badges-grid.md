# ENH-002 — Filter Panel: badges por grupo + grid compacto

**Estado:** Completado ✅ (sesion 7 ampliado, 2026-07-13)  
**Branch:** `sprint-9-nests`  
**Archivos a tocar:** `AccordionSection.tsx`, `PillsGrid.tsx`, `FilterPanel.tsx`

---

## Contexto

Cambios visuales sobre el filter panel existente (post ENH-001). No requieren nuevos componentes.

Mockups de referencia: `src/docs/mockups/filtersdesign/filterchanges/`

---

## Cambios a implementar

### B — Unificar color de badges al color del grupo

**Problema:** `.fp-accordion-badge` en `AccordionSection.tsx:45` usa siempre `#58a6ff` (azul clima). Los badges en secciones de Nidos deben ser verdes.

**Solucion:** Agregar prop `accentColor` a `AccordionSection`. Usarlo en `.fp-accordion-badge` como `background`.

```tsx
// AccordionSection — prop nuevo
accentColor?: string  // default: '#58a6ff'

// badge inline style
style={{ background: accentColor ?? '#58a6ff' }}
```

`FilterPanel` pasa `accentColor="#58a6ff"` a los 4 acordeones de Clima y `accentColor="#22c55e"` a los 2 de Nidos.

---

### C — Grid 4 columnas + iconos 24px

**Problema:** `PillsGrid` con `cols={3}` e iconos de tipo en 28px — demasiado espacio, muy saturado.

**Cambios:**

- `PillsGrid.tsx` — `.fp-pill-img-type`: `28px → 24px`
- `FilterPanel.tsx` — seccion Tipo Clima y Tipo Pokemon: `cols={3} → cols={4}`
- Padding de `.fp-pill`: `6px 4px → 6px 2px` (spec del mockup)

---

### D — Tipos activos usan color del grupo

**Problema:** `.fp-pill.active` en `PillsGrid.tsx:46-49` hardcodea `#58a6ff`. Los tipos en secciones de Nidos activos deben ser verdes.

**Solucion:** Agregar prop `accentColor` a `PillsGrid`. Aplicarlo via `style` inline en el estado activo.

```tsx
// PillsGrid — prop nuevo
accentColor?: string  // default: '#58a6ff'

// pill activo — inline style reemplaza la clase .active
style={isActive ? {
  background: `rgba(${accentColor === '#22c55e' ? '34,197,94' : '88,166,255'}, 0.15)`,
  borderColor: accentColor,
  color: accentColor,
} : undefined}
```

Alternativa mas limpia: calcular `accentRgb` en el padre y pasarlo como prop adicional.

---

### Pill de sub-seccion visible solo cuando colapsado

**Problema:** `badgeText` en `AccordionSection` es siempre visible. Debe ocultarse cuando la seccion esta expandida.

**Regla:**
- Seccion expandida (`isOpen=true`) → pill oculto
- Seccion colapsada (`isOpen=false`) → pill visible

**Implementacion:**

```tsx
// En AccordionSection, reemplazar el span del badge por:
<div style={{
  overflow: 'hidden',
  maxHeight: isOpen ? '0px' : '22px',
  opacity: isOpen ? 0 : 1,
  transition: 'max-height 0.22s ease, opacity 0.18s ease',
  display: 'inline-flex',
}}>
  {badgeText && (
    <span className="fp-accordion-badge" style={{ background: accentColor ?? '#58a6ff' }}>
      {badgeText}
    </span>
  )}
</div>
```

**Estilo del pill cuando colapsado (segun spec):**
- `background`: color solido del grupo (`#58a6ff` / `#22c55e`)
- `color`: `#fff`
- `border-radius`: 10px
- `padding`: 2px 7px
- `font`: 700 9px 'Exo 2'

---

## Checklist de implementacion

- [x] `AccordionSection` — prop `accentColor?: string`
- [x] `AccordionSection` — badge usa `accentColor` en background
- [x] `AccordionSection` — badge animado: oculto cuando `isOpen`, visible cuando cerrado
- [x] `PillsGrid` — prop `accentColor?: string`
- [x] `PillsGrid` — estado activo usa `accentColor` para border/bg/color
- [x] `PillsGrid` — `.fp-pill-img-type`: 28px → 24px
- [x] `PillsGrid` — `.fp-pill` padding: 6px 4px → 6px 2px
- [x] `FilterPanel` — acordeones Clima reciben `accentColor="#58a6ff"`
- [x] `FilterPanel` — acordeones Nidos reciben `accentColor="#22c55e"`
- [x] `FilterPanel` — Tipo Clima y Tipo Pokemon: `cols={3} → cols={4}`
- [x] `FilterPanel` — `PillsGrid` de Clima y Nidos reciben `accentColor` correspondiente

---

## Observaciones post-implementacion

### OBS-1 — Summary del grupo muestra estado aplicado, no draft en vivo

**Problema:** `climaSummaryText` y `nidosSummaryText` se calculan desde `conditionFilter`, `regionFilter`, `typeFilter`, `sortMode`, `nestTypeFilter`, `nestSortBy` (filtros aplicados). Al colapsar el grupo mientras hay cambios sin aplicar, el pill muestra el estado anterior.

**Fix:** Recalcular desde `draftFilters` en vez de los filtros aplicados. Igual para `climaBadgeCount` y `nidosBadgeCount`.

```tsx
// Antes (usa filtros aplicados)
const climaSummaryText = buildClimaSummary(conditionFilter, regionFilter, sortMode)
const climaBadgeCount = conditionFilter.length + (regionFilter !== 'todas' ? 1 : 0) + typeFilter.length + (sortMode !== '' ? 1 : 0)

// Despues (usa draft — refleja cambios en vivo)
const climaSummaryText = buildClimaSummary(draftFilters.condition, draftFilters.region, draftFilters.sortMode)
const climaBadgeCount = draftFilters.condition.length + (draftFilters.region !== 'todas' ? 1 : 0) + draftFilters.type.length + (draftFilters.sortMode !== '' ? 1 : 0)

const nidosSummaryText = buildNidosSummary(draftFilters.nestType, draftFilters.nestSortBy)
const nidosBadgeCount = draftFilters.nestType.length + (draftFilters.nestSortBy !== 'name' ? 1 : 0)
```

---

### OBS-2 — Emojis en headers de acordeon y lista de ordenar

**Problema:** Los headers de `AccordionSection` tienen emojis via prop `icon` (⛅, 🌐, 🌡️, ↕️, ⚡) y `SORT_CLIMA_ITEMS` tiene emojis en los labels (🔤, 📊, ⭐, 🕐). Ruido visual innecesario.

**Fix:** Quitar prop `icon` de todos los `AccordionSection` en `FilterPanel`. Limpiar labels de `SORT_CLIMA_ITEMS`.

```tsx
// SORT_CLIMA_ITEMS — antes
{ value: '',        label: '🔤 Sin orden' },
{ value: 'name',    label: '🔤 Nombre' },
{ value: 'density', label: '📊 Densidad' },
{ value: 'rating',  label: '⭐ Rating' },
{ value: 'time',    label: '🕐 Hora Local' },

// SORT_CLIMA_ITEMS — despues
{ value: '',        label: 'Sin orden' },
{ value: 'name',    label: 'Nombre' },
{ value: 'density', label: 'Densidad' },
{ value: 'rating',  label: 'Rating' },
{ value: 'time',    label: 'Hora Local' },
```

No se tocan: emojis en pills de condicion clima, ni el summary text del pill grupal.

---

## Lo que NO cambia

- Logica de filtros, store, draft state
- Animaciones del panel overlay
- Footer y toast

---

## Sesion 7 — Cambios adicionales (2026-07-13)

**Referencia:** `Filter Panel Final.dc.html` — proyecto "Copy of Variantes filtros Pokeweather" en claude.ai/design

### E — Indicador contextual por fila en AccordionSection

Reemplaza el `badgeText` fijo (texto en pill siempre igual). El nuevo comportamiento es contextual segun cuantos valores estan activos en esa seccion.

**Regla:**
| Activos | Indicador |
|---|---|
| 0 | Nada (solo flecha ▼) |
| 1 | Texto del valor con emoji: `☀️ Soleado` |
| 2+ | Badge numerico del color del grupo: `3` |

**Props nuevas en `AccordionSection`:**
```tsx
activeValues?: string[]   // valores seleccionados activos
activeLabel?: string      // etiqueta pre-formateada para el caso de 1 activo
```

**Visual badge numerico (2+ activos):**
- `min-width: 18px; height: 18px; border-radius: 9px`
- Clima: `background: rgba(88,166,255,.15)`, `border: 1px solid rgba(88,166,255,.3)`, `color: #58a6ff`
- Nidos: `background: rgba(34,197,94,.15)`, `border: 1px solid rgba(34,197,94,.3)`, `color: #22c55e`

**Visual texto (1 activo):**
- `font: 600 10px/1 'Exo 2'`, `color: ${accentColor}B3` (70% opacidad)

**Archivo:** `src/components/Sidebar/filters/AccordionSection.tsx`

---

### F — Chips scrolleables debajo del boton Filtros (panel cerrado)

Cuando el panel de filtros esta cerrado y hay filtros aplicados, aparece una fila horizontal de chips debajo del boton "Filtros". Cada chip representa un filtro activo y permite quitarlo sin abrir el panel.

**Comportamiento:**
- Visible solo cuando `!filterPanelOpen && activeChips.length > 0`
- Scroll horizontal sin scrollbar visible (`scrollbar-width: none`)
- Chips ordenados: primero clima, luego nidos

**Estructura de cada chip:**
```
[emoji] [label] [contador?] [×]
```

- 1 valor activo en un filtro → chip con emoji + label (ej: `☀️ Soleado`)
- 2+ valores en un filtro → chip con emoji + label categoria + contador interno (ej: `⚡ Tipos 3`)
- Click en `×` limpia ese filtro especifico sin afectar los demas

**Color por grupo:**
- Clima: `background: rgba(88,166,255,.12)`, `border: 1px solid rgba(88,166,255,.25)`, `color: #58a6ff`
- Nidos: `background: rgba(34,197,94,.10)`, `border: 1px solid rgba(34,197,94,.25)`, `color: #22c55e`

**Contador interno (multi-seleccion):**
- Pill dentro del chip: `min-width: 14px; height: 14px; border-radius: 7px`
- Clima: `background: rgba(88,166,255,.25)`, Nidos: `background: rgba(34,197,94,.25)`

**Zero-state:** si no hay filtros activos, la fila no se renderiza (no ocupa espacio).

**Archivo:** `src/components/Sidebar/FilterPanel.tsx` — interfaz `ActiveChip[]` + seccion `.fsp-chips-row`

---

## Checklist actualizado (sesion 7)

- [x] `AccordionSection` — prop `activeValues?: string[]`
- [x] `AccordionSection` — prop `activeLabel?: string`
- [x] `AccordionSection` — 0 activos: solo flecha, sin indicador
- [x] `AccordionSection` — 1 activo: texto del valor con emoji
- [x] `AccordionSection` — 2+ activos: badge numerico del color del grupo
- [x] `FilterPanel` — interfaz `ActiveChip` con key, emoji, label, count, group, onRemove
- [x] `FilterPanel` — chips construidos desde filtros aplicados (no draft)
- [x] `FilterPanel` — fila `.fsp-chips-row` scrolleable sin scrollbar
- [x] `FilterPanel` — chips visibles solo cuando panel cerrado y hay filtros
- [x] `FilterPanel` — × de cada chip llama al setter correspondiente para limpiar ese filtro

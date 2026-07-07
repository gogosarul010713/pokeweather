# Handoff: Filter Panel — PokéWeather Sidebar

## Overview

This package describes the **sidebar filter panel** for PokéWeather. The panel is triggered by a button in the sidebar, slides over the city list (keeping the map always visible), and contains grouped accordion sections that appear conditionally based on the active tab (Clima / Nidos).

---

## About the Design Files

The files in this bundle are **HTML design references** — interactive prototypes showing the intended look and behavior. They are **not production code**. Your task is to recreate this UI inside your existing React + Zustand codebase, using your existing DS components (`_ds_bundle.js`) and CSS tokens (`_ds_bundle.css`).

The prototype uses a mock city list and fake map. Ignore those — your app has the real data and map.

## Fidelity

**High-fidelity.** Colors, typography, spacing, interactions, and transitions are all final. Recreate pixel-perfectly using your existing DS tokens and component library.

---

## Screens / Views

### View A — Sidebar: Default (list view)

The sidebar shows:

1. **Search input** (top, full width minus 10px padding each side)
   - Height: 34px · Border-radius: 8px · Background: `var(--bg-primary)` · Border: `1px solid var(--border-default)`
   - Padding left: 10px icon + 7px gap + text

2. **Filter trigger button row** (below search, full width minus 10px padding)
   - Main button: `flex:1` · Height: 40px · Background: `var(--ui-accent)` · Border-radius: 10px
   - Contains: filter SVG icon (14×14, white) + "Filtros" label (font: `700 13px 'Exo 2'`, white) + badge (when filters active)
   - Badge: white pill, `var(--ui-accent)` text, height 18px, border-radius 9px, font `700 10px`
   - Box-shadow: `0 2px 12px rgba(88,166,255,0.25)`
   - Clear button (only when filters active): 40×40px square, `var(--bg-primary)`, border `1px solid var(--border-default)`, border-radius 10px, ✕ SVG icon

3. **Cities header row**: label "CIUDADES" (`700 10px Rajdhani`, uppercase, `var(--text-secondary)`) + count badge in `var(--ui-accent)`

4. **City list** (scrollable, fills remaining space): city cards per your existing `LocationCard` component

---

### View B — Sidebar: Filter Panel (slides in from right)

Triggered by the filter button. Slides over the list view using CSS transform. Map stays 100% visible.

**Transition:** `transform 0.32s cubic-bezier(0.16,1,0.3,1)` — list slides to `translateX(-100%)`, panel slides from `translateX(100%)` to `translateX(0)`.

#### Panel Header
- Height: ~48px · Border-bottom: `1px solid var(--border-default)` · Padding: 10px 12px
- Left: **← Volver** button (`500 12px 'Exo 2'`, `var(--text-secondary)`, no border, border-radius 6px)
- Center: **"FILTROS"** (`700 13px Rajdhani`, uppercase, letter-spacing 0.08em)
- Right: **"Limpiar"** button (`500 11px 'Exo 2'`, `var(--text-secondary)`, opacity 0.7)

#### Group Headers (non-interactive, visual only)

Each category group has a colored group header before its accordion sections:

**Clima group header:**
```
background: linear-gradient(90deg, rgba(88,166,255,0.08) 0%, transparent 100%)
border-bottom: 1px solid rgba(88,166,255,0.15)
padding: 10px 14px 6px
```
- Vertical bar: `width:3px · height:28px · border-radius:2px · background:#58a6ff`
- Title: `700 11px Rajdhani · color:#58a6ff · uppercase · letter-spacing:0.14em` → "FILTROS DE CLIMA"
- Subtitle: `400 10px 'Exo 2' · var(--text-secondary) · opacity:0.7` → "Condición · Región · Tipo · Orden"

**Nidos group header:** same pattern with `#22c55e` / `rgba(34,197,94,...)`

#### Accordion Sections

Each section shares this structure:

**Header button** (full width, `padding: 10px 14px`, no background, no border):
- Left: icon pill (26×26px, border-radius 7px, color-tinted bg) + title + subtitle description
- Right: active badge (optional) + ▲/▼ arrow

**Icon pill per section:**
| Section | Icon | BG color |
|---|---|---|
| Condición | ⛅ | `rgba(88,166,255,0.12)` |
| Región | 🌐 | `rgba(88,166,255,0.12)` |
| Tipo Clima | 🌡 | `rgba(88,166,255,0.12)` |
| Ordenar (Clima) | ↕ | `rgba(88,166,255,0.12)` |
| Tipo Pokémon | ⚡ | `rgba(34,197,94,0.12)` |
| Ordenar (Nidos) | ↕ | `rgba(34,197,94,0.12)` |

---

## Filter Content: Pills & Controls

### Condición Climática
Grid 4 columns, gap 6px. Each pill: flex-column, 8px padding, border-radius 9px, border 1.5px.

**Active state:** `background: rgba(88,166,255,0.15)` · `border-color: #58a6ff` · `color: #58a6ff`
**Inactive:** `background: var(--bg-tertiary)` · `border-color: var(--border-default)` · `color: var(--text-secondary)`

Items: ☀️ Soleado · ⛅ Parcial · ☁️ Nublado · 🌫 Niebla · 🌧 Lluvia · ❄️ Nieve · 💨 Ventoso
Multi-select (array state).

### Región
Flex-wrap row, gap 6px. Pills height 30px, border-radius 15px, `500 11px 'Exo 2'`.
Same active/inactive colors as Condición. Single-select (string state, default `'todas'`).
Items: 🌐 Todas · 🌏 Asia · 🌍 Europa · 🌎 América · 🌏 Oceanía · 🌍 África

### Tipo Clima
Flex-wrap row, gap 6px. Same pill style as Región. Single-select.
Items: Todos · Tropical · Seco · Templado · Polar

### Ordenar (Clima)
Vertical radio list, gap 4px. Each row: `padding 9px 12px`, border-radius 8px, border 1px.
**Active:** `background: rgba(88,166,255,0.08)` · `border: rgba(88,166,255,0.3)` · radio dot fills `#58a6ff`
Radio circle: 16×16px, border-radius 50%, border 2px. Inner dot: 7×7px when active.
Items: Sin orden · Nombre · Densidad · Raid activo · Hora Local

### Tipo Pokémon
Grid 3 columns, gap 6px. Each pill: flex-column, 8px 4px padding, border-radius 9px, border 1.5px.
Contains: colored circle (22×22px, border-radius 50%) with type emoji + type name below.
**Active:** border = type color · `background: rgba(255,255,255,0.06)`
Multi-select (array state).

Type colors:
| Type | Color |
|---|---|
| Fire | `#ef4444` |
| Water | `#3b82f6` |
| Grass | `#22c55e` |
| Electric | `#eab308` |
| Ice | `#67e8f9` |
| Dragon | `#7c3aed` |
| Psychic | `#ec4899` |
| Dark | `#6b7280` |
| Ghost | `#8b5cf6` |
| Ground | `#d97706` |
| Normal | `#9ca3af` |
| Fairy | `#f472b6` |

### Ordenar (Nidos)
Same radio list pattern as Ordenar Clima, but active color is `#22c55e` / `rgba(34,197,94,...)`.
Items: Sin orden · Nombre · Nidos activos · Hora Local

---

## Panel Footer

Always visible at bottom of filter panel. Border-top: `1px solid var(--border-default)`. Padding: 10px 12px 12px.

**Button row** (flex, gap 7px):
- **Aplicar**: `flex:2` · height 40px · `background: var(--ui-accent)` · border-radius 9px · `700 13px 'Exo 2'` white · "✓ Aplicar" — closes panel and applies filters
- **Cancelar**: `flex:1` · height 40px · `var(--bg-primary)` · border `1px solid var(--border-default)` · border-radius 9px · `600 13px` `var(--text-secondary)` · "✕ Cancelar" — closes panel without applying

**Limpiar link** (below buttons): `400 11px 'Exo 2'` · `var(--text-secondary)` · opacity 0.6 · underline · "✕ Limpiar todos los filtros"

---

## Interactions & Behavior

| Action | Result |
|---|---|
| Click "Filtros" button | Panel slides in (`translateX(100%)→0`), list slides out (`0→-100%)`) |
| Click "← Volver" or "✕ Cancelar" | Panel slides out, list slides back |
| Click "✓ Aplicar" | Same as Volver but persists filter state |
| Click "✕ Limpiar" (in header or footer) | Reset all filter state to defaults |
| Click ✕ quick-clear next to Filtros button | Same as Limpiar, stays on list view |
| Toggle Clima tab | Shows/hides CLIMA group header + 4 accordion sections |
| Toggle Nidos tab | Shows/hides NIDOS group header + 2 accordion sections |
| Click accordion header | Toggles that section open/closed |
| Active filters | Badge on tab header (count) + badge on Filtros button (total count) + summary pills over map |

### Filter summary pills on map
When any filter is active, pills appear as overlay on top-left of map:
- Background: `rgba(13,17,23,0.82)` · Border: 1px solid category color · Border-radius: 11px · Height: 22px
- Font: `500 11px 'Exo 2'` in category color · Backdrop-filter: `blur(6px)`
- Blue (#58a6ff) pills for Clima filters, green (#22c55e) for Nidos filters

---

## State Management (Zustand)

Suggested additions to your existing store:

```js
// Filter panel UI state
filterPanelOpen: false,

// Accordion open states
accordionCondicion: true,   // open by default
accordionRegion: false,
accordionTipoClima: false,
accordionOrden: false,
accordionTipoPoke: true,    // open by default
accordionOrdenNidos: false,

// Clima filter values
filterCondicion: [],        // string[] — multi-select weather conditions
filterRegion: 'todas',      // string — single-select
filterTipoClima: 'todos',   // string — single-select
filterOrden: 'sin_orden',   // string — single-select

// Nidos filter values
filterTipoPoke: [],         // string[] — multi-select pokemon types
filterOrdenNidos: 'sin_orden', // string — single-select
```

These integrate with your existing `activeLayers` (clima/nidos booleans) — the filter panel sections are visible only when the corresponding layer is active.

---

## Design Tokens Used

All from `_ds_bundle.css` — no new tokens needed:

| Token | Usage |
|---|---|
| `var(--bg-primary)` | Panel background, inactive pill bg, radio row bg |
| `var(--bg-secondary)` | Sidebar background |
| `var(--bg-tertiary)` | Inactive pill background |
| `var(--text-primary)` | Active labels |
| `var(--text-secondary)` | Inactive labels, descriptions |
| `var(--border-default)` | Borders, dividers |
| `var(--border-subtle)` | Accordion section dividers |
| `var(--border-strong)` | Inactive radio circle border |
| `var(--ui-accent)` | Filter button, active Clima elements |

**Hard-coded accent colors** (values of DS semantic tokens):
- Clima: `#58a6ff`
- Nidos: `#22c55e`

---

## Typography

All from DS: `'Exo 2', sans-serif` (body/labels) and `'Rajdhani', sans-serif` (headings/group labels). Already loaded by your app via `_ds_bundle.css`.

---

## Assets

- Filter icon SVG (inline, no external file needed):
  ```svg
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 2.5h12M3 7h8M5 11.5h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
  ```
- Clear icon SVG (inline):
  ```svg
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 2l8 8M10 2l-8 8" stroke="var(--text-secondary)" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
  ```

---

## Files

| File | Description |
|---|---|
| `Filter Layouts.dc.html` | Full interactive prototype — open in browser. Turn **4a** (at top) is the final design. Turns 1–3 are earlier explorations. |
| `README.md` | This document |

To view the prototype: open `Filter Layouts.dc.html` in a browser that can load the DS bundle (must be served from the same project root).

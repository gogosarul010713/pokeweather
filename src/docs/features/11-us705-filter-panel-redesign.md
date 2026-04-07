# US-705 — FilterPanelModal V2 Redesign (Sprint 7 Fase 4)

**Status**: ✅ COMPLETADO (2026-04-07)

**Commits**:
- `00008f9` — feat(US-705): FilterPanelModal V2 Redesign — Accordion sections + premium styling
- `3941f67` — feat: Cleanup header + LocationFeed actions
- `96ea25b` — style(US-705): Use design system variables for FilterPanelModal dark theme

---

## Requerimiento

Rediseñar `FilterPanelModal` (mobile) con **4 secciones colapsables** (REGIONES, CLIMA, TIPOS, ORDENAR) con diseño premium, badges descriptivos, y mejor UX respecto a versión anterior lineal.

---

## Solución Implementada

### 1. Layout Colapsable (4 Secciones)

Estructura:
```
┌─────────────────────────────────┐
│ 🌍 REGIONES          [TODAS]  ▼ │  ← Header clickable
├─────────────────────────────────┤
│ (Expandido) Pills con regiones  │  ← Content (if expanded)
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🌤️ CLIMA        [TODOS]  ▼ │
├─────────────────────────────────┤
│ (Expandido) Grid 4×2 tarjetas   │
└─────────────────────────────────┘
... TIPOS y ORDENAR similar
```

**Estado Default**: Todas colapsadas (headers solo visibles)
**Animación**: Slide-down 200ms ease

---

### 2. Sección REGIONES (Pills)

**Diseño Premium**:
- `border-radius: 999px`
- `padding: 8px 16px` (vertical × horizontal)

**Estados**:

| Estado | Background | Border | Text | Emoji |
|--------|-----------|--------|------|-------|
| Inactive | `var(--bg-tertiary)` | transparent | `var(--text-secondary)` | 🌐 (desaturado) |
| Hover | `var(--bg-overlay)` | `var(--border-default)` | `var(--text-secondary)` | 🌐 |
| Active | `var(--bg-secondary)` | `var(--ui-accent)` 1.5px | `var(--ui-accent)` | 🌍 (saturado) |

**Items**: "Todas" + 5 regiones (Asia, Europa, América, Oceanía, África)
**Lógica**: Single-select

---

### 3. Sección CLIMA (Grid 4×2)

**Tarjetas**:

| Propiedad | Valor |
|-----------|-------|
| Columnas | 4 |
| Imagen | PNG de `/weather/{condition}.png` |
| Item inicial | "Todos" con `/weather/all.png` |
| Selección | Multi-select |
| Default por | Seleccionado (conditionFilter.length === 0) |

**Estados**:

| Estado | Background | Border | Text |
|--------|-----------|--------|------|
| Inactive | `var(--bg-tertiary)` | transparent | `var(--text-secondary)` |
| Hover | `var(--bg-overlay)` | `var(--border-strong)` | `var(--text-secondary)` |
| Active | `var(--bg-secondary)` | `var(--ui-accent)` 1.5px | `var(--ui-accent)` |

**Badge Header**: "TODOS" (default) o "X SELEC." (si múltiples)

---

### 4. Sección TIPOS (Grid 5×2)

**Layout Inicial**:
- 10 items visibles (1 "TODOS" + 9 tipos)
- 2 filas × 5 columnas

**Tarjetas**:

| Propiedad | Valor |
|-----------|-------|
| Tamaño | ~80×80px (aspect-ratio 1/1.1) |
| border-radius | 12px |
| Ícono | 32px (`.webp` de `/types/ico_n_type.webp`) |
| Label | Caps 11px, `var(--text-secondary)` |

**Estados**:

| Estado | Background | Border | Text |
|--------|-----------|--------|------|
| Inactive | `var(--bg-tertiary)` | transparent | `var(--text-secondary)` |
| Hover | `var(--bg-overlay)` | `var(--border-strong)` | `var(--text-secondary)` |
| Active | `var(--bg-secondary)` | `var(--ui-accent)` 1.5px | `var(--ui-accent)` |

**Botón "+ Más tipos"**:
- Border: `2px dashed var(--border-default)`
- Ancho completo
- Click: Expande a 18 tipos (cambia a "- Menos tipos")

**Badge Header**: "TODOS" o "X SELEC."

---

### 5. Sección ORDENAR (Radio Buttons)

**Opciones**:
1. Sin orden (value: '')
2. Nombre (value: 'name')
3. Densidad (value: 'density')
4. Rating (value: 'rating')
5. Hora Local (value: 'time')

**Layout**: Filas verticales (ancho completo)

**Estados**:

| Estado | Background | Border | Text | Radio |
|--------|-----------|--------|------|-------|
| Inactive | transparent | `var(--border-default)` 1.5px | `var(--text-primary)` | Border 2px |
| Hover | transparent | `var(--ui-accent)` | `var(--text-primary)` | Border 2px |
| Active | `rgba(88,166,255,0.1)` | `var(--ui-accent)` 1.5px | `var(--text-primary)` | Border 3px `var(--ui-accent)` |

**Indicador Dirección**: ↑ (asc) / ↓ (desc) mostrado a la derecha cuando activo

**Badge Header**: "SIN ORDEN" o "{OPCIÓN} {↑/↓}"

---

### 6. Footer

**Botones**:
1. **Aplicar** (primary, `var(--ui-accent)`)
2. **Cancelar** (secondary, `var(--bg-tertiary)`)
3. **Limpiar todos los filtros** (border dashed, text-secondary)

---

## Cambios Adicionales

### Header.tsx
- ❌ Eliminado botón filter (era redundante)
- ❌ Eliminado botón refresh (ya disponible en LocationFeed)

### LocationFeed.tsx
- ✅ Cambió ícono filter: líneas paralelas → **SVG sliders** (3 líneas + 3 círculos)
- ❌ Eliminado botón sort (redundante con FilterPanelModal)
- ❌ Eliminado botón refresh (no era observable en mobile)

---

## Theme (Dark + Light)

**Todos los colores usan variables CSS** (design system `02-design.md`):

```css
--bg-primary:     #0D1117 (dark) / #F0F2F5 (light)
--bg-secondary:   #161B22 (dark) / #FFFFFF (light)
--bg-tertiary:    #1C2333 (dark) / #EBEDF0 (light)
--bg-overlay:     #252D3D (dark) / #F8F9FA (light)

--text-primary:   #E6EDF3 (dark) / #1A202C (light)
--text-secondary: #7D8590 (dark) / #6B7280 (light)

--ui-accent:      #58A6FF (dark) / #1D6FB8 (light)

--border-default: rgba(255,255,255,0.12) (dark)
--border-strong:  rgba(255,255,255,0.24) (dark)
```

**Conversión Light**: `html.light` automáticamente aplica overrides sin CSS adicional en el componente.

---

## Validación

### Testing Manual ✅
- [x] 1. Abrir modal → 4 headers colapsados
- [x] 2. Click header "REGIONES" → Expande pills
- [x] 3. Seleccionar región → Badge actualiza
- [x] 4. Click header "CLIMA" → Expande grid 4×2
- [x] 5. Click clima → Toggle, badge actualiza
- [x] 6. Click header "TIPOS" → Expande grid 10 items
- [x] 7. Click "+ Más tipos" → Expande a 18 items
- [x] 8. Click header "ORDENAR" → Expande radio buttons
- [x] 9. Click radio → Activa, muestra ↑/↓
- [x] 10. Click "Limpiar" → Reset todo
- [x] 11. Click "Aplicar" → Cierra, filtros se aplican

### Build ✅
```
✓ built in 1.10s (no TypeScript errors)
```

### Visual ✅
- Regiones: Pills premium con estados visuales claros
- Clima: Grid 4×2 con imágenes PNG
- Tipos: Grid 5×2 (10 inicial, expandible a 18)
- Ordenar: Radio buttons con indicadores de dirección

---

## Archivos Modificados

- `src/components/UI/FilterPanelModal.tsx` (950 líneas)
- `src/components/Header/Header.tsx` (cleanup)
- `src/components/Sidebar/LocationFeed.tsx` (filter icon + cleanup)
- `src/App.tsx` (remove onRefresh prop)
- `public/weather/all.png` (nuevo asset)

---

## Próximos Pasos

1. E2E testing en todos los breakpoints
2. Validar interacciones en dispositivos reales
3. Merge a `main` si está todo listo
4. Considerar US-706 (Polish/refinements finales)


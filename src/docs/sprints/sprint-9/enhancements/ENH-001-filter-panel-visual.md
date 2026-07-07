# US-827 — Mejora Visual: Filter Panel (homologacion con diseno)

**Tipo:** Enhancement / Deuda visual  
**Componente:** `src/components/Sidebar/FilterPanel.tsx`  
**Referencia de diseno:** `src/docs/mockups/filtersdesign/README.md`  
**Sprint:** 9  
**Estado:** Pendiente

---

## Contexto

El FilterPanel fue implementado con la estructura correcta (accordion, grupos clima/nidos, panel slide, draft filters). Sin embargo, el look visual no coincide con el diseno high-fidelity del handoff. Esta US documenta las desviaciones y define los cambios necesarios para homologar.

---

## Desviaciones detectadas

### 1. Boton "Filtros" — aspecto principal

| | Diseno | Codigo actual |
|---|---|---|
| Background | `var(--ui-accent)` solido | `var(--bg-tertiary)` con borde |
| Color texto | blanco | `var(--text-secondary)` |
| Icono | SVG filtro inline (14x14, blanco) | `☰` (HTML entity) |
| Alto | 40px | ~30px (padding 7px) |
| Border-radius | 10px | 8px |
| Box-shadow | `0 2px 12px rgba(88,166,255,0.25)` | ninguno |
| Estado con filtros activos | boton accent + badge blanco con texto accent | boton con borde accent + badge azul bg |

### 2. Badge de filtros activos

| | Diseno | Codigo actual |
|---|---|---|
| Background | blanco | `#58a6ff` |
| Color texto | `var(--ui-accent)` | `#fff` |
| Height | 18px, border-radius 9px | 16px, border-radius 8px |

### 3. Boton limpiar rapido (✕ junto al boton Filtros)

| | Diseno | Codigo actual |
|---|---|---|
| Tamano | 40x40px | 30x30px |
| Border-radius | 10px | 6px |
| Background | `var(--bg-primary)` explicito | `transparent` |

### 4. Header "CIUDADES" con conteo

El diseno especifica una fila entre el boton Filtros y la lista de ciudades:
- Label "CIUDADES" — `700 10px Rajdhani`, uppercase, `var(--text-secondary)`
- Badge con conteo en `var(--ui-accent)`

**Actualmente:** no implementado en FilterPanel. El conteo existe en Sidebar pero sin el header formal.

### 5. Boton "← Volver" en panel

| | Diseno | Codigo actual |
|---|---|---|
| Color | `var(--text-secondary)` | `#58a6ff` (hardcoded accent) |
| Font | `500 12px 'Exo 2'` | sin fuente explicita, weight 600 |

### 6. Titulo "FILTROS" en panel header

| | Diseno | Codigo actual |
|---|---|---|
| Font-family | `Rajdhani` | no especificado (hereda) |
| Letter-spacing | `0.08em` | `0.6px` (aprox equivalente) |

### 7. Dimensiones footer

| | Diseno | Codigo actual |
|---|---|---|
| Boton Aplicar height | 40px | 36px |
| Boton Cancelar height | 40px | 36px |
| Border-radius botones | 9px | 8px |
| Padding footer | `10px 12px 12px` | `10px 16px` |

### 8. Search input

| | Diseno | Codigo actual |
|---|---|---|
| Height | 34px | 30px |
| Padding | `0 10px` + icono lupa | `0 10px` sin icono |

> El diseno menciona "Padding left: 10px icon + 7px gap + text" — hay un icono de lupa que no esta implementado.

---

## Criterios de aceptacion

- [ ] Boton "Filtros" usa `var(--ui-accent)` como background solido con box-shadow
- [ ] Icono del boton es el SVG inline del diseno (no `☰`)
- [ ] Badge de filtros activos: bg blanco, texto accent, 18px height
- [ ] Boton limpiar rapido: 40x40px, `var(--bg-primary)`, border-radius 10px
- [ ] Fila "CIUDADES" con label Rajdhani y badge de conteo implementada
- [ ] Boton "Volver" usa `var(--text-secondary)`, `500 12px 'Exo 2'`
- [ ] Titulo "FILTROS" usa `Rajdhani`
- [ ] Botones footer a 40px de altura
- [ ] Search input a 34px con icono lupa (o acordar omitir icono)
- [ ] Todos los border-radius ajustados segun spec

---

## Notas / Observaciones del usuario

> _(Agregar observaciones aqui)_

---

## Archivos afectados

- `src/components/Sidebar/FilterPanel.tsx` — cambios visuales principales
- `src/components/Sidebar/Sidebar.tsx` — si el header "CIUDADES" vive ahi
- Sin cambios al store ni a la logica de filtros

---

## Prioridad

Media — la funcionalidad es correcta, solo es deuda visual. Bloquea la entrega final del sprint si se requiere fidelidad al diseno.

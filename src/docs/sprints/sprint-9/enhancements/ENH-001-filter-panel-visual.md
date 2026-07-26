# ENH-001 — Mejora Visual: Filter Panel (homologacion + mejoras UX)

**Tipo:** Enhancement / Deuda visual + mejoras UX  
**Componente:** `src/components/Sidebar/FilterPanel.tsx`  
**Referencia de diseno:** `src/docs/mockups/filtersdesign/README.md` + `FilterLayouts.dc.html` (Turn 4a)  
**Sprint:** 9  
**Estado:** Completado ✅ (sesion 7, 2026-07-13)

---

## Contexto

El FilterPanel fue implementado con la estructura correcta (accordion, grupos clima/nidos, panel slide, draft filters). La primera pasada de homologacion (items 1-8) fue commiteada. Los items 9-15 son mejoras UX adicionales solicitadas por el usuario que no aparecen en el mockup original — se agregan aqui como extension de la misma mejora.

---

## Items 1-8 — Homologacion con diseno (✅ Implementados)

### 1. Boton "Filtros" — aspecto principal ✅
Background `var(--ui-accent)` solido, SVG icon inline 14x14 blanco, 40px alto, border-radius 10px, box-shadow `0 2px 12px rgba(88,166,255,0.25)`.

### 2. Badge de filtros activos ✅
Background blanco, texto `var(--ui-accent)`, 18px height, border-radius 9px.

### 3. Boton limpiar rapido ✅
40x40px, `var(--bg-primary)`, border-radius 10px, SVG ✕ inline.

### 4. Header "CIUDADES" con conteo ~~✅~~ eliminado (sesion 15)
~~Label Rajdhani 700 10px uppercase + badge con conteo dinamico en `var(--ui-accent)`. Recibe `citiesCount` como prop desde Sidebar.~~
Eliminado en sesion 15 — duplicaba el conteo que ya muestra `LocationFeed`. El bloque `.fsp-cities-header` y sus estilos fueron removidos de `FilterPanel.tsx`.

### 5. Boton "← Volver" ✅
Color `var(--text-secondary)`, font `500 12px 'Exo 2'`.

### 6. Titulo "FILTROS" ✅
Font `Rajdhani`, letter-spacing `0.08em`.

### 7. Dimensiones footer ✅
Botones 40px altura, border-radius 9px, padding `10px 12px 12px`.

### 8. Search input ✅
34px altura, icono lupa SVG inline, padding-left para dejar espacio al icono.

---

## Items 9-15 — Mejoras UX adicionales (pendientes)

> Estas no aparecen en el mockup HTML ni el README — son mejoras solicitadas encima del diseno base.

### 9. Barra lateral de color en GroupHeader

El mockup tiene `width:3px` como decoracion estatica dentro del header. La mejora pide que esa barra **corra por toda la seccion** — es decir, un `border-left: 3px solid` en el contenedor que agrupa el GroupHeader + todos sus AccordionSections.

**Spec:**
- Clima: `border-left: 3px solid #58a6ff`
- Nidos: `border-left: 3px solid #22c55e`
- Aplicado al wrapper `<div>` que contiene GroupHeader + accordions de ese grupo

**Archivo:** `src/components/Sidebar/FilterPanel.tsx` — envolver cada grupo en un div con `border-left`

---

### 10. GroupHeaders sticky

El header de cada grupo ("FILTROS DE CLIMA" / "FILTROS DE NIDOS") queda pegado al top del area de scroll cuando el usuario baja.

**Spec:**
- `position: sticky; top: 0; z-index: 2`
- `backdrop-filter: blur(8px)` — se eleva sobre el contenido del scroll
- `box-shadow: 0 2px 8px rgba(0,0,0,0.18)` — separacion visual al hacer scroll
- El `background` del GroupHeader debe ser semi-opaco para que funcione el blur: `rgba(var(--bg-secondary-rgb), 0.92)` o equivalente con `background: var(--bg-secondary)` + opacity si no hay token RGB

**Archivo:** `src/components/Sidebar/filters/GroupHeader.tsx`

---

### 11. Colapso a nivel de grupo

Click en el GroupHeader colapsa/expande TODOS los accordions de ese grupo de una vez.

**Spec:**
- Por defecto ambos grupos abiertos (`groupClimaOpen: true`, `groupNidosOpen: true`)
- Estado en store o local state en FilterPanel
- Animacion: `max-height` con `transition: max-height 0.28s cubic-bezier(0.16,1,0.3,1)` + `overflow: hidden`
- Max-height en abierto: valor suficientemente alto (`2000px`) para cubrir contenido dinamico
- El GroupHeader recibe `isOpen` + `onToggle` como props

**Archivos:**
- `src/components/Sidebar/filters/GroupHeader.tsx` — agregar props `isOpen`, `onToggle`, chevron
- `src/components/Sidebar/FilterPanel.tsx` — estado de grupo + animacion wrapper
- Store (opcional): puede ser local state en FilterPanel, no necesita persistir

---

### 12. Chevron mas visible en GroupHeader

El GroupHeader al volverse clickeable necesita un indicador visual de estado.

**Spec:**
- Chevron `▼` / `▲` segun estado de grupo
- `font-size: 14px`, `font-weight: 600`, `opacity: 0.85`
- Alineado a la derecha del header, junto al badge de conteo de filtros activos del grupo (item 13)
- Transicion `transform 0.22s ease` para rotar suavemente

**Archivo:** `src/components/Sidebar/filters/GroupHeader.tsx`

---

### 13. Badge de filtros activos en GroupHeader

Cuando el grupo esta colapsado (o siempre), mostrar cuantos filtros activos tiene ese grupo.

**Spec — Clima:** cuenta `conditionFilter.length + (regionFilter !== 'todas' ? 1 : 0) + typeFilter.length + (sortMode !== '' ? 1 : 0)`
**Spec — Nidos:** cuenta `nestTypeFilter.length + (nestSortBy !== 'name' ? 1 : 0)`

**Visual:**
- Pill igual al badge del boton Filtros: 18px height, border-radius 9px
- Clima: `background: rgba(88,166,255,0.15)`, `color: #58a6ff`
- Nidos: `background: rgba(34,197,94,0.15)`, `color: #22c55e`
- Solo visible cuando count > 0

**Archivo:** `src/components/Sidebar/FilterPanel.tsx` — calcular y pasar como prop a GroupHeader; `src/components/Sidebar/filters/GroupHeader.tsx` — renderizar badge

---

### 14. Animacion de colapso con max-height

El contenido de cada grupo se anima al colapsar/expandir en lugar de aparecer/desaparecer abruptamente.

**Spec:**
```css
.fsp-group-content {
  overflow: hidden;
  max-height: 2000px;
  transition: max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.fsp-group-content.collapsed {
  max-height: 0;
}
```

> Nota: `max-height` con valor alto tiene limitaciones de easing en la apertura. Si el resultado es perceptiblemente lento, reducir a `800px`.

**Archivo:** `src/components/Sidebar/FilterPanel.tsx` — wrapper div con clase condicional

---

### 15. Toast al limpiar filtros

Al hacer click en "Limpiar todos los filtros" (footer) o "Limpiar" (header del panel), aparece una notificacion transitoria.

**Spec:**
- Texto: "Filtros eliminados"
- Duracion: 2200ms, luego desaparece con fade-out
- Posicion: bottom-center del sidebar, o fixed bottom-center de la pantalla
- Visual: `background: var(--bg-elevated)`, `border: 1px solid var(--border-default)`, `border-radius: 8px`, `padding: 8px 14px`, `font: 500 12px 'Exo 2'`, `color: var(--text-primary)`, `box-shadow: 0 4px 16px rgba(0,0,0,0.3)`
- Animacion: `opacity 0 → 1` en 150ms, luego `opacity 1 → 0` en 300ms al salir
- Implementar como estado local `showToast` + `setTimeout` en FilterPanel — no necesita store

**Archivo:** `src/components/Sidebar/FilterPanel.tsx`

---

## Criterios de aceptacion — items pendientes

- [ ] Barra `border-left: 3px solid` corre por toda la altura de cada grupo
- [ ] GroupHeaders sticky con `backdrop-filter: blur(8px)` y box-shadow al hacer scroll
- [ ] Click en GroupHeader colapsa/expande todos los accordions del grupo con animacion
- [ ] Chevron `▼/▲` visible: 14px, font-weight 600, opacity 0.85, rotacion suave
- [ ] Badge de filtros activos en GroupHeader visible cuando count > 0
- [ ] Animacion max-height 0.28s en colapso de grupo, sin parpadeo
- [ ] Toast "Filtros eliminados" aparece 2200ms al limpiar, con fade in/out

---

## Archivos afectados

- `src/components/Sidebar/FilterPanel.tsx` — barra lateral, wrappers de grupo, animacion, toast, badge counts
- `src/components/Sidebar/filters/GroupHeader.tsx` — sticky, chevron, badge, props isOpen/onToggle
- `src/components/Sidebar/Sidebar.tsx` — prop `citiesCount` y `filteredCount` eliminados (sesion 15)
- Sin cambios al store (todo local state en FilterPanel)

---

## Observaciones post-implementacion (sesion 2026-07-07)

### OBS-1. Barra vertical dentro del GroupHeader — redundante

Con el `border-left: 3px solid` en el wrapper `.fsp-group`, el `<span class="fp-group-bar">` (width:3px) dentro del GroupHeader duplica visualmente el indicador de color.

**Accion:** eliminar el `<span class="fp-group-bar">` y su CSS `.fp-group-bar` de `GroupHeader.tsx`. El color del grupo queda expresado unicamente via el `border-left` del wrapper.

**Archivo:** `src/components/Sidebar/filters/GroupHeader.tsx`

---

### OBS-2. Sticky header con fondo transparente

El `backdrop-filter: blur(8px)` sin un fondo solido deja ver el contenido del scroll detras del header al bajar, lo que resulta visualmente desagradable.

**Accion:** cambiar el background del `.fp-group-header` de semi-transparente a `var(--bg-secondary)` solido. Mantener el gradiente lateral solo como decoracion visual (no como fondo base). Quitar o reducir el `backdrop-filter` ya que no aporta con fondo solido.

**Spec corregida:**
```css
.fp-group-header {
  background: var(--bg-secondary);  /* solido, no semi-transparente */
  /* backdrop-filter: eliminar o dejar blur minimo */
}
```

**Archivo:** `src/components/Sidebar/filters/GroupHeader.tsx`

---

---

## Items 16-18 — Rediseno GroupHeader (mockup filterheader, 2026-07-07)

> Segunda pasada de diseno sobre el GroupHeader. Referencia: `src/docs/mockups/filtersdesign/filterheader/CHANGES_group_header_combo.md` + `Filter Group Headers.dc.html` (columna "Combinacion 2+3+4").

### 16. Icono +/- en caja (reemplaza chevron ▾/▸)

El chevron actual se elimina. Se reemplaza por un cuadro 22x22px con borde tintado que muestra `−` cuando expandido y `+` cuando colapsado.

**Spec:**
- `width: 22px; height: 22px; border-radius: 5px`
- Clima: `border: 1.5px solid rgba(88,166,255,0.5)`, `background: rgba(88,166,255,0.06)`
- Nidos: `border: 1.5px solid rgba(34,197,94,0.5)`, `background: rgba(34,197,94,0.06)`
- Texto: `font: 700 16px/1 'Exo 2'`, `marginTop: -1px` (ajuste optico), color del grupo
- `'−'` cuando abierto, `'+'` cuando cerrado

**Archivo:** `src/components/Sidebar/filters/GroupHeader.tsx`

---

### 17. Header compacto al colapsar

El padding del header transiciona al colapsar, y el subtitulo se desvanece.

**Spec:**
- Padding abierto: `10px 14px 9px 11px` — cerrado: `6px 14px 6px 11px`
- `transition: padding 0.28s cubic-bezier(0.16,1,0.3,1)`
- Subtitulo: `max-height: 20px → 0px` + `opacity: 1 → 0`, `transition: 0.25s ease`

**Archivo:** `src/components/Sidebar/filters/GroupHeader.tsx`

---

### 18. Pill de resumen cuando esta colapsado

Al colapsar el grupo, aparece un pill debajo del titulo con un resumen de los filtros activos. Logica dinamica.

**Spec:**
- Transicion inversa al subtitulo: `max-height: 0 → 28px` al colapsar
- Clima: `background: rgba(88,166,255,0.12)`, `border: 1px solid rgba(88,166,255,0.25)`, `color: #58a6ff`
- Nidos: `background: rgba(34,197,94,0.10)`, `border: 1px solid rgba(34,197,94,0.25)`, `color: #22c55e`
- Texto dinamico via `buildClimaSummary(filterCondicion, filterRegion, filterOrden)` / `buildNidosSummary(filterTipoPoke, filterOrdenNidos)`
- Sin filtros activos: `"Ver filtros de clima"` / `"Ver filtros de nidos"`
- Logica de texto en `FilterPanel.tsx`, pasada como prop `summaryText` a GroupHeader

**Archivos:** `src/components/Sidebar/FilterPanel.tsx` (logica), `src/components/Sidebar/filters/GroupHeader.tsx` (render)

---

## Criterios de aceptacion — items 16-18

- [ ] Chevron `▾/▸` eliminado, reemplazado por caja `+/−` 22x22px con borde tintado
- [ ] Padding del header transiciona entre estado abierto y cerrado
- [ ] Subtitulo se desvanece (`max-height + opacity`) al colapsar
- [ ] Pill de resumen aparece al colapsar, oculto al expandir (transicion inversa)
- [ ] Pill muestra filtros activos en texto compacto; sin filtros: texto neutro
- [ ] `overflow: hidden` solo en el div de contenido colapsable, nunca en el wrapper del grupo (requerimiento sticky)

---

## Sesion 7 — Diseno final aprobado (2026-07-13)

**Referencia:** `Filter Panel Final.dc.html` — proyecto "Copy of Variantes filtros Pokeweather" en claude.ai/design

Los items 16-18 (badge en GroupHeader, subtitle animado, pill de resumen al colapsar) fueron **revertidos** en esta sesion. El diseno final aprobado simplifica el GroupHeader a su minima expresion.

### Decision: GroupHeader — solo titulo + boton +/−

Los items 16 (icono +/−), 17 (header compacto) y 18 (pill de resumen) quedan sustituidos por una version mas simple:

- **Mantiene:** boton +/− en caja 22x22px con borde tintado (item 16)
- **Elimina:** badge numerico de filtros activos en el header (item 13)
- **Elimina:** subtitle con categorias del grupo
- **Elimina:** pill de resumen al colapsar (item 18) — reemplazado por chips fuera del panel (ver ENH-002)
- **Elimina:** padding transitorio al colapsar (item 17) — header tiene padding fijo siempre

**Spec final GroupHeader:**
```tsx
// Solo estas props:
interface GroupHeaderProps {
  color: string
  title: string
  isOpen?: boolean
  onToggle?: () => void
}
```

**Visual:**
- Padding fijo: `10px 14px 9px 11px`
- Titulo: `Rajdhani 700 11px uppercase letter-spacing 0.14em`
- Boton +/−: caja 22x22px, border tintado 1.5px, bg tintado 0.06 opacity
- Sin badge, sin subtitle, sin pill

**Archivos modificados:**
- `src/components/Sidebar/filters/GroupHeader.tsx` — simplificado
- `src/components/Sidebar/FilterPanel.tsx` — removidas props badge/summary/subtitle

---

## Criterios de aceptacion — estado final

- [x] Barra `border-left: 3px solid` corre por toda la altura de cada grupo
- [x] GroupHeaders sticky con box-shadow al hacer scroll
- [x] Click en GroupHeader colapsa/expande todos los accordions del grupo con animacion
- [x] Boton +/− en caja 22x22px, tintado por color de grupo
- [x] GroupHeader muestra SOLO titulo + boton +/−, sin badge ni subtitle
- [x] Animacion max-height 0.28s en colapso de grupo, sin parpadeo
- [x] Toast "Filtros eliminados" aparece 2200ms al limpiar, con fade in/out

---

## Notas

- Los items 9-15 no estan en el mockup HTML ni el README del handoff. Son mejoras definidas directamente por el usuario.
- OBS-1 y OBS-2 son correcciones detectadas visualmente post-implementacion (2026-07-07).
- Items 16-18 surgen de un segundo mockup entregado en sesion 2026-07-07 (`filterheader/`). Redisenan el GroupHeader.
- Sesion 7 (2026-07-13): items 13, 17, 18 revertidos. GroupHeader simplificado al diseno final aprobado en `Filter Panel Final.dc.html`.

- Sesion 15 (2026-07-22): boton Filtros movido a inline row junto al search input — ver ENH-003.

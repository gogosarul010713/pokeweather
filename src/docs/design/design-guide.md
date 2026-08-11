# Design Guide — Pokemon Weather Explorer

> Guia de referencia para desarrolladores y disenadores. Refleja el sistema de estilos existente en produccion.
> Generada desde `src/index.css`, `src/config/zIndex.ts` y todos los componentes de `src/components/`.
> Ultima actualizacion: 2026-08-05 — agrega tokens `--home` y componentes Mi Zona (US-907).

---

## 1. Tipografia

| Rol | Familia | Pesos | Uso |
|-----|---------|-------|-----|
| Display / Headings | `Rajdhani` | 400–700 | Titulos de seccion, labels uppercase, FeedHeader, FilterPanel title |
| Body / UI | `Exo 2` | 400–700 | TODO el texto de la app: cards, chips, badges, inputs, popups |

**Regla:** nunca hardcodear otra familia. Si un elemento necesita tipografia, usa `'Exo 2', sans-serif`.

---

## 2. Tokens de Color

### Fondos

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--bg-primary` | `#0D1117` | `#F0F2F5` | Fondo base, cards, NestPopup root |
| `--bg-secondary` | `#161B22` | `#FFFFFF` | Header, Sidebar, MapSearch panel, MapLegend, ZoomControls group |
| `--bg-tertiary` | `#1C2333` | `#EBEDF0` | Hover states, inputs, icon-wrap de LayerToggles |
| `--bg-overlay` | `#252D3D` | `#F8F9FA` | Tooltips Leaflet, NavPin popup background |

> **Tokens fantasma** (usados en codigo pero sin definir en `index.css` — hay que definirlos o reemplazarlos):
> - `--text-muted` → usar `--text-secondary`
> - `--text-tertiary` → usar `--text-secondary` con `opacity: 0.6`
> - `--bg-hover` → usar `--bg-tertiary`
> - `--bg-elevated` → usar `--bg-overlay`
> - `--accent-primary` → usar `--ui-accent`

### Texto

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--text-primary` | `#E6EDF3` | `#1A202C` | Nombres, titulos, contenido principal |
| `--text-secondary` | `#7D8590` | `#6B7280` | Subtitulos, metadata, labels de ayuda |
| `--text-accent` | `#FFD700` | `#D97706` | Brand (`.br-sub` no usa este — ver tokens fantasma) |

### Bordes

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--border-subtle` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.06)` | Separadores decorativos, `HomeChip--empty` dashed |
| `--border-default` | `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.12)` | Estandar de cards, inputs, popups |
| `--border-strong` | `rgba(255,255,255,0.24)` | `rgba(0,0,0,0.20)` | Hover activo, NestPopup root border |

### UI Semantica

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--ui-accent` | `#58A6FF` | `#1D6FB8` | Links, chips activos, LayerToggle activo, FilterBtn, MapSearch |
| `--ui-success` | `#3FB950` | `#15803D` | Estados confirmados (capa Nidos = `#22c55e` hardcoded) |
| `--ui-warning` | `#D29922` | `#92400E` | Alertas, migraciones proximas |
| `--ui-error` | `#F85149` | `#B91C1C` | Errores, badge de error, mitad superior del PokeBall |

### Mi Zona (tokens nuevos — US-907)

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--home` | `#FF6B35` | `#C84B00` | Color base de Mi Zona: boton Home activo, coordenadas, pin radar |
| `--home-dim` | `rgba(255,107,53,0.14)` | `rgba(200,75,0,0.10)` | Fondo suave: HomeChip activo, modal botones, NestPin nearby fill |
| `--home-glow` | `rgba(255,107,53,0.32)` | `rgba(200,75,0,0.28)` | Borde activo: HomeChip, modal botones, HomeButton en ZoomControls |

> Antes de US-907 el naranja `#FF6B35` estaba hardcodeado en tres sitios. Ahora solo se usa `var(--home)`.
> El token `--accent-dim` (`rgba(88,166,255,0.12)`) se usa para la fila seleccionada en la lista del sidebar.

---

## 3. Condiciones Climaticas

| Condicion | Token | Hex | RGB |
|-----------|-------|-----|-----|
| Sunny | `--condition-sunny` | `#FFB347` | `255, 179, 71` |
| Partly cloudy | `--condition-partly` | `#87CEEB` | `135, 206, 235` |
| Cloudy | `--condition-cloudy` | `#9E9E9E` | `158, 158, 158` |
| Fog | `--condition-fog` | `#C8C8C8` | `200, 200, 200` |
| Rain | `--condition-rain` | `#5B9BD5` | `91, 155, 213` |
| Snow | `--condition-snow` | `#B0E0E6` | `176, 224, 230` |
| Windy | `--condition-windy` | `#78C896` | `120, 200, 150` |

Uso con transparencia: `background: rgba(var(--condition-sunny-rgb), 0.15);`

**Regla WINDY:** reemplaza sunny/partly/cloudy en el mapa pero NUNCA rain/snow/fog.

---

## 4. Tipos Pokemon

18 tipos. Sus colores NO cambian entre dark/light. Cada uno tiene variante `*-rgb`.

| Tipo | Token | Hex |
|------|-------|-----|
| Fire | `--type-fire` | `#FF6B35` |
| Water | `--type-water` | `#6890F0` |
| Grass | `--type-grass` | `#78C850` |
| Electric | `--type-electric` | `#F8D030` |
| Ice | `--type-ice` | `#98D8D8` |
| Dragon | `--type-dragon` | `#7038F8` |
| Psychic | `--type-psychic` | `#F85888` |
| Fairy | `--type-fairy` | `#EE99AC` |
| Ghost | `--type-ghost` | `#705898` |
| Dark | `--type-dark` | `#705848` |
| Steel | `--type-steel` | `#B8B8D0` |
| Rock | `--type-rock` | `#B6A136` |
| Ground | `--type-ground` | `#C2A062` |
| Normal | `--type-normal` | `#A8A878` |
| Flying | `--type-flying` | `#7EC8E3` |
| Poison | `--type-poison` | `#A33EA1` |
| Bug | `--type-bug` | `#A8B820` |
| Fighting | `--type-fighting` | `#C03028` |

> En `NestPin.tsx` los colores de tipo estan hardcodeados localmente (no usan los tokens) — deuda tecnica documentada.

---

## 5. Z-Index

Escala formal en `src/config/zIndex.ts`. **Nunca usar valores arbitrarios.**

| Constante | Valor | Uso |
|-----------|-------|-----|
| `Z.mapBase` | 0 | Tiles Leaflet |
| `Z.mapPins` | 10 | MapPin, NestPin (default) |
| `Z.mapOverlay` | 15 | MapLegend, MapZoomControls, MapSearch panel |
| `Z.sidebar` | 20 | Panel lateral (Sidebar) |
| `Z.header` | 30 | Header |
| `Z.modal` | 100 | FilterPanelModal, NestDetail portal |
| `Z.navPin` | 2000 | NavPin activo (GPS/search) |

```ts
import { Z } from '../../config/zIndex'
// uso: zIndex: Z.header  |  z-index: ${Z.modal}
```

---

## 6. Breakpoints

| Nombre | Rango | Comportamiento |
|--------|-------|----------------|
| Desktop | 1024px+ | Sidebar 300px visible, header completo, LayerToggles visibles |
| Tablet | 768–1023px | Sidebar 280px, LayerToggles visibles, filtros en modal |
| Mobile | <768px | Sidebar oculto (display:none), LayerToggles ocultos, Header 2 filas (96px), SearchInput full-width |

---

## 7. Animaciones Globales

Definidas en `src/index.css`. Reutilizar — no reinventar.

| Keyframe / Clase | Duracion tipica | Uso |
|------------------|-----------------|-----|
| `cardIn` | 200ms ease | Cards entrando al feed |
| `popIn` | 300ms ease | Tooltips, modales |
| `glowPulse` | 1.2s infinite | Pin activo en mapa (requiere `--glow-rgb`) |
| `pokeBallSpin` | 8s linear infinite | Brand logo idle; 0.6s en click |
| `fadeOut` | 200ms ease | Elementos desapareciendo |
| `.fade-refresh` | 200ms ease-in-out | Clase para refresco suave de datos |

Componentes con animaciones propias (CSS-in-JS local):
- `NestPopup`: `np-enter` (200ms scale 0.97 → 1)
- `NavPin (radar)`: `np-pulse`, `np-ripple`, `np-spin` (GPS activo)
- `NavPin (drop)`: `np-drop` (0.45s cubic-bezier bounce al aparecer)
- `FilterPanel`: slide overlay `translateX(100% → 0)` en 320ms cubic-bezier
- `MapSearch`: `popIn` via panel (340px, border-radius 12px)
- `MapZoomControls popover`: `translateX(8px) scale(0.96) → 0 / 1` en 150ms
- `NestPin nearby`: `nhp` glow pulse en `--home`, 1.5s ease-in-out infinite (pin cercano a Mi Zona)
- `HomePin radar`: `rexp` ripple expand (0 → 70px, 2s infinite) + `swrot` barrido conic naranja (2s linear)

Duraciones tipicas: `150ms` micro (hover), `200ms` estandar, `300ms` modal enter, `800ms+` spinner.

---

## 8. Componentes — Referencia Completa

---

### Brand (Header)

- Logo PokeBall SVG + texto apilado
- `.br-name`: Rajdhani 700, 20px, `--text-primary`
- `.br-sub`: Exo 2 400, 10px, uppercase, `letter-spacing: 0.06em`, usa `--text-muted` (token fantasma)
- Animacion: `pokeBallSpin` pausada en idle, activa en hover; 0.6s en click
- Hover: `opacity: 0.85` en el boton completo

---

### LayerToggles (Header)

Tabs de navegacion por capa con borde inferior activo coloreado por capa.

- Cada tab: `align-self: stretch`, `border-bottom: 2px solid` en el color de la capa cuando activa
- Icon-wrap: circulo 22px, `--bg-tertiary` en default → `colorAlpha` (rgba 0.18) cuando activa
- Colores de capa hardcodeados (sin token propio):
  - Clima: `#58A6FF` (mismo que `--ui-accent`)
  - Nidos: `#3FB950` (mismo que `--ui-success`)
  - Gyms: `#F97316` (naranja)
  - Paradas: `#A78BFA` (violeta)
  - Rutas: `#F59E0B` (ambar)
- Badge "pronto": Exo 2, 9px, bg `--bg-tertiary`, color `--text-secondary`
- Disabled: `opacity: 0.35`, `pointer-events: none`
- Mobile (<768px): `display: none`

---

### FilterChip

| Estado | Background | Border | Color texto |
|--------|------------|--------|-------------|
| Default | `--bg-tertiary` | `--border-default` | `--text-secondary` |
| Hover | `--bg-tertiary` | `--ui-accent` | `--text-primary` |
| Active | `rgba(--ui-accent-rgb, 0.08)` | `--ui-accent` | `--text-primary` |

Height: 28px | Padding: 0 12px | Border-radius: 14px | Font: Exo 2 12px/500
Transition: `border-color 0.15s, background 0.15s, color 0.15s`

---

### FilterPanel (Sidebar)

Panel de filtros con dos modos: inline (chips activos visibles) y overlay (panel slide-in).

**Barra de busqueda + boton filtros:**
- Input: `height: 34px`, `border-radius: 8px`, `--bg-primary`, `border: 1px solid --border-default`
- Focus: `border-color: #58a6ff`
- Boton filtros: 34x34px, `--ui-accent` bg, blanco, `border-radius: 8px`, shadow `rgba(88,166,255,0.25)`
- Badge de conteo: blanco bg, `--ui-accent` texto, top-right absoluto

**Chips activos (panel cerrado):**

| Grupo | Background | Border | Color |
|-------|------------|--------|-------|
| Clima | `rgba(88,166,255,.12)` | `rgba(88,166,255,.25)` | `#58a6ff` |
| Nidos | `rgba(34,197,94,.10)` | `rgba(34,197,94,.25)` | `#22c55e` |

Height: 24px | Border-radius: 12px | Font: Exo 2 600/10px

**Panel overlay:**
- Fondo: `--bg-secondary`, `transform: translateX(100% → 0)`, `transition: 0.32s cubic-bezier(0.16,1,0.3,1)`
- Grupos con barra lateral de color: `border-left: 3px solid` — azul para Clima, verde para Nidos
- Boton Aplicar: `--ui-accent` bg, blanco, `height: 40px`, `border-radius: 9px`, flex 2
- Boton Cancelar: `--bg-primary` bg, `--border-default`, `--text-secondary`, flex 1

---

### LocationCard / NestCard (patron compartido)

| Estado | Background | Border-left | Opacidad |
|--------|------------|-------------|----------|
| Default | `--bg-primary` | — | 1 |
| Hover | `--bg-tertiary` | — | 1 |
| Active (ciudad) | `rgba(--ui-accent-rgb, 0.08)` | 3px `--ui-accent` | 1 |
| Active (nido confirmado) | `rgba(34,197,94, .08)` | 3px `#22c55e` | 1 |
| Unconfirmed (nido) | `--bg-primary` | — | 0.7 |

- Border-radius: 8px | Padding: 9–10px 12px | Transition: `all 200ms ease`
- Sprite nido no confirmado: `filter: grayscale(1) opacity(0.5)`
- Favorito activo: `color: #ff4757` (hardcoded, sin token)

---

### HomeChip (Sidebar — solo capa Nidos)

Chip para fijar zona base. Aparece arriba del FilterPanel cuando la capa Nidos esta activa.

| Estado | Background | Border | Color | Contenido |
|--------|-----------|--------|-------|-----------|
| Vacio | transparent | `1px dashed --border-strong` | `--text-secondary` | icono casa + "Fijar mi zona..." |
| Activo | `--home-dim` | `1px solid --home-glow` | coords `--home` 9px/700 | coords + sub-texto 8px `--text-secondary` "Tap editar" |

- Padding: 4px 8px | Font: Exo 2 | Border-radius: 16px
- Sub-texto del estado activo: nombre de ciudad (si disponible) + "Tap editar"

---

### Badges

**Nidos (NestCard y NestPopup):**

| Badge | Background | Color |
|-------|------------|-------|
| Confirmado ✓ | `rgba(34,197,94, 0.15)` | `#22c55e` |
| Sin confirmar ? | `rgba(128,128,128, 0.12)` | `--text-secondary` |
| HOT | `rgba(255,100,0, 0.15)` | `#ff6400` |
| NEW | `rgba(100,180,255, 0.12)` | `#64b4ff` |

Font: Exo 2 8px/700 | Padding: 2px 6px | Border-radius: 5px

**UI Semantica:**
Font: Exo 2 10px/700 | Padding: 2px 8px | Border-radius: 6px

---

### Toast

- Fixed: bottom 24px, right 24px | Border-radius: 8px | Padding: 12px 16px
- Background: `--bg-secondary` | Border: `--border-default` | Shadow: `0 4px 12px rgba(0,0,0,0.15)`
- Animacion: `slideIn` (translateX 100px → 0, 0.3s ease-out)
- Mini-toast del FilterPanel: bottom 72px, centrado, `--bg-elevated` (token fantasma)

---

### Header (barra superior)

- Height: 80px desktop / 96px mobile
- Background: `--bg-secondary` | Border-bottom: `1px solid --border-default`
- Z-index: `Z.header` (30) | Padding horizontal: 16px desktop / 12px mobile
- Layout: flex columna — fila 1 (Brand + LayerToggles + Iconos) + fila 2 (SearchInput, solo mobile)

**Botones icon del header (ThemeToggle, TestingButton, etc.):**
- Size: 32×32px | Border-radius: 6px | Border: `1px solid --border-default`
- Default: bg transparent, `--text-secondary` | Hover: `--bg-tertiary`, `--text-primary`, `--border-strong`
- Disabled: opacity 0.5

---

### Sidebar

- Width: 300px desktop / 280px tablet / oculto mobile
- Background: `--bg-secondary` | Border-right: `1px solid --border-default`
- Z-index: `Z.sidebar` (20)
- Estado sin capa activa: `width: 0`, `opacity: 0`, `transition: 280ms ease` — sidebar colapsa
- Mobile: `display: none` — reemplazado por BottomSheet

---

### MapPin (pin de ciudad)

Forma **teardrop (lagrima)** SVG generado dinamicamente.

| Estado | Tamanio | Efecto |
|--------|---------|--------|
| Default | 28px | `drop-shadow(0 2px 6px rgba(0,0,0,0.7))` |
| Seleccionado | 36px | `drop-shadow(0 0 8px rgba(255,255,255,0.95))` blanco brillante |
| Dimmed | 28px | `opacity: 0.25` |

- Color del pin = condicion climatica (via `CONDITION_COLORS`)
- Centro del pin: imagen de clima (`WEATHER_IMAGES[condition]`) o circulo blanco
- Badges (stops 🎯, gyms 💪, etc.): emojis 12px posicionados en esquinas del pin

---

### NestPin (pin de nido)

Forma **hexagono** SVG generado dinamicamente.

| Estado | Tamanio | Stroke | Fill | Efecto |
|--------|---------|--------|------|--------|
| Default | 28px | `rgba(255,255,255,0.35)` 1.5 | color de tipo 18% alfa | `drop-shadow(0 2px 6px rgba(0,0,0,0.7))` |
| Seleccionado | 36px | `rgba(255,255,255,0.35)` 1.5 | color de tipo 18% alfa | `drop-shadow(0 0 8px rgba(255,255,255,0.95))` blanco brillante |
| Dimmed | 28px | — | — | `opacity: 0.13` |
| **Nearby** (cercano a Mi Zona) | 28px | `#FF6B35` / `--home` 1.5–2 | `rgba(255,107,53,0.15–0.20)` | animacion `nhp` glow naranja 1.5s |

- Color del pin = primer tipo del Pokemon (colores hardcodeados en el componente)
- Centro: sprite oficial del Pokemon (PokeAPI), 72% del tamanio del hexagono
- Estado **nearby**: stroke y fill cambian a naranja `--home`; intensidad proporcional a la proximidad

---

### NavPin (pin de navegacion GPS/busqueda)

Dos variantes visuales, `Z.navPin = 2000`:

| Tipo | SVG | Tamanio | Uso |
|------|-----|---------|-----|
| `search` | Teardrop azul (`--ui-accent`) con punto blanco | 28×40px | Resultado de busqueda |
| `radar` | Animacion GPS: ripple + pulso + barrido radar | 48×48px | Ubicacion GPS actual |

- Animacion de entrada: `np-drop` (translateY -24px → 0, 0.45s cubic-bezier bounce)
- Popup del NavPin: `--bg-overlay`, border `rgba(255,255,255,0.1)`, `border-radius: 8px`
- Popup search incluye boton "Fijar como mi zona": bg `--home-dim`, border `--home-glow`, color `--home`, 8px/700

---

### Popup de Ciudad (CityTooltip — dentro de Leaflet Popup)

Popup que aparece al hacer click en un MapPin.

- Contenedor: `minWidth: 240px`, `padding: 10px 12px`, `fontFamily: Exo 2`
- Fila 1: imagen clima 20px + nombre+pais (13px/600) + condicion (11px, `--text-secondary`)
- Fila 2: label "Tipos" + iconos de tipo 18px
- Fila 3: coordenadas (11px, `--text-secondary`) + boton copiar (9px/600, `border-radius: 3px`)
- Boton "Ver detalle →": full-width, `border: 1px solid --border-default`, color `--ui-accent`, 11px/600, `border-radius: 4px`

---

### Popup de Nido (NestPopup — dentro de Leaflet Popup)

Popup que aparece al hacer click en un NestPin. Mas rico visualmente que CityTooltip.

- Root: `width: 290px`, `--bg-primary`, `border: 1px solid --border-strong`, `border-radius: 12px`
- Shadow: `0 8px 24px rgba(0,0,0,0.3)`
- Animacion de entrada: `np-enter` (scale 0.97, opacity 0, 200ms ease)
- Puntero triangular: diamond rotado 45deg, `--bg-primary`, abajo al centro

Estructura interna:
1. **Header**: nombre (Exo 2 700/13px, ellipsis) + ciudad (11px, `--text-secondary`) + boton ✕
2. **Body**: sprite Pokemon 56px + nombre (14px/700) + iconos tipo + badges confirmado/HOT/NEW
3. **Stats**: estrellas rarity (`#f59e0b`) + texto rarity + spawn% (verde si confirmado)
4. **Footer**: coordenadas monospace 10px + boton copiar
5. **Ver detalle**: boton full-width, `--border-default`, color `--ui-accent`

---

### MapLegend

Panel collapsible en esquina inferior-derecha del mapa.

- Posicion: `position: absolute`, `bottom: 28px`, `right: 50px`
- Width: 192px | Border-radius: 8px | Shadow: `0 4px 12px rgba(0,0,0,0.4)`
- Background: `--bg-secondary` | Border: `--border-default`
- Mobile: `bottom: 75px`, `right: 8px`

Estructura:
- **Header** (clickeable para colapsar): titulo "Leyenda" (Exo 2 10px/700 uppercase) + chevron + chip reset
  - Chip reset activo: `rgba(--ui-accent-rgb, 0.12)`, borde `rgba(--ui-accent-rgb, 0.3)`, color `--ui-accent`
- **Filas de categoria**: `border-left: 3px solid` en color de la fila cuando activa
  - Hover: `rgba(--ui-accent-rgb, 0.08)`
  - Label activo: color de la fila, `font-weight: 600`
  - Conteo: Exo 2 10px/700, `--text-primary`, `font-variant-numeric: tabular-nums`

Categorias:
- 🎯 Pokestop Hub — `#58A6FF`
- 💪 Gym Hub — `#F85149`
- 👥 Comunidad Activa — `#3FB950`
- 🏆 Mejor Lugar — `#FFD700`
- 🌿 Mayor Spawn — `#FB923C`

---

### MapZoomControls

Panel vertical en esquina superior-derecha del mapa.

- Grupos de botones: `background: --bg-secondary`, `border: 1px solid --border-default`, `border-radius: 8px`, shadow `0 2px 8px rgba(0,0,0,0.3)`
- Cada boton: 32×32px, `border-bottom: 1px solid --border-default` (separador entre botones del grupo)
- Hover: `--bg-hover` (token fantasma → usar `--bg-tertiary`)
- Disabled: `--text-secondary`, `opacity: 0.42`

Separador entre bloques dentro del grupo: `border-top: 2px solid --border-default`

**HomeButton** (boton casa dentro del grupo de zoom):

| Estado | Background | Border | Color icono |
|--------|-----------|--------|-------------|
| Sin zona fijada | `--home-dim` | `--home-glow` | `--home` |
| Zona activa | `--home` solido | `--home` | `#fff` |

**Popover "Resaltar"** (sale a la izquierda del panel):
- Width: 210px | `border-radius: 10px` | Shadow: `0 8px 28px rgba(0,0,0,0.55)`
- Animacion: `translateX(8px) scale(0.96) → 0/1` en 150ms
- Flecha decorativa: diamond 8px rotado, borde-right + borde-top, `--bg-secondary`
- Boton activo: dot azul glowing top-right + icono con `drop-shadow(0 0 4px rgba(88,166,255,0.5))`
- Filas: misma logica que MapLegend (border-left 2px en color de fila cuando activo)

---

### MapSearch

Modal de busqueda flotante sobre el mapa. Se abre con `/`, `Ctrl+K`, o boton lupa del panel de controles.

- Panel: `width: 340px`, `border-radius: 12px`, shadow `0 8px 24px rgba(0,0,0,0.4)`
- Background: `--bg-secondary` | Border: `--border-default`

Estructura:
- **Input row**: icono lupa + input transparente (14px, `--text-primary`) + boton ✕
  - Separado del resto por `border-bottom: 1px solid --border-default`
- **Section label** (separador de grupos): 10px uppercase, `--text-tertiary`, `letter-spacing: 0.08em`
- **Resultado local** (ciudad/nido): 13px, `--text-primary`, hover `--bg-hover`
  - Tag tipo (ciudad/nido/coordenadas): 10px, `--text-tertiary`, `--bg-tertiary`, `border-radius: 4px`
- **Fila OSM** (cuando no hay resultados locales):
  - Icon 22px circulo: `rgba(248,208,48,0.12)` (amarillo OSM)
  - Texto: 13px, `--text-secondary` → `--text-primary` en hover
  - Estado loading: texto cambia a "Buscando en OpenStreetMap..."
- **Empty state**: 13px, `--text-tertiary`, centrado
- **Max resultados**: 260px scrollable

Atajos de teclado: `/` para abrir, `Escape` para cerrar, `Enter` selecciona primer resultado o dispara OSM.

---

### Modal "Fijar mi zona" (componente nuevo — US-907)

Modal centrado sobre el mapa que aparece al tocar el HomeButton o el HomeChip vacio.

- Fondo: `--bg-secondary` | Border: `--border-default` | Border-radius: 12px | Width: ~170px
- Shadow: `0 16px 48px rgba(0,0,0,0.5)` | Backdrop: `rgba(0,0,0,0.6)` blur 2px
- Titulo: `--home` 11px/700, icono casa a la izquierda

Estructura interna:
1. **Boton "Usar GPS"**: ancho completo, bg `--home-dim`, border `1px solid --home-glow`, color `--home`, 10px/700, border-radius 7px
2. **Spinner GPS** (mientras detecta): 10px circulo, border `rgba(--home-dim)`, top-color `--ui-accent`, 0.8s spin
3. **Divider "o ingresa"**: texto `--text-secondary` 9px entre dos lineas `--border-default`
4. **Input lat, lon**: bg `--bg-primary`, border `--border-default`, focus `--home`, 10px, border-radius 6px
5. **Boton confirmar**: bg `--home` solido, color `#fff`, 10px/700, border-radius 6px, sin border

Prefijo de clases: `.mz-` (ej. `.mz-modal`, `.mz-btn-gps`, `.mz-input`)

---

### HomePin (pin de ubicacion Mi Zona — componente nuevo — US-907)

Pin naranja que aparece en el mapa cuando Mi Zona esta fijada. Reemplaza al NavPin radar cuando el punto es Mi Zona.

Estructura (posicionado absoluto sobre el mapa):
- **Core**: circulo 12px, bg `--home`, border `2px solid #fff`, box-shadow `0 0 0 2px --home`
- **Radar rings** (x3): border `1.5px solid --home`, animacion `rexp` escalonada (0s, 0.65s, 1.3s delay), expand 12px → 70px, opacity 0.85 → 0, 2s ease-out infinite
- **Radar sweep**: circulo 50px, `conic-gradient(from 0deg, transparent 65%, rgba(255,107,53,0.55) 100%)`, animacion `swrot` 2s linear infinite

Prefijo de clases: `.hp-` (ej. `.hp-core`, `.hp-ring`, `.hp-sweep`)

---

### NestSortBar (barra de orden en Sidebar — componente nuevo — US-907)

Fila que indica el criterio de orden activo en la lista de nidos.

- Layout: flex, justify-content space-between, padding 5px 8px, border-bottom `--border-subtle`
- Label "Ordenar": 9px, `--text-secondary`
- Valor activo:
  - Default (nombre): 9px/700, `--text-secondary`
  - Distancia activa: 9px/700, color `--home`
- Fila seleccionada en la lista: background `--accent-dim` (`rgba(88,166,255,0.12)`)
- Distancia: 9px/700, `font-variant-numeric: tabular-nums`, color `--home`; cuando no hay zona: `--text-secondary` opacity 0.4

---

## 9. Scrollbar Global

```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
```

---

## 10. Reglas Criticas de Estilo

1. **Cero colores hardcodeados** — siempre `var(--x)`. Excepciones documentadas sin token propio:
   - `#22c55e` — verde nidos activos (LocationCard/NestCard/NestPopup activo, FilterPanel nidos)
   - `#ff4757` — corazon favorito activo (LocationCard)
   - ~~`#FF6B35` — naranja "Mi Zona"~~ → ahora usar `var(--home)` / `var(--home-dim)` / `var(--home-glow)`
2. **Un `<style>` por componente** — con prefijo de clase obligatorio (`.lc-`, `.nc-`, `.np-`, `.hd-`, `.ms-`, `.ml-`, `.mzc-`, `.fsp-`, `.lt-`, `.hchip-`, `.br-`, etc.)
3. **No reinventar animaciones** — usar las de `src/index.css`; si el componente necesita una propia, nombrarla con prefijo del componente (`np-enter`, `mzc-spin`, `fsp-toast-in`)
4. **Z-index siempre via `Z.*`** — nunca valores magicos
5. **`var(--ui-accent-rgb)`** — disponible para transparencias del accent azul
6. **Temas** — condiciones y tipos Pokemon NO cambian entre dark/light; todos los demas tokens si
7. **Tokens fantasma** — `--text-muted`, `--text-tertiary`, `--bg-hover`, `--bg-elevated`, `--accent-primary` estan en uso pero no definidos en `index.css`. Deuda tecnica pendiente.

---

## 11. Archivos Clave

| Archivo | Contenido |
|---------|-----------|
| `src/index.css` | Tokens globales, reset, animaciones, scrollbar, breakpoints |
| `src/config/zIndex.ts` | Escala de z-index formal |
| `src/config/typeIcons.ts` | Mapa tipo → ruta de imagen |
| `src/config/weatherImages.js` | Mapa condicion → imagen de clima |
| `src/config/nestMigration.ts` | Fecha de migracion de nidos |
| `src/config/countryFlags.ts` | Codigo de pais → emoji de bandera |
| `src/services/weather/weatherService.ts` | `CONDITION_COLORS`, `BADGE_ICONS`, `CONDITION_LABEL` |

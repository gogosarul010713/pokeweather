# 02-DESIGN — Pokémon Weather Explorer v2
# Sistema de diseño completo. Fuente de verdad visual.
# Leer cuando trabajas en: index.css, cualquier componente, estilos, temas.

---

## FILOSOFÍA

- **Gaming-app híbrido** inspirado en Pokémon GO.
- **Dark-first:** el tema oscuro es el canónico; el claro es una adaptación por variables CSS.
- **El color comunica:** cada condición climática tiene un color único y consistente en toda la UI.
- **Cero hardcoding:** ningún componente usa colores directos (#hex). Todo via `var(--x)`.

---

## TIPOGRAFÍA

```css
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@400;500;600;700&display=swap');
```

| Uso | Font | Weight | Size |
|-----|------|--------|------|
| Brand / app name | Rajdhani | 700 | 20–24px |
| Títulos de sección | Rajdhani | 600 | 14–18px |
| Nombres de ciudad | Exo 2 | 700 | 13–14px |
| UI general / body | Exo 2 | 400–500 | 12–13px |
| Horas / coordenadas | Exo 2 | 700 | 12–15px |
| Badges / labels | Exo 2 | 700 | 9–11px uppercase |
| Texto muted | Exo 2 | 400 | 11px |

---

## VARIABLES CSS COMPLETAS — index.css

```css
/* ============================================================
   GOOGLE FONTS
   ============================================================ */
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@400;500;600;700&display=swap');

/* ============================================================
   RESET
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }
body { font-family: 'Exo 2', sans-serif; }

/* ============================================================
   TEMA OSCURO (default)
   ============================================================ */
:root {
  /* Fondos */
  --bg-primary:    #0D1117;
  --bg-secondary:  #161B22;
  --bg-tertiary:   #1C2333;
  --bg-overlay:    #252D3D;

  /* Texto */
  --text-primary:   #E6EDF3;
  --text-secondary: #7D8590;
  --text-accent:    #FFD700;

  /* Bordes */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.12);
  --border-strong:  rgba(255,255,255,0.24);

  /* UI semántica */
  --ui-accent:   #58A6FF;
  --ui-success:  #3FB950;
  --ui-warning:  #D29922;
  --ui-error:    #F85149;

  /* Condiciones climáticas */
  --condition-sunny:        #FFB347;   --condition-sunny-rgb:    255,179,71;
  --condition-partly:       #87CEEB;   --condition-partly-rgb:   135,206,235;
  --condition-cloudy:       #9E9E9E;   --condition-cloudy-rgb:   158,158,158;
  --condition-fog:          #C8C8C8;   --condition-fog-rgb:      200,200,200;
  --condition-rain:         #5B9BD5;   --condition-rain-rgb:     91,155,213;
  --condition-snow:         #B0E0E6;   --condition-snow-rgb:     176,224,230;
  --condition-windy:        #78C896;   --condition-windy-rgb:    120,200,150;

  /* Tipos Pokémon */
  --type-fire:        #FF6B35;  --type-fire-rgb:        255,107,53;
  --type-ground:      #C2A062;  --type-ground-rgb:      194,160,98;
  --type-normal:      #A8A878;  --type-normal-rgb:      168,168,120;
  --type-flying:      #7EC8E3;  --type-flying-rgb:      126,200,227;
  --type-ghost:       #705898;  --type-ghost-rgb:       112,88,152;
  --type-dark:        #705848;  --type-dark-rgb:        112,88,72;
  --type-water:       #6890F0;  --type-water-rgb:       104,144,240;
  --type-electric:    #F8D030;  --type-electric-rgb:    248,208,48;
  --type-ice:         #98D8D8;  --type-ice-rgb:         152,216,216;
  --type-steel:       #B8B8D0;  --type-steel-rgb:       184,184,208;
  --type-dragon:      #7038F8;  --type-dragon-rgb:      112,56,248;
  --type-rock:        #B6A136;  --type-rock-rgb:        182,161,54;
  --type-poison:      #A33EA1;  --type-poison-rgb:      163,62,161;
  --type-psychic:     #F85888;  --type-psychic-rgb:     248,88,136;
  --type-bug:         #A8B820;  --type-bug-rgb:         168,184,32;
  --type-grass:       #78C850;  --type-grass-rgb:       120,200,80;
  --type-fighting:    #C03028;  --type-fighting-rgb:    192,48,40;
  --type-fairy:       #EE99AC;  --type-fairy-rgb:       238,153,172;
}

/* ============================================================
   TEMA CLARO (override)
   ============================================================ */
html.light {
  --bg-primary:    #F0F2F5;
  --bg-secondary:  #FFFFFF;
  --bg-tertiary:   #EBEDF0;
  --bg-overlay:    #F8F9FA;

  --text-primary:   #1A202C;
  --text-secondary: #6B7280;
  --text-accent:    #D97706;

  --border-subtle:  rgba(0,0,0,0.06);
  --border-default: rgba(0,0,0,0.12);
  --border-strong:  rgba(0,0,0,0.20);

  --ui-accent:   #1D6FB8;
  --ui-success:  #15803D;
  --ui-warning:  #92400E;
  --ui-error:    #B91C1C;

  /* Condiciones y tipos NO cambian entre temas */
}
```

---

## COMPONENTES — Especificaciones

### Header (80px)
```
background:     var(--bg-secondary)
border-bottom:  1px solid var(--border-default)
padding:        0 16px
display:        flex; align-items: center; gap: 12px
zonas:          Brand · FilterPanel (flex:1) · SyncBadge + ThemeToggle
```

### CustomSelect (Dropdown reutilizable)
```
Trigger button:
  background: var(--bg-tertiary)
  border: 1px solid var(--border-default)
  border-radius: 6px, padding: 8px 12px
  font: Exo 2 500 13px
  min-width: 120px, gap: 8px
  open: border-color var(--ui-accent)
  hover: background var(--bg-overlay)
  disabled: opacity 0.5

Chevron ▼: 16px, rota 180deg al abrir (transition 200ms)

Popup:
  background: var(--bg-secondary)
  border: 1px solid var(--border-default)
  border-radius: 6px, box-shadow: 0 4px 12px rgba(0,0,0,0.3)
  max-height: 280px, overflow-y: auto
  animación popIn 150ms

Opción:
  padding: 10px 12px, font: Exo 2 400 13px
  hover: background var(--bg-tertiary)
  selected: background rgba(accent-rgb, 0.1), color var(--ui-accent), font-weight 600

Checkbox (multi-select):
  16×16px, border: 1.5px solid var(--border-default), border-radius 3px
  selected: background var(--ui-accent), border-color var(--ui-accent), check ✓ blanco
```

### FilterPanel
```
display: flex, gap: 8px, align-items: center, flex: 1, height: 48px
Contenido (izq → der):
  CustomSelect "Continente"   (single-select, min-width 120px)
  CustomSelect "Clima"        (multi-select, min-width 120px)
  CustomSelect "Tipo Pokémon" (disabled placeholder)
  CustomSelect "Ordenar por"  (single-select, min-width 120px)
  Botón "✕ Limpiar"          (solo si conditionFilter.length > 0)
  Divider 1px × 28px var(--border-default)
  SearchInput
```

### Brand
```
Pokéball: SVG 34×34px (mitad superior roja, inferior blanca, punto dorado)
"PokéWeather": Rajdhani 700 20px
  dark:  gradient #FFB347 → #FF8C00
  light: gradient #D97706 → #B45309
"Map Tracker": Exo 2 400 10px, --text-secondary, uppercase, letter-spacing 1px
```

### ThemeToggle
```
32×32px, border-radius 8px
background: var(--bg-tertiary)
border: 1px solid var(--border-default)
ícono: 🌙 dark / ☀️ light (16px)
hover: border-color var(--ui-accent)
transición 0.2s
```

### WeatherConditionCard
```
7 botones (sunny · partly · cloudy · fog · rain · snow · windy)
default:         background var(--bg-tertiary), border 1.5px solid transparent
hover:           border-color var(--border-strong)
selected dark:   border-color var(--condition-x), box-shadow: 0 0 10px rgba(var(--condition-x-rgb), 0.45)
selected light:  border-color var(--condition-x), background: rgba(var(--condition-x-rgb), 0.12), sin glow
emoji: 14px centrado
tooltip: Exo 2 10px, pill oscuro fijo
```

### FilterChip
```
height: 28px, border-radius: 14px
background: var(--bg-tertiary)
border: 1px solid var(--border-default)
padding: 0 12px, gap: 6px
font: Exo 2 500 12px
hover: border-color var(--ui-accent), background rgba(var(--ui-accent), 0.08)
```

### SearchInput
```
height: 28px, border-radius: 14px, min-width: 180px
background: var(--bg-tertiary)
border: 1px solid var(--border-default)
padding: 0 14px 0 10px
placeholder: var(--text-secondary)
focus: border-color var(--ui-accent), outline none
```

### Sidebar (280px)
```
background: var(--bg-secondary)
border-right: 1px solid var(--border-default)

MenuStrip (44px):
  background: var(--bg-primary)
  border-right: 0.5px solid var(--border-subtle)
  íconos 24×24px: --text-secondary → hover --text-primary

LocationFeed:
  overflow-y: auto; scrollbar-width: thin
  scrollbar-color: var(--border-default) transparent
```

### LocationCard
```
Layout: flex-row, padding 10px 12px
border: 1px solid var(--border-default), border-radius 8px
position: relative (para ❤️ absoluto top-right)

┌─────────────────────────────────────────────────────┐
│                                                  ❤️  │  ← absolute top:8 right:8, 14px
│ [☀️]  Shibuya          [🔥][🌿][🌿]                 │
│ 36px  Japón            21/03 · 08:00 AM              │
└─────────────────────────────────────────────────────┘

.lc-root    → position:relative, flex, align-center, gap:8, padding:10 12
.lc-weather → 36×36px, object-fit:contain, onError: display:none
              src: /weather/{condition}.png
.lc-body    → flex:1, flex-col, gap:3, padding-right:24px
  .lc-row1  → flex, align-center, gap:6
    .lc-name     → flex:1, Exo 2 700 14px, ellipsis, title={city.name}
    .lc-types-row → flex, gap:2, flex-shrink:0
      img          → /types/ico_{n}_{type}.webp, 22×22px, max 4, onError: display:none
  .lc-row2  → flex, justify-between
    .lc-country  → Exo 2 400 12px, --text-secondary
    .lc-datetime → Exo 2 400 10px, --text-secondary, "DD/MM · HH:MM AM/PM"
.lc-favorite → position:absolute, top:8, right:8, 14px, rojo si favorito

Fecha: city.timezone (UTC offset hours) → new Date() + offset → DD/MM
Hora:  city.localTime "HH:MM" (24h) → "HH:MM AM/PM" (12h)
Tipos: máx 4. Sin label "TIPOS POTENCIADOS". Sin flag emoji. Sin rating.
Imágenes tipo: /public/types/ico_{n}_{type}.webp (formato webp, fondo transparente)
```

### TypeBadge
```css
padding: 1px 7px;
border-radius: 8px;
font: Exo 2 700 9px uppercase, letter-spacing 0.5px;
background: rgba(var(--type-{x}-rgb), 0.18);
color: var(--type-{x});
border: 1px solid rgba(var(--type-{x}-rgb), 0.35);

html.light .lc-type-badge {
  background: rgba(var(--type-{x}-rgb), 0.14);
  border-color: rgba(var(--type-{x}-rgb), 0.45);
}
```

### ClimateBadge
```css
padding: 1px 8px;
border-radius: 10px;
font: Exo 2 700 10px;
background: rgba(var(--condition-{x}-rgb), 0.15);
color: var(--condition-{x});
border: 1px solid rgba(var(--condition-{x}-rgb), 0.3);
```

### LocationDetail (modal)
```
Modal: position fixed bottom, max-height 72vh, slideUp 250ms, max-width 600px

┌──[☀️48px]  Gangnam, Seúl               [❤️][✕]──┐
│             Corea del Sur · Asia                    │
│             37.4979, 127.0276  [📋 → ✓]            │
├────────────────────────────────────────────────────┤
│  CLIMA                                             │
│  [☀️32px]  Sunny · 20°C · Sensación 18°C          │
│                                                    │
│  TIPOS POTENCIADOS                                 │
│  [img 36px] [img 36px] [img 36px]                  │
│                                                    │
│  HORA LOCAL                                        │
│  21/03 · 08:00 AM   (Exo 2 600 14px)              │
│                                                    │
│  DATOS POKÉMON GO                                  │
│  ┌────────┬────────┬────────┬────────┐            │
│  │  118   │  670   │   40   │ ⭐ 5  │            │
│  │Densidad│ Stops  │  Gyms  │ Rating │            │
│  └────────┴────────┴────────┴────────┘            │
│                                                    │
│  TIPS  /  EVENTO  (si existen)                     │
└────────────────────────────────────────────────────┘

Header:
  .ld-weather-icon  → 48px, /weather/{condition}.png
  .ld-city-name     → Exo 2 700 16px, ellipsis + title
  .ld-city-sub      → Exo 2 400 12px, muted (país · región)
  .ld-coords        → Exo 2 600 13px, prominente
  .ld-copy-icon-btn → clipboard SVG → check SVG al copiar (2s)

Stat chips (grid 4 columnas):
  .ld-stat-value    → Exo 2 700 15px
  .ld-stat-label    → Exo 2 400 9px uppercase

Eliminados: Humedad · Viento · Transporte
Hora local: solo valor directo bajo título (sin label interno)
Sensación térmica: "Sensación X°C" (no "Siente")
```

### MapPin (Leaflet DivIcon + Badges)
```
Teardrop SVG fijo
  tamaño: 22×29px (normal), 28×37px (selected)
  fill: CONDITION_COLORS[condition] (clima)
  border: 2px solid rgba(255,255,255,0.35)
  shadow: drop-shadow(0 2px 6px rgba(0,0,0,0.7))

badges (pequeños, 12px) — renderizado condicional según showBadgesOnPins:
  🎯 Pokeparadas (top 25% densidad)
  💪 Gimnasios (top 25% gyms)
  👥 Comunidad Activa (rating ≥ 4.0)
  ✨ Mejores Lugares (tiene TODAS 3)
  posicionados: top-left, top-right, bottom-right (máx 2-3)

badge logic (cuartiles):
  - Calculado en calculateBadges() de weatherService.ts
  - Si tiene todas 3 → solo retorna 'best' (exclusivo)
  - Si tiene 1-2 → retorna array de esas categorías
  - Lógica OR en filtros: múltiples badges seleccionados simultáneamente

persistencia:
  - showBadgesOnPins guardado en localStorage: 'pwe-showBadgesOnPins'

estados:
  selected: +30% size, glow rgba(255,255,255,0.95)
```

### CityTooltip (Popup 3 Líneas — Sprint 5)
```
Popup minimalista con diseño optimizado — todo lo demás va en LocationDetail modal.

┌─────────────────────────────────────────────────────┐
│ [☀️] Shibuya, Japón | Sunny                         │  ← Línea 1
│ Tipos: [🔥 img] [🌿 img] [🌿 img]                    │  ← Línea 2
│ Coordenadas: 35.6595, 139.7004 [Copiar]             │  ← Línea 3
│ [────── Ver detalle →]  (full-width)                │  ← Botón
└─────────────────────────────────────────────────────┘

LÍNEA 1 (flex-row, gap 8px):
  icono clima: 24×24px, /weather/{condition}.png
  body (flex-col):
    nombre: Exo 2 700 13px (Shibuya, Japón)
    condición: Exo 2 400 11px, var(--text-secondary) (Sunny)

LÍNEA 2 (flex-col, gap 4px):
  label: "Tipos Potenciados:" Exo 2 600 10px
  imágenes: /types/ico_{n}_{type}.webp, 18×18px (máx 3)

LÍNEA 3 (flex-row, gap 4px):
  label: "Coordenadas:" Exo 2 600 10px
  coords: Exo 2 700 11px (35.6595, 139.7004)
  btn copiar: ícono clipboard → checkmark al copiar (2s feedback)

BOTÓN "Ver detalle →":
  full-width, padding 8px, Exo 2 600 12px
  background: var(--ui-accent), text white
  border-radius: 6px
  stopPropagation() en click

COPY FEEDBACK:
  onclick → navigator.clipboard.writeText(coords)
  button text: "Copiar" → "✓ Copiado" (2 segundos)
  transición suave de color

layout general:
  bg: var(--bg-secondary)
  border: 1px solid var(--border-default)
  border-radius: 12px
  padding: 10px
  min-width: 240px
  gap: 8px
```

### MapLegend (Pestañas — Sprint 5)
```
Leyenda flotante esquina inferior derecha con 2 pestañas.

┌─────────────────────────────────────┐
│ CLIMA      │ CATEGORÍAS            │  ← Pestañas con underline activo
├─────────────────────────────────────┤
│ [🌡️] Sunny        [color dot]       │
│ [🌤️] Partly       [color dot]       │
│ [☁️] Cloudy       [color dot]       │
│ [🌫️] Fog         [color dot]       │
│ [🌧️] Rain        [color dot]       │
│ [❄️] Snow        [color dot]       │
│ [💨] Windy       [color dot]       │
└─────────────────────────────────────┘

TAB 1 — CLIMA:
  7 filas, cada una:
    color dot: 6px circle, var(--condition-x)
    label: Exo 2 400 12px, nombre condición

TAB 2 — CATEGORÍAS:
  Toggle switch:
    label: "Iconos en pines" Exo 2 600 11px
    switch: 40×24px, border-radius 12px
    color: var(--ui-accent) when ON, var(--border-default) when OFF
    thumb: 20×20px, smooth transition 200ms
    persistencia: localStorage 'pwe-showBadgesOnPins'

  4 Checkboxes (filter):
    □ 🎯 Pokeparadas
    □ 💪 Gimnasios
    □ 👥 Comunidad Activa
    □ ✨ Mejores Lugares

    cada checkbox:
      16×16px
      checked: background var(--ui-accent), border var(--ui-accent), ✓ blanco
      unchecked: border var(--border-default)

    lógica: OR (múltiples simultáneas)
    actualizaciones: reactivas a MapView + LocationFeed

ESTILOS GENERALES:
  floating position: bottom-right, 16px margin
  background: var(--bg-secondary)
  border: 1px solid var(--border-default)
  border-radius: 12px
  padding: 12px
  box-shadow: 0 4px 12px rgba(0,0,0,0.3)

  pestañas:
    height: 36px
    flex-row, gap: 16px
    font: Exo 2 600 12px
    cursor: pointer
    active: border-bottom 2px var(--ui-accent)
    transition: border-color 200ms

  contenido:
    max-height: 320px
    overflow-y: auto (si necesario)
    gap: 8px entre items
```

### MapLegend (Colapsable)
```
posición: absolute bottom: 28px, right: 12px, z-index: 450
background: var(--bg-secondary)
border: 1px solid var(--border-default), border-radius: 8px
box-shadow: 0 4px 12px rgba(0,0,0,0.4)

header (click collapsa):
  padding: 8px 10px
  title: "Leyenda" (Exo 2 700 10px uppercase)
  chevron: 10px, rota 180deg al abrir (200ms transition)

body (2 secciones):
  ── Clima ────────────────────
  7 condiciones (sunny, partly, cloudy, fog, rain, snow, windy)
    dot color (10px circle) + label (Exo 2 500 12px)

  ── Calidad (Score) ────────────
  5 rangos (0-20, 21-40, 41-60, 61-80, 81-100)
    dot gradient color + label (Exo 2 500 12px)
    nota: "👑 Top 3 · ⭐#4-10 · Tamaño ∝ Calidad"

css: scrollbar thin, padding: 4px 10px por row
```

### LoadingScreen
```
Fullscreen, z-index máximo, background var(--bg-primary)
PokéBall SVG animada: rotate 360deg, 2s infinite
Texto ciudad: Rajdhani 600 18px, --text-primary
Subtexto "ciudad X de N": Exo 2 400 13px, --text-secondary
Barra de progreso: height 4px, background var(--bg-tertiary)
  fill: gradient var(--condition-sunny) → var(--ui-accent)
  border-radius 2px, transición 0.3s ease
Fade-out al completar: opacity 0, pointer-events none, 0.4s
```

---

## ANIMACIONES

```css
transition: background 0.12s ease, border-color 0.15s ease, transform 0.15s ease;

@keyframes cardIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 6px  rgba(var(--condition-rgb), 0.3); }
  50%       { box-shadow: 0 0 14px rgba(var(--condition-rgb), 0.6); }
}
/* glowPulse SOLO en dark — no en html.light */

@keyframes pokeBallSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

---

## TILES — CartoDB + CSS Filter

```css
/* src/index.css */

:root {
  /* Dark mode: positron invertido → gris oscuro */
  --tile-filter: invert(0.92) hue-rotate(210deg) brightness(0.85) saturate(0.75);
}

html.light {
  /* Light mode: voyager sin filtro */
  --tile-filter: none;
}

/* src/components/Map/MapView.tsx */
.mv-root .leaflet-tile-container {
  filter: var(--tile-filter, none);
}
```

**Tiles usadas:**
- Dark: CartoDB `light_all` (positron) + CSS invert → aspecto gris oscuro sin CORS issues
- Light: CartoDB `rastertiles/voyager` → colorido, clara diferencia tierra/océano

**Por qué:**
- CartoDB `dark_matter` bloqueado por ORB en Chromium
- `positron` + CSS invert → solución visual equivalente sin CORS
- `worldCopyJump: true` en MapContainer → pins persisten al cruzar antimeridiano

---

## IMÁGENES DE CLIMA

```js
// src/config/weatherImages.js
export const WEATHER_IMAGES = {
  sunny:  '/weather/sunny.png',
  partly: '/weather/partly.png',
  cloudy: '/weather/cloudy.png',
  fog:    '/weather/fog.png',
  rain:   '/weather/rain.png',
  snow:   '/weather/snow.png',
  windy:  '/weather/windy.png',
}
```

Archivos en `public/weather/`. Para cambiar imágenes: sustituir archivos o actualizar rutas aquí.
Ningún componente usa rutas hardcodeadas — siempre `WEATHER_IMAGES[condition]`.

---

## BREAKPOINTS

```css
@media (max-width: 1024px) { /* tablet: sidebar → drawer */ }
@media (max-width: 768px)  { /* mobile: layout → bottom sheet */ }
```

---

## REGLAS INVIOLABLES

1. **Cero colores hardcodeados** en componentes — todo via `var(--x)`
2. **Cero condicionales dark/light en JSX** — solo CSS (`html.light .clase`)
3. **Solo Rajdhani y Exo 2** — cero fuentes de sistema
4. **Un `<style>` por componente** — sin CSS modules ni styled-components
5. **Prefijo de clase obligatorio** — nunca `.card`, `.badge` a secas
6. **Condiciones como string literal** — `'sunny'`, `'rain'`, etc.
7. **Alpha siempre con -rgb** — `rgba(var(--type-fire-rgb), 0.18)`
8. **glowPulse solo en dark** — en light usar sombras definidas
9. **Tipos Pokémon no cambian de color entre temas** — son identidad del juego
10. **Temas solo desde index.css** — ThemeToggle solo llama `toggleTheme()`
11. **Imágenes de clima via WEATHER_IMAGES** — nunca rutas directas

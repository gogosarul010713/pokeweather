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
display:        flex; align-items: center; gap: 16px
zonas:          Brand (min-w 200px) · FilterBar (flex:1) · ConditionPanel + ThemeToggle + SyncBadge
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
padding: 10px 12px
border-bottom: 1px solid var(--border-subtle)
transition: background 0.12s

hover:        background var(--bg-tertiary)
active dark:  background rgba(88,166,255,0.06) + border-left 2px var(--ui-accent)
active light: background rgba(29,111,184,0.06) + border-left 2px var(--ui-accent)

Row 1: {flag} nombre (Exo 2 700 13px) + hora (Exo 2 700 12px, --text-accent)
Row 2: ClimateBadge + · + coords (Exo 2 400 10px, --text-secondary)
Row 3: TypeBadge[]
Row 4: density · stops · gyms · rating (Exo 2 400 11px, --text-secondary)
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

### MapPin (Leaflet DivIcon)
```
Teardrop SVG 28px, rotate(-45deg)
fill: var(--condition-{x})
border: 2px solid rgba(255,255,255,0.35)  ← fijo, no cambia con tema
shadow: drop-shadow(0 2px 6px rgba(0,0,0,0.4))
emoji: 11px, rotate(45deg)

hover:          scale(1.25), z-index elevado
selected dark:  scale(1.3) + glow rgba(condition-rgb, 0.5)
selected light: scale(1.3) + shadow más definida, sin glow
```

### CityTooltip
```
background: var(--bg-secondary)
border: 1px solid var(--border-default)
border-radius: 12px, padding: 14px 16px, min-width: 200px
shadow dark:  0 8px 32px rgba(0,0,0,0.5)
shadow light: 0 4px 20px rgba(0,0,0,0.15)
animación: popIn 150ms ease-out

ciudad: Exo 2 800 14px, --text-primary
hora:   Exo 2 700 15px, --text-accent
coords: Exo 2 400 11px, --text-secondary
clima:  emoji + label 11px + imagen 80×80px via WEATHER_IMAGES[condition]
tipos:  TypeBadge[]
```

### SyncBadge
```
height: 28px, pill, Exo 2 600 10px
loading → --ui-warning, spinner
error   → --ui-error, ✕, click retry
ok      → --ui-success, ✓, "hace Xm"
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

# 01-PROJECT — Pokémon Weather Explorer v2
# Contexto general del proyecto. Leer siempre al iniciar sesión.

---

## QUÉ ES

Dashboard web interactivo que muestra condiciones climáticas de ciudades del mundo
y las traduce a tipos Pokémon potenciados, replicando el sistema de clima de Pokémon GO
con una sincronización del 95%+ con el juego real.

---

## PRINCIPIOS CLAVE

| Principio | Descripción |
|-----------|-------------|
| Dataset dinámico | Agregar/quitar ciudades editando solo el JSON, sin tocar código |
| Caché local | IndexedDB para datos de clima (TTL 60 min), localStorage para locationKeys y tema |
| Loading progresivo | Pantalla ciudad por ciudad con barra de progreso real |
| Imágenes configurables | Rutas centralizadas en `config/weatherImages.js`, archivos en `public/weather/` |
| Dark-first | Tema oscuro canónico; claro es override via `html.light` en CSS |

---

## STACK TÉCNICO

| Capa | Tecnología | Versión |
|------|-----------|---------|
| UI Framework | React | 18 |
| Build tool | Vite | 5 |
| Mapa | Leaflet.js / react-leaflet | latest |
| Tiles dark | CartoDB Dark Matter | - |
| Tiles light | CartoDB Positron | - |
| Estado global | Zustand | 4 |
| Clima API | AccuWeather (hourly forecast) | - |
| Geolocalización | S2 Geometry nivel 10 | npm: s2-geometry |
| Caché | IndexedDB | npm: idb-keyval |
| Estilos | CSS-in-JS (`<style>` por componente) | - |
| Fuentes | Rajdhani + Exo 2 | Google Fonts |

> ⚠ API = **AccuWeather** pronóstico horario. NO OpenWeatherMap. NO clima actual.

---

## DATASET — pokedensity-cities.json

Fuente de verdad de ciudades. Solo se edita este archivo para agregar o quitar ciudades.

| Métrica | Valor actual |
|--------|-------------|
| Total ciudades | 94 (expandible) |
| Regiones | asia · europa · america · oceania · africa |
| Países | 16+ |
| Density score | 48 – 142 |
| PokéStops | 260 – 1,200 |
| Gyms | 15 – 72 |
| Rating | 2 – 5 ⭐ |
| Tags | evento · raid · nidos · turistico |

Estructura de cada entrada:
```json
{
  "name": "Shibuya / Harajuku",
  "country": "Japón",
  "flag": "🇯🇵",
  "region": "asia",
  "lat": 35.6595,
  "lng": 139.7004,
  "density": 142,
  "stops": 890,
  "gyms": 54,
  "rating": 5,
  "tags": ["evento", "turistico", "raid"],
  "tips": "...",
  "best": "...",
  "evento": "...",
  "transporte": "..."
}
```

> `lng` del JSON se renombra a `lon` en el tipo `City` internamente.

---

## TIPO City (en la app)

```ts
interface City {
  // Del JSON
  id: string           // slugify(name)
  name: string
  country: string
  flag: string
  region: 'asia' | 'europa' | 'america' | 'oceania' | 'africa'
  lat: number
  lon: number          // renombrado desde lng
  density: number
  stops: number
  gyms: number
  rating: 1 | 2 | 3 | 4 | 5
  tags: ('evento' | 'raid' | 'nidos' | 'turistico')[]
  tips: string
  best: string
  evento: string
  transporte: string

  // Runtime (AccuWeather + S2)
  condition: 'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy'
  isExtreme: boolean
  boostedTypes: string[]
  tempC: number
  feelsLike: number
  humidity: number
  windKmh: number
  gustKmh: number
  localTime: string        // 'HH:mm'
  s2Key: string
  accuLocationKey: string
  weatherIcon: number      // AccuWeather WeatherIcon ID 1–44
  timezone: number         // offset UTC en segundos
  updatedAt: number        // timestamp ms
  weatherImage: string     // '/weather/{condition}.png'
}
```

---

## ARQUITECTURA DE LAYOUT

### Desktop > 1024px (canónico)

```
┌──────────────────────────────────────────────────────┐
│  HEADER  (80px, fixed top)                           │
├─────────────────┬────────────────────────────────────┤
│  SIDEBAR 280px  │  MAP AREA (flex: 1)                │
│  ├ MenuStrip    │  MapContainer + N pines             │
│  │   44px       │  CityTooltip + MapLegend           │
│  └ LocationFeed │  FlyToCity                         │
│    scroll       │                                    │
└─────────────────┴────────────────────────────────────┘
```

### Tablet 768–1024px
Sidebar como drawer sobre el mapa. MenuStrip 44px permanente.

### Mobile < 768px
Header compacto · Mapa fullscreen · NavBar inferior · Bottom sheet.

> Responsive implementado en **Sprint 7**. Sprints 1–6 = solo desktop.

---

## ESTRUCTURA DE ARCHIVOS

```
src/
├── index.css
├── main.jsx                       ← init tema desde localStorage
├── App.jsx                        ← shell 3 zonas + LoadingScreen
│
├── config/
│   └── weatherImages.js           ← rutas de imágenes por condición
│
├── data/
│   ├── pokedensity-cities.json    ← FUENTE DE VERDAD ciudades
│   ├── mockCities.js              ← JSON real + clima simulado (dev sin API)
│   ├── cacheService.js            ← IndexedDB + localStorage
│   ├── s2Service.js               ← claves geoespaciales S2
│   ├── weatherService.js          ← lógica de cálculo de clima
│   ├── useWeather.js              ← hook: carga, caché, progreso, ciclo horario
│   └── useStore.js                ← Zustand: estado global + filtros
│
└── components/
    ├── Header/
    │   ├── Header.tsx
    │   ├── Brand.tsx
    │   ├── FilterPanel.tsx        ← reemplaza FilterBar + ConditionPanel
    │   ├── SearchInput.tsx
    │   └── ThemeToggle.tsx
    ├── Sidebar/
    │   ├── Sidebar.jsx
    │   ├── MenuIcon.jsx
    │   ├── LocationFeed.jsx
    │   └── LocationCard.jsx
    ├── Map/
    │   ├── MapView.jsx
    │   ├── MapPin.jsx
    │   ├── CityTooltip.jsx
    │   ├── MapLegend.jsx
    │   └── FlyToCity.jsx
    └── UI/
        ├── CustomSelect.tsx       ← reemplaza FilterChip (Sprint 3)
        ├── TypeBadge.tsx
        ├── SyncBadge.tsx
        └── LoadingScreen.tsx
```

---

## ESTADO GLOBAL — useStore.js (Zustand)

```js
{
  regionFilter:    'todas' | 'asia' | 'europa' | 'america' | 'oceania' | 'africa',
  conditionFilter: string[],
  searchQuery:     string,
  sortMode:        'name' | 'density' | 'rating' | 'time',
  selectedCity:    City | null,
  theme:           'dark' | 'light',
  sidebarOpen:     boolean,
  loadingStatus:   'idle' | 'loading' | 'ready' | 'error',
  loadingProgress: { cityName: string, current: number, total: number, percent: number },

  // Acciones
  setRegionFilter, toggleCondition, clearConditions,
  setSearchQuery, setSortMode, setSelectedCity,
  toggleTheme, setSidebarOpen, setLoadingProgress,
  getFilteredCities(cities): City[]
}
```

### Lógica de filtrado — getFilteredCities()

```js
getFilteredCities: (cities) => {
  const { regionFilter, conditionFilter, searchQuery, sortMode } = get()
  let result = [...cities]

  if (regionFilter !== 'todas')
    result = result.filter(c => c.region === regionFilter)

  if (conditionFilter.length > 0)
    result = result.filter(c => conditionFilter.includes(c.condition))

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.best.toLowerCase().includes(q) ||
      c.tags.some(t => t.includes(q)) ||
      `${c.lat},${c.lon}`.includes(q)
    )
  }

  result.sort((a, b) => {
    if (sortMode === 'name')    return a.name.localeCompare(b.name)
    if (sortMode === 'density') return b.density - a.density
    if (sortMode === 'rating')  return b.rating - a.rating
    if (sortMode === 'time')    return a.localTime.localeCompare(b.localTime)
    return 0
  })

  return result
}
```

---

## SISTEMA DE TEMAS

```css
:root      { /* dark — por defecto */ }
html.light { /* overrides paleta clara */ }
```

```js
// toggleTheme en el store
const next = get().theme === 'dark' ? 'light' : 'dark'
document.documentElement.classList.toggle('light', next === 'light')
localStorage.setItem('pwe-theme', next)

// init en main.jsx
const saved = localStorage.getItem('pwe-theme') || 'dark'
document.documentElement.classList.toggle('light', saved === 'light')
```

---

## VARIABLES DE ENTORNO

```
VITE_ACCUWEATHER_KEY=   # sin key → usa mockCities automáticamente
```

---

## CONVENCIONES (resumen)

- `lng` del JSON → `lon` en el tipo City. Siempre `lon` en el código.
- `region` siempre en minúsculas: `'asia'`, `'europa'`, etc.
- Colores: solo `var(--x)`. Nunca #hex en componentes.
- Alpha: `rgba(var(--type-fire-rgb), 0.18)` — siempre con variables `-rgb`.
- Fuentes: Rajdhani (brand/títulos), Exo 2 (todo lo demás).
- Un `<style>` por componente. Prefijos obligatorios: `app-` `hd-` `br-` `fb-` `cp-` `sb-` `lf-` `lc-` `mv-` `mp-` `ct-` `ui-` `ls-`
- Imágenes de clima: siempre via `WEATHER_IMAGES[condition]`, nunca rutas hardcodeadas.
- El código nunca asume un número fijo de ciudades.
- Ante duda de estilo: leer `02-design.md`.
- Ante duda de clima: leer `03-weather-logic.md`.
- Ante duda de API: leer `04-api.md`.
- Ante duda de badges: leer `07-badges.md`.
- Ante duda de git/versioning: leer `08-git-workflow.md`.

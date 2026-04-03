# 03-WEATHER-LOGIC — Pokémon Weather Explorer v2
# Toda la lógica de cálculo y transformación de clima.
# Leer cuando trabajas en: weatherService.js, useWeather.js, s2Service.js, cacheService.js, mockCities.js

---

## CONDICIONES VÁLIDAS

```
'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy'
```

Estas son las 7 condiciones que Pokémon GO reconoce.
**Siempre strings literales en minúsculas** — nunca números ni variantes.

---

## MAPEO AccuWeather WeatherIcon → CONDICIÓN BASE

```js
// src/data/weatherService.js
export const ACCUWEATHER_TO_CONDITION = {
  sunny:  [1, 2, 3, 4, 30, 33, 34],
  partly: [5, 6, 35, 36],
  cloudy: [7, 8, 38],
  fog:    [11, 37],
  rain:   [12, 13, 14, 15, 16, 17, 18, 40, 41, 42],
  snow:   [19, 20, 21, 22, 23, 24, 25, 26, 29, 43, 44],
}
// WeatherIcon 9, 10 (hail) → rain
// WeatherIcon 28 (freezing rain) → snow
// Cualquier icon no listado → 'cloudy' como fallback
```

---

## REGLA WINDY — prioridad sobre condición base

```js
// windKmh:  velocidad sostenida (Wind.Speed.Value de AccuWeather)
// gustKmh:  ráfagas (WindGust.Speed.Value de AccuWeather)

const WINDY_WIND_KMH  = 24.1   // viento sostenido mínimo
const WINDY_GUST_KMH  = 35.4   // ráfagas mínimas

// windy REEMPLAZA: sunny, partly, cloudy
// windy NO reemplaza: rain, snow, fog
```

---

## FUNCIONES PRINCIPALES — weatherService.js

```js
// Condición base desde WeatherIcon
export const getBaseCondition = (iconId) => {
  for (const [condition, icons] of Object.entries(ACCUWEATHER_TO_CONDITION)) {
    if (icons.includes(iconId)) return condition
  }
  return 'cloudy'  // fallback
}

// Condición final aplicando lógica WINDY
export const resolveCondition = (iconId, windKmh, gustKmh) => {
  const base = getBaseCondition(iconId)
  const isWindy = windKmh >= WINDY_WIND_KMH || gustKmh >= WINDY_GUST_KMH
  if (isWindy && ['sunny', 'partly', 'cloudy'].includes(base)) return 'windy'
  return base
}

// Flag de clima extremo
export const isExtremeWeather = (alerts) => {
  return Array.isArray(alerts) && alerts.length > 0
}
```

---

## MAPEO CONDICIÓN → TIPOS POKÉMON POTENCIADOS

```js
// Tipos oficiales Pokémon GO (sistema de clima boost v2)
export const CONDITION_TO_TYPES = {
  sunny:  ['fire',    'ground',   'grass'],
  partly: ['normal',  'rock'],
  cloudy: ['fairy',   'fighting', 'poison'],
  fog:    ['ghost',   'dark'],
  rain:   ['water',   'electric', 'bug'],
  snow:   ['ice',     'steel'],
  windy:  ['flying',  'dragon',   'psychic'],
}
```

> `fog` y `cloudy` potencian los mismos tipos (ghost + dark) — es intencional, así funciona Pokémon GO.

---

## FLUJO COMPLETO DE CÁLCULO POR CIUDAD

```
AccuWeather response
       │
       ├── WeatherIcon (int) ──────────────────► getBaseCondition()
       │                                               │
       ├── Wind.Speed.Value (km/h) ──────────► resolveCondition()  ──► condition (string)
       │                                               │
       ├── WindGust.Speed.Value (km/h) ───────┘       │
       │                                               ▼
       │                                     CONDITION_TO_TYPES[condition]
       │                                               │
       │                                               ▼
       │                                          boostedTypes[]
       │
       ├── Alerts[] ──────────────────────────► isExtremeWeather() ──► isExtreme (bool)
       │
       ├── Temperature.Value ──────────────────────────────────────► tempC
       ├── RealFeelTemperature.Value ──────────────────────────────► feelsLike
       ├── RelativeHumidity ────────────────────────────────────────► humidity
       └── Wind.Speed.Value / WindGust.Speed.Value ─────────────────► windKmh / gustKmh
```

---

## S2 GEOMETRY — claves de caché geoespacial

```bash
npm install s2-geometry
```

```js
// src/data/s2Service.js
import { S2 } from 's2-geometry'

// Genera la clave de celda S2 nivel 10 para una coordenada
export const getS2Key = (lat, lng) =>
  S2.latLngToKey(lat, lng, 10)

// Retorna el centro de la celda S2 (para agrupar ciudades cercanas)
export const getS2CellCenter = (lat, lng) => {
  const id = S2.keyToId(S2.latLngToKey(lat, lng, 10))
  const ll = S2.idToLatLng(id)
  return { lat: ll.lat, lng: ll.lng }
}
```

El nivel 10 de S2 agrupa coordenadas en celdas de ~36 km². Dos ciudades
en la misma celda comparten caché de clima (solo una llamada a la API).

---

## CACHÉ LOCAL — cacheService.js

```bash
npm install idb-keyval
```

```js
// src/data/cacheService.js
import { get, set, del, clear } from 'idb-keyval'

const WEATHER_TTL_MS = 60 * 60 * 1000   // 60 minutos
const KEY_PREFIX_WEATHER = 'pwe-weather-'
const KEY_PREFIX_LOC     = 'pwe-loc-'

// ── Datos climáticos (IndexedDB) ────────────────────────────
export const getCachedWeather = async (s2Key) => {
  try {
    const entry = await get(`${KEY_PREFIX_WEATHER}${s2Key}`)
    if (!entry) return null
    if (Date.now() - entry.savedAt > WEATHER_TTL_MS) {
      await del(`${KEY_PREFIX_WEATHER}${s2Key}`)
      return null
    }
    return entry.data
  } catch {
    return null  // IndexedDB no disponible
  }
}

export const setCachedWeather = async (s2Key, data) => {
  try {
    await set(`${KEY_PREFIX_WEATHER}${s2Key}`, { data, savedAt: Date.now() })
  } catch { /* silencioso */ }
}

// ── Location Keys de AccuWeather (localStorage, permanentes) ─
export const getCachedLocationKey = (s2Key) =>
  localStorage.getItem(`${KEY_PREFIX_LOC}${s2Key}`)

export const setCachedLocationKey = (s2Key, key) =>
  localStorage.setItem(`${KEY_PREFIX_LOC}${s2Key}`, key)

// ── Utilidades ───────────────────────────────────────────────
export const clearWeatherCache = () => clear()   // para debugging
```

### Niveles de caché

| Dato | Storage | TTL | Clave |
|------|---------|-----|-------|
| Datos climáticos | IndexedDB | 60 min | `pwe-weather-{s2Key}` |
| AccuWeather locationKey | localStorage | permanente | `pwe-loc-{s2Key}` |
| Tema UI | localStorage | permanente | `pwe-theme` |

---

## HOOK useWeather — flujo completo

```js
// src/data/useWeather.js
// Entrada: rawCities[] (del JSON)
// Salida:  { cities: City[], status, error }

// FLUJO:
// 1. Para cada ciudad, genera su s2Key
// 2. Busca datos en caché (getCachedWeather)
// 3a. Cache HIT  → usa datos del caché
// 3b. Cache MISS → llama API AccuWeather (getAccuWeatherLocationKey + getHourlyForecast)
//                → guarda en caché (setCachedWeather)
// 4. Emite setLoadingProgress({ cityName, current, total, percent })
// 5. Cuando todas las ciudades están listas → status 'ready'
// 6. Si TODAS tenían caché válido → omite LoadingScreen (carga instantánea)
// 7. Ciclo horario: setTimeout hasta la próxima HH:00 para re-fetch

// MOCK MODE (sin VITE_ACCUWEATHER_KEY):
// Usa mockCities.js + delay de 80ms por ciudad para simular progreso
```

---

## MOCK — mockCities.js

```js
// src/data/mockCities.js
// Importa el JSON real y añade clima simulado para desarrollo sin API.
// NUNCA inventa ciudades ni hardcodea datos.

import rawCities from './pokedensity-cities.json'
import { CONDITION_TO_TYPES } from './weatherService'
import { WEATHER_IMAGES }      from '../config/weatherImages'

const MOCK_CONDITIONS = ['sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy']

export const mockCities = rawCities.map((c, i) => {
  const condition = MOCK_CONDITIONS[i % MOCK_CONDITIONS.length]
  return {
    id:              c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name:            c.name,
    country:         c.country,
    flag:            c.flag,
    region:          c.region,
    lat:             c.lat,
    lon:             c.lng,            // ← lng → lon
    density:         c.density,
    stops:           c.stops,
    gyms:            c.gyms,
    rating:          c.rating,
    tags:            c.tags,
    tips:            c.tips,
    best:            c.best,
    evento:          c.evento,
    transporte:      c.transporte,
    // Clima simulado
    condition,
    isExtreme:       false,
    boostedTypes:    CONDITION_TO_TYPES[condition],
    tempC:           Math.round(15 + Math.random() * 20),
    feelsLike:       Math.round(13 + Math.random() * 20),
    humidity:        Math.round(40 + Math.random() * 50),
    windKmh:         Math.round(5  + Math.random() * 30),
    gustKmh:         Math.round(10 + Math.random() * 40),
    localTime:       new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    s2Key:           '',
    accuLocationKey: '',
    weatherIcon:     1,
    timezone:        0,
    updatedAt:       Date.now(),
    weatherImage:    WEATHER_IMAGES[condition],
  }
})
```

---

## LOADING SCREEN — comportamiento

```
Al iniciar la app:
  ├── ¿Todas las ciudades en caché válido?
  │     SÍ → carga instantánea, no muestra LoadingScreen
  │     NO → muestra LoadingScreen
  │           └── por cada ciudad sin caché:
  │                 "Cargando {cityName}..."
  │                 "ciudad {current} de {total}"
  │                 barra: {percent}%
  └── Al terminar → fade-out LoadingScreen 0.4s → app visible

En mock mode:
  └── delay de 80ms por ciudad (permite ver la barra avanzar)
```

---

## REFRESH AUTOMÁTICO

```js
// Calcula ms hasta la próxima HH:00
const msUntilNextHour = () => {
  const now = new Date()
  const next = new Date(now)
  next.setHours(next.getHours() + 1, 0, 0, 0)
  return next - now
}

// En useWeather, al terminar de cargar:
setTimeout(() => refetch(), msUntilNextHour())
```

---

---

## BADGE CATEGORIES — Identificación de fortalezas específicas

```js
// src/data/weatherService.ts

export type BadgeType = 'stops' | 'gyms' | 'community' | 'multi'

// Calcula badges basados en cuartiles (top 25% en cada métrica)
export const calculateBadges = (cities: City[]) => {
  const densities = cities.map(c => c.density).sort((a, b) => b - a)
  const gymsArray = cities.map(c => c.gyms).sort((a, b) => b - a)
  const q1Density = densities[Math.floor(densities.length * 0.25)]
  const q1Gyms = gymsArray[Math.floor(gymsArray.length * 0.25)]

  return (city: City): BadgeType[] => {
    const badges: BadgeType[] = []
    if (city.density >= q1Density) badges.push('stops')     // 🎯
    if (city.gyms >= q1Gyms) badges.push('gyms')           // 💪
    if (city.rating >= 4.0) badges.push('community')       // 👥
    return badges.length >= 2 ? ['multi'] : badges         // ⭐
  }
}

export const BADGE_ICONS: Record<BadgeType, string> = {
  stops: '🎯', gyms: '💪', community: '👥', multi: '⭐',
}
```

**Categorías:**
- **🎯 Pokestop Hub**: top 25% en densidad (muchas pokeparadas)
- **💪 Gym Hub**: top 25% en gimnasios (muchas batallas)
- **👥 Popular**: rating ≥ 4.0 (comunidad activa)
- **⭐ Multi-Purpose**: 2+ categorías simultáneamente

**Aplicación:**
- MapPin: badges pequeños (12px) posicionados alrededor
- CityTooltip: muestra badges como emojis
- LocationDetail: explica cada badge y por qué lo tiene

---

## REGLAS DE NEGOCIO — resumen

| Regla | Descripción |
|-------|-------------|
| `windy` reemplaza | Solo `sunny`, `partly`, `cloudy`. Nunca `rain`, `snow`, `fog`. |
| `fog` = `cloudy` en tipos | Ambos potencian ghost + dark |
| `isExtreme` es flag separado | Nunca reemplaza `condition` |
| Caché TTL | 60 minutos exactos desde `savedAt` |
| locationKey | Permanente en localStorage, no expira |
| Ciclo de refresh | Próxima HH:00, no cada 60min desde el inicio |
| Mock mode | Sin `VITE_ACCUWEATHER_KEY` → automático |
| **Score** | Normalizado 0-100, recalculado al cargar dataset |

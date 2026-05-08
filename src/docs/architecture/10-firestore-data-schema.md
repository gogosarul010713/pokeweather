# 📊 Data Dictionary — Pokémon Weather Explorer

**Última actualización:** 2026-04-08  
**Sprint:** 8 — Weather Persistence Backend  
**Propósito:** Mapa completo de la estructura de datos antes de implementar US-801

---

## 🗂️ Índice de Contenidos

1. [Diagrama ER](#diagrama-er)
2. [Entidades principales](#entidades-principales)
3. [Esquemas detallados](#esquemas-detallados)
4. [Ejemplos reales](#ejemplos-reales)
5. [Mapeos y traducciones](#mapeos-y-traducciones)
6. [Flujo de datos](#flujo-de-datos)
7. [Relaciones Firestore](#relaciones-firestore)

---

## 🔗 Diagrama ER

```
┌─────────────────────────────────────────────────────────────────┐
│                    POKÉMON WEATHER EXPLORER                     │
│                      Modelo de Datos (v2)                       │
└─────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │  CITIES.JSON │ (estático)
                              └──────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
          ┌─────────▼────────┐      │        ┌───────▼──────────┐
          │  City (Zustand)  │──────┼───────▶│ AccuWeather API  │
          │  - id, name      │      │        │ - LocationKey    │
          │  - lat, lon      │      │        │ - Hourly forecast│
          │  - region        │      │        └──────────────────┘
          │  - etc           │      │
          └──────────────────┘      │
                    │               │
                    │        ┌──────▼──────────┐
                    │        │ ForecastData[] │ (array 12h)
                    │        │ - icon, temp   │
                    │        │ - humidity     │
                    │        │ - wind, etc    │
                    │        └────────────────┘
                    │               │
                    │    ┌──────────▼──────────────┐
                    │    │   weatherService.ts    │
                    │    │ - resolveCondition()   │
                    │    │ - getBaseCondition()   │
                    │    │ - CONDITION_TO_TYPES[] │
                    │    └────────────────────────┘
                    │               │
                    │        ┌──────▼──────────┐
                    │        │ ForecastSnapshot│
                    │        │ - classified    │
                    │        │ - types[]       │
                    │        │ - wind_override │
                    │        └────────────────┘
                    │               │
                    │        ┌──────▼──────────┐
                    │        │ ForecastDoc     │
                    │        │ (Firestore)     │
                    │        │ - city_id       │
                    │        │ - snapshots[]   │
                    │        │ - ttl           │
                    │        └────────────────┘
                    │               │
                    │        Firestore Path:
                    │        /city_weather/{city_id}/
                    │          forecasts/{YYYY-MM-DD-HH}
                    │               │
          ┌─────────▼──────────────▼───────────────────┐
          │  Zustand Store (React State)               │
          │  - selectedCity: City                      │
          │  - cities: City[]  (enriquecidas)         │
          │  - loadingStatus, theme, filters          │
          └────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    COLECCIONES FIRESTORE (Sprint 8)             │
└─────────────────────────────────────────────────────────────────┘

Database: weather-app-prod-ef50d

📍 Colección estática (US-802):
   /weather_catalog/
     ├── conditions/ → WEATHER_TRANSLATIONS (44 iconos)
     ├── type_mapping/ → CONDITION_TO_TYPES
     └── rules/ → Umbrales (WINDY_WIND_KMH, etc)

📍 Colección dinámica (US-801 — AQUÍ):
   /city_weather/{city_id}/
     └── forecasts/{YYYY-MM-DD-HH}
           └── snapshots: ForecastSnapshot[]
```

---

## 📋 Entidades Principales

### 1. **City** (Tipo Zustand)
**Fuente:** `CITIES.JSON` (estático) + `AccuWeather API` (dinámico)  
**Ubicación React:** `src/store/useStore.ts`  
**Ciclo de vida:** Cargado al iniciar app → se enriquece con datos climáticos cada hora

```
Ejemplo visual:
┌────────────────────────────────────────────────────────────────┐
│ City: "San Francisco"                                          │
├────────────────────────────────────────────────────────────────┤
│ ESTÁTICAS (JSON)          │ DINÁMICAS (API + Runtime)         │
│ - id: "san-francisco"     │ - condition: "windy"              │
│ - name: "San Francisco"   │ - boostedTypes: ["flying"]        │
│ - lat: 37.7749            │ - tempC: 18.5                     │
│ - lon: -122.4194          │ - feelsLike: 16.2                 │
│ - region: "america"       │ - humidity: 65                    │
│ - country: "EE.UU."       │ - windKmh: 32.5  ← override       │
│ - density: 8932           │ - gustKmh: 45.2                   │
│ - gyms: 156               │ - visibilityKm: 10                │
│ - rating: 4.8             │ - localTime: "18:45"              │
│ - tags: ["raid"]          │ - timezone: -8                    │
│ - best: "Golden Gate Park"│ - s2Key: "86fbcd82f..."           │
│ - tips: "Great community" │ - accuLocationKey: "333179"       │
│                           │ - weatherIcon: 32 (Windy)        │
│                           │ - isExtreme: false                │
│                           │ - updatedAt: 1712606400000        │
│                           │ - weatherImage: "./images/..."    │
└────────────────────────────────────────────────────────────────┘
```

**Cardinalidad:** 1 City = 1 AccuWeather Location (1:1)

---

### 2. **WeatherTranslation** (Constante)
**Fuente:** `src/services/weather/weatherService.ts`  
**Propósito:** Mapear código icono AccuWeather → condición Pokémon GO  
**Cantidad:** 44 entradas (1 por icono de AccuWeather)

```
Ejemplo:
┌────────────────────────────────────────────────┐
│ WeatherTranslation                             │
├────────────────────────────────────────────────┤
│ id: 3                                          │
│ iconText: "Partly Sunny"                       │
│ canWindy: true                                 │
│ pgoCondition: "partly"                         │
│                                                │
│ Significado:                                   │
│ - AccuWeather envía iconId=3                   │
│ - Se convierte a condición "partly"            │
│ - Si viento > 29 km/h: puede overridarse a    │
│   "windy" (canWindy=true lo permite)           │
└────────────────────────────────────────────────┘
```

**Mapeados especiales:**
- **canWindy = false:** Precipitación activa (lluvia, nieve, FOG) → **NUNCA se convierte a WINDY**
- **canWindy = true:** Climas secos → **se convierte a WINDY si viento > 29 km/h ó ráfagas > 31 km/h**

---

### 3. **ForecastData** (AccuWeather API response)
**Fuente:** Endpoint `/hourly` de AccuWeather (pronóstico 12 horas)  
**Formato:** JSON crudo de API, antes de clasificación

```json
{
  "DateTime": "2026-04-08T14:00:00+00:00",
  "EpochDateTime": 1712606400,
  "WeatherIcon": 3,
  "IconPhrase": "Partly Sunny",
  "HasPrecipitation": false,
  "PrecipitationType": null,
  "IsDaylight": true,
  "Temperature": {
    "Value": 18.5,
    "Unit": "C"
  },
  "RealFeelTemperature": {
    "Value": 16.2,
    "Unit": "C"
  },
  "RelativeHumidity": 65,
  "Wind": {
    "Speed": {
      "Value": 9.0,
      "Unit": "km/h"
    },
    "Direction": {
      "Degrees": 270,
      "Localized": "W",
      "English": "W"
    },
    "Gust": {
      "Value": 12.5,
      "Unit": "km/h"
    }
  },
  "Visibility": {
    "Value": 10.0,
    "Unit": "km"
  },
  "Pressure": {
    "Value": 1013,
    "Unit": "mb"
  }
}
```

**Extracción:** `useWeather.ts` → `loadCitiesInBatch()` → `fetchCityWeather()`

---

### 4. **ForecastSnapshot** (Nuestro modelo clasificado)
**Fuente:** Derivado de `ForecastData` + clasificación en `weatherService.ts`  
**Ubicación:** Array de 12 elementos en `ForecastDoc.snapshots`  
**Propósito:** Serializar un pronóstico de 1 hora con clasificación Pokémon GO

```typescript
interface ForecastSnapshot {
  hour: number                 // 0-23 (hora del día)
  raw_condition_code: number   // AccuWeather IconCode (1-44)
  raw_condition_text: string   // "Partly Sunny" (literal de API)
  classified: string           // "partly" | "sunny" | "windy" | etc
  types: string[]              // ["normal", "rock"] (tipos boosteados)
  temperature_c: number        // 18.5
  wind_kmh: number             // 9.0 (viento sostenido)
  precipitation_mm: number     // 0 | 2.5 | etc
  humidity_pct: number         // 65
  is_windy_override: boolean   // true si "classified" cambió por viento
}
```

**Ejemplo:**
```json
{
  "hour": 14,
  "raw_condition_code": 3,
  "raw_condition_text": "Partly Sunny",
  "classified": "partly",
  "types": ["normal", "rock"],
  "temperature_c": 18.5,
  "wind_kmh": 9.0,
  "precipitation_mm": 0,
  "humidity_pct": 65,
  "is_windy_override": false
}
```

**Diferencia con `ForecastData`:**
- `ForecastData`: Raw API response (44 campos)
- `ForecastSnapshot`: Simplificado + clasificado (12 campos)
- `ForecastSnapshot[]`: Array de 12 horas para una ciudad

---

### 5. **ForecastDoc** (Documento Firestore)
**Fuente:** Generado en `firebaseWeatherService.ts` a partir de `City + ForecastSnapshot[]`  
**Path:** `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`  
**Creado:** Al terminar el ciclo de carga de cada ciudad (async/background)  
**TTL:** 7 días (se elimina automáticamente)

```typescript
interface ForecastDoc {
  city_id: string              // "san-francisco" (ID único de ciudad)
  city_name: string            // "San Francisco" (display)
  country: string              // "EE.UU."
  region: string               // "america" | "asia" | "europa" | etc
  lat: number                  // 37.7749
  lon: number                  // -122.4194
  date_hour: string            // "2026-04-08-14" (hora redondeada, clave del documento)
  snapshots: ForecastSnapshot[] // Array de 12 elementos (pronósticos horarios)
  calculated_condition: string // "sunny" | "cloudy" | "rainy" | etc (resultado del algoritmo para snapshots[0])
  ttl: Timestamp               // Firestore Timestamp (now + 7 días)
  created_at: Timestamp        // Firestore Timestamp (momento de consulta a AccuWeather)
}
```

**Nota:** `calculated_condition` se deriva de `snapshots[0].classified` — es la predicción que la app mostró al usuario. Se guarda por separado para simplificar comparación con reportes manuales (clasificación real del usuario).

**Ejemplo completo:**
```json
{
  "city_id": "pier-39",
  "city_name": "Pier 39",
  "country": "EE.UU.",
  "region": "america",
  "lat": 37.8087,
  "lon": -122.4098,
  "date_hour": "2026-04-19-08",
  "calculated_condition": "sunny",
  "snapshots": [
    {
      "hour": 9,
      "raw_condition_code": 1,
      "raw_condition_text": "Sunny",
      "classified": "sunny",
      "types": ["normal", "grass"],
      "temperature_c": 16.2,
      "wind_kmh": 5.0,
      "precipitation_mm": 0,
      "humidity_pct": 72,
      "is_windy_override": false
    },
    {
      "hour": 10,
      "raw_condition_code": 4,
      "raw_condition_text": "Cloudy",
      "classified": "cloudy",
      "types": ["water", "flying"],
      "temperature_c": 19.2,
      "wind_kmh": 32.0,
      "precipitation_mm": 0,
      "humidity_pct": 62,
      "is_windy_override": true
    }
    // ... 10 snapshots más (hasta hora 23)
  ],
  "ttl": {
    "_seconds": 1712954400,
    "_nanoseconds": 0
  },
  "created_at": {
    "_seconds": 1712606400,
    "_nanoseconds": 0
  }
}
```

---

## 📊 Esquemas Detallados

### Tabla: City (Zustand Store)

| Campo | Tipo | Fuente | Formato | Rango/Enum | Ejemplo | Nullable |
|-------|------|--------|---------|-----------|---------|----------|
| `id` | string | CITIES.JSON | slug lowercase | `[a-z0-9-]+` | "san-francisco" | No |
| `name` | string | CITIES.JSON | Title Case | libre | "San Francisco" | No |
| `country` | string | CITIES.JSON | es/en | libre | "EE.UU." | No |
| `flag` | string | CITIES.JSON | emoji | ✓-🌍 | "🇺🇸" | No |
| `region` | enum | CITIES.JSON | minúscula | `asia\|europa\|america\|oceania\|africa` | "america" | No |
| `lat` | number | CITIES.JSON | decimal | -90 a +90 | 37.7749 | No |
| `lon` | number | CITIES.JSON | decimal | -180 a +180 | -122.4194 | No |
| `density` | number | CITIES.JSON | pokéstops/km² | 0-∞ | 156 | No |
| `stops` | number | CITIES.JSON | cantidad | 0-∞ | 8932 | No |
| `gyms` | number | CITIES.JSON | cantidad | 0-∞ | 156 | No |
| `rating` | enum | CITIES.JSON | 1-5 stars | 1\|2\|3\|4\|5 | 5 | No |
| `tags` | string[] | CITIES.JSON | labels | enum | ["evento", "raid"] | No |
| `tips` | string | CITIES.JSON | descripción | libre | "Great community" | Sí |
| `best` | string | CITIES.JSON | POI | libre | "Golden Gate Park" | Sí |
| `evento` | string | CITIES.JSON | descripción | libre | "Nest rotation" | Sí |
| `transporte` | string | CITIES.JSON | descripción | libre | "BART, Uber" | Sí |
| **DINÁMICOS** | | | | | | |
| `condition` | enum | AccuWeather API | clasificado | `sunny\|partly\|cloudy\|fog\|rain\|snow\|windy` | "windy" | No |
| `boostedTypes` | string[] | weatherService | clasificado | enum PGO | ["flying", "dragon"] | No |
| `isExtreme` | boolean | AccuWeather API | boolean | true/false | false | No |
| `tempC` | number | AccuWeather API | Celsius | -50 a +60 | 18.5 | No |
| `feelsLike` | number | AccuWeather API | Celsius | -50 a +60 | 16.2 | No |
| `humidity` | number | AccuWeather API | % | 0-100 | 65 | No |
| `windKmh` | number | AccuWeather API | km/h | 0-200 | 9.0 | No |
| `gustKmh` | number | AccuWeather API | km/h | 0-200 | 12.5 | No |
| `visibilityKm` | number | AccuWeather API | km | 0-50 | 10.0 | No |
| `localTime` | string | weatherService | HH:MM 24h | "00:00"-"23:59" | "18:45" | No |
| `s2Key` | string | s2Service | hex | `[0-9a-f]{16}` | "86fbcd82f445c4cc" | No |
| `accuLocationKey` | string | AccuWeather API | numeric string | `[0-9]+` | "333179" | No |
| `weatherIcon` | number | AccuWeather API | iconId | 1-44 | 3 | No |
| `timezone` | number | AccuWeather API | offset horas | -12 a +14 | -8 | No |
| `updatedAt` | number | Runtime | epoch ms | 0-∞ | 1712606400000 | No |
| `weatherImage` | string | configService | path relativa | `/images/*.png` | "./images/partly.png" | No |

---

### Tabla: ForecastSnapshot (Array element)

| Campo | Tipo | Fuente | Rango | Ejemplo | Notas |
|-------|------|--------|-------|---------|-------|
| `hour` | number | weatherService | 0-23 | 14 | Hora del día (UTC) |
| `raw_condition_code` | number | AccuWeather API | 1-44 | 3 | IconCode sin clasificar |
| `raw_condition_text` | string | AccuWeather API | libre | "Partly Sunny" | Texto literal de API |
| `classified` | string | weatherService | enum | "partly" | Nuestra clasificación PGO |
| `types` | string[] | weatherService | enum PGO | ["normal", "rock"] | Tipos boosteados |
| `temperature_c` | number | AccuWeather API | -50 a +60 | 18.5 | Celsius |
| `wind_kmh` | number | AccuWeather API | 0-200 | 9.0 | Viento sostenido |
| `precipitation_mm` | number | AccuWeather API | 0-500 | 2.5 | Lluvia/nieve acumulada |
| `humidity_pct` | number | AccuWeather API | 0-100 | 65 | Humedad relativa |
| `is_windy_override` | boolean | weatherService | true/false | false | true = "classified" cambió por viento |

---

### Tabla: ForecastDoc (Firestore)

| Campo | Tipo | Índice | TTL | Ejemplo | Notas |
|-------|------|--------|-----|---------|-------|
| `city_id` | string | ✅ (ID doc) | No | "san-francisco" | Identifica la ciudad |
| `city_name` | string | ❌ | No | "San Francisco" | Display |
| `country` | string | ✅ (query) | No | "EE.UU." | Geolocalización |
| `region` | string | ✅ (query) | No | "america" | Filtro regional |
| `lat` | number | ❌ | No | 37.7749 | Referencia |
| `lon` | number | ❌ | No | -122.4194 | Referencia |
| `date_hour` | string | ✅ (sort) | No | "2026-04-08-14" | Clave + timestamp |
| `snapshots` | array | ❌ | No | [...] | Array de 12 elementos |
| `ttl` | Timestamp | ✅ (TTL) | ✅ 7 días | 1712954400 | Auto-delete en Firestore |
| `created_at` | Timestamp | ✅ (query) | No | 1712606400 | Cuándo se guardó |

---

## 📌 Ejemplos Reales

### Escenario 1: Ciclo Normal (Sin Override por Viento)

**Input (AccuWeather API - hora 14:00):**
```json
{
  "WeatherIcon": 3,
  "IconPhrase": "Partly Sunny",
  "Temperature": { "Value": 18.5 },
  "Wind": { "Speed": { "Value": 9.0 }, "Gust": { "Value": 12.5 } },
  "RelativeHumidity": 65
}
```

**Clasificación (weatherService.ts):**
```typescript
const base = getBaseCondition(3)        // → "partly"
const isWindy = 9.0 > 29 || 12.5 > 31   // → false
const classified = "partly"              // sin override
const types = CONDITION_TO_TYPES["partly"] // → ["normal", "rock"]
```

**Output (ForecastSnapshot):**
```json
{
  "hour": 14,
  "raw_condition_code": 3,
  "raw_condition_text": "Partly Sunny",
  "classified": "partly",
  "types": ["normal", "rock"],
  "temperature_c": 18.5,
  "wind_kmh": 9.0,
  "precipitation_mm": 0,
  "humidity_pct": 65,
  "is_windy_override": false
}
```

---

### Escenario 2: Override por Viento (WINDY)

**Input (AccuWeather API - hora 15:00):**
```json
{
  "WeatherIcon": 3,
  "IconPhrase": "Partly Sunny",
  "Temperature": { "Value": 19.2 },
  "Wind": { "Speed": { "Value": 32.0 }, "Gust": { "Value": 45.2 } },
  "RelativeHumidity": 62
}
```

**Clasificación (weatherService.ts):**
```typescript
const base = getBaseCondition(3)           // → "partly"
const translation = WEATHER_TRANSLATIONS[3] // canWindy: true
const isWindy = 32.0 > 29 || 45.2 > 31     // → true
const classified = "windy"                  // OVERRIDE por viento
const types = CONDITION_TO_TYPES["windy"]   // → ["flying", "dragon", "psychic"]
```

**Output (ForecastSnapshot):**
```json
{
  "hour": 15,
  "raw_condition_code": 3,
  "raw_condition_text": "Partly Sunny",
  "classified": "windy",
  "types": ["flying", "dragon", "psychic"],
  "temperature_c": 19.2,
  "wind_kmh": 32.0,
  "precipitation_mm": 0,
  "humidity_pct": 62,
  "is_windy_override": true
}
```

---

### Escenario 3: NO override (Lluvia + viento fuerte)

**Input (AccuWeather API - hora 16:00):**
```json
{
  "WeatherIcon": 18,
  "IconPhrase": "Rain",
  "Temperature": { "Value": 17.8 },
  "Wind": { "Speed": { "Value": 35.0 }, "Gust": { "Value": 48.5 } },
  "RelativeHumidity": 85
}
```

**Clasificación (weatherService.ts):**
```typescript
const base = getBaseCondition(18)           // → "rain"
const translation = WEATHER_TRANSLATIONS[18] // canWindy: false ⚠️
const isWindy = true (pero canWindy=false)  // → NO OVERRIDE
const classified = "rain"                    // Se mantiene como lluvia
const types = CONDITION_TO_TYPES["rain"]     // → ["water", "electric", "bug"]
```

**Output (ForecastSnapshot):**
```json
{
  "hour": 16,
  "raw_condition_code": 18,
  "raw_condition_text": "Rain",
  "classified": "rain",
  "types": ["water", "electric", "bug"],
  "temperature_c": 17.8,
  "wind_kmh": 35.0,
  "precipitation_mm": 5.2,
  "humidity_pct": 85,
  "is_windy_override": false
}
```

---

## 🔄 Mapeos y Traducciones

### Mapeo 1: AccuWeather IconCode → PGO Condition

```
ICONID  DESCRIPCIÓN          PGOBASE   CANWINDY
────────────────────────────────────────────────
1       Sunny                sunny     ✅
2       Mostly Sunny         sunny     ✅
3       Partly Sunny         partly    ✅ ← Escenario 1-2
4       Intermittent Clouds  partly    ✅
5       Hazy Sunshine        cloudy    ✅
6       Mostly Cloudy        cloudy    ✅
7       Cloudy               cloudy    ✅
8       Dreary (Overcast)    cloudy    ✅
11      Fog                  fog       ❌ (nunca windy)
12      Showers              rain      ❌ (nunca windy)
15      T-Storms             rain      ❌ (nunca windy)
18      Rain                 rain      ❌ ← Escenario 3
22      Snow                 snow      ❌ (nunca windy)
30      Hot                  sunny     ✅
31      Cold                 snow      ❌
32      Windy                windy     ✅ (ya es windy)
33      Clear (noche)        sunny     ✅
...y 13 más
```

**Lógica:**
- Si `canWindy = true` Y (viento > 29 km/h ó ráfagas > 31 km/h) → clasificado = "windy"
- Si `canWindy = false` → clasificado = base (NUNCA windy)

---

### Mapeo 2: PGO Condition → Pokémon Types (Boosted)

```
CONDITION    TIPOS BOOSTEADOS
───────────────────────────────────
sunny        [fire, ground, grass]
partly       [normal, rock]
cloudy       [fairy, fighting, poison]
fog          [ghost, dark]
rain         [water, electric, bug]
snow         [ice, steel]
windy        [flying, dragon, psychic]
```

---

### Mapeo 3: Tabla de Validación (WEATHER_TRANSLATIONS)

**Ubicación:** `src/services/weather/weatherService.ts` línea 22-67

**Estructura:**
```typescript
export const WEATHER_TRANSLATIONS: Record<number, WeatherTranslation> = {
  1: { id: 1, iconText: 'Sunny', canWindy: true, pgoCondition: 'sunny' },
  2: { id: 2, iconText: 'Mostly Sunny', canWindy: true, pgoCondition: 'sunny' },
  // ... 42 iconos más
}
```

**Uso en runtime:**
```typescript
const translation = WEATHER_TRANSLATIONS[iconId]
if (translation.canWindy && (windKmh > 29 || gustKmh > 31)) {
  return 'windy'
}
return translation.pgoCondition
```

---

## 🔀 Flujo de Datos

### De AccuWeather API a Firestore

```
┌──────────────────────────────────────────────────────────────┐
│ FASE 1: Carga inicial (useWeather.ts)                        │
└──────────────────────────────────────────────────────────────┘

  CIUDADES.JSON
       ↓
  loadCitiesInBatch()
       ↓
  ┌─────────────────────────────────────────┐
  │ Para cada ciudad (paralelo, 5 en paralelo)│
  ├─────────────────────────────────────────┤
  │ 1. getAccuWeatherLocationKey()           │
  │    └─→ /geoposition/search/{lat,lon}    │
  │    └─→ Retorna: locationKey, timezone   │
  │                                          │
  │ 2. fetchCityWeather(locationKey)        │
  │    └─→ /hourly/v1/forecast?locations=.. │
  │    └─→ Retorna: ForecastData[] (12 hrs) │
  │                                          │
  │ 3. enrichCityWithWeatherData()          │
  │    ├─ Para cada hora:                   │
  │    │  ├─ resolveCondition()             │
  │    │  │  └─ getBaseCondition()          │
  │    │  │  └─ Check canWindy + viento     │
  │    │  └─ CONDITION_TO_TYPES[]           │
  │    │     └─ tipos[] boosteados          │
  │    └─ Retorna: City enriquecida         │
  │                                          │
  │ 4. setCachedWeather(locationKey, data)  │
  │    └─→ Almacenar en IndexedDB (60 min)  │
  └─────────────────────────────────────────┘
       ↓
  Zustand: setSelectedCity(enrichedCity)
       ↓
  ┌──────────────────────────────────────────────────────────┐
  │ FASE 2: Persistencia (firebaseWeatherService.ts — NEW)  │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │ saveCityForecast(city, snapshots)                       │
  │   ↓                                                      │
  │   Crear ForecastDoc {                                   │
  │     city_id, city_name, region,                         │
  │     lat, lon, date_hour,                                │
  │     snapshots: [ForecastSnapshot × 12],                 │
  │     ttl: now + 7 días,                                  │
  │     created_at: now                                     │
  │   }                                                      │
  │   ↓                                                      │
  │   Firestore.doc('city_weather/{id}/forecasts/{dhour}')  │
  │   └─→ setDoc(docRef, forecastDoc)                       │
  │                                                          │
  │   (async/background — no bloquea UI)                    │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
       ↓
  Firestore Database
  ├── /city_weather/san-francisco/
  │   ├── forecasts/2026-04-08-14 ← Nueva!
  │   ├── forecasts/2026-04-08-15
  │   └── forecasts/2026-04-08-16
  └── /city_weather/tokyo/
      └── forecasts/2026-04-08-14
```

---

## 🗄️ Relaciones Firestore

### Estructura de Colecciones (Post US-801)

```
Database: weather-app-prod-ef50d

├─ 📂 city_weather (colección)
│  │
│  ├─ 📄 san-francisco (documento - ID: city.id)
│  │  │
│  │  └─ 📂 forecasts (subcolección)
│  │     │
│  │     ├─ 📄 2026-04-08-14 (ID: YYYY-MM-DD-HH)
│  │     │  ├─ city_id: "san-francisco"
│  │     │  ├─ city_name: "San Francisco"
│  │     │  ├─ region: "america"
│  │     │  ├─ lat: 37.7749
│  │     │  ├─ lon: -122.4194
│  │     │  ├─ date_hour: "2026-04-08-14"
│  │     │  ├─ snapshots: [ForecastSnapshot × 12]
│  │     │  ├─ ttl: Timestamp (2026-04-15 14:00)
│  │     │  └─ created_at: Timestamp (2026-04-08 14:00)
│  │     │
│  │     ├─ 📄 2026-04-08-15 (next hour)
│  │     │  └─ [estructura igual]
│  │     │
│  │     └─ 📄 2026-04-08-16 (next hour)
│  │        └─ [estructura igual]
│  │
│  ├─ 📄 tokyo (documento - ID: city.id)
│  │  └─ 📂 forecasts (subcolección)
│  │     └─ [estructura similar]
│  │
│  ├─ 📄 london (documento)
│  │  └─ [...]
│  │
│  └─ ... (94 ciudades totales)
│
└─ 📂 weather_catalog (colección estática — Future US-802)
   ├─ 📄 conditions
   ├─ 📄 type_mapping
   └─ 📄 rules
```

### Cardinalidades

| Relación | Cardinalidad | Ejemplo |
|----------|--------------|---------|
| City : ForecastDoc (daily) | 1 : 24 | San Francisco → 24 documentos por día |
| City : ForecastDoc (7 days) | 1 : 168 | San Francisco → 168 documentos en 7 días |
| Cities (total) : ForecastDoc (hourly) | 94 : 94 | 94 ciudades × 1 doc/hora = 94 writes/hora |
| ForecastDoc : ForecastSnapshot | 1 : 12 | 1 documento = 12 snapshots horarios |

### Índices Recomendados (Firestore)

| Colección | Campos | Tipo | Uso |
|-----------|--------|------|-----|
| city_weather/*/forecasts | region, created_at | Compuesto | Queries by region + date |
| city_weather/*/forecasts | country, date_hour | Compuesto | Queries by country |
| city_weather/*/forecasts | ttl | Ascendente | TTL auto-delete |

---

## ✅ Checklist de Validación

Antes de implementar US-801, verificar:

- [ ] Todos los 44 iconos de AccuWeather están en WEATHER_TRANSLATIONS
- [ ] Cada icono tiene su pgoCondition correcto (ver Doc 20)
- [ ] canWindy=true solo en climas secos (sunny, partly, cloudy, hot, cold)
- [ ] canWindy=false en precipitación (fog, rain, snow, sleet, t-storms)
- [ ] Umbrales WINDY correctos (29 km/h viento, 31 km/h ráfagas)
- [ ] ForecastSnapshot tiene exactamente 12 campos
- [ ] ForecastDoc tiene exactamente 10 campos
- [ ] TTL en Firestore está configurado a 7 días
- [ ] date_hour es formato YYYY-MM-DD-HH
- [ ] Timestamps de Firestore son Timestamp.fromDate() y Timestamp.now()
- [ ] No se guardan datos de hora incorrecta (UTC vs local)

---

## 🔗 Referencias Cruzadas

| Documento | Sección | Link |
|-----------|---------|------|
| Doc 20 | Weather Classification Algorithm | `/src/docs/20-weather-classification-algorithm.md` |
| Doc 21 | Refactor Weather Algorithm | `/src/docs/21-refactor-weather-algorithm.md` |
| US-801 | Persistir Pronóstico | `/src/docs/features/sprint8/us-801-persistir-pronostico.md` |
| useStore | City type | `/src/store/useStore.ts:5-41` |
| weatherService | Translations | `/src/services/weather/weatherService.ts:22-67` |
| batchWeatherService | Batch loading | `/src/services/weather/batchWeatherService.ts` |

---

**Generado automáticamente**  
Sprint 8 — 2026-04-08  
Diccionario v1.0

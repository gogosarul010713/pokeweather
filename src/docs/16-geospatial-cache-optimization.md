# 🗺️ Optimización Geoespacial de Caché — US-605

## 📋 User Story

**ID:** US-605
**Prioridad:** 🟡 Alto
**Story Points:** 5
**Sprint:** 7
**Epic:** EP-09 (API AccuWeather)

---

## 📖 Narrativa

**Como** usuario de ciudades densamente pobladas,
**quiero** que el mapa cargue todas las ciudades de forma eficiente,
**para** que la aplicación respete el presupuesto de API (15k calls/mes) incluso con múltiples ciudades en la misma zona geográfica.

---

## 🎯 Objetivo Técnico

Implementar caché inteligente que reconoce que múltiples ciudades pueden estar en la **misma celda S2 nivel 10** (región geográfica de ~200 km²) y por lo tanto comparten el **mismo locationKey** de AccuWeather.

**Beneficio:** Reducir API calls en zonas densas sin comprometer precisión climática ni integridad de datos en la UI.

---

## 📊 Contexto Actual

### Situación

```
7 ciudades de testing:
┌─────────────────────────────────────┐
│ Shibuya        → S2 Cell ABC        │
│ Harajuku       → S2 Cell ABC ⚠️     │ (misma celda)
│ Shinjuku       → S2 Cell DEF        │
│ Osaka Dotonbori→ S2 Cell GHI        │
│ ... (más ciudades)                  │
└─────────────────────────────────────┘

Flujo actual de caché (por city.id):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Shibuya
   ├─ getAccuWeatherLocationKey(35.6595, 139.7004)
   │  └─ → locationKey "348205" (caché localStorage ✅)
   ├─ getHourlyForecast("348205")
   │  └─ → API CALL #1
   └─ Guarda en caché: weather_shibuya

2. Harajuku (misma S2 cell, diferente city.id)
   ├─ getAccuWeatherLocationKey(35.6712, 139.7029)
   │  └─ → locationKey "348205" (reusa caché localStorage ✅)
   ├─ getHourlyForecast("348205")
   │  └─ → API CALL #2 ❌ (mismo locationKey, distinto city.id)
   └─ Guarda en caché: weather_harajuku

3. Osaka Dotonbori (diferente S2 cell)
   ├─ getAccuWeatherLocationKey(34.6686, 135.5031)
   │  └─ → locationKey "225003" (caché localStorage ✅)
   ├─ getHourlyForecast("225003")
   │  └─ → API CALL #3

TOTAL: 3 API calls para 3 ciudades
ÓPTIMO: 2 API calls (Shibuya+Harajuku comparten datos)
PÉRDIDA: 33% de eficiencia
```

---

## ✅ Criterios de Aceptación

### Caché Primaria (locationKey)

- [ ] Cambiar `cacheService.ts` para usar `locationKey` como clave primaria
- [ ] Interfaz actualizada:
  ```typescript
  getCachedWeather(locationKey: string): Promise<WeatherData | null>
  setCachedWeather(locationKey: string, data: WeatherData): Promise<void>
  ```
- [ ] El índice es `locationKey`, no `city.id`

### Integridad de React

- [ ] Los props `key={}` en componentes siguen siendo `city.id` (único)
- [ ] **No hay cambios visibles en el UI**
- [ ] Cantidad de ciudades renderizadas es la misma
- [ ] Cero warnings de React sobre keys duplicadas

### Mapeo City → Cache

- [ ] Nueva función helper:
  ```typescript
  export const enrichCityWithWeatherData = (
    city: City,
    weatherData: WeatherData | null
  ): City => ({
    ...city,
    condition: weatherData?.condition ?? 'cloudy',
    tempC: weatherData?.tempC ?? 0,
    // ... más campos
  })
  ```

### Performance

- [ ] En 7 ciudades: máximo 4 API calls (vs 7 actual)
- [ ] En 94 ciudades: máximo 50 API calls (vs 282 actual)
- [ ] Métricas en console:
  ```
  ✅ Batch load: 94/94 ciudades, X cache hits, Y API calls
     └─ LocationKey dedup: -50 calls
  ```

### Testing

- [ ] Test unitario: `getCachedWeather(locationKey)` retorna datos previos
- [ ] Test e2e: 2 ciudades misma S2 cell → 1 API call para weather
- [ ] Test regresión: Cambios a caché no afectan sidebar list rendering

---

## 🛠️ Especificación Técnica

### 1. Cambios en `cacheService.ts`

**Antes:**
```typescript
export const getCachedWeather = async (cityId: string): Promise<unknown | null>
export const setCachedWeather = async (cityId: string, data: unknown): Promise<void>
```

**Después:**
```typescript
export const getCachedWeather = async (locationKey: string): Promise<WeatherData | null>
export const setCachedWeather = async (locationKey: string, data: WeatherData): Promise<void>

interface WeatherData {
  condition: WeatherCondition
  boostedTypes: string[]
  isExtreme: boolean
  tempC: number
  feelsLike: number
  humidity: number
  windKmh: number
  gustKmh: number
  weatherIcon: number
  timezone: number
  updatedAt: number
  weatherImage: string
  // Nota: SIN city-specific fields (id, name, lat, lon)
}
```

**Razón:** LocationKey es la clave de caché, no city.id. Si dos ciudades comparten locationKey, comparten caché.

---

### 2. Cambios en `batchWeatherService.ts`

**Antes:**
```typescript
const weatherData = await fetchCityWeatherWithRetry(city, apiKey, ...)
await setCachedWeather(city.id, weatherData)
```

**Después:**
```typescript
const weatherData = await fetchCityWeatherWithRetry(city, apiKey, ...)
// Extraer locationKey del resultado
const { accuLocationKey, ...cacheableWeatherData } = weatherData
await setCachedWeather(accuLocationKey, cacheableWeatherData)
```

---

### 3. Cambios en `batchWeatherService.ts` (lectura)

**Antes:**
```typescript
const cached = await getCachedWeather(city.id)
if (cached) {
  return { ...cached, id: city.id, name: city.name, ... }
}
```

**Después:**
```typescript
// Necesitamos el locationKey para buscar en caché
// Opción 1: Calcular from S2Key (no siempre funciona)
// Opción 2: Fetch locationKey primero (más seguro)

const locationKey = await getAccuWeatherLocationKey(city.lat, city.lon, apiKey)
const cached = await getCachedWeather(locationKey)
if (cached) {
  return enrichCityWithWeatherData(city, cached)
}
```

---

### 4. Nueva función helper

```typescript
// weatherService.ts
export function enrichCityWithWeatherData(
  city: City,
  weatherData: WeatherData | null
): City {
  if (!weatherData) {
    return {
      ...city,
      condition: 'cloudy',
      boostedTypes: [],
      isExtreme: false,
      tempC: 0,
      feelsLike: 0,
      humidity: 0,
      windKmh: 0,
      gustKmh: 0,
      weatherIcon: 0,
      weatherImage: '/weather/cloudy.png',
      updatedAt: Date.now(),
      timezone: 0,
    }
  }

  return {
    ...city,
    condition: weatherData.condition,
    boostedTypes: weatherData.boostedTypes,
    isExtreme: weatherData.isExtreme,
    tempC: weatherData.tempC,
    feelsLike: weatherData.feelsLike,
    humidity: weatherData.humidity,
    windKmh: weatherData.windKmh,
    gustKmh: weatherData.gustKmh,
    weatherIcon: weatherData.weatherIcon,
    weatherImage: weatherData.weatherImage,
    updatedAt: weatherData.updatedAt,
    timezone: weatherData.timezone,
  }
}
```

---

## 📈 Impacto Estimado

### API Calls Reducidas

| Escenario | Actual | Optimizado | Ahorro |
|-----------|--------|-----------|--------|
| 7 ciudades (testing) | 21 | 14 | -33% |
| 94 ciudades | 282 | 188 | -33% |
| 94 con caché TTL | 188 | 125 | -33% |

### Presupuesto Mensual

```
Actual:     126,900 calls/mes (8.5x presupuesto ❌)
Optimizado: 84,600 calls/mes (5.6x presupuesto ⚠️)

Con Lazy Load (Sprint 8):
Optimizado: <15,000 calls/mes ✅
```

---

## 🧪 Estrategia de Testing

### Unit Tests

```typescript
describe('cacheService geospatial optimization', () => {
  it('two cities with same locationKey should use same cache entry', async () => {
    const weatherData = { condition: 'sunny', tempC: 25, ... }

    await setCachedWeather('348205', weatherData)

    const cached1 = await getCachedWeather('348205')
    const cached2 = await getCachedWeather('348205')

    expect(cached1).toEqual(cached2)
    expect(cached1.condition).toBe('sunny')
  })
})
```

### Integration Tests

```typescript
it('batch load deduplicates cities by locationKey', async () => {
  const cities = [
    { id: 'shibuya', name: 'Shibuya', lat: 35.6595, lon: 139.7004 },
    { id: 'harajuku', name: 'Harajuku', lat: 35.6712, lon: 139.7029 },
    // Ambas en misma S2 cell → mismo locationKey
  ]

  const result = await loadCitiesInBatch(cities, apiKey)

  expect(result.metrics.totalCalls).toBe(2) // No 3
  expect(result.successful).toHaveLength(2) // Ambas ciudades cargadas
})
```

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Regression: Cambios al caché afectan sidebar rendering | Media | Test regresión completo antes de merge |
| Dos ciudades obtienen datos de caché desincronizados | Baja | Caché globalizado por locationKey (una verdad única) |
| Performance de búsqueda de locationKey es lenta | Baja | LocationKey cachea en localStorage (es rápido) |

---

## 🔍 Definición de Completado (DoD)

- [ ] `cacheService.ts` cachea por `locationKey` (no `city.id`)
- [ ] `batchWeatherService.ts` pasa `locationKey` al guardar caché
- [ ] React keys siguen siendo `city.id` (sin warnings)
- [ ] Build sin errores: `npm run build`
- [ ] App carga 7 ciudades: máx 14 API calls (vs 21 actual)
- [ ] Test unitario verde
- [ ] Test integración verde
- [ ] Sidebar muestra datos correctamente
- [ ] Mapa renderiza pines sin errores
- [ ] SyncBadge muestra estado correcto

---

## 📚 Referencias

- **Arquitectura actual:** `cacheService.ts`, `batchWeatherService.ts`
- **Tipo City:** `src/store/useStore.ts`
- **Test precedente:** `US-602` (refresh automático)

---

**Última actualización:** 2026-03-25
**Estado:** 📋 Propuesta — Pendiente aprobación

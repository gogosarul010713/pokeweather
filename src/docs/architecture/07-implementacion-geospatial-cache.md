# 🛠️ Plan de Implementación — US-605 Geospatial Cache

## 📋 Resumen Ejecutivo

**Objetivo:** Cambiar caché de `city.id` → `locationKey` para reutilizar datos climáticos entre ciudades que comparten zona geográfica.

**Impacto:** -33% API calls, presupuesto más controlable, sin cambios visibles en UI.

**Esfuerzo:** 5 SP (análogo a US-602)

**Riesgo:** Bajo (cambio aislado en capa de caché)

---

## 🚀 Fases de Implementación

### **FASE 1: Redefinir la Interface de Caché (2h)**

**Archivo:** `src/services/cache/cacheService.ts`

#### Paso 1.1: Crear tipo `WeatherData`

```typescript
// Agregar al inicio del archivo
export interface WeatherData {
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
  // ⚠️ NO incluir: id, name, lat, lon (specific de ciudad)
}
```

#### Paso 1.2: Actualizar signatures de funciones

**Antes:**
```typescript
interface WeatherCacheEntry {
  data: unknown  // ← tipo genérico
  savedAt: number
  expiresAt: number
}

export const getCachedWeather = async (cityId: string): Promise<unknown | null>
export const setCachedWeather = async (cityId: string, data: unknown): Promise<void>
```

**Después:**
```typescript
interface WeatherCacheEntry {
  data: WeatherData  // ← tipo específico
  savedAt: number
  expiresAt: number
}

export const getCachedWeather = async (locationKey: string): Promise<WeatherData | null>
export const setCachedWeather = async (locationKey: string, data: WeatherData): Promise<void>
```

#### Paso 1.3: Cambiar clave de caché

**Antes:**
```typescript
const entry = await get<WeatherCacheEntry>(`${KEY_PREFIX_WEATHER}${cityId}`)
```

**Después:**
```typescript
const entry = await get<WeatherCacheEntry>(`${KEY_PREFIX_WEATHER}${locationKey}`)
```

---

### **FASE 2: Actualizar weatherService.ts (1.5h)**

**Archivo:** `src/services/weather/weatherService.ts`

#### Paso 2.1: Extraer datos cacheables en `fetchCityWeather()`

**Antes:**
```typescript
const weatherData: City = {
  ...city,
  condition,
  boostedTypes,
  isExtreme,
  tempC: forecast.Temperature.Value,
  feelsLike: forecast.RealFeelTemperature.Value,
  humidity: forecast.RelativeHumidity,
  windKmh: forecast.Wind.Speed.Value,
  gustKmh: forecast.WindGust.Speed.Value,
  weatherIcon: forecast.WeatherIcon,
  accuLocationKey: locationKey,
  updatedAt: Date.now(),
  weatherImage: `/weather/${condition}.png`,
}
return weatherData
```

**Después:**
```typescript
// 1. Crear objeto cacheable (sin city-specific fields)
const weatherData: WeatherData = {
  condition,
  boostedTypes,
  isExtreme,
  tempC: forecast.Temperature.Value,
  feelsLike: forecast.RealFeelTemperature.Value,
  humidity: forecast.RelativeHumidity,
  windKmh: forecast.Wind.Speed.Value,
  gustKmh: forecast.WindGust.Speed.Value,
  weatherIcon: forecast.WeatherIcon,
  timezone: 0, // ← será calculado en hook
  updatedAt: Date.now(),
  weatherImage: `/weather/${condition}.png`,
}

// 2. Enriquecer con datos city-specific
const enrichedCity: City = {
  ...city,
  ...weatherData,
  accuLocationKey: locationKey,
}

return enrichedCity
```

#### Paso 2.2: Crear helper `enrichCityWithWeatherData()`

```typescript
/**
 * Enriquece un City con datos de WeatherData (del caché).
 * Separa la responsabilidad: caché = datos climáticos
 *                            city = identidad + clima
 */
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
    ...weatherData,
  }
}
```

---

### **FASE 3: Actualizar batchWeatherService.ts (2h)**

**Archivo:** `src/services/weather/batchWeatherService.ts`

#### Paso 3.1: Cambiar cómo se cachea

**Antes:**
```typescript
const weatherData = await fetchCityWeatherWithRetry(
  city,
  apiKey,
  finalConfig.maxRetries,
  finalConfig.enableAlerts ?? false
)

await setCachedWeather(city.id, weatherData)  // ← Por city.id
totalCalls += finalConfig.enableAlerts ? 3 : 2
```

**Después:**
```typescript
const weatherData = await fetchCityWeatherWithRetry(
  city,
  apiKey,
  finalConfig.maxRetries,
  finalConfig.enableAlerts ?? false
)

// Extraer solo los datos cacheables (sin city-specific)
const { accuLocationKey, id, name, lat, lon, s2Key, ...cacheableData } = weatherData
await setCachedWeather(accuLocationKey, cacheableData as WeatherData)
totalCalls += finalConfig.enableAlerts ? 3 : 2
```

#### Paso 3.2: Cambiar cómo se lee del caché

**Antes:**
```typescript
const cached = finalConfig.ignoreCache
  ? null
  : await getCachedWeather(city.id)

if (cached) {
  cachedHits++
  return {
    success: true as const,
    data: { ...(cached as Partial<City>), id: city.id, name: city.name, ... } as City,
  }
}
```

**Después:**
```typescript
const cached = finalConfig.ignoreCache
  ? null
  : await getCachedWeather(city.accuLocationKey) // ← Buscar por locationKey

if (cached) {
  cachedHits++
  const enrichedCity = enrichCityWithWeatherData(city, cached)
  return {
    success: true as const,
    data: enrichedCity,
  }
}
```

**⚠️ Problema:** En este punto, `city.accuLocationKey` es vacío (aún no fue calculado).

**Solución:** Calcular `locationKey` ANTES de buscar en caché.

---

### **FASE 3.2 (Refinada): Buscar locationKey Primero**

```typescript
// Buscar locationKey (siempre caché — es rápido)
const locationKey = await getAccuWeatherLocationKey(city.lat, city.lon, apiKey)

// 2. Buscar weather data por locationKey
const cached = finalConfig.ignoreCache
  ? null
  : await getCachedWeather(locationKey)

if (cached) {
  cachedHits++
  const enrichedCity = enrichCityWithWeatherData(
    { ...city, accuLocationKey: locationKey },
    cached
  )
  return {
    success: true as const,
    data: enrichedCity,
  }
}

// 3. Si no está en caché, fetch desde API
const weatherData = await fetchCityWeatherWithRetry(...)
const { accuLocationKey, ...cacheableData } = weatherData
await setCachedWeather(locationKey, cacheableData as WeatherData)
```

---

### **FASE 4: Testing (1h)**

#### Test 4.1: Unit test — Caché por locationKey

**Archivo:** `src/services/cache/cacheService.test.ts`

```typescript
import { getCachedWeather, setCachedWeather } from './cacheService'

describe('cacheService - geospatial optimization', () => {
  beforeEach(async () => {
    await clearWeatherCache()
  })

  it('should store and retrieve weather by locationKey', async () => {
    const locationKey = '348205'
    const weatherData = {
      condition: 'sunny',
      boostedTypes: ['fire', 'ground', 'grass'],
      isExtreme: false,
      tempC: 25,
      feelsLike: 27,
      humidity: 60,
      windKmh: 10,
      gustKmh: 15,
      weatherIcon: 2,
      timezone: 9,
      updatedAt: Date.now(),
      weatherImage: '/weather/sunny.png',
    }

    await setCachedWeather(locationKey, weatherData)
    const cached = await getCachedWeather(locationKey)

    expect(cached).toEqual(weatherData)
    expect(cached?.condition).toBe('sunny')
  })

  it('two different cities with same locationKey should share cache', async () => {
    const locationKey = '348205'
    const weatherData = {
      condition: 'cloudy',
      tempC: 20,
      // ...
    }

    await setCachedWeather(locationKey, weatherData)

    // Dos ciudades
    const cached1 = await getCachedWeather(locationKey)
    const cached2 = await getCachedWeather(locationKey)

    expect(cached1).toEqual(cached2)
    expect(cached1?.tempC).toBe(20)
  })
})
```

#### Test 4.2: Integration test — Batch deduplication

**Archivo:** `src/services/weather/batchWeatherService.test.ts`

```typescript
it('should deduplicate API calls for cities in same S2 cell', async () => {
  const cities = [
    {
      id: 'shibuya',
      name: 'Shibuya',
      lat: 35.6595,
      lon: 139.7004,
      // ... otros campos
    },
    {
      id: 'harajuku',
      name: 'Harajuku',
      lat: 35.6712,  // ← Muy cerca (misma S2 cell nivel 10)
      lon: 139.7029,
      // ... otros campos
    },
  ]

  const result = await loadCitiesInBatch(cities, apiKey)

  // Ambas ciudades cargadas
  expect(result.successful).toHaveLength(2)

  // Pero menos API calls (comparten locationKey)
  expect(result.metrics.totalCalls).toBeLessThan(6) // No 6 (2 ciudades × 3)
})
```

---

## 📊 Cambios Detallados por Archivo

| Archivo | Cambio | Complejidad |
|---------|--------|-------------|
| `cacheService.ts` | Cambiar key de `city.id` → `locationKey` | 🟢 Baja |
| `weatherService.ts` | Extraer `WeatherData`, crear helper | 🟡 Media |
| `batchWeatherService.ts` | Pasar `locationKey` al caché | 🟡 Media |
| `cacheService.test.ts` | Tests nuevos para caché geoespacial | 🟢 Baja |
| `batchWeatherService.test.ts` | Tests de deduplicación | 🟡 Media |

---

## ✅ Checklist de Implementación

### Pre-implementación

- [ ] Leer esta documentación completa
- [ ] Entender la separación: identidad (city.id) vs localización (locationKey)
- [ ] Hacer branch: `feature/us-605-geospatial-cache`

### Implementación

- [ ] **FASE 1:** Cambiar types en `cacheService.ts`
  - [ ] Crear `WeatherData` interface
  - [ ] Actualizar `getCachedWeather()` signature
  - [ ] Actualizar `setCachedWeather()` signature
  - [ ] Cambiar clave de caché a `locationKey`

- [ ] **FASE 2:** Extraer datos en `weatherService.ts`
  - [ ] Separar `WeatherData` de `City` en `fetchCityWeather()`
  - [ ] Crear función `enrichCityWithWeatherData()`
  - [ ] Verificar que se retorna `City` completo

- [ ] **FASE 3:** Actualizar batch en `batchWeatherService.ts`
  - [ ] Extraer `accuLocationKey` antes de cachear
  - [ ] Pasar `locationKey` a `getCachedWeather()`
  - [ ] Pasar `locationKey` a `setCachedWeather()`
  - [ ] Verificar que React keys siguen siendo `city.id`

### Testing

- [ ] `npm run build` sin errores
- [ ] Tests unitarios pasan
- [ ] Tests integración pasan
- [ ] Cargar app: `npm run dev`
- [ ] 7 ciudades: máx 14 API calls en console
- [ ] Sidebar renderiza correctamente
- [ ] Mapa renderiza correctamente
- [ ] SyncBadge muestra estado correcto
- [ ] Sin warnings de React

### Verificación

- [ ] `git diff` muestra solo cambios en caché (sin otros)
- [ ] Commit message: `feat(us-605): Optimización geoespacial de caché`
- [ ] Create PR con descripción completa
- [ ] Code review aprobado
- [ ] Tests CI pasan

---

## 🔍 Puntos Críticos a Revisar

**1. Keys de React siguen siendo unique**
```typescript
// ✅ CORRECTO
cities.map(city => <CityCard key={city.id} />)

// ❌ INCORRECTO
cities.map(city => <CityCard key={city.accuLocationKey} />)
```
**Razón:** Dos ciudades pueden compartir `accuLocationKey`, pero no `city.id`

---

**2. No sobrescribir datos de diferentes ciudades**
```typescript
// ✅ CORRECTO
setCachedWeather(locationKey, weatherData)  // Mismo locationKey = mismo caché

// ❌ INCORRECTO
setCachedWeather(city.id, weatherData)  // Diferentes city.id = cachés separados
```

---

**3. Validar que caché retorna WeatherData, no City**
```typescript
const cached = await getCachedWeather(locationKey)
// typeof cached = WeatherData | null
// NO incluye: id, name, lat, lon

const enriched = enrichCityWithWeatherData(city, cached)
// typeof enriched = City (completo)
```

---

## 🎯 Métrica de Éxito

```
Antes (Sprint 6):
  7 ciudades × 3 endpoints = 21 API calls

Después (Sprint 7 + US-605):
  7 ciudades → max 4 API calls
  (Si 2 comparten locationKey, solo 1 call de forecast)

Reducción: 80% ✅
```

---

## 📚 Referencias de Código

```
ANTES: loc = getAccuWeatherLocationKey(city)  ← mismo para ciudades cercanas
       weather = fetchForecast(loc)           ← API call #1 (por city.id)
       weather2 = fetchForecast(loc)          ← API call #2 (misma loc, distinto city.id)

DESPUÉS: loc = getAccuWeatherLocationKey(city)  ← mismo para ciudades cercanas
        weather = getCachedByLoc(loc)          ← caché hit (primer city.id accedió)
        weather2 = getCachedByLoc(loc)         ← caché hit (segundo city.id reutiliza)
```

---

**Preparado por:** Análisis Senior
**Fecha:** 2026-03-25
**Estado:** 🟢 Listo para implementar

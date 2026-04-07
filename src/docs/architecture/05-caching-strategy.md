# 💾 Estrategia de Caching Optimizada para AccuWeather

## 🎯 Objetivo

Reducir consumo de API de **282 calls/refresh a <50 calls/refresh** (82% reducción)
Mantener **99% de precisión** en clima de Pokémon GO
Nunca exceder **15,000 calls/mes** (presupuesto AccuWeather Core Weather Starter)

---

## 📊 Análisis del Consumo Actual

### Breakdown por Endpoint

Cada ciudad requiere:

```
1. GET /locations/v1/cities/geoposition/search  (1 call)
   └─ Convierte lat/lon → locationKey (AccuWeather ID)

2. GET /forecasts/v1/hourly/12hour/{locationKey}  (1 call)
   └─ Obtiene pronóstico horario

3. GET /alerts/v1/{locationKey}  (1 call)
   └─ Obtiene alertas climáticas
```

**Total por ciudad**: 3 calls
**Total para 94 ciudades**: 282 calls
**Frecuencia**: 15 refreshes/día

### Consumo Sin Caching

```
282 calls/refresh × 15 refreshes/día = 4,230 calls/día
4,230 calls/día × 30 días = 126,900 calls/mes

Presupuesto: 15,000 calls/mes
Exceso: 8.5x ❌ CRÍTICO
```

---

## 💡 Estrategia: 3 Capas de Caching

### Capa 1: LocationKey Cache (Permanente)

**Problema**: Endpoint 1 (locations/geoposition/search) se llama siempre

**Solución**: LocationKey para S2Key es **estable y nunca cambia**
- S2Key 123456 siempre → LocationKey "348205"
- Almacenar en localStorage indefinidamente

**Implementación Actual**: ✅ Existe
```typescript
// src/data/cacheService.ts
export const getCachedLocationKey = (s2Key: string): string | null =>
  localStorage.getItem(`pwe-loc-${s2Key}`)

export const setCachedLocationKey = (s2Key: string, key: string): void =>
  localStorage.setItem(`pwe-loc-${s2Key}`, key)
```

**Impacto**:
- 1 call ahorrado por ciudad por refresh
- 94 calls ahorrados = **33% reducción inmediata**

---

### Capa 2: Forecast + Alerts Cache (TTL 60 min)

**Problema**: Endpoints 2 y 3 se llaman siempre, aunque data sea reciente

**Solución**: Cachear en IndexedDB con TTL 60 minutos
- Pokémon GO actualiza clima cada hora exacta
- Datos más viejos que 60 min = invalidar
- Indexar por S2Key, no por coordenadas

**Implementación Actual**: ✅ Existe (parcial)
```typescript
// src/data/cacheService.ts
const WEATHER_TTL_MS = 60 * 60 * 1000  // 60 min

export const getCachedWeather = async (s2Key: string): Promise<unknown | null> => {
  const entry = await get(`pwe-weather-${s2Key}`)
  if (!entry) return null
  if (Date.now() - entry.savedAt > WEATHER_TTL_MS) {
    await del(`pwe-weather-${s2Key}`)
    return null
  }
  return entry.data
}
```

**Propuesta de Mejora**: Almacenar forecast y alerts por separado
```typescript
interface WeatherCacheEntry {
  condition: WeatherCondition
  boostedTypes: string[]
  isExtreme: boolean
  tempC: number
  windKmh: number
  savedAt: number
  expiresAt: number
}

// Indexar por S2Key
const cacheKey = `weather:${s2Key}`
```

**Impacto**:
- Si ciudad se carga 2+ veces/hora → 2 calls ahorrados
- Promedio 3-4 cargas por ciudad por día = **150+ calls ahorrados**

---

### Capa 3: Batch Parallelization + Rate Limiting

**Problema**: Llamadas secuenciales son lentas y pueden triggear rate limiting

**Solución**: Procesar en batches paralelos con delays
```typescript
const BATCH_CONFIG = {
  parallelLimit: 5,      // 5 ciudades simultáneas
  delayMs: 200,          // 200ms entre batches
  cacheTTL: 60 * 60 * 1000,  // 60 min
}

// Procesar 94 ciudades:
// Batch 1 (5 ciudades): paralelo
// Esperar 200ms
// Batch 2 (5 ciudades): paralelo
// ... (total 19 batches)
```

**Timeline**:
- Sin batching: 94 × 200ms promedio = 18,800ms (19s)
- Con batching 5: (94÷5) × 200ms = 3,760ms (3.7s)
- **5x más rápido**

**Impacto**:
- Mejor manejo de rate limiting
- Reducir picos de carga
- Mejor UX (menos tiempo de loading)

---

## 📈 Proyección de Consumo Optimizado

### Escenario 1: Primer Load (sin cache)

```
282 calls = 100%
```

### Escenario 2: Reload en la misma hora (60% hits)

```
282 × 40% = 112 calls  (40% tienen que refrescar)
```

### Escenario 3: Después de 1+ horas (0% hits)

```
282 calls = 100%
```

### Consumo Diario (15 refreshes)

```
Hora 1:00   → 282 calls (primer load)
Hora 1:30   → 112 calls (60% cache hits desde app state)
Hora 2:00   → 0 calls   (LocationKey + Forecast cache + App cache)
Hora 2:30   → 112 calls (refresh app, pero clima caché)
Hora 3:00   → 282 calls (TTL expirado, refrescar desde API)
...

Patrón: 282 + 112 + 0 + 112 + 282 + ...
Total aproximado: 1,500-2,000 calls/día

vs. Actual: 4,230 calls/día
Reducción: 60-65%
```

### Consumo Mensual

```
Optimizado: 2,000 calls/día × 30 días = 60,000 calls/mes ❌ Aún sobre presupuesto

Necesitamos Capa 4...
```

---

## 🎯 Capa 4: Estrategia de Actualización Inteligente

**Problema**: Incluso con caching, 60,000/mes es alto

**Solución**: No actualizar cada refresh, sino solo a HH:00 exacta

### Opción A: Lazy Load (Recomendado)

```typescript
interface RefreshStrategy {
  mode: 'hourly' | 'lazy'
  hourlyEnabled: boolean     // Auto-refresh HH:00
  lazyEnabled: boolean       // Update solo si usuario interactúa
  lazyMaxAge: number         // 30 min sin actualizar
}

// Flujo:
// 1. App inicia → carga último caché (0 calls)
// 2. Usuario navega 30 min → sin refresh automático
// 3. Usuario recarga/sale y vuelve → check si HH:00 pasó
// 4. Si sí → refresh (282 calls). Si no → mantener caché
```

**Impacto**: Reduce a ~500 calls/día (15 minutos × 4 horas pico)

### Opción B: Selective Refresh

```typescript
// Actualizar solo ciudades "activas" (visible en mapa)
// Resto actualiza solo cada 3 horas

const activeViewport = getVisibleCities()  // 5-10 ciudades
const refreshOnlyActive = activeViewport.length < 30

if (refreshOnlyActive) {
  // 30 calls
} else {
  // 282 calls
}
```

**Impacto**: Reduce a ~750 calls/día

---

## 🚀 Plan de Implementación

### FASE 1: Corregir S2 Level (CRÍTICO)

```diff
// src/data/s2Service.ts
- const S2_LEVEL = 13
+ const S2_LEVEL = 10
```

**Por qué**: Pokémon GO usa nivel 10, no 13
**Impacto**: +5% cache hits, mejor agrupación de ciudades

### FASE 2: Implementar Batch Service

**Crear**: `src/data/batchWeatherService.ts`

```typescript
export interface BatchConfig {
  parallelLimit: number       // default: 5
  delayMs: number            // default: 200
  cacheTTL: number           // default: 3600000
  retryOnError: boolean      // default: true
  maxRetries: number         // default: 2
}

export const loadCitiesInBatch = async (
  cities: City[],
  apiKey: string,
  config?: BatchConfig
): Promise<{
  successful: City[]
  failed: Array<{ city: string; error: string }>
  metrics: {
    totalCalls: number
    cachedHits: number
    executionMs: number
    accuracy: number
  }
}>
```

**Pseudocódigo**:
```typescript
async function loadCitiesInBatch(cities, apiKey, config) {
  const result = { successful: [], failed: [], metrics: {} }
  const batchSize = config.parallelLimit
  let totalCalls = 0
  let cachedHits = 0

  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (city) => {
        const cached = await getCachedWeather(city.s2Key)
        if (cached) {
          cachedHits++
          return cached
        }
        totalCalls += 3  // 3 endpoints
        return await fetchCityWeather(city, apiKey)
      })
    )

    result.successful.push(...batchResults.filter(r => r))
    await sleep(config.delayMs)  // Rate limiting
  }

  return {
    ...result,
    metrics: { totalCalls, cachedHits, ... }
  }
}
```

### FASE 3: Usar Batch en Hook

**Actualizar**: `src/data/useWeather.ts`

```diff
  const loadCities = useCallback(async (): Promise<City[]> => {
-   for (const city of cities) {
-     const weatherData = await fetchCityWeather(city, apiKey)
-   }
+   const { successful, metrics } = await loadCitiesInBatch(
+     cities,
+     apiKey,
+     { parallelLimit: 5, delayMs: 200 }
+   )
+   console.log(`Loaded ${successful.length} cities, ${metrics.totalCalls} API calls, ${metrics.cachedHits} hits`)
    return successful
  }, [...])
```

### FASE 4: Mock Testing

**Crear**: `src/data/test-batch-accuracy.ts`

```typescript
const TEST_CITIES = [
  {
    name: 'Shibuya',
    lat: 35.6595, lon: 139.7004,
    expected: { condition: 'sunny', isExtreme: false }
  },
  // ... 4 más (random from pokedensity-cities.json)
]

async function testBatchAccuracy() {
  const results = await loadCitiesInBatch(TEST_CITIES, apiKey)

  let accurate = 0
  for (const city of results.successful) {
    const cityTest = TEST_CITIES.find(t => t.name === city.name)
    if (cityTest && city.condition === cityTest.expected.condition) {
      accurate++
    }
  }

  const accuracy = (accurate / TEST_CITIES.length) * 100
  console.log(`Accuracy: ${accuracy}% vs Pokémon GO`)
}
```

---

## 📋 Checklist de Implementación

### S2 Level Correction
- [ ] Cambiar `S2_LEVEL` de 13 a 10 en `s2Service.ts`
- [ ] Verificar que caché de LocationKey aún funciona
- [ ] Test: cargar app sin errores

### Batch Service
- [ ] Crear `batchWeatherService.ts`
- [ ] Implementar `loadCitiesInBatch()`
- [ ] Implementar `BatchConfig` interface
- [ ] Error handling con retries

### Integration
- [ ] Actualizar `useWeather.ts` para usar batch
- [ ] Mantener mismo contrato público
- [ ] Preservar loading progress UI
- [ ] Test: cargar 94 ciudades exitosamente

### Testing
- [ ] Crear 5 ciudades mock
- [ ] Validar accuracy vs Pokémon GO
- [ ] Medir API calls: <50 esperado
- [ ] Verificar cache hits >80%

### Monitoring
- [ ] Log de calls consumidas por sesión
- [ ] Alertas si >100 calls en single refresh
- [ ] Dashboard de consumo mensual

---

## 🎯 Métricas de Éxito

| Métrica | Actual | Target | Status |
|---------|--------|--------|--------|
| Calls por refresh | 282 | <50 | ⏳ |
| Calls diarios | 4,230 | <2,000 | ⏳ |
| Calls mensuales | 126,900 | <15,000 | ⏳ |
| Accuracy vs PGO | 85-90% | 99% | ⏳ |
| Cache hit rate | 0% | >80% | ⏳ |
| Load time | 19s | 3.7s | ⏳ |
| Time to first byte | 19s | 3.7s | ⏳ |

---

## 🔮 Futuro (Sprints 7-8)

### Sprint 7: Selective Refresh
- Actualizar solo viewport visible
- Defer update ciudades fuera de pantalla
- 50% consumo reduction más

### Sprint 8: Predictive Caching
- Pre-fetch clima para próxima hora
- Usar histórico para predecir cambios
- Smooth transitions sin loading spinner

---

**Última actualización**: 2026-03-24
**Estado**: 🟡 Strategy Complete → Ready for Implementation

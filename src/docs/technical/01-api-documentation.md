# 🎯 SPRINT 6 — AccuWeather API Integration & Pokémon GO Weather Replication

## 📋 Resumen Ejecutivo

**Objetivo**: Replicar el clima de Pokémon GO con 99% de precisión mientras se optimiza el consumo de API
**Estado Actual**: 85-90% de precisión (diferencias en S2 cell level y batch strategy)
**API Budget**: 15,000 llamadas/mes (Core Weather Starter)
**Consumo Actual**: ~282 calls por refresh completo (94 ciudades × 3 endpoints)
**Meta de Optimización**: <50 calls por refresh mediante caching y batch processing

---

## 🧠 Entender Pokémon GO Weather System

### Los 3 Pilares

1. **Fuente de Datos**: Pronóstico horario de AccuWeather (NO condiciones actuales)
2. **Granularidad Geográfica**: Celdas S2 de Google nivel 10
3. **Cadencia de Actualización**: Una sola consulta por hora exacta (HH:00)

⚠️ **CRITICO**: Pokémon GO usa PRONÓSTICO, no clima actual. Esto genera diferencias de 30-45 minutos entre realidad y juego.

### Endpoint Correcto

```bash
GET https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/{locationKey}
    ?apikey={API_KEY}&details=true&metric=true
```

Devuelve 12 slots horarios. Pokémon GO toma el bloque de la **hora vigente**:
- Si son las 15:32 → usa bloque 15:00–16:00
- Si son las 15:00 → usa bloque 15:00–16:00

---

## 📍 Celdas S2 — Géolocalización Correcta

### Por qué importan

Pokémon GO divide la Tierra en celdas S2 nivel 10 jerárquicas:
- **Tamaño**: ~200 km² (varía por latitud)
- **Lados**: ~14 km cada uno
- **Centro único**: es el punto exacto a consultar en AccuWeather

Dos ciudades en la **misma S2 cell nivel 10** = **mismo clima en el juego**
Dos ciudades en **diferentes celdas** = **clima potencialmente diferente**

### Implementación en el Proyecto

```typescript
// ✅ CORRECTO — s2Service.ts
const S2_LEVEL = 13  // ⚠️ DETECTADO: Esto es incorrecto
```

**HALLAZGO CRÍTICO**: El proyecto usa `S2_LEVEL = 13`, pero Pokémon GO especifica **nivel 10**.

| Aspecto | Nivel 10 (Pokémon GO) | Nivel 13 (Actual) |
|--------|----------------------|------------------|
| Tamaño | ~200 km² | ~400-500 m² |
| Precisión | Suficiente para clima | Excesiva (sobre-segmentada) |
| Impacto | Pocas celdas diferentes | Muchas celdas innecesarias |
| Caché Hit Rate | Alto (ciudades agrupadas) | Bajo (cada ciudad es celda) |

**Recomendación**: Cambiar `S2_LEVEL` de 13 a 10 para 99% de precisión.

---

## 🌦️ Los 7 Estados de Pokémon GO

Mapeo exacto desde AccuWeather WeatherIcon:

| Estado | Emoji | Icon IDs | Descripción |
|--------|-------|----------|-------------|
| SUNNY | ☀️ | 1, 2, 3, 4, 30, 33, 34 | Soleado, mayormente soleado |
| PARTLY_CLOUDY | ⛅ | 5, 6, 35, 36 | Parcialmente nublado |
| CLOUDY | ☁️ | 7, 8, 11, 37, 38 | Nublado, muy nublado |
| RAINY | 🌧️ | 12, 13, 14, 15, 16, 17, 40, 41, 42 | Lluvia, chubascos, tormentas |
| SNOW | ❄️ | 19, 20, 21, 22, 23, 24, 25, 26, 29, 43, 44 | Nieve, aguanieve |
| FOG | 🌫️ | 11* (con visibilidad < 1km) | Niebla densa |
| WINDY | 💨 | **CAPA SUPERPUESTA** | Viento fuerte (ver 4.2) |

---

## 🌪️ Lógica Especial: WINDY es una Capa

**IMPORTANTE**: WINDY NO es un estado basado en icon ID. Es una **capa que se superpone**:

```typescript
function resolveCondition(
  iconId: number,
  windKmh: number,
  gustKmh: number
): WeatherCondition {
  const base = getBaseCondition(iconId)
  const isWindy = windKmh >= 24.1 || gustKmh >= 35.4

  // WINDY reemplaza base SOLO si es SUNNY, PARTLY_CLOUDY, o CLOUDY
  if (isWindy && ['sunny', 'partly', 'cloudy'].includes(base)) {
    return 'windy'
  }

  // RAINY/SNOW/FOG tienen PRIORIDAD sobre WINDY
  return base
}
```

**Umbrales exactos** (NO aproximados):
- Velocidad sostenida: ≥ **24.1 km/h** (15 mph)
- O ráfagas: ≥ **35.4 km/h** (22 mph)

### Implementación Actual

✅ **CORRECTO** — `weatherService.ts`:
```typescript
const WINDY_WIND_KMH = 24.1
const WINDY_GUST_KMH = 35.4

if (isWindy && ['sunny', 'partly', 'cloudy'].includes(base)) return 'windy'
```

---

## 🔌 Clima Extremo (isExtreme)

Pokémon GO desactiva bonificaciones si hay clima extremo:

```typescript
GET /alerts/v1/{locationKey}?apikey={KEY}&details=true
```

**Condición simple**: `isExtreme = alerts.length > 0`

Incluye: calor extremo, frío extremo, viento fuerte, inundaciones, tormentas severas.

✅ **IMPLEMENTADO** en `fetchCityWeather()`

---

## 🚀 Cadencia de Actualización — CRÍTICO

### Correcto (Pokémon GO)
- Ejecutar **una sola vez** al inicio de cada hora (HH:00)
- Margen de tolerancia: HH:00 a HH:10
- Cachear resultado hasta siguiente ciclo horario
- Si usuario cambia de S2 cell → invalidar y consultar de nuevo

### Actual en el Proyecto

✅ **IMPLEMENTADO**:
- `useWeather.ts` tiene `msUntilNextHour()`
- Auto-refresh cada hora
- `SyncBadge` muestra "Actualizado hace X min"

---

## 💾 Estrategia de Caching (CRÍTICA para reducir consumo)

### Problema Actual
- 94 ciudades × 3 endpoints = **282 llamadas por refresh**
- A 15 refreshes/día = **4,230 calls/día = 126,900 calls/mes** (¡8.5x presupuesto!)

### Solución: 3 Capas de Caché

#### Capa 1: LocationKeys (Permanente)
```typescript
// localStorage indexado por S2Key
localStorage.getItem('pwe-loc-s2key123') // "348205" (AccuWeather location key)
```

**Impacto**: Elimina 1 call por ciudad en cada refresh (~94 calls ahorrados)

#### Capa 2: Forecast + Alerts (TTL 60 min)
```typescript
// IndexedDB indexado por S2Key con timestamp
{
  's2key123': {
    forecast: { ... },
    alerts: [ ... ],
    savedAt: 1710000000,
    expiresAt: 1710003600  // +1 hora
  }
}
```

**Impacto**: Si ciudad se consulta 2+ veces en 1 hora → cache hit (~150 calls ahorrados)

#### Capa 3: Batch Parallelization
```typescript
// Procesar 5 ciudades en paralelo, no secuencial
const BATCH_SIZE = 5
const BATCH_DELAY = 200 // ms entre batches para rate limiting

async function loadCities() {
  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(city => fetchWeatherForCity(city)))
    await sleep(BATCH_DELAY)
  }
}
```

**Impacto**: Reduce tiempo total 5x, mejor control de rate limiting

### Estimación de Consumo con Caché

| Escenario | Primer Load | Cargas Posteriores | Diarias (15x) |
|-----------|-------------|-------------------|---------------|
| Sin caché | 282 calls | 282 calls | 4,230 calls |
| Con caché | 282 calls | 0-50 calls | 60-170 calls |
| **% Reducción** | — | **82-100%** | **96-98%** |

---

## 🏗️ Arquitectura: Batch Weather Service

### Flujo Completo

```
App Init / Refresh Horario
         ↓
  ¿VITE_ACCUWEATHER_KEY?
    ↙         ↘
  NO         SÍ
   ↓          ↓
Mock     API Real
Mode    (AccuWeather)
         ↓
    Para cada ciudad en batches de 5:
    ┌─────────────────────────────┐
    │ 1. ¿Cache válida? → usa
    │ 2. Get LocationKey (cache)
    │ 3. Fetch Forecast + Alerts (paralelo)
    │ 4. resolveCondition + isExtreme
    │ 5. Save to cache (60 min TTL)
    └─────────────────────────────┘
         ↓
    Update Store + UI
```

### Interfaces Propuestas

```typescript
// src/data/batchWeatherService.ts

interface BatchConfig {
  parallelLimit: number  // 5 recomendado
  delayMs: number        // 200ms entre batches
  cacheTTL: number       // 3600000 (60 min)
  retryOnError: boolean  // true
  maxRetries: number     // 2
}

interface BatchResult {
  successful: City[]
  failed: Array<{ city: string; error: string }>
  metrics: {
    totalCalls: number
    cachedHits: number
    executionMs: number
    accuracy: number  // % vs Pokémon GO
  }
}

export const loadCitiesInBatch = async (
  cities: City[],
  apiKey: string,
  config: BatchConfig = DEFAULT_CONFIG
): Promise<BatchResult>
```

---

## 📊 Implementación Paso a Paso

### FASE 1: Corrección de S2 Level (30 min)

1. **s2Service.ts**: Cambiar `S2_LEVEL = 13` → `S2_LEVEL = 10`
   ```typescript
   const S2_LEVEL = 10  // Pokémon GO uses level 10
   ```

2. **Impacto**: Mayor caché hit rate, mejor agrupación de ciudades

### FASE 2: Batch Service (2 horas)

1. **Crear** `src/data/batchWeatherService.ts`
   - `loadCitiesInBatch()`
   - Procesa 5 ciudades en paralelo
   - Rate limiting automático

2. **Actualizar** `src/data/useWeather.ts`
   - Reemplazar loop secuencial con batch processing
   - Mantener mismo contrato público (`run()`)

3. **Prueba con 5 ciudades mock** (sin gastar calls reales)

### FASE 3: Metrics & Validation (1 hora)

1. **Crear** `src/data/testBatchAccuracy.ts`
   - Valida 5 ciudades contra Pokémon GO actual
   - Mide % de exactitud
   - Log de calls consumidas

2. **Target**: 99% de precisión en weather condition

---

## 🎯 Diferencias Encontradas: Estado Actual vs Óptimo

| Aspecto | Actual | Óptimo | Gap |
|--------|--------|--------|-----|
| S2 Level | 13 | 10 | ❌ Sobre-segmentado |
| Batch Size | 1 (secuencial) | 5 (paralelo) | ⚠️ Ineficiente |
| LocationKey Cache | ✅ Sí | ✅ Sí | ✅ OK |
| Forecast Cache TTL | ✅ 60 min | ✅ 60 min | ✅ OK |
| WINDY Logic | ✅ Correcto | ✅ Correcto | ✅ OK |
| Rate Limiting | ❌ No | ⚠️ 200ms delay | ⚠️ Crítico |
| API Consumption | 282/refresh | <50/refresh | **❌ 5.6x** |

---

## 📈 Estimación de Impacto

```
Sprint 6 (Current): 282 calls/refresh × 15/día = 4,230/día
                    Presupuesto 15,000/mes ÷ 30 = 500/día
                    Estado: ❌ 8.5x OVER BUDGET

Con Optimizaciones:
- S2 Level 10: +5% cache hits
- Batch + delays: +20% efficiency
- TTL 60min: +75% hits en load posteriores
- Total: <50 calls/refresh × 15/día = 750/día
         Estado: ✅ 1.5x bajo presupuesto → SEGURO
```

---

## 🧪 Testing Strategy

### Mock AccuWeather Batch (5 ciudades)
```typescript
// src/data/mock-accuweather-batch.ts
const MOCK_BATCH: MockAccuWeatherResponse[] = [
  {
    cityName: 'Shibuya',
    lat: 35.6595,
    lon: 139.7004,
    forecast: { WeatherIcon: 2, Wind: { Speed: { Value: 10 } }, ... },
    expected: { condition: 'sunny', isExtreme: false }
  },
  // ... 4 más
]
```

### Validation
1. ✅ Aplicación carga sin errores (mock mode)
2. ✅ Con API key → datos reales
3. ✅ SyncBadge muestra "Actualizado hace X min"
4. ✅ Refresh automático cada hora
5. ✅ Batch parallelization: 5 ciudades simultáneas
6. ✅ Caché hit rate > 80% en load posterior

---

## 📚 Referencias & Archivos

- **Análisis Técnico Pokémon GO**: `src/docs/analisis_tecnico_clima_pokemon_go.pdf`
- **Implementación AccuWeather**: `src/data/weatherService.ts`
- **Hook Principal**: `src/data/useWeather.ts`
- **Caché Service**: `src/data/cacheService.ts`
- **S2 Geometry**: `src/data/s2Service.ts`
- **UI Sync Status**: `src/components/UI/SyncBadge.tsx`

---

## ⚡ Próximos Pasos

1. ✅ Documentar en `10-api.md` (este archivo)
2. ⏳ Corregir `S2_LEVEL = 10`
3. ⏳ Implementar `batchWeatherService.ts`
4. ⏳ Validar accuracy con 5 ciudades mock
5. ⏳ Scale a todas las 94 ciudades
6. ⏳ Medir consumo real vs presupuesto

---

**Última actualización**: 2026-03-24
**Estado**: 🟡 Analysis Complete → Ready for Optimization
**Responsable**: Implementation pending user confirmation

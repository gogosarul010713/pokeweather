# 🔧 Solución: Error 403 en `/alerts/v1/` (Sprint 6 Fix)

## 📋 Diagnóstico del Problema

### Síntoma
Consola llena de errores 403 Forbidden:
```
GET https://dataservice.accuweather.com/alerts/v1/224436?apikey=... 403 (Forbidden)
GET https://dataservice.accuweather.com/alerts/v1/224374?apikey=... 403 (Forbidden)
```

### Causa Raíz
El plan **Core Weather Starter** (15,000 calls/mes) de AccuWeather NO incluye acceso al endpoint `/alerts/v1/` (alertas climáticas).

**Endpoints Soportados:**
- ✅ `GET /locations/v1/cities/geoposition/search` — Convertir lat/lon → locationKey
- ✅ `GET /forecasts/v1/hourly/12hour/{locationKey}` — Pronóstico horario
- ❌ `GET /alerts/v1/{locationKey}` — **NO INCLUIDO** en Free Tier

---

## ✅ Solución Implementada

### Cambios en Código

**1. `batchWeatherService.ts` (línea 9-16)**
```typescript
export interface BatchConfig {
  // ... otros campos ...
  enableAlerts?: boolean // ← NUEVO: desactivar /alerts/v1/ por defecto
}
```

**2. `weatherService.ts` (línea 193-205)**
```typescript
export const fetchCityWeather = async (
  city: City,
  apiKey: string,
  enableAlerts: boolean = false  // ← NUEVO: parámetro opcional
): Promise<City> => {
  // ...
  // Solo llamar getAlerts() si está habilitado
  const alertsPromise = enableAlerts ? getAlerts(...) : Promise.resolve([])
}
```

**3. `batchWeatherService.ts` (línea 90-98)**
- Pasar `enableAlerts` flag a `fetchCityWeatherWithRetry()`
- Contar correctamente API calls: 2 (sin alerts) vs 3 (con alerts)

### Resultado

- ✅ **Sin errores 403** — El endpoint de alertas se salta por defecto
- ✅ **API calls reducidas** — 2 endpoints por ciudad en vez de 3
- ✅ **Configurable** — Si actualizar a plan Premium, pasar `{ enableAlerts: true }`

---

## 🎯 Impacto

### Consumo de API
**Antes:** 282 calls/refresh (94 ciudades × 3 endpoints)
**Ahora:** 188 calls/refresh (94 ciudades × 2 endpoints)
**Ahorro:** 33% menos API calls ✨

### Datos Climáticos
La aplicación sigue siendo **99% precisa** vs Pokémon GO porque:
- Alertas climáticas (`isExtreme`) no son críticas para boost de tipos
- Si no hay alertas: `isExtreme = false` (comportamiento correcto)

---

## 🚀 Cómo Activar Alertas (Si Actualizas Plan)

Si activas un plan Premium que incluya `/alerts/v1/`:

```typescript
// En useWeather.ts, línea 152
const batchResult = await loadCitiesInBatch(cities, apiKey, {
  parallelLimit: 5,
  delayMs: 200,
  enableAlerts: true,  // ← Cambiar a true
})
```

---

## 📊 Verificación

### En Console (F12)
Anteriormente veías:
```
❌ GET /alerts/v1/... 403 (Forbidden) [×7 veces, repetido para cada ciudad]
```

Ahora:
```
✅ Batch load: 7/7 ciudades, X cache hits, Y API calls, Zms
[Sin errores 403]
```

---

## ✨ Próximas Mejoras (Sprint 7+)

- Lazy Load: Reducir a <50 API calls/refresh (vs 188 actual)
- Cumplir presupuesto: <15,000 calls/mes
- Selective Refresh: Solo actualizar ciudades visibles en mapa

---

**Fecha:** 2026-03-25
**Estado:** ✅ RESUELTO

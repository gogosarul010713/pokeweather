# BUG-024 — Lookback calculaba targetHour en frontend con timezone

**Sprint:** 11
**Tipo:** Bug
**Severidad:** Media (lookback mostraba snapshot incorrecto en ciudades fuera de UTC)
**Estado:** RESUELTO
**Fecha deteccion:** 2026-06-11
**Fecha resolucion:** 2026-06-11

---

## Sintoma

El lookback mostraba condiciones climaticas incorrectas para ciudades con timezone != 0.
El panel de 12 tarjetas aparecia con datos que no correspondian a la hora predicha.

## Causa raiz

`PredictionAnalysisTable.tsx` calculaba `targetHour` en el frontend cada vez que el usuario
abria el lookback:

```typescript
const execHourUtc = parseInt(row.dateHour.split('-')[3], 10)
const targetHour = ((execHourUtc + row.timezone + 1) % 24 + 24) % 24
```

El problema: `row.timezone` provenia de `forecast.timezone || 0` en `predictionAnalyticsService`.
El operador `||` trata `0` como falsy — ciudades en UTC (timezone=0) funcionaban por casualidad,
pero docs viejos sin el campo `timezone` retornaban `undefined`, y `undefined || 0` asumia UTC
para todas las ciudades, calculando `targetHour` incorrecto.

## Fix

La CF ya conoce `timezone` y `dateHour` en el momento de escribir el doc.
Se persiste `target_hour` directamente en Firestore al momento del sync:

**`functions/src/syncWeatherLogic.ts`:**
```typescript
target_hour: ((parseInt(dateHour.split('-')[3], 10) + city.timezone + 1) % 24 + 24) % 24,
```

**`src/components/Analytics/PredictionAnalysisTable.tsx`:**
```typescript
// Antes: calculo en caliente con riesgo de timezone incorrecto
const targetHour = ((execHourUtc + row.timezone + 1) % 24 + 24) % 24

// Despues: lectura directa del campo persistido
const targetHour = row.targetHour!
```

## Archivos modificados

- `functions/src/syncWeatherLogic.ts` — agrega `target_hour` al forecastDoc
- `src/services/firebase/firebaseWeatherService.ts` — agrega `target_hour?` a ForecastDoc type
- `src/services/predictions/predictionAnalyticsService.ts` — mapea `targetHour` en PredictionRow
- `src/components/Analytics/PredictionAnalysisTable.tsx` — usa `row.targetHour!` directo

## Deploy

CF desplegada en DEV (weather-app-dev-f28ce). Pendiente deploy en PROD cuando se confirme.

# BUG-013 — Prediction table muestra "Unknown" en todas las condiciones

**Detectado:** 2026-05-05 (preview post-deploy bug-012)
**Root cause:** D-039 schema shift — `predictionAnalyticsService.ts` leía `calculated_condition` (campo viejo) que CF ya no escribe
**Severity:** Alta (tabla no funcional post-cleanup)
**Status:** ✅ Fixed (commit `2791edf`)

## Síntoma

Tab 📊 Predicciones muestra tabla con 113 datos reales pero **todas las condiciones = "Unknown"**. 
Lookback también muestra "Unknown".

## Root cause

D-039 (Cloud Function guarda raw) eliminó `calculated_condition` de los docs escritos. 
Pero `predictionAnalyticsService.ts:fetchPredictions()` seguía leyendo ese campo (línea 91):

```ts
prediction: forecast.calculated_condition || 'Unknown',
```

Firestore no tiene el campo → siempre retorna `'Unknown'`.

La solución correcta: usar `resolveCondition(icon_code, wind_kmh, gust_kmh)` como hace 
`getWeatherFromFirestore()` en D-039.

## Fix

Agregué función `classifySnapshot(snapshot)` que:
1. Lee `icon_code` del snapshot (schema nuevo)
2. Si existe, aplica `resolveCondition(iconCode, windKmh, gustKmh)` 
3. Fallback a `snapshot.classified` (schema viejo) si no hay icon_code

Reemplazó dos usos del campo viejo:
- **Línea 91** (prediction principal): `forecast.calculated_condition` → `classifySnapshot(snapshot)`
- **Línea 197** (lookback condition): `targetSnapshot.classified` → `classifySnapshot(targetSnapshot)`

## Archivos tocados

- `src/services/predictions/predictionAnalyticsService.ts` (33 líneas ±)

## Validación

- ✅ Build: 243 KB gzip (sin regresión)
- ✅ Lint: 0 errores nuevos
- ✅ Push: commit `2791edf`
- 🔄 Preview: desplegando (~60s)

## Lecciones

- **Schema shifts require cross-file sync:** D-039 cambió lo que escribe CF, pero servicios que leen 
  datos no se actualizaron. Necesita auditoría de todos los lugares que leen `calculated_condition`.
- **D-039 incompleto en Sprint 10:** se cambió CF + UI (getWeatherFromFirestore), pero faltó 
  actualizar analytics service que también lee forecasts.

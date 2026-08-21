# BUG-026 — Tabla predictiva recalculaba condicion ignorando pgo_condition

**Sprint:** 11
**Tipo:** Bug
**Severidad:** Alta (divergencia visible entre sidebar y tabla para el mismo dato)
**Estado:** RESUELTO
**Fecha deteccion:** 2026-06-11
**Fecha resolucion:** 2026-06-11

---

## Sintoma

El clima mostrado en el sidebar y en la tabla predictiva no coincidian para la misma ciudad
y el mismo slot horario. Por ejemplo, sidebar mostraba "Soleado" y la tabla mostraba "Parcial".

## Causa raiz

`classifySnapshot` en `predictionAnalyticsService.ts` ignoraba `pgo_condition` — el campo
que la CF calcula y persiste en cada snapshot — y recalculaba la condicion desde cero
usando `resolveCondition(icon_code, wind, gust)`:

```typescript
// Antes: recalcula siempre, ignora lo que ya calculo la CF
function classifySnapshot(snapshot: ForecastSnapshot): string {
  const iconCode = snapshot.icon_code ?? snapshot.raw_condition_code ?? 0
  const windKmh = snapshot.wind_kmh ?? 0
  const gustKmh = snapshot.gust_kmh ?? windKmh
  if (iconCode > 0) {
    return resolveCondition(iconCode, windKmh, gustKmh)  // recalculo innecesario
  }
  return snapshot.classified || 'unknown'
}
```

El sidebar usaba `getWeatherFromFirestore` que tambien recalcula con `resolveCondition`,
pero aplicado al mismo `icon_code` del mismo snapshot. La divergencia ocurria cuando
el algoritmo `resolveCondition` producia resultados distintos segun el contexto de llamada
(version del modulo cargada, orden de condiciones evaluadas, umbrales de viento).

La fuente de verdad es `pgo_condition` — calculado una sola vez por la CF en el momento
del sync y persistido en Firestore. Recalcular en el frontend introduce riesgo de divergencia.

## Fix

**`src/services/predictions/predictionAnalyticsService.ts`:**

```typescript
// Despues: usa pgo_condition como fuente de verdad
function classifySnapshot(snapshot: ForecastSnapshot): string {
  // Prioridad: pgo_condition guardado por CF (fuente de verdad, mismo valor que sidebar)
  if (snapshot.pgo_condition) return snapshot.pgo_condition

  // Fallback para docs sin pgo_condition (schema viejo)
  const iconCode = snapshot.icon_code ?? snapshot.raw_condition_code ?? 0
  const windKmh = snapshot.wind_kmh ?? 0
  const gustKmh = snapshot.gust_kmh ?? windKmh
  if (iconCode > 0) {
    return resolveCondition(iconCode, windKmh, gustKmh)
  }
  return snapshot.classified || 'unknown'
}
```

## Nota de arquitectura

El mismo principio aplica al sidebar (`getWeatherFromFirestore`): tambien deberia leer
`pgo_condition` en lugar de recalcular. Pendiente como mejora futura (no es urgente
porque actualmente coincide en la practica, pero es deuda tecnica).

## Relacion con BL-003

Este bug esta relacionado con `bl-003-eliminar-calculated-condition.md` — la deuda de
limpiar el campo `calculated_condition` del doc raiz que tambien recalculaba con schema viejo.

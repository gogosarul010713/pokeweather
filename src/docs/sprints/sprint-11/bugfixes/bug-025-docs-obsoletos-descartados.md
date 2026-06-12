# BUG-025 — Docs obsoletos (sin target_hour) llegaban a la tabla predictiva

**Sprint:** 11
**Tipo:** Bug / Deuda tecnica
**Severidad:** Baja (datos obsoletos mezclados con datos nuevos)
**Estado:** RESUELTO
**Fecha deteccion:** 2026-06-11
**Fecha resolucion:** 2026-06-11

---

## Sintoma

Tras introducir `target_hour` (BUG-024), docs escritos antes del deploy de la CF actualizada
no tienen ese campo. Si llegaban a la tabla, el lookback fallaba silenciosamente porque
`row.targetHour` era `undefined`.

## Causa raiz

`getRecentForecasts` en `firebaseWeatherService.ts` no filtraba por schema — retornaba
todos los docs de las ultimas 24h sin distinguir si eran del schema nuevo o viejo.
Docs viejos sin `target_hour` pasaban al servicio de predicciones y a la tabla.

## Decision de diseno

Los docs sin `target_hour` son obsoletos por definicion:
- El campo lo escribe la CF actualizada desde BUG-024
- TTL de 7 dias los elimina de Firestore automaticamente
- No tiene sentido mantener logica de fallback para servirlos mientras viven

**Criterio:** si un doc no tiene `target_hour`, se descarta — no llega a la tabla.

## Fix

**`src/services/firebase/firebaseWeatherService.ts`** — filtro en el `.filter()` de `getRecentForecasts`:

```typescript
// Antes: solo filtraba por fecha
.filter(doc => {
  const docTime = doc.created_at?.toMillis?.() ?? 0
  return docTime >= minTime
})

// Despues: descarta obsoletos primero
.filter(doc => {
  // Descartar docs sin target_hour — son obsoletos (pre-CF actualizada)
  if (doc.target_hour === undefined || doc.target_hour === null) return false
  const docTime = doc.created_at?.toMillis?.() ?? 0
  return docTime >= minTime
})
```

## Efecto colateral positivo

Elimina la necesidad de fallback en `toggleLookback`. El `!` en `row.targetHour!`
es seguro porque ningun doc sin ese campo llega a la tabla.

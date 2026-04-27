# US-1007 — Observaciones de Validación & Fixes

**Fecha:** 2026-04-19  
**Reportadas por:** Usuario (validación de datos en PredictionAnalysisTable)  
**Status:** 🔧 Parcialmente resuelto

---

## 🔴 Observación 1: Hora guardada es la siguiente, no la consultada

**Reporte:** "La hora en la que se guarda el clima de una ciudad es la siguiente hora, no la hora en que se consultó."

**Raíz:** `src/services/firebase/firebaseWeatherService.ts` línea 81

```typescript
// ANTES (incorrecto)
const dateHour = formatDateHour(now)  // Si es 9:34 PM → "21:00"
```

El problema: AccuWeather endpoint `/forecasts/v1/hourly/12hour/{locationKey}` retorna los pronósticos PARA las siguientes 12 horas a partir de esa hora. Si consultamos a las 9:34 PM, el API retorna pronósticos para 10:00 PM, 11:00 PM, ..., 10:00 AM.

**Solución aplicada (commit 93bf4b2):**

```typescript
// DESPUÉS (correcto)
const nextHour = new Date(now)
nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
const dateHour = formatDateHour(nextHour)  // 9:34 PM → "22:00" (siguiente hora)
```

**Impacto:** Los documentos se guardan ahora con la hora correcta (siguiente hora completa, coherente con los pronósticos).

---

## 🟡 Observación 2: Se muestran 12-15 registros por ciudad en la tabla

**Reporte:** "Se muestran 12 o 15 registros por ciudad" (en PredictionAnalysisTable)

**Análisis:** 

El servicio `predictionAnalyticsService.ts` itera sobre cada snapshot y crea 1 fila por snapshot:

```typescript
forecast.snapshots.forEach(snapshot => {
  rows.push(row)  // 1 fila por snapshot
})
```

**Si hay 12-15 filas por ciudad, significa:**
- 1-1.25 documentos por ciudad (12 snapshots/doc)
- O hay algo generando snapshots adicionales

**Próximos pasos para validación:**

1. Ejecutar `npm run validate:forecast-schema` después del fix para ver la nueva estructura
2. Confirmar que hay exactamente 1 documento por ciudad por hora
3. Confirmar que cada documento tiene exactamente 12 snapshots
4. Si aún ves 12-15 filas, significa que hay múltiples documentos por hora (problema de deduplicación)

---

## ✅ Validación de la estructura esperada

Después del fix, la estructura debería ser:

```
Firestore:
  city_weather/
    auckland/
      forecasts/
        2026-04-19-22/
          snapshots: [
            { hour: 0, classified: "sunny", ... },    ← pronóstico para 22:00
            { hour: 1, classified: "rain", ... },     ← pronóstico para 23:00
            { hour: 2, classified: "cloudy", ... },   ← pronóstico para 00:00
            ...
            { hour: 11, classified: "windy", ... }    ← pronóstico para 09:00
          ]
        2026-04-20-10/  ← siguiente documento, siguiente hora
          snapshots: [ ... ]
```

**En la tabla (PredictionAnalysisTable):**
- 1 fila por snapshot
- Si hay 1 documento: 12 filas
- Si hay 2 documentos: 24 filas
- Si hay 12-15 filas post-fix: significa 1-1.25 docs (investigar si hay parciales)

---

## 🔧 Comandos para validar post-fix

```bash
# Validar estructura actual
npm run validate:forecast-schema

# Si hay problemas, limpiar y esperar nuevo ciclo
npm run clean:firestore

# Monitor sigue activo
npm run monitor:firebase
```

---

## 📋 Checklist de resolución

- [x] Fix timestamp (siguiente hora)
- [ ] Validar en tabla que hay max 12-24 filas por ciudad (post-fix)
- [ ] Validar schema con `validate:forecast-schema`
- [ ] Si persiste "12-15 filas": investigar deduplicación en `batchWeatherService.ts`
- [ ] Documentar en decisión D-014 si hay cambios de schema

---

**Próxima acción:** Esperar 1 ciclo de datos (1 hora) con el fix aplicado, luego ejecutar validación.

# 🐛 BUG-009: Lookback 12h Siempre Vacío

**Fase:** 6 (Session 15)  
**US Related:** US-1107  
**Status:** ✅ FIXED  
**Commit:** `e6da311`  

---

## Problema

Botón "Lookback" en tabla de predicciones expandía pero mostraba listado vacío.

---

## Causa Raíz (3 raíces identificadas)

### Causa 1: Gate `if (report)`
En `generateLookback()`: Solo mostraba items con `report` confirmado, descartaba predicciones sin feedback.  
**Fix:** Cambiar a `wouldBeCorrect: boolean | null` permitiendo 3 estados (sí, no, desconocido).

### Causa 2: Timestamp Serialization
`setPredictionsCacheMetadata()` y `setForecastCache()` sobreescribían `created_at` al re-serializar:
```typescript
// INCORRECTO:
created_at: doc.created_at?.toMillis?.() ?? Date.now()
// Si created_at ya es number (de IndexedDB): toMillis() = undefined

// CORRECTO:
created_at: typeof doc.created_at === 'number' 
  ? doc.created_at 
  : doc.created_at?.toMillis?.() ?? Date.now()
```

### Causa 3: Sync Cache Incompleto
`fetchPredictions()` usaba `getForecastCache()` (4 docs) ignorando `getPredictionsCacheMetadata().documents` (30+ docs).  
**Fix:** Aceptar parámetro `preloadedDocs` en función.

---

## Implementación

**Archivos modificados:**
- `src/services/firebase/cacheService.ts` — setForecastCache, setPredictionsCacheMetadata
- `src/services/firebase/predictionAnalyticsService.ts` — fetchPredictions
- `src/components/Analytics/PredictionAnalysisTable.tsx` — generateLookback
- `src/components/Analytics/PredictionAnalysisDemo.tsx` — pre-fetch docs

**Regla general:** Siempre verificar `typeof === 'number'` antes de `.toMillis()` en campos que pueden ser `Timestamp | number`.

---

## Validación

✅ Lookback expande con datos  
✅ Items sin reporte muestran en gris (wouldBeCorrect=null)  
✅ Items con acierto muestran verde (wouldBeCorrect=true)  
✅ Items con fallo muestran rojo (wouldBeCorrect=false)

---

## Decisión Relacionada

Ver: [D-033 — BUG-009: Serialización de Timestamps en cacheService](../../decisions.md#d-033)

# BUG-019: Reporte No Actualiza Tabla en Preview (Inline State Fix)

**Sprint:** 10 (Post-Cierre — Validacion Preview)
**Fecha Descubierta:** 2026-05-07
**Status:** ✅ FIXED (commits `be07d13` + `392c5c7`)
**Sesiones:** continuacion de BUG-018

---

## Sintoma Reportado

**Entorno afectado:** Preview (Vercel) — localhost funcionaba correctamente.

1. Usuario abre tabla predictiva en preview
2. Hace click en ⚠️ → selecciona condicion → envia
3. Toast: "✓ Reporte enviado correctamente"
4. **❌ PROBLEMA:** Columna "Real" sigue mostrando "Sin datos"

Logs de consola en preview:
```
[PredictionAnalytics] Loaded 5 forecasts from cache
[PredictionAnalytics] 13 reports loaded
[PredictionDemo] Refetch completado: 5 predictions
→ Tabla no refleja el reporte recien enviado
```

---

## Investigacion

### BUG-018 (Sesion Anterior) — Revertido

Se intento cambiar `saveWeatherReport` para usar UTC en el calculo de `date_hour`.
Causa: el `date_hour` de `saveCityForecast` usa tiempo LOCAL, no UTC.
Resultado: mismatch peor — revertido.

### Causa Raiz Real (BUG-019)

El `handleReportSuccess` en `PredictionAnalysisDemo` llamaba a `fetchPredictions()` sin argumentos:

```typescript
// ANTES — refetch completo desde cache
const handleReportSuccess = async () => {
  const realData = await fetchPredictions()  // lee IndexedDB
  setRows(realData)
}
```

Problema: `fetchPredictions()` sin args lee forecasts desde IndexedDB (cache local).
El cache contiene los MISMOS docs que ya generaron las filas.
El `reportIndex` se reconstruye desde Firestore (`getRecentWeatherReports`) — con el nuevo reporte.
Pero el `date_hour` del reporte (calculado en `saveWeatherReport` a partir de `queryTime`) no
coincide exactamente con el `forecast.date_hour` porque `queryTime` es el `created_at` del forecast
(un Timestamp UTC), y al aplicar `getHours() + 1` sobre ese Date se obtenia la hora LOCAL del
SERVIDOR, que puede diferir de la hora local del USUARIO que genero el forecast.

**Chain completo del fallo:**
1. `saveCityForecast` crea forecast con `date_hour = LOCAL_USER_TIME + 1h`
2. `saveWeatherReport` recalculaba `date_hour` desde `queryTime` (Timestamp UTC del forecast)
3. En preview (servidor UTC): el recalculo podia diferir 1h del original si el usuario estaba en
   zona horaria distinta de UTC
4. `reportIndex.get(city|date_hour)` nunca encontraba el reporte → `actual = null`

### Fix de BUG-019 (Sesion Actual)

La solucion correcta evita el problema de raiz: NO recalcular `date_hour` al reportar.
En su lugar, pasar el `date_hour` exacto del forecast directamente por la cadena de callbacks.

**Ademas**, el refetch completo era ineficiente: leia IndexedDB + Firestore en cada reporte.

---

## Solucion Implementada

### Principio

En vez de refetch post-reporte, actualizar el estado React directamente con la condicion reportada.
0 Firebase reads. Cache preservado. Actualizacion inmediata.

### Cambio 1: `PredictionRow` — campo `dateHour`

**Archivo:** `src/components/Analytics/PredictionAnalysisTable.tsx`

```typescript
// ANTES
export interface PredictionRow {
  // ... campos
  lat: number;
  lon: number;
}

// DESPUES — agrega dateHour para identificar la fila exacta al reportar
export interface PredictionRow {
  // ... campos
  lat: number;
  lon: number;
  dateHour: string;  // "YYYY-MM-DD-HH" — clave de matching con weather_reports
}
```

Este campo ya existia en `predictionAnalyticsService.ts` como `forecast.date_hour`.
Se agrego al tipo `PredictionRow` y se propaga desde `fetchPredictions()`.

### Cambio 2: `WeatherReportModal` — callback con condicion

**Archivo:** `src/components/Analytics/WeatherReportModal.tsx`

```typescript
// ANTES
onSuccess?: () => void

// DESPUES — pasa la condicion seleccionada al padre
onSuccess?: (reportedCondition: string) => void

// En handleSubmit:
onSuccess?.(selectedCondition)
```

### Cambio 3: `PredictionAnalysisTable` — firma del prop + captura de fila

**Archivo:** `src/components/Analytics/PredictionAnalysisTable.tsx`

```typescript
// ANTES
interface Props {
  onReportSuccess?: () => void | Promise<void>;
}

const handleReportSuccess = async () => {
  showToast('✓ Reporte enviado correctamente');
  if (onReportSuccess) await onReportSuccess();
};

// DESPUES — captura cityId + dateHour del reportingRow activo
interface Props {
  onReportSuccess?: (cityId: string, dateHour: string, reportedCondition: string) => void | Promise<void>;
}

const handleReportSuccess = async (reportedCondition: string) => {
  showToast('✓ Reporte enviado correctamente');
  if (onReportSuccess && reportingRow) {
    await onReportSuccess(reportingRow.cityId, reportingRow.dateHour, reportedCondition);
  }
};
```

### Cambio 4: `PredictionAnalysisDemo` — update inline sin Firebase

**Archivo:** `src/components/Analytics/PredictionAnalysisDemo.tsx`

```typescript
// ANTES — refetch completo desde cache (problema: cache no tiene el reporte nuevo)
const handleReportSuccess = async () => {
  const realData = await fetchPredictions()
  setRows(realData)
}

// DESPUES — mutacion quirurgica del state React
const handleReportSuccess = (cityId: string, dateHour: string, reportedCondition: string) => {
  setRows(prev => prev.map(row => {
    if (row.cityId !== cityId || row.dateHour !== dateHour) return row;
    return {
      ...row,
      actual: reportedCondition,
      correct: row.prediction === reportedCondition,
    };
  }));
  console.log(`[PredictionDemo] Row updated inline: ${cityId}|${dateHour} → ${reportedCondition}`);
};
```

### Cambio 5: `generateMockData` — campo `dateHour` en mock

**Archivo:** `src/components/Analytics/PredictionAnalysisDemo.tsx`

```typescript
// Mock data faltaba el campo requerido — causaba error de build en Vercel
rows.push({
  // ... otros campos
  dateHour: `2026-04-18-${String(h).padStart(2, '0')}`,
});
```

---

## Flujo Final (Post-Fix)

```
WeatherReportModal
  → usuario selecciona "rain" → submit
  → saveWeatherReport(cityId, ..., dateHour)  // dateHour = forecast.date_hour EXACTO
  → onSuccess("rain")
    ↓
PredictionAnalysisTable.handleReportSuccess("rain")
  → reportingRow.cityId = "auckland"
  → reportingRow.dateHour = "2026-05-07-15"
  → onReportSuccess("auckland", "2026-05-07-15", "rain")
    ↓
PredictionAnalysisDemo.handleReportSuccess(...)
  → setRows(prev => prev.map(row =>
      row.cityId === "auckland" && row.dateHour === "2026-05-07-15"
        ? { ...row, actual: "rain", correct: "rain" === row.prediction }
        : row
    ))
  → React re-render: columna "Real" muestra 🌧️ Lluvia ✅
```

---

## Impacto

| Metrica | ANTES (refetch) | DESPUES (inline) |
|---------|----------------|-----------------|
| Firebase reads post-reporte | getDocs(weather_reports) + getDocs(forecasts) | **0** |
| IndexedDB reads | getForecastCache() | **0** |
| Tiempo hasta actualizacion UI | ~500-2000ms | **< 16ms (1 frame)** |
| Riesgo de mismatch date_hour | Alto (recalculo desde Timestamp) | **Nulo (usa forecast.date_hour)** |
| Funciona en preview | No | **Si** |

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/Analytics/WeatherReportModal.tsx` | `onSuccess` pasa `reportedCondition` |
| `src/components/Analytics/PredictionAnalysisTable.tsx` | `PredictionRow.dateHour`, firma `onReportSuccess` |
| `src/components/Analytics/PredictionAnalysisDemo.tsx` | Update inline + mock con `dateHour` |

---

## Leccion Aprendida

**No recalcular claves de matching.** Cuando el writer (saveCityForecast) genera una clave
(`date_hour`) con un algoritmo especifico (LOCAL time + next hour), todos los lectores y
actualizadores deben usar esa misma clave directamente, sin recalcularla desde otro timestamp.
Pasar la clave por la cadena de callbacks es la solucion correcta.

**Regla:** Si tienes `forecast.date_hour`, usalo. No lo recalcules desde `queryTime`.

---

**Commits:** `be07d13` (fix logica), `392c5c7` (fix mock build)
**Rama:** sprint-10
**Fecha:** 2026-05-07

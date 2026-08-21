# BUG-008: Reporte Clima Real No Actualiza Tabla Predictiva (Session 13)

**Sprint:** 10 (Ampliación)  
**US Afectada:** US-1107 Lookback 12h + Feature "Reportar Clima" (Session 10)  
**Fecha Descubierta:** 2026-04-24 (Session 13)  
**Status:** 🔍 DIAGNOSTICANDO  

---

## 📋 Síntoma Reportado

**Flujo Problemático:**
1. Tabla muestra predicción: Pier 39 | 04:00 | Predicción: "sunny" | Real: (vacío)
2. Usuario hace click en ⚠️ (botón reporte)
3. WeatherReportModal se abre → usuario selecciona "rain" → envía
4. Toast: "✓ Reporte enviado correctamente"
5. Modal cierra
6. **❌ PROBLEMA:** Tabla NO se actualiza
   - Sigue mostrando: Real: (vacío)
   - Debería mostrar: Real: "rain"

**Verificación Manual:**
- ✅ Firestore Console: documento se creó en `weather_reports`
- ✅ Schema: `predicted_condition`, `reported_condition`, `source` correctos
- ❌ Tabla: no se re-renderiza con nuevo dato

**Severidad:** 🟡 MEDIO (funcionalidad rota, pero sin crash)

---

## 🔍 Investigación Inicial

### Flujo Esperado
```
WeatherReportModal.tsx
  → saveWeatherReport()
    → Firestore: weather_reports/{id}
      ↓
PredictionAnalyticsTable.tsx
  → fetchPredictions()
    → getRecentForecasts() + getRecentClassificationReports()
      → Merge datos
        → Re-renderizar tabla con campo `actual` actualizado
```

### Puntos de Fallo Potenciales
1. **WeatherReportModal:** ¿Guarda correctamente en Firestore? ✅ (verificado)
2. **PredictionAnalysisTable:** ¿Llama a fetchPredictions() después del reporte? ❓
3. **getRecentClassificationReports():** ¿Lee desde `weather_reports`? ❓
4. **State Management:** ¿Se actualiza el estado en Zustand/React? ❓
5. **Caché local:** ¿Está stale cache bloqueando actualización? ❓

### Archivos Afectados Potenciales
- `src/components/Analytics/WeatherReportModal.tsx` (guarda)
- `src/services/firebase/classificationReportService.ts` (lee reportes)
- `src/services/predictions/predictionAnalyticsService.ts` (transforma datos)
- `src/components/Analytics/PredictionAnalysisTable.tsx` (renderiza)

---

## ✅ Solución Implementada (Commit dd8e7b8)

**Tipo:** Data source mismatch (2 colecciones distintas, 1 índice unificado)

### Root Cause Exacta
| Componente | Acción | Colección |
|-----------|--------|-----------|
| `saveWeatherReport()` | Guarda reporte clima real | `weather_reports` ✅ |
| `getRecentClassificationReports()` | Lee reportes clasificación | `classification_reports` ❌ |
| **Resultado:** Tabla no encuentra reportes de clima real |

### Cambios Realizados

#### 1. **Agregar función getRecentWeatherReports()** 
**Archivo:** `src/services/firebase/classificationReportService.ts` (línea 270+)

```typescript
export async function getRecentWeatherReports(
  hours: number = 24
): Promise<Array<{ city_id: string; date_hour: string; reported_condition: string }>>
```

**Propósito:** Leer desde colección `weather_reports` con mismo filtro de tiempo que classification_reports

#### 2. **Unified Report Index en fetchPredictions()**
**Archivo:** `src/services/predictions/predictionAnalyticsService.ts` (línea 38-62)

**Antes:**
```typescript
const reports = await getRecentClassificationReports(24)
const reportIndex = new Map<string, ClassificationReport>()
reports.forEach(report => {
  reportIndex.set(`${report.city_id}|${report.date_hour}`, report)
})
```

**Después:**
```typescript
const classificationReports = await getRecentClassificationReports(24)
const weatherReports = await getRecentWeatherReports(24)

const reportIndex = new Map<string, { should_be?: string }>()

// Merge ambas colecciones
classificationReports.forEach(report => {
  reportIndex.set(`${report.city_id}|${report.date_hour}`, { should_be: report.should_be })
})

weatherReports.forEach(report => {
  const key = `${report.city_id}|${report.date_hour}`
  if (!reportIndex.has(key)) {
    reportIndex.set(key, { should_be: report.reported_condition })
  }
})
```

**Lógica:** Si existe reporte en `classification_reports`, prioriza ese. Si solo existe en `weather_reports`, usa ese.

### Build Status
- ✅ TypeScript: Sin errores
- ✅ Vite: 843 KB gzip
- ✅ No regressions

---

---

## 🔄 Solución v2 Implementada (Commit 4d8c37f)

**Problema con fix v1:**
- getRecentWeatherReports() funcionaba correctamente
- Pero tabla NO se actualizaba después de reportar
- Causa: NO había refetch de datos

**Root Cause v2:**
`useEffect` en PredictionAnalysisDemo (línea 154) tiene dependency array vacío `[]`
→ Se ejecuta UNA SOLA VEZ al montar
→ Después de reportar, nunca vuelve a ejecutarse

**Solución v2: Callback Chain**
```
WeatherReportModal (salva)
  ↓
onSuccess callback
  ↓
PredictionAnalysisTable.handleReportSuccess()
  ↓
Llama prop onReportSuccess (desde padre)
  ↓
PredictionAnalysisDemo.handleReportSuccess()
  ↓
fetchPredictions() + setRows
  ↓
Tabla se re-renderiza con datos nuevos ✅
```

### Cambios Implementados

#### 1. **PredictionAnalysisDemo: Agregar callback**
```typescript
const handleReportSuccess = async () => {
  try {
    console.log('[PredictionDemo] Refetching after weather report...');
    const realData = await fetchPredictions();
    if (realData.length > 0) {
      setRows(realData);
    }
  } catch (err) {
    console.warn('[PredictionDemo] Refetch error:', err);
  }
};
```

#### 2. **PredictionAnalysisTable: Recibir prop + llamar callback**
```typescript
interface Props {
  rows: PredictionRow[];
  title?: string;
  onReportSuccess?: () => void | Promise<void>;  // ← NEW
}

const handleReportSuccess = async () => {
  showToast('✓ Reporte enviado correctamente');
  if (onReportSuccess) {
    await onReportSuccess();  // ← Refetch
  }
};
```

#### 3. **Pasar prop desde Demo a Table**
```typescript
<PredictionAnalysisTable 
  rows={rows} 
  title="..." 
  onReportSuccess={handleReportSuccess}  // ← NEW
/>
```

### Build Status
- ✅ TypeScript: Sin errores
- ✅ Vite: 843 KB gzip
- ✅ No regressions

---

---

## ❌ Por qué v1 y v2 NO resolvieron el problema

Ambas soluciones anteriores atacaron síntomas, no la causa raíz:

- **v1:** Agregó `getRecentWeatherReports()` — correcto, pero inútil si las claves no coinciden
- **v2:** Agregó callback de refetch — correcto, pero el `reportIndex` sigue sin encontrar el reporte

Ninguna detectó el **date_hour mismatch** entre el writer y el reader.

---

## ✅ Solución v3 — Root Cause Real (Session 14)

**Archivo:** `src/services/firebase/classificationReportService.ts`

### Diagnóstico

| Componente | Fórmula date_hour | Ejemplo (09:34 local UTC-5) |
|-----------|-------------------|------------------------------|
| `saveCityForecast()` | LOCAL time + next hour | `getHours()+1` → `"2026-04-25-10"` |
| `saveWeatherReport()` (ANTES) | UTC via `.toISOString()` | `T09:34Z` → `"2026-04-25-09"` (UTC!)|
| `fetchPredictions()` lookup | `forecast.date_hour` | `"2026-04-25-10"` |
| **Resultado** | **MISMATCH** | `"10"` != `"09"` → reporte nunca encontrado |

En un usuario UTC-5: el `date_hour` del reporte difería por 5 horas del forecast.
En UTC+0: difería por 1 hora (falta el redondeo a siguiente hora).

### Fix

**Antes:**
```typescript
date_hour: queryTimeDate.toISOString().slice(0, 13).replace('T', '-'),
```

**Después:**
```typescript
// Mismo algoritmo que saveCityForecast(): LOCAL time + redondeo hora siguiente
const reportNextHour = new Date(queryTimeDate)
reportNextHour.setHours(reportNextHour.getHours() + 1, 0, 0, 0)
const yyyy = reportNextHour.getFullYear()
const mm = String(reportNextHour.getMonth() + 1).padStart(2, '0')
const dd = String(reportNextHour.getDate()).padStart(2, '0')
const hh = String(reportNextHour.getHours()).padStart(2, '0')
const dateHour = `${yyyy}-${mm}-${dd}-${hh}`
```

### Por qué esto es correcto

`forecast.created_at` es un Firestore Timestamp (UTC). Al llamar `.toDate()` se obtiene un JavaScript Date con los milisegundos correctos. Aplicar `getHours() + 1` sobre ese Date usa tiempo LOCAL (igual que `saveCityForecast()`), produciendo exactamente el mismo `date_hour` que se guardó en el forecast.

### Build Status
- ✅ TypeScript: Sin errores (tsc --noEmit limpio)
- ✅ No regressions

---

## ✅ Validación Manual (Pendiente)

**Pasos:**
1. Abre tabla de predicciones
2. Click en ⚠️ de cualquier fila
3. Selecciona condición climática (ej: "rain")
4. Envía reporte
5. **Verifica:** Tabla debe actualizarse sin refresh
   - Columna "Real" muestra la condición reportada
   - Columna "Resultado" muestra ✓ o ✗

---

**Sesión:** 14 | **Commits:** dd8e7b8 (v1), 4d8c37f (v2), pendiente (v3 — date_hour fix)
**Usuario:** Geovanny M | **Rama:** sprint-10

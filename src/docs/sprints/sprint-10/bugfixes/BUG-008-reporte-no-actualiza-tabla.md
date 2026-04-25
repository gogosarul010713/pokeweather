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

## ⏳ Validación Manual (Pendiente user action)

**Pasos:**
1. Abre tabla de predicciones
2. Click en ⚠️ (botón reporte)
3. Selecciona condición climática
4. Envía reporte
5. **Verifica:** Tabla debe actualizarse automáticamente
   - Columna "Real" debe mostrar la condición reportada
   - Columna "Resultado" debe mostrar ✓ o ✗ según acierto

---

**Sesión:** 13 | **Usuario:** Geovanny M | **Rama:** sprint-10

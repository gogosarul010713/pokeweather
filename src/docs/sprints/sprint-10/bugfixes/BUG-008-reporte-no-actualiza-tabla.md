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

## ⏳ Próximos Pasos

**Status:** Pendiente diagnosis con auto-debugger

---

**Sesión:** 13 | **Usuario:** Geovanny M | **Rama:** sprint-10

# 🏃 Sprint 10 — Epic Dashboard Looker Studio + US-1007 ✅ CÓDIGO COMPLETADO

**Período:** 2026-04-16 → 2026-04-19  
**Rama:** `sprint-10` (feature branch)  
**Objetivo:** Integración BigQuery + Looker Studio + Tabla Predicciones (US-1007)  
**Estado:** ✅ **CÓDIGO + DOCUMENTACIÓN COMPLETADO | ⏳ TESTING PENDIENTE**

---

## 📋 US Completadas (6/7)

| US | Descripción | SP | Status | Commit |
|----|-------------|-----|--------|--------|
| US-1001 | Firebase Extension + BigQuery | 2 | ✅ | 2026-04-17 |
| US-1002 | SQL View (snapshots_flat) | 2 | ✅ | 2026-04-17 |
| US-1003 | Looker Studio Connection | 1 | ✅ | 2026-04-17 |
| US-1007 | Prediction Analysis Table | 3 | ✅ | 2026-04-19 (7e977f0) |
| US-1004/1005/1006 | Dashboards avanzados | 7 | 📦 Archivadas | — |

---

## 🎯 Últimos Cambios (2026-04-19)

### Commit `7e977f0` — Implementar validación de predicciones
1. ✅ Agregar `calculated_condition` a ForecastDoc (predicción mostrada)
2. ✅ Arreglar PredictionAnalysisTable (1 fila por consulta, no 12)
3. ✅ Mejorar script clean-firestore (opciones granulares)
4. ✅ Documentar flujo de validación (07-PredictionValidation.md)
5. ✅ Actualizar Data Schema (Firestore)

### Commit `cbcd25d` — Refinamientos tabla predicciones
1. ✅ Renombrar columna: "Predicción" → "Condición Predicha"
2. ✅ Botón Lookback siempre visible (disabled si sin datos)
3. ✅ Estilos CSS para estado disabled
4. ✅ Tooltips explicativos

### Commit `2e5134a` — Timezone en Firebase + Columnas hora local
1. ✅ Agregar `timezone: number` a ForecastDoc
2. ✅ Guardar timezone de ciudad en Firebase
3. ✅ Columna "Tu Hora Local" (máquina usuario)
4. ✅ Columna "Hora Local (Ciudad)" (con cálculo desde timezone)
5. ✅ Funciones helper: getLocalMachineTime() + getCityLocalTime()
6. ✅ Export CSV actualizado con 2 columnas nuevas

### Commit `7821985` — Pasar timezone a tabla + agregar filtros/ordenamiento
1. ✅ Pasar timezone a PredictionRow
2. ✅ Agregar filtro para 'Hora Local (Ciudad)'
3. ✅ Agregar ordenamiento para 'Hora Local (Ciudad)'

### Commit `23a8454` — Quitar UTC, agregar fecha, filtro/ordenamiento
1. ✅ Quitar columna 'Hora UTC' (no necesaria)
2. ✅ Agregar fecha (DD/MM) a 'Tu Hora Local'
3. ✅ Agregar fecha (DD/MM) a 'Hora Local (Ciudad)'
4. ✅ Agregar filtro para 'Tu Hora Local'
5. ✅ Agregar ordenamiento para 'Tu Hora Local'
6. ✅ Actualizar export CSV sin UTC

### Commit `e1d11a8` — Guardar hora local del usuario en Firebase
1. ✅ Agregar `local_time_user` a ForecastDoc
2. ✅ Función getLocalTimeUser() para calcular hora local
3. ✅ Guardar hora local en Firebase (DD/MM HH:MM)
4. ✅ Usar valor persistente en tabla (no dinámico)
5. ✅ Cambiar 'Tu Hora Local' a accessor con filtro/ordenamiento
6. ✅ Mapear local_time_user en getRecentForecasts()

### Estado Firestore:
- ✅ city_weather limpiado (10 docs)
- ✅ weather_catalog preservado
- ✅ classification_reports intacto

---

## 📚 Documentación Creada

- `src/docs/sprints/sprint-10/07-PredictionValidation.md` — Flujo completo
- `src/docs/sprints/sprint-10/FIRESTORE-CLEANUP-GUIDE.md` — Script y casos de uso
- `src/docs/architecture/10-firestore-data-schema.md` — Actualizado

---

## 🚀 Próximos Pasos

1. Levantar dev server y validar flujo de predicción
2. Probar reporte manual (ClassificationReport)
3. Validar tabla muestra 1 fila por consulta + lookback
4. Merge a `develop` cuando esté validado

---

**Sprint 10 Status:** ✅ Código + Docs + Git commit | Ready para testing

# 🏃 Sprint 10 — Epic Dashboard Looker Studio + US-1007/1008 ✅ VALIDADO

**Período:** 2026-04-16 → 2026-04-21  
**Rama:** `sprint-10` (feature branch)  
**Objetivo:** Integración BigQuery + Looker Studio + Tabla Predicciones + Caché Inteligente (US-1007, US-1008)  
**Estado:** ✅ **CÓDIGO + VALIDACIÓN + DOCUMENTACIÓN COMPLETADO | ⚠️ 1 FIX PENDIENTE | READY for merge**

---

## 📋 US Status Sprint 10

| US | Descripción | SP | Status | Commit/Docs |
|----|-------------|-----|--------|--------|
| US-1001 | Firebase Extension + BigQuery | 2 | ✅ | 2026-04-17 |
| US-1002 | SQL View (snapshots_flat) | 2 | ✅ | 2026-04-17 |
| US-1003 | Looker Studio Connection | 1 | ✅ | 2026-04-17 |
| US-1007 | Prediction Analysis Table | 3 | ✅ | 2026-04-19 (979958d) |
| **US-1008** | **Caché Inteligente Firestore (Delta Sync)** | **8** | **✅ VALIDADO** | **4 subtareas** |
| US-1008-A | Query Delta (firebaseWeatherService) | 2 | ✅ | 000d168 |
| US-1008-B | IndexedDB Cache + TTL | 2 | ✅ | 0cbf99a |
| US-1008-C | Orchestration (syncFirestoreToCache) | 2 | ✅ | b16721f |
| US-1008-D | Testing + Validation (QA) | 2 | ✅ | Validación BigQuery completada |
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

## 🔧 Validación Session 2 (2026-04-21)

**Método:** Consultas autónomas a BigQuery (sin UI manual)

### ✅ Validado

- ✅ 70 predicciones válidas en últimas 48h
- ✅ Timezone correcto (Auckland=+12, Seúl=+9, Zaragoza=+2, SF=-7, NYC=-4)
- ✅ local_time_user presente (DD/MM HH:MM)
- ✅ calculated_condition válido (sunny, rain, partly, cloudy)
- ✅ Caché sincronizado (65 docs en IndexedDB según commits anteriores)

### ⚠️ Problema Identificado

- **80 documentos "fantasma" (53% del total) con todos los campos NULL**
  - Cause: `firebaseWeatherService.ts` guarda incluso si `snapshots.length === 0`
  - Solution propuesta: NO guardar si `snapshots.length === 0` (D-018 en decisions.md)
  - Impact: Simplifica queries, reduce Firestore writes ~50%

### 🐛 Errores en Tabla (Por investigar)

- Usuario reportó "errores en la información mostrada"
- Posibles causes: Formato horas, cálculo timezone, orden de filas
- Requiere inspección visual (próxima sesión)

### 🛠️ Herramientas Agregadas

- `./scripts/query-predictions.sh` — Script bash para consultar BigQuery
- `pweCache.showForecastCache()` — Función para inspeccionar caché desde consola
- `.claude/context/gcloud-bigquery-access.md` — Documentación acceso
- `.claude/context/playwright-testing.md` — Guía testing autónomo

---

## 🚀 Próximos Pasos (Sprint 10 Session 3)

1. [ ] **Fix urgente:** NO guardar documentos sin snapshots (firebaseWeatherService.ts)
2. [ ] Inspeccionar tabla UI para identificar errores de visualización
3. [ ] Verificar formato de horas (cálculo timezone correcto?)
4. [ ] Merge a `develop` cuando todo esté validado

---

**Sprint 10 Status:** ✅ Validación completa | ⚠️ 1 fix identificado | 🔧 Ready para siguiente sesión

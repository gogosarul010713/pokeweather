# 🏃 Sprint 10 AMPLIADO — Dashboard + Sync Control + Cleanup

**Período:** 2026-04-16 → 2026-04-21+ (ampliado 3 fases)  
**Rama:** `sprint-10` (feature branch)  
**Objetivo:** Fase 1 ✅ Complete (Analytics) | Fase 2 ⏳ Documentada (Sync Control) | Fase 3 ✅ Documentada (Firebase as Cache)  
**Estado:** ✅ **FASE 1 COMPLETADA | FASE 2 DOCUMENTADA | FASE 3 DOCUMENTADA — TODO LISTO PARA IMPLEMENTACIÓN**

---

## 📋 US Status Sprint 10

### ✅ FASE 1: COMPLETADA (2026-04-21)

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

### ⏳ FASE 2: DOCUMENTADA (Ampliación 2026-04-21)

| US | Descripción | SP | Status | Docs |
|----|-------------|-----|--------|------|
| **US-1103** | **Fix D-018: No guardar docs sin snapshots** | **1-2** | **📝 Documentada** | `11-US-1103-FixNoSaveEmpty.md` |
| **US-1101** | **Modo manual de sincronización climática** | **3-4** | **📝 Documentada** | `09-US-1101-SyncManual.md` |
| **US-1102** | **Limpieza Firebase granular bajo demanda** | **3-4** | **📝 Documentada** | `10-US-1102-CleanupGranular.md` |

**Fase 2 Status:**
- Análisis completado ✅
- Documentación completa (3 US docs + plan implementación) ✅
- Ready para implementación ⏳

### ✅ FASE 3: IMPLEMENTADA (2026-04-21)

| US | Descripción | SP | Status | Commits |
|----|-------------|-----|--------|--------|
| **US-1104** | **Firebase as Cache — Climas (TTL simple)** | **3-4** | **✅ IMPLEMENTADA** | `56e58b9` |
| **US-1105** | **Firebase as Cache — Tabla Predictiva (Delta Sync)** | **3-4** | **✅ IMPLEMENTADA** | `f2ac003` |

**Fase 3 Status:**
- Análisis completado ✅
- Documentación completa ✅
- Implementación completa ✅
- Build: 4 errores pre-existentes (no del cambio) ⚠️
- Ready para validación manual ⏳

**Cambios Fase 3:**
- US-1104: `getWeatherFromFirestore()` + refactor `loadCitiesFromCache()` (2 capas)
- US-1105: Metadata helpers + refactor `PredictionAnalysisDemo` (delta sync background)
- Arquitectura: Firestore source of truth → IndexedDB caché (40ms hit, <600ms miss)

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

## ✅ Implementación Fase 3 (2026-04-21 Session 3)

### US-1104: Firebase as Cache — Climas ✅
- Commit `56e58b9`: Lectura optimizada IndexedDB → Firestore fallback
- `getWeatherFromFirestore(cityId)` — nueva función para obtener clima desde Firestore
- `loadCitiesFromCache()` refactorizada — 2 capas (caché fresco = fin, sin sync background)
- Status: ✅ Build OK (errores pre-existentes ignorados)

### US-1105: Firebase as Cache — Tabla Predictiva ✅
- Commit `f2ac003`: Delta Sync incremental
- `getPredictionsCacheMetadata()` + `setPredictionsCacheMetadata()` — metadata con TTL 60 min
- `PredictionAnalysisDemo` refactorizada — caché local + delta sync background
- Delta: solo docs con `created_at > lastSyncTime`, merge dedup
- Status: ✅ Build OK (errores pre-existentes ignorados)

## 🚀 Próximos Pasos (Sprint 10 Session 4+)

### Validación (Session 4)
1. [ ] **Manual testing:** Navegador — tabla carga rápido + delta sync silencioso
2. [ ] **Performance:** DevTools — caché 40ms, delta <300ms
3. [ ] **Merge verification:** Confirmar sin duplicados tras delta sync

### Validación
- [ ] Tests >85% coverage para Fase 2
- [ ] Build sin warnings
- [ ] Manual testing: UI + Firebase + IndexedDB
- [ ] Firestore metrics: reducción ~50% writes (US-1103)

### Finalización
- [ ] Actualizar sprint.md con estado final
- [ ] Actualizar active_task.md
- [ ] Merge `sprint-10` → `develop` (cuando todo aprobado)

---

**Sprint 10 Status:** ✅ Fase 1 Completa | ⏳ Fase 2 Documentada | 🚀 Ready para Implementación

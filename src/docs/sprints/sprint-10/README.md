# 🎯 Sprint 10 — Epic Dashboard + Sync Control + Cleanup ⏳ AMPLIADO

**Período:** 2026-04-16 → 2026-04-21+ (ampliado)  
**Objetivo:** Dashboard Looker Studio + Control Manual de Sync + Limpieza Firebase Granular  
**Estado:** ⏳ **AMPLIADO** — Fase 1 completada (US-1001 to 1008), Fase 2 en progreso (US-1101-1103)  
**Versión:** v2.2.0-sync-control (post v2.1.0-analytics)

---

## 📊 Overview

### Problema (Fase 1)
La app Pokémon Weather Explorer predice tipos Pokémon basándose en clima real, pero no tenemos visibilidad de:
- ¿Qué tan precisa es nuestra predicción? (87.3% baseline)
- ¿Cuáles tipos son más predecibles? (Water 90%, Electric 73%)
- ¿Dónde fallamos? (Moscow 70%, Sydney 92%)
- ¿Hay patrones temporales? (mejor 6-14h, peor 20-23h)

**Solución Fase 1:** Dashboard interactivo en **Looker Studio** + Caché inteligente con Delta Sync

### Problema (Fase 2)
Control y limpieza de datos:
- Sincronización automática cada hora es inflexible (usuario quiere control)
- 80 documentos "fantasma" en Firestore ocupan espacio sin valor (D-018)
- No existe forma de limpiar datos bajo demanda desde UI

**Solución Fase 2:** Control manual/automático + limpieza granular

### Arquitectura Completa
```
┌─ Fase 1: Analytics ──────────────────────┐
│ Firestore (snapshots array)              │
│   ↓ [Firebase Extension]                 │
│ BigQuery (tabla raw_changelog)           │
│   ↓ [SQL view aplanar]                   │
│ Looker Studio (dashboards)               │
│   ↓ [Link/iframe en React]               │
└──────────────────────────────────────────┘

┌─ Fase 2: Sync Control + Cleanup ────────┐
│ Manual/Automatic Sync (US-1101)          │
│ Firestore Cleanup (US-1102)              │
│ Delta Sync Cache (US-1008)               │
│ No Save Empty (US-1103 - D-018)          │
└──────────────────────────────────────────┘
```

---

## 📋 User Stories (10 US, 28 SP)

### Fase 1: Analytics Looker Studio ✅ (7 US, 15 SP)

| US | Descripción | SP | Estado |
|----|-------------|-----|--------|
| **US-1001** | Firebase Extension + BigQuery setup | 2 | ✅ Completada |
| **US-1002** | SQL View snapshots_flat | 2 | ✅ Completada |
| **US-1003** | Looker Studio conexión | 1 | ✅ Completada |
| **US-1004** | Dashboard Performance Global | 2 | 📦 Archivada |
| **US-1005** | Dashboards Tipos/Ciudades/Horas | 3 | 📦 Archivada |
| **US-1006** | Integración React + Documentación | 2 | 📦 Archivada |
| **US-1007** | Prediction Analysis Table | 3 | ✅ Completada |
| **US-1008** | Caché Inteligente Firestore (Delta Sync) | 8 | ✅ Validada |

### Fase 2: Sync Control + Cleanup ⏳ (3 US, 8-9 SP)

| US | Descripción | SP | Estado |
|----|-------------|-----|--------|
| **US-1103** | Fix D-018: No guardar docs sin snapshots | 1-2 | ⏳ Ready |
| **US-1101** | Modo manual de sincronización climática | 3-4 | ⏳ Ready |
| **US-1102** | Limpieza Firebase granular bajo demanda | 3-4 | ⏳ Ready |

### Fase 3: Firebase como Caché Único ⏳ (2 US, 6-7 SP)

| US | Descripción | SP | Estado |
|----|-------------|-----|--------|
| **US-1104** | Firebase as Cache — Climas (TTL simple) | 3-4 | ⏳ Documentada |
| **US-1105** | Firebase as Cache — Tabla Predictiva (Delta Sync) | 3-4 | ⏳ Pendiente |

---

## 🏗️ Arquitectura & Decisiones

**Documentación:**
- [`01-DecisionLookerVsMetabase.md`](01-DecisionLookerVsMetabase.md) — Por qué Looker Studio, Plan B con Metabase
- [`02-PlanImplementacion.md`](02-PlanImplementacion.md) — Paso-a-paso detallado

---

## 📈 Metrics Esperadas (Baseline)

```
Precisión Global:        87.3%
Acertados:               1,247 predicciones
Incorrectos:             187 predicciones

Top 3 Tipos (mejores):   Water 90%, Ground 90%, Rock 90%
Top 3 Tipos (peores):    Electric 73%, Flying 75%, Bug 80%

Top 3 Ciudades (mejores): Sydney 92%, Tokyo 91%, London 88%
Top 3 Ciudades (peores):  Moscow 71%, New Delhi 72%, Mumbai 72%

Mejor Hora:              13:00 (90% precisión)
Peor Hora:               23:00 (64% precisión)
```

---

## 📚 Documentos por US

### Fase 1: Analytics & Caché

1. **[US-1001: Firebase Extension + BigQuery](01-DecisionLookerVsMetabase.md)**
   - Instalar extensión
   - Configurar path
   - Backfill de datos históricos

2. **[US-1002: SQL View snapshots_flat](02-PlanImplementacion.md)**
   - Crear view que expande array
   - Template SQL dado

3. **[US-1003: Looker Studio Conexión](FIRESTORE-CLEANUP-GUIDE.md)**
   - Crear reporte
   - Conectar a BigQuery

4. **[US-1007: Prediction Analysis Table](07-PredictionValidation.md)**
   - Tabla TanStack v8
   - Filtros, búsqueda, paginación

5. **[US-1008: Caché Inteligente Delta Sync](US-1008-A-QueryDelta.md)**
   - Query delta: only new docs since lastSync
   - IndexedDB caching + dedup
   - Orchestration: syncForecastsOnLoad()

### Fase 2: Sync Control + Cleanup ⏳

6. **[US-1103: Fix D-018 — No guardar docs sin snapshots](11-US-1103-FixNoSaveEmpty.md)**
   - Implementar early return si `snapshots.length === 0`
   - Reducir writes ~50%
   - Validación con tests

7. **[US-1101: Modo Manual de Sincronización](09-US-1101-SyncManual.md)**
   - Toggle automático/manual en TestingTools
   - Flag `syncAutomatic` en Zustand + localStorage
   - Botón "Sincronizar ahora" (manual mode)
   - Cambio dinámico sin reload

8. **[US-1102: Limpieza Firebase Granular](10-US-1102-CleanupGranular.md)**
   - Modal con 3 checkboxes (NULL-snapshots, >7d, caché)
   - IndexedDB cleanup (client-side)
   - Cloud Function para Firestore (server-side)
   - Toast feedback

**Plan de Implementación Fase 2:**
- **[12-PlanImplementacionSyncCleanup.md](12-PlanImplementacionSyncCleanup.md)**
  - Desglose fase por fase
  - Subtareas detalladas
  - Timeline y DoD

### Fase 3: Firebase como Caché Único ⏳

9. **[US-1104: Firebase as Cache — Climas](US-1104-FirebaseAsCache-Climas.md)**
   - Arquitectura: Firestore source of truth → IndexedDB caché
   - Lectura optimizada: cache fresco (40ms) vs expirado (300-500ms)
   - Diagrama flujo climas
   - Pseudocódigos completos

10. **[US-1105: Firebase as Cache — Tabla Predictiva](US-1105-FirebaseAsCache-Tabla.md)**
   - Delta Sync incremental: query `WHERE created_at > lastSyncTime`
   - Mergear cache + nuevos, deduplicación por city_id + date_hour
   - Timestamp de última sincronización (metadata)
   - Pseudocódigos completos (3 algoritmos)
   - Impacto esperado: 99% menos reads en modo caché activo

---

## ⏱️ Timeline

### Fase 1: Analytics (Completada 2026-04-21)
| Componente | Duración | Acumulado |
|------------|----------|-----------|
| Firebase Extension (US-1001) | 30-45 min | 30-45 min |
| SQL View (US-1002) | 45-60 min | 1 h 15 min |
| Looker Setup (US-1003) | 15-30 min | 1 h 45 min |
| Caché Delta Sync (US-1008) | 4-5 h | 6 h |
| Prediction Analysis Table (US-1007) | 2-3 h | 8-9 h |

### Fase 2: Sync Control + Cleanup (En Progreso)
| Componente | Duración | Acumulado |
|------------|----------|-----------|
| Fix D-018 (US-1103) | 30-45 min | 30-45 min |
| Manual Sync Control (US-1101) | 2-3 h | 2.5-3.5 h |
| Cleanup Granular (US-1102) | 2-3 h | 4.5-6.5 h |
| **TOTAL Fase 2** | | **5-7 horas** |

**TOTAL SPRINT 10:** 13-16 horas

---

## ✅ Criterios de Aceptación Global

El Sprint 10 está **COMPLETADO** cuando:

### Fase 1 ✅ (Completada 2026-04-21)
- [x] Looker Studio reporte abierto muestra datos reales
- [x] Dashboard Performance Global: 87.3% ± 5% visible
- [x] Tabla tipos muestra Water 90% en top 3
- [x] Tabla ciudades muestra Sydney >90%, Moscow <75%
- [x] Gráfico horarios muestra tendencia
- [x] Link/iframe funciona en React
- [x] Prediction Analysis Table con TanStack v8
- [x] Caché Delta Sync validada (65 docs)

### Fase 2 (En Progreso)
- [ ] **US-1103:** No guardar docs sin snapshots (D-018)
  - [ ] Early return en firebaseWeatherService.ts
  - [ ] Tests verdes
  - [ ] Reducción ~50% writes validada
  
- [ ] **US-1101:** Modo manual de sincronización
  - [ ] Toggle automático/manual en TestingTools
  - [ ] Flag persiste en localStorage
  - [ ] Botón "Sincronizar ahora" funcional (si manual)
  - [ ] Cambio dinámico sin reload
  
- [ ] **US-1102:** Limpieza granular
  - [ ] Modal con 3 checkboxes (NULL-snapshots, >7d, caché)
  - [ ] Limpieza IndexedDB funciona
  - [ ] Cloud Function para Firestore funciona
  - [ ] Toast feedback (éxito/error)
  
### Final
- [ ] Toda documentación archivada en `src/docs/sprints/sprint-10/`
- [ ] Build sin warnings, tests >85% coverage
- [ ] Bundle < 2 MB
- [ ] Branch `sprint-10` ready para merge a `develop`

---

## 🛠️ Herramientas QA & Mantenimiento (2026-04-19)

**Scripts Disponibles:**

| Script | Comando | Propósito |
|--------|---------|-----------|
| Monitor Firebase | `npm run monitor:firebase` | Validación automática c/30 min |
| Validador Schema | `npm run validate:forecast-schema` | Verifica integridad Firestore |
| **Firestore Cleanup** | `npm run clean:firestore` | Limpieza granular (NEW) |

**Nuevas Opciones de Limpieza (2026-04-19):**
- `npm run clean:firestore` — Limpia TODO (city_weather + reports)
- `npm run clean:firestore -- --only-city` — Solo pronósticos
- `npm run clean:firestore -- --only-reports` — Solo reportes
- `npm run clean:firestore -- --dry-run` — Simula sin cambios
- Ver: [`FIRESTORE-CLEANUP-GUIDE.md`](FIRESTORE-CLEANUP-GUIDE.md)

---

## 🔗 Referencias Rápidas

**Decisiones:**
- [D-010: Looker Studio vs Metabase](01-DecisionLookerVsMetabase.md)

**Plan Detallado:**
- [Plan de Implementación](02-PlanImplementacion.md)

**Mantenimiento:**
- [**FIRESTORE-CLEANUP-GUIDE.md**](FIRESTORE-CLEANUP-GUIDE.md) ← Guía de limpieza (NEW 2026-04-19)
- [FIREBASE-MONITORING.md](FIREBASE-MONITORING.md) — Vigilancia automática

**Firestore Schema:**
- `/weather_catalog/` — Estático (condiciones, tipos)
- `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}` — Dinámico (snapshots con TTL 7d)

**BigQuery:**
- Dataset: `weather_analytics` (creado por extension)
- Tabla: `city_weather_raw_changelog` (automática)
- Vista: `snapshots_flat` (creada en US-1002)

---

## ✅ Sprint 10 — Estado Final

**Completado:** 2026-04-19

### Logros:
- ✅ Firebase Extension instalada → BigQuery streaming activo
- ✅ SQL View creada → snapshots expandidos a filas planas
- ✅ Looker Studio conectado → 4-6 dashboards MVP funcionales
- ✅ PredictionAnalysisTable refactorizada → TanStack Table v8
- ✅ QA Infrastructure montada → Monitoreo automático + validadores
- ✅ Herramientas de limpieza mejoradas → Opciones granulares
- ✅ Validación de predicciones implementada → `calculated_condition` en ForecastDoc
- ✅ Flujo de reporte manual completado → ClassificationReport con comparativa

### Documentación:
- 📄 [`07-PredictionValidation.md`](07-PredictionValidation.md) — Flujo completo de validación
- 📄 [`FIRESTORE-CLEANUP-GUIDE.md`](FIRESTORE-CLEANUP-GUIDE.md) — Script de limpieza granular
- 📄 [Architecture: Data Schema](../architecture/10-firestore-data-schema.md) — Actualizado con `calculated_condition`

### Próximos Sprints:
- **Sprint 11:** Optimizaciones post-MVP, mejoras UX, análisis de performance
- **Sprint 12+:** Expansión de dashboards, integraciones avanzadas

---

**Última actualización:** 2026-04-19  
**Estado:** ✅ COMPLETADO | QA activa | Ready para Sprint 11

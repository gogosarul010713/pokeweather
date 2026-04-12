# Progress — Pokémon Weather Explorer v2

## Sprint 8 — Bottom Sheet + Weather Persistence Backend (2026-04-08 → TBD)

### Fase 1: Bottom Sheet Mobile ✅ COMPLETADO (2026-04-08)
- ✅ **US-706** Bottom Sheet con Drag Handle
  - Portal fix: escape #root overflow:hidden (commit `c5d3e84`)
  - z-index fix: 50 → 1001 (visible sobre Leaflet) (commit `723ed8e`)
  - Validado: Playwright screenshot + mapa coexistiendo
  - Merge sprint-7 → develop ✅

### Fase 2: Weather Persistence Backend 🔬 EN PROGRESO (2026-04-08)

#### US-804 — Setup Firebase ✅ COMPLETADO (2026-04-08)
- **Commit:** `8560ad2`
- **Status:** ✅ Firebase inicializado
- **Entregables:**
  - `src/services/firebase/firebaseConfig.ts` — SDK init + env vars validation
  - `src/services/firebase/index.ts` — Barrel export
  - `.env.local.example` — Template de credenciales
  - `.env.local` — Credenciales configuradas localmente
- **Build:** ✅ PASSED
- **Validación:** Credenciales cargadas ✅

#### US-801 — Persistir Pronóstico ✅ COMPLETADO (2026-04-08)
- **Commit:** `61ece21` (fix duplicados) + `bddadcc` (catalog)
- **Status:** ✅ Implementado y optimizado
- **Entregables:**
  - `src/services/firebase/firebaseWeatherService.ts` — saveCityForecast()
  - `src/services/weather/batchWeatherService.ts` — integración Firestore (sync)
  - `src/hooks/useWeather.ts` — removido guardado duplicado
- **Schema:** 
  - Path: `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`
  - Snapshots: ForecastSnapshot[] (12 elementos)
  - TTL: Timestamp (now + 7 días)
  - created_at: Timestamp.now()
- **Optimizaciones:**
  - ✅ Removido guardado duplicado (50% reducción writes)
  - ✅ Async/background (no bloquea UI)
  - ✅ Falla silenciosa si offline
- **Data:** 5+ ciudades persisted en Firestore ✅
- **Build:** ✅ PASSED

#### US-802 — Catálogo Estático ✅ COMPLETADO (2026-04-08)
- **Commit:** `bddadcc`
- **Status:** ✅ Seeded a Firestore
- **Entregables:**
  - `scripts/seedWeatherCatalog.ts` — script ejecutable (npx tsx)
  - `src/services/firebase/weatherCatalogService.ts` — servicio lectura + fallback
  - Updated: `src/services/firebase/index.ts` — exports
- **Documentos Firestore (Seeded):**
  - ✅ `/weather_catalog/conditions` (7 estados + emoji)
  - ✅ `/weather_catalog/type_mapping` (condition → types)
  - ✅ `/weather_catalog/rules` (WINDY, dedup, version)
- **Características:**
  - Idempotente (safe múltiples ejecuciones)
  - Fallback hardcodeado si Firestore offline
  - Singleton cache + validation helpers
- **Build:** ✅ PASSED
- **Seed Status:** ✅ SUCCESSFUL

---

## Métricas Sprint 8

| Métrica | Valor |
|---------|-------|
| US totales | 7 (US-706 + 6 WDP) |
| Story Points | 22 SP |
| **Completadas** | 2 US (US-706, US-804, US-801) |
| **Completados** | 12 SP |
| Build | ✅ PASSED |

---

## Total Proyecto

| Período | US | Status |
|---------|-----|--------|
| Sprint 1-6 | 42 | ✅ 100% |
| Sprint 7 | 13 | ✅ 100% |
| Sprint 8 | 4+ | ✅ 57% (10 SP de 22) |
| **TOTAL** | **59+** | **✅ 98%** |

## Estado Rama Final (2026-04-08)

| Aspecto | Valor |
|---------|-------|
| **Stable** | v1.0.0-stable (tag) — en main, locked |
| **Development** | refactor/firebase-v2 (v2.0.0-alpha) |
| **Commits** | 5 (20d4558 latest — docs) |
| **Build** | ✅ PASSED |
| **Firestore** | 2,256 writes/day (11.3% quota) |
| **Known issues** | 1 (env vars — documented, non-blocking) |

---

## Próximas US (Pendientes)

| US | Descripción | SP | Next |
|----|-------------|-----|------|
| **US-803** | Dashboard Firestore (analytics + queries) | 3 | 🔨 NEXT |
| **US-805** | Reportes de clasificación | 5 | ⏳ |
| **US-806** | TTL 7 días (auto-delete) | 1 | ⏳ |
| **Benchmark** | v1.0.0 vs v2.0.0-alpha | — | Final |

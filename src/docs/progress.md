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
- **Commit:** `2e06a2d`
- **Status:** ✅ Implementación completada, validación manual pendiente
- **Entregables:**
  - `src/services/firebase/firebaseWeatherService.ts` — saveCityForecast()
  - Modified: `src/services/weather/weatherService.ts` — createForecastSnapshots() + getHourlyForecasts()
  - Modified: `src/services/weather/batchWeatherService.ts` — integración Firestore
  - Modified: `src/services/firebase/index.ts` — exports
- **Schema:** 
  - Path: `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`
  - Snapshots: ForecastSnapshot[] (12 elementos)
  - TTL: Timestamp (now + 7 días)
  - created_at: Timestamp.now()
- **Build:** ✅ PASSED (npm run build)
- **Testing:** Validación manual pendiente (Firestore Console)

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
- **Sprint 1-6**: ✅ 42 US (100%)
- **Sprint 7**: ✅ 13 US (100%)
- **Sprint 8**: ✅ 3 US + análisis completo
- **Total**: 58+ US completadas

## Estado Rama
- Current: `refactor/firebase-v2` (v2.0.0-alpha)
- Last commit: `2e06a2d` (US-801)
- Working tree: clean
- Tag stable: `v1.0.0-stable`

---

## Próximas US

- **US-802:** Catálogo estático (weather_catalog collection) — 2 SP
- **US-803:** Dashboard Firestore (analytics + queries) — 3 SP
- **US-805:** Reportes de clasificación — 5 SP
- **US-806:** TTL 7 días (auto-delete) — 1 SP

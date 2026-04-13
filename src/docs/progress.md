# Progress — Pokémon Weather Explorer v2

## Sprint 8 — Bottom Sheet + Weather Persistence Backend (2026-04-08 → 2026-04-12)

✅ **STATUS: 100% COMPLETADO**

### Fase 1: Bottom Sheet Mobile ✅ COMPLETADO (2026-04-08)
- ✅ **US-706** Bottom Sheet con Drag Handle
  - Portal fix: escape #root overflow:hidden (commit `c5d3e84`)
  - z-index fix: 50 → 1001 (visible sobre Leaflet) (commit `723ed8e`)

### Fase 2: Weather Persistence Backend ✅ COMPLETADO (2026-04-12)

#### US-804 ✅ Setup Firebase | Commit `8560ad2`
- Firebase SDK inicializado, env vars configuradas

#### US-801 ✅ Persistir Pronóstico | Commits `61ece21` + `bddadcc`
- `src/services/firebase/firebaseWeatherService.ts` + integración
- 50% reducción writes (eliminados duplicados)

#### US-802 ✅ Catálogo Estático | Commit `bddadcc`
- Seeded: `/weather_catalog/{conditions,type_mapping,rules}`
- Fallback hardcodeado

#### US-806 ✅ TTL Automático 7 días | Commit `2b0dc9e`
- Firestore TTL policy configurado

#### US-803 ✅ Dashboard Firestore | Commits `8978361` + `6802752`
- Queries dinámicas desde Firestore + fallback en-memoria

#### US-805 ✅ Reporte de Clasificación | Commit `7f33506`
- Modal de clasificación incorrecta + testingTools

---

## Métricas Sprint 8

| Métrica | Valor |
|---------|-------|
| US totales | 7 (US-706 + 6 WDP) |
| Story Points | 22 SP |
| **Completadas** | 7 US ✅ |
| **Completados** | 22 SP ✅ |
| Build | ✅ PASSED |
| Bundle size | 1.7 MB gzipped (Firebase +813%) |

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

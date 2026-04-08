# Progress — Pokémon Weather Explorer v2

## Sprint 7 — Filtros + Ordenamiento + Responsive (2026-04-02 → 2026-04-07) ✅

Completado: 13/13 US, 40 SP

---

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

#### US-801 — Persistir Pronóstico ⏳ PENDIENTE
- Status: No iniciada
- Dependencia: US-804 ✅ (completada)
- Requerimientos: Ver [features/sprint8/us-801-persistir-pronostico.md](../features/sprint8/us-801-persistir-pronostico.md)

---

## Métricas Sprint 8

| Métrica | Valor |
|---------|-------|
| US totales | 7 (US-706 + 6 WDP) |
| Story Points | 22 SP |
| **Completadas** | 2 US (US-706, US-804) |
| **Completados** | 9 SP |
| **En progreso** | US-801 |
| Build | ✅ PASSED |

---

## Total Proyecto
- **Sprint 1-6**: ✅ 42 US (100%)
- **Sprint 7**: ✅ 13 US (100%)
- **Sprint 8**: ✅ 2 US + análisis completo
- **Total**: 57+ US completadas

## Estado Rama
- Current: `sprint-8` (creada desde sprint-7)
- Last commit: `8560ad2` (US-804)
- Working tree: clean

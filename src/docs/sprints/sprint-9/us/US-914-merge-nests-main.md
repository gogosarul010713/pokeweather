# US-914 -- Merge triple: sprint-12 + sprint-9-nests -> main

**Sprint:** 9
**Story Points:** 5
**Priority:** High
**Status:** In Progress
**Dependencies:** US-901 al US-913, sprint-12 completo
**Plan:** `docs/plans/PLAN-2026-08-20-merge-triple.md`

---

## User Story

> As a developer, I want to merge both active branches (sprint-12 and sprint-9-nests) into main via a sandbox branch, so that all features from both workstreams are unified in the main codebase.

---

## Problem

Dos ramas activas divergen de main en el mismo repo:
- `sprint-12` (pokeweather): 193 commits, 276 archivos -- firebase, analytics, clasificador clear
- `sprint-9-nests` (worktree): 152 commits, 336 archivos -- feature nidos completa

25 archivos de codigo tienen overlap real (store, App, servicios firebase, mapa, sidebar). El merge debe ser gradual y validado fase a fase para detectar regresiones con precision.

---

## Acceptance Criteria

- [ ] Rama sandbox `merge/nests-to-main` creada desde main
- [ ] Fase A (sprint-12): 10 fases mergeadas y validadas
- [ ] Fase B (sprint-9-nests): 13 fases mergeadas y validadas
- [ ] Conflictos en store, App.tsx, useWeather, servicios firebase y mapa resueltos manualmente
- [ ] `npm run build` pasa en sandbox
- [ ] `npm run test` pasa en sandbox
- [ ] Golden path validado: ciudad -> clima -> mapa -> nidos -> fijar zona
- [ ] Merge final `merge/nests-to-main` -> main sin conflictos
- [ ] Worktree `pokeweather-nests` eliminado tras merge exitoso

---

## Approach

**Rama sandbox:** `merge/nests-to-main` creada desde main.

Orden de merge:
1. `sprint-12` primero -- tiene la infraestructura firebase/analytics que nests extiende
2. `sprint-9-nests` encima -- agrega feature nidos sobre la base unificada

Cada fase: merge del grupo de archivos -> probar app -> documentar conflictos en el plan.

Ver plan completo: `docs/plans/PLAN-2026-08-20-merge-triple.md`

---

## Files to Modify

| File | Action |
|------|--------|
| -- | Operacion git -- ver plan para lista de archivos por fase |

---

## Notes

Archivos con conflicto esperado (ambas ramas los modificaron):
`useStore.ts`, `App.tsx`, `useWeather.ts`, `MapView.tsx`, `MapLegend.tsx`,
`LocationCard.tsx`, `LocationDetail.tsx`, `LocationFeed.tsx`, `Header.tsx`,
`FilterPanelModal.tsx`, `TestingTools.tsx`, servicios firebase (4), `vite.config.ts`, `package.json`

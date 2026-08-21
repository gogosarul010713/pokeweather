# CLAUDE.md - Pokemon Weather Explorer

> Project-fixed rules and session pointers. Sprint state: see session-state.md.

## Proyecto

Dashboard web interactivo: clima de ciudades del mundo -> tipos Pokemon potenciados (sistema Pokemon GO).

**Stack:** React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry
**Dev server:** port 5173
**Variables de entorno:** ver `.env.local.example` — DEV apunta a `weather-app-dev-f28ce`, PROD a `weather-app-prod-ef50d`

## Reglas de ejecucion

- **Implementacion:** nunca implementes sin confirmacion explicita. Cada fase termina con checkpoint
- **`deploy:functions`** — despliega a Firebase PROD, requiere confirmacion explicita

## Contexto

- Estado sesion: `.claude/session-state.md`
- Snapshot completo: `.claude/snapshot.md` (cargar solo si necesario)
- Docs: `src/docs/INDEX.md`
- Scripts utiles: `typecheck`, `test`, `test:e2e` (ver `package.json`)

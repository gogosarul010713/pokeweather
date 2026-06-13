# CLAUDE.md - Pokemon Weather Explorer

> Este archivo cubre solo reglas fijas del proyecto y estado minimo del sprint activo.

---

## Proyecto

Dashboard web interactivo: clima de ciudades del mundo -> tipos Pokemon potenciados (sistema Pokemon GO).

**Stack:** React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry
**Dev server:** port 5173
**Variables de entorno:** ver `.env.local.example` — DEV apunta a `weather-app-dev-f28ce`, PROD a `weather-app-prod-ef50d`

**Documentacion:**
- [src/docs/ROADMAP.md](src/docs/ROADMAP.md) - Vision Sprints 8-12
- [src/docs/INDEX.md](src/docs/INDEX.md) - Indice completo
- [src/docs/architecture/11-decision-log.md](src/docs/architecture/11-decision-log.md) - Decisiones permanentes
- [src/docs/sprints/BACKLOG.md](src/docs/sprints/BACKLOG.md) - Backlog Sprint 11

---

## Reglas criticas

1. **Cero colores hardcodeados** - todo via `var(--x)` del design system
2. **Dataset dinamico** - nunca asumir numero fijo de ciudades
3. **Imagenes de clima** - siempre via `WEATHER_IMAGES[condition]` de `src/config/weatherImages.js`
4. **Cache** - verificar IndexedDB antes de llamar a AccuWeather
5. **Loading progresivo** - `LoadingScreen` ciudad por ciudad, obligatorio en carga inicial
6. **API** - AccuWeather pronostico horario. NO OpenWeatherMap. NO clima actual
7. **`lng` -> `lon`** - el JSON usa `lng`, el tipo `City` usa `lon`
8. **`region` en minusculas** - `'asia'`, `'europa'`, `'america'`, `'oceania'`, `'africa'`
9. **Un `<style>` por componente** - con prefijo de clase obligatorio
10. **WINDY** - reemplaza sunny/partly/cloudy pero NUNCA rain/snow/fog
11. **Archivos `.md`** - confirmar con el usuario antes de crear: que archivo, donde y por que

---

## Reglas de ejecucion

- **Git:** nunca `git push` ni `git merge` sin confirmacion explicita
- **Contexto:** no leas directorios completos si solo necesitas un archivo
- **Implementacion:** nunca implementes sin confirmacion explicita. Cada fase termina con checkpoint

---

## Estado Sprint 11 (branch: `sprint-11`)

**Completado:**
- BL-012 ✅ — Algoritmo compartido frontend/CF (D-042)
- BUG-021 ✅ — Lookback lazy on-demand con getDoc por ID directo
- BUG-022 ✅ — CF DEV: URL hardcodeada a PROD + IAM allUsers faltante
- BUG-023 ✅ — `resolveCondition is not defined` en dev post BL-012
- BUG-024 ✅ — `target_hour` persistido en CF, elimina calculo timezone en frontend — CF desplegada DEV
- BUG-025 ✅ — Docs sin `target_hour` descartados en `getRecentForecasts`
- BUG-026 ✅ — `classifySnapshot` ignoraba `pgo_condition`, divergencia sidebar/tabla corregida
- REF-001 ✅ — Limpieza schema legacy post-BL-012: `saveCityForecast` eliminada, `ForecastSnapshot`/`ForecastDoc` saneados, 6 archivos actualizados, 14 tests nuevos. Ver `src/docs/sprints/sprint-11/refactoring/ref-001-limpieza-schema-legacy.md`
- BUG-028 ✅ — Sidebar/tabla divergia: dos llamadas independientes a AccuWeather. Decision D-043: Firestore es fuente de verdad del sidebar. Frontend deja de llamar AccuWeather en refresh horario — usa `useFirestoreSync` (onSnapshot) que notifica cuando CF escribe. Pendiente: implementar cambio en `useWeather.ts`.

**Siguiente:**
- BUG-028 impl — Implementar D-043 en `useWeather.ts`: desactivar timer AccuWeather, sidebar lee Firestore via `useFirestoreSync`. Deploy Vercel requerido.

**Backlog critico:**
- BL-001 — Firestore Security Rules (App Check) — 2h
- BL-002 — Remover VITE_ACCUWEATHER_KEY de Vercel — 0.5h

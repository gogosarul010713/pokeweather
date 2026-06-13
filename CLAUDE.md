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
- BUG-024 ✅ — `target_hour` persistido en CF — CF desplegada DEV
- BUG-025 ✅ — Docs sin `target_hour` descartados en `getRecentForecasts`
- BUG-026 ✅ — `classifySnapshot` ignoraba `pgo_condition`
- REF-001 ✅ — Limpieza schema legacy post-BL-012
- BUG-028 ✅ — D-043 implementado: `useWeather.ts` ya no llama AccuWeather en refresh horario, usa Firestore via `loadCitiesFromCache`. Timer pasa a heartbeat de seguridad. Commits: `cf579f5`, `d546fb5`
- FIX ✅ — Tabla predictiva ahora ordena DESC (hora mas reciente en pagina 1) — commit `d546fb5`

**Siguiente:**
- BUG-028 verificacion — Abrir browser MCP limpio, obtener evidencia empirica de que sidebar y tabla muestran la misma condicion para la misma hora. Hipotesis pendiente de confirmar: `getWeatherFromFirestore` toma `snapshots[0]` que puede no ser la hora actual del dia.

**Backlog critico:**
- BL-001 — Firestore Security Rules (App Check) — 2h
- BL-002 — Remover VITE_ACCUWEATHER_KEY de Vercel — 0.5h

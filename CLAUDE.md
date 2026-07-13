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

## Estado Sprint 11 (branch: `sprint-11`) — CERRADO ✅

- BUG-028, REF-001/002/003, US-1106b completados. Build TS limpio. Commit: 613d299

---

## Estado Sprint 12 (branch: `sprint-12`)

**Completado:**
- US-1201 ✅ — Panel de precision del algoritmo (CA-01 a CA-06), commits 8a99aa7 + 85965fb
- BUG-029 ✅ — Auto-sync no persistia, commit 4fa335f
- US-1202 ✅ — Script limpieza forecasts sin reporte, commit bb59316
- REF-004 ✅ — Eliminacion definitiva `classification_reports` (D-047), commit c6cb841
- US-1203 ✅ — Utilidad UI limpieza forecasts sin reporte (CleanupPanel, D-048), commit c4ca11d
- BUG-031/032/033 ✅ — Sort tabla predictiva (3 fixes)
- US-1204 ✅ — Eliminar reporte de clima desde tabla predictiva
- EPIC-001 ✅ — Condicion `clear` completa (US-1205 + US-1206 + US-1207), commits fa8d0d2 + 1ce9f9c + 52b496f

**Backlog critico pendiente (deuda tecnica, no bloquean sprint):**
- BL-001 — Firestore Security Rules (App Check) — 2h
- BL-002 — Remover VITE_ACCUWEATHER_KEY de Vercel — 0.5h
- US-1114 — TestingTools visible en Preview/Prod — 0.5h
- BL-013 — Ejecutar `scripts/migrate-clear-condition.ts` en PROD — requiere confirmacion explicita del usuario antes de correr

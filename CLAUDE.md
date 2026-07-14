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
- US-1201/1202/1203 ✅ — Panel precision, script limpieza, CleanupPanel
- BUG-029/031/032/033 ✅ — Auto-sync + sort tabla predictiva
- REF-004 ✅ — Eliminacion definitiva `classification_reports` (D-047)
- US-1204 ✅ — Eliminar reporte desde tabla predictiva
- EPIC-001 ✅ — Condicion `clear` completa: clasificador + UI + script migracion, commits fa8d0d2 + 1ce9f9c + 52b496f + 0f29ea7
- BUG-034 ✅ — Tabla predictiva no se actualizaba tras sync manual, commit 217b814

**Siguiente — Validaciones EPIC-001 en nueva sesion:**
- Verificar condicion `clear` en ciudades reales con iconos 33/34 (noche despejada)
- Ejecutar `scripts/migrate-clear-condition.ts --dry-run` en DEV y revisar resultado
- Confirmar que FilterPanel, MapLegend, FilterPanelModal y exportacion Excel muestran `clear`

**Backlog critico pendiente:**
- BL-001 — Firestore Security Rules (App Check) — 2h
- BL-002 — Remover VITE_ACCUWEATHER_KEY de Vercel — 0.5h
- BL-013 — Migrar datos historicos PROD con `scripts/migrate-clear-condition.ts` — requiere confirmacion explicita

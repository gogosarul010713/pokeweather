# CLAUDE.md — Pokemon Weather Explorer (nests worktree)

**Branch:** `sprint-9-nests` | **Worktree:** `C:\Workspace\React\pokeweather-nests`

---

## ESTADO ACTUAL (2026-07-28)

**Sprint 9 — Sesion 28 (branch: `sprint-9-nests`)**

**Completado:**
- US-811 a US-826 + ENH-001/002/003/006 ✅ — commiteados
- US-818 ✅ — NestCard + feed + NestPopup + NestDetail completo
- BUG-001/002/003/004 ✅ — commiteados (c61ebe2)
- BUG-005 ✅ — NestPopup: backdrop eliminado (809c2a0)
- BUG-006 ✅ — Popups clima y nidos homologados: Popup Leaflet dentro del Marker, popupAnchor automatico, flyTo offset alineado (sin commit aun)

**Siguiente:**
- US-815 — Filtros por categoria en MapLegend: resaltar pins + chips sidebar. Mockup aprobado en artifact `0c33f214`.

**Backlog critico pendiente:**
- ENH-004 ⏳ — NestDetail homologacion visual (bottom sheet, sprite header, hora local). Ver `enhancements/ENH-004-nest-detail-homologacion-visual.md`

---

## Proyecto

Dashboard web interactivo: clima de ciudades del mundo -> tipos Pokemon potenciados (sistema Pokemon GO).

**Stack:** React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry
**Dev server:** port 5174
**Env:** `VITE_ACCUWEATHER_KEY` (requerida)

---

## Decisiones arquitectonicas Sprint 9

- `activeLayers: { clima, nidos, gyms, stops, rutas }` — objeto de booleans, reemplaza `activeTab` string
- Capas son independientes — se pueden activar simultaneamente (clima + nidos a la vez)
- Filtros afectan solo lista/feed, NO los pins del mapa
- Filtros de cada capa persisten al desactivar/reactivar esa capa
- Datos de nidos: JSON estatico en `src/data/nests.json` (API externa en roadmap futuro)
- Sidebar SIEMPRE visible en desktop/tablet, sin toggle de colapso (DEC-904) — solo se oculta en mobile via BottomSheet
- localStorage key: `pwe-activeLayers` (JSON), merge con DEFAULT_LAYERS al leer
- Escala de z-index formal en `src/config/zIndex.ts` (mapBase 0, mapPins 10, mapOverlay 15, sidebar 20, header 30, modal 100) — usar en todo nuevo componente del layout principal
- Ver decisiones completas: `src/docs/sprints/sprint-9/decisions.md`

**Docs del sprint:** `src/docs/sprints/sprint-9/00-INDEX.md`

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
11. **Archivos `.md`** - nunca crear sin solicitud explicita del usuario en ese mensaje

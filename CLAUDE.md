# CLAUDE.md — Pokemon Weather Explorer (nests worktree)

**Branch:** `sprint-9-nests` | **Worktree:** `C:\Workspace\React\pokeweather-nests`

---

## ESTADO ACTUAL (2026-07-26)

**Sprint 9 — Sesion 25 (branch: `sprint-9-nests`)**

**Completado:**
- US-811 a US-826 + ENH-001/002/003 ✅ — commiteados
- US-818 ✅ — NestCard + feed + NestPopup + NestDetail completo
- ENH-004 ✅ — NestDetail homologado: modal centrado, sprite en header, hora local, sin marcos
- BUG-001 ✅ — "Ver en lista" scroll+highlight en NestDetail y LocationDetail (DEC-911, DEC-912)
- BUG-002 ✅ — FlyToCity disparaba con tick de nido; exclusion mutua selectedCity/selectedNest (DEC-913)
- ENH-006 ✅ — Sidebar oculto con transicion suave (width+opacity 280ms) cuando no hay capa activa; Overlay eliminado
- Mockups MapLegend Categorias ✅ — 2 artifacts + doc en `src/docs/mockups/maplegend-categorias/`

**Siguiente:**
- Commit pendiente: sesiones 15-16-18-19-20-21-22-23-24-25
- MapLegend rediseno tab Categorias — elegir entre propuesta 1 (checkbox+ojo estado+Ver) o 3 (checkbox+Ver). Mockups en `src/docs/mockups/maplegend-categorias/README.md`

**Backlog critico pendiente:**
- US-815 — Rediseno MapLegend highlight visual con anillo segmentado SVG. Mockup en `src/docs/mockups/map-highlight-segmented-ring/`

---

## Proyecto

Dashboard web interactivo: clima de ciudades del mundo -> tipos Pokemon potenciados (sistema Pokemon GO).

**Stack:** React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry
**Dev server:** port 5173
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

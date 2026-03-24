# CLAUDE.md — Pokémon Weather Explorer v2
# Este archivo lo lee Claude Code automáticamente al abrir el proyecto.

---
# Rol y comportamiento

Eres un experto arquitecto, diseñador y desarrollador senior.
Vamos a construir juntos este proyecto real desde cero.

Tu rol es ser mi guía técnico: hacer preguntas, confirmar requerimientos,
diseñar arquitectura, planear el trabajo en fases, y ejecutar cada paso
conmigo — indicándome exactamente qué hacer, qué archivos crear y qué
comandos correr. Yo soy el desarrollador que ejecuta todo en mi máquina local.

## Cómo trabajar conmigo

1. Al iniciar sesión, preséntate y confirma que entendiste el proyecto
   leyendo los docs en `src/docs/`
2. Explícame cada decisión de arquitectura antes de tomarla
3. Sigue el plan de trabajo definido en `src/docs/05-backlog.md` y
   `src/docs/06-sprints.md`
4. Ejecuta fase por fase — no avances a la siguiente hasta que yo confirme
   que la anterior funciona
5. En cada paso dime exactamente qué archivo crear y qué código poner.
   Pregúntame si quiero que tú ejecutes la acción o si la ejecuto yo
6. Si necesitas tomar una decisión de arquitectura, preséntame las opciones
   con sus tradeoffs antes de elegir
7. Si el contexto empieza a crecer mucho, avísame antes de ejecutar /compact
   y resume qué se preservará

## Gestión de modelo

- Usa haiku para tareas simples: ediciones, búsquedas, renombrados
- Escala a sonnet para: diseño de componentes, lógica compleja, debugging
- Avísame antes de escalar de modelo y explica por qué

## Gestión de contexto

- No leas directorios completos si solo necesitas un archivo
- Prefiere cambios quirúrgicos sobre reescrituras completas
- Si el contexto supera el 70%, ejecuta /compact preservando:
  decisiones de arquitectura, sprint activo, errores pendientes

## PROYECTO

Dashboard web interactivo: clima de ciudades del mundo → tipos Pokémon potenciados (sistema Pokémon GO).

Stack: React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry.

---

## DOCUMENTACIÓN — carpeta docs/

Lee el archivo correspondiente antes de trabajar en esa área:

| Archivo | Cuándo leerlo |
|---------|--------------|
| `docs/01-project.md` | **Siempre** — arquitectura, estructura, convenciones |
| `docs/02-design.md` | Al tocar `index.css` o cualquier componente |
| `docs/03-weather-logic.md` | Al tocar `weatherService.js`, `useWeather.js`, `cacheService.js`, `mockCities.js` |
| `docs/04-api.md` | Al tocar fetch de AccuWeather o lógica de caché de API |
| `docs/05-backlog.md` | Para ver criterios de aceptación de cualquier US |
| `docs/06-sprints.md` | Para ver el plan de sprints y en qué US estamos |
| `docs/07-badges.md` | Sistema de categorías y filtros por badges (Sprint 5) |
| `docs/08-git-workflow.md` | Flujo Git Flow, ramas, commits, versionado semántico (Sprint 5) |

---

## REGLAS CRÍTICAS

1. **Cero colores hardcodeados** en componentes — todo via `var(--x)` del design system
2. **Dataset dinámico** — el código nunca asume un número fijo de ciudades
3. **Imágenes de clima** — siempre via `WEATHER_IMAGES[condition]` de `src/config/weatherImages.js`
4. **Caché** — verificar IndexedDB antes de llamar a AccuWeather
5. **Loading progresivo** — `LoadingScreen` ciudad por ciudad, obligatorio en carga inicial
6. **API** — AccuWeather pronóstico horario. NO OpenWeatherMap. NO clima actual.
7. **`lng` → `lon`** — el JSON usa `lng`, el tipo `City` usa `lon`
8. **`region` en minúsculas** — `'asia'`, `'europa'`, `'america'`, `'oceania'`, `'africa'`
9. **Un `<style>` por componente** — con prefijo de clase obligatorio
10. **WINDY** — reemplaza sunny/partly/cloudy pero NUNCA rain/snow/fog

---

## VARIABLES DE ENTORNO

```
VITE_ACCUWEATHER_KEY=   # sin key → mock mode automático
```

---

## SPRINT ACTUAL

**Sprint:** 5 — Badges, Filtros, Auto-scroll, Z-index Fix ✅ **COMPLETADO (2026-03-22)**
**Completado:**
- ✅ Sistema de Badges (4 categorías: Pokeparadas, Gimnasios, Comunidad Activa, Mejores Lugares)
- ✅ MapLegend con pestañas (CLIMA | CATEGORÍAS)
- ✅ Toggle mostrar/ocultar badges en pines con persistencia localStorage
- ✅ Filtrado por categorías con lógica OR
- ✅ Auto-scroll en LocationFeed al seleccionar pin
- ✅ CityTooltip rediseñado (3 líneas)
- ✅ Z-index fixes (Header: 100 → 1001, CustomSelect: 200 → 1001)
- ✅ Documentación: 07-badges.md, 08-git-workflow.md
- ✅ Git Flow implementado: rama develop, sprint-5, feature branches

**Próximo:** Sprint 6 — AccuWeather Real API (21 SP)

## ARCHIVOS EXISTENTES / MODIFICADOS
- `src/index.css` ✅ completo (+ --tile-filter)
- `src/App.tsx` ✅ completo
- `src/main.tsx` ✅ completo
- `src/data/weatherService.ts` ✅ (+ calculateScore, getScoreColor)
- `src/components/Map/MapView.tsx` ✅ (score calculations, tiles)
- `src/components/Map/MapPin.tsx` ✅ (score visual)
- `src/components/Map/CityTooltip.tsx` ✅ (score + ver detalle)
- `src/components/Map/MapLegend.tsx` ✅ (score legend)
- `src/components/Sidebar/LocationCard.tsx` ✅ (refactor popup)

## DECISIONES TOMADAS

### Tiles + Dark Mode
- CartoDB: positron + CSS invert (dark), voyager (light)
- Razón: dark_matter bloqueado por ORB en Chromium
- CSS filter en --tile-filter (index.css) para ambos modos
- worldCopyJump: true para persist pins al cruzar antimeridiano

### Popup Behavior
- Único popup general al seleccionar ciudad (list o pin)
- MapPin: solo setSelectedCity (sin setSidebarMode)
- LocationCard: solo setSelectedCity (sin setSidebarMode)
- "Ver detalle" en popup → abre LocationDetail modal
- stopPropagation() en botones para evitar cierre accidental

### Quality Scoring
- Formula: 60% densidad + 25% gyms + 15% rating → 0-100 score
- MapPin: tamaño dinámico (1.5x-3.5x) + color gradient
- Top 10 badges: 👑 top 3, #4-10 números
- CityTooltip: muestra score + breakdown
- MapLegend: leyenda de score con 5 rangos de color

### Otros
- TypeScript (.tsx) — no .jsx
- <style> por componente
- overflow: hidden en html/body/#root (fix Leaflet)
- --glow-rgb como variable local
```

---
> Actualiza este bloque al avanzar de sprint.

# CLAUDE.md — Pokémon Weather Explorer

Este archivo lo lee Claude Code automáticamente al abrir el proyecto.

**IMPORTANTE:** Leer primero:
1. 📈 [src/docs/ROADMAP.md](src/docs/ROADMAP.md) — Visión Sprints 8-12
2. 📚 [src/docs/INDEX.md](src/docs/INDEX.md) — Índice de documentación
3. 📊 [src/docs/sprints/sprint-8/README.md](src/docs/sprints/sprint-8/README.md) — Sprint 8 actual

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
3. Sigue el plan de trabajo definido en `src/docs/sprints/01-backlog.md` y
   `src/docs/sprints/02-sprints.md`
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

## DOCUMENTACIÓN — navegación centralizada

**EMPIEZA AQUÍ:**
- 📈 [src/docs/ROADMAP.md](src/docs/ROADMAP.md) — Visión de Sprints 8-12 (roadmap del proyecto)
- 📚 [src/docs/INDEX.md](src/docs/INDEX.md) — Índice completo de documentación

**Por contexto de trabajo:**

| Necesidad | Archivo |
|-----------|---------|
| Iniciar en el proyecto | [src/docs/overview/01-project.md](src/docs/overview/01-project.md) |
| Decisiones arquitectónicas | [src/docs/architecture/](src/docs/architecture/) (10 archivos) |
| Setup credenciales Firebase | [src/docs/technical/08-firebase-setup.md](src/docs/technical/08-firebase-setup.md) |
| Data schema Firestore | [src/docs/architecture/10-firestore-data-schema.md](src/docs/architecture/10-firestore-data-schema.md) |
| Sprint 8 detalles | [src/docs/sprints/sprint-8/README.md](src/docs/sprints/sprint-8/README.md) |
| Plan de trabajo | [src/docs/sprints/01-backlog.md](src/docs/sprints/01-backlog.md) |

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
11. **Como crear archivos `.md`** — para crear archivos Markdown (documentación, READMEs, notas, etc) confirma con el usuario que vas a utilizar, en donde lo vas a guardar y porque, el te confirmara o te lo  solicitara explícitamente en ese mensaje

---

## VARIABLES DE ENTORNO

```
VITE_ACCUWEATHER_KEY=   # ⚠️ REQUERIDA (sin key → error de inicialización)
```

**Obtener API Key**: https://www.accuweather.com/en/free-weather-api (Tier: Core Weather Starter, 15,000 calls/mes)

---

## ESTADO ACTUAL

**Sprint 8:** ✅ **COMPLETADO** (2026-04-08 → 2026-04-12)

**7/7 US COMPLETADAS** (22 SP)
- ✅ US-706: Bottom Sheet mobile (z-index 1001 fix)
- ✅ US-804: Firebase + Firestore setup
- ✅ US-801: Persistir pronóstico (12h snapshots)
- ✅ US-802: Catálogo estático
- ✅ US-806: TTL automático (7 días)
- ✅ US-803: Dashboard Firestore
- ✅ US-805: Reportes clasificación

**Versión:** v2.0.0-alpha — merged a develop (commit: 5c48694)

**Bundle:** ⚠️ +813% (194 kB → 1,771 kB) — será optimizado Sprint 9

**Próximo:** Sprint 9 — Bundle Optimization (2026-04-13)

---

## ARCHIVOS EXISTENTES / MODIFICADOS

**Sprint 5:**
- `src/index.css` ✅ completo (+ --tile-filter)
- `src/App.tsx` ✅ completo
- `src/main.tsx` ✅ completo
- `src/data/weatherService.ts` ✅ (+ calculateScore, getScoreColor)
- `src/components/Map/MapView.tsx` ✅ (score calculations, tiles)
- `src/components/Map/MapPin.tsx` ✅ (score visual)
- `src/components/Map/CityTooltip.tsx` ✅ (score + ver detalle)
- `src/components/Map/MapLegend.tsx` ✅ (score legend)
- `src/components/Sidebar/LocationCard.tsx` ✅ (refactor popup)

**Sprint 6 — Fase 1:**
- `src/data/useStore.ts` ✅ (+ lastUpdated tracking)
- `src/data/useWeather.ts` ✅ **REWRITTEN** (mock eliminado, solo API real)
- `src/data/s2Service.ts` ✅ (S2_LEVEL: 13 → 10)
- `src/data/mockCities.ts` ✅ (s2Key: '' → getS2Key(lat, lng))
- `src/data/batchWeatherService.ts` ✅ (ya existía, usado en Sprint 6)
- `src/data/debugCaching.ts` ✅ **NUEVO** (260 líneas, 8 funciones)
- `src/main.tsx` ✅ (+ auto-import debugCaching en DEV)
- `.env.local.example` ✅ **NUEVO**
- `src/docs/10-api.md` ✅ **NUEVO**
- `src/docs/11-caching-strategy.md` ✅ **NUEVO**
- `src/docs/12-fix-s2key.md` ✅ **NUEVO**
- `src/docs/13-debugging-cache.md` ✅ **NUEVO**
- `src/docs/14-setup-accuweather.md` ✅ **NUEVO** (CRÍTICO para usuario)
- `src/docs/HALLAZGOS-CLIMA.md` ✅ **NUEVO**
- `src/data/ANALYSIS-DEEP-DEBUG.md` ✅ **NUEVO**

**Sprint 6 — Fase 2:**
- `src/hooks/useWeather.ts` ✅ **UPDATED** (doRefresh, Visibility API, scheduleNextRefresh, saveSnapshots)
- `src/components/UI/LoadingScreen.tsx` ✅ **UPDATED** (mode prop, visible state fix)
- `src/components/Sidebar/LocationFeed.tsx` ✅ **UPDATED** (fade-refresh class)
- `src/services/history/weatherHistoryService.ts` ✅ **NUEVO** (snapshots + history)
- `src/utils/timeUtils.ts` ✅ **UPDATED** (msUntilNextHour helper)
- `src/index.css` ✅ **UPDATED** (@keyframes fadeInOut)
- `src/docs/22-sprint-6-testing-fixes.md` ✅ **NUEVO** (testing guide)
- `src/docs/23-sprint-6-completion.md` ✅ **NUEVO** (comprehensive summary)
- `src/docs/05-backlog.md` ✅ **UPDATED** (US-602/604/607 marked complete)
- `src/docs/06-sprints.md` ✅ **UPDATED** (Sprint 6 marked complete)

---

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
- `<style>` por componente
- overflow: hidden en html/body/#root (fix Leaflet)
- --glow-rgb como variable local

---

Nunca implementes sin confirmación explícita. Cada fase termina con checkpoint.

### Contexto del proyecto
- `.claude/context/sprint.md` — estado del sprint y US
- `.claude/context/active_task.md` — US activa con detalle
- `.claude/context/decisions.md` — decisiones de arquitectura

### Regla Git
Nunca hagas `git push` ni `git merge` sin confirmación explícita.
Pregunta antes: "¿Puedo hacer [push/merge] a [rama]?"

## Dev Server
- Port: 5175
- Framework: React

### Gestión de contexto
NO uses el sistema de memory nativo de Claude Code para estado del proyecto.
Los archivos `.claude/context/` son la fuente de verdad.

---

## SKILLS DISPONIBLES

Al inicio de sesión, ejecuta automáticamente `context-load`.

| Cuándo | Skill |
|--------|-------|
| Inicio de sesión / "carga el contexto" | `context-load` |
| Fin de sesión / "guarda el contexto" / "wrap" | `context-save` |
| Iniciar una US nueva | `us-start` |
| Analizar una US | `us-analyze` |
| Validar una US completada | `us-validate` |

**Contexto del proyecto** (fuente de verdad):
- `.claude/context/sprint.md`
- `.claude/context/active_task.md`
- `.claude/context/decisions.md`
- `.claude/context/next-session.md` (si existe)
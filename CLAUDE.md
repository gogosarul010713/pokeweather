# CLAUDE.md - Pokemon Weather Explorer

> Memoria entre sesiones gestionada por **claude-mem** (automatico).
> Este archivo cubre solo reglas fijas del proyecto.

**Al iniciar sesion, leer primero:**
1. [ROADMAP.md](ROADMAP.md) - Vision Sprints 8-12
2. [src/docs/INDEX.md](src/docs/INDEX.md) - Indice de documentacion
3. [src/docs/progress.md](src/docs/progress.md) - Estado actual del sprint

---

## Proyecto

Dashboard web interactivo: clima de ciudades del mundo -> tipos Pokemon potenciados (sistema Pokemon GO).

**Stack:** React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry
**Dev server:** port 5173
**Variables de entorno:** `VITE_ACCUWEATHER_KEY` (requerida — sin key error de inicializacion)
**API Key:** https://www.accuweather.com/en/free-weather-api (Tier: Core Weather Starter, 15,000 calls/mes)

---

## Documentacion

| Necesidad | Archivo |
|-----------|---------|
| Iniciar en el proyecto | [src/docs/overview/01-project.md](src/docs/overview/01-project.md) |
| Decisiones arquitectonicas | [src/docs/architecture/](src/docs/architecture/) (09 archivos) |
| Setup credenciales Firebase | [src/docs/technical/08-firebase-setup.md](src/docs/technical/08-firebase-setup.md) |
| Data schema Firestore | [src/docs/architecture/10-firestore-data-schema.md](src/docs/architecture/10-firestore-data-schema.md) |
| Sprint 8 detalles | [src/docs/04-archive/sprint-8.md](src/docs/04-archive/sprint-8.md) |
| Estado actual del sprint | [src/docs/progress.md](src/docs/progress.md) |

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

---

## Estado actual

**Sprint 8:** COMPLETADO (2026-04-08 -> 2026-04-12) — 7/7 US (22 SP)

- US-706: Bottom Sheet mobile (z-index 1001 fix)
- US-804: Firebase + Firestore setup
- US-801: Persistir pronostico (12h snapshots)
- US-802: Catalogo estatico
- US-806: TTL automatico (7 dias)
- US-803: Dashboard Firestore
- US-805: Reportes clasificacion

**Version:** v2.0.0-alpha — merged a develop (commit: 5c48694)
**Bundle:** +813% (194 kB -> 1,771 kB) — sera optimizado Sprint 9
**Proximo:** Sprint 9 — Bundle Optimization (2026-04-13)

---

## Decisiones tomadas

**Tiles + Dark Mode**
- CartoDB: positron + CSS invert (dark), voyager (light)
- dark_matter bloqueado por ORB en Chromium
- CSS filter en `--tile-filter` (index.css) para ambos modos
- `worldCopyJump: true` para persistir pins al cruzar antimeridiano

**Popup Behavior**
- Unico popup general al seleccionar ciudad (list o pin)
- MapPin: solo `setSelectedCity` (sin `setSidebarMode`)
- LocationCard: solo `setSelectedCity` (sin `setSidebarMode`)
- "Ver detalle" en popup -> abre LocationDetail modal
- `stopPropagation()` en botones para evitar cierre accidental

**Quality Scoring**
- Formula: 60% densidad + 25% gyms + 15% rating -> 0-100 score
- MapPin: tamano dinamico (1.5x-3.5x) + color gradient
- Top 10 badges: top 3, #4-10 numeros
- CityTooltip: muestra score + breakdown
- MapLegend: leyenda de score con 5 rangos de color

**Otros**
- TypeScript (.tsx) no .jsx
- `<style>` por componente
- `overflow: hidden` en html/body/#root (fix Leaflet)
- `--glow-rgb` como variable local

---

## Override global

- Memoria entre sesiones: usar claude-mem (automatico)
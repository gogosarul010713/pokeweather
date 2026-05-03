# CLAUDE.md - Pokemon Weather Explorer

> Memoria entre sesiones gestionada por **claude-mem** (automatico).
> Este archivo cubre solo reglas fijas del proyecto.

---

## Proyecto

Dashboard web interactivo: clima de ciudades del mundo -> tipos Pokemon potenciados (sistema Pokemon GO).

**Stack:** React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry
**Dev server:** port 5173
**Variables de entorno:** `VITE_ACCUWEATHER_KEY` (requerida)

**Documentacion:**
- [src/docs/ROADMAP.md](src/docs/ROADMAP.md) - Vision Sprints 8-12
- [src/docs/INDEX.md](src/docs/INDEX.md) - Indice completo
- [src/docs/architecture/11-decision-log.md](src/docs/architecture/11-decision-log.md) - Decisiones permanentes

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

## Override global

- Memoria entre sesiones: usar claude-mem (automatico). 

---

## Skills disponibles

| Cuando | Skill |
|--------|-------|
| Iniciar una US nueva | `us-start` |
| Analizar una US | `us-analyze` |
| Validar una US completada | `us-validate` |

---

## Estado Sprint 10 — al 2026-05-03

**Branch activa:** `sprint-10` | Ultimo commit: `8ee4e46`

### Completado esta sesion
- BUG sidebar vacio (badgeFilter isDefaultFilter) — commit 9e93f22
- US-1113 D-039: CF guarda raw, frontend clasifica — commit 0017629
- Limpieza logs diagnostico — commit 8ee4e46
- Documento arquitectura: `src/docs/architecture/12-data-flow-architecture.md`

### Pendiente proxima sesion (en orden)
1. **Deploy CF** con nuevo schema raw: `firebase deploy --only functions`
2. **Verificar** en Firebase Console que `forecasts/{date_hour}` tiene `icon_code` (no `condition`)
3. **Fix useFirestoreSync**: listener escucha `/city_weather` (raiz), CF escribe en subcoleccion `forecasts`. Real-time update NO llega al frontend. Ver opciones en `12-data-flow-architecture.md`
4. **Eliminar** `VITE_ACCUWEATHER_KEY` de Vercel si existe (no debe estar en prod)
5. **Build final + push** `sprint-10` para deploy preview

### Arquitectura D-039 (clave)
- CF (`syncWeatherLogic.ts`) guarda raw: `icon_code`, `gust_kmh`, sin clasificacion
- `getWeatherFromFirestore()` clasifica con `resolveCondition(icon_code, wind_kmh, gust_kmh)`
- `weatherService.ts:resolveCondition` es el UNICO lugar de clasificacion
- Dev (localhost): frontend llama AccuWeather via proxy Vite con `VITE_ACCUWEATHER_KEY`
- Prod/preview: solo Firestore, `VITE_ACCUWEATHER_KEY` NO debe existir en Vercel

### Variables de entorno criticas
- `.env.local` (dev): `VITE_ACCUWEATHER_KEY` + todas `VITE_FIREBASE_*`
- Vercel (prod): solo `VITE_FIREBASE_*` — SIN `VITE_ACCUWEATHER_KEY`
- `functions/.env` (CF): `ACCUWEATHER_KEY` + `CLEANUP_SECRET`
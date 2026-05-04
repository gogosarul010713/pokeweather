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

### Pendiente Sprint 11 — Auditoría Completada 2026-05-04

📄 **Ver certificación completa:** `sprints/sprint-10/DEUDA-TECNICA-AUDITORIA.md`

**CRÍTICO (1.5 h):**
1. `firebase deploy --only functions` — CF schema raw icon_code + gust_kmh ✅ Código OK
2. Validar Firestore recibe docs con `icon_code` (no `condition`)
3. Test useFirestoreSync real-time en preview (Opcion A implementada) ✅ Código OK

**SEGURIDAD (2 h):**
4. Implementar `firestore.rules` — App Check o origin validation 🔴 CRÍTICO
5. Remover `VITE_ACCUWEATHER_KEY` de Vercel Dashboard (verificar no está en preview)

**TECH DEBT (2.5 h):**
6. Test unitario: `accuLocationKey = ''` regression (BUG-007 fix)
7. Eliminar `calculated_condition` de ForecastDoc tipo (huérfano post-D-039)
8. ✅ Limpiar logs diagnostico — YA HECHO (commit 8ee4e46)

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
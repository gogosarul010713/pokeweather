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

## Estado Sprint 10 — COMPLETADO v2.1.0 (2026-05-04) + Refactors tabla predictiva (2026-05-07)

**Branch activa:** `sprint-10` | Ultimo commit: `d0dbf1f` (preview)

### Sprint 10 — COMPLETADO 100%

✅ **17 US + 4 Features + 5 Bugs = 26 items, 44 SP entregados**
✅ **Documentación:** 51 archivos auditados, 100% sync código
✅ **Build:** v2.1.0 estable, 243.73 KB gzip, 0 TS errors
✅ **Linter:** 79 → 53 problemas (26 errores menos, tipos TS corregidos)
✅ **Deuda técnica:** 10 items identificados, categorizados, certificados

**Commits últimos (Sprint 10 → pending validation):**
- `d0dbf1f` feat(prediction-table): agregar columna tipos potenciados (preview)
- `0844e05` refactor(prediction-table): mostrar hora Mexico/Central en columna horaLocal (preview)
- `2e57210` fix(bug-015): snapshot hours deben reflejar hora actual, no [0..11]
- `0e7c326` fix(bug-014): CORS headers agregados a syncWeatherManual CF
- `2791edf` fix(bug-013): prediction table Unknown — resolveCondition(icon_code)
- `a8f32e1` fix(bug-012): cleanup deja mock + placeholders engañosos

### Pendiente Sprint 11 — Plan Ejecutable

📄 **Ver certificación completa:** `sprints/sprint-10/DEUDA-TECNICA-AUDITORIA.md`

**CRÍTICO (1.5 h):**
1. `firebase deploy --only functions` — CF schema raw OK, lista deploy ✅
2. Validar Firestore recibe icon_code (no condition) en docs nuevos
3. Test useFirestoreSync real-time en preview (Opcion A OK) ✅

**SEGURIDAD (2 h):**
4. Implementar `firestore.rules` — App Check o origin validation 🔴 CRÍTICO
5. Remover `VITE_ACCUWEATHER_KEY` de Vercel Dashboard

**TECH DEBT (2.5 h):**
6. Test unitario: `accuLocationKey = ''` regression
7. Eliminar `calculated_condition` de ForecastDoc tipo

### 🐛 BUGS CORREGIDOS EN PREVIEW (2026-05-04 → 2026-05-07)

**BUG-015** — Lookback duplica climas (snapshots siempre [0..11]) (✅ FIXED `2e57210`, ⏳ PENDING VALIDATION)
- Root cause: createForecastSnapshots nunca recibía startHour, todos docs tenían snapshot_hours=[0..11]
- Impacto: generateLookback buscaba s.hour===targetHour (siempre 0), encontraba snapshots[0] duplicados
- Fix: pasar (now.getHours() + 1) % 24 como startHour a createForecastSnapshots
- Verificación empírica: query Firestore confirmó todos docs anteriores tenían snapshot_hours=[0..11]
- Doc: `bugfixes/bug-015-lookback-duplicate-conditions.md` (pending)

**BUG-014** — syncWeatherManual bloqueado por CORS policy (✅ FIXED `0e7c326`, ⏳ DEPLOYED CF)
- Root cause: Firebase 1st Gen functions deploy desde lib/ (compilado), src/index.ts no compilado
- Solution: agregar CORS headers antes de auth check en syncWeatherManual
- Lesson: siempre correr npm build antes de firebase deploy (agregar predeploy a firebase.json)
- Verificación: curl -X OPTIONS retorna 204 + CORS headers ✅
- Doc: `bugfixes/bug-014-cors-syncweathermanual.md`

**BUG-013** — Prediction table muestra "Unknown" en todas condiciones (✅ FIXED `2791edf`)
- predictionAnalyticsService leía calculated_condition (schema viejo), CF escribe icon_code (D-039)
- Nueva función classifySnapshot() usando resolveCondition(icon_code) como D-039
- Doc: `bugfixes/bug-013-prediction-table-unknown-condition.md`

**BUG-012** — Cleanup deja mock data + placeholders engañosos (✅ FIXED `a8f32e1`)
- PredictionAnalysisDemo: empty state explícito (sin fallback automático a mock)
- LocationCard: indicador visual cuando no hay datos sincronizados
- Doc: `bugfixes/bug-012-cleanup-mock-fallback-engagnoso.md`

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

---

## Cambios recientes en preview (2026-05-07)

### 1. Refactor: Hora local a Mexico/Central
**Archivo:** `src/components/Analytics/PredictionAnalysisTable.tsx`
- Nueva función `getMexicoLocalTime()` usa `Intl.DateTimeFormat` con `America/Mexico_City`
- Columna "Tu Hora Local" → "Hora MX" — convierte `queryTime` (UTC Firestore) a hora Mexico al renderizar
- Sin cambios en Firestore, compatible con docs viejos
- Agrupación por hora usa hora Mexico

### 2. Feature: Columna tipos potenciados en tabla predictiva
**Archivo:** `src/components/Analytics/PredictionAnalysisTable.tsx`
- Nueva columna "Tipos" entre "Condición Predicha" y "Real"
- Renderiza iconos Pokemon (20x20px) via `CONDITION_TO_TYPES` + `TYPE_ICON`
- Imports: `weatherService.ts`, `typeIcons.ts`
- Opcion A inline (sin componente reutilizable) — tabla es diagnostic, no reutilizable
- CSS: clase `.pat-types` con flex layout
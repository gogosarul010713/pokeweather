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

## Estado Sprint 11 — 🔧 BUG-020 COMPLETADO (2026-05-09)

**Branch activa:** `sprint-11` (creada desde develop)
**Status:** BUG-020 ✅ FIXED + HOTFIX ✅ DEPLOYED
**Commits:** `2cf5ff1`, `41a1392`, `802828c` (fix A2+C1+cleanup), `e1f6cd5` (hotfix TS strict), `9b43e05` (doc)
**Preview deploy:** [`pokeweather-1lt8rj8z0`](https://pokeweather-1lt8rj8z0-gogosarul010713-7327s-projects.vercel.app) ✅ Ready

### BUG-020 — Forecast con `created_at` off-hour (COMPLETADO)

**Root Cause H10 (validada):** Localhost dev + VITE_ACCUWEATHER_KEY escribía a Firestore prod. 
Heurística: `accuLocationKey = NULL` → origen frontend dev; CF siempre lo escribe.
35 docs corruptos encontrados en 5 ciudades.

**Fixes aplicadas:**
- **A2:** `created_at = startOfHour(date_hour)` (no `Timestamp.now()`) en CF + frontend
- **C1:** TestingTools gateado en `import.meta.env.DEV` (previene sync accidental en preview/prod)
- **Cleanup:** 35 docs corrompidos borrados via Firebase Admin + BigQuery heurística

**Hotfix TS Strict (2026-05-09):**
Vercel `tsc -b` fue más estricto que local. 9 errores TS6133/TS2740/TS2322 bloquearon 3 deploys.
- `LocationDetail.tsx`: remover import vestigial + state de modal inexistente
- `PrecisionMetrics.tsx`: completar shape PrecisionReport en stub
- `SnapshotPopover.tsx`/`cacheDebugHelper.ts`: cast + prefijo _ a vars no usadas

**Lección:** `npm run build` (tsc -b) detecta más que `tsc --noEmit`. Nuevo invariante para BL-005.

**Documentación:** 
- [bug-020-forecast-off-hour-write.md](src/docs/sprints/sprint-11/bugfixes/bug-020-forecast-off-hour-write.md) — análisis + investigación §10 + hotfix §11
- [INV-001-forecast-off-hour-write.md](src/docs/sprints/sprint-11/investigacion/INV-001-forecast-off-hour-write.md) — 10 secciones, H10 validada

**Pruebas de aceptación pendientes (usuario):**
1. TestingTools NO visible en preview (sí en localhost dev)
2. Tabla predictiva "Hora MX" = HH:00 para docs nuevos
3. BigQuery próxima CF (cron UTC): `created_at_utc_hms = HH:00:00` + `accuLocationKey != NULL`
4. Audit trail: 1 doc tiene `created_at` (HH:00 UTC) + `last_written_at` (real)
5. `npm run dev` local funciona

**Documentación:** Backlog centralizado en `src/docs/sprints/BACKLOG.md`

### Sprint 11 Backlog — 10 Items, 22.5 SP

📋 **Matriz de priorización:** [src/docs/sprints/BACKLOG.md](src/docs/sprints/BACKLOG.md)

**CRÍTICA (2.5h):**
- BL-001: Firestore Rules (App Check) — 2h, bloquea prod real
- BL-002: Remover VITE_ACCUWEATHER_KEY de Vercel — 0.5h

**IMPORTANTE (7h):**
- BL-003: Eliminar calculated_condition — 1h, limpia D-039
- BL-004: Test unitario accuLocationKey = '' — 1.5h, evita regression
- BL-005: Linter 53 errores — 3h, CI/CD limpio
- BL-006: Suite E2E tabla predictiva — 4h, automatiza validación

**FEATURES (15h):**
- BL-007: Dashboard precisión acumulada — 6h
- BL-008: date_hour consolidado a UTC — 5h, para multi-user futuro
- BL-009: Historial de reportes UI — 3h
- BL-010: Agregar más ciudades — 1h

**Estructura escalable:**
- Items > 300 líneas → archivo separado en `backlog/{tipo}/`
- Convención: `bl-NNN-titulo-corto.md`
- Referencias cruzadas a decision-log, handoff, bugfixes
- README con ciclo de vida y buenas prácticas

**Archivos detallados creados:**
- `backlog/deuda-tecnica/bl-001-firestore-rules.md` — 2 opciones (App Check recomendado)
- `backlog/deuda-tecnica/bl-003-eliminar-calculated-condition.md` — cero riesgo
- `backlog/README.md` — guía de navegación y escalabilidad

**Commit:** `docs: crear BACKLOG.md unificado para Sprint 11+` (7437868)

---

## Estado Sprint 10 — ✅ MERGED a DEVELOP (2026-05-07)

**Versión Estable:** v2.1.0 (tag actualizado a develop)
**Branch:** sprint-10 merged → develop
**Commits:** 58 commits, 154 files changed, 28k+ insertions

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

## Cambios recientes en preview (2026-05-07) — BUG-019: Update Inline

### Contexto: Preview Validation (Continuacion de BUG-018)

Sprint 10 cerrado, pero validacion en preview descobrio que tabla predictiva no se actualizaba
tras reportar clima real. Causa raiz: refetch post-reporte leia del cache IndexedDB sin validar
que el `date_hour` del reporte coincidiera exactamente con el del forecast.

### Root Cause (BUG-019)

`handleReportSuccess` en `PredictionAnalysisDemo` llamaba a `fetchPredictions()` sin argumentos:
```typescript
// ANTES
const handleReportSuccess = async () => {
  const realData = await fetchPredictions()  // Lee IndexedDB cache
  setRows(realData)
}
```

Problema:
1. `saveCityForecast` calcula `date_hour` con LOCAL time + next hour
2. `fetchPredictions()` lee forecasts desde cache (mismos docs)
3. `saveWeatherReport` (ANTES BUG-019) recalculaba `date_hour` desde `queryTime` (Timestamp UTC)
4. En preview (servidor UTC), el recalculo podia diferir 1h del original
5. `reportIndex.get(city|date_hour)` nunca encontraba el reporte

### Fix (commits `be07d13` + `392c5c7`)

**Idea central:** NO refetch post-reporte. Actualizar state React directamente con la condicion
reportada. 0 Firebase reads. Cache preservado. UI actualiza en < 16ms.

#### 1. Agregar `dateHour` a `PredictionRow`
```typescript
export interface PredictionRow {
  // ...
  dateHour: string;  // "YYYY-MM-DD-HH" — clave exacta del forecast
}
```

#### 2. Cambiar firma del callback `onReportSuccess`
**Antes:** `onReportSuccess?: () => void`
**Ahora:** `onReportSuccess?: (cityId: string, dateHour: string, reportedCondition: string) => void`

#### 3. `WeatherReportModal` pasa condicion al callback
```typescript
onSuccess?.(selectedCondition)
```

#### 4. `PredictionAnalysisTable` captura fila y pasa datos al padre
```typescript
const handleReportSuccess = async (reportedCondition: string) => {
  if (onReportSuccess && reportingRow) {
    await onReportSuccess(reportingRow.cityId, reportingRow.dateHour, reportedCondition);
  }
};
```

#### 5. `PredictionAnalysisDemo` actualiza state directamente
```typescript
const handleReportSuccess = (cityId: string, dateHour: string, reportedCondition: string) => {
  setRows(prev => prev.map(row =>
    row.cityId === cityId && row.dateHour === dateHour
      ? { ...row, actual: reportedCondition, correct: row.prediction === reportedCondition }
      : row
  ));
};
```

### Leccion Aprendida

**Regla Critica:** NO recalcular claves de matching. Si el writer usa un algoritmo especifico
para generar `date_hour`, todos los lectores/actualizadores deben pasar la clave por la
cadena de callbacks/props. Recalcular desde otro timestamp (especialmente Firestore Timestamps UTC)
causa mismatch por zona horaria.

**Invariante a grabar en Sprint 11:** `date_hour` es LOCAL time + siguiente hora. Nunca calcular
desde UTC. Siempre pasar `forecast.date_hour` directamente cuando se necesite referenciar un
forecast por hora.

### Documentacion Creada

- `src/docs/sprints/sprint-10/bugfixes/bug-019-reporte-no-actualiza-tabla-preview.md` — diagnostico completo
- `src/docs/sprints/sprint-10/07-handoff-sprint-11.md` — invariantes, deuda tecnica, backlog
- Actualizado `bug-summary.md`, `us/07-us-1007-prediction-analysis-table.md`, `README.md`

### Estado Final (2026-05-07)

✅ **Deploy en preview:** `sprint-10` branch activo
✅ **Build:** Sin errores TS, Vercel compilando
✅ **Bugs Post-Sprint:** BUG-012 a BUG-019 resueltos (8 bugs, BUG-018 revertido)
✅ **Refactors:** Hora MX, Tipos potenciados, Update inline
✅ **Documentacion:** 3 archivos nuevos, 4 actualizados

### Cambios recientes en preview (2026-05-07)

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

### 3. Update Inline Post-Reporte (BUG-019)
**Archivos:** `WeatherReportModal.tsx`, `PredictionAnalysisTable.tsx`, `PredictionAnalysisDemo.tsx`
- `PredictionRow` ahora incluye `dateHour: string` para identificacion exacta
- `onReportSuccess` callback recibe `(cityId, dateHour, reportedCondition)`
- `handleReportSuccess` actualiza state React directamente con `setRows(prev => prev.map(...))`
- 0 Firebase reads post-reporte, cache preservado, UI actualiza < 16ms
- Funciona igual en localhost y preview

---

## Próximo Sprint — Sprint 11

**Estado:** Listo para comenzar
**Documentación:** Ver `src/docs/sprints/sprint-10/07-handoff-sprint-11.md`
**Invariantes Críticos:**
1. `date_hour` = LOCAL time + siguiente hora (NUNCA recalcular desde UTC)
2. `resolveCondition()` es ÚNICO lugar de clasificacion (D-039)
3. Cache IndexedDB — no agregar Firebase reads en path critico
4. `startHour` requerido en `createForecastSnapshots`

**Deuda Técnica (Critica):**
- Firestore Rules (App Check o origin validation)
- Remover `VITE_ACCUWEATHER_KEY` de Vercel Dashboard
- Test unitario `accuLocationKey = ''` regression

**Deuda Técnica (Importante):**
- Eliminar `calculated_condition` del tipo `ForecastDoc`
- Suite e2e para tabla predictiva (sin automatización hoy)
- Linter 53 errores pre-existentes
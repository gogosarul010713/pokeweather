# 📋 Backlog Unificado — Sprint 11+

> **Fuente única de verdad** para priorización, seguimiento y decisiones arquitectónicas.
> Estructura jerárquica + tags para escalabilidad sin convertirse en monolito.
> **Última actualización:** 2026-06-28 (US-1202 completada y validada — limpieza de forecasts sin reporte)

---

## 🏗️ Arquitectura del Documento

```
BACKLOG.md (este archivo)
├── Índice ejecutivo (abajo)
├── Matriz de priorización
└── Items → link a subcarpetas por categoría
    └── deuda-tecnica/
    └── features/
    └── arch-decisions/
```

**Regla:** Items > 300 líneas van a archivo separado en `backlog/{categoria}/`

---

## 📊 Matriz de Priorización

| ID | Título | Prioridad | Tipo | Estimación | Bloqueador | Estado |
|----|----|----------|------|------------|-----------|--------|
| **BL-011** | Dual Firebase Projects (DEV + PROD) | 🔴 CRÍTICA | Infra | 1h | BUG-020 H10 | ✅ 2026-05-09 |
| **US-1114** | TestingTools en Preview/Prod | 🔴 CRÍTICA | Feature | 0.5h | BL-011 | Pendiente |
| **BL-001** | Firestore Rules (App Check) | 🔴 CRÍTICA | Seguridad | 2h | Prod-Ready | Pendiente |
| **BL-002** | Remover VITE_ACCUWEATHER_KEY de Vercel | 🔴 CRÍTICA | Seguridad | 0.5h | Prod-Ready | Pendiente |
| **BL-012** | Extraer algoritmo a modulo puro compartido (D-042) | 🔴 CRÍTICA | Arch+Debt | 4h | Drift CF↔Frontend | PLAN LISTO |
| **BUG-028** | Sidebar/tabla divergencia — Firestore fuente de verdad (D-043) | 🔴 CRÍTICA | Bug+Arch | 2h | Precision | ✅ Verificado 2026-06-13 |
| **BUG-029** | Auto-sync desactivado no persiste entre sesiones | 🟡 IMPORTANTE | Bug | 0.5h | — | Pendiente Sprint-12 |
| **BL-003** | Eliminar `calculated_condition` tipo | 🟡 IMPORTANTE | Debt | 1h | D-039 | ✅ REF-001 2026-06-12 |
| **BL-004** | Test unitario accuLocationKey='' | 🟡 IMPORTANTE | Quality | 1.5h | Regression | Pendiente |
| **BL-005** | Linter: 53 errores pre-existentes | 🟡 IMPORTANTE | Quality | 3h | CI/CD | Pendiente |
| **BL-006** | Suite E2E tabla predictiva | 🟡 IMPORTANTE | Testing | 4h | Manual | Pendiente |
| **US-1201** | Panel de precision del algoritmo (Alcance 1) | 🟡 IMPORTANTE | Analytics | 2-3h | — | ✅ 2026-06-22 |
| **US-1202** | Script limpieza forecasts sin reporte | 🟡 IMPORTANTE | Tooling | 1.5h | — | ✅ 2026-06-28 |
| **REF-004** | Eliminar `classification_reports` definitivamente (post D-046) | 🟢 DEUDA | Cleanup | 1h | US-1203 | ✅ 2026-06-29 |
| **US-1203** | Utilidad UI limpieza forecasts sin reporte | 🟡 IMPORTANTE | Feature | 2h | US-1202, REF-004 | ✅ 2026-06-30 |
| **BL-007** | Dashboard de precisión acumulada | 🟢 FEATURE | Analytics | 6h | — | Pendiente |
| **BL-008** | date_hour consolidado a UTC | 🟢 FEATURE | Migration | 5h | Multi-user | Pendiente |
| **BL-009** | Historial de reportes UI | 🟢 FEATURE | UI | 3h | — | Pendiente |
| **BL-010** | Agregar más ciudades | 🟢 FEATURE | Data | 1h | — | Pendiente |
| **REF-002** | Eliminar `saveSnapshots`/`pwe-hist-*` (obsoleto post-D-043) | 🟢 DEUDA | Cleanup | 1h | — | ✅ 2026-06-13 |
| **REF-003** | Eliminar tab Reportes + sistema `classification_reports` huerfano | 🟢 DEUDA | Cleanup | 1h | — | ✅ 2026-06-14 |
| **US-1106b** | Feedback visual al togglear auto-sync | 🟡 IMPORTANTE | Feature | 0.5h | — | ✅ 2026-06-14 |

---

## 🔴 CRÍTICA — Bloquea Producción

### [BL-001] Firestore Rules — App Check o validación de origen

**Descripción:** Actualmente cualquier cliente no autenticado puede escribir en Firestore. Crítico antes de prod real.

**Opciones:**
- **A:** Firebase App Check (recommended) — valida certificado de app, rechaza tráfico no autorizado
- **B:** Validación por origen — más débil, pero funciona para SPA

**Archivo referencia:** `src/docs/sprints/sprint-10/07-handoff-sprint-11.md:69`

**Próximo paso:** Crear `backlog/deuda-tecnica/bl-001-firestore-rules.md`

---

### [BL-002] Remover VITE_ACCUWEATHER_KEY de Vercel

**Descripción:** Si la key existe en Vercel env vars, llamadas frontend van directo a AccuWeather (costo + cuota).

**Acción:** Verificar Vercel Dashboard → Settings → Env Vars. Si existe, eliminar.

**Impacto:** Dev (localhost) usa proxy Vite. Prod/Preview SOLO deben usar Firestore.

**Status:** Pendiente auditoría de Vercel Dashboard

---

## 🟡 IMPORTANTE — Mejora de Calidad

### [BL-003] Eliminar `calculated_condition` del tipo ForecastDoc

**Estado: COMPLETADO en REF-001 (2026-06-12)**

`calculated_condition` eliminado de `ForecastDoc`. `ForecastSnapshot` saneado (8 campos legacy
eliminados, todos los campos restantes obligatorios). `saveCityForecast` eliminada completa.
La CF es ahora la unica fuente de escritura en Firestore.

Ver detalle completo: `src/docs/sprints/sprint-11/refactoring/ref-001-limpieza-schema-legacy.md`

~~**Ubicación:** `src/services/firebase/firebaseWeatherService.ts:42`~~

~~**Problema:** Campo obsoleto. D-039 define que CF escribe RAW (`icon_code`), frontend clasifica.~~

~~**Pasos:** Grep + eliminar de tipo + actualizar D-039~~

---

### [BL-004] Test unitario — accuLocationKey = ''

**Contexto:** Si locationKey queda vacío, `syncWeatherLogic` no guarda forecast (silenciosamente).

**Ubicación:** `src/hooks/useWeather.ts` → needs regression test

**Test case:** Mock AccuWeather para retornar empty locationKey, verificar que forecast NO se guarde.

**Estimación:** 1.5h (escribir test + ejecutar + documentar)

---

### [BL-005] Linter — 53 errores pre-existentes

**Contexto:** Pre-commit hook bloqueado. Workaround: `git commit --no-verify` (🚩).

**Scope:** No nuevos errores introducidos en Sprint 10, solo deuda acumulada.

**Impacto:** CI/CD limpio, mejor DX.

**Acción:** Auditar después de fusionar todas las branches (prioridad baja si no bloquea).

---

### [BL-006] Suite E2E — Tabla Predictiva

**Descripción:** Validación manual en cada deploy (tiempo + error humano).

**Tests necesarios:**
- Cargar tabla con datos
- Reportar clima real → actualización inline
- Agrupar por hora correctamente
- Iconos Pokemon se muestran

**Framework:** Playwright (ya disponible en proyecto)

**Estimación:** 4h (escribir 4 tests + fixtures + ejecutar)

---

## 🟢 FEATURES — Backlog Futuro

### [BL-007] Dashboard de Precisión Acumulada

**Idea:** Tabla predictiva muestra filas individuales. Necesita vista de "88/100 aciertos en Auckland".

**Campos:** Confianza por ciudad, por hora, histórico.

**Estimación:** 6h (modelo + UI + queries)

---

### [BL-008] date_hour consolidado a UTC

**Contexto:** Hoy `date_hour` es LOCAL time. Si soportamos multi-usuario multi-zona, problema.

**Migration:** Requiere convertir docs existentes. Requiere plan de rollout.

**Nota:** Por ahora funciona correctamente para usuario único.

**Estimación:** 5h (script + validación + docs)

---

### [BL-009] Historial de Reportes — UI

**Contexto:** `weather_reports` TTL 30 días, pero sin UI para ver histórico.

**Feature:** Pestaña "Mis Reportes" → filtro por ciudad/fecha.

**Estimación:** 3h (UI + query)

---

### [BL-010] Agregar Más Ciudades

**Contexto:** Sistema es dinámico (no hardcoded). Solo agregar a JSON + sync.

**Estimación:** 1h por ciudad nueva

---

## 📍 Cómo Navegar Este Documento

**Si eres analista/PM:**
- Lee la Matriz (arriba) → selecciona por prioridad
- Haz clic en el item → va a archivo detallado en `backlog/{tipo}/`

**Si eres dev:**
- `us-start BL-001` → skill crea plan de implementación
- Commita con: `feat(BL-XXX): [título]`

**Si eres revisor:**
- Matriz deja de estar sincronizada → actualiza: `Última actualización: YYYY-MM-DD`
- Items nuevos → nuevo row en Matriz + nuevo archivo en carpeta

---

## 🔗 Referencias Cruzadas

**Decision Log:** [src/docs/architecture/11-decision-log.md](../architecture/11-decision-log.md) — D-039 (clasificación), D-029 (auto-sync)

**Handoff Sprint 10:** [07-handoff-sprint-11.md](sprint-10/07-handoff-sprint-11.md) — contexto completo

**Bugs Corregidos:** [sprint-10/bugfixes/bug-summary.md](sprint-10/bugfixes/bug-summary.md) — BUG-013 a BUG-019

**Estructura Tests:** [tests/README.md](../../tests/README.md) — convenciones

---

## 📝 Cómo Agregar Items

1. **Si es pequeño (<300 líneas):** Agrega row en Matriz + párrafo aquí
2. **Si es grande:** Crea archivo en `backlog/{tipo}/bl-NNN-titulo.md` + row en Matriz
3. **Actualiza:** Última actualización (arriba) + versionado en git

---

---

### [REF-004] Eliminar `classification_reports` definitivamente — continuacion de D-046

**Estado: COMPLETADO 2026-06-29 (codigo + deploy DEV). PROD pendiente, decision separada.**

**Contexto:** D-046 (2026-06-14, REF-003) elimino la UI (`ReportsPanel`, `ClassificationReportModal`) y los writers de `classification_reports` porque el componente que la escribia nunca estuvo montado — la coleccion en Firestore siempre estuvo vacia. D-046 conservo deliberadamente `getRecentClassificationReports()` "por compatibilidad con predictionAnalyticsService", asumiendo que retornaria array vacio sin romper nada.

**Por que ahora:** Al diseñar US-1203 (utilidad UI de limpieza de forecasts), se detecto que la logica de "indice de reportes por city_id+date_hour" esta duplicada en 3 lugares (script US-1202, `predictionAnalyticsService.ts`, y la futura US-1203), y dos de ellos cargan `classification_reports` solo para mezclarla con un resultado que sabemos vacio. Mantener esa lectura muerta complica innecesariamente la funcion compartida que se va a extraer para US-1203. Se decide cerrar la deuda ahora, antes de construir sobre ella.

**Para que:** Que la funcion de indice compartida (US-1203) dependa solo de `weather_reports` (la unica coleccion real), sin logica de precedencia ni merge entre dos fuentes, una de las cuales nunca tiene datos.

**Alcance:**
1. `src/services/firebase/classificationReportService.ts` — eliminar `getRecentClassificationReports()` completa
2. `src/services/predictions/predictionAnalyticsService.ts` — quitar import, llamada y merge de `classificationReports`; queda solo `weatherReports`
3. `src/services/cleanup/cleanupService.ts` — `fetchCleanupCounts()` deja de contar `classification_reports` (Query 4 solo cuenta `weather_reports`)
4. `functions/src/index.ts` (`clearFirestoreData`) — quitar el borrado de `classification_reports` del cascade delete
5. Redeploy de la Cloud Function **a DEV únicamente** (`weather-app-dev-f28ce`). **Producción (`weather-app-prod-ef50d`) no se toca en este item** — queda pendiente como paso explícito y separado, requiere confirmación previa antes de ejecutarse
6. `scripts/clean-firestore.ts` — fuera de alcance, es tooling standalone de mantenimiento, no bloquea el cierre de este item

**Riesgos:**
- Cloud Function 1st gen lee `lib/` compilado, no `src/` — requiere `npm run build` antes de deploy (gotcha ya documentado del proyecto)
- Redeploy afecta el proyecto Firebase de DEV — accion con efecto en servicio compartido, requiere confirmacion explicita antes de ejecutar `firebase deploy`

**Impacto en produccion:** Ninguno. `classification_reports` en PROD queda intacta (vacia). El paso 5 (deploy a PROD) sigue pendiente como decision separada — no ejecutado en este item.

**Evidencia de cierre:**
- Codigo: items 1-4 del alcance completados (`classificationReportService.ts`, `predictionAnalyticsService.ts`, `cleanupService.ts`, `functions/src/index.ts`, ademas de `CleanupPanel.tsx` por texto descriptivo desactualizado)
- Build: `npm run build` en `functions/` limpio. `npx tsc --noEmit` en frontend limpio.
- Deploy DEV: `firebase deploy --only functions:clearFirestoreData` contra `weather-app-dev-f28ce` — `Successful update operation` confirmado 2026-06-29. CLI restaurado a `weather-app-prod-ef50d` (proyecto activo original) al finalizar.
- Deploy PROD: NO ejecutado. Pendiente como item separado, requiere nueva confirmacion explicita.
- Verificacion funcional pendiente: validar en DEV que `predictionAnalyticsService` y el cascade delete de `CleanupPanel` siguen funcionando igual (columna REAL sin cambios, counts correctos).

---

### [REF-002] Eliminar `saveSnapshots` / `pwe-hist-*` — Limpieza post-D-043

**Estado: COMPLETADO 2026-06-13**

**Contexto:** Con D-043 (2026-06-12), Firestore es la unica fuente de verdad del clima. El sistema `pwe-hist-*` (IndexedDB local) era el mecanismo pre-Firestore para almacenar historial de precision. Con Firestore como primario (Cambio 1 de BUG-028), `saveSnapshots` quedo efectivamente muerta en operacion normal.

**Que se elimino:**
- `weatherHistoryService.ts` completo — eliminado del filesystem
- Import `{ saveSnapshots, clearOldSnapshots }` en [src/hooks/useWeather.ts](../../../hooks/useWeather.ts)
- Llamada `await saveSnapshots(resultWithTime)` (ex linea 265)
- Llamada `await clearOldSnapshots()` (ex linea 369)

**Segunda fase (2026-06-13 — D-045):** Verificado que los componentes y utils consumidores eran huerfanos (ningun archivo activo los importaba). Eliminados tambien:
- `src/components/TestingTools/HistoryGrid.tsx`
- `src/components/TestingTools/SnapshotPopover.tsx`
- `src/components/TestingTools/PrecisionMetrics.tsx`
- `src/utils/metricsCalculator.ts`
- `src/utils/exportHistory.ts`
- `src/types/weatherSnapshot.ts`

**Impacto en produccion:** Ninguno. Sidebar, mapa y tabla de predicciones no dependen de `pwe-hist-*`. TypeScript: sin errores post-eliminacion.

---

### [BUG-028] Cierre — Verificacion empirica 2026-06-13

**Estado: CERRADO. No hay bug residual.**

Inspeccion con browser MCP (Testing Tools > Predicciones) confirmo:

- **Sidebar** (`getWeatherFromFirestore`): lee el doc mas reciente de `/city_weather/{id}/forecasts` con `orderBy created_at DESC, limit(1)`. Pier 39 = doc 20:00 local, condicion `partly`.
- **Tabla** (`getRecentForecasts`): lee todos los docs de las ultimas 24h via `collectionGroup('forecasts')` sin orderBy, filtra en memoria. Pagina 1 = doc 19:00 local de Pier 39.
- **Conclusion:** Son documentos de Firestore distintos (hora distinta). La divergencia es por diseno: el sidebar siempre muestra la hora mas reciente disponible; la tabla agrupa por `created_at` MX y puede mostrar una hora anterior si la ciudad no fue actualizada en el ultimo ciclo.
- **Ambos leen `snapshots[0].pgo_condition` correctamente** segun D-040.

Ver nota tecnica completa en D-043 del decision-log.

---

**Estado global:** 11 items → 23 SP estimado → ~2 sprints (si todos se hacen)

**Hot path (urgente):** BL-001 + BL-002 antes de prod real (2.5 h)


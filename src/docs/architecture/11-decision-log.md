# 📚 Log de Decisiones de Arquitectura — Pokémon Weather Explorer

> Registro permanente de decisiones técnicas. Nunca borrar entradas, solo agregar.
> Más recientes primero.

---

### 2026-06-30 D-048 — Ventana temporal de reportes en limpieza de forecasts huerfanos (US-1203)

**Contexto:** US-1203 necesita determinar si un forecast de las ultimas 24h tiene reporte en `weather_reports`. La funcion `getRecentWeatherReports(hours)` filtra por timestamp, lo que genera una ventana asimetrica: un reporte puede haberse creado hace 48h o mas, y un forecast de hace 20h puede matchear con ese reporte. Filtrar reportes a 24h o incluso 48h da falsos positivos (forecasts con reporte marcados como huerfanos).

**Decision:** usar `getAllWeatherReports()` (sin filtro temporal) para construir el indice de reportes al comparar contra forecasts. El TTL de `weather_reports` es 30 dias — Firestore los expira automaticamente, sin necesidad de filtro manual en la query.

**Por que no `getRecentWeatherReports(720)`:** seria equivalente en la practica (TTL = 30 dias = 720h), pero depende de que el TTL no cambie y de que ningun reporte llegue tarde. `getAllWeatherReports()` es la expresion correcta de la intencion: "todos los reportes que existen", sin acoplar la logica al TTL.

**Alcance:** nueva funcion `getAllWeatherReports()` en `classificationReportService.ts`. Usada exclusivamente por `cleanupService.ts` (US-1203). `predictionAnalyticsService` conserva `getRecentWeatherReports(24)` por diseno intencional de US-1201 (tabla predictiva muestra solo 24h).

**Nota:** `PrecisionPanel` (US-1201) usa correctamente `getRecentWeatherReports(720)` para su propia consulta — ese flujo no se toca.

---

### 2026-06-28 D-047 — Eliminacion definitiva de classification_reports (REF-004, continuacion de D-046)

**Estado: COMPLETADO 2026-06-29 (codigo + deploy DEV). PROD pendiente, decision separada.**

**Contexto:** D-046 elimino la UI y los writers de `classification_reports`, pero conservo `getRecentClassificationReports()` "por compatibilidad", documentando que en la practica retorna array vacio. Al analizar US-1203 (utilidad UI de limpieza de forecasts) se identifico que esa lectura muerta obliga a la futura funcion de indice compartido (`buildReportIndex`, usada por el script de US-1202, `predictionAnalyticsService`, y la nueva US-1203) a sostener una logica de merge/precedencia entre dos colecciones cuando solo una (`weather_reports`) tiene datos reales.

**Decision:** Cerrar la deuda dejada por D-046 antes de construir US-1203 sobre ella. Eliminar todo el codigo que aun lee o borra `classification_reports`.

**Por que ahora y no despues:** Construir la abstraccion compartida de US-1203 sobre una coleccion que sabemos vacia habria significado disenar para un caso que no existe, y habria que volver a tocar esos mismos archivos en cuanto se notara. Mas barato resolverlo una vez, antes.

**Alcance (ver detalle completo en BACKLOG.md → REF-004):**
- Eliminar `getRecentClassificationReports()` de `classificationReportService.ts`
- Simplificar `predictionAnalyticsService.ts` para depender solo de `weather_reports`
- Quitar conteo de `classification_reports` en `cleanupService.ts`
- Quitar borrado de `classification_reports` en la Cloud Function `clearFirestoreData`
- Redeploy de la Cloud Function a **DEV unicamente** — PROD queda pendiente como decision separada, requiere confirmacion explicita antes de tocarse

**Impacto:** Ninguno en funcionalidad observable — la coleccion siempre estuvo vacia desde D-046. PROD no se modifica en este item.

**Evidencia de cierre:**
- Build limpio: `functions/` (`npm run build`, incluye prebuild sync-classify) y frontend (`tsc --noEmit`), sin errores
- Deploy a DEV (`weather-app-dev-f28ce`) confirmado 2026-06-29: `firebase deploy --only functions:clearFirestoreData` → `Successful update operation`
- CLI de Firebase restaurado a `weather-app-prod-ef50d` al finalizar (estado original de la sesion)
- Deploy a PROD: no ejecutado, queda como decision y paso separado
- Pendiente: verificacion funcional en DEV (tabla predictiva y Cleanup Panel sin cambios de comportamiento)

---

### 2026-06-14 D-046 — Eliminacion tab Reportes y sistema classification_reports (REF-003)

**Contexto:** La tab "Reportes" en TestingTools mostraba siempre "No hay reportes en las ultimas 24 horas". Investigacion revelo que:
- `ReportsPanel` leia de coleccion Firestore `classification_reports`
- El unico escritor era `ClassificationReportModal` (sidebar) — pero ese componente **nunca estuvo montado** en ningun archivo activo (grep confirmado: 0 imports externos)
- Por tanto `classification_reports` en Firestore siempre estuvo vacia
- El sistema `classification_reports` es distinto de `weather_reports` (usado por el boton ⚠️ de la tabla, que SI funciona)

**Decision:** Eliminar la tab Reportes, `ReportsPanel.tsx`, `ClassificationReportModal.tsx`, y las funciones muertas del servicio (`saveClassificationReport`, `isDuplicateReport`, `getCityClassificationReports`, tipo `ClassificationReport`).

**Que se conservo en `classificationReportService.ts`:**
- `saveWeatherReport` — escribe `weather_reports`, usado por `WeatherReportModal` (boton ⚠️ tabla)
- `getRecentWeatherReports` — lee `weather_reports`, usado por `predictionAnalyticsService`
- `getRecentClassificationReports` — mantiene compatibilidad con `predictionAnalyticsService` (retorna array vacio en practica)

**Tab inicial de TestingTools:** cambiada de `reportes` a `predicciones`.

**Consecuencias:** Ninguna en funcionalidad activa. Los reportes del boton ⚠️ siguen funcionando y aparecen en la columna REAL de la tabla predictiva.

---

### 2026-06-13 D-045 — Eliminacion de capa UI legacy del sistema pwe-hist-* (REF-002 continuacion)

**Contexto:** Tras eliminar `weatherHistoryService.ts` en D-044, los componentes y utils que lo consumian quedaron huerfanos — ningun archivo activo los importaba ni montaba:

- `src/components/TestingTools/HistoryGrid.tsx` — tabla de historial local, leia `pwe-hist-*` via `getSnapshots` (ya eliminada en sprint-9)
- `src/components/TestingTools/SnapshotPopover.tsx` — popover de detalle, solo usado por `HistoryGrid`
- `src/components/TestingTools/PrecisionMetrics.tsx` — metricas de aciertos, leia `pwe-hist-*` via `getSnapshots`
- `src/utils/metricsCalculator.ts` — calculador de precision, solo usado por `PrecisionMetrics`
- `src/utils/exportHistory.ts` — exportador Excel, solo usado por `HistoryGrid`
- `src/types/weatherSnapshot.ts` — tipo `WeatherSnapshot` extraido en D-044, solo necesario por los anteriores

**Decision:** Eliminar los 6 archivos. Verificado con grep que ningun archivo activo los importa. `TestingTools.tsx` (punto de entrada) no los monta.

**Consecuencias:** Ninguna en produccion. La funcionalidad de historial de precision queda completamente removida del frontend — la CF ya es responsable de persistir `pgo_condition` en Firestore. Si en el futuro se necesita analisis de precision, se construira sobre Firestore directamente (no IndexedDB local).

**Alternativa descartada:** Mantener los componentes vacios como placeholders — descartado por acumulacion de deuda sin valor.

---

### 2026-06-13 D-044 — Eliminacion de weatherHistoryService (REF-002)

**Contexto:** Con D-043, Firestore paso a ser la fuente de verdad del clima. El sistema de historial local (`weatherHistoryService.ts` + IndexedDB `pwe-hist-*`) era el mecanismo pre-Firestore para almacenar snapshots de precision. Al hacer Firestore primario en `useWeather.ts`, `saveSnapshots` quedo muerta en operacion normal — solo corria en el fallback de AccuWeather que D-043 prohibe activar.

**Decision:** Eliminar `weatherHistoryService.ts` completo y sus llamadas en `useWeather.ts`. El tipo `WeatherSnapshot` se preservo en `src/types/weatherSnapshot.ts` porque `HistoryGrid` y componentes relacionados de TestingTools aun lo necesitan para tipar datos historicos existentes en IndexedDB de usuarios.

**Consecuencias:**
- `HistoryGrid` y `PrecisionMetrics` (TestingTools) no reciben datos nuevos — muestran historial pre-D-043 mientras exista en IndexedDB local
- Sidebar, mapa y tabla predictiva: sin impacto
- Bundle reducido (~160 lineas menos)
- `snapshots[0]` es el criterio unico para sidebar Y tabla (consistencia garantizada)

**Alternativa descartada:** Mantener `saveSnapshots` activo en el path de Firestore — descartado porque duplicaria logica ya manejada por la CF. La CF ya persiste `pgo_condition` por snapshot; el frontend no debe recalcular ni re-persistir.

---

### 2026-06-12 D-043 — Firestore como unica fuente de verdad del sidebar (BUG-028)

**Contexto:** El sidebar y la tabla predictiva mostraban condiciones distintas para la misma ciudad y hora.
La tabla usaba `pgo_condition` ya persistido por la CF en Firestore. El sidebar llamaba AccuWeather
directamente, clasificaba el resultado con `resolveCondition`, y actualizaba el store. Dos llamadas
independientes a AccuWeather en momentos distintos producian slots distintos y por tanto condiciones
distintas.

**Causa raiz investigada en sprint-11 (BUG-028):**
- La CF corre a HH:00 UTC via cron GCP. El frontend tenia su propio timer a HH:00 hora local.
  Son HH:00 distintas — nunca coinciden.
- AccuWeather actualiza sus datos cada ~30 minutos (rotation). Si el frontend pide a AccuWeather
  a las HH:23, puede recibir ya el slot de HH+1 (rotacion anticipada). La CF que corrio a HH:00
  guardo el slot de HH. Son horas distintas, condiciones distintas.
- `findCurrentSlot` (implementado en BUG-028) resuelve el caso de "cual slot tomar" pero no
  resuelve la divergencia de fondo: dos llamadas independientes a AccuWeather son dos fuentes
  de verdad distintas.

**Investigacion de AccuWeather API (2026-06-12):**
- La API no acepta parametro de hora — siempre devuelve las proximas N horas desde el momento
  de la llamada. No hay forma de pedir "el clima de Pier 39 a las 8pm especificamente".
- El campo `EpochDateTime` en cada slot identifica la hora del pronostico. Es el unico mecanismo
  para saber a que hora corresponde cada slot.
- Los datos se actualizan ~30 min antes del inicio del slot siguiente (rotation anticipada).

**Decision:** Firestore es la unica fuente de verdad del clima para el sidebar y el mapa.
El frontend no llama AccuWeather para clasificar ni para actualizar el store en el refresh horario.

**Arquitectura resultante:**
- **CF (GCP cron):** unica que llama AccuWeather + clasifica + escribe Firestore. No cambia.
- **`useFirestoreSync`:** escucha `onSnapshot` en `/city_weather` summary docs. Cuando la CF
  termina de escribir, Firestore notifica en tiempo real. El hook refetcha `getWeatherFromFirestore`
  y actualiza el store. Cero race condition — el frontend no corre a HH:00, espera la notificacion.
- **`useWeather.ts`:** el timer de auto-refresh AccuWeather (HH:00) se desactiva para el flujo
  normal. La carga inicial y los refrescos horarios vienen de Firestore via `useFirestoreSync`.
  AccuWeather se mantiene solo como fallback de emergencia (Firestore vacio o sin conexion).
- **`batchWeatherService`:** pasa a rol de fallback exclusivo. No se llama en flujo normal.

**Race condition eliminado:**
- Antes: frontend timer HH:00 + CF cron HH:00 → ambos llaman AccuWeather en paralelo,
  AccuWeather puede responder distinto a cada uno.
- Ahora: CF escribe → Firestore notifica → frontend lee lo que CF escribio. Siempre el mismo dato.

**Impacto en deployments:**
- Frontend (Vercel): si — cambios en `useWeather.ts`
- CF (GCP): no — sin cambios
- Firestore schema: no — sin cambios

**Fallback de emergencia (primer uso / ciudad nueva / Firestore offline):**
- Si `getWeatherFromFirestore` retorna null → AccuWeather como respaldo
- Si AccuWeather falla → valores por defecto (`condition: 'cloudy'`, tipos vacios)

**Consecuencias en codigo:**
- `useWeather.ts` — desactiva timer AccuWeather para refresh horario; carga inicial usa Firestore
- `weatherService.ts` — remueve log temporal `[BUG-028]`
- `batchWeatherService.ts` — sin cambios en logica, solo cambia quien lo llama (fallback only)

**Verificacion empirica (2026-06-13):** Inspeccion con browser MCP confirmo que sidebar y tabla
muestran documentos de Firestore distintos por diseno, no por bug:
- Sidebar (`getWeatherFromFirestore`): `orderBy('created_at', 'desc'), limit(1)` — doc mas reciente de la ciudad.
- Tabla predictiva (`getRecentForecasts`): `collectionGroup('forecasts')` sin orderBy — todos los docs de 24h, filtrados en memoria.
- Pier 39 ejemplo: sidebar mostraba doc 20:00 local, tabla mostraba doc 19:00 local (el anterior en la coleccion).
- Conclusion: divergencia esperada cuando la tabla esta en pagina historica vs la hora actual del sidebar. No hay bug residual.

**Decisiones relacionadas:** D-039 (CF raw), D-042 (algoritmo compartido), BUG-028 (epoch_dt + findCurrentSlot)

---

### 2026-05-11 D-042 — Algoritmo de clasificacion en modulo puro compartido entre frontend y CF (BL-012)

**Contexto:** D-039 (2026-05-03) establecio que la CF guarda raw y el frontend clasifica.
La logica del algoritmo (`resolveCondition`, `WEATHER_TRANSLATIONS`, umbrales Windy) vive
unicamente en `src/services/weather/weatherService.ts`. Sin embargo, dos casos de uso
recurrentes requieren que la CF clasifique:

1. Persistir `pgo_condition` ya calculado en Firestore (evita recalculo en cada lectura)
2. Logs/analytics server-side donde sea util saber la condicion PGO antes del frontend

En sesion 2026-05-11 se intento duplicar `resolveCondition` en la CF (tablas separadas
`CAN_WINDY` + `BASE_CONDITION`). Este intento confirmo lo que D-039 ya advertia: una
segunda copia diverge inmediatamente del original y rompe la garantia de
"un solo cambio del algoritmo afecta todos los lados".

**Problema:**
- D-039 mantiene la pureza arquitectonica pero obliga al frontend a recalcular
  `resolveCondition` en cada `getWeatherFromFirestore`, `lookbackService`,
  `predictionAnalyticsService`. Tres llamadas separadas al mismo algoritmo en cada lectura.
- Duplicar la logica en la CF (lo que se intento hoy) reintroduce el drift que D-039
  habia eliminado. No es opcion.
- Firebase CLI solo empaqueta el directorio `functions/`. Cualquier `import` desde la CF
  hacia `../../src/...` falla en runtime — el archivo no existe en el servidor desplegado.
- Compartir el archivo `weatherService.ts` completo desde la CF arrastra dependencias del
  frontend (Zustand, idb-keyval, s2-geometry) incompatibles con Node.js.

**Decision:** Extraer el algoritmo PURO a `src/services/weather/weatherClassify.ts`.
Frontend re-exporta desde `weatherService.ts` (consumidores no cambian). CF importa una
copia en `functions/src/shared/weatherClassify.ts` que se genera automaticamente por
script `prebuild` antes de `tsc`.

**Archivo `weatherClassify.ts` contiene SOLO:**
- `WEATHER_TRANSLATIONS` (mapa de 40 iconos AccuWeather → condicion PGO + flag canWindy)
- `WINDY_WIND_KMH` = 29, `WINDY_GUST_KMH` = 31 (umbrales)
- `WeatherCondition` (tipo)
- `getBaseCondition(iconId)` (funcion pura)
- `resolveCondition(iconId, windKmh, gustKmh)` (funcion pura)
- Cero imports de Zustand, idb-keyval, s2-geometry, react, firestore

**Script de sincronizacion (en `functions/package.json`):**
```
"prebuild": "node ../scripts/sync-classify.mjs"
"build":    "tsc"
```
`scripts/sync-classify.mjs` copia `src/services/weather/weatherClassify.ts` a
`functions/src/shared/weatherClassify.ts` con un header generado:
`// AUTOGENERADO desde src/services/weather/weatherClassify.ts — NO EDITAR`

**Garantias:**
1. **Source of truth unico:** modificar `src/services/weather/weatherClassify.ts` cambia
   automaticamente el algoritmo en frontend y CF en el siguiente build/deploy.
2. **Type safety preservada:** ambos lados consumen TypeScript con tipos completos.
3. **Tests existentes vigentes:** `tests/unit/services/weatherService.test.ts` cubre los
   44 iconos + Windy override; sigue cubriendo via re-export.
4. **CI/CD compatible:** `firebase deploy --only functions` ejecuta `npm run build` que
   dispara `prebuild` que dispara `sync-classify.mjs`. Sin pasos manuales.
5. **Verificable en CI:** test que compara byte-a-byte source vs copia generada. Si alguien
   edita la copia directamente, el test falla.

**Schema Firestore con pgo_condition:**
- CF guarda `pgo_condition` en cada snapshot (calculado al momento del fetch AccuWeather)
- Frontend lee `pgo_condition` directo cuando esta presente (docs nuevos)
- Frontend recalcula con `resolveCondition` cuando el campo no existe (docs legacy + dev path)

**Refutaciones documentadas:**
- ❌ Test de paridad sin extraccion: detecta drift pero no lo elimina. No cumple "un solo lugar".
- ❌ Importar `weatherService.ts` desde CF: arrastra deps de frontend incompatibles con Node.
- ❌ Import `../../src/...` desde CF deployada: Firebase CLI no sube el padre, falla en runtime.
- ❌ JS puro con JSDoc: pierde `strict: true` del proyecto.
- ❌ npm workspaces / monorepo: overhead innecesario para un solo archivo compartido.

**Consecuencias en codigo existente:**
- `firebaseWeatherService.ts:343` — sin cambio (sigue importando de weatherService.ts)
- `predictionAnalyticsService.ts:11` — sin cambio
- `lookbackService.ts:12` — sin cambio
- `weatherService.ts` — agrega `export * from './weatherClassify'` y elimina su copia local
- `syncWeatherLogic.ts` — importa de `./shared/weatherClassify`, elimina su copia local
  agregada hoy

**Plan de implementacion:** `src/docs/sprints/backlog/arch-decisions/bl-012-shared-classifier.md`

**Reglas para futuro:**
- Cualquier cambio al algoritmo se hace EN `src/services/weather/weatherClassify.ts`
- NUNCA editar `functions/src/shared/weatherClassify.ts` (es autogenerado)
- NUNCA agregar logica de clasificacion local en CF, frontend services, scripts, etc.
- Si necesitas un nuevo helper de clasificacion: agregarlo a `weatherClassify.ts`

**Decisiones relacionadas:** D-039 (CF raw → ampliada por esta), D-002 (Firebase backend)

---

### 2026-05-10 D-040 — TestingTools habilitado en Preview/Prod via VITE_ENABLE_TESTING_TOOLS (US-1114)

**Contexto:** BUG-020 Fix C1 gateó TestingTools con `import.meta.env.DEV` para evitar
sincronizaciones accidentales desde preview a Firestore prod. BL-011 resolvió la causa
estructural: localhost ahora apunta a `weather-app-dev-f28ce` y Vercel a `weather-app-prod-ef50d`.
Con proyectos Firebase aislados, ya no hay riesgo de contaminacion cruzada.

**Problema:** TestingTools (panel de sync manual + auto-sync) es necesario en preview/prod
para forzar sincronizaciones y validar el algoritmo de clasificacion. Con el gate `DEV` queda
inaccesible en todos los builds de Vercel.

**Decision:** Gate extendido a `import.meta.env.DEV || import.meta.env.VITE_ENABLE_TESTING_TOOLS === 'true'`.

La variable `VITE_ENABLE_TESTING_TOOLS=true` se setea en Vercel Dashboard para entornos activos
de prueba. Se omite en `main` cuando se llegue a version estable.

**Alternativas descartadas:**
- `!import.meta.env.PROD` — no distingue preview de main (ambos son PROD=true en Vite)
- Hardcodear visible en todos los builds — no deja puerta para ocultarlo en main futuro

**Consecuencias:**
- TestingTools visible en Vercel preview/prod cuando `VITE_ENABLE_TESTING_TOOLS=true`
- Sin cambios en localhost (sigue usando `import.meta.env.DEV`)
- En main estable: omitir la variable es suficiente para ocultarlo, sin cambio de codigo
- Unico archivo de codigo modificado: `Header.tsx` (2 lineas)

**Archivos:** `src/components/Header/Header.tsx`, `.env.local.example`
**US:** US-1114

---

### 2026-05-09 D-041 — Dual Firebase Projects: DEV (`weather-app-dev-f28ce`) / PROD (`weather-app-prod-ef50d`) (BL-011)

**Contexto:** BUG-020 H10 identificó que localhost dev escribía a Firestore prod en cada
`npm run dev` + refresh, generando docs con `created_at` off-hour. Fix A2 mitigó el síntoma
pero la causa estructural (un solo Firebase para todos los entornos) permanecía.

**Decision:** Dos Firebase projects independientes. `.env.local` apunta a `weather-app-dev-f28ce`.
Vercel Dashboard sigue apuntando a `weather-app-prod-ef50d` sin cambios en codigo.

**CF (Decision 4A):** Cloud Functions NO se despliegan en `weather-app-dev-f28ce`. Localhost
escribe directo a Firestore dev via frontend. CF cron solo corre en prod.

**Consecuencias:**
- TestingTools en localhost escribe a dev, no a prod — testing libre sin riesgo
- Prerequisito estructural para D-040 (US-1114)
- `.firebaserc` default sigue apuntando a prod (necesario para `firebase deploy`)

**Archivos:** `.env.local`, `.env.local.example`, `src/components/TestingTools/TestingTools.tsx`
**BL:** BL-011

---

### 2026-04-26 D-038 — Organización de Tests: unit/ + e2e/ui/ + Documentación (Session 21)

**Contexto:** Proyecto acumuló tests dispersos en múltiples ubicaciones (tests/, tests/unit/, src/services/, tests/e2e/) sin estructura clara. Documentación de testing inexistente.

**Problema:**
- Tests unitarios en `tests/unit/` vs `tests/` vs `src/services/` (sin estándar)
- Tests E2E en `tests/e2e/` vs raíz de `tests/`
- Imports inconsistentes (relativos con profundidad variable)
- Sin guía de cómo escribir tests (convenciones, patrones)
- Fixtures compartidas sin documentación

**Decisión:** Estructura clara + documentación

**Estructura Final:**
```
tests/
├── unit/
│   ├── services/        (weatherService, cacheService)
│   ├── hooks/           (useStore)
│   └── README.md
├── e2e/
│   ├── ui/              (6 smoke/interaction tests)
│   └── README.md
├── fixtures/            (mock-cities.ts)
└── README.md
```

**Motivo:**
1. **Claridad:** Vitest (unitarios) vs Playwright (E2E) completamente separados
2. **Escalabilidad:** `tests/unit/hooks/`, `tests/unit/components/` futura sin conflicto
3. **Documentación:** 3 READMEs definen convenciones, patrones, debugging
4. **Imports consistentes:** Todos relative a `tests/unit/` o `tests/e2e/` raíz
5. **Fixtures centralizadas:** `tests/fixtures/` para datos compartidos

**Implementación:**
- Movidos 9 archivos `.test.ts` y `.spec.ts` a ubicaciones finales
- Actualizados imports en 2 servicios (weatherService, cacheService)
- Eliminados duplicados (`tests/unit/weatherService.test.ts` old)
- Creados 3 READMEs con patrones, ejemplos, debugging

**Consecuencias:**
- Cero cambios de código (puro refactoring de estructura)
- Tests siguen funcionando sin cambios (`npm test`, `npm run test:e2e`)
- Nuevo desarrollador tiene guía clara para escribir tests
- Estructura soporta crecimiento futuro (componentes, utilities)

---

### 2026-04-26 D-037 — Reorganización de Sprint 10: Estructura Clara de Documentación (Session 19)

**Contexto:** Sprint 10 completado con 9 fases, 20 US, 11 bugs, pero documentación desorganizada en carpeta sprint-10/ (41 archivos .md con nomenclatura inconsistente, distribución confusa).

**Problema:** 
- Archivos numerados desordenadamente (01-, 02-, 07-, 09-, 09-, 10-, 11-, 12-, 13-, 13-, 14-, 15-, 16-, 17-, 17-)
- US distribuidas entre raíz y carpeta `us/`
- Looker docs dispersos sin agrupación clara
- Bugs en carpeta `bugfixes/` con nomenclatura mayúsculas

**Decisión:** Reorganizar en estructura temática clara con carpetas minúsculas

**Estructura Elegida:**
```
sprint-10/
├── us/                    ← TODAS las US (01-20, enumeradas)
├── archive/               ← Looker + docs reutilizables (01-06)
├── bugfixes/              ← Bug tracking (001-011 + summary)
├── 01-04-docs-sprint      ← Documentos generales (minúsculas)
└── README.md              ← Actualizado
```

**Motivo:**
1. Claridad visual: 4 carpetas temáticas claras
2. Escalabilidad: Sprint 11+ pueden replicar estructura
3. Reusabilidad: `archive/` contiene decisiones/planes para futuros sprints
4. Mantenibilidad: Búsqueda y navegación más rápida
5. Nomenclatura: Minúsculas consistentes (proyect style guide)

**Implementación:**
- Renombradas todas las US (uppercase → lowercase, numeración consistente)
- Movidas archivadas a `archive/`
- Renombrados bugfixes a minúsculas
- Creados BUG-009 y BUG-010 (faltaban documentar)
- Creado `bug-summary.md` con índice de 11 bugs
- README.md completamente actualizado

**Resultado:**
- ✅ 41 archivos .md organizados en 4 carpetas + raíz
- ✅ Nomenclatura consistente
- ✅ Índices claros en README.md
- ✅ Ready para commit + merge

**Impacto:** Zero (reorganización pura, sin cambios de código ni decisiones técnicas)

**US Relacionada:** Ninguna (tarea de mantenimiento)

---

### 2026-04-26 D-036 — AccuWeather Base URL: dataservice.accuweather.com en Cloud Functions (US-1110)

**Contexto:** US-1110 Testing. Cloud Function `syncWeatherManual` retornaba 403 Forbidden de AccuWeather.

**Investigación:** 
- Cliente (React) usa proxy en `vite.config.ts`: `/api/accuweather/` → `https://dataservice.accuweather.com/`
- Cloud Function estaba usando: `https://api.accuweather.com/` (endpoint incorrecto)

**Decisión:** Cloud Function debe usar mismo endpoint base que cliente: `https://dataservice.accuweather.com/`

**Motivo:**
1. Consistencia: ambos usan mismo servidor AccuWeather
2. API key válida para dataservice, no para api
3. Client-tested: el cliente ya funciona con dataservice.accuweather.com

**Implementación:**
- Cambiar URL en `functions/src/syncWeatherLogic.ts` línea 80
- Agregar parámetro `metric: true` (consistente con cliente)
- Commit: `57ea15d` ✅

**Validación:** syncWeatherManual retorna `success:true, citiesUpdated:5` ✅

---

### 2026-04-25 D-035 — Cascade Delete incluye weather_reports + classification_reports (BUG-011 / US-1109)

**Contexto:** BUG-011 detectado en Session 17. Cascade Delete de `/city_weather` no borraba `weather_reports` ni `classification_reports`. Al regenerar ForecastDocs en la misma hora, el `reportIndex` en `fetchPredictions()` encontraba reportes del ciclo anterior, contaminando la tabla con datos "pre-limpieza".

**Opciones consideradas:**
- A: Opcion separada en CleanupPanel para borrar reports (independiente del cascade)
- B: Incluir reports en Cascade Delete automaticamente — **ELEGIDA**
- C: Solo warning informativo en tabla (no destructivo)

**Decision:** Opcion B — incluir `weather_reports` y `classification_reports` en el Cascade Delete.

**Motivo (decision del usuario):**
Sin la fuente de verdad (ForecastDoc), los reportes son datos huerfanos sin valor analitico.
Un reporte `{ city_id, date_hour, reported_condition: "rain" }` no sirve si no existe el ForecastDoc
con el que comparar. La semantica correcta de "limpiar todo" es: ForecastDocs + Reportes asociados.

**Implementacion (US-1109):**
- Cloud Function `clearFirestoreData`: borrar `weather_reports` + `classification_reports` cuando `cascadeDeleteAll=true`
- `CleanupCounts`: +`reportsDocs: number` (count para mostrar en UI)
- `CleanupPanel.tsx`: descripcion y toast actualizados con count de reports

**Archivos:** `functions/src/index.ts`, `cleanupService.ts`, `CleanupPanel.tsx`
**US relacionada:** US-1109 | **Bug:** BUG-011

---

### 2026-04-25 D-034 — US-1108: Agrupacion Dinamica con estado local (no TanStack Grouping API)

**Contexto:** US-1108. Tabla predictiva necesita toggle para cambiar criterio de agrupacion entre hora/ciudad/clima.

**Decision:** Estado local `groupBy` + render custom con `getGroupKey()`. NO usar TanStack Table v8 Grouping API.

**Motivo:**
1. TanStack Grouping API introduce subrows y expanded rows que no encajan con el patron de "group header como `<tr>` inyectado" ya implementado
2. El patron existente (IIFE con for-loop y group headers) es trivialmente extensible con una funcion `getGroupKey(row, groupBy)`
3. Sort dinamico via `GROUP_SORTS` record: cambio de modo = `setSorting(GROUP_SORTS[mode])` + `table.setPageIndex(0)`

**Implementacion:**
- `GroupBy = 'hora' | 'ciudad' | 'clima'` — tipo TypeScript
- `GROUP_SORTS: Record<GroupBy, SortingState>` — sorts predefinidos por modo
- `getGroupKey(row, groupBy)`: hora=getHourBucket, ciudad=cityName, clima=prediction.toLowerCase()
- Para clima: group header usa `<img>` de WEATHER_IMAGES (no emoji estatico)
- UI: 3 pills en `.pat-header` con `.pat-group-btn.active`

**Archivo:** `PredictionAnalysisTable.tsx` (+100 lineas, 0 cambios en data layer)
**Commit:** `0c86741`

---

### 2026-04-25 D-033 — BUG-009: Serialización de Timestamps en cacheService (Session 15)

**Contexto:** Lookback 12h siempre vacio. 3 causas encontradas via auto-debugger.

**Problema principal (causa 2):** `setPredictionsCacheMetadata` y `setForecastCache` sobreescriben `created_at` al re-serializar:
```typescript
// INCORRECTO:
created_at: doc.created_at?.toMillis?.() ?? Date.now()
// Cuando created_at ya es number: toMillis() = undefined -> Date.now()
// Todos los docs quedan con el mismo timestamp

// CORRECTO:
created_at: typeof doc.created_at === 'number' ? doc.created_at : doc.created_at?.toMillis?.() ?? now
```

**Regla general:** Siempre verificar `typeof === 'number'` antes de llamar `.toMillis()` en campos que pueden ser Timestamp O number (docs que vienen de IndexedDB ya estan serializados).

**Causa 3:** `fetchPredictions()` usaba `getForecastCache()` (sync cache, 4 docs) ignorando `getPredictionsCacheMetadata().documents` (30 docs). Fix: acepta `preloadedDocs` param.

**Causa 1:** Gate `if (report)` en `generateLookback` — lookback solo mostraba items confirmados. Ahora `wouldBeCorrect: boolean | null`.

**Afecta:** `cacheService.ts` (setForecastCache, setPredictionsCacheMetadata, cleanExpiredForecastDocs), `predictionAnalyticsService.ts`, `PredictionAnalysisTable.tsx`, `PredictionAnalysisDemo.tsx`

**Commit:** `e6da311`

---

### 2026-04-25 D-032 — BUG-008 Root Cause: date_hour LOCAL vs UTC en saveWeatherReport (Session 14)

**Contexto:** BUG-008 persistia despues de 2 fixes (v1 colecciones, v2 callback refetch). Tabla seguia sin actualizar columna "Real" tras reportar clima.

**Problema Identificado:**
- `saveCityForecast()`: `date_hour = formatDateHour(nextHour)` → usa `getHours()+1` (LOCAL time)
- `saveWeatherReport()`: `date_hour = queryTimeDate.toISOString().slice(0,13)` → UTC, sin redondeo
- Ejemplo UTC-5: forecast key = `"city|2026-04-25-10"` (local), report key = `"city|2026-04-25-14"` (UTC) → MISMATCH
- `reportIndex.get(key)` siempre null → columna "Real" = vacia siempre

**Decision:** En `saveWeatherReport()`, replicar exactamente el algoritmo de `saveCityForecast()`:
```typescript
const reportNextHour = new Date(queryTimeDate)
reportNextHour.setHours(reportNextHour.getHours() + 1, 0, 0, 0)
// formatear con getFullYear/getMonth/getDate/getHours (LOCAL)
```

**Por que es correcto:** `queryTimeDate` es `forecast.created_at.toDate()` — mismo punto en el tiempo que `now` en saveCityForecast. Aplicar `getHours()+1` produce exactamente el mismo `date_hour` que se guardo en el forecast document.

**Archivo:** `src/services/firebase/classificationReportService.ts` — funcion `saveWeatherReport()`
**Commit:** pendiente

---

### 2026-04-24 D-031 — Implementación de D-018: Early Return en saveCityForecast (US-1107 Debug Session 13)

**Contexto:** US-1107 Lookback completada pero 3 bugs críticos reportados al día siguiente: tabla vacía, warnings sin snapshots, lookback deshabilitado.

**Investigación:** Todos 3 bugs eran síntomas de la MISMA causa raíz: D-018 no estaba implementada.

**Problema:**
- `saveCityForecast()` guardaba documentos INCLUSO si `snapshots.length === 0` (cache-hits geoespaciales)
- Documentos vacíos se cargaban en fetchPredictions() → se saltaban en loop → tabla parecía vacía
- Warning "has no snapshots" era síntoma, no causa
- Lookback vacío porque documentos padre sin snapshots

**Decisión:** Implementar D-018 con early return (decisión previa, ahora ejecutada)

```typescript
// NUEVO:
if (snapshots.length === 0) {
    console.log(`[Firebase] ℹ️ ${city.id}: No snapshots (cache-hit), skipping save`)
    return  // ← FIX
}
```

**Motivo:**
1. Cache-hits sin snapshots no tienen valor (múltiples ciudades, mismo locationKey)
2. Evita contaminación de Firestore (53% de documentos eran fantasma)
3. Simplifica queries (sin necesidad de filtrar NULL)
4. Reduce writes ~50%

**Implementación:**
- Archivo: `src/services/firebase/firebaseWeatherService.ts` línea 99-102
- 1 línea: `return` statement
- Compilación: ✅ sin errores (842 KB)
- Commit: `a44958e`

**Validación pendiente:**
- Limpiar IndexedDB local (user action)
- Refresh página (user action)
- Verificar consola: NO debe haber warnings de snapshots
- Verificar tabla: debe mostrar datos sin saltos
- Verificar lookback: debe expandirse con 12h histórico

**Consecuencias:**
- Nuevos documentos SOLO si snapshots.length > 0
- Documentos históricos (pre-fix) siguen sin snapshots en Firestore
- Recomendación: ejecutar cleanup script posterior

**Decisión relacionada:** D-018 (Sprint 10, Decision Log)

---

### 2026-04-23 D-030 — Auto-sync configurable: Firestore flag + Zustand + Header toggle (US-1106)

**Contexto:** Usuario necesita control total sobre cuándo se generan datos (para ciclos de X días + cleanup + repetir). Necesitaba pausar el cron Firebase sin parar completamente el servidor.

**Decisión:** Implementar 3 capas de control:
1. **Firestore flag:** `/settings/app-config.autoSyncEnabled` (Opción A: servidor se pausa)
2. **Zustand state:** `autoSyncEnabled` en store
3. **Header button:** Toggle visual (⏰ verde vs 🔴 amarillo) con feedback real-time

**Lógica:**
- Si `autoSyncEnabled = true`: Cloud Function ejecuta normalmente en HH:00
- Si `autoSyncEnabled = false`: Cloud Function chequea flag, retorna `{ skipped: true }` sin hacer nada
- Botón manual "Sincronizar ahora" siempre funciona, ignora toggle (user override)

**Razón:**
1. Opción A (servidor pausa) vs Opción B (solo cliente ignora): Usuario quería PAUSAR la colección, no solo ocultar datos
2. Firestore flag vs localStorage: Firestore es source of truth (visible en Console, persiste, auditable)
3. Header button vs Settings panel: Accesible rápidamente, user intenta cambiar antes de recargar

**Implementación:**
- Cron: `0 * * * *` (HH:00 UTC)
- Cloud Function chequea: `if (!autoSyncEnabled) return { skipped: true }`
- settingsService: initializeSettings (merge: true para backward compatibility)
- App.tsx: load settings en useEffect al iniciar
- Header: toggle button con estado visual

**Mitigación de riesgos:**
- **Risk #1 (doc not found):** initializeSettings usa merge: true (no sobrescribe existing)
- **Risk #2 (race condition):** Tolerable window (<1s), user puede reintentar
- **Risk #3 (backward compatibility):** Default true si doc no existe

**Consecuencias:**
- +1 Firestore doc (negligible storage)
- +1 Cloud Function read per execution (quando ejecuta, chequea flag)
- User tiene full control de ciclos de datos: auto 24h → limpiar → manual on-demand
- Header UI más completa (4 buttons: theme, sync-status, sync-toggle, testing)

**US relacionada:** US-1106 (2 SP, Session 8 completada)

---

### 2026-04-23 D-029 — Cron ejecuta cada HH:00 UTC (no HH:15) — US-1106

**Contexto:** Original HH:15, user quería "cada hora en punto" (HH:00).

**Decisión:** Cambiar cron de `15 * * * *` a `0 * * * *`

**Motivo:** Más predecible para user ("sincronización a las H en punto"), evita conflicto con otros jobs potenciales

**Consecuencia:** Firestore documents ahora tienen timestamp correcto en HH:00 (cambio menor, sin impacto)

**US relacionada:** US-1106

---

### 2026-04-23 D-028 — Documentar bugfixes en carpeta dedicada (Session 7)

**Contexto:** US-1102 tuvo 5 bugs encadenados durante el debug. Se decidió crear un sistema de documentación de bugs para referencia futura.

**Decisión:** Carpeta `src/docs/sprints/sprint-10/bugfixes/` con un archivo por bug.

**Formato:** bug_id, fecha, US, causa raíz, solución, regla general, "si vuelve a aparecer".

**Razón:** Bugs de infraestructura (CORS, deploy, env vars) tienden a repetirse en nuevas sesiones o cuando se agregan nuevas Cloud Functions. Tener el diagnóstico documentado acelera el debug futuro.

---

### 2026-04-23 D-027 — Cascade Delete en Firestore requiere eliminar subcolecciones explícitamente (US-1102)

**Contexto:** El cascade delete eliminaba documentos raíz de `city_weather` pero las subcolecciones `forecasts` quedaban huérfanas y visibles en Firebase Console.

**Decisión:** Siempre eliminar subcolecciones ANTES del documento padre usando `collectionGroup()`:
1. `db.collectionGroup('forecasts').get()` → delete todos
2. `db.collection('city_weather').get()` → delete raíces

**Razón:** Firestore no hace cascade delete automático. Este es un comportamiento permanente de Firestore, no un bug puntual.

**US relacionada:** US-1102 (BUG-005)

---

### 2026-04-23 D-026 — Cloud Function auth: onRequest() + x-api-key en lugar de onCall() + Firebase Auth (US-1102)

**Contexto:** `clearFirestoreData` era `onCall()` que requería Firebase Anonymous Auth. Múltiples bugs impidieron que el token llegara correctamente.

**Decisión:** Cambiar a `onRequest()` HTTP endpoint con header `x-api-key: CLEANUP_SECRET`.

**Razón:**
1. onCall() requiere Firebase Auth funcional en cliente — frágil para herramientas de testing
2. onRequest() con secret compartido es suficientemente seguro para tool de dev interno
3. Elimina dependencia de signInAnonymously() que fallaba silenciosamente
4. Permite testear con curl directamente sin setup de Firebase client

**Variables:**
- Servidor: `process.env.CLEANUP_SECRET` (en `functions/.env`)
- Cliente: `import.meta.env.VITE_CRON_SECRET` (mismo valor en `.env.local`)

**Regla:** Nunca usar `VITE_*` en Cloud Functions — ese prefijo es exclusivo de Vite/frontend.

**US relacionada:** US-1102 (BUG-001, BUG-003)

---

### 2026-04-23 D-025 — BLOQUEADOR: 401 UNAUTHENTICATED en clearFirestoreData (US-1102 Debug Session 6)

**Contexto:** Cloud Function `clearFirestoreData` desplegada exitosamente, pero httpsCallable() retorna 401 UNAUTHENTICATED.

**Síntoma:**
```
Network Error: {"error":{"message":"User must be authenticated","status":"UNAUTHENTICATED"}}
```

**Raíz:**
1. Cloud Function requiere `context.auth` (línea `if (!context.auth)` en index.ts)
2. Agregué Anonymous Auth a `firebaseConfig.ts` (signInAnonymously en ensureInitialized)
3. **PERO:** El token anónimo no se está pasando a httpsCallable()

**Investigación Requerida:**
1. ¿Anonymous Auth está habilitada en Firebase Console? (Authentication → Sign-in method)
2. ¿signInAnonymously() está siendo ejecutado? (agregar console.log en firebaseConfig)
3. ¿getAuth().currentUser existe cuando se llama httpsCallable()? (debugear en cleanupService)
4. ¿ensureInitialized() se ejecuta ANTES de la primera llamada a clearFirestoreData?

**Opciones de Solución:**
- A: Debug Anonymous Auth + verificar Firebase Console settings
- B: Cambiar Cloud Function para aceptar VITE_FIREBASE_API_KEY en headers (menos seguro)
- C: Usar Custom Claims + Admin SDK en cliente (más complejo)

**Status:** ⏳ Espera investigación en próxima sesión

---

### 2026-04-23 D-024 — Toast Detallado con Counts en Cleanup (US-1102)

**Contexto:** US-1102 ampliada con cascade delete. Toast feedback debe informar exactamente qué se limpió.

**Decisión:** Toast muestra counts por layer en lugar de mensaje genérico
- **Antes:** "✅ Limpieza completada. Los datos han sido eliminados."
- **Ahora:** "✅ Eliminados: 42 docs (Firestore) + 156 items (IDB) + 18 keys (localStorage)"

**Razón:** El usuario necesita confirmar visualmente qué se limpió exactamente.

**Implementación:** 
- `executeCleanup()` retorna `CleanupResults` con counts por layer
- `handleConfirm()` en CleanupPanel construye toast dinámico a partir de los results

---

### 2026-04-23 D-023 — Retry Logic Hybrid (2 Automáticos + Manual) (US-1102)

**Contexto:** Cleanup puede fallar por transient network errors (timeouts, rate limits).

**Decisión:** Implementar retry hybrid (Opción D3)
- **Automático:** 2 intentos con backoff exponencial (1s, 2s)
- **Manual:** Si fallan los 2 automáticos, mostrar error + botón "Reintentar"
- **Sin infinito:** Prevenir UX blocking por retry loops infinitos

**Razón:**
1. Transient failures (network glitches) se resuelven en 1-2 intentos
2. Persistent failures (auth, invalid data) necesitan intervención manual
3. Exponential backoff reduce carga en servidor durante ataques/picos

**Implementación:**
```typescript
const executeWithRetry = async (maxRetries = 2) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await executeCleanup(options)
    } catch (error) {
      if (attempt === maxRetries - 1) throw error
      await sleep(1000 * (attempt + 1))  // 1s, 2s backoff
    }
  }
}
```

---

### 2026-04-23 D-022 — Cascade Delete desde city_weather (NO collectionGroup) (US-1102)

**Contexto:** Implementación de cascade delete para US-1102. ¿Query desde dónde?

**Decisión:** Eliminar desde `collection('city_weather')` (documento raíz), NO desde `collectionGroup('forecasts')`
- Firestore cascadea automáticamente a subcollections cuando se elimina el documento padre
- Más eficiente: 1 query a city_weather en lugar de enumerar todos los forecasts
- Más simple: no requiere batch chunking especial para subcollections

**Razón:** User feedback: "query está bien, quiero eliminar desde city_weather"

**Implementación:** Cloud Function usa `db.collection('city_weather').get()` para cascade delete

---

### 2026-04-23 D-021 — Mutual Exclusion Selectiva: Sección 1 ↔ Sección 3 (US-1102)

**Contexto:** US-1102 ampliada tiene 5 opciones en 3 secciones. ¿Cuáles son mutuamente excluyentes?

**Decisión:** Opción B — mutual exclusion selectiva
- **Sección 1 (Granular Firestore):** nullSnapshots + olderThan7d
- **Sección 2 (Reset Local):** allIndexedDb + allLocalStorage — SIEMPRE libre
- **Sección 3 (Cascade Firestore):** cascadeDeleteAll — excluyente con Sección 1

**Lógica:** Si selecciona algo de Sección 1 → deshabilita Sección 3 (y vice versa). Sección 2 es independiente.

**Razón:** El conflicto real es "¿limpio específicos O limpio TODO?" en Firestore. Reset local es independent.

**Implementación:**
```typescript
if (isSection1 && value) {
  setOptions({ ...options, [key]: true, cascadeDeleteAll: false })
} else if (isSection3 && value) {
  setOptions({ ...options, [key]: true, nullSnapshots: false, olderThan7d: false })
}
```

---

### 2026-04-23 D-020 — Batch Chunking 500 ops en Cloud Functions (US-1102)

**Contexto:** Firestore batch.delete() max = 500 operaciones. Código anterior fallaba si >500 docs.

**Decisión:** Implementar automatic chunking en Cloud Function
- Cada batch commita máximo 500 operaciones
- Si hay >500 docs, genera múltiples batches secuenciales
- Mantiene transaccionalidad: todo o nada por lote, pero múltiples lotes si necesario

**Razón:** Evitar `INVALID_ARGUMENT` de Firestore cuando cleanup afecta >500 docs.

**Implementación:**
```typescript
const executeBatchDelete = async (docs: any[]) => {
  let batch = db.batch()
  let count = 0
  for (const doc of docs) {
    batch.delete(doc.ref)
    if (++count >= 500) {
      await batch.commit()
      batch = db.batch()
      count = 0
    }
  }
  if (count > 0) await batch.commit()
  return docs.length
}
```

---

### 2026-04-21 D-019 — Lectura Optimizada de Climas: IndexedDB Primero (US-1104)

**Contexto:** US-1104 implementada. Refactorizar flujo de lectura de climas para mejorar latencia.

**Decisión:** Implementar lectura en 2 capas sin sync background si caché está fresco
- **CAPA 1:** IndexedDB lookup por `accuLocationKey` (40ms)
- **CAPA 2:** Firestore fallback si caché expirado (300-500ms)
- **Diferencia vs antes:** Sin sincronización background cuando caché está fresco

**Motivo:**
1. Latencia crítica: 40ms vs 370ms promedio (antes)
2. Offline-first: funciona con caché stale
3. Simplifica lógica: cache fresco = mostrar y FIN

**Implementación:**
- Nueva función `getWeatherFromFirestore(cityId)` en firebaseWeatherService.ts
- Refactor `loadCitiesFromCache()` en useWeather.ts con lógica 2 capas
- Usa `accuLocationKey` como clave (no city.id ni s2Key)

**Consecuencias:**
- -100ms latencia promedio si caché fresco
- Zero sync background si datos frescos
- Fallback a Firestore si expirado

**US relacionada:** US-1104

---

### 2026-04-21 D-020 — Delta Sync Incremental para Tabla Predictiva (US-1105)

**Contexto:** US-1105 implementada. Optimizar lectura de tabla de predicciones.

**Decisión:** Implementar delta sync en background, solo si hay nuevos docs

**Lógica:**
- **Mostrar:** caché local inmediato (40ms)
- **Verificar:** query delta `WHERE created_at > lastSyncTime`
- **Sincronizar:** solo si `newDocs.length > 0` (evitar queries innecesarias)
- **Mergear:** dedup por `city_id + date_hour`

**Motivo:**
1. Ahorro Firestore: -99% reads si sin cambios (~15,700 reads evitados)
2. Latencia: 500-800ms → 40ms (92% mejora)
3. No bloqueante: delta sync en background

**Implementación:**
- Metadata helpers en cacheService.ts: `getPredictionsCacheMetadata()`, `setPredictionsCacheMetadata()`, `isPredictionsCacheValid()`
- Refactor PredictionAnalysisDemo.tsx con 2 capas + delta sync async
- Reusa `getRecentForecasts(timeRange, since)` con param `since` para delta

**Consecuencias:**
- Cache hit: 40ms
- Cache miss: <1s (primera carga)
- Delta sync: <300ms (silencioso)
- Storage IndexedDB: ~60min TTL para tabla

**US relacionada:** US-1105

---

### 2026-04-21 D-018 — Herramientas Autónomas para Consultar Datos (No guardar docs sin snapshots)

**Contexto:** US-1008 validación. Se detectó que 80 documentos (53%) se guardan con todos los campos NULL.

**Problema:**
- `firebaseWeatherService.ts` línea 99-101: guarda incluso cuando `snapshots.length === 0`
- Estos son "cache-hit geoespacial" — cuando múltiples ciudades comparten locationKey
- Ocupan 53% del espacio en Firestore sin valor útil
- Contaminan BigQuery y fuerzan a filtrar en cada query

**Opciones consideradas:**
- A: Guardar con flag `is_cache_hit: true` y filtrar en queries
- B: NO guardar si `snapshots.length === 0` ← **ELEGIDA**
- C: Guardar pero marcar como "transient" (TTL 1h en lugar de 7d)

**Decisión:** Opción B — NO guardar documentos sin snapshots

**Motivo:**
1. Si no hay snapshots, no hay predicción válida — datos sin valor
2. Simplifica queries (sin necesidad de filtrar)
3. Reduce Firestore writes (~50% menos)
4. Reduce BigQuery storage
5. Mantiene coherencia: documentos = predicciones válidas

**Implementación (próximo):**
- Modificar `firebaseWeatherService.ts` línea 77-99
- Agregar early return: `if (snapshots.length === 0) return`
- Limpiar documentos viejos con: `npm run clean:firestore -- --only-null`

**Consecuencias:**
- No hay datos "fantasma" en Firestore
- Tablas y reportes solo muestran predicciones válidas
- Queries a BigQuery más rápidas (sin NULL filtering)

**US relacionada:** US-1008 (validación)

---

### 2026-04-20 D-017 — Arquitectura Delta Sync con IndexedDB (US-1008)

**Contexto:** Sprint 10. Optimización Firestore. Problema: Query 1 trae 100 docs, Query 2 con 10 nuevos vuelve a traer los 100 viejos.

**Problema:**
- getRecentForecasts('24h') sin filtro → 100 reads cada vez
- Pronósticos nuevos: ~100-200 docs/mes
- Siguiente consulta: re-descarga todos (ineficiente)

**Opciones consideradas:**
- A: Traer todo + deduplicar en cliente
  - Ventaja: Simple
  - Desventaja: Network O(n) siempre, ineficiente
- B: Delta sync inteligente ← **ELEGIDA**
  - Query: `where created_at > lastSyncTimestamp` en Firestore
  - IndexedDB con tabla `forecasts_index` (O(1) lookup)
  - TTL automático (7d+1h margin)
  - Ventaja: Network O(delta), O(1) deduplicación, sync incremental
  - Desventaja: +1 tabla IndexedDB, lógica merge más compleja (justificada)

**Decisión:** Opción B — Delta Sync

**Motivo:**
1. **Red eficiente:** Query delta reduce payload 90% (10 docs vs 100)
2. **Storage local:** IndexedDB índice = O(1) deduplicación vs O(n)
3. **TTL automático:** Similar a Firestore, eventual consistency OK
4. **Zero breaking changes:** Servicios existentes no se tocan

**Implementación (4 subtareas):**
- A: Agregar `since` param a getRecentForecasts()
- B: Expandir cacheService con forecasts_index
- C: syncFirestoreToCache() orquesta flujo completo
- D: Tests unitarios + integración + validación manual

**Decisiones sub-arquitectónicas:**
1. **Query field:** `created_at` (inmutable) vs `updated_at` → created_at
2. **IndexedDB:** tabla separada (permite índices) vs idb-keyval → tabla separada
3. **Timestamp lastSync:** localStorage vs IndexedDB → localStorage (lectura rápida)
4. **Sync trigger:** Automático en app load vs manual → Automático
5. **Conflictos:** TTL local respeta TTL Firestore + 1h margin → eventual consistency

**Consecuencias:**
- Firestore cost: reducido ~90% en consultas incrementales
- Latencia: <500ms sync (query ~200ms + IndexedDB ops ~100ms)
- Storage: <50MB IndexedDB (100 ciudades × 100 docs)
- Complexity: +~400 líneas de código (cacheService expandido + tests)

**US relacionada:** US-1008 (8 SP, 4 subtareas)

---

### 2026-04-19 D-016 — Guardar local_time_user en ForecastDoc (US-1007)

**Contexto:** US-1007. Tabla de predicciones necesitaba mostrar "¿A qué hora LOCAL del usuario se obtuvo el pronóstico?"

**Problema:** 
- getLocalMachineTime() calculaba en tiempo real → siempre mostraba hora actual
- Necesitábamos saber la hora EXACTA cuando se obtuvieron los datos

**Opciones consideradas:**
- A: Calcular dinámicamente en tabla (mostrar hora actual siempre) ← RECHAZADO
- B: Guardar hora local en Firestore cuando se obtienen datos ← **ELEGIDA**

**Decisión:** Opción B — Persistir local_time_user en ForecastDoc

**Motivo:**
1. Auditoría: saber exactamente cuándo (hora local) se obtuvo cada pronóstico
2. Análisis histórico: comparar patrones por hora del usuario
3. Consistencia: valor no cambia con el tiempo

**Implementación:**
- `ForecastDoc.local_time_user: string` (formato DD/MM HH:MM)
- `getLocalTimeUser()` calcula en cliente cuando se guarda
- `PredictionRow.localTimeUser` usa valor persistente
- Tabla muestra valor guardado + permite filtro/ordenamiento

**Consecuencias:**
- Documentos viejos necesitan cleanup (no tienen `local_time_user`)
- Primer uso requiere: `npm run clean:firestore -- --only-city`
- Nuevos documentos tendrán valor persistente

**US relacionada:** US-1007

---

### 2026-04-19 D-015 — ForecastDoc: Guardar calculated_condition por separado

**Contexto:** US-1007. PredictionAnalysisTable necesitaba comparar predicción vs realidad. Decisión: cómo guardar la predicción para facilitar validación manual.

**Problema:** 
- ForecastDoc.snapshots[] contiene 12 horas
- snapshots[0] es la predicción "actual" (mostrada al usuario)
- Necesitábamos acceso rápido a qué se predijo (sin buscar en array)

**Opciones consideradas:**
- A: Guardar solo snapshots[0] (perder histórico de 12h)
- B: Guardar todos los snapshots + extraer snapshots[0] al leer (lento)
- C: Guardar calculated_condition por separado + todos los snapshots ← **ELEGIDA**

**Decisión:** Opción C — Campo `calculated_condition` redundante pero optimizado

**Motivo:**
1. Acceso O(1) a la predicción mostrada
2. Mantiene 12 snapshots para lookback histórico
3. Simplifica comparación: calculated_condition === report.should_be
4. BigQuery puede indexar rápidamente por precisión

**Implementación:**
- ForecastDoc: `calculated_condition: string` (de snapshots[0].classified)
- PredictionAnalysisTable: muestra 1 fila por ForecastDoc (no por snapshot)
- Lookback: busca snapshots anteriores para misma hora

**Consecuencias:**
- +1 campo en ForecastDoc (negligible storage)
- Tabla ahora muestra 2 filas/día en lugar de 24 (antes era 12 por snapshot)
- Validación manual más clara (calculated vs actual)

**US relacionada:** US-1007

---

---

### 2026-04-13 D-009 — Eliminación de tabs obsoletos en TestingTools (-120 KB bundle)

**Contexto:** US-902. TestingTools tenía 3 tabs que se volvieron obsoletos con Firebase Report + Metabase.

**Opciones consideradas:**
- A: Mantener tabs para backwards compatibility / debugging
- B: Eliminar tabs obsoletos y reducir bundle size
- C: Mover tabs a herramienta externa separada

**Decisión:** Opción B — Eliminar completamente

**Motivo:** 
1. Firebase Report reemplaza HistoryGrid (validación en Firestore)
2. Metabase Dashboard reemplaza PrecisionMetrics (análisis superior)
3. Firebase Console reemplaza CachePanel (debugging remoto)
4. Reducción de bundle: -120 KB (-8%)
5. Cero impacto en funcionalidad crítica (useWeather.ts mantiene funciones)

**Implementación:**
- Eliminados 8 archivos (5 componentes + 3 utilidades)
- Refactorizados 4 archivos (TestingTools, weatherHistoryService, Header, App)
- ~3,000 líneas de código muerto removido
- Build compila sin errores

**Consecuencias:** 
- TestingTools solo tiene tab "Reportes"
- Análisis de precisión migra a Dashboard Metabase (US-902-B)
- API weatherHistoryService simplificada (mantiene funciones críticas)

**US relacionada:** US-902

---

### 2026-04-08 D-005 — Eliminación de guardado duplicado en Firestore (-50% writes)

**Contexto:** US-801. Se detectó que `useWeather.ts` y `batchWeatherService.ts` guardaban el mismo forecast en Firestore, duplicando writes innecesariamente.

**Opciones consideradas:**
- A: Mantener ambos puntos de guardado con deduplicación por timestamp
- B: Centralizar guardado solo en `batchWeatherService.ts` y remover de `useWeather.ts`

**Decisión:** Opción B

**Motivo:** Centralizar en el batch service es más limpio y predecible. El hook no debe tener responsabilidad de persistencia, solo de estado UI. Resultado: 50% reducción de writes.

**Consecuencias:** `useWeather.ts` no guarda en Firestore. Toda persistencia pasa por `batchWeatherService.ts`.

**US relacionada:** US-801

---

### 2026-04-08 D-004 — Catálogo estático en Firestore con fallback hardcodeado

**Contexto:** US-802. El catálogo de condiciones climáticas (7 estados, mappings a tipos Pokémon, reglas WINDY) se necesitaba en un lugar centralizado y actualizable sin deploy.

**Opciones consideradas:**
- A: Mantener catálogo solo en código (constants.ts)
- B: Mover catálogo a Firestore con fallback hardcodeado si offline
- C: Mover catálogo a Firestore sin fallback

**Decisión:** Opción B

**Motivo:** Firestore permite actualizar el catálogo sin redeploy. El fallback garantiza que la app funcione offline o si Firestore tiene problemas. Singleton cache evita reads excesivos.

**Consecuencias:** `weatherCatalogService.ts` es el único punto de verdad para el catálogo. El catálogo hardcodeado en código es solo fallback de emergencia.

**US relacionada:** US-802

---

### 2026-04-08 D-003 — Schema Firestore: snapshots cada 12h con TTL 7 días

**Contexto:** US-801. Definición del schema de persistencia de pronósticos.

**Opciones consideradas:**
- A: Un documento por ciudad con array de forecasts
- B: Subcolección: `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`
- C: Colección plana con city_id como campo

**Decisión:** Opción B (subcolección)

**Motivo:** Subcolecciones permiten queries eficientes por ciudad sin cargar todos los datos. El ID `YYYY-MM-DD-HH` garantiza idempotencia y facilita TTL por documento.

**Consecuencias:** Queries siempre filtran por `city_id` primero. TTL se implementa como campo `expires_at: Timestamp` (US-806 lo limpiará con auto-delete).

**US relacionada:** US-801, US-806

---

### 2026-04-08 D-002 — Firebase como backend de persistencia (v2.0.0-alpha)

**Contexto:** Inicio Sprint 8. La v1.0.0 usa solo IndexedDB + AccuWeather. Se evalúa agregar persistencia cloud para analytics y dashboard de precisión.

**Opciones consideradas:**
- A: Supabase (PostgreSQL)
- B: Firebase/Firestore
- C: Backend propio (Node + DB)

**Decisión:** Opción B — Firebase/Firestore

**Motivo:** Integración directa desde React sin backend propio. SDK bien soportado con Vite. Free tier suficiente para el volumen del proyecto (~2,256 writes/día = 11.3% quota). Real-time listeners útiles para dashboard.

**Consecuencias:** Dependencia de Firebase SDK. Credenciales en `.env.local` (nunca commitear). v1.0.0-stable en `main` no se toca — todo en rama `refactor/firebase-v2`.

**US relacionada:** US-804

---

### Sprint 7 D-001 — Bottom Sheet con Portal para escapar overflow:hidden del mapa

**Contexto:** US-706. El Bottom Sheet en mobile quedaba oculto por el `overflow:hidden` de `#root` necesario para Leaflet.

**Opciones consideradas:**
- A: Cambiar overflow de #root (rompería el mapa)
- B: Renderizar Bottom Sheet via React Portal fuera de #root
- C: Usar position:fixed con z-index muy alto sin portal

**Decisión:** Opción B — React Portal

**Motivo:** Portal escapa la jerarquía del DOM sin afectar el overflow del mapa. Z-index 1001 garantiza visibilidad sobre Leaflet (z-index 1000). Solución limpia sin efectos secundarios.

**Consecuencias:** El Bottom Sheet se renderiza en `document.body`. Z-index hierarchy: Leaflet=1000, BottomSheet=1001. Ver regla crítica en CLAUDE.md sobre z-index.

**US relacionada:** US-706

---

### 2026-04-12 D-007 — Plan Blaze obligatorio para TTL Policies en Firestore (US-806)

**Contexto:** US-806. Se necesitaba implementar auto-delete de documentos > 7 días usando TTL de Firestore.

**Hallazgo:** Spark (free tier) no permite crear TTL Policies. Solo Blaze (pago por uso) lo permite.

**Opciones consideradas:**
- A: No usar TTL, documentos se quedan indefinidamente
- B: TTL manual en código con Cloud Functions (requiere Blaze igual)
- C: Activar Blaze y usar TTL nativo de Firestore

**Decisión:** Opción C — Blaze + TTL Firestore

**Motivo:** TTL nativo es más eficiente que código custom. Blaze en free tier mantiene costo en $0 si uso se mantiene bajo (estamos en 11.3% de quota). TTL automático es "set and forget".

**Impacto financiero:** $0 adicionales (free tier Blaze incluye 1M reads, 1M writes, 100GB storage). Nuestro uso: ~68K writes/mes = bien dentro del límite.

**Consecuencias:** Facturación habilitada pero sin cargo. TTL Policy activa en Firestore. Documentos con `ttl <= now()` se eliminan automáticamente (eventual, hasta 24h de demora).

**US relacionada:** US-806

---

### 2026-04-11 D-006 — Omitir campos undefined en ClassificationReport para evitar Firestore error

**Contexto:** US-805. Al guardar reporte de clasificación, Firestore rechazaba campos con valor `undefined`.

**Problema:** Intentaba guardar `raw_condition_code: (city as any).conditionCode` → undefined. Firestore no permite `undefined` en documentos.

**Opciones consideradas:**
- A: Asignar valores por defecto (0, "", null)
- B: Omitir campos que no existen en City interface
- C: Cambiar la interface ClassificationReport para hacerlos opcionales

**Decisión:** Opción B — Omitir campos

**Motivo:** `City` interface no tiene `conditionCode`, `conditionText`, `precipitationMm`. No tiene sentido agregar valores ficticios. Mejor removerlos de la estructura.

**Consecuencias:** ClassificationReport solo guarda campos que realmente existen en City: `temperature_c` (tempC), `wind_kmh` (windKmh). Interface actualizada para reflejar campos reales.

**US relacionada:** US-805

---

### 2026-04-13 D-008 — Lazy Singleton + Dynamic Imports para Firebase SDK (US-901)

**Contexto:** US-901. Firebase SDK agregaba 890 KB al bundle principal (15% de 1.7 MB). Se necesitaba optimización sin perder funcionalidad.

**Opciones consideradas:**
- A: Code-splitting per-service (3 dynamic imports separados)
- B: Lazy Singleton in firebaseConfig (1 entry point) ← **ELEGIDA**
- C: Component-level lazy load (máxima laziness)

**Decisión:** Opción B — Lazy Singleton Pattern

**Motivo:** 
1. Un único punto de entrada (`getDb()`) evita race conditions
2. Firebase se carga en primer acceso, no al módulo load
3. Interfaz de exports mantiene compatibilidad
4. Vite/Rollup auto-optimiza sin cambios de config

**Implementación:**
- `firebaseConfig.ts`: `ensureInitialized()` + `getDb()` helpers
- Todos los servicios: `await getDb()` antes de usar db
- Dynamic imports de funciones Firestore dentro de cada función async
- Tipos importados estáticamente (no afectan bundle)

**Resultado:** 
- Bundle: 1,771 KB → 1,501 KB (15% reducción)
- Gzip: 489 KB → 411 KB (16% reducción)
- Zero regressions (validado con Playwright)
- Firebase lazy-loads en primer uso (esperado)

**Consecuencias:** Funciones Firebase ahora son async. Callers deben `await`. No afecta a `batchWeatherService` (ya era async-friendly).

**US relacionada:** US-901

---

### 2026-04-19 D-014 — Timestamp Forecast: Redondear a siguiente hora completa

**Contexto:** US-1007 validación de datos. Usuario reportó que los timestamps guardados eran la "siguiente hora", no la hora de consulta.

**Problema:** 
- App consulta AccuWeather a las 9:34 PM → guardaba timestamp como "21:00"
- Pero AccuWeather pronósticos son PARA la siguiente hora (10:00 PM, 11:00 PM, ..., 10:00 AM)
- Mismatch: documento "21:00" contiene pronósticos que son para "22:00-09:00"

**Decisión:** Redondear timestamp a siguiente hora completa ANTES de guardar

**Motivo:** Los pronósticos de AccuWeather son inherentemente para "las próximas 12 horas" desde una hora puntual. Para coherencia:
- Consulta 9:34 PM → guardar como 2026-04-19-22 (siguiente hora)
- Snapshots: [22:00, 23:00, 00:00, ..., 09:00] ahora tienen sentido

**Implementación:** `firebaseWeatherService.ts` línea 81-86
```typescript
const nextHour = new Date(now)
nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
const dateHour = formatDateHour(nextHour)
```

**Validación pendiente:** Después de 1 ciclo de datos con fix, ejecutar `npm run validate:forecast-schema` para confirmar estructura.

**US relacionada:** US-1007, commit 93bf4b2

---

### 2026-04-18 D-013 — PredictionAnalysisTable: Adopción TanStack Table v8 (US-1007 v3)

**Contexto:** La tabla custom de US-1007 tenía bug de paginación (botones [1,1,1,2,3]) y carecía de features críticas: filtrado por columna, búsqueda global, page size configurable, navegación primera/última página.

**Problema con tabla custom:**
- Bug paginación: `Math.max(1, safePage - 2 + i)` → generaba páginas duplicadas en inicio
- Ordenamiento solo dentro de la página actual (no del dataset completo)
- Sin filtros por columna ni búsqueda global
- Paginación fija en 20 filas sin opción de cambio
- Sin botones primera / última página

**Opciones evaluadas:**

| Librería | Bundle | Headless | React 19 | Features | Veredicto |
|----------|--------|----------|----------|----------|-----------|
| TanStack Table v8 | ~15KB | ✅ | ✅ | Todas | ✅ ELEGIDA |
| AG Grid Community | ~300KB | ❌ | Parcial | Todas | ❌ Bundle regresión |
| Material React Table | +300KB | ❌ | ❌ | Todas | ❌ Trae MUI |
| react-data-grid | ~37KB | Parcial | ✅ | Sin paginación | ❌ Incompleta |

**Decisión:** TanStack Table v8 (`@tanstack/react-table@8.21.3`)

**Motivo:**
1. **Headless:** cero estilos propios → 100% compatible con el design system del proyecto (CSS vars, prefijo `.pat-`)
2. **Bundle minimal:** ~15KB vs Sprint 9 que ya optimizó el bundle (-15%). No regresar.
3. **React 19 compatible:** verificado con Vite 8 build sin warnings
4. **Features completas con una sola librería:** `getFilteredRowModel` (global + columna), `getSortedRowModel`, `getPaginationRowModel`
5. **TypeScript first:** tipos perfectos, sin casteos

**Implementación:**
- `src/components/Analytics/PredictionAnalysisTable.tsx` — reescrito con `useReactTable`
- Columnas definidas con `createColumnHelper<PredictionRow>()`
- `filterFn` custom en columnas con condiciones climáticas (busca por label legible, no por clave interna)
- `sortingFn` custom en columna `correct` (null < false < true)
- Lookback expandible preservado intacto via `columnHelper.display`
- CSS mantenido en `<style>` tag (regla del proyecto)

**Resultado:**
- Build: ✅ 979ms, sin errores TS
- Features: búsqueda global, filtros por columna, sort completo, pageSize 10/20/50/100, `««` primera y `»»` última
- Export CSV/JSON ahora exporta filas **filtradas** (mejora UX)

**Consecuencias:**
- `@tanstack/react-table` en `dependencies` (runtime, no devDep)
- Tabla custom eliminada (~380 líneas) → nueva implementación (~350 líneas)
- Mismo API público: `<PredictionAnalysisTable rows={...} title="..." />`

**US relacionada:** US-1007 v3

---

### 2026-04-18 D-012 — PredictionAnalysisTable: Restructure con condiciones climáticas (US-1007 Revisión)

**Contexto:** Revisión de observaciones de tabla. Clarificación crítica: `prediction` y `actual` son **condiciones climáticas**, no tipos Pokémon.

**Decisiones tomadas:**

1. **Campos son condiciones climáticas:** `prediction` y `actual` = "sunny", "rain", "cloudy", etc. (no tipos Pokémon)
   - Mapeo: condición → icono + label desde `WEATHER_IMAGES`, `CONDITION_LABEL`, `CONDITION_COLORS`
   - Impacto: Cambio en `PredictionRow` interface (strings climáticos)

2. **Confianza removida de tabla (por ahora):**
   - Razón: Confianza significativa es por acumulación (88/100 en Auckland), no por row individual
   - Confianza acumulada: future dashboard
   - Actual: Quitar columna "Confianza" de tabla
   - Documentación: Agregar nota en US-1007 para future work

3. **Lookback 3-filas con solo verde en aciertos:**
   - Fila 1: Hora (HH:MM UTC)
   - Fila 2: Cuánto hace (-Xh)
   - Fila 3: Icono clima + label + ✓ (solo si wouldBeCorrect=true)
   - Color: Verde solo si acierto, gris/sin cambio si fallo

4. **Ordenamiento por página (20 filas cliente-side):**
   - Alcance: Sort de la página actual (20 filas), no tabla completa
   - Evento: Click en header columna → alterna asc ↔ desc
   - Performance: O(20 log 20) ≈ 86 ops, negligible
   - Columnas ordenables: Hora, Ciudad, Predicción, Real, Resultado
   - No ordenable: Lookback (siempre igual)

5. **Validación Firestore (gcloud):**
   - R1: Usar `bq query` para verificar estructura real en BigQuery
   - Si estructura ≠ esperada: Proponer cambio de esquema
   - Punto crítico: ¿`classified_condition` es confiable como "condición climática"?

**Motivo:**
- Condiciones climáticas son la fuente real de datos (AccuWeather)
- Tipos Pokémon son derivados (mapping posterior)
- Tabla es para debugging/análisis de predicción de clima, no de tipos

**Consecuencias:**
- Interface `PredictionRow`: `prediction: string` (condición) + `actual: string | null` (condición o "Sin datos")
- `LookbackItem`: `condition: string` (condición climática), no `pokemonType`
- Columna "Confianza" desaparece (será reintroducida en dashboard agregado)
- Renderizado: Requiere helpers `WEATHER_IMAGES[condition]`, `CONDITION_LABEL[condition]`, `CONDITION_COLORS[condition]`

**US relacionada:** US-1007

---

### 2026-04-18 D-011 — PredictionAnalysisTable: Debugging vs. BI Tools (US-1007)

**Contexto:** Sprint 10. Dashboard Looker Studio MVP en progreso. Necesidad paralela: análisis táctico de predicciones fallidas con "lookback 12h".

**Opción A:** Agregar a Looker Studio (mismo BI tool)
- Ventaja: Consistencia visual
- Desventaja: Lookback complejo en Looker, UX mejor en React

**Opción B:** Componente React custom (elegida ← **ELEGIDA**)
- Ventaja: Lookup expandible, UX óptima, sin nuevas librerías
- Desventaja: Separate from BI dashboards, pero cumple propósito diferente

**Decisión:** Opción B — Componente React

**Motivo:**
1. Propósito diferente: Looker = estratégico (métricas), React = táctico (debugging)
2. UX lookback inline mejor que Looker
3. Sin nuevas deps (solo React built-in)
4. Datos ya en BigQuery (snapshots_flat)
5. Mock HTML referencia facilita implementación rápida

**Implementación:**
- `src/components/Analytics/PredictionAnalysisTable.tsx` (360 líneas, self-contained)
- Tipos Pokémon: uso de vars CSS existentes (--type-X)
- Paginación nativa (20/page)
- Export CSV + Copy JSON
- Filas expandibles con lookback panel

**Consecuencias:**
- Dos dashboards en App: Looker (BI) + React (debugging)
- Lookback es feature única, no competidor a Looker
- Próximo: Integración en TestingTools o ruta `/analytics`

**US relacionada:** US-1007

---

### 2026-04-21 D-021 — Sincronización Servidor-side a HH:15 con Firestore Real-time (US-1101)

**Contexto:** US-1101. App necesita sincronizar clima 24 veces/día. Hoy: cliente ejecuta timer (~N×24 API calls). Nuevo: servidor ejecuta una sola vez.

**Decisión:** Firebase Scheduled Function a HH:15 UTC + Firestore `onSnapshot` listener en cliente

**Lógica:**
1. **Servidor (HH:15):** Firebase Scheduled Function dispara automáticamente
   - Carga 5 ciudades en paralelo (~500ms)
   - Llamadas a AccuWeather API (key en servidor, nunca cliente)
   - Guarda en Firestore vía `saveCityForecast()`

2. **Cliente:** `useFirestoreSync` hook con `onSnapshot` listener
   - Escucha cambios en colección `/city_weather`
   - Cuando servidor escribe, cliente recibe push automáticamente (~100ms)
   - React state se actualiza → UI re-renderiza

3. **Doble trigger:** Scheduled (automático) + HTTP (manual testing)
   - Scheduled: `15 * * * *` (HH:15 UTC diario)
   - HTTP: endpoint para TestingTools y testing manual

**Motivo:**
1. **Escalabilidad O(1):** 24 calls FIJOS, sin importar N usuarios (antes O(N))
2. **Confiabilidad:** 24/7 independiente (no depende de cliente abierto)
3. **Latencia mejorada:** onSnapshot ~100ms vs timer 5-10s
4. **Costo:** Quota AccuWeather: 120/día vs 15,000/mes (24% uso)
5. **Seguridad:** API key en servidor, nunca en cliente

**Implementación:**
- `functions/src/syncWeatherLogic.ts` — lógica compartida
- `functions/src/index.ts` — 2 triggers (scheduled + HTTP)
- `src/hooks/useFirestoreSync.ts` — listener real-time
- Remover: `scheduleNextRefresh()`, `doRefresh()` del cliente
- Remover: `VITE_ACCUWEATHER_KEY` del cliente

**Consecuencias:**
- Firebase Functions: 720 invocaciones/mes (0.036% free tier)
- Firestore: +1 conexión WebSocket por usuario (real-time)
- Testing: Botón en TestingTools dispara sync manual
- Delta Sync (D-017): No se ve afectado, sigue funcionando

**Alternativas rechazadas:**
- Vercel Cron: Timeout 5s en Hobby (frágil con 5+ ciudades)
- Cloud Scheduler manual: Redundante con Firebase Scheduled
- Timer client-side: Escalabilidad O(N), no 24/7

**US relacionada:** US-1101 (6-7 SP)

---

### 2026-04-21 D-022 — Opciones RESET Total en Modal Limpieza (US-1102)

**Contexto:** US-1102 implementación. Modal cleanup necesita permitir reset radical de datos locales para validación.

**Decisión:** Agregar 2 opciones nuevas de RESET TOTAL (además de las 2 granulares de D-018 + TTL)

**Opciones Modal (4 total):**
1. Documentos sin snapshots (D-018)
2. Documentos > 7 días (TTL)
3. **TODO IndexedDB** — reset completo (nueva)
4. **TODO localStorage** — reset completo (nueva)

**Motivo:**
1. **Validación:** Cuando se cambien datos/algoritmos, necesitas baseline limpio
2. **Debugging:** Estado corrupto → opción nuclear de reset total
3. **Testing:** Validar el flujo de sincronización desde cero sin caché stale
4. **Separación clara:** Opciones 3+4 marcadas como "RESET" (visual distinct)

**Implementación:**
- UI: 4 checkboxes, separador visual entre granulares y RESET
- IndexedDB: `cleanupAllIndexedDb()` elimina TODAS las tablas (not just forecasts)
- localStorage: `cleanupAllLocalStorage()` elimina todos los keys pwe-*
- Firestore: No afectado (solo dropea Firestore reads)

**Consecuencias:**
- Usuario puede nuclear completamente el caché local
- Próxima carga: Firestore es source of truth (sin fallback IndexedDB)
- Performance: Primera carga toma ~500-1000ms (sin caché)
- Seguridad: No hay risk (todo se puede resinc desde Firestore)

**US relacionada:** US-1102

---

### 2026-06-12 D-040 — CF clasifica y persiste `pgo_condition`, frontend es read-only (REF-001)

**Contexto:** D-039 definia que la CF guardaba raw y el frontend clasificaba. Con BL-012
(2026-05-11) se extrajo `resolveCondition` a modulo compartido y la CF empezo a persistir
`pgo_condition` en cada snapshot. Sin embargo el frontend nunca se limpio, generando dos
fuentes de docs en Firestore con schemas distintos (root cause de BUG-026).

**Decision:** La CF es la unica fuente de escritura en Firestore. El frontend es read-only.

**Schema actual de `snapshots[]` (post REF-001):**
```
hour: number
icon_code: number           // WeatherIcon AccuWeather (1-44)
icon_phrase: string         // Texto crudo ("Mostly Sunny")
temp_c: number
wind_kmh: number
gust_kmh: number
humidity: number
has_precipitation: boolean
pgo_condition: string       // calculado por CF via resolveCondition (modulo compartido)
```

**Clasificacion:** `getWeatherFromFirestore()` lee `pgo_condition` directamente. No recalcula.

**Motivo:**
1. Un solo lugar de escritura = schema consistente en todos los entornos
2. CF controla timing (HH:00 UTC) y atomicidad (batch con summary doc)
3. Windy override se calcula en CF con los mismos datos (wind_kmh + gust_kmh)
4. Frontend escribiendo en paralelo sobreescribia docs CF con schema inferior (BUG-026)

**Implementacion:**
- `firebaseWeatherService.ts`: `saveCityForecast` eliminada, `ForecastSnapshot`/`ForecastDoc` saneados
- `batchWeatherService.ts`: ya no llama a `saveCityForecast`
- `weatherService.ts`: `createForecastSnapshots` eliminada
- `lookbackService.ts`, `predictionAnalyticsService.ts`, `PrecisionMetrics.tsx`: fallbacks eliminados
- Tests: `tests/unit/services/schemaLegacy.test.ts` (14 tests)
- Documento completo: `src/docs/sprints/sprint-11/refactoring/ref-001-limpieza-schema-legacy.md`

**Supersede:** D-039 (abajo) — queda como referencia historica

---

### 2026-05-03 D-039 — CF guarda raw, frontend clasifica (US-1113) — SUPERSEDIDO por D-040

**Contexto:** La Cloud Function `syncWeatherLogic.ts` tenia su propio algoritmo de clasificacion (`mapAccuWeatherCondition` via texto libre de `IconPhrase`) duplicando la logica de `weatherService.ts:resolveCondition()` (que usa numeros `WeatherIcon` + Windy override). Resultado: preview/prod mostraba climas distintos a localhost.

**Problema:**
- `mapAccuWeatherCondition("Mostly Sunny")` texto libre, inconsistente
- `resolveCondition(2, windKmh, gustKmh)` usa 44 iconos exactos + Windy override
- Sin `gust_kmh` en schema CF → Windy nunca se activaba en prod
- `calculated_condition` en Firestore era incorrecto por el algoritmo inferior

**Decision:** Cloud Function guarda datos raw. Frontend es el unico que clasifica.

**Schema nuevo en Firestore (snapshots[]):**
```
icon_code: number         // WeatherIcon AccuWeather (1-44)
icon_phrase: string       // Texto crudo ("Mostly Sunny")
temp_c: number
wind_kmh: number
gust_kmh: number          // NUEVO: necesario para Windy override
humidity: number
has_precipitation: boolean
```

**Clasificacion:**
- `getWeatherFromFirestore()` llama `resolveCondition(icon_code, wind_kmh, gust_kmh)` al leer
- Mismo resultado en dev y prod (mismo algoritmo, mismos datos)

**Motivo:**
1. Un solo lugar para logica de clasificacion (`weatherService.ts`)
2. Sin drift entre entornos
3. Windy override funciona en prod
4. Cambiar algoritmo = un solo archivo

**Implementacion:**
- `functions/src/syncWeatherLogic.ts`: eliminado `mapAccuWeatherCondition()`, `calculateCondition()`; nuevo schema raw
- `firebaseWeatherService.ts:getWeatherFromFirestore()`: clasifica con `resolveCondition()`
- `useFirestoreSync.ts`: documentado bug del listener (escucha raiz, no subcoleccion)
- Documento completo: `src/docs/architecture/12-data-flow-architecture.md`

**Pendiente:**
- Deploy CF con nuevo schema
- Implementar real-time update (summary doc en raiz de city_weather)
- Eliminar `VITE_ACCUWEATHER_KEY` de Vercel

**US relacionada:** US-1113

<!-- Agrega nuevas decisiones aquí, más recientes primero -->

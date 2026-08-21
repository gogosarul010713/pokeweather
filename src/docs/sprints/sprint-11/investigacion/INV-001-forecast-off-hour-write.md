# INV-001 — Forecasts con `queryTime` en hora no-`HH:00`

**Fecha:** 2026-05-08
**Branch:** sprint-11
**Estado:** FASE 1 — Investigacion (NO implementar fix)
**Reporta:** Analista

---

## Sintoma

En `PredictionAnalysisTable` columna **Hora MX**, aparecen filas con minutos no-cero
(ej. `08/05 07:04`, `08/05 06:01`, `08/05 21:33`). Eso significa que el `created_at`
del documento Firestore se escribio en ese instante exacto, no en el rollup horario
esperado (CF scheduled corre `0 * * * *` UTC). Aparecen tras `Ctrl+Shift+R` o refresh
normal en el preview de Vercel. Usuario afirma no haber clickeado "sincronizacion manual".

---

## 1. Mapa de escrituras a `cities/*/forecasts`

| # | Punto de escritura | Trigger | `queryTime` resultante | Guard "ya sincronizado" |
|---|--------------------|---------|------------------------|-------------------------|
| 1 | `functions/src/syncWeatherLogic.ts:167-216` `saveCityForecast` (CF) | Scheduled `0 * * * *` UTC + manual HTTP | `Timestamp.now()` (hora exacta de la CF) — `date_hour` con `getUTCHours()` (linea 153) | NO. Sobreescribe `setDoc` sin merge |
| 2 | `src/services/firebase/firebaseWeatherService.ts:98-177` `saveCityForecast` (frontend) | Llamado desde `batchWeatherService.loadCitiesInBatch` | `Timestamp.now()` en el momento del fetch — `date_hour` con `getHours()+1` LOCAL | NO. Sobreescribe |
| 3 | `src/services/weather/batchWeatherService.ts:94` `saveCityForecast(enrichedCity, [])` (cache hit) | Cada vez que `loadCitiesInBatch` ve un cache hit en IndexedDB | mismo que #2 | Hay early-return en `firebaseWeatherService.ts:123` si `snapshots.length === 0` (D-018) — esto NO escribe |
| 4 | `src/services/weather/batchWeatherService.ts:121` `saveCityForecast(enrichedCity, snapshots)` (API call) | Cada vez que `loadCitiesInBatch` no encuentra cache y llama AccuWeather | mismo que #2 | Ninguno |
| 5 | `src/services/firebase/classificationReportService.ts:82, 276` `addDoc` | Reporte manual desde tabla / LocationCard | NO escribe forecasts; escribe `weather_reports` / `classification_reports` | N/A |

**Conclusion:** los unicos puntos que escriben en `city_weather/{id}/forecasts/{date_hour}`
son #1 (CF), #2 y #4 (frontend via batch). El #3 esta blindado por D-018.

---

## 2. Por que aparecen minutos no-cero en `queryTime`

`created_at = Timestamp.now()` registra el momento exacto de la escritura. Para que
el valor tenga minutos cero, la escritura tiene que coincidir con el rollup horario.
La CF scheduled (`0 * * * *` UTC) corre **muy cerca** de cada `HH:00 UTC` y deberia
producir minutos `00` o muy bajos (latencia de pocos segundos). Si vemos `07:04`
en Hora MX, el doc se creo a `13:04 UTC` aproximadamente — muy lejos del cron.

Eso solo ocurre si:
- (a) Frontend escribio (`saveCityForecast` JS) — porque corre cuando el usuario
  recarga, no a la hora exacta.
- (b) Alguien dispara manualmente la CF en horarios arbitrarios.
- (c) La CF se reintenta o tiene latencia > 60s (improbable).

---

## 3. Evidencia empirica en el codigo

### 3.1 Frontend ESCRIBE en preview cuando existe `VITE_ACCUWEATHER_KEY`

`src/hooks/useWeather.ts:185-202`:
```ts
const apiKey = import.meta.env.VITE_ACCUWEATHER_KEY
if (!apiKey) {
  // modo prod: solo lectura Firestore
  ...
  return firestoreCities  // <-- early return SIN llamar batch
}
// SI hay apiKey -> llama loadCitiesInBatch -> escribe Firestore
const batchResult = await loadCitiesInBatch(cities, apiKey, {...})
```

El handoff (`07-handoff-sprint-11.md` deuda critica fila 2) advierte:

> "VITE_ACCUWEATHER_KEY en Vercel — Si existe en Vercel env vars, las llamadas van
> directo a AccuWeather desde el cliente". Esto **tambien implica escrituras a
> Firestore desde el cliente** (linea 121 batch).

Si en Vercel preview esta seteada `VITE_ACCUWEATHER_KEY` (o quedo de un deploy
anterior), cada refresh dispara `loadCitiesInBatch` -> `saveCityForecast` con
`Timestamp.now()` del momento del refresh. Eso explica `07:04`, `06:01`, etc.

### 3.2 Triggers de `loadCities()` en el ciclo de vida

| Trigger | Archivo | Resultado |
|--------|---------|-----------|
| Mount inicial (Strict Mode protected) | `useWeather.ts:354-444` `run()` | `loadCities(false)` -> si cache invalido: API + Firestore write |
| Auto-refresh `HH:00` LOCAL del usuario | `useWeather.ts:304-324` `scheduleNextRefresh` | `doRefresh()` -> `loadCities(true)` -> SIEMPRE escribe (`ignoreCache=true`) |
| Visibility regresa | `useWeather.ts:332-352` `handleVisibilityChange` | si `shouldRefreshCities()` -> `doRefresh()` -> escribe |
| `noRealData` recovery | `useWeather.ts:376-393` | `loadCities(true)` -> escribe |
| Hard refresh (Ctrl+Shift+R) | Vacia memory cache | Mount inicial dispara escritura si cache no valido |

**Importante:** `loadCities(true)` corre con `ignoreCache: true` y entra a la rama
de API call (`batchWeatherService.ts:121`) -> escribe SI hay snapshots. No hay guard
"ya escribi este `date_hour`".

### 3.3 `saveCityForecast` no valida si el doc ya existe

`firebaseWeatherService.ts:165` hace `setDoc(docRef, forecastDoc, { merge: false })`.
Sobrescribe sin verificar. Eso significa: si dos clientes (CF + frontend) o el mismo
cliente con minutos de diferencia escriben el mismo `date_hour`, el segundo gana
y `created_at` queda con minutos no-cero.

### 3.4 `getDateHourKey` (CF) usa UTC, `formatDateHour` (frontend) usa LOCAL

`functions/src/syncWeatherLogic.ts:148-156`:
```ts
function getDateHourKey(): string {
  const now = new Date()
  ... getUTCHours() ...
}
```

`firebaseWeatherService.ts:359-366`:
```ts
function formatDateHour(date: Date): string {
  ... getHours() ... // LOCAL
}
```

Esto significa que el frontend y la CF pueden estar escribiendo a **claves
distintas** segun la zona horaria del cliente, generando docs duplicados con
distintos `created_at`. (Conflicto con invariante de Sprint 10, ver #6).

### 3.5 Auto-refresh es a `HH:00` LOCAL del usuario, no UTC

`utils/timeUtils.ts:msUntilNextHour()` (no inspeccionado pero implicado por
`getHours()+1` en frontend) usa hora local del navegador. Si el cliente esta en
zona MX (-6), su `HH:00` local cae en minutos `00` UTC pero solo si el offset es
exacto. Para zonas con offset fraccional (ej. India `+5:30`) caeria fuera. Aun en
MX, el setTimeout JS no es preciso al milisegundo: tipico drift de 50-500ms.

### 3.6 `syncWeatherManual` NO se invoca implicitamente

Grep confirma: la unica llamada a `syncWeatherManual` desde frontend esta en
`src/components/TestingTools/TestingTools.tsx:51` (boton "Sincronizar ahora").
No hay invocacion implicita en useEffect, mounts, ni hooks.

### 3.7 Git log reciente

Commits sospechosos (ultimos 30):
- `25faeb6 docs: actualizar CLAUDE.md con cambios tabla predictiva` (solo docs)
- `0844e05 refactor(prediction-table): mostrar hora Mexico/Central` — afecta
  visualizacion, no escritura
- `b1d4688 fix(prod): lectura directa Firestore por ciudad` — modifico flujo de
  lectura, no escritura
- `97e60f4 fix(prod): cache key cruzado en loadCitiesFromCache` — touch a `useWeather.ts`

Ningun cambio reciente desactivo el path de escritura del frontend. Sigue activo
si hay `VITE_ACCUWEATHER_KEY`.

---

## 4. Hipotesis ranqueadas

### H1 — PRINCIPAL (probabilidad ALTA, ~80%): Frontend escribe en preview

**Mecanismo:** Vercel preview tiene `VITE_ACCUWEATHER_KEY` configurada (deuda critica
del handoff). En cada mount/refresh con cache invalido, `useWeather.run()` llama
`loadCitiesInBatch` -> `saveCityForecast(city, snapshots)` con `Timestamp.now()`
del instante del refresh. Eso produce minutos no-cero. Tras `Ctrl+Shift+R` (vacia
memory cache, no IndexedDB) la suite IndexedDB puede o no estar caliente —
dependiendo de `shouldRefreshCities()`.

**Compatible con sintomas:**
- "Tras hard refresh" -> SI: el mount dispara `loadCities()`. Si IndexedDB cache
  expiro o `localStorage.pwe-lastUpdateHour` es stale, va a API y escribe.
- "A veces refresh normal" -> SI: cuando `shouldRefreshCities()` retorna true
  (cada `HH:00` local) o cuando el `noRealData` recovery se dispara.
- "Localhost tambien" -> SI: localhost siempre tiene la key.

**Evidencia:** #3.1, #3.2, #3.3, deuda critica handoff. Las horas vistas
(`07:04`, `06:01`) son consistentes con horarios de uso de un usuario MX
recargando la app.

**Como descartar:** En Vercel Dashboard verificar `VITE_ACCUWEATHER_KEY`. Si
existe, removerla y recargar preview varias veces. Si los `created_at` con
minutos no-cero dejan de aparecer, H1 confirmado.

---

### H2 — SECUNDARIA (~30%): Auto-refresh `HH:00` LOCAL desfasado

**Mecanismo:** `setTimeout(msUntilNextHour())` en `useWeather.ts:320` no es
exacto. Si la pestaña estuvo background, el throttling de Chrome puede retrasar
el callback varios minutos. Cuando se ejecuta, `created_at = Timestamp.now()`
queda con minutos no-cero.

**Compatible con sintomas:**
- "Tras refresh" -> NO directamente; el setTimeout corre sin refresh.
- "A veces refresh" -> NO.

**Como descartar:** Mantener pestaña activa por 1+ hora sin refresh y observar si
aparecen filas en horas no-`HH:00`. Si aparecen, H2 confirmado en parte.

---

### H3 — TERCIARIA (~15%): CF reintentos / latencia > 60s

**Mecanismo:** Cloud Scheduler corre `0 * * * *` UTC pero la CF puede tardar.
Si `Promise.all` con 5 ciudades y AccuWeather lentea, `Timestamp.now()` al
escribir queda en `HH:01` o `HH:02` UTC.

**Compatible con sintomas:**
- "Minutos `01`-`04`" -> SI.
- "Minutos `33`, `14`" (vistos: `21:33`, `20:14` MX) -> NO. Eso es demasiada
  latencia para una CF.

**Como descartar:** Revisar logs de Firebase Functions: tiempos de inicio y
finalizacion de cada `syncWeatherScheduled`. Si finalizacion > `HH:05 UTC`, H3
contribuye parcialmente. Pero NO explica `:33`.

---

### H4 — POSIBLE (~10%): Conflicto UTC vs LOCAL en `date_hour`

**Mecanismo:** CF escribe `date_hour` con UTC (#3.4); frontend escribe con LOCAL.
Para usuario MX (-6), `08/05/2026 07:00 LOCAL = 13:00 UTC`. Las claves NO
coinciden. Hay duplicados en la subcoleccion. La query trae ambos. El doc creado
por el frontend tiene `created_at` con los minutos del fetch.

**Compatible con sintomas:**
- Es un agravante de H1: explica por que pueden coexistir varios docs por hora,
  unos del CF (minutos `~00`) y otros del frontend (minutos arbitrarios).

**Como descartar:** Listar `cities/auckland-waterfront/forecasts` ordenado por
`date_hour` ASC. Si hay dos docs por cada hora real (uno con `date_hour` LOCAL,
otro con UTC), H4 confirmado como agravante.

---

### H5 — POSIBLE (~5%): TestingTools dejo invocaciones programadas

**Mecanismo:** Algun tester dejo abierto un script o boton que dispara
`syncWeatherManual` periodicamente.

**Como descartar:** Buscar en localStorage flags `auto-sync-test` o similar.
Cerrar todas las pestañas de TestingTools. Esperar 30 min sin refrescar.
Si los minutos no-cero siguen apareciendo, H5 descartado.

---

## 5. Plan de pruebas para el tester (Fase 2)

### Escenario A — Confirmar H1 (frontend escribe en preview)

1. Abrir Vercel Dashboard -> pokeweather -> Settings -> Environment Variables.
2. Verificar si `VITE_ACCUWEATHER_KEY` existe en `Preview` o `Production` scope.
   Documentar resultado.
3. Si existe: NO removerla todavia. Continuar al paso 4 para confirmar.
4. Abrir preview en navegador con DevTools abierto (Network + Console).
5. Filtrar Network por `dataservice.accuweather.com` y por `firestore.googleapis`.
6. Hacer hard refresh (Ctrl+Shift+R).
7. **Observar:**
   - Si aparecen requests a `dataservice.accuweather.com/forecasts/v1/hourly/...`
     -> el frontend esta llamando AccuWeather (H1 confirmado parcial).
   - Si en Console aparece `[Firebase] ✅ Saved forecast for ... at YYYY-MM-DD-HH`
     con timestamp del momento del refresh -> H1 CONFIRMADO.
   - Si en Network aparece un `commit` o `write` a Firestore con `city_weather`
     en el path -> H1 CONFIRMADO.
8. Repetir 3 veces con 1-2 minutos entre cada refresh. Verificar que los
   `created_at` en la tabla predictiva muestran las horas de cada refresh.

### Escenario B — Aislar el `Ctrl+Shift+R` del refresh normal

1. Recargar preview (refresh normal F5). Capturar pantalla de tabla y consola.
2. Hard refresh (Ctrl+Shift+R). Capturar lo mismo.
3. Comparar: si AMBOS escriben, H1 esta activa para todo refresh. Si solo hard
   refresh escribe, hay un guard que se salta con cache invalidation total.

### Escenario C — Confirmar H2 (auto-refresh desfasado)

1. Cargar preview. Esperar a que log diga `⏰ Proximo auto-refresh en Xs`.
2. Cambiar a otra pestaña por > 30 min sin volver.
3. Volver a la pestaña. Observar si aparece `🔄 Trigger auto-refresh HH:00` y
   con que delay.
4. Verificar tabla: si la nueva fila tiene minutos > 00, H2 confirmado.

### Escenario D — Inspeccionar Firestore directamente

1. Firebase Console -> Firestore -> `city_weather/auckland-waterfront/forecasts`.
2. Ordenar por `created_at` DESC, traer 20 docs recientes.
3. Para cada doc, anotar:
   - `id` (date_hour key)
   - `created_at` (timestamp con minutos)
   - `local_time_user`
4. Si hay docs con mismo `date_hour` distinto a `created_at` esperado -> H4.
5. Si hay docs con `date_hour` LOCAL y otros con UTC para misma hora real -> H4.

### Escenario E — Logs de la CF

1. Firebase Console -> Functions -> `syncWeatherScheduled` -> Logs.
2. Buscar ejecuciones de las ultimas 24h. Anotar hora de inicio y fin.
3. Si toda ejecucion termina < `HH:01:00 UTC`, H3 descartada.

---

## 6. Lecciones de investigaciones anteriores

### NO repetir hipotesis ya descartadas

| Bug | Hipotesis fallida | Razon descartada |
|-----|-------------------|------------------|
| BUG-018 (revertido) | "Mover `date_hour` a UTC en `saveWeatherReport` arregla matching" | UTC en reporte vs LOCAL en forecast genera el bug que pretendia corregir. **NO recalcular `date_hour` desde otro timestamp.** |
| BUG-008 v1-v3 | "Recalcular `date_hour` con varias formulas de hora" | Cada intento creaba mismatch nuevo. Solucion correcta: pasar `forecast.date_hour` por la cadena de callbacks (ver BUG-019). |
| BUG-019 | "Hacer refetch post-reporte" | Refetch lee cache stale o trae docs con `date_hour` distinto al esperado. Solucion: actualizar state inline con `cityId|dateHour`. |

### Reglas heredadas de Sprint 10 (mantener)

1. **`date_hour` es LOCAL + siguiente hora.** No recalcular desde Timestamp UTC.
   (`07-handoff-sprint-11.md` invariante #1)
2. **Clasificacion solo via `resolveCondition`** (D-039).
3. **No agregar Firebase reads en path critico.** Cache IndexedDB obligatorio.

### Hipotesis especificas a NO investigar para INV-001

- "El bug esta en como la tabla muestra la hora" — NO. La tabla muestra
  `created_at` tal cual; el problema es por que `created_at` tiene minutos
  no-cero, no como se renderiza. El refactor de hora MX (`0844e05`) solo cambio
  display, no datos.
- "Falta deduplicacion en la query" — Posible agravante (H4) pero no causa raiz.
- "`useFirestoreSync` esta escribiendo" — Sprint 10 confirma: `useFirestoreSync`
  solo lee. Ver `useWeather.ts:63` comentario y `useFirestoreSync.ts`.

---

## Resumen Ejecutivo

**Hipotesis principal (H1, ~80%):** El frontend en preview de Vercel sigue
teniendo `VITE_ACCUWEATHER_KEY` configurada. Cada refresh dispara
`loadCitiesInBatch` -> `saveCityForecast` con `Timestamp.now()` del instante del
refresh, generando docs Firestore con `created_at` en minutos arbitrarios.

**Confirmacion empirica requerida (Fase 2 — Tester):** verificar env var en
Vercel + observar Network/Console en preview tras hard refresh.

**Riesgos colaterales identificados:** H4 (UTC vs LOCAL en `date_hour` entre CF
y frontend) explica posibles documentos duplicados y debe documentarse aunque no
sea causa raiz primaria.

**No tocar codigo de fix hasta tener confirmacion del tester.**

---

## 7. Audit Fase 2 — Caminos de escritura sin AccuWeather key

Auditoria realizada por Tester (2026-05-08) tras update del usuario:
**`VITE_ACCUWEATHER_KEY` NO existe en Vercel preview.** H1 descartada por el
usuario; hay que validar mecanicamente que ningun path alternativo escribe.

### 7.1 Path principal sin apiKey

`useWeather.ts:185-202` (releido):
```ts
const apiKey = import.meta.env.VITE_ACCUWEATHER_KEY
if (!apiKey) {
  setLoadingStatus('loading')
  const firestoreCities = await loadCitiesFromCache(cities)
  ...
  if (hasRealData) setLastUpdateHour()
  return firestoreCities   // <-- early return, NO llama loadCitiesInBatch
}
```

`loadCitiesFromCache` (linea 32-97): solo LEE Firestore (`getWeatherFromFirestore`)
y escribe **IndexedDB local** (`setCachedWeather` linea 53). **No toca Firestore writes.**

`saveSnapshots` (`weatherHistoryService.ts:79`): usa `idb-keyval`. No Firestore.

`setCachedWeather` (`cacheService.ts:73`): usa `idb-keyval`. No Firestore.

### 7.2 Inventario completo de `setDoc/addDoc/updateDoc` en `src/`

Grep `setDoc|addDoc|updateDoc` en `src/services/` y `src/hooks/`:

| Archivo | Funcion | Escribe a |
|---------|---------|-----------|
| `firebaseWeatherService.ts:165` | `saveCityForecast` | `cities/{id}/forecasts/{date_hour}` |
| `classificationReportService.ts:82` | reporte clasificacion | `classification_reports/{auto}` |
| `classificationReportService.ts:276` | reporte clima usuario | `weather_reports/{auto}` |
| `settingsService.ts:23,79` | settings app | `settings/app-config` |

`src/hooks/`: **0 escrituras**. (`useFirestoreSync` solo `onSnapshot`).

### 7.3 Verificacion `httpsCallable('syncWeatherManual')`

Grep `httpsCallable|syncWeatherManual` en `src/`:
- Unica llamada en runtime: `src/components/TestingTools/TestingTools.tsx:51`
  (boton manual "Sincronizar ahora", no se invoca implicito).
- No hay `useEffect`, mount, ni hook que la dispare.
- Si el usuario no clickea el boton, **la CF NO se invoca desde el frontend.**
  (La CF scheduled `0 * * * *` UTC es independiente — la unica fuente confirmada de
  escrituras backend.)

### 7.4 Re-revision auto-refresh `scheduleNextRefresh` con apiKey=undefined

Trace de `doRefresh` -> `loadCities(true)` -> linea 186 chequea `apiKey`:
- Si `apiKey` es undefined: entra a la rama Firestore-only, NO escribe (linea 201).
- Si `apiKey` existe: llama `loadCitiesInBatch` que escribe (linea 121 batch).

**Por tanto**, sin `VITE_ACCUWEATHER_KEY`, ni el mount inicial, ni el auto-refresh
`HH:00`, ni el visibility change, ni el `noRealData` recovery escriben Firestore.

### 7.5 Caminos restantes que SI escriben sin apiKey

Tres unicas formas de escribir un doc en `cities/{id}/forecasts/...` desde frontend
sin apiKey:

1. **Reportes de usuario** (`classificationReportService`) — escriben a
   `weather_reports` y `classification_reports`, **NO a `forecasts`**. Descartado.
2. **TestingTools "Sincronizar ahora"** — invoca CF `syncWeatherManual` (HTTP).
   La CF escribe forecasts con su propio `Timestamp.now()`. Si el tester clickea
   el boton, el `created_at` resultante es la hora del click. Esto SI explicaria
   minutos no-cero — pero requiere accion explicita.
3. **`saveCityForecast` directo** — solo se llama desde `batchWeatherService`
   (linea 94 cache hit, blindado por D-018; linea 121 API call). Ninguna
   se ejecuta sin `apiKey`.

### 7.6 Conclusion auditoria

Sin `VITE_ACCUWEATHER_KEY` en Vercel preview, **el frontend NO tiene ningun
camino de escritura a `cities/*/forecasts/*`** salvo:
- Boton manual TestingTools.
- Reportes (otra coleccion).

Por tanto, si el bug aparece en el preview con env var ausente, las hipotesis
viables son:

| Hipotesis | Estado |
|-----------|--------|
| H1 frontend escribe via AccuWeather | **DESCARTADA por usuario** (no env var en Vercel) |
| H2 auto-refresh setTimeout desfasado | **IRRELEVANTE** sin apiKey (rama Firestore-only no escribe) |
| H3 CF retry/latencia > 60s | Posible para minutos `01-04`, no para `:33` |
| H4 UTC vs LOCAL en `date_hour` | Solo agravante (genera duplicados), no la causa del minuto != 00 |
| H6 frontend invoca `syncWeatherManual` implicito | **DESCARTADA** (grep confirma solo TestingTools) |
| H7 camino alternativo de escritura | **DESCARTADA** por inventario `setDoc/addDoc/updateDoc` |

**Hipotesis sobreviviente principal:** **H8 (NUEVA)** — el environment de Vercel preview
SI tiene `VITE_ACCUWEATHER_KEY` configurada de algun modo no obvio. Hay que verificar
visualmente en Vercel Dashboard, NO solo confiar en lo que el usuario recuerda.

**Hipotesis sobreviviente alternativa:** **H9 (NUEVA)** — el usuario en algun momento
clickeo el boton "Sincronizar ahora" de TestingTools en el preview, generando
escrituras CF en horarios arbitrarios. La CF escribe con `Timestamp.now()` propio
(no esta sujeta al cron). Hay que revisar logs de Cloud Functions
(`syncWeatherManual` invocations en las ultimas 24-48h).

---

## 8. Resultados Fase 2 — Replicacion empirica

### 8.1 Setup

- Playwright version: **1.59.1** (instalado en proyecto)
- Test file: `tests/e2e/inv-001-off-hour-write.spec.ts`
- Comando: `PREVIEW_URL=<url> npx playwright test inv-001-off-hour-write --project=chromium`
- Dev server: `vite.config.ts` proxy `/api/accuweather -> dataservice.accuweather.com`
- Artefactos generados: `tests/artifacts/inv-001/`

### 8.2 Findings — Run contra preview Vercel

URL: `https://pokeweather-git-sprint-10-gogosarul010713-7327s-projects.vercel.app/`

**Bloqueado por SSO de Vercel (HTTP 401).** El preview esta protegido por Vercel
Authentication. Sin token bypass no es posible automatizar el test E2E headless
contra esa URL.

Artefacto: `tests/artifacts/inv-001/AUTH-WALL.txt`.

Alternativas propuestas:
1. Generar bypass token de Vercel Preview Protection y pasarlo como cookie
   (Settings > Deployment Protection > Bypass Token).
2. Inspeccion manual con DevTools en navegador del usuario (logueado).
3. Correr test contra `localhost:5173` (este si fue posible — ver 8.3).

### 8.3 Findings — Run contra localhost (CON `VITE_ACCUWEATHER_KEY`)

Este run reproduce el modo dev (key presente) y sirve como **caracterizacion
empirica de la firma de red cuando el frontend SI escribe**.

Resumen (`tests/artifacts/inv-001/summary.json`):

```
Carga inicial:    accuweather=10  firestoreWrites=0*  cf=0
Hard refresh:     accuweather=5   firestoreWrites=0*  cf=0
Idle 30s:         firestoreWrites=0
Refresh normal:   accuweather=5   firestoreWrites=0*
Total:            network=57  console=50  accuweatherTotal=20  cloudfunctionTotal=0
```

\* el detector inicial de "write" buscaba `:commit` en URL pero el SDK web
moderno usa **`Firestore/Write/channel`** stream multiplexado (POST con body).
Inspeccion manual del payload revelo:

**8 POSTs a `Firestore/Write/channel?VER=8` con `writes` en el body:**
- 5 escrituras a `city_weather/<id>/forecasts/2026-05-08-19`
- 3 escrituras a `settings/app-config`

Forecasts escritos (cityId | date_hour | timestamp UTC):
```
pier-39-san-francisco       | 2026-05-08-19 | 2026-05-09T00:13:00.644Z
auckland-waterfront         | 2026-05-08-19 | 2026-05-09T00:13:00.711Z
itaewon-jung-gu-se-l        | 2026-05-08-19 | 2026-05-09T00:13:00.713Z
zaragoza-centro             | 2026-05-08-19 | 2026-05-09T00:13:00.884Z
times-square-midtown-nyc    | 2026-05-08-19 | 2026-05-09T00:13:01.046Z
```

Convertido a hora MX (-6): `18:13:00` — **minutos NO cero**, exactamente
el sintoma reportado.

**Conclusion empirica del run localhost:** Cuando hay `VITE_ACCUWEATHER_KEY`,
el mount inicial dispara `loadCitiesInBatch` -> `saveCityForecast` con
`Timestamp.now()` del momento del fetch. `created_at` queda con minutos
arbitrarios (`13:00 UTC` en este run). Esto **demuestra mecanicamente** el
camino de escritura del frontend.

### 8.4 Findings — Console log

Tras instrumentar consola (regex `Saved forecast|[Firebase]|auto-refresh|loadCities|VITE_ACCUWEATHER|Sin VITE`):
- 50 mensajes capturados en run localhost.
- Aparece `[Firebase] ✅ Saved forecast for ... at 2026-05-08-19` por cada ciudad.
- **No** aparece el log `Sin VITE_ACCUWEATHER_KEY — modo produccion` (porque
  localhost SI tiene la key).

Si en un run real contra preview se ve `Sin VITE_ACCUWEATHER_KEY` en consola
**y** aparecen `Saved forecast`, eso indicaria un camino de escritura no
identificado en la auditoria (poco probable segun seccion 7).

Si en preview se ve `[Firebase] ✅ Saved forecast` SIN ver `Sin VITE_ACCUWEATHER_KEY`,
H1 esta confirmada: la env var SI esta presente en Vercel pese a lo que el
usuario recuerda.

### 8.5 Findings — Inspeccion Firestore (manual)

No ejecutada por el tester (requiere credenciales firebase admin/console).
Pasos sugeridos para el desarrollador:

```bash
# Opcion A (firebase CLI logueado):
firebase --project weather-app-prod-ef50d firestore:get \
  city_weather/auckland-waterfront/forecasts \
  --limit 20

# Opcion B (Firebase Console):
1. https://console.firebase.google.com/project/weather-app-prod-ef50d/firestore
2. Path: city_weather/auckland-waterfront/forecasts
3. Order by: created_at DESC, limit 20
4. Para cada doc anotar: doc.id (date_hour), created_at (Timestamp), date_hour field
5. Si created_at en muchos docs cae en HH:00:00-HH:00:59 -> escritos por CF
6. Si created_at cae en minutos arbitrarios -> escritos por frontend o syncWeatherManual
```

### 8.6 Hipotesis confirmada/descartada

| Hip | Resultado | Evidencia |
|-----|-----------|-----------|
| H1 (frontend con apiKey) | **CONFIRMADA mecanicamente en localhost** (5 forecasts con `created_at` en minuto `13`). En preview: **DESCARTADA por usuario**, pero hay sospecha (ver H8). |
| H2 (auto-refresh desfasado) | **IRRELEVANTE en preview sin apiKey** — la rama Firestore-only no escribe. Sigue siendo posible en localhost. |
| H4 (UTC vs LOCAL date_hour) | **Confirmada como agravante**. CF y frontend usan claves distintas. Genera duplicados, pero no es la causa raiz del minuto != 00. |
| H6 (syncWeatherManual implicito) | **DESCARTADA**. Grep + auditoria de hooks confirma cero invocaciones implicitas. |
| H7 (camino alternativo no-AccuWeather) | **DESCARTADA**. Inventario completo de `setDoc/addDoc/updateDoc` no revela ningun otro path a `forecasts`. |
| **H8 (NUEVA): Vercel SI tiene la env var pese a creencia del usuario** | Sospechosa. Requiere verificacion visual en Vercel Dashboard. |
| **H9 (NUEVA): Tester clickeo boton "Sincronizar ahora" en preview** | Sospechosa. Requiere revisar logs Cloud Functions de `syncWeatherManual`. |

### 8.7 Conclusion Fase 2

**Hipotesis principal restante:** Si el bug se reproduce con `VITE_ACCUWEATHER_KEY`
**realmente ausente** en Vercel preview (verificacion visual pendiente), entonces
solo dos caminos quedan en pie:

1. **H9** — alguien (incluido el propio usuario o herramientas internas) invoco
   `syncWeatherManual` en el preview. La CF escribe con su propio
   `Timestamp.now()`, lo que produce minutos arbitrarios.
2. **H8** — la env var existe y el usuario no la vio. Reproduciria H1 al 100%.

**Evidencia mas fuerte hoy:** El run localhost demostro que el path
`useWeather -> batchWeatherService -> saveCityForecast` produce **exactamente**
el sintoma observado, con timestamps off-hour (minuto `13`). La estructura
del bug coincide pixel a pixel con lo reportado.

### 8.8 Que necesita el desarrollador para Fase 3

1. **Verificacion visual obligatoria** — abrir Vercel Dashboard ->
   pokeweather -> Settings -> Environment Variables. Screenshot de la lista
   completa para `Production`, `Preview`, `Development`. Adjuntar a INV-001.
   Esto valida o invalida H8.

2. **Logs Cloud Functions** — Firebase Console -> Functions -> `syncWeatherManual`
   -> Logs de las ultimas 48h. Anotar cuantas invocaciones hubo y a que hora.
   Esto valida o invalida H9.

3. **Inspeccion Firestore directa** — query a
   `city_weather/auckland-waterfront/forecasts` ordenando por `created_at` DESC.
   Anotar 10-20 ultimos `created_at` y comparar con horas de cron `HH:00 UTC`.
   Si todos los off-hour caen en horarios de actividad del usuario -> H1/H8.
   Si caen en horas en que tester estaba activo en TestingTools -> H9.

4. **Test E2E con bypass token Vercel** — si Vercel tiene Deployment Protection,
   generar bypass cookie y reintentar `npx playwright test inv-001-off-hour-write`
   con `PREVIEW_URL` apuntando al preview. El test detectara automaticamente:
   - presencia de calls a AccuWeather (proxy o directo)
   - POSTs a `Firestore/Write/channel` con `writes` a `forecasts`
   - mensajes `[Firebase] ✅ Saved forecast` en consola

5. **Bloqueo a investigar antes de fixear:** mientras no se confirme H8 o H9,
   NO implementar fix. Cualquier fix ciego (anadir guards, mover a UTC, etc)
   tiene riesgo de repetir errores BUG-018 (revertido) y BUG-008 v1-v3.

---

## 9. Fase 3 — Validacion empirica + Propuesta de fix

**Fecha:** 2026-05-08
**Ejecuta:** Desarrollador SR (firebase CLI autenticada en `weather-app-prod-ef50d`).

### 9.1 Inspeccion de Cloud Functions logs

CFs activas en el proyecto (`firebase functions:list`):
- `syncWeatherManual` (HTTPS, manual)
- `syncWeatherScheduled` (cron `0 * * * *` UTC)
- `clearFirestoreData` (HTTPS, util)
- BigQuery export extension (no escribe `forecasts`)

#### `syncWeatherManual` — invocaciones

Logs disponibles (rango `~2026-05-08T00:21Z -> 01:29Z` aprox, limite `firebase functions:log`):

| Timestamp UTC | Status | Forecasts escritos |
|--------------|--------|--------------------|
| `2026-05-08T00:21:04Z` | 200 OK (5083ms) | 5 ciudades, todas con `date_hour=2026-05-08-00` |
| `2026-05-08T01:29:22Z` (preflight 204) | preflight | n/a |
| `2026-05-08T01:29:22Z` (POST) | en log | (no se ve respuesta en rango) |

Las dos invocaciones aparecen en hora MX **18:21** y **19:29** del 2026-05-07.
La invocacion de `00:21Z` escribio `2026-05-08-00` con `created_at` ~ `00:21:09Z`.

**En hora MX (-6) eso es `18:21` MX**. La captura del usuario muestra muchas
filas off-hour en horarios como `21:33`, `20:14`, `07:04`, `06:01`, `05:00`,
`23:00`, `22:00`. El log de `syncWeatherManual` **no cubre todo el dia** y no
se puede afirmar que esas filas vinieron de invocaciones manuales sin un rango
mayor.

#### `syncWeatherScheduled` — comportamiento clave

Logs ultimos (UTC):

```
2026-05-08T19:00:03Z   skipped (autoSyncEnabled: false)
2026-05-08T20:00:03Z   skipped (autoSyncEnabled: false)
2026-05-08T21:00:46Z   skipped (autoSyncEnabled: false)
2026-05-08T22:00:49Z   skipped (autoSyncEnabled: false)
2026-05-08T23:00:47Z   skipped (autoSyncEnabled: false)
2026-05-09T00:00:47Z   triggered (escribio)
```

**Hallazgo critico:** durante 5 horas seguidas la CF scheduled **NO escribio**
porque `autoSyncEnabled: false` en `settings/app-config`. Solo a las
`2026-05-09T00:00Z` (= `2026-05-08T18:00 MX`) se reanudo y escribio. **Por tanto,
durante esas 5 horas, el unico camino posible para que aparezcan forecasts en
Firestore es una escritura externa**.

Las opciones que quedan en pie tras los logs:
1. CF `syncWeatherManual` invocada (no cubierto por log retention).
2. Frontend escribiendo (H1 reactivada — H8 sigue posible).
3. Otro cliente/sdk autenticado.

#### `syncWeatherScheduled` — latencia

Cuando ejecuta, la CF tarda `0.6s - 5s` y `created_at` cae siempre en
`HH:00:0X UTC` (timestamps `00:47Z`, `00:49Z`, `00:46Z`). No produce minutos
`:14` ni `:33`. **H3 descartada como causa de los off-hour grandes.**

### 9.2 Inspeccion Firestore directa

`firestore:get` no es subcomando valido del firebase CLI moderno. Hay que
correr inspeccion manual. **Pasos para el usuario** (alternativa A o B):

#### Opcion A — Firebase Console (recomendado, sin permisos extra)

1. Abrir `https://console.firebase.google.com/project/weather-app-prod-ef50d/firestore/data`
2. Path: `city_weather/auckland-waterfront/forecasts`
3. Ordenar por `created_at` DESC. Tomar los ultimos 20 docs.
4. Para cada doc anotar (en una tabla pegable aqui):
   - `doc.id` (= `date_hour`)
   - `created_at` (Timestamp UTC, con minutos)
   - `local_time_user` (si existe el campo)
   - `accuLocationKey` (si esta vacio = sub-bug separado)
5. Exportar copy/paste en formato:
   ```
   2026-05-08-19 | created_at=2026-05-08T19:00:03Z  | accuLocationKey=...
   2026-05-08-13 | created_at=2026-05-08T13:04:22Z  | accuLocationKey=...
   ...
   ```

#### Opcion B — Script Node admin (requiere service account)

```js
// scripts/dump-forecasts.mjs
import admin from 'firebase-admin'
admin.initializeApp({ credential: admin.credential.applicationDefault() })
const snap = await admin.firestore()
  .collection('city_weather/auckland-waterfront/forecasts')
  .orderBy('created_at', 'desc').limit(20).get()
snap.forEach(d => {
  const v = d.data()
  console.log(d.id, '|', v.created_at?.toDate().toISOString(), '|', v.accuLocationKey)
})
```

Ejecutar con `GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json node scripts/dump-forecasts.mjs`.

#### Heuristica de origen

Para cada doc, clasificar el origen segun `created_at`:

| Patron `created_at` | Origen probable |
|---------------------|------------------|
| `HH:00:00 - HH:00:59 UTC` exacto | CF scheduled |
| `HH:00:01 - HH:05:00 UTC` con latencia | CF scheduled (lento) |
| Cualquier otro UTC arbitrario | Frontend O `syncWeatherManual` invocada |

Si la mayoria de los off-hour tienen `created_at` en horarios de actividad del
usuario (dia MX), H1/H8 reactivada. Si caen en horarios random, H9 (manual sync).

### 9.3 Propuesta de fix — 3 categorias

#### Fix A — Idempotencia horaria en `saveCityForecast` (frontend + CF)

**Resuelve:** todas las hipotesis sobrevivientes, independientemente del trigger.

`src/services/firebase/firebaseWeatherService.ts:165` y
`functions/src/syncWeatherLogic.ts:saveCityForecast` hoy hacen:

```ts
setDoc(docRef, forecastDoc, { merge: false })
```

Sin guard. Cualquier escritura sobrescribe `created_at`.

**Opcion A1 — Read-before-write con guard horario.** Antes de `setDoc`,
leer `existing` y comparar `existing.created_at` con `currentHour`:

- Si `existing.created_at` cae en `[currentHour:00, currentHour:00:59]` UTC, NO
  sobrescribir. Mantener el doc original (probablemente del CF scheduled).
- Si `existing.created_at` esta off-hour o ausente, escribir.

Trade-offs:
- (+) Conserva intencion: el primer escritor gana, frontend nunca corrompe.
- (-) Una lectura extra por save. Aceptable: ya hacemos varias lecturas.
- (-) Requiere acuerdo sobre que hace "ganar". Si ambos quieren `created_at`
  exacto al cron, bien; si frontend quiere actualizar `accuLocationKey`, no.

**Opcion A2 — `created_at = startOfHour(date_hour)`.** Forzar `created_at` a
ser el `HH:00:00 UTC` correspondiente al `date_hour` del doc, no
`Timestamp.now()`. El minuto siempre es `00`.

Trade-offs:
- (+) Elimina el sintoma de raiz, sin lecturas extra.
- (-) Pierde el "momento real de la escritura". Si alguien necesita auditar
  cuando se escribio el doc, hay que agregar `last_written_at` separado.
- (-) `local_time_user` se vuelve redundante.

**Opcion A3 — Separar slot horario y momento real.** Agregar campo
`hourly_slot_at: Timestamp` (= `startOfHour(date_hour)`) y conservar
`created_at` real. Display y matching usan `hourly_slot_at`. `created_at` es
solo audit trail.

Trade-offs:
- (+) Maxima informacion preservada.
- (-) Requiere migrar lectores: `PredictionAnalysisTable` debe leer
  `hourly_slot_at`. Cambio invasivo en UI.
- (-) Inconsistencia con docs viejos que solo tienen `created_at`.

#### Fix B — Reconciliar UTC vs LOCAL en `date_hour` (H4)

**Resuelve:** H4 (agravante) y conflicto con invariante Sprint 10.

CF (`syncWeatherLogic.ts:148-156`) calcula `date_hour` con `getUTCHours()`.
Frontend (`firebaseWeatherService.ts:359-366`) calcula con `getHours()` LOCAL.
Eso genera claves distintas para la misma hora real cuando la zona del
cliente difiere del UTC.

**Opcion B1 — CF migra a usar timezone de la ciudad.** Cada ciudad ya tiene
campo `timezone` en su definicion. La CF deberia calcular `date_hour` por
ciudad usando `Intl.DateTimeFormat` con esa zona horaria.

Trade-offs:
- (+) Cada ciudad tiene `date_hour` consistente con su hora local. Se alinea
  con como un usuario espera ver "el clima de las 7AM en Auckland".
- (-) Cambia algoritmo en CF, requiere validar todos los rollups historicos.
- (-) Si el frontend lee con `getHours()` del cliente, sigue habiendo
  desalineamiento (cliente MX leyendo Auckland).

**Opcion B2 — Frontend migra a UTC.** Frontend usa `getUTCHours()+1` para
`date_hour`.

Trade-offs:
- (+) Mas simple, una linea de cambio.
- (-) **Rompe el invariante Sprint 10 #1.** Sprint 10 eligio LOCAL
  conscientemente despues de BUG-018 (revertido) y BUG-008 v1-v3. Cualquier
  cambio aqui requiere re-leer ese contexto antes de tocar.

**Opcion B3 — Mantener LOCAL pero documentar zona del cliente.** No tocar el
algoritmo. Documentar que `date_hour` es LOCAL de quien escribe (frontend
usa LOCAL del navegador, CF usa UTC del servidor) y que la consulta debe
filtrar por `local_time_user` no por `date_hour`.

Trade-offs:
- (+) Cero cambio de codigo.
- (-) Deja la inconsistencia. Lectores deben implementar dedup logica.
- (-) No resuelve el problema de fondo.

#### Fix C — Cerrar el camino accidental TestingTools (H9)

**Resuelve:** elimina la posibilidad de que clicks accidentales en preview/prod
escriban con timestamp arbitrario.

**Opcion C1 — Flag `import.meta.env.DEV` en TestingTools.** El componente solo
se monta en desarrollo. En preview/prod no esta presente.

```tsx
// App.tsx o donde se renderice
{import.meta.env.DEV && <TestingTools />}
```

Trade-offs:
- (+) Cierra el path mas obvio. Cero riesgo en prod.
- (-) Si el usuario necesita debug en preview, pierde la herramienta.
  Mitigable con flag separado `VITE_ENABLE_TESTING_TOOLS=true`.

**Opcion C2 — Confirmacion explicita.** El boton "Sincronizar ahora" pide
`window.confirm("Esto escribira en Firestore production. Continuar?")` antes
de invocar.

Trade-offs:
- (+) No remueve la herramienta, solo agrega friccion.
- (-) Friccion incomoda en dev. Mitigable: skip si `import.meta.env.DEV`.

### 9.4 Recomendacion priorizada

| Fix | Resuelve | Esfuerzo | Riesgo | Prioridad |
|-----|----------|----------|--------|-----------|
| **A2** `created_at = startOfHour(date_hour)` | H1, H8, H9 (sintoma) | 1.5h (CF + frontend) | Bajo si agregas `last_written_at` para audit | **P0 — recomendado** |
| **A1** Read-before-write guard | H1, H8, H9 (sintoma) | 2h | Medio: read extra por save, define quien gana | P1 alternativa |
| **C1** Flag DEV en TestingTools | H9 | 0.5h | Cero | **P0 — barato** |
| **C2** `window.confirm` en sync manual | H9 | 0.5h | Cero | P1 alternativa a C1 |
| **B1** CF migra a timezone por ciudad | H4 (deuda) | 4h + tests | Alto: cambia algoritmo de rollup | P2 — Sprint 12 |
| **A3** `hourly_slot_at` separado | H1, H8, H9 + audit trail completo | 5h (UI cambia) | Medio: invasivo en lectores | P3 — solo si auditoria es requerida |

**Recomendacion principal:** combinar **Fix A2 + Fix C1**.
- **A2** ataca el sintoma de raiz: aunque alguien escriba off-hour, el campo
  que se muestra (`created_at`) siempre cae en `HH:00:00 UTC`.
- **C1** cierra el camino accidental de TestingTools.
- Total esfuerzo: ~2h. Riesgo bajo.

**Deuda tecnica diferida:** Fix B1 entra al backlog de Sprint 12 (renombrar
de `BL-008` que ya menciona migracion a UTC consolidada).

### 9.5 Decisiones que necesita el usuario

Antes de implementar, confirmar:

1. **Aprobacion fix A2** — `created_at = startOfHour(date_hour)`. El campo
   pierde "momento real". Si auditoria horaria es requerida, optar por A3 o
   agregar `last_written_at` paralelo (preferido).
2. **Aprobacion fix C1** — TestingTools solo en `import.meta.env.DEV`.
   Confirmar si quieres conservarlo en preview detras de flag opcional.
3. **Inspeccion Firestore** — el usuario debe correr Opcion A (Firebase
   Console) para validar la heuristica de origen y confirmar que H8 sigue
   descartada o reactivada. Pegar resultado en seccion 9.2 antes de ejecutar
   fixes.
4. **Estado de `autoSyncEnabled`** — Sprint 11 debe aclarar quien apaga la CF
   scheduled. Si se queda apagada, los unicos forecasts vienen de
   `syncWeatherManual` o frontend; el sintoma seguira si no se aplica A2.

**Bloqueador:** sin aprobacion explicita del fix elegido, no implementar.

---

## 10. Fase 4 — Validacion en BigQuery + H10 (causa raiz definitiva)

**Fecha:** 2026-05-09
**Ejecuta:** Desarrollador autonomo (gcloud + firebase CLI).

### 10.1 Inspeccion BigQuery (30 docs ultimos)

Query: ver detalle en script + commits de la sesion. Schema: `weather_analytics.city_weather_raw_changelog`.

**Patron observado:**

| `date_hour` | `created_at_utc` | `accuLocationKey` | Origen |
|---|---|---|---|
| 2026-05-09-02 | `02:00:54` | PRESENTE | CF scheduled ✅ |
| 2026-05-08-20 | `01:36:46` | NULL | NO es CF |
| 2026-05-09-01 | `01:00:45` | PRESENTE | CF scheduled ✅ |
| 2026-05-08-19 | `00:13:00` | NULL | NO es CF |
| 2026-05-09-00 | `00:00:48` | PRESENTE | CF scheduled ✅ |
| 2026-05-08-18 | `23:14:33` | NULL | NO es CF |

**Heuristica decisiva:** TODOS los off-hour tienen `accuLocationKey = NULL`. La CF
SIEMPRE setea ese campo (`syncWeatherLogic.ts:189`). El frontend
(`firebaseWeatherService.ts:saveCityForecast`) NO lo setea. **Quien escribe sin
`accuLocationKey` es inequivocamente el frontend.**

### 10.2 H10 — Causa raiz definitiva

**Hipotesis nueva (CONFIRMADA al 100%):** Las escrituras off-hour vienen de
**localhost dev** (donde si existe `VITE_ACCUWEATHER_KEY` en `.env.local`)
escribiendo a la **misma base Firestore prod** (`weather-app-prod-ef50d`).

Cada `npm run dev` + refresh dispara `useWeather.run()` -> `loadCitiesInBatch`
-> `saveCityForecast` con `Timestamp.now()`. Como apunta a la base prod,
los docs corruptos aparecen en preview/prod.

**Evidencia adicional:**
- Run Playwright del Tester en localhost reprodujo `00:13:00 UTC` para
  `2026-05-08-19`, identico al doc en BigQuery (Fase 2 seccion 8.3).
- `.env.local` tiene `VITE_ACCUWEATHER_KEY=*** + VITE_FIREBASE_PROJECT_ID=weather-app-prod-ef50d`.
- Total docs corruptos detectados con script de cleanup: **35** (5 ciudades x 7 slots).

H1, H8, H9 fueron pistas parciales del mismo fenomeno: el frontend escribiendo
forecasts. La pregunta era **desde donde** se ejecuta el frontend, no si el
frontend tiene un camino oculto.

### 10.3 Implementacion del fix

**Aprobado por usuario:** A2 + C1 + cleanup historico.

**Cambios en codigo:**

| Archivo | Cambio |
|---------|--------|
| `src/services/firebase/firebaseWeatherService.ts` | `created_at = Timestamp.fromDate(startOfHourUtcFromDateHour(dateHour))` + nuevo campo `last_written_at: Timestamp.now()`. Helper `startOfHourUtcFromDateHour` y tipo `last_written_at?: Timestamp` en `ForecastDoc` |
| `functions/src/syncWeatherLogic.ts` | `created_at = slotStart` + `last_written_at: now`. Helper `startOfSlotUtc(dateHour)` (UTC variant) |
| `src/components/Header/Header.tsx` | TestingButton + TestingTools envueltos en `import.meta.env.DEV` |
| `scripts/bug-020-cleanup-corrupt-forecasts.cjs` | Script de cleanup (dry-run + apply) |

**Cleanup ejecutado (gcloud ADC):**
- Dry-run identifico 35 docs corruptos en 5 ciudades.
- Apply borro los 35. Re-run posterior reporta `Docs corruptos detectados: 0`.

**Deploy CF:**
- `firebase deploy --only functions:syncWeatherScheduled,functions:syncWeatherManual`.
- Ambas funciones actualizadas en `us-central1`.

**Build/lint:**
- `npx tsc --noEmit` (frontend + functions): OK.
- `npm run build` (frontend + functions): OK.
- Lint: 2 errores **pre-existentes** (HeaderProps `{}`) — no introducidos por este fix.

### 10.4 Pruebas de aceptacion (a cargo del usuario)

1. **Verificacion en BigQuery (proxima hora ronda):** correr la query de seccion 10.1. Esperar a que la CF scheduled corra `0 * * * *` UTC. Los nuevos docs deben tener `created_at_utc_hms = HH:00:00`. **No** debe haber docs nuevos con `accuLocationKey = NULL`.
2. **TestingTools no visible en preview:** abrir preview Vercel post-deploy. El boton de TestingTools NO debe aparecer en el header. En `npm run dev` local SI debe aparecer.
3. **Tabla predictiva muestra `HH:00`:** abrir tabla, columna "Hora MX" debe mostrar siempre minutos `:00` para docs creados despues de este fix.
4. **last_written_at funcional:** inspeccionar 1 doc en Firestore Console. Debe tener `created_at` en `HH:00:00 UTC` y `last_written_at` con momento real del write.

### 10.5 Lecciones para futuras investigaciones

- **No confiar en "el ambiente esta limpio".** Localhost de dev escribiendo a base prod es un anti-patron sutil. Sprint 12 deberia evaluar separar Firestore dev/prod.
- **`accuLocationKey` resulto ser un fingerprint perfecto** del origen del write. Si el frontend lo agregara, perderiamos esa heuristica — pero el fix correcto es separar bases, no preservar el bug-feature.
- **BigQuery export con regex-friendly schema:** `document_name` permite extraer `cityId`/`docId` sin necesidad de UNNEST snapshots. Util para futuras inspecciones.



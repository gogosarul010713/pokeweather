# BUG-020 — Forecast con `created_at` off-hour

**Sprint:** 11
**Fecha de deteccion:** 2026-05-08
**Fecha de fix:** 2026-05-09
**Estado:** ✅ FIXED en `sprint-11`, pendiente de pruebas de aceptacion del usuario
**Branch:** `sprint-11`
**Investigacion:** [`investigacion/INV-001-forecast-off-hour-write.md`](../investigacion/INV-001-forecast-off-hour-write.md) (10 secciones, ver §10 para fix definitivo)

---

## Sintoma

En `PredictionAnalysisTable` columna **Hora MX**, aparecen filas con minutos
no-cero (ej. `08/05 07:04`, `08/05 06:01`, `08/05 21:33`, `08/05 20:14`). Eso
significa que el `created_at` del documento Firestore se escribio en ese
instante exacto, no en el rollup horario esperado (CF scheduled corre
`0 * * * *` UTC, deberia producir `created_at` en `HH:00:0X UTC`).

El sintoma aparece tras `Ctrl+Shift+R` o refresh normal en el preview de
Vercel. Usuario afirma no haber clickeado "sincronizar manual" — sin embargo
en Fase 2 admitio haberlo hecho al menos una vez.

---

## Root Cause

**Causa raiz definitiva (H10, validada con BigQuery + Firebase Admin):**

Las escrituras off-hour vienen de **localhost dev** escribiendo a la **misma
base Firestore prod** (`weather-app-prod-ef50d`). Cada `npm run dev` + refresh
dispara `useWeather.run() -> loadCitiesInBatch -> saveCityForecast` con
`Timestamp.now()` del momento del refresh.

Heuristica decisiva que confirmo H10 (ver INV-001 §10.1):

| Origen | `accuLocationKey` | `created_at` |
|--------|-------------------|--------------|
| CF (`syncWeatherLogic.ts:189`) | PRESENTE | `HH:00:0X UTC` |
| Frontend (`firebaseWeatherService.ts`) | NULL | minuto arbitrario |

35 docs corruptos detectados en BigQuery (5 ciudades x 7 slots).

**Causa estructural (catalizadora):**

`saveCityForecast` en frontend y CF hacen `setDoc(docRef, forecastDoc, { merge: false })`
con `created_at = Timestamp.now()`. Cualquier rewrite (incluso legitimo)
corrompe el campo que la tabla muestra como "Hora MX".

**Evidencia empirica** (ver INV-001 seccion 8.3 y 9.1):
- Run localhost reproduce el sintoma: 5 forecasts escritos a `2026-05-09T00:13:00 UTC`
  cuando el cron deberia haber producido `00:00:00 UTC`.
- Logs CF `syncWeatherScheduled` muestran que cuando ejecuta, escribe en
  `HH:00:0X UTC` (latencia 0.6-5s). No produce minutos `:14` ni `:33`.
- Logs CF `syncWeatherScheduled` muestran tambien que durante 5 horas
  consecutivas (2026-05-08 19:00 - 23:00 UTC) la CF hizo skip por
  `autoSyncEnabled: false`. Las filas en esos slots **no pueden** venir de
  CF scheduled.

**Catalizador secundario (H4):** CF y frontend usan algoritmos distintos
para `date_hour`:
- CF: `getUTCHours()` (UTC)
- Frontend: `getHours()+1` (LOCAL)

Genera duplicados y matching inconsistente. Documentado en INV-001 seccion 3.4.

---

## Hipotesis investigadas y descartadas

Resumen Fases 1 y 2. Detalles completos en INV-001.

| Hipotesis | Estado | Evidencia |
|-----------|--------|-----------|
| H1: Frontend escribe en preview con `VITE_ACCUWEATHER_KEY` presente | **Confirmada en localhost, descartada en preview** por verificacion visual del usuario. Aun asi, demuestra mecanismo. |
| H2: Auto-refresh `setTimeout` desfasado | Irrelevante en preview sin apiKey. Posible en localhost. |
| H3: CF scheduled retry/latencia > 60s | **Descartada.** Logs muestran latencia 0.6-5s, siempre `HH:00:0X UTC`. |
| H4: Conflicto UTC vs LOCAL en `date_hour` | **Confirmada como agravante** (genera duplicados). No es la causa del minuto != 00. |
| H5: TestingTools script periodico | Descartada por inspeccion. |
| H6: Frontend invoca `syncWeatherManual` implicito | **Descartada** por grep + auditoria. Solo TestingTools manual. |
| H7: Camino alternativo de escritura no-AccuWeather | **Descartada** por inventario completo de `setDoc/addDoc/updateDoc`. |
| H8: Vercel preview SI tiene `VITE_ACCUWEATHER_KEY` pese a creencia del usuario | Sospechosa, pendiente validacion (screenshot). |
| H9: Usuario clickeo "Sincronizar ahora" en TestingTools | **Parcialmente confirmada** por usuario en Fase 2. Logs muestran 2 invocaciones reales en rango disponible. |

---

## Fix propuesto

Ver INV-001 seccion 9.3 y 9.4 para analisis completo de opciones y trade-offs.

**Recomendacion principal (P0):**

1. **Fix A2** — `created_at = startOfHour(date_hour)` en lugar de
   `Timestamp.now()`. Aplicar en CF (`syncWeatherLogic.ts:saveCityForecast`)
   y frontend (`firebaseWeatherService.ts:saveCityForecast`). Agregar
   `last_written_at: Timestamp.now()` paralelo si se requiere audit trail.
   - Esfuerzo: 1.5h
   - Riesgo: bajo
   - Resuelve: sintoma observado independientemente del trigger.

2. **Fix C1** — Renderizar `<TestingTools />` solo cuando
   `import.meta.env.DEV`. Cierra el camino accidental que activa
   `syncWeatherManual` en preview/prod.
   - Esfuerzo: 0.5h
   - Riesgo: cero
   - Resuelve: H9 (camino accidental).

**Total recomendado:** ~2h, riesgo bajo.

**Deuda diferida (P2 — Sprint 12):**
- **Fix B1** — CF migra a calcular `date_hour` con timezone de cada ciudad
  (resuelve H4). Renombrar item `BL-008` del backlog.

**No recomendado:**
- Fix B2 (frontend a UTC): rompe invariante Sprint 10 #1.
- Fix A3 (`hourly_slot_at` separado): invasivo en lectores, no necesario si
  A2 resuelve el sintoma.

---

## Decisiones requeridas antes de implementar

1. ¿Aprobado fix A2? Si auditoria horaria es requerida, agregar
   `last_written_at` paralelo.
2. ¿Aprobado fix C1? Confirmar si quieres conservar TestingTools en preview
   detras de flag opcional `VITE_ENABLE_TESTING_TOOLS`.
3. ¿Estado de `autoSyncEnabled`? Sprint 11 debe aclarar quien la apaga y por que.
4. Inspeccion Firestore directa pendiente: usuario debe correr Opcion A
   (Firebase Console) descrita en INV-001 seccion 9.2 y pegar los 20 ultimos
   `created_at` para validar la heuristica de origen.

---

## Solucion implementada

Aprobada por usuario el 2026-05-09: **A2 + C1 + cleanup historico**.

**Codigo (3 archivos):**

1. `src/services/firebase/firebaseWeatherService.ts`
   - `created_at = Timestamp.fromDate(startOfHourUtcFromDateHour(dateHour))` (era `Timestamp.now()`)
   - Nuevo campo `last_written_at: Timestamp.now()` (audit trail)
   - Helper `startOfHourUtcFromDateHour(dateHour: string): Date`
   - Tipo `ForecastDoc` extendido con `last_written_at?: Timestamp`

2. `functions/src/syncWeatherLogic.ts`
   - `created_at = slotStart` (era `Timestamp.now()`)
   - Nuevo campo `last_written_at: now`
   - Helper `startOfSlotUtc(dateHour: string): Date` (UTC variant)
   - Deploy: `firebase deploy --only functions:syncWeatherScheduled,functions:syncWeatherManual` ✅

3. `src/components/Header/Header.tsx`
   - `<TestingButton>` y `<TestingTools>` envueltos en `import.meta.env.DEV`
   - Cierra el camino accidental de "Sincronizar ahora" en preview/prod

**Cleanup:**

`scripts/bug-020-cleanup-corrupt-forecasts.cjs` (Firebase Admin via gcloud ADC).
- Heuristica: `accuLocationKey == null` -> origen frontend dev -> borrar
- Dry-run: 35 docs corruptos en 5 ciudades (auckland-waterfront, itaewon-jung-gu-se-l, pier-39-san-francisco, times-square-midtown-nyc, zaragoza-centro)
- Apply: 35 borrados ✅
- Re-run dry: `Docs corruptos detectados: 0` ✅

**Build/lint:**
- `npx tsc --noEmit` (frontend + functions): OK
- `npm run build` (frontend + functions): OK
- Lint: 2 errores pre-existentes en `Header.tsx` (BL-005, sin relacion)

## Pruebas de aceptacion (pendientes — el usuario las ejecuta)

1. **BigQuery (proxima ejecucion CF):** correr query de INV-001 §10.1. La proxima
   `syncWeatherScheduled` (cron `0 * * * *` UTC) debe escribir docs con
   `created_at_utc_hms = HH:00:00`. **No** deben aparecer docs nuevos con
   `accuLocationKey = NULL`.

2. **TestingTools no visible en preview:** abrir
   `https://pokeweather-git-sprint-10-gogosarul010713-7327s-projects.vercel.app/`
   o el preview de sprint-11 una vez deployado. El boton de TestingTools NO
   debe aparecer en el header. En `npm run dev` local SI debe aparecer.

3. **Tabla predictiva muestra `HH:00`:** abrir tabla. Columna "Hora MX" debe
   mostrar siempre minutos `:00` para docs creados despues de este fix
   (los anteriores ya fueron borrados por el cleanup).

4. **Audit trail (last_written_at):** inspeccionar 1 doc en Firebase Console
   `city_weather/auckland-waterfront/forecasts/<dateHour>`. Debe existir
   `created_at` (HH:00:00 UTC) y `last_written_at` (momento real del write).

5. **Deploy frontend:** push de `sprint-11` a Vercel. Verificar build OK
   y que el bundle no incluye TestingTools (`import.meta.env.DEV` = false en build).

## Notas y deuda futura

- **Sprint 12 — separar Firebase project dev/prod:** Localhost dev escribiendo
  a Firestore prod fue la causa raiz. Considerar emulador local o proyecto
  Firebase dedicado a desarrollo. Documentar en backlog `BL-011` (nuevo).
- **Sprint 12 — Fix B1 (CF migra `date_hour` a timezone por ciudad):** Resuelve
  H4 (UTC vs LOCAL). Renombrar `BL-008` para incluir esta tarea.
- **`autoSyncEnabled: false`** durante 5h (08/05 19-23 UTC) fue intencional
  (testing). Sin relacion con BUG-020 — solo contexto.

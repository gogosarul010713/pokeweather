# US-1203 — Utilidad de limpieza de forecasts sin reporte (UI)

**Sprint:** 12
**Estado:** COMPLETADO ✅ 2026-06-30
**Prioridad:** Media
**Estimacion:** 2h
**Depende de:** US-1202 (misma regla de negocio, distinto SDK/contexto de ejecucion), REF-004 ✅ (2026-06-29 — `classification_reports` eliminada, ver D-047)

---

## Historia de usuario

Como desarrollador validando la precision del algoritmo, quiero un boton
en la app para borrar los forecasts sin reporte sin tener que abrir terminal,
para poder limpiar datos entre rondas de prueba de forma comoda.

---

## Contexto tecnico

Misma regla de negocio que US-1202: un forecast es elegible para borrar si
su combinacion `city_id + date_hour` no tiene reporte en `weather_reports`.

**Nota (REF-004/D-047, 2026-06-29):** `classification_reports` fue eliminada
definitivamente — siempre estuvo vacia (coleccion huerfana desde REF-003).
La regla de negocio depende solo de `weather_reports`.

**Esta US NO llama al script de US-1202.** El script usa Firebase Admin SDK
(Node, requiere service account) — no puede ejecutarse desde el browser.
Esta US implementa la misma logica con el Firebase Client SDK que ya usa
el resto de la app (`firebaseConfig.ts` → `getDb()`).

**Ubicacion sugerida:** el proyecto ya tiene un `CleanupPanel` / `cleanupService.ts`
(Testing Tools) que maneja limpieza de colecciones completas via Cloud Function.
Esta utilidad es mas granular — no borra todo, solo forecasts huerfanos — por lo
que va como una accion adicional en ese mismo panel, no uno nuevo.

---

## Criterios de aceptacion

### CA-01 — Preview antes de borrar
- Boton "Revisar predicciones sin reporte" calcula y muestra el conteo
  ("X predicciones sin reporte de Y totales") sin borrar nada todavia

### CA-02 — Confirmacion explicita
- Boton "Eliminar" solo aparece despues del preview (cuando `unreported > 0`)
- El preview visible actua como confirmacion implicita: el usuario ve el conteo antes de decidir borrar
- No se implementa modal ni doble-click — el flujo preview → boton visible → click unico es suficiente para el contexto de herramienta de desarrollo

### CA-03 — Ejecucion y feedback
- Al confirmar, borra los forecasts elegibles
- Muestra resultado: "N predicciones eliminadas"
- Maneja error de red/Firestore mostrando mensaje, sin romper el panel

### CA-04 — Refresco post-limpieza
- Despues de borrar, llama `onCleanupComplete()` para incrementar `refreshKey`
  en TestingTools — esto bypasea la cache y fuerza relecture desde Firestore
- La tabla predictiva ya maneja este patron (BUG-011): `fromCleanup = refreshKey > 0`

---

## Diseño tecnico

### Funciones nuevas en servicio existente

`src/services/cleanup/cleanupService.ts` (mismo archivo que `fetchCleanupCounts` / `executeCleanup`):

```ts
export async function countUnreportedForecasts(hours = 24): Promise<{ total: number; unreported: number }>
export async function deleteUnreportedForecasts(hours = 24): Promise<number>
```

Reutiliza la misma logica de indice `city_id|date_hour` que
`predictionAnalyticsService.ts` ya construye — extraer esa construccion
a una funcion exportada en `predictionAnalyticsService.ts` para no duplicar
la regla en 3 lugares (script US-1202, cleanupService, analytics).

### Cambios en UI

`src/components/TestingTools/CleanupPanel.tsx` — nueva seccion al final del panel
con el flujo: boton preview → conteo → boton eliminar (mismo patron de estado
`isLoading` / `message` que las opciones existentes).

### Invalidacion de cache

Dos mecanismos combinados (ver D-048):

1. `deleteUnreportedForecasts()` llama `invalidateForecastCaches()` — borra `pwe-forecast-cache` y `pwe-predictions-cache` de IndexedDB directamente, antes de retornar
2. `handleOrphanDelete` llama `onCleanupComplete?.()` — incrementa `refreshKey` en TestingTools, forzando bypass de cache en `PredictionAnalysisDemo` (`fromCleanup = true`)
3. `handleOrphanPreview` con `total === 0` tambien invalida cache y llama `onCleanupComplete?.()` — sincroniza la tabla cuando Firestore esta vacio pero la cache local aun tiene datos

`cacheService.ts` si requiere cambio: funcion `invalidateForecastCaches()` nueva (exportada).

### Ventana temporal de reportes

`countUnreportedForecasts` y `deleteUnreportedForecasts` usan `getAllWeatherReports()` (sin filtro temporal) para construir el indice. Razon: un reporte puede tener cualquier edad dentro del TTL de 30 dias — filtrar reportes a 24h/48h genera falsos positivos (forecasts con reporte marcados como huerfanos). Ver D-048.

---

## Riesgos y consideraciones

| Riesgo | Mitigacion |
|--------|-----------|
| Logica de "elegible para borrar" duplicada entre script (US-1202), este servicio, y `predictionAnalyticsService` | Extraer a funcion compartida en analisis tecnico antes de implementar |
| Borrado accidental sin confirmacion | CA-02 exige preview + confirmacion explicita, no un solo click |
| Cache desincronizada tras borrar | CA-04 — llamar `onCleanupComplete()` activa bypass de cache via `refreshKey` (patron BUG-011, ya probado) |

---

## Lo que NO incluye esta US

- Llamar o invocar el script de US-1202
- Borrado de `weather_reports` (se conservan siempre)
- Filtro por ciudad especifica (la regla aplica global, igual que US-1202)

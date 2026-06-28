# US-1203 — Utilidad de limpieza de forecasts sin reporte (UI)

**Sprint:** 12
**Estado:** Pendiente
**Prioridad:** Media
**Estimacion:** 2h
**Depende de:** US-1202 (misma regla de negocio, distinto SDK/contexto de ejecucion)

---

## Historia de usuario

Como desarrollador validando la precision del algoritmo, quiero un boton
en la app para borrar los forecasts sin reporte sin tener que abrir terminal,
para poder limpiar datos entre rondas de prueba de forma comoda.

---

## Contexto tecnico

Misma regla de negocio que US-1202: un forecast es elegible para borrar si
su combinacion `city_id + date_hour` no tiene reporte en `weather_reports`
ni en `classification_reports`.

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
- Boton "Eliminar" solo aparece despues del preview
- Requiere confirmacion (modal o doble-click estilo Cascade Delete existente)

### CA-03 — Ejecucion y feedback
- Al confirmar, borra los forecasts elegibles
- Muestra resultado: "N predicciones eliminadas"
- Maneja error de red/Firestore mostrando mensaje, sin romper el panel

### CA-04 — Refresco post-limpieza
- Despues de borrar, invalida la cache local (`cacheService.ts` — `KEY_FORECAST_CACHE`)
  para que la tabla predictiva no siga mostrando las filas eliminadas
- Si la tabla esta montada, dispara su refetch

---

## Diseño tecnico

### Funcion nueva en servicio existente

`src/services/firebase/firebaseWeatherService.ts`:

```ts
export async function countUnreportedForecasts(hours = 24): Promise<{ total: number; unreported: number }>
export async function deleteUnreportedForecasts(hours = 24): Promise<number>
```

Reutiliza la misma logica de indice `city_id|date_hour` que
`predictionAnalyticsService.ts` ya construye — evaluar extraer esa
construccion de indice a una funcion compartida para no duplicar la regla
en 3 lugares (script, servicio, analytics).

### Cambios en UI

Archivo exacto del panel de Testing Tools a definir en analisis tecnico previo
a implementacion (candidatos: `CleanupPanel` o componente hermano en la misma carpeta).

### Invalidacion de cache

`cacheService.ts` expone `getForecastCache` / guarda bajo `KEY_FORECAST_CACHE`.
Necesita una funcion de invalidacion o limpieza selectiva por clave
`city_id-date_hour` (mismo formato ya usado en `cacheService.ts:165`).

---

## Riesgos y consideraciones

| Riesgo | Mitigacion |
|--------|-----------|
| Logica de "elegible para borrar" duplicada entre script (US-1202), este servicio, y `predictionAnalyticsService` | Extraer a funcion compartida en analisis tecnico antes de implementar |
| Borrado accidental sin confirmacion | CA-02 exige preview + confirmacion explicita, no un solo click |
| Cache desincronizada tras borrar | CA-04 — invalidar cache es parte de la definicion de hecho, no opcional |

---

## Lo que NO incluye esta US

- Llamar o invocar el script de US-1202
- Borrado de `weather_reports` (se conservan siempre)
- Filtro por ciudad especifica (la regla aplica global, igual que US-1202)

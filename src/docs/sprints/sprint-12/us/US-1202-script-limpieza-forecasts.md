# US-1202 — Script de limpieza de forecasts sin reporte

**Sprint:** 12
**Estado:** COMPLETADO ✅
**Prioridad:** Media
**Estimacion:** 1.5h
**Validado:** 2026-06-28 — 5 forecasts sin reporte eliminados en ejecucion real (auckland-waterfront, itaewon-jung-gu-se-l, pier-39-san-francisco, times-square-midtown-nyc, zaragoza-centro)

---

## Historia de usuario

Como desarrollador validando la precision del algoritmo, quiero poder borrar
desde terminal los forecasts que nunca recibieron un reporte de clima real,
para empezar rondas de pruebas limpias sin filas "Sin Datos" acumuladas.

---

## Contexto tecnico

Cada hora la app genera un doc de forecast en `city_weather/{city_id}/forecasts/`.
El usuario reporta el clima real observado en Pokemon GO via `WeatherReportModal`,
lo cual crea un doc en `weather_reports`. Si el usuario no llega a reportar a
tiempo, el forecast queda huerfano — la tabla predictiva lo muestra con columna
"Real" = "Sin Datos" (`PredictionAnalysisTable.tsx`, columna `actual`).

**Regla de negocio (confirmada por el usuario):**
Por cada combinacion `city_id + date_hour`, si NO existe un reporte
(en `weather_reports` NI en `classification_reports`), el forecast es
elegible para borrar. Si existe reporte, se conserva — sin excepcion,
incluso si el usuario "cambio de opinion" sobre la condicion reportada.

**Ejemplo:**
```
Auckland   14h → sin reporte → BORRAR
Auckland   15h → sin reporte → BORRAR
Times Sq.  14h → reporte "rain"  → CONSERVAR
Times Sq.  15h → sin reporte → BORRAR
Times Sq.  16h → reporte "sunny" → CONSERVAR
```

**Por que revisar tambien `classification_reports`:** `predictionAnalyticsService.ts`
cruza forecasts contra AMBAS colecciones para resolver la columna "Real"
(ver `reportIndex` en `predictionAnalyticsService.ts:51-66`). Aunque
`classification_reports` esta vacia en la practica (REF-003, coleccion huerfana),
el script debe respetar el mismo indice para no desincronizarse de la tabla.

---

## Criterios de aceptacion

### CA-01 — Identificar forecasts elegibles
- Lee forecasts de `city_weather/*/forecasts/` (collectionGroup), limitado a 24h
  (mismo rango que usa la tabla predictiva — forecasts mas viejos no aparecen ahi)
- Lee `weather_reports` + `classification_reports` del mismo rango
- Construye el mismo indice `city_id|date_hour` que usa `predictionAnalyticsService`
- Marca como elegible cualquier forecast cuya clave no este en el indice

### CA-02 — Modo dry-run
- Flag `--dry-run`: imprime cuantos forecasts serian eliminados, agrupados por ciudad
- No modifica Firestore en este modo

### CA-03 — Borrado real
- Sin `--dry-run`: borra los forecasts elegibles en batches (max 400, igual que `clean-firestore.ts`)
- Imprime progreso y total eliminado al finalizar

### CA-04 — Reporte final
- Muestra resumen: total forecasts revisados, total conservados (con reporte), total eliminados

---

## Diseño tecnico

### Archivo nuevo

```
scripts/clean-unreported-forecasts.ts
```

Sigue el mismo patron que `scripts/clean-firestore.ts`:
- Firebase Admin SDK (`admin.firestore()`)
- Requiere `.env.serviceAccountKey.json` en la raiz
- `deleteQueryInBatches`-style helper reutilizado/adaptado

### Logica central

```ts
// 1. Cargar forecasts (collectionGroup 'forecasts', filtro 24h)
// 2. Cargar weather_reports + classification_reports (mismo rango)
// 3. Construir Set<string> de claves "city_id|date_hour" con reporte
// 4. Filtrar forecasts cuya clave NO esta en el set
// 5. dry-run → solo contar / sin dry-run → borrar en batch
```

### Uso

```bash
npx tsx scripts/clean-unreported-forecasts.ts --dry-run
npx tsx scripts/clean-unreported-forecasts.ts
```

---

## Riesgos y consideraciones

| Riesgo | Mitigacion |
|--------|-----------|
| Cache local (IndexedDB) no se invalida — la tabla puede seguir mostrando filas borradas hasta refresh | Documentar en el output del script: "recarga la app para ver cambios" |
| Borrar forecasts de un sprint de pruebas en curso por error | `--dry-run` es el flujo recomendado antes de ejecutar en real |
| Ventana de 24h puede no coincidir si la tabla cambia su rango en el futuro | Centralizar el valor del rango en una constante, no hardcodear en 2 lugares |

---

## Lo que NO incluye esta US

- UI / boton en la app (ver US-1203)
- Invalidacion automatica de cache IndexedDB
- Borrado de `weather_reports` (esos SIEMPRE se conservan, son el dato valioso)

---

## Notas de validacion (2026-06-28)

**Incidente de reloj del sistema:** primer intento fallo con
`UNAUTHENTICATED / ACCESS_TOKEN_EXPIRED` al conectar Firebase Admin SDK.
Causa real: la hora de Windows estaba desincronizada (mostraba 2pm cuando
la hora real de la zona horaria era 8:42am). Los tokens OAuth2 de Google
se rechazan si el reloj local esta desfasado. Resuelto sincronizando el
reloj del sistema — no era un problema de la key ni del codigo.

**Cuidado con el flag `--dry-run`:** al copiar/pegar el comando desde texto
con puntuacion, es facil arrastrar un punto final (`--dry-run.`) que
PowerShell no reconoce como el flag — el script corre en modo real sin
avisar que el flag fue ignorado. Verificar siempre que el output muestre
`Modo: DRY-RUN` en el encabezado antes de confirmar que no hubo cambios.

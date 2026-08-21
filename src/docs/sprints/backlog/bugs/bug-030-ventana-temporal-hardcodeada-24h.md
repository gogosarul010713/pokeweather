# BUG-030 — Ventana temporal hardcodeada a 24h en forecasts y reportes

**Reportado:** 2026-07-10
**Prioridad:** Alta
**Estimacion:** 0.5h
**Estado:** RESUELTO — 2026-07-10

---

## Descripcion

Tres servicios tenian el rango de consulta hardcodeado a `'24h'` / `24` horas,
independiente del TTL real de los datos en Firestore (30 dias). Cuando la Cloud
Function de sincronizacion deja de correr por mas de 24h, todos los datos
desaparecen de la UI aunque existan en Firestore.

Descubierto al implementar US-1204 (eliminar reporte desde tabla predictiva):
la tabla de predicciones aparecia vacia y la herramienta de limpieza reportaba
0 forecasts sin reporte, cuando en realidad habia 181 docs en Firestore de
los ultimos 11 dias.

---

## Causa raiz

El TTL de `forecasts` y `weather_reports` en Firestore es 30 dias, pero las
consultas filtraban a 24h. Con sync intermitente, la ventana nunca alcanzaba
los datos existentes.

---

## Archivos afectados

| Archivo | Linea | Problema | Fix |
|---------|-------|---------|-----|
| `src/services/predictions/predictionAnalyticsService.ts` | 43 | `getRecentForecasts('24h')` | → `getRecentForecasts('30d')` |
| `src/services/predictions/predictionAnalyticsService.ts` | 56 | `getRecentWeatherReports(24)` | → `getAllWeatherReports()` |
| `src/components/Analytics/PredictionAnalysisDemo.tsx` | 144, 165 | `getRecentForecasts('24h')` x2 | → `getRecentForecasts('30d')` |
| `src/services/cleanup/cleanupService.ts` | 234, 253 | `getRecentForecasts('24h')` x2 | → `getRecentForecasts('30d')` |
| `src/services/firebase/firebaseWeatherService.ts` | switch | case `'30d'` faltante | agregado |

---

## Comportamiento antes del fix

- Tabla "Predicciones" en Testing Tools aparecia vacia si la CF no habia corrido en >24h
- Columna "Real" no mostraba reportes aunque existieran en `weather_reports`
- "Revisar" en CleanupPanel reportaba 0 forecasts sin reporte
- No habia feedback al usuario de que el problema era operacional (sync caida)

## Comportamiento despues del fix

- Todos los servicios consultan el rango completo de TTL (`30d`)
- La tabla muestra datos mientras existan docs dentro del TTL de Firestore
- La limpieza detecta correctamente forecasts sin reporte en los ultimos 30 dias
- Alineado con D-049 (decision-log): ventana = TTL de Firestore

---

## Nota

El uso de `getAllWeatherReports()` (sin filtro) para reportes de clima sigue
el criterio ya establecido en D-048: los reportes deben compararse sin ventana
temporal porque pueden referirse a forecasts de cualquier edad dentro del TTL.

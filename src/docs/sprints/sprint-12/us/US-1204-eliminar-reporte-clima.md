# US-1204 — Eliminar reporte de clima desde tabla predictiva

**Sprint:** 12
**Estado:** Pendiente
**Prioridad:** Media
**Estimacion:** 1h
**Depende de:** US-1201 (tabla predictiva), US-1203 (invalidateForecastCaches)

---

## Historia de usuario

Como desarrollador validando la precision del algoritmo, quiero poder eliminar
un reporte de clima incorrecto directamente desde la tabla predictiva, para que
no sesgue las estadisticas y pueda volver a reportar si lo necesito.

---

## Contexto tecnico

Cada fila de `PredictionAnalysisTable` con `actual !== null` tiene un documento
en `weather_reports` identificado por `city_id + date_hour`. Hoy no existe forma
de borrar ese documento desde la UI — el reporte queda fijo aunque sea incorrecto.

Al borrar el reporte:
- La fila vuelve a `actual: null, correct: null` ("Sin Datos")
- `PrecisionPanel` recalcula automaticamente (consume las mismas `rows`)
- El forecast queda sin reporte → elegible para limpieza via US-1203

La fila no desaparece de la tabla — el forecast sigue existiendo. Solo se borra
la confirmacion del usuario.

---

## Criterios de aceptacion

### CA-01 — Boton visible solo en filas con reporte
- En cada fila donde `actual !== null`, mostrar icono/boton "Eliminar reporte"
- En filas con `actual === null` (Sin Datos), el boton no aparece

### CA-02 — Borrado en Firestore
- Al hacer click, llama `deleteWeatherReport(cityId, dateHour)` en `classificationReportService.ts`
- Borra el documento de `weather_reports` con ese `city_id + date_hour`
- Maneja error de red mostrando feedback sin romper la tabla

### CA-03 — Actualizacion inline de la fila
- Post-borrado, actualiza la fila en estado local: `actual: null, correct: null`
- Sin refetch — mismo patron que `handleReportSuccess` existente en `PredictionAnalysisDemo`
- `PrecisionPanel` se recalcula automaticamente (recibe las mismas `rows`)

### CA-04 — Invalidacion de cache
- Llama `invalidateForecastCaches()` post-borrado para que la cache no preserve
  el reporte eliminado en proximas cargas

---

## Diseño tecnico

### Nueva funcion en servicio existente

`src/services/firebase/classificationReportService.ts`:

```ts
export async function deleteWeatherReport(cityId: string, dateHour: string): Promise<void>
```

Query: `collection('weather_reports')` donde `city_id == cityId` AND `date_hour == dateHour` → `deleteDoc`.

### Cambios en UI

**`PredictionAnalysisTable.tsx`:**
- Nueva prop `onReportDelete?: (cityId: string, dateHour: string) => void`
- Boton pequeño en la columna REAL, visible solo cuando `row.actual !== null`
- Mismo estilo que el boton de reporte existente (icono, sin texto largo)

**`PredictionAnalysisDemo.tsx`:**
- Handler `handleReportDelete(cityId, dateHour)`:
  1. Llama `deleteWeatherReport(cityId, dateHour)`
  2. Llama `invalidateForecastCaches()`
  3. Actualiza estado local: fila con ese `cityId + dateHour` → `actual: null, correct: null`
- Pasa `onReportDelete={handleReportDelete}` a `PredictionAnalysisTable`

### Confirmacion

Sin modal — click unico. Contexto de herramienta de desarrollo, mismo criterio
que CA-02 de US-1203.

---

## Lo que NO incluye esta US

- Edicion del reporte (cambiar condicion a otra) — solo borrado
- Borrado del forecast en Firestore — eso es responsabilidad de US-1203
- Filtro o historial de reportes eliminados

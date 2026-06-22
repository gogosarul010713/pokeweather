# US-1201 — Panel de precision del algoritmo de clima

**Sprint:** 12
**Estado:** COMPLETADO — CA-01 a CA-06 implementados ✅
**Prioridad:** Media
**Estimacion:** 2-3h
**Investigacion base:** INV-001-precision-weather-reports.md
**Investigacion NFR:** INV-002-firestore-query-strategy.md
**Mockup:** `.superpowers/brainstorm/199-1782075473/content/precision-panel.html`

---

## Historia de usuario

Como desarrollador del algoritmo de clasificacion, quiero ver un resumen
estadistico de los reportes de clima para identificar rapidamente donde esta
fallando el algoritmo, sin tener que procesar los datos a mano.

---

## Contexto tecnico

Los usuarios reportan el clima real observado en Pokemon GO via `WeatherReportModal`.
Cada reporte persiste en `weather_reports` con la condicion predicha vs la condicion
real. El panel consume esos reportes directamente — sin nueva infraestructura.

**Fuente de datos:** coleccion `weather_reports` en Firestore (TTL 30 dias).
**Punto de entrada:** `PredictionAnalysisTable` — toggle colapsable encima de la toolbar.

---

## Criterios de aceptacion

### CA-01 — Toggle colapsable ✅ IMPLEMENTADO
- Panel oculto por defecto (colapsado)
- Boton "Ver precision del algoritmo" lo expande/colapsa
- Estado no persiste entre sesiones (localStorage fuera de alcance)

### CA-02 — KPIs visibles al expandir ✅ IMPLEMENTADO
Cuatro cards en fila:
1. **Precision global** — `X% (N aciertos / M total)`
2. **Clima con mas fallos** — nombre de condicion + `N fallos de M`
3. **Clima sin fallos** — primera condicion con 0 fallos, o "—" si ninguna
4. **Franja con mas fallos** — rango de hora `HH-HH` + cantidad de fallos

### CA-03 — Tabla de precision por condicion ✅ IMPLEMENTADO
Columnas: Condicion | Aciertos | Fallos | Total | Precision (barra + %)
- Ordenada por % precision ASC (las peores arriba)
- Barra de progreso coloreada: verde >= 75%, naranja >= 50%, rojo < 50%
- Solo muestra condiciones que tienen al menos 1 reporte

### CA-04 — Grafico de fallos por hora ✅ IMPLEMENTADO
- Barras verticales, una por hora (0-23)
- Altura proporcional al numero de fallos en esa hora
- Color: rojo si es la hora con mas fallos, naranja si es top-3, gris resto

### CA-05 — Estado sin datos ✅ IMPLEMENTADO
- Si no hay filas con `correct !== null`, mostrar mensaje:
  `"Sin reportes suficientes. Reporta el clima en la tabla para ver estadisticas."`
- Si hay entre 1 y 9 reportes, mostrar advertencia sutil:
  `"Estadisticas preliminares — menos de 10 reportes"`

### CA-06 — Ventana de tiempo ✅ IMPLEMENTADO
**Decision tomada (2026-06-22):** dos consultas independientes.
- La tabla sigue usando `getRecentWeatherReports(24)` — sin cambio
- El panel hace su propia consulta `getRecentWeatherReports(720)` desde `PrecisionPanel`
  via `useEffect` interno — independiente de las `rows` de la tabla
- La query debe usar `where('timestamp', '>=', minDate)` para filtrar en Firestore
  (no en memoria) — ver INV-002 para justificacion
- Muestra en header: `"Ultimos 30 dias · N reportes"`

**Por que dos consultas y no una:**
- Mezclar rangos de tiempo en la misma consulta confundiria la columna "Real"
  de la tabla (mostraria reportes viejos como si fueran predicciones actuales)
- El panel de precision necesita muestra estadistica de 30 dias; la tabla
  necesita solo el dia actual para cruzar con predicciones vigentes

---

## Diseño tecnico

### Archivos creados

```
src/
  components/Analytics/
    PrecisionPanel.tsx         -- componente UI + query propia (720h)
  hooks/
    usePrecisionStats.ts       -- calculo de metricas en useMemo
```

### Cambios realizados a archivos existentes

| Archivo | Cambio |
|---------|--------|
| `classificationReportService.ts` | `WeatherReport` interface + `getRecentWeatherReports` retorna `predicted_condition`, `city_name`, `timestamp` |
| `PredictionAnalysisTable.tsx` | Toggle `precisionOpen` + imports + render `<PrecisionPanel>` encima de toolbar |

### Cambios CA-06 (implementados 2026-06-22)

| Archivo | Cambio |
|---------|--------|
| `classificationReportService.ts` | `query()` + `where('timestamp', '>=', minDate)` — filtra en Firestore, no en memoria |
| `PrecisionPanel.tsx` | Autocontenido — `useEffect` propio llama `getRecentWeatherReports(720)`, sin props externos |
| `usePrecisionStats.ts` | Acepta `WeatherReport[]` — calcula `correct` comparando `predicted_condition vs reported_condition` |

### Interface de `usePrecisionStats` (estado actual)

```ts
interface PrecisionStats {
  total: number
  hits: number
  globalRate: number
  byCondition: ConditionStat[]     // ordenado por rate ASC
  worstCondition: ConditionStat | null
  perfectConditions: ConditionStat[]
  failsByHour: Record<number, number>  // hora 0-23 => fallos
  worstHourRange: string           // "14h-16h"
}
```

---

## Requerimientos no funcionales

| NFR | Estado | Detalle |
|-----|--------|---------|
| Costo Firestore | OK | Plan gratuito: 50k lecturas/dia. Uso personal nunca lo alcanza |
| Query eficiente | Pendiente CA-06 | Agregar `where` para filtrar en Firestore, no en memoria |
| Rendimiento | OK | Con volumen actual (< 200 docs) latencia < 300ms |
| Cache de weather_reports | Fuera de alcance | No necesario para uso personal en esta US |

---

## Lo que NO incluye esta US

- Analisis por lookback (Alcance 2 — definir en sesion posterior)
- Filtro por ciudad en el panel
- Exportacion de datos
- Persistencia del estado abierto/cerrado
- Cache de `weather_reports` en IndexedDB

---

## Definicion de hecho

- [x] Panel colapsable visible en `PredictionAnalysisTable`
- [x] KPIs calculados desde `usePrecisionStats`
- [x] Tabla por condicion ordenada y con barras coloreadas
- [x] Grafico de barras por hora funcional
- [x] Estado sin datos manejado
- [x] Build TypeScript limpio (0 errores)
- [x] Panel hace consulta propia de 30 dias (CA-06)
- [x] Query usa `where` para filtrar en Firestore (CA-06)
- [x] Probado manualmente con datos reales en dev

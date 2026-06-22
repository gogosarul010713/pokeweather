# INV-001 — Analisis tecnico: panel de precision del algoritmo

**Fecha:** 2026-06-21
**Branch:** sprint-12
**Estado:** COMPLETADA — US-1201 lista para implementar
**Referencia US:** US-1201

---

## 1. Objetivo

Determinar si es tecnicamente viable construir un panel de metricas de precision
del algoritmo usando SOLO los datos existentes en `weather_reports`, sin nuevas
colecciones ni cambios al schema de Firestore.

---

## 2. Fuente de datos: coleccion `weather_reports`

### 2.1 Schema de cada documento

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `city_id` | string | `"auckland-waterfront"` |
| `city_name` | string | `"Auckland Waterfront"` |
| `timestamp` | Timestamp | Momento en que el usuario envio el reporte |
| `date_hour` | string | `"YYYY-MM-DD-HH"` — hora predicha |
| `predicted_condition` | string | Lo que el algoritmo predijo (`sunny`, `rain`, etc.) |
| `reported_condition` | string | Lo que el usuario observo realmente en PGO |
| `source` | string | `"prediction-table"` (unico valor actual) |
| `reporter` | string | `"user"` |
| `ttl` | Timestamp | Expira 30 dias despues de creado |

### 2.2 Campos AUSENTES (no disponibles para el analisis)

- `icon_code` — icono AccuWeather que genero la prediccion
- `wind_kmh` / `gust_kmh` — no se puede analizar fallos de WINDY
- Offset del snapshot (distancia temporal de la prediccion)
- `lookback_entries` — no se guardan al reportar

**Conclusion:** con `predicted_condition`, `reported_condition`, `city_id` y
`date_hour` se puede derivar todo lo planeado para el Alcance 1.

---

## 3. Flujo de datos actual

```
Firestore `weather_reports`
        |
        v
getRecentWeatherReports(hours)          ← classificationReportService.ts:78
        |
        v
predictionAnalyticsService.fetchPredictions()
        |
        v  (cruza con ForecastDocs por city_id|date_hour)
PredictionRow[] { prediction, actual, correct, cityId, dateHour, ... }
        |
        v
PredictionAnalysisTable (recibe rows como prop)
```

`getRecentWeatherReports` hoy solo devuelve `city_id`, `date_hour`,
`reported_condition`. Para el panel de precision necesitamos tambien
`predicted_condition` y `timestamp` — ambos estan en Firestore pero se
filtran en la query actual.

---

## 4. Metricas derivables con los datos disponibles

| Metrica | Campos usados | Como calcular |
|---------|--------------|---------------|
| Precision global | `predicted_condition`, `reported_condition` | aciertos / total |
| Precision por condicion | ambos | agrupar por `predicted_condition`, calcular ratio |
| Condicion con mas fallos | ambos | mismo agrupado, ordenar por fallos DESC |
| Condicion sin fallos | ambos | filtrar grupos con fallos === 0 |
| Fallos por hora del dia | `date_hour`, ambos | extraer HH de `date_hour`, agrupar fallos |
| Fallos por ciudad | `city_id`, ambos | agrupar por ciudad |
| Confusion matrix | ambos | predicted vs reported — que se confunde con que |

---

## 5. Punto de insercion en el codigo

### 5.1 Donde se computan las metricas

**Opcion elegida:** nuevo hook `usePrecisionStats(rows: PredictionRow[])` que
recibe las mismas filas que ya tiene `PredictionAnalysisTable`. Calcula todo
en memoria con `useMemo`. Cero llamadas adicionales a Firestore.

**Por que no en `predictionAnalyticsService`:** ese servicio ya carga y cruza
los datos. El panel de precision es una vista derivada de lo mismo — no
necesita su propia fuente.

### 5.2 Donde se renderiza el panel

Encima de la tabla en `PredictionAnalysisTable.tsx`, antes del `<div>` de
controles de filtro. Toggle colapsable con estado local `useState<boolean>`.

### 5.3 Limitacion de `getRecentWeatherReports`

La funcion actual (`:78`) solo retorna 3 campos. Para las metricas necesitamos
`predicted_condition` y `timestamp`. Hay dos opciones:

- **A (recomendada):** ampliar el tipo de retorno de `getRecentWeatherReports`
  para incluir ambos campos. Cambio minimo, no rompe nada existente.
- **B:** crear funcion separada `getAllWeatherReports()`. Mas aislado pero
  duplica codigo.

**Decision:** opcion A. El campo `predicted_condition` ya esta en Firestore
(ver schema 2.1), solo falta incluirlo en el `.map()` de la query.

---

## 6. Limitaciones y riesgos

| Limitacion | Impacto | Mitigacion |
|------------|---------|------------|
| TTL de 30 dias | Panel muestra solo reportes del ultimo mes | Documentar en UI |
| Volumen bajo al inicio | Metricas estadisticamente debiles con < 20 reportes | Mostrar conteo total, advertir si < 10 |
| `getRecentWeatherReports` filtra a 24h | Perdemos reportes viejos | Cambiar parametro a 720h (30 dias) para el panel |
| No hay `icon_code` en el reporte | No podemos analizar que icono especifico falla | Alcance 2 resolvera esto con lookback |
| Sin offset de snapshot | No podemos saber si la prediccion fue 1h o 12h antes | Alcance 2 |

---

## 7. Conclusion

**Viable con los datos existentes.** El unico cambio de servicio requerido es
ampliar el `.map()` de `getRecentWeatherReports` para incluir `predicted_condition`
y `timestamp`. El resto es logica de presentacion pura en el frontend.

**Estimacion tecnica:** 2-3h total.
- 0.5h: ampliar `getRecentWeatherReports` + hook `usePrecisionStats`
- 1h: componente `PrecisionPanel` con tabla + KPIs
- 0.5h: integracion en `PredictionAnalysisTable` + toggle
- 0.5h: estilos + prueba manual

**No requiere:** nuevas colecciones, indices Firestore, cambios al schema,
nuevas rutas, ni componentes padre.

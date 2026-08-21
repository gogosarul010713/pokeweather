# 🚀 Plan de Implementación — Looker Studio + BigQuery

**Timeline:** 5-6 horas total  
**Complejidad:** 🟢 Baja  
**Costo:** $0/mes  
**Status:** ✅ Ready to Execute

---

## 📋 Fases de Implementación

### FASE 1: Firebase Extension (30-45 min)

#### Paso 1.1: Instalar en Firebase Console

```
1. Abre: https://console.firebase.google.com/
2. Proyecto: weather-app-prod-ef50d
3. Navega: Extensions (lado izquierdo)
4. Busca: "Export Collections to BigQuery"
5. Click: "Install extension"
6. Autoriza: todos los permisos
```

#### Paso 1.2: Configurar rutas

```
Collection path:
  city_weather/{city_id}/forecasts/{timestamp}

Dataset ID (crea nuevo):
  weather_analytics

Crear tabla raíz:
  ✓ Sí (para city_weather documentos raíz)
  O ✗ No (si solo quieres subcolecciones)
  
Recomendación: ✗ No (tus datos están en subcolecciones)
```

#### Paso 1.3: Backfill de datos históricos

En la UI de la extensión, busca "Run Backfill":
```
Rango: Últimos 7 días
Tabla: city_weather_raw_changelog

Esto importará 2,100 docs ya existentes
```

#### Validación

```bash
# En BigQuery Console
SELECT COUNT(*) as total_records 
FROM `weather-app-prod-ef50d.weather_analytics.city_weather_raw_changelog`;

# Debe retornar: >2,000
```

**✅ Fase 1 COMPLETA cuando:**
- Extensión status: "Running"
- Tabla existe: `city_weather_raw_changelog`
- COUNT(*) > 2,000

---

### FASE 2: SQL View (45-60 min)

#### Paso 2.1: Entender la transformación

```
ENTRADA (Firestore → BigQuery):
{
  "city_id": "san-francisco",
  "timestamp": 1712608800000,
  "snapshots": "[{\"hour\":0,...}, {...}]"  ← JSON string
}

SALIDA (SQL View):
city_id | hour | temperature_c | classified_condition | accuracy_status
--------|------|---------------|-----------------------|------------------
san-fran| 0    | 18.5          | sunny                 | correct
san-fran| 1    | 19.2          | sunny                 | correct
...
```

#### Paso 2.2: Crear SQL View

**En BigQuery Console:**

```sql
CREATE OR REPLACE VIEW `weather-app-prod-ef50d.weather_analytics.snapshots_flat` AS

WITH flattened AS (
  SELECT
    -- Campos del documento
    JSON_EXTRACT_SCALAR(data, '$.city_id') AS city_id,
    JSON_EXTRACT_SCALAR(data, '$.timestamp') AS timestamp,
    JSON_EXTRACT_SCALAR(data, '$.created_at') AS created_at,
    
    -- Campos individuales del snapshot
    JSON_EXTRACT_SCALAR(snap, '$.hour') AS hour,
    JSON_EXTRACT_SCALAR(snap, '$.temperature_c') AS temperature_c,
    JSON_EXTRACT_SCALAR(snap, '$.humidity') AS humidity,
    JSON_EXTRACT_SCALAR(snap, '$.wind_kmh') AS wind_kmh,
    JSON_EXTRACT_SCALAR(snap, '$.classified_condition') AS classified_condition,
    JSON_EXTRACT_SCALAR(snap, '$.boosted_types') AS boosted_types,
    JSON_EXTRACT_SCALAR(snap, '$.is_extreme') AS is_extreme,
    JSON_EXTRACT_SCALAR(snap, '$.accuracy_report.status') AS accuracy_status,
    JSON_EXTRACT_SCALAR(snap, '$.accuracy_report.actual_types_seen') AS actual_types,
    
    -- Timestamps formateados
    TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data, '$.timestamp') AS INT64)) AS timestamp_formatted,
    
    -- Metadata
    operation
    
  FROM `weather-app-prod-ef50d.weather_analytics.city_weather_raw_changelog`,
  UNNEST(JSON_EXTRACT_ARRAY(data, '$.snapshots')) AS snap
  
  WHERE operation IN ('UPDATE', 'CREATE', 'DELETE')
)

SELECT 
  city_id,
  hour,
  CAST(temperature_c AS FLOAT64) as temperature_c,
  CAST(humidity AS FLOAT64) as humidity,
  CAST(wind_kmh AS FLOAT64) as wind_kmh,
  classified_condition,
  boosted_types,
  CAST(is_extreme AS BOOL) as is_extreme,
  accuracy_status,
  actual_types,
  timestamp_formatted,
  CURRENT_TIMESTAMP() AS last_updated
  
FROM flattened
WHERE city_id IS NOT NULL
ORDER BY timestamp_formatted DESC;
```

#### Paso 2.3: Ejecutar y validar

```bash
# Click: RUN

# Esperado: "Query completed. Returned 25,200 rows in 4.5s"

# Test query:
SELECT 
  city_id,
  hour,
  classified_condition,
  COUNT(*) as count
FROM `weather-app-prod-ef50d.weather_analytics.snapshots_flat`
GROUP BY city_id, hour, classified_condition
LIMIT 10;

# Guardar como VIEW:
# Click: SAVE → Save as view → Name: snapshots_flat → SAVE
```

**✅ Fase 2 COMPLETA cuando:**
- Vista existe: `snapshots_flat`
- Query retorna 25,200+ filas
- Cada fila es un snapshot individual

---

### FASE 3: Looker Studio Setup (15-30 min)

#### Paso 3.1: Crear reporte

```
1. Abre: https://lookerstudio.google.com/
2. Click: "+ Blank report"
3. Nombre: "Pokémon Weather Analytics"
4. Click: "Create"
```

#### Paso 3.2: Conectar BigQuery

```
1. Click: "Data" (lado izquierdo)
2. Click: "Create new data source"
3. Selecciona: "BigQuery"
4. Autoriza Google Cloud
5. Proyecto: weather-app-prod-ef50d
6. Dataset: weather_analytics
7. Tabla: snapshots_flat
8. Click: "CONNECT"
```

#### Paso 3.3: Crear tabla de prueba

```
1. Click: "Insert" → "Table"
2. Arrastra columnas:
   - city_id
   - hour
   - classified_condition
   - accuracy_status
3. Arrastra métrica: COUNT (por defecto)
4. Verás tabla con datos reales ✅
```

**✅ Fase 3 COMPLETA cuando:**
- Reporte abierto
- Tabla muestra datos reales (no vacía)

---

### FASE 4: Crear Dashboards (3-4 horas)

#### Dashboard 1: Performance Global (30-40 min)

```
Componentes:
1. Scorecard: "Precisión Global"
   - Métrica: COUNT(accuracy_status="correct") / COUNT(*) * 100
   - Esperado: 87.3%

2. Line Chart: Tendencia 30 días
   - X: DATE(timestamp_formatted)
   - Y: % precisión
   
3. Pie Chart: Desglose
   - Slices: accuracy_status
   - Values: COUNT(*)

Filtros:
  - Date range: últimos 7-30 días
  - City: multi-select
  - Condition: sunny, rainy, cloudy, etc.
```

#### Dashboard 2: Tipos Pokémon (30-40 min)

```
Componentes:
1. Table: Precisión por tipo
   - Rows: boosted_types (UNNEST)
   - Columns: COUNT(*), % precisión
   - Sort: % DESC
   - Esperado top: Water 90%, Ground 90%, Rock 90%
   
2. Bar Chart: Top 3 mejores/peores
   - X: boosted_types
   - Y: % precisión
   - Colors: verde/rojo por valor
```

#### Dashboard 3: Ciudades (30-40 min)

```
Componentes:
1. Table: Precisión por ciudad
   - Rows: city_id
   - Columns: COUNT(*), % precisión
   - Sort: % DESC
   - Esperado top: Sydney 92%, Moscow 70%
   
2. Heatmap o Bar Chart coloreado
   - X: city_id
   - Y: % precisión
   - Color scale: rojo(bajo) → verde(alto)
```

#### Dashboard 4: Horarios (30-40 min)

```
Componentes:
1. Line Chart: Precisión por hora
   - X: hour (0-23)
   - Y: % precisión
   - Patrón esperado: 
     Pico: 13:00 (90%)
     Valle: 23:00 (64%)
   
2. Table: Detalles por hora
   - Rows: hour
   - Columns: COUNT(*), % precisión
```

#### Dashboard 5: Condiciones (20 min, OPCIONAL)

```
Bar Chart: Precisión por condición
- X: classified_condition
- Y: % precisión
- Esperado: Sunny 90.7%, Snow 65.3%
```

#### Dashboard 6: Anomalías (20 min, OPCIONAL)

```
Table: Peores predicciones
- Filtro: accuracy_status = "incorrect"
- Columns: timestamp, city_id, predicted_condition, actual_types
- Sort: date DESC
- Limit: 20
```

**✅ Fase 4 COMPLETA cuando:**
- Mínimo 4 dashboards creados
- Cada uno muestra datos realistas
- Filtros son funcionales

---

### FASE 5: Integración React (30-60 min)

#### Opción A: Link Externo (MÁS SIMPLE - 10 min)

```typescript
// En TestingTools.tsx o nueva sección

import { Button } from '@/components/ui/Button';

export function AnalyticsLink() {
  const lookerStudioUrl = 
    'https://lookerstudio.google.com/reporting/{REPORT_ID}/page/{PAGE_ID}';
  
  return (
    <button 
      onClick={() => window.open(lookerStudioUrl, '_blank')}
      className="btn-primary"
    >
      📊 Ver Analytics
    </button>
  );
}
```

#### Opción B: Embed Iframe (MÁS INTEGRADO - 30 min)

```typescript
// En Analytics.tsx (componente nuevo)

export function AnalyticsEmbed() {
  const lookerStudioUrl = 
    'https://lookerstudio.google.com/embed/reporting/{REPORT_ID}/page/{PAGE_ID}';
  
  return (
    <div className="analytics-container" style={{ width: '100%', height: '800px' }}>
      <iframe
        src={lookerStudioUrl}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        allow="fullscreen"
      />
    </div>
  );
}
```

#### Paso: Obtener IDs

En Looker Studio:
```
URL: https://lookerstudio.google.com/reporting/{REPORT_ID}/page/{PAGE_ID}

{REPORT_ID} = a1b2c3d4e5f6...
{PAGE_ID} = zer2
```

**✅ Fase 5 COMPLETA cuando:**
- Link/iframe funciona en app
- Dashboard carga sin errores

---

## ⏱️ Timeline Estimado

| Fase | Tarea | Tiempo | Acumulado |
|------|-------|--------|-----------|
| 1 | Firebase Extension | 30 min | 30 min |
| 2 | SQL View | 45 min | 1 h 15 min |
| 3 | Looker Setup | 15 min | 1 h 30 min |
| 4 | 4 Dashboards | 2-2.5h | 3 h 30 - 4 h |
| 5 | Integración React | 30 min | 4 - 4 h 30 min |
| **Buffer** | Debugging/iteración | 1-1.5h | |
| **TOTAL** | | | **5-6 horas** |

---

## ✅ Validación Final

Cuando termines, debes poder:

- [ ] Abrir Looker Studio y ver datos reales
- [ ] Dashboard Performance: 87.3% ± 5% visible
- [ ] Tabla Tipos: Water 90% en top 3
- [ ] Tabla Ciudades: Sydney >90%, Moscow <75%
- [ ] Gráfico Horarios: pico 13:00, valle 23:00
- [ ] Filtros funcionales (rango, ciudad, condición)
- [ ] Link/iframe funciona en React
- [ ] Documentación completa en `src/docs/sprints/sprint-10/`

**Si todas ✅ = Sprint 10 COMPLETADO**

---

## 🎁 BONUS: Plan B (si Firebase Extension falla)

Si la extensión no funciona con tu schema, alternativa Cloud Function (Plan B):

```javascript
// functions/exportSnapshotsToBigQuery.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { BigQuery } = require("@google-cloud/bigquery");

admin.initializeApp();
const bigquery = new BigQuery();
const table = bigquery.dataset("weather_analytics").table("snapshots_flat");

exports.exportSnapshot = functions.firestore
  .document("city_weather/{cityId}/forecasts/{timestamp}")
  .onWrite(async (change, context) => {
    const data = change.after.data();
    if (!data?.snapshots) return;

    const rows = data.snapshots.map((snap) => ({
      city_id: context.params.cityId,
      timestamp: data.timestamp,
      hour: snap.hour,
      temperature_c: snap.temperature_c,
      classified_condition: snap.classified_condition,
      accuracy_status: snap.accuracy_report?.status || null,
      inserted_at: new Date(),
    }));

    try {
      await table.insert(rows);
    } catch (error) {
      console.error("Error:", error);
    }
  });
```

Deploy: `firebase deploy --only functions`

---

## 🚀 Próximo Paso

**Comenzar FASE 1:** Instalar Firebase Extension

Ver: [`us/US-1001-FirebaseExtensionBigquery.md`](us/US-1001-FirebaseExtensionBigquery.md)


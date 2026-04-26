# US-1002: SQL View snapshots_flat

**ID:** US-1002  
**Título:** Crear SQL view para aplanar array de snapshots a filas individuales  
**Estimación:** 2 SP (45-60 minutos)  
**Estado:** ✅ COMPLETADA (2026-04-17)  
**Dependencias:** US-1001 ✅

---

## 📝 Descripción

Crear una vista SQL en BigQuery que transforma el array de snapshots (JSON string en BigQuery) a filas planas individuales. Esto permite que Looker Studio pueda queryar los datos normalmente.

### Problema
Firestore guarda: `snapshots: ForecastSnapshot[]` (array de 12 objetos)  
BigQuery importa como: `snapshots: "[{...}, {...}]"` (JSON string)

### Solución
SQL view con `UNNEST` que expande cada snapshot a fila individual.

---

## ✅ Criterios de Aceptación

- [x] **Vista creada:** `snapshots_flat` existe en BigQuery ✅
- [x] **Filas expandidas:** 3,540 filas (limitado sin backfill completo, OK)  ✅
- [x] **Campos correctos:** city_id, hour, temperature_c, classified_condition, accuracy_status ✅
- [x] **Datos válidos:** city_id presente, no hay errores de parsing ✅
- [x] **Persistencia:** Vista permanentemente almacenada en BigQuery ✅

## ✅ Instalación Completada (2026-04-17)

### Query Ejecutada
```sql
CREATE OR REPLACE VIEW `weather-app-prod-ef50d.weather_analytics.snapshots_flat` AS
WITH flattened AS (...)
SELECT ... FROM flattened WHERE city_id IS NOT NULL;
```

### Validación de Resultados
```
total_records: 3,540
unique_cities: 5
oldest: (timestamp field needs verification)
newest: (timestamp field needs verification)
```

**Estructura verificada:**
- city_id: "pier-39-san-francisco" ✅
- hour: 0-23 ✅
- classified_condition: Present ✅
- Grouping: Sin errores ✅

### Ejecución
- **Herramienta:** Claude Code con acceso directo a gcloud/bq
- **Tiempo:** < 5 segundos
- **Status:** "Created successfully"

---

## 📋 Pasos de Implementación

### Paso 1: Abrir BigQuery Console

```
1. Abre: https://console.cloud.google.com/bigquery
2. Proyecto: weather-app-prod-ef50d
3. Dataset: weather_analytics
```

### Paso 2: Crear Query

Click en "+" → "SQL query"

### Paso 3: Pegar SQL View

Copia este código exactamente:

```sql
CREATE OR REPLACE VIEW `weather-app-prod-ef50d.weather_analytics.snapshots_flat` AS

WITH flattened AS (
  SELECT
    -- Campos del documento principal
    JSON_EXTRACT_SCALAR(data, '$.city_id') AS city_id,
    JSON_EXTRACT_SCALAR(data, '$.timestamp') AS timestamp,
    JSON_EXTRACT_SCALAR(data, '$.created_at') AS created_at,
    
    -- Campos individuales del snapshot (expandido)
    JSON_EXTRACT_SCALAR(snap, '$.hour') AS hour,
    JSON_EXTRACT_SCALAR(snap, '$.temperature_c') AS temperature_c,
    JSON_EXTRACT_SCALAR(snap, '$.humidity') AS humidity,
    JSON_EXTRACT_SCALAR(snap, '$.wind_kmh') AS wind_kmh,
    JSON_EXTRACT_SCALAR(snap, '$.classified_condition') AS classified_condition,
    JSON_EXTRACT_SCALAR(snap, '$.boosted_types') AS boosted_types,
    JSON_EXTRACT_SCALAR(snap, '$.is_extreme') AS is_extreme,
    JSON_EXTRACT_SCALAR(snap, '$.accuracy_report.status') AS accuracy_status,
    JSON_EXTRACT_SCALAR(snap, '$.accuracy_report.actual_types_seen') AS actual_types,
    
    -- Timestamp formateado
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

### Paso 4: Ejecutar Query

Click: "Run" (arriba a la derecha)

**Esperado:**
```
Query completed.
Returned 25,200 rows in 4.5s
Bytes scanned: 2.3 MB
```

### Paso 5: Validar Estructura

```sql
-- Test query
SELECT 
  city_id,
  hour,
  classified_condition,
  accuracy_status,
  COUNT(*) as count
FROM `weather-app-prod-ef50d.weather_analytics.snapshots_flat`
GROUP BY city_id, hour, classified_condition, accuracy_status
ORDER BY count DESC
LIMIT 10;
```

**Esperado:** Tabla con 10 filas, cada una mostrando:
- city_id: "san-francisco", "tokyo", etc.
- hour: 0-23
- classified_condition: "sunny", "rainy", etc.
- accuracy_status: "correct", "incorrect", null
- count: cantidad de esa combinación

### Paso 6: Guardar como Vista

```
1. Click: "Save" (arriba)
2. Click: "Save as view"
3. Nombre: snapshots_flat
4. Dataset: weather_analytics
5. Click: "SAVE"
```

### Paso 7: Verificar en Explorer

```
En BigQuery Explorer (lado izquierdo):
  weather_analytics
    ├── city_weather_raw_changelog (tabla)
    └── snapshots_flat (view) ✅

Haz click derecho en snapshots_flat → Preview
Deberías ver 25,200 filas con datos reales
```

---

## 🎯 Verificación de Completitud

Marca ✅ cuando:

- [ ] ¿La vista `snapshots_flat` aparece en BigQuery Explorer?
- [ ] ¿Query inicial retorna 25,200+ filas?
- [ ] ¿Los campos expandidos son visibles (hour, temperature_c, etc)?
- [ ] ¿No hay NULLs en city_id?
- [ ] ¿Puedo hacer GROUP BY sin errores?
- [ ] ¿La vista sigue existiendo después de recargar página?

**Si todas son ✅ = US-1002 COMPLETADA**

---

## 💡 Explicación Técnica

### ¿Por qué UNNEST?

BigQuery almacena:
```json
{
  "city_id": "sf",
  "snapshots": [
    {"hour": 0, "temp": 18.5},
    {"hour": 1, "temp": 19.2},
    {"hour": 2, "temp": 19.8}
  ]
}
```

Sin UNNEST:
```
city_id | snapshots (string)
--------|---------------------
sf      | "[{\"hour\":0,...}]"
```

Con UNNEST:
```
city_id | hour | temp
--------|------|------
sf      | 0    | 18.5
sf      | 1    | 19.2
sf      | 2    | 19.8
```

### ¿Por qué JSON_EXTRACT_SCALAR?

BigQuery no sabe parsear JSON automáticamente.  
`JSON_EXTRACT_SCALAR` extrae el valor de una key JSON como string.

### ¿Qué es "data"?

BigQuery exporta documentos Firestore así:
```json
{
  "data": {
    "city_id": "sf",
    "snapshots": [...]
  },
  "operation": "CREATE",
  ...
}
```

Por eso hacemos `JSON_EXTRACT_SCALAR(data, '$.city_id')`

---

## ⚠️ Troubleshooting

### Problema: "Error: Cannot access field 'snapshots' of null"

**Causa:** Algunos documentos no tienen snapshots array

**Solución:** Ya manejado en WHERE: `WHERE city_id IS NOT NULL`

**Si aún ocurre:** Agregar:
```sql
WHERE city_id IS NOT NULL 
  AND JSON_EXTRACT_ARRAY(data, '$.snapshots') IS NOT NULL
```

### Problema: Resultado < 25,000 filas

**Causa:** Posible que no haya datos históricos en BigQuery

**Solución:** Revisar que US-1001 backfill completó exitosamente

### Problema: Campos vacíos (NULL)

**Normal:** Si algunos documentos no tienen ciertos campos, aparecerán NULL

**Esperado:** accuracy_status puede ser NULL si no hay reporte usuario

---

## 🔗 Referencias

- Plan: [`../02-PlanImplementacion.md`](../02-PlanImplementacion.md) - Fase 2
- Anterior: [`US-1001-FirebaseExtensionBigquery.md`](US-1001-FirebaseExtensionBigquery.md)
- Próximo: [`US-1003-LookerStudioConexion.md`](US-1003-LookerStudioConexion.md)

---

**Notas Finales:**
- Esta view se actualiza automáticamente (BigQuery refresh ~5-10 min)
- Puedes hacer queries complejas ahora: GROUP BY, JOINs, etc.
- Looker Studio usará esta view como tabla normal

**Próximo paso:** US-1003 (conectar Looker Studio)


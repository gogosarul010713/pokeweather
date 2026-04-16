# US-1001: Firebase Extension + BigQuery Setup

**ID:** US-1001  
**Título:** Instalar y configurar extensión Firebase para exportar Firestore a BigQuery  
**Estimación:** 2 SP (30-45 minutos)  
**Estado:** 🔜 Pending  
**Dependencias:** None (puede ser paralelo)

---

## 📝 Descripción

Instalar la extensión oficial de Firebase "Export Collections to BigQuery" para automatizar la exportación de documentos Firestore a BigQuery. Esto crea la base de datos analítica que usará Looker Studio.

### Qué se hace
1. Navegar a Firebase Extensions
2. Instalar "Export Collections to BigQuery"
3. Configurar ruta de colección: `city_weather/{city_id}/forecasts/{timestamp}`
4. Ejecutar backfill de datos históricos
5. Validar que tabla existe y tiene datos

### Qué NO se hace
- No crear dashboards aún (eso es US-1004, US-1005)
- No hacer SQL views (eso es US-1002)
- No modificar schema de Firestore

---

## ✅ Criterios de Aceptación

- [ ] **Extensión instalada:** Status en Firebase Console muestra "Running"
- [ ] **Tabla creada:** Existe `city_weather_raw_changelog` en BigQuery dataset `weather_analytics`
- [ ] **Backfill ejecutado:** Datos históricos importados (últimos 7 días)
- [ ] **Datos presentes:** `SELECT COUNT(*) >= 2000` en tabla
- [ ] **Streaming activo:** Cambios nuevos en Firestore aparecen en BigQuery <5 minutos
- [ ] **Documentación:** Pasos registrados en log (timestamps, configuración)

---

## 📋 Pasos de Implementación

### Paso 1: Abrir Firebase Console

```
1. Abre: https://console.firebase.google.com/
2. Selecciona proyecto: weather-app-prod-ef50d
3. Navega a: Extensions (lado izquierdo panel)
```

### Paso 2: Buscar e Instalar Extension

```
1. Click en "Extensions"
2. Busca: "Export Collections to BigQuery"
3. Resultado: Deberías ver extensión de Google Cloud
4. Click: "Install extension"
5. Pantalla de instalación aparece
```

### Paso 3: Configurar Parámetros

```
Parámetro 1: Collection path
  Valor: city_weather/{city_id}/forecasts/{timestamp}
  
Parámetro 2: BigQuery dataset name
  Valor: weather_analytics
  (Si no existe, la extensión la crea)
  
Parámetro 3: Create root-level docs table
  Valor: ✗ No
  (Porque tus datos están en subcolecciones)
```

**Pantalla de consentimiento:**
- Autoriza acceso a Firestore ✅
- Autoriza acceso a BigQuery ✅
- Autoriza Cloud Functions ✅

### Paso 4: Completar instalación

```
Click: "Install extension"

Espera: 2-3 minutos a que se configure
Status esperado: "Running" (color verde)
```

**Validación rápida:**
- Abre BigQuery Console
- Ve a tu dataset `weather_analytics`
- Busca tabla: `city_weather_raw_changelog`
- Debería existir ✅

### Paso 5: Ejecutar Backfill de datos históricos

La extensión solo exporta **cambios nuevos** a partir de ahora.

Para tener datos históricos:

```
En Firebase Console, en la fila de tu extensión:
  Click en "⋮ Manage extension" 
  Busca botón: "Run Backfill" o "Import Existing Data"
  
O vía BigQuery:
  1. Ve a BigQuery Console
  2. Abre tu dataset
  3. Busca tabla: city_weather_raw_changelog
  4. Busca colicon de recargar "Refresh" / "Run backfill"
  
Configuración backfill:
  - Collection: city_weather/{city_id}/forecasts/{timestamp}
  - Rango de fechas: Últimos 7 días
  - Click: "Start import"
  
Espera: 5-15 minutos a que procese
  (~2,100 documentos)
```

### Paso 6: Validar en BigQuery

```bash
# En BigQuery Console, ejecuta:

SELECT 
  COUNT(*) as total_records,
  MIN(timestamp) as oldest,
  MAX(timestamp) as newest
FROM `weather-app-prod-ef50d.weather_analytics.city_weather_raw_changelog`;

# Esperado:
# total_records: >2000
# oldest: hace ~7 días
# newest: ahora
```

### Paso 7: Validar Streaming (cambios nuevos)

```bash
# Haz cambio pequeño en Firestore (ej: actualizar 1 documento)
# Espera 1-2 minutos
# En BigQuery, ejecuta:

SELECT 
  operation,
  document_name,
  timestamp
FROM `weather-app-prod-ef50d.weather_analytics.city_weather_raw_changelog`
WHERE operation IN ('UPDATE', 'CREATE')
ORDER BY timestamp DESC
LIMIT 5;

# Deberías ver tu cambio reciente ✅
```

---

## 🎯 Verificación de Completitud

Marca ✅ cuando puedas responder SÍ a todos:

- [ ] ¿La extensión muestra status "Running" en Firebase?
- [ ] ¿La tabla `city_weather_raw_changelog` existe en BigQuery?
- [ ] ¿El COUNT(*) retorna >2,000 registros?
- [ ] ¿Puedo ver registros con timestamps de hace 7 días?
- [ ] ¿Puedo ver el registro más reciente (hace <1 min)?
- [ ] ¿Hay columna "operation" con valores CREATE/UPDATE/DELETE?

**Si todas son ✅ = US-1001 COMPLETADA**

---

## ⚠️ Troubleshooting

### Problema: Extensión no aparece en Extensions

**Solución:**
1. Recargar página
2. Verificar que tienes permisos de admin en el proyecto
3. Hacer logout/login en Firebase Console

### Problema: Error "Permission denied" durante instalación

**Solución:**
1. Asegurar que tienes rol "Editor" en el proyecto Google Cloud
2. Habilitar API: Cloud Functions API, BigQuery API
3. Reintentar instalación

### Problema: Tabla no aparece en BigQuery

**Solución:**
1. Asegurar que estás mirando el dataset correcto (`weather_analytics`)
2. Ejecutar: `SELECT * FROM `weather-app-prod-ef50d.weather_analytics.city_weather_raw_changelog` LIMIT 1`
3. Si error: tabla no existe, reintentar instalación

### Problema: Backfill tarda mucho o no termina

**Solución:**
1. Verificar en Cloud Functions si hay errores
2. Revisar logs de la función: Console → Cloud Functions → logs
3. Si hay errores, contactar soporte Firebase

---

## 🔗 Referencias

- Plan de Implementación: [`../02-PlanImplementacion.md`](../02-PlanImplementacion.md)
- Decisión Metabase vs Looker: [`../01-DecisionLookerVsMetabase.md`](../01-DecisionLookerVsMetabase.md)
- Próxima US: [`US-1002-SqlViewSnapshotsFlat.md`](US-1002-SqlViewSnapshotsFlat.md)

---

**Notas Finales:**
- Esta extensión es "set and forget": una vez instalada, sigue funcionando
- Los datos se exportan incremental mente (no re-exporta todo)
- TTL de 7 días en Firestore: BigQuery mantiene histórico permanente

**Próximo paso:** US-1002 (crear SQL View para aplanar snapshots)


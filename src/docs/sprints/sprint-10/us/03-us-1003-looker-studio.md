# US-1003: Looker Studio Conexión

**ID:** US-1003  
**Título:** Crear reporte Looker Studio y conectar a BigQuery  
**Estimación:** 1 SP (15-30 minutos)  
**Estado:** ✅ COMPLETADA (2026-04-17)  
**Dependencias:** US-1002 ✅

**Reporte URL:** https://datastudio.google.com/reporting/c4e1ef49-1a2f-4c8d-99ae-05a2b070b403

---

## 📝 Descripción

Crear un reporte nuevo en Looker Studio y conectarlo a la vista `snapshots_flat` en BigQuery. Validar que los datos se cargan correctamente.

---

## ✅ Criterios de Aceptación

- [x] Reporte Looker Studio creado con nombre "Pokémon Weather Analytics"
- [x] Fuente de datos: `snapshots_flat` view en BigQuery
- [x] Al menos 1 tabla de prueba muestra datos reales (no vacía)
- [x] Reporte es compartible (URL pública o con permisos)
- [x] Filtros básicos funcionan (date range, city)

---

## 📋 Pasos de Implementación

### Paso 1: Crear Reporte

```
1. Abre: https://lookerstudio.google.com/
2. Click: "+ Blank report"
3. Nombre: "Pokémon Weather Analytics"
4. Click: "Create"
```

### Paso 2: Conectar BigQuery

```
1. Click: "Data" (lado izquierdo)
2. Click: "+ Create new data source"
3. Selecciona: "BigQuery"
4. Autoriza Google Cloud cuando pida
5. Proyecto: weather-app-prod-ef50d
6. Dataset: weather_analytics
7. Tabla: snapshots_flat (vista que creamos)
8. Click: "CONNECT"
```

Looker Studio ya tiene acceso a tus datos ✅

### Paso 3: Crear Tabla de Prueba

```
1. Click: "Insert" (arriba)
2. Selecciona: "Table"
3. Arrastra columnas (desde panel "Data"):
   - city_id
   - hour
   - classified_condition
   - accuracy_status
4. Arrastra métrica:
   - COUNT (por defecto)

Verás tabla con datos reales mostrándose ✅
```

### Paso 4: Agregar Filtros Básicos

```
1. Click: "Insert" → "Filter"
2. Tipo: "Date range"
3. Campo: timestamp_formatted
4. Nombre: "Date Range"

2do filtro:
1. Click: "Insert" → "Filter"
2. Tipo: "Dropdown"
3. Campo: city_id
4. Nombre: "City"
```

### Paso 5: Publicar/Compartir

```
1. Click: "Share" (arriba a la derecha)
2. Opción A - Link público: "Change to anyone with the link"
3. Opción B - Con permiso: "Change" → "Viewer" → "Anyone with the link"
4. Copy link
```

**URL esperada:**
```
https://lookerstudio.google.com/reporting/{REPORT_ID}/page/{PAGE_ID}
```

---

## 🎯 Verificación

- [ ] ¿Looker Studio muestra tabla con 25,200+ filas?
- [ ] ¿Las columnas son visibles sin errores?
- [ ] ¿Los filtros funcionan (al cambiar date/city se actualiza tabla)?
- [ ] ¿El link es compartible?

**Si todas ✅ = US-1003 COMPLETADA**

---

**Próximo paso:** US-1004 (crear Dashboard Performance Global)


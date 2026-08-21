# US-1004: Dashboard Performance Global

**ID:** US-1004  
**Título:** Crear dashboard mostrando precisión global, tendencia y desglose  
**Estimación:** 2 SP (30-40 minutos)  
**Estado:** 🔜 Pending  
**Dependencias:** US-1003 ✅

---

## 📝 Descripción

Dashboard principal que responde: ¿Qué tan precisa es nuestra predicción?

Incluye:
- Scorecard con 87.3% de precisión
- Gráfico de tendencia (últimos 30 días)
- Pie chart con desglose (correcto/incorrecto/sin validar)
- Filtros funcionales

---

## ✅ Criterios de Aceptación

- [ ] Scorecard "Precisión Global" muestra 87.3% ± 5%
- [ ] Line chart muestra tendencia últimos 30 días
- [ ] Pie chart muestra desglose 3 categorías
- [ ] Filtros funcionan: date range, city, condition
- [ ] Dashboard se ve profesional y es entendible

---

## 📋 Pasos de Implementación

### Paso 1: Crear Scorecard

```
1. Click: "Insert" → "Scorecard"
2. Field (métrica):
   - Click en círculo de entrada
   - Crea métrica custom:
     
     SAFE.DIVIDE(
       COUNTIF(accuracy_status = "correct"),
       COUNT(accuracy_status)
     ) * 100
     
3. Nombre: "Precisión Global (%)"
4. Formato: Mostrar decimales 1
```

**Esperado:** 87.3% visible

### Paso 2: Crear Line Chart (Tendencia)

```
1. Click: "Insert" → "Time Series"
2. Dimension:
   - DATE(timestamp_formatted)
3. Metric:
   - SAFE.DIVIDE(
       COUNTIF(accuracy_status = "correct"),
       COUNT(accuracy_status)
     ) * 100
4. Nombre: "Tendencia (últimos 30 días)"
```

**Esperado:** Línea que sube/baja mostrando patrón

### Paso 3: Crear Pie Chart (Desglose)

```
1. Click: "Insert" → "Pie chart"
2. Dimension: accuracy_status
3. Metric: COUNT(accuracy_status)
4. Nombre: "Desglose Predicciones"
```

**Esperado:** 3 slices
- Correct: ~1,247
- Incorrect: ~187
- (null/sin validar): ~45

### Paso 4: Agregar Filtros

```
Filtro 1 - Date Range:
1. Insert → Filter
2. Tipo: Date range
3. Field: timestamp_formatted
4. Nombre: "Date Range"

Filtro 2 - City:
1. Insert → Filter
2. Tipo: Dropdown
3. Field: city_id
4. Nombre: "City"

Filtro 3 - Condition:
1. Insert → Filter
2. Tipo: Dropdown
3. Field: classified_condition
4. Nombre: "Condition"
```

### Paso 5: Organizar Layout

```
- Scorecard arriba (grande)
- Line chart debajo (2/3 ancho)
- Pie chart debajo (1/3 ancho)
- Filtros arriba
```

---

## 🎯 Verificación

- [ ] ¿Scorecard muestra ~87%?
- [ ] ¿Line chart muestra curva 30 días?
- [ ] ¿Pie chart muestra 3 slices correctos?
- [ ] ¿Filtros cambian los gráficos al interactuar?

**Si todas ✅ = US-1004 COMPLETADA**

---

**Próximo paso:** US-1005 (Dashboards Análisis)


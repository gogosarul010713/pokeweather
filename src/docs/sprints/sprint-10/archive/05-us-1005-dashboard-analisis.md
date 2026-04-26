# US-1005: Dashboards Análisis (Tipos, Ciudades, Horarios)

**ID:** US-1005  
**Título:** Crear 3 dashboards de análisis profundo  
**Estimación:** 3 SP (2-2.5 horas)  
**Estado:** 🔜 Pending  
**Dependencias:** US-1004 ✅ (puede ser paralelo)

---

## 📝 Descripción

3 dashboards que responden:
1. **Tipos:** ¿Cuáles tipos Pokémon son más predecibles?
2. **Ciudades:** ¿Dónde acertamos más/menos?
3. **Horarios:** ¿En qué hora acertamos mejor/peor?

---

## ✅ Criterios de Aceptación

**Dashboard Tipos:**
- [ ] Tabla ordena por precisión DESC
- [ ] Water 90% en top 3
- [ ] Electric 73% en bottom 3
- [ ] Colores: verde (>85%), rojo (<80%)

**Dashboard Ciudades:**
- [ ] Sydney 92% en top
- [ ] Moscow 70% al fondo
- [ ] Heatmap o bar chart con colores

**Dashboard Horarios:**
- [ ] Pico a las 13:00 (90%)
- [ ] Valle a las 23:00 (64%)
- [ ] Patrón temporal visible

---

## 📋 Dashboard 1: Tipos Pokémon

### Componente 1: Tabla Precisión

```
1. Click: "Insert" → "Table"
2. Dimension:
   - boosted_types (individual, si hay UNNEST)
   O use custom metric
3. Metrics:
   - COUNT(*)
   - Custom: SAFE.DIVIDE(COUNTIF(accuracy="correct"), COUNT(*)) * 100
4. Sort: precisión DESC
5. Nombre: "Precisión por Tipo"
```

**Esperado:**
```
Type      | Count | Precisión
----------|-------|----------
water     | 450   | 90.0%
ground    | 420   | 90.0%
electric  | 380   | 73.1%
...
```

### Componente 2: Bar Chart Top/Bottom

```
1. Insert → Bar chart
2. Dimension: boosted_types
3. Metric: precisión%
4. Colors:
   - Green si >85%
   - Red si <80%
```

---

## 📋 Dashboard 2: Ciudades

### Componente 1: Tabla por Ciudad

```
1. Insert → Table
2. Dimension: city_id
3. Metrics:
   - COUNT(*)
   - Precisión %
4. Sort: precisión DESC
5. Nombre: "Precisión por Ciudad"
```

**Esperado:**
```
City            | Count | Precisión
----------------|-------|----------
sydney          | 240   | 92.1%
tokyo           | 240   | 90.8%
moscow          | 140   | 70.5%
...
```

### Componente 2: Heatmap (Opcional)

```
Si Looker permite heatmap:
  X: city_id
  Y: (vacío, solo color)
  Color: precisión%
```

---

## 📋 Dashboard 3: Horarios

### Componente 1: Line Chart Horario

```
1. Insert → Line chart (Time series)
   O Bar chart si prefieres
2. Dimension: hour (0-23)
3. Metric: precisión%
4. Nombre: "Precisión por Hora"
```

**Esperado:** Curva con pico en 13 y valle en 23

### Componente 2: Tabla Detalles

```
1. Insert → Table
2. Dimension: hour
3. Metrics:
   - COUNT(*)
   - Precisión%
4. Sort: hour ASC
5. Nombre: "Detalles por Hora"
```

---

## 🎯 Verificación

**Tipos:**
- [ ] Water, Ground, Rock en top 3 (90%+)?
- [ ] Electric, Flying en bottom (73-75%)?

**Ciudades:**
- [ ] Sydney >90% en top?
- [ ] Moscow <72% al fondo?

**Horarios:**
- [ ] 13:00 (1 PM) es pico?
- [ ] 23:00 (11 PM) es valle?

**Si todas ✅ = US-1005 COMPLETADA**

---

**Próximo paso:** US-1006 (Integración React + Docs)


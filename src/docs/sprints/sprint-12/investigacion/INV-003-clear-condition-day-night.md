# INV-003 — Analisis de impacto: condicion `clear` para diferenciar noche despejada

**Fecha:** 2026-07-13
**Branch:** sprint-12
**Estado:** COMPLETADA — US-1205, US-1206, US-1207 listas para implementar
**Referencia decision:** D-050
**US derivadas:** US-1205, US-1206, US-1207

---

## 1. Objetivo

Determinar el impacto de agregar `'clear'` como nueva `WeatherCondition` para diferenciar
la noche despejada (iconos AccuWeather 33/34) del dia soleado (iconos 1/2), y definir
el alcance de cambios necesarios en codigo, datos y documentacion.

---

## 2. Origen del requerimiento

### 2.1 Comportamiento actual (incorrecto)

AccuWeather usa iconos distintos para dia y noche:
- Iconos **1-32**: condiciones de dia
- Iconos **33-44**: condiciones de noche

El proyecto actual mapea los iconos 33 (Clear) y 34 (Mostly Clear) a `pgoCondition: 'sunny'`.
Resultado: una ciudad con cielo nocturno despejado muestra condicion "Soleado" con imagen
de sol — semanticamente incorrecto.

### 2.2 Comportamiento en el proyecto fuente (pgo-weatherbot)

El proyecto original ya distinguia estas condiciones con PGO IDs separados:

| PGO ID | Descripcion | IsDay | IsNight | Tipos boosteados |
|--------|-------------|-------|---------|-----------------|
| 5 | Sunny | 1 | 0 | Ground, Fire, Grass |
| 4 | Clear | 0 | 1 | Ground, Fire, Grass |
| 8 | Partly Cloudy (Day) | 1 | 0 | Normal, Rock |
| 9 | Partly Cloudy (Night) | 0 | 1 | Normal, Rock |

Los boosts PGO son **identicos** para dia/noche — la distincion es solo visual.

### 2.3 Alcance de la correccion

Se corrigen **solo los iconos 33 y 34** (noche despejada → `'clear'`).
Los iconos nocturnos parciales (35, 36, 39, 41) ya mapean a `'partly'` y se mantienen asi —
el proyecto fuente los trataba con el mismo PGO ID que `partly` de dia.

---

## 3. Analisis de impacto por capa

### 3.1 Capa de clasificacion (Cloud Function)

**Archivo:** `functions/src/shared/weatherClassify.ts`

Cambios:
- Agregar `'clear'` al tipo `WeatherCondition`
- Cambiar `pgoCondition` de iconos 33 y 34: `'sunny'` → `'clear'`

Impacto en datos: la CF clasifica al momento del sync y guarda `pgo_condition` en Firestore.
Los documentos existentes con iconos 33/34 quedan con `pgo_condition: "sunny"` hasta el
proximo sync de esa ciudad (TTL natural del sistema).

### 3.2 Capa de clasificacion (frontend — copia)

**Archivo:** `src/services/weather/weatherClassify.ts`

Mismos cambios que la CF. Esta es la copia usada por la ruta legacy AccuWeather directo.
Debe mantenerse sincronizada con `functions/src/shared/weatherClassify.ts` — ver BL-012
(deuda tecnica pendiente de extraer a modulo compartido).

### 3.3 Logica de negocio

**Archivo:** `src/services/weather/weatherService.ts`

`CONDITION_TO_TYPES` necesita entrada `clear` con los mismos tipos que `sunny`:
```ts
clear: ['Ground', 'Fire', 'Grass']
```

**Archivo:** `src/services/firebase/firebaseWeatherService.ts`

`getWeatherFromFirestore` lee `pgo_condition` directo de Firestore sin reclasificar.
Funcionara automaticamente cuando los documentos nuevos traigan `"clear"`.
No requiere cambios de logica.

### 3.4 Catalogo de condiciones

**Archivo:** `src/services/firebase/weatherCatalogService.ts`

`FALLBACK_CONDITIONS` — mover iconos 33 y 34 de `sunny` a nueva entrada `clear`:
```ts
clear: {
  label: 'Despejado',
  emoji: '🌙',
  accuweather_codes: [33, 34],
}
```

`FALLBACK_TYPE_MAPPING` — agregar `clear: ['Ground', 'Fire', 'Grass']`

`FALLBACK_RULES.windy_override.base_conditions_replaceable` — agregar `'clear'`
(el cielo nocturno despejado tambien puede tener viento)

### 3.5 Sistema de imagenes y UI

**Archivo:** `src/config/weatherImages.ts`

Agregar `'clear'` al tipo `WeatherCondition` + imagen + label + color:
```ts
clear: '/weather/clear.png'   // imagen de luna/noche despejada
```

**Archivo nuevo:** `/public/weather/clear.png`
Imagen de noche despejada (luna, estrellas). Debe seguir el mismo estilo visual
que las demas imagenes de clima del proyecto.

### 3.6 Exportacion a Excel

**Archivo:** `src/utils/exportToExcel.ts`

- `translateCondition`: agregar `clear: 'Despejado'`
- `getBaseConditionName`: cambiar iconos 33 y 34 de `'Soleado'` a `'Despejado'`

### 3.7 Filtros y store

**Archivo:** `src/store/useStore.ts`

Si `conditionFilter` esta tipado como `WeatherCondition[]`, acepta `'clear'`
automaticamente al actualizar el tipo. Verificar que el filtro por condicion
en el mapa funcione correctamente con la nueva condicion.

**Archivo:** `src/components/UI/FilterPanelModal.tsx`

Si las condiciones estan listadas hardcodeadas, agregar opcion `clear` con
label "Despejado" y emoji de luna.

### 3.8 Lookback y analytics

**Archivo:** `src/services/lookback/lookbackService.ts`

`getConditionFromSnapshot` lee `s.pgo_condition` como string — sin cambios.

**Archivos de analytics** (`PredictionAnalysisTable`, `PredictionAnalysisDemo`)

Usan `WeatherCondition` para mostrar badges. Al actualizar el tipo, `'clear'`
sera una condicion valida. Verificar que `WeatherBadge` maneje la nueva condicion.

---

## 4. Impacto en datos historicos (Firestore)

### 4.1 Documentos `city_weather/{cityId}/forecasts`

Documentos existentes con `snapshots[].pgo_condition: "sunny"` generados de noche
(icono 33 o 34) quedaran con clasificacion incorrecta hasta el proximo sync.

**Estrategia:** el TTL natural del sync corrige los documentos nuevos. Para correccion
inmediata de historicos se puede ejecutar un script de migracion puntual (US-1207).

### 4.2 Documentos `weather_reports`

Reportes historicos con `predicted_condition: "sunny"` que en realidad corresponden
a noche despejada quedan con datos incorrectos permanentemente (no se auto-corrigen).
Impacto en metricas de precision: marginal, ya que afecta solo horas nocturnas con
cielo despejado. Documentado como deuda de datos en US-1207.

---

## 5. Resumen de archivos afectados

| Archivo | Tipo de cambio | US |
|---------|---------------|-----|
| `functions/src/shared/weatherClassify.ts` | Tipo + iconos 33/34 | US-1205 |
| `src/services/weather/weatherClassify.ts` | Tipo + iconos 33/34 (copia) | US-1205 |
| `src/services/weather/weatherService.ts` | `CONDITION_TO_TYPES` | US-1205 |
| `src/config/weatherImages.ts` | Tipo + imagen + label + color | US-1206 |
| `src/services/firebase/weatherCatalogService.ts` | FALLBACK_CONDITIONS + mapping + rules | US-1206 |
| `src/utils/exportToExcel.ts` | `translateCondition` + `getBaseConditionName` | US-1206 |
| `src/store/useStore.ts` | Verificar tipado `conditionFilter` | US-1206 |
| `src/components/UI/FilterPanelModal.tsx` | Agregar opcion `clear` | US-1206 |
| `/public/weather/clear.png` | Nuevo asset | US-1206 |
| Script migracion Firestore | Nuevo script puntual | US-1207 |

---

## 6. Riesgos

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| Documentos historicos mal clasificados en analytics | Alta | US-1207 script de migracion |
| BL-012 (copia dual del clasificador) genera drift si se actualiza uno solo | Alta | Actualizar ambos en US-1205 atomicamente |
| `FilterPanelModal` lista condiciones hardcodeadas y no muestra `clear` | Media | Verificar en US-1206 |
| Imagen `clear.png` faltante causa broken image | Alta | Crear asset antes del deploy |

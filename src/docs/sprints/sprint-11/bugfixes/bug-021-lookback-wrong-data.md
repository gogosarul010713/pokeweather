# BUG-021 — Lookback muestra datos incorrectos

**Sprint:** 11
**Tipo:** Bug
**Severidad:** Alta
**Estado:** Implementado — pendiente pruebas de aceptacion
**Fecha deteccion:** 2026-05-11
**Fecha implementacion:** 2026-05-11

---

## Sintoma

Al pulsar el boton LOOKBACK en la tabla predictiva, los climas mostrados no corresponden
a la hora que se esta analizando, y en muchos casos el panel aparece vacio o con datos
repetidos identicos para todas las horas anteriores.

---

## Causa raiz (3 bugs combinados)

### Bug A — `hour` en schema de Cloud Function es el indice, no la hora local

La Cloud Function guarda `hour` como el indice secuencial del array (0-11), no como
la hora local de la ciudad.

**Evidencia real de BigQuery** (5 documentos de `auckland-waterfront`, distintos `date_hour`):

```
date_hour="2026-05-11-14"  snapshots[0].hour=0  snapshots[1].hour=1  ...  snapshots[11].hour=11
date_hour="2026-05-11-13"  snapshots[0].hour=0  snapshots[1].hour=1  ...
date_hour="2026-05-11-12"  snapshots[0].hour=0  snapshots[1].hour=1  ...
```

`snapshots[0].hour` es siempre `0` independientemente del `date_hour` del documento.

**Consecuencia en `predictionAnalyticsService.ts:106`:**
```typescript
row.hour = snapshot.hour   // <- siempre 0 para docs de Cloud Function
```

**Consecuencia en `generateLookback` (linea 200):**
```typescript
const targetSnapshot = nearbyForecast.snapshots.find(s => s.hour === targetHour)
// targetHour=0 siempre -> encuentra snapshots[0] de CADA documento anterior
// Para targetHour>11 -> nunca encuentra nada (array vacio)
```

El lookback siempre muestra el primer snapshot de cada documento anterior
(la condicion pronosticada para la hora siguiente a la ejecucion), sin importar
que hora especifica queremos analizar.

---

### Bug B — Busqueda por `created_at` ±15min en lugar de por ID directo

`generateLookback` localiza documentos anteriores buscando forecasts cuyo
`created_at` caiga dentro de ±15 min de cada intervalo de 0.5h:

```typescript
// predictionAnalyticsService.ts:190-194
const nearbyForecast = sortedByTime.find(f => {
  const diff = Math.abs(timestampToDate(f.created_at).getTime() - checkTime.getTime())
  return diff < 15 * 60 * 1000   // +-15 minutos
})
```

`created_at` es el inicio exacto del slot horario (ej: `2026-05-11T14:00:00Z`).
Si por cualquier motivo un documento fue escrito ligeramente fuera de esa ventana
(reintento, deploy, escritura del cliente vs Cloud Function), no es encontrado.
Ademas itera de 0.5h en 0.5h buscando forecasts que solo existen cada hora entera.

**Forma correcta:** usar el `date_hour` del documento como ID directo, que es exactamente
la clave que identifica el slot.

---

### Bug C — Ventana de carga de 24h deja el lookback sin datos historicos

`getRecentForecasts('24h')` carga solo los ultimos 24 documentos por ciudad.
El lookback necesita hasta 12h de historia adicional para las filas al borde de esa ventana.

```
Ventana cargada: [T-24h ... T]
Fila en T-20h: necesita lookback [T-32h ... T-20h]
                               ^^^^^^^^^^
                               fuera del rango -> lookback vacio
```

---

## Analisis del schema real (datos de BigQuery)

La Cloud Function guarda un schema diferente al cliente React:

| Campo | Schema Cloud Function | Schema cliente React |
|-------|-----------------------|----------------------|
| `hour` | Indice 0-11 (secuencial) | Hora local real (0-23) |
| `icon_code` | numero AccuWeather | ausente en docs viejos |
| `icon_phrase` | string AccuWeather | ausente en docs viejos |
| `classified` | ausente | string condicion |
| `calculated_condition` | **NULL** (no escrito) | string en campo raiz |
| `temp_c` | number | `temperature_c` en schema viejo |

`classifySnapshot()` ya maneja ambos schemas via fallback (icon_code primero, classified despues).
El campo `calculated_condition` es NULL en todos los documentos recientes de produccion.

---

## Correccion a la hipotesis del usuario

El analisis externo propone que `snapshots[0]` de un documento `date_hour="2026-05-11-14"`
contiene `hour=15` (la siguiente hora al slot).

**Los datos reales muestran `hour=0`**, no `15`. La Cloud Function usa el indice
del array como valor del campo `hour`, no la hora local de la ciudad.

La consecuencia practica es la misma: no se puede buscar por `s.hour === targetHour`
si `targetHour` es una hora real (0-23). La solucion es acceder por indice de array:

```typescript
// Correcto: acceso por offset de array
const offset = targetHour - (localExecHour + 1)
const snapshot = doc.snapshots[offset]   // <- indice directo

// Incorrecto (codigo actual): busqueda por campo hour
const snapshot = doc.snapshots.find(s => s.hour === targetHour)  // Bug A
```

---

## Solucion propuesta

### Arquitectura

1. **Nuevo servicio** `src/services/lookback/lookbackService.ts`
   - Funcion `fetchLookback(cityId, dateHour, targetHour, timezone, actualCondition)`
   - Genera los 12 `date_hour` anteriores por calculo aritmetico
   - Hace 12 lecturas Firestore paralelas por ID directo (`getDoc`)
   - Calcula el offset correcto con ajuste de timezone
   - Clasifica cada snapshot con `classifyFromSnapshot()` usando `icon_code`

2. **Nuevo componente** `src/components/Analytics/LookbackPanel.tsx`
   - Panel expandible inline (no modal)
   - Tarjetas horizontales: una por hora anterior (-12h a -1h)
   - Skeleton mientras carga
   - Borde verde/gris segun `isMatch`

3. **Modificar** `PredictionAnalysisTable.tsx`
   - Estado `lookbackState: Map<rowId, { status, data }>` — carga lazy al hacer click
   - Solo un lookback abierto a la vez (accordion)
   - Llamar `fetchLookback()` en el handler del boton, no en la carga inicial

4. **Modificar** `predictionAnalyticsService.ts`
   - Eliminar `generateLookback()` y el campo `lookback12h` del modelo `PredictionRow`
   - El lookback ya no se precalcula: es lazy on-demand

### Formula de offset (con timezone)

```typescript
// dateHour = "2026-05-11-14" -> execHour UTC = 14
// timezone de Auckland = 12
// localExecHour = (14 + 12) % 24 = 2
// targetHour = hora local objetivo (ej: 8)
// offset = 8 - (2 + 1) = 5  -> snapshots[5]

const execHour = parseInt(dateHour.split('-')[3])
const localExecHour = (execHour + timezone + 24) % 24
const offset = targetHour - (localExecHour + 1)
// Validar: 0 <= offset <= 11
```

Si `offset < 0` o `offset > 11`: ese documento no cubre `targetHour` (skip).

### Clasificacion de snapshots (schema nuevo)

```typescript
function classifyFromSnapshot(s: {
  icon_code?: number; has_precipitation?: boolean; gust_kmh?: number; wind_kmh?: number
}): string {
  if (!s) return 'Unknown'
  if (s.icon_code !== undefined) {
    const c = s.icon_code
    if ([18, 19, 25, 26, 29].includes(c)) return 'Rain'
    if ([22, 23, 24, 44].includes(c))      return 'Snow'
    if ([15, 16, 17].includes(c))          return 'Thunderstorm'
    if ([11, 12].includes(c))              return 'Fog'
    if ([3, 4, 6].includes(c))             return 'PartlyCloudy'
    if ([7, 8, 38].includes(c))            return 'Cloudy'
    if ([1, 2].includes(c))                return 'Sunny'
  }
  if (s.has_precipitation)                 return 'Rain'
  const gust = s.gust_kmh ?? s.wind_kmh ?? 0
  if (gust > 40)                           return 'Windy'
  return 'Unknown'
}
```

---

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/services/lookback/lookbackService.ts` | Crear nuevo |
| `src/components/Analytics/LookbackPanel.tsx` | Crear nuevo |
| `src/components/Analytics/PredictionAnalysisTable.tsx` | Reemplazar logica de lookback + estado |
| `src/services/predictions/predictionAnalyticsService.ts` | Eliminar `generateLookback()` y `lookback12h` |

---

## Lo que NO debe hacerse

- No reusar `generateLookback()` — tiene los 3 bugs descritos arriba
- No buscar por `created_at` con ventana temporal — usar `date_hour` como ID directo
- No usar `calculated_condition` del documento raiz — es NULL en produccion
- No acceder a `snapshot.hour` para buscar la hora objetivo — usar offset de array
- No precalcular el lookback en `fetchPredictions()` — debe ser lazy on-demand

---

## Implementacion (2026-05-11)

### Archivos creados
- `src/services/lookback/lookbackService.ts` — nuevo servicio lazy on-demand
  - `fetchLookback(cityId, dateHour, targetHour, timezone, actualCondition)`
  - Genera 12 date_hours anteriores por calculo aritmetico
  - Lee cada doc por `getDoc` con ID directo (sin ventana temporal)
  - `computeOffset()` calcula el indice del array por timezone
  - Clasifica con `icon_code` via `resolveCondition()` (schema Cloud Function)

- `src/components/Analytics/LookbackPanel.tsx` — componente expandible inline
  - Skeleton de 12 tarjetas mientras carga (animacion pulse)
  - Tarjeta por hora anterior: -1h a -12h
  - Borde verde/rojo segun `isMatch`

### Archivos modificados
- `src/components/Analytics/PredictionAnalysisTable.tsx`
  - Eliminada interface `LookbackItem` (ya no se exporta)
  - Eliminado campo `lookback12h` de `PredictionRow`
  - Estado `openLookbacks: Set<string>` → `lookbackMap: Map<string, LookbackState>`
  - Boton LOOKBACK ahora dispara `fetchLookback()` lazy (skeleton visible)
  - Panel renderiza `<LookbackPanel>` en lugar del bloque inline antiguo

- `src/services/predictions/predictionAnalyticsService.ts`
  - Eliminada funcion `generateLookback()` (84 lineas con los 3 bugs)
  - Eliminada asignacion `row.lookback12h`
  - Eliminado import de `LookbackItem`

- `src/components/Analytics/PredictionAnalysisDemo.tsx`
  - Eliminado mock data de `lookback12h` (campo inexistente)

- `src/components/Analytics/index.ts`
  - Eliminado re-export de `LookbackItem`

### Build
- TypeScript: sin errores
- Vite build: exitoso (warnings de chunk size y dynamic import son preexistentes)

## Referencias

- Datos reales BigQuery: `weather-app-prod-ef50d.weather_analytics.city_weather_raw_changelog`
- Schema confirmado: 5 documentos de `auckland-waterfront` del 2026-05-11 (BigQuery query ejecutada)
- Codigo bugueado (eliminado): `predictionAnalyticsService.ts` funcion `generateLookback` (lineas 162-228)
- BUG-020: antecedente — `created_at` fijo al inicio del slot (ya corregido, relevante para entender el schema)

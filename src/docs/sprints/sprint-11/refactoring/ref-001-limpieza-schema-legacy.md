# REF-001 — Limpieza schema legacy post-BL-012

**Sprint:** 11
**Tipo:** Refactoring (deuda tecnica)
**Estado:** COMPLETADO
**Fecha inicio:** 2026-06-11
**Autor:** Geovanny M

---

## Contexto

Con BL-012 (mayo 2026) se extrajo `resolveCondition` a un modulo compartido y la CF
empezo a persistir `pgo_condition` en cada snapshot. Sin embargo, el flujo del frontend
nunca se actualizo: `saveCityForecast` seguia escribiendo docs con el schema viejo
(`classified`, `raw_condition_code`, etc.), y los readers mantenian fallbacks para
soportar ambos schemas en paralelo.

Esto creo dos fuentes de docs en Firestore con schemas distintos y logica defensiva
distribuida en 5 archivos. BUG-026 fue consecuencia directa de esta deuda.

## Cronologia que origino el legacy

| Commit | Fecha | Que hizo |
|--------|-------|----------|
| US-801 | 2026-04-08 | Frontend clasifica y persiste en Firestore con schema viejo (`classified`, `raw_condition_code`) |
| US-1113 | 2026-05-03 | CF guarda raw, frontend clasifica al leer — intencionalmente, porque `resolveCondition` solo vivia en frontend |
| BL-012 | 2026-05-11 | `resolveCondition` se extrae a modulo compartido, CF empieza a persistir `pgo_condition` — pero frontend no se limpia |
| Sprint-11 | 2026-06-11 | Este refactoring — eliminar todo el schema viejo |

## Decision de arquitectura

**La CF es la unica fuente de escritura en Firestore.** El frontend es read-only.
Esto aplica con 5 ciudades (fase de validacion actual) y con N ciudades en produccion.

Razon: la CF controla el schema, el timing (HH:00 UTC), y la atomicidad (batch con summary doc).
El frontend escribiendo en paralelo generaba docs con schema inferior que sobreescribian
los docs de CF (ver BUG-026).

## Archivos modificados

### `src/services/firebase/firebaseWeatherService.ts`
- **Paso 1:** `ForecastSnapshot` — campos legacy eliminados (`raw_condition_code`, `raw_condition_text`,
  `classified`, `types`, `temperature_c`, `precipitation_mm`, `humidity_pct`, `is_windy_override`).
  Todos los campos restantes pasan a ser obligatorios (sin `?`).
- **Paso 2:** `ForecastDoc` — eliminado `calculated_condition` (era `snapshots[0].classified`).
  `target_hour` pasa a ser obligatorio.
- **Paso 3:** `getWeatherFromFirestore` — eliminado recalculo con `resolveCondition`.
  Ahora lee `pgo_condition` directo de `snapshots[0]`.
- **Paso 4:** `saveCityForecast` eliminada completa (~90 lineas). Con ella:
  - `getLocalTimeUser` (helper privado)
  - `formatDateHour` (helper privado)
  - `startOfHourUtcFromDateHour` (helper privado)
  - Import de `City`

### `src/services/weather/batchWeatherService.ts`
- **Paso 4:** Eliminados import `saveCityForecast` y `ForecastSnapshot`.
  Eliminadas las dos llamadas a `saveCityForecast` (cache-hit y API-fetch).
  `fetchCityWeatherWithRetry` retorna `City` en lugar de `{ city, snapshots }`.

### `src/services/weather/weatherService.ts` _(paso 5 — completado)_
- Eliminada interfaz `ForecastSnapshot` con schema viejo (10 campos legacy).
- Eliminada funcion `createForecastSnapshots` (~30 lineas).
- `fetchCityWeather` retorna `{ city }` en lugar de `{ city, snapshots }`.
- Quitados imports `getBaseCondition` y `WEATHER_TRANSLATIONS` (solo los usaba `createForecastSnapshots`).

### `src/services/lookback/lookbackService.ts` _(paso 6 — completado)_
- `getConditionFromSnapshot` simplificada: eliminados fallbacks a `raw_condition_code`, `resolveCondition` y `classified`.
- Quitado import de `resolveCondition` (ya no se necesita en este modulo).
- Funcion queda en 2 lineas: guard de undefined + retorno directo de `pgo_condition`.

### `src/services/predictions/predictionAnalyticsService.ts` _(paso 7 — completado)_
- `classifySnapshot` simplificada: eliminados fallbacks a `raw_condition_code`, `resolveCondition` y `classified`.
- Quitado import de `resolveCondition` (ya no se necesita en este modulo).
- Comentario del callsite actualizado — ya no menciona schema viejo ni D-039.

### `src/components/TestingTools/PrecisionMetrics.tsx` _(paso 8 — completado)_
- `snap.classified || 'unknown'` reemplazado por `snap.pgo_condition || 'unknown'`.
- Unica ocurrencia: distribucion de condiciones en estadisticas de Firestore.

## Schema antes vs despues

**ForecastSnapshot antes:**
```typescript
interface ForecastSnapshot {
  hour: number
  icon_code?: number
  icon_phrase?: string
  temp_c?: number
  wind_kmh: number
  gust_kmh?: number
  humidity?: number
  has_precipitation?: boolean
  pgo_condition?: string
  // legacy
  raw_condition_code?: number
  raw_condition_text?: string
  classified?: string
  types?: string[]
  temperature_c?: number
  precipitation_mm?: number
  humidity_pct?: number
  is_windy_override?: boolean
}
```

**ForecastSnapshot despues:**
```typescript
interface ForecastSnapshot {
  hour: number
  icon_code: number
  icon_phrase: string
  temp_c: number
  wind_kmh: number
  gust_kmh: number
  humidity: number
  has_precipitation: boolean
  pgo_condition: string
}
```

## Tests agregados

**Archivo:** `tests/unit/services/schemaLegacy.test.ts` — 14 tests, 5 suites

| Suite | Tests | Que verifica |
|-------|-------|--------------|
| ForecastSnapshot schema CF | 3 | Campos obligatorios presentes, campos legacy ausentes, todas las condiciones validas |
| ForecastDoc schema CF | 2 | `target_hour` obligatorio, `calculated_condition` ausente |
| classifySnapshot logic | 3 | Retorna `pgo_condition` directo, no recalcula con `icon_code`, no recalcula con viento |
| getConditionFromSnapshot logic | 3 | Guard de undefined, retorno directo, no recalcula aunque `icon_code` difiera |
| filtro target_hour | 3 | Descarta docs sin `target_hour`, acepta `target_hour=0` (medianoche), array vacio si todos obsoletos |

Resultado: **14/14 passed**

## Nota sobre batchWeatherService

`batchWeatherService` se mantiene por ahora — sigue siendo necesario para cargar las
~94 ciudades del mapa desde AccuWeather cuando el cache IndexedDB expira. En el escenario
final (CF cubre todas las ciudades), este servicio se eliminaria tambien. Documentado
como candidato en backlog.

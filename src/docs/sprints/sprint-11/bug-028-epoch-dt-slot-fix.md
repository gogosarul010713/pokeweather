# BUG-028: EpochDateTime Slot Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar la divergencia entre sidebar y tabla predictiva haciendo que ambos identifiquen el slot de AccuWeather por su hora real (EpochDateTime) en lugar de asumir que `[0]` siempre es la hora actual.

**Architecture:** La CF agrega `epoch_dt` (Unix timestamp segundos) a cada snapshot al persistir en Firestore. El frontend, al consumir AccuWeather en vivo, busca el slot cuyo `EpochDateTime` corresponde a la hora actual en lugar de tomar ciegamente `data[0]`. Ambos lados quedan sincronizados en la misma hora de referencia.

**Tech Stack:** TypeScript, Firebase Cloud Functions (Node 18), React 18 + Vite, Firestore

---

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `functions/src/syncWeatherLogic.ts` | Agregar `epoch_dt` al mapear cada slot AccuWeather |
| `src/services/weather/weatherService.ts` | Reemplazar `data[0]` por busqueda por hora en `getHourlyForecast` y `fetchCityWeather` |
| `src/services/firebase/firebaseWeatherService.ts` | Agregar `epoch_dt` a `ForecastSnapshot` |
| `tests/unit/services/epochSlot.test.ts` | Tests nuevos para la logica de busqueda de slot |

---

## Task 1: Agregar `epoch_dt` al tipo `ForecastSnapshot`

**Files:**
- Modify: `src/services/firebase/firebaseWeatherService.ts:14-24`

- [ ] **Step 1: Agregar campo `epoch_dt` a la interfaz**

En `src/services/firebase/firebaseWeatherService.ts`, modificar la interfaz `ForecastSnapshot`:

```typescript
export interface ForecastSnapshot {
  hour: number
  epoch_dt: number          // ← NUEVO: Unix timestamp (segundos) del slot AccuWeather
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

- [ ] **Step 2: Verificar que TypeScript no rompe**

```bash
cd c:\Workspace\React\pokeweather && npx tsc --noEmit
```

Esperado: sin errores nuevos (los existentes son pre-existentes del proyecto).

- [ ] **Step 3: Commit**

```bash
git add src/services/firebase/firebaseWeatherService.ts
git commit -m "feat(bug-028): agregar epoch_dt a ForecastSnapshot"
```

---

## Task 2: CF — persistir `epoch_dt` en cada snapshot

**Files:**
- Modify: `functions/src/syncWeatherLogic.ts:109-132`

- [ ] **Step 1: Escribir test que verifica que epoch_dt se persiste**

Crear `functions/src/tests/syncWeatherLogic.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

// Replica la logica de mapeo de syncWeatherLogic para tests aislados
function mapSnapshot(item: {
  WeatherIcon: number
  IconPhrase: string
  HasPrecipitation: boolean
  RelativeHumidity: number
  Temperature: { Value: number }
  Wind: { Speed: { Value: number } }
  WindGust?: { Speed?: { Value?: number } }
  EpochDateTime: number
}, index: number) {
  const windKmh = item.Wind.Speed.Value
  const gustKmh = item.WindGust?.Speed?.Value ?? windKmh
  return {
    hour: index,
    epoch_dt: item.EpochDateTime,
    icon_code: item.WeatherIcon,
    icon_phrase: item.IconPhrase || '',
    temp_c: item.Temperature.Value,
    wind_kmh: windKmh,
    gust_kmh: gustKmh,
    humidity: item.RelativeHumidity || 0,
    has_precipitation: item.HasPrecipitation ?? false,
  }
}

describe('mapSnapshot — epoch_dt (BUG-028)', () => {
  it('persiste EpochDateTime del slot como epoch_dt', () => {
    const item = {
      WeatherIcon: 1,
      IconPhrase: 'Sunny',
      HasPrecipitation: false,
      RelativeHumidity: 50,
      Temperature: { Value: 25 },
      Wind: { Speed: { Value: 10 } },
      EpochDateTime: 1749765600,
    }
    const snap = mapSnapshot(item, 0)
    expect(snap.epoch_dt).toBe(1749765600)
  })

  it('cada slot conserva su propio EpochDateTime', () => {
    const items = [
      { WeatherIcon: 1, IconPhrase: 'Sunny', HasPrecipitation: false, RelativeHumidity: 50,
        Temperature: { Value: 25 }, Wind: { Speed: { Value: 10 } }, EpochDateTime: 1749765600 },
      { WeatherIcon: 7, IconPhrase: 'Cloudy', HasPrecipitation: false, RelativeHumidity: 70,
        Temperature: { Value: 22 }, Wind: { Speed: { Value: 8 } }, EpochDateTime: 1749769200 },
    ]
    const snaps = items.map((item, i) => mapSnapshot(item, i))
    expect(snaps[0].epoch_dt).toBe(1749765600)
    expect(snaps[1].epoch_dt).toBe(1749769200)
    // Deben diferir exactamente 1 hora (3600 segundos)
    expect(snaps[1].epoch_dt - snaps[0].epoch_dt).toBe(3600)
  })
})
```

- [ ] **Step 2: Verificar que el test existe y falla (aun no implementado en CF)**

```bash
cd c:\Workspace\React\pokeweather\functions && npx vitest run src/tests/syncWeatherLogic.test.ts 2>&1 | head -20
```

Esperado: error de modulo o fallo — confirma que el test detecta lo que falta.

- [ ] **Step 3: Modificar el mapeo en `syncWeatherLogic.ts`**

En `functions/src/syncWeatherLogic.ts`, agregar `EpochDateTime` al tipo interno y al mapeo. Cambiar el bloque de tipo `AccuWeatherHour` y el `.map()` (lineas ~109-132):

```typescript
type AccuWeatherHour = {
  EpochDateTime: number       // ← NUEVO
  WeatherIcon: number
  IconPhrase: string
  HasPrecipitation: boolean
  RelativeHumidity: number
  Temperature: { Value: number }
  Wind: { Speed: { Value: number } }
  WindGust?: { Speed?: { Value?: number } }
}

const snapshots: WeatherSnapshot[] = response.data.map(
  (item: AccuWeatherHour, index: number) => {
    const windKmh = item.Wind.Speed.Value
    const gustKmh = item.WindGust?.Speed?.Value ?? windKmh
    return {
      hour: index,
      epoch_dt: item.EpochDateTime,     // ← NUEVO
      icon_code: item.WeatherIcon,
      icon_phrase: item.IconPhrase || '',
      temp_c: item.Temperature.Value,
      wind_kmh: windKmh,
      gust_kmh: gustKmh,
      humidity: item.RelativeHumidity || 0,
      has_precipitation: item.HasPrecipitation ?? false,
      pgo_condition: resolveCondition(item.WeatherIcon, windKmh, gustKmh),
    }
  }
)
```

Tambien agregar `epoch_dt: number` al tipo `WeatherSnapshot` en la parte superior del archivo (lineas ~17-27):

```typescript
interface WeatherSnapshot {
  hour: number
  epoch_dt: number    // ← NUEVO
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

- [ ] **Step 4: Correr el test**

```bash
cd c:\Workspace\React\pokeweather\functions && npx vitest run src/tests/syncWeatherLogic.test.ts
```

Esperado: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add functions/src/syncWeatherLogic.ts functions/src/tests/syncWeatherLogic.test.ts
git commit -m "feat(bug-028): CF persiste epoch_dt por slot desde EpochDateTime AccuWeather"
```

---

## Task 3: Frontend — buscar slot por hora en lugar de tomar `[0]`

**Files:**
- Modify: `src/services/weather/weatherService.ts:165-179` y `src/services/weather/weatherService.ts:223-278`
- Create: `tests/unit/services/epochSlot.test.ts`

- [ ] **Step 1: Escribir tests para la funcion de busqueda de slot**

Crear `tests/unit/services/epochSlot.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

// Replica la funcion a implementar en weatherService.ts
function findCurrentSlot<T extends { EpochDateTime: number }>(
  slots: T[],
  nowMs: number
): T {
  if (slots.length === 0) throw new Error('No slots available')

  const nowSec = Math.floor(nowMs / 1000)
  // Buscar el slot cuyo EpochDateTime es <= ahora y mas cercano al presente
  // (el slot que "esta activo" en este momento)
  let best = slots[0]
  for (const slot of slots) {
    if (slot.EpochDateTime <= nowSec && slot.EpochDateTime > best.EpochDateTime) {
      best = slot
    }
  }
  // Si ninguno es <= nowSec (todos son futuros), usar el primero
  const anyPast = slots.some(s => s.EpochDateTime <= nowSec)
  return anyPast ? best : slots[0]
}

describe('findCurrentSlot — BUG-028', () => {
  const makeSlots = (epochsSeconds: number[]) =>
    epochsSeconds.map((e, i) => ({ EpochDateTime: e, icon: i }))

  it('retorna el slot mas reciente que es <= ahora', () => {
    // slots: 14:00, 15:00, 16:00 — ahora son las 15:20
    const slots = makeSlots([1749765600, 1749769200, 1749772800])
    const now = 1749769200 + 20 * 60  // 15:20 en segundos
    const result = findCurrentSlot(slots, now * 1000)
    expect(result.EpochDateTime).toBe(1749769200) // slot de las 15:00
  })

  it('si todos los slots son futuros, retorna slots[0]', () => {
    const slots = makeSlots([1749772800, 1749776400])
    const now = 1749769200 // antes del primer slot
    const result = findCurrentSlot(slots, now * 1000)
    expect(result.EpochDateTime).toBe(1749772800)
  })

  it('retorna slots[0] cuando hay exactamente un slot y es pasado', () => {
    const slots = makeSlots([1749765600])
    const now = 1749769200
    const result = findCurrentSlot(slots, now * 1000)
    expect(result.EpochDateTime).toBe(1749765600)
  })

  it('maneja el caso donde AccuWeather ya roto — slot[0] es la hora siguiente', () => {
    // AccuWeather roto: slots[0] = 16:00, slots[1] = 17:00 — pero ahora son las 15:45
    // El slot correcto es ninguno pasado, usar slots[0]
    const slots = makeSlots([1749772800, 1749776400]) // 16:00 y 17:00
    const now = 1749771000 // 15:30
    const result = findCurrentSlot(slots, now * 1000)
    expect(result.EpochDateTime).toBe(1749772800) // slots[0] como fallback
  })

  it('lanza error si el array esta vacio', () => {
    expect(() => findCurrentSlot([], Date.now())).toThrow('No slots available')
  })
})
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

```bash
cd c:\Workspace\React\pokeweather && npx vitest run tests/unit/services/epochSlot.test.ts
```

Esperado: FAIL — `findCurrentSlot is not defined` o similar.

- [ ] **Step 3: Agregar `EpochDateTime` a `HourlyForecastData`**

En `src/services/weather/weatherService.ts`, la interfaz `HourlyForecastData` (~linea 106). Agregar el campo:

```typescript
interface HourlyForecastData {
  EpochDateTime: number           // ← NUEVO: Unix timestamp (segundos) del slot
  WeatherIcon: number
  Temperature: { Value: number }
  RealFeelTemperature: { Value: number }
  RelativeHumidity: number
  Wind: { Speed: { Value: number } }
  WindGust: { Speed: { Value: number } }
  HasPrecipitation: boolean
  Visibility?: { Value: number }
}
```

- [ ] **Step 4: Implementar `findCurrentSlot` en `weatherService.ts`**

En `src/services/weather/weatherService.ts`, agregar la funcion exportada despues de los imports existentes (antes de `getAccuWeatherLocationKey`):

```typescript
/**
 * Selecciona el slot horario activo de AccuWeather.
 * AccuWeather actualiza cada 30min — data[0] NO siempre es la hora actual.
 * Busca el slot con EpochDateTime mas reciente que sea <= ahora.
 * Fallback a slots[0] si todos son futuros (CF aun no ejecuto para esta hora).
 */
export function findCurrentSlot<T extends { EpochDateTime: number }>(
  slots: T[],
  nowMs: number = Date.now()
): T {
  if (slots.length === 0) throw new Error('No slots available')

  const nowSec = Math.floor(nowMs / 1000)
  let best = slots[0]
  for (const slot of slots) {
    if (slot.EpochDateTime <= nowSec && slot.EpochDateTime > best.EpochDateTime) {
      best = slot
    }
  }
  const anyPast = slots.some(s => s.EpochDateTime <= nowSec)
  return anyPast ? best : slots[0]
}
```

- [ ] **Step 5: Correr tests para verificar que pasan**

```bash
cd c:\Workspace\React\pokeweather && npx vitest run tests/unit/services/epochSlot.test.ts
```

Esperado: PASS (5 tests).

- [ ] **Step 6: Reemplazar `data[0]` en `getHourlyForecast`**

En `src/services/weather/weatherService.ts`, la funcion `getHourlyForecast` (lineas ~165-179). Cambiar el return:

```typescript
export const getHourlyForecast = async (
  locationKey: string,
  apiKey: string
): Promise<HourlyForecastData> => {
  const url = `${ACCUWEATHER_BASE}/forecasts/v1/hourly/12hour/${locationKey}` +
    `?apikey=${apiKey}&details=true&metric=true`

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) {
    throw new Error(`AccuWeather forecast error: ${response.status}`)
  }

  const data = await response.json()
  return findCurrentSlot(data)   // ← antes era: data[0]
}
```

- [ ] **Step 7: Reemplazar `hourlyForecasts[0]` en `fetchCityWeather`**

En `src/services/weather/weatherService.ts`, dentro de `fetchCityWeather` (linea ~241). Cambiar:

```typescript
const forecast = findCurrentSlot(hourlyForecasts)  // ← antes era: hourlyForecasts[0]
```

- [ ] **Step 8: Verificar typecheck**

```bash
cd c:\Workspace\React\pokeweather && npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 9: Commit**

```bash
git add src/services/weather/weatherService.ts tests/unit/services/epochSlot.test.ts
git commit -m "feat(bug-028): frontend selecciona slot AccuWeather por EpochDateTime, no por indice"
```

---

## Task 4: Desplegar CF actualizada a DEV y verificar

**Files:**
- `functions/src/syncWeatherLogic.ts` (ya modificado en Task 2)

- [ ] **Step 1: Build de la CF**

```bash
cd c:\Workspace\React\pokeweather\functions && npm run build
```

Esperado: sin errores de compilacion. El output va a `lib/`.

- [ ] **Step 2: Deploy a DEV**

```bash
cd c:\Workspace\React\pokeweather\functions && firebase deploy --only functions --project weather-app-dev-f28ce
```

Esperado: `Deploy complete!`

- [ ] **Step 3: Verificar en Firestore DEV**

En Firebase Console DEV (`weather-app-dev-f28ce`) → Firestore → `city_weather/{cualquier-ciudad}/forecasts/{doc-reciente}` → expandir `snapshots[0]`.

Verificar que el documento tiene el campo `epoch_dt` con un valor numerico tipo `1749XXXXXX`.

- [ ] **Step 4: Commit final con nota de despliegue**

```bash
git add -A
git commit -m "chore(bug-028): CF DEV desplegada con epoch_dt — verificado en Firestore"
```

---

## Task 5: Smoke test en browser

- [ ] **Step 1: Iniciar dev server**

```bash
cd c:\Workspace\React\pokeweather && npm run dev
```

- [ ] **Step 2: Abrir consola del browser en `localhost:5173`**

Abrir DevTools → Console. Esperar a que el auto-refresh de la hora en punto ejecute (o usar Testing Tools → Sincronizacion → forzar sync manual).

- [ ] **Step 3: Verificar en consola que el slot seleccionado es correcto**

Agregar temporalmente un log en `weatherService.ts` dentro de `fetchCityWeather`, justo despues de `findCurrentSlot`:

```typescript
const forecast = findCurrentSlot(hourlyForecasts)
console.log(`[BUG-028] ${city.name} — slot seleccionado: EpochDateTime=${forecast.EpochDateTime} (${new Date(forecast.EpochDateTime * 1000).toLocaleString()}) icon=${forecast.WeatherIcon}`)
```

Verificar que la hora del slot impresa coincide con la hora actual local de cada ciudad.

- [ ] **Step 4: Comparar sidebar vs tabla**

En la app, comparar el clima que muestra el sidebar para Times Square con el que muestra la tabla predictiva para la misma hora. Deben coincidir.

- [ ] **Step 5: Remover el log temporal y commit final**

```typescript
// Eliminar la linea console.log agregada en Step 3
const forecast = findCurrentSlot(hourlyForecasts)
```

```bash
git add src/services/weather/weatherService.ts
git commit -m "fix(bug-028): remover log temporal de diagnostico"
```

---

## Notas de implementacion

- `EpochDateTime` en AccuWeather es Unix timestamp en **segundos** (no milisegundos). `findCurrentSlot` recibe `nowMs` en milisegundos (como `Date.now()`) y convierte internamente.
- La CF actualmente no tiene tests runner configurado en `functions/` — si `npx vitest` falla en ese directorio, el test del Task 2 puede omitirse y la verificacion se hace manualmente en Firestore tras el deploy.
- Los docs legacy en Firestore (sin `epoch_dt`) siguen siendo validos — la tabla predictiva los lee por `snapshots[0].pgo_condition` que no cambia.

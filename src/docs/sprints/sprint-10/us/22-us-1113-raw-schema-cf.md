# US-1113: Raw Weather Schema en Cloud Function

**Sprint:** 10 | **SP:** 3 | **Estado:** ✅ Implementado (2026-05-03)
**Relacionada:** D-039, BUG-012 (climas incorrectos en preview)

---

## Problema

La Cloud Function clasificaba el clima con su propio algoritmo (`mapAccuWeatherCondition` via `IconPhrase` texto libre), duplicando y difiriendo del algoritmo del frontend (`resolveCondition` via `WeatherIcon` numerico + Windy override). Resultado: **preview mostraba climas distintos a localhost**.

Diferencias concretas:
- CF no tenia Windy override (viento > 29 km/h)
- CF no guardaba `gust_kmh` (necesario para Windy)
- CF usaba texto libre → inconsistente entre versiones AccuWeather
- Frontend usaba 44 iconos numericos → determinista

---

## Solucion

**Principio:** La CF solo persiste datos raw. El frontend siempre clasifica.

### Cambios en Cloud Function (`functions/src/syncWeatherLogic.ts`)

**Antes:**
```typescript
interface WeatherSnapshot {
  hour: number
  condition: string   // clasificado por CF
  tempC: number
  windKmh: number
  humidity: number
  iconCode: number
}
// + mapAccuWeatherCondition() + calculateCondition()
```

**Despues:**
```typescript
interface WeatherSnapshot {
  hour: number
  icon_code: number        // WeatherIcon AccuWeather (1-44)
  icon_phrase: string      // Texto crudo, solo informativo
  temp_c: number
  wind_kmh: number
  gust_kmh: number         // NUEVO: para Windy override en frontend
  humidity: number
  has_precipitation: boolean
}
// mapAccuWeatherCondition() y calculateCondition() ELIMINADOS
```

### Cambios en Frontend (`src/services/firebase/firebaseWeatherService.ts`)

`getWeatherFromFirestore()` ahora clasifica al leer:

```typescript
const { resolveCondition, CONDITION_TO_TYPES } = await import('../weather/weatherService')
const iconCode = snapshot.icon_code ?? snapshot.raw_condition_code ?? 0
const windKmh = snapshot.wind_kmh ?? 0
const gustKmh = snapshot.gust_kmh ?? windKmh
const condition = iconCode > 0
  ? resolveCondition(iconCode, windKmh, gustKmh)
  : snapshot.classified || 'cloudy'
```

---

## Flujo Actualizado

```
Cloud Function (HH:00)
  AccuWeather → raw snapshot → Firestore
                (sin clasificar)

Frontend (al cargar)
  Firestore → getWeatherFromFirestore()
            → resolveCondition(icon_code, wind_kmh, gust_kmh)
            → condition + boostedTypes correctos → UI
```

---

## BUG Detectado: useFirestoreSync No Funciona

El listener de `useFirestoreSync` escucha `/city_weather` (docs raiz). La CF escribe en `/city_weather/{id}/forecasts/{date_hour}` (subcoleccion). Los cambios en subcolecciones no disparan el listener del doc raiz.

**Consecuencia:** El real-time update del cron no llega al frontend.
**Pendiente:** Ver opciones en `12-data-flow-architecture.md` seccion "Problema Detectado".

---

## Validacion

1. Deploy CF: `firebase deploy --only functions`
2. Esperar cron HH:00 o disparar manual
3. Verificar en Firebase Console: `forecasts/{date_hour}` debe tener `icon_code`, `gust_kmh` (sin `condition`)
4. Verificar en app: clima en preview debe coincidir con localhost para misma ciudad

---

## Archivos Modificados

- `functions/src/syncWeatherLogic.ts` — schema raw, sin clasificacion
- `src/services/firebase/firebaseWeatherService.ts` — clasificacion con resolveCondition
- `src/hooks/useFirestoreSync.ts` — documentado bug listener
- `src/docs/architecture/12-data-flow-architecture.md` — analisis completo
- `src/docs/architecture/11-decision-log.md` — D-039

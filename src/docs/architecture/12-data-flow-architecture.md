# Arquitectura de Datos: Cloud Function vs Frontend

> Documento creado: 2026-05-03 | Sprint 10 | D-039
> Estado: ANALISIS COMPLETO — implementacion parcial completada, pendientes documentados

---

## Problema Original

La Cloud Function (`syncWeatherLogic.ts`) duplicaba la logica de clasificacion de clima que ya existia en el frontend (`weatherService.ts`). Usaba ademas un algoritmo inferior (texto libre de `IconPhrase` vs numeros de `WeatherIcon`). Resultado:

- **Preview/prod mostraba climas incorrectos** respecto a localhost
- `mapAccuWeatherCondition("Mostly Sunny")` != `resolveCondition(2, windKmh, gustKmh)` — pueden diferir
- Windy override (viento > 29 km/h) no existia en CF, solo en frontend
- Cualquier cambio al algoritmo requeria actualizar dos lugares

---

## Arquitectura Actual (post D-039)

### Principio fundamental

**La Cloud Function persiste datos raw. El frontend clasifica.**

La logica de clasificacion vive en UN SOLO LUGAR: `src/services/weather/weatherService.ts`.

```
AccuWeather API
    │
    ▼ (Cloud Function — server-side, ACCUWEATHER_KEY en servidor)
syncWeatherLogic.ts
    │  Guarda: icon_code, icon_phrase, wind_kmh, gust_kmh, temp_c, humidity
    │  NO clasifica. NO calcula condition. NO calcula boostedTypes.
    ▼
Firestore /city_weather/{cityId}/forecasts/{YYYY-MM-DD-HH}
    │  Schema raw:
    │    snapshots[].icon_code       ← WeatherIcon AccuWeather (1-44)
    │    snapshots[].icon_phrase     ← Texto crudo ("Mostly Sunny")
    │    snapshots[].wind_kmh
    │    snapshots[].gust_kmh        ← NUEVO: necesario para Windy override
    │    snapshots[].temp_c
    │    snapshots[].humidity
    │    snapshots[].has_precipitation
    ▼
getWeatherFromFirestore() — firebaseWeatherService.ts
    │  Lee snapshots[0] (hora actual)
    │  Llama: resolveCondition(icon_code, wind_kmh, gust_kmh)
    │  Llama: CONDITION_TO_TYPES[condition]
    │  Retorna City-compatible con condition + boostedTypes correctos
    ▼
React state → UI
```

### Flujo localhost (dev)

```
AccuWeather API
    │ (via Vite proxy /api/accuweather → VITE_ACCUWEATHER_KEY)
    ▼
weatherService.ts:fetchCityWeather()
    │  resolveCondition(iconId, wind, gust) ← misma funcion
    │  createForecastSnapshots() ← schema compatible (raw_condition_code etc.)
    ▼
batchWeatherService.ts:saveCityForecast()  ← guarda en Firestore (mismo schema)
    ▼
useWeather.ts → React state → UI
```

---

## Separacion de Responsabilidades

| Responsabilidad | Quien | Archivo |
|---|---|---|
| Fetch AccuWeather (prod/preview) | Cloud Function | `functions/src/syncWeatherLogic.ts` |
| Fetch AccuWeather (dev local) | Frontend | `weatherService.ts:getHourlyForecasts()` |
| Clasificar clima PGO | **Solo frontend** | `weatherService.ts:resolveCondition()` |
| Calcular tipos Pokemon | **Solo frontend** | `weatherService.ts:CONDITION_TO_TYPES` |
| Persistir en Firestore (prod) | Cloud Function | `syncWeatherLogic.ts:saveCityForecast()` |
| Persistir en Firestore (dev) | Frontend | `firebaseWeatherService.ts:saveCityForecast()` |
| Leer Firestore → UI | Frontend | `firebaseWeatherService.ts:getWeatherFromFirestore()` |
| Cache local | Frontend | `cacheService.ts` (IndexedDB) |

---

## Problema Detectado: useFirestoreSync No Funciona

### Sintoma
`useFirestoreSync.ts` escucha cambios en `/city_weather` (documentos raiz). La CF escribe en `/city_weather/{id}/forecasts/{date_hour}` (subcoleccion). Los cambios en subcolecciones **NO disparan** el listener del documento raiz en Firestore.

### Consecuencia
El real-time update de US-1101 (actualizacion automatica cada HH:00) no funciona. La app no se actualiza cuando el cron ejecuta. El flujo que SÍ funciona es el load inicial via `getWeatherFromFirestore()`.

### Solucion Pendiente (no implementada)

**Opcion A (recomendada):** La CF escribe un documento resumen en el raiz de `/city_weather/{cityId}` con los campos clasificados por el frontend. Para eso:
1. CF guarda raw en subcoleccion `forecasts` (como ahora)
2. CF tambien escribe un summary doc en `/city_weather/{cityId}` con `updatedAt: now()`
3. `useFirestoreSync` detecta el cambio del summary doc, dispara re-fetch via `getWeatherFromFirestore()`

**Opcion B:** Cambiar listener a `collectionGroup('forecasts')` con `onSnapshot`. Mas reactivo pero mas costoso en Firestore reads.

**Prioridad:** Media — el app funciona (carga correcta al iniciar), solo falta el push automatico.

---

## Variables de Entorno: Separacion Dev vs Prod

### Regla critica

| Variable | Dev (`.env.local`) | Prod (Vercel) | Cloud Function (`functions/.env`) |
|---|---|---|---|
| `VITE_ACCUWEATHER_KEY` | ✅ Requerida | ❌ NO debe estar | ❌ No aplica |
| `ACCUWEATHER_KEY` | ❌ No aplica | ❌ No aplica | ✅ Requerida |
| `VITE_FIREBASE_*` | ✅ Requeridas | ✅ Requeridas | ❌ No aplica |

**En prod/preview, `VITE_ACCUWEATHER_KEY` NO debe existir en Vercel.** Si existe, el frontend intenta llamar AccuWeather directamente (CORS bloqueado) en vez de leer de Firestore.

### Flujo por entorno

```
LOCALHOST (dev):
  - VITE_ACCUWEATHER_KEY presente → frontend llama AccuWeather via proxy Vite
  - Resultado: datos frescos siempre, sin depender del cron

PREVIEW / PRODUCCION:
  - VITE_ACCUWEATHER_KEY ausente → frontend lee solo de Firestore
  - ACCUWEATHER_KEY en CF → cron llama AccuWeather cada HH:00
  - Resultado: datos del ultimo cron (max 1h de lag)
```

---

## Estado de Implementacion

### Completado (D-039, 2026-05-03)

- [x] `syncWeatherLogic.ts`: Eliminado `mapAccuWeatherCondition()` y `calculateCondition()`
- [x] `syncWeatherLogic.ts`: `WeatherSnapshot` ahora es raw (`icon_code`, `gust_kmh`, etc.)
- [x] `firebaseWeatherService.ts:getWeatherFromFirestore()`: Clasifica con `resolveCondition()`
- [x] `useFirestoreSync.ts`: Documentado el bug del listener + schema actualizado

### Pendiente (siguiente sesion)

- [ ] **Deploy CF** con nuevo schema a Firebase Functions
- [ ] **Verificar** que Firestore recibe documentos con `icon_code` en vez de `condition`
- [ ] **Implementar** real-time update (Opcion A: summary doc en raiz)
- [ ] **Eliminar** `VITE_ACCUWEATHER_KEY` de Vercel si existe
- [ ] **Limpiar** logs de diagnostico agregados en commits f8c093e y anteriores
- [ ] **Eliminar** `calculated_condition` de `ForecastDoc` (ya no aplica con raw schema)

---

## Archivos Clave

| Archivo | Rol | Notas |
|---|---|---|
| `functions/src/syncWeatherLogic.ts` | CF: fetch + persist raw | ACTUALIZADO D-039 |
| `src/services/weather/weatherService.ts` | Clasificacion PGO | Source of truth algoritmo |
| `src/services/firebase/firebaseWeatherService.ts` | Lee Firestore → City | ACTUALIZADO D-039 |
| `src/hooks/useFirestoreSync.ts` | Real-time listener | BUG: listener en raiz, no forecasts |
| `src/hooks/useWeather.ts` | Orquesta carga inicial | Llama getWeatherFromFirestore |
| `src/services/weather/batchWeatherService.ts` | Batch fetch dev | Llama fetchCityWeather + saveCityForecast |

---

## Decisiones Relacionadas

- **D-005**: Guardado centralizado en batchWeatherService (no en useWeather)
- **D-019**: Lectura optimizada IndexedDB primero
- **D-021**: Arquitectura servidor-side sync (US-1101)
- **D-036**: AccuWeather base URL: dataservice.accuweather.com
- **D-039**: CF guarda raw, frontend clasifica (este documento)

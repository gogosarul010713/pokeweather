# Sprint 10 — Cloud Function Cities Fix

**Fecha:** 2026-05-02
**Rama:** sprint-10
**Archivos modificados:** `functions/src/syncWeatherLogic.ts`

---

## Contexto

La Cloud Function `syncWeatherScheduled` (cron `0 * * * *` UTC) es responsable de escribir
forecasts en Firestore para que el cliente los consuma via `useFirestoreSync`. Durante una
auditoria de BigQuery (`weather_analytics.snapshots_flat`) se detecto que la tabla mostraba
mezcla de `city_id` viejos y nuevos, y que la prediction table del dashboard mostraba ciudades
incorrectas (sydney, tokyo, london) en lugar de las ciudades activas del JSON.

---

## Problema

### Prediction table mostraba ciudades erroneas

La tabla de predicciones del dashboard mostraba datos de:
- sydney, tokyo, london, newyork, saopaulo

Siendo que las ciudades activas del proyecto en `src/data/pokedensity-cities.json` son:
- pier-39-san-francisco, times-square-midtown-nyc, zaragoza-centro, auckland-waterfront, itaewon-jung-gu-se-l

---

## Causa Raiz

`functions/src/syncWeatherLogic.ts` tenia un array `CITIES` hardcodeado con 5 ciudades del
sprint anterior. El array nunca se actualizo cuando se reemplazaron las ciudades en el JSON
del cliente. Como resultado, el cron escribia forecasts en Firestore con `city_id` obsoletos
que ya no coincidian con ningun pin del mapa.

Evidencia en BigQuery: `weather_analytics.snapshots_flat` mostraba `city_id` de las dos
generaciones de ciudades coexistiendo en la misma tabla.

El campo `country` y `region` en los documentos de Firestore eran literales `'Unknown'` /
`'unknown'` porque `saveCityForecast()` usaba strings hardcodeados en lugar de los datos del
array `CITIES`.

---

## Solucion

**Archivo:** `functions/src/syncWeatherLogic.ts`

### 1. Interface `CityData` — campos agregados

Antes la interface no tenia `country` ni `region`. Se agregaron:

```typescript
interface CityData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  accuLocationKey: number;
  country: string;   // agregado
  region: string;    // agregado
}
```

### 2. Array `CITIES` — reemplazado completo

Las 5 ciudades antiguas fueron reemplazadas por las 5 ciudades activas del JSON:

| id | accuLocationKey | Ciudad | Pais |
|----|-----------------|--------|------|
| `pier-39-san-francisco` | 2628254 | San Francisco | USA |
| `times-square-midtown-nyc` | 2627484 | New York | USA |
| `zaragoza-centro` | 306788 | Zaragoza | Spain |
| `auckland-waterfront` | 3590462 | Auckland | New Zealand |
| `itaewon-jung-gu-se-l` | 3430003 | Seoul | South Korea |

Los `accuLocationKey` se obtuvieron via AccuWeather geoposition API usando las coordenadas
exactas del JSON. Los IDs se generaron con el mismo algoritmo que usa el cliente:
`name.toLowerCase().replace(/[^a-z0-9]+/g, '-')`.

### 3. `saveCityForecast()` — campos corregidos

Antes:
```typescript
country: 'Unknown',
region: 'unknown',
```

Despues:
```typescript
country: city.country,
region: city.region,
```

---

## Verificacion

Deploy ejecutado via Firebase CLI. Verificacion en Firestore Console:
- Coleccion `city_weather` — 5 documentos con los nuevos `city_id`
- Timestamps correspondientes a 2026-05-02-16 (primera ejecucion post-deploy)
- Campos `country` y `region` con valores correctos (no `'Unknown'`)

### Verificacion en produccion (2026-05-02)

Prueba manual via Testing Tools → tab "Limpiar" → Cascade Delete + IDB + localStorage:

```
✅ Eliminados: 50 docs (Firestore) + 56 items (IDB) + localStorage
```

- Cleanup de Firestore funciona correctamente
- Tabla predictiva se recarga automaticamente despues del cleanup (refreshKey mechanism)
- Datos nuevos visibles en tabla inmediatamente post-limpieza

---

## Hallazgos Adicionales

### Dos mecanismos de refresh corriendo en paralelo

Durante la auditoria se identificaron tres circuitos de datos independientes:

**Circuito 1 — Cliente** (`useWeather.ts`):
- Lee `src/data/pokedensity-cities.json`
- Llama AccuWeather por cada ciudad
- Escribe en sidebar, Firestore e IndexedDB
- Tiene `scheduleNextRefresh()`: timer JS que ejecuta en HH:00 del browser

**Circuito 2 — Cloud Function** (`syncWeatherLogic.ts`):
- Lee array `CITIES` hardcodeado en la funcion
- Llama AccuWeather por cada ciudad
- Escribe solo en Firestore
- Cron: `0 * * * *` UTC

**Circuito 3 — Listener** (`useFirestoreSync.ts`):
- `onSnapshot(city_weather)` escucha cambios en Firestore
- Hace merge en `App.tsx:94` via `prevCities.map(...)`
- Solo actualiza sidebar — NO actualiza IndexedDB cache ni prediction table

**Problema de doble consumo:** El timer del cliente (Circuito 1) y el cron (Circuito 2)
ejecutan ambos cada hora en produccion, consumiendo el doble de cuota de AccuWeather.

**Decision tomada:** El timer del cliente se mantiene activo para desarrollo local (entorno
sin Firebase/emulator). Eliminar el timer en produccion requiere primero que `useFirestoreSync`
actualice tambien IndexedDB y la prediction table — de lo contrario la app quedaria sin datos
si el cron falla.

### Vulnerabilidad en carga inicial (`useWeather.ts:366`)

El catch en `useWeather.ts` alrededor de linea 366 llama `setLoadingStatus('error')` pero
no invoca `onReady`, dejando `cities` vacio. Cuando `useFirestoreSync` intenta el merge en
`App.tsx:94`:

```typescript
// App.tsx ~94
prevCities.map(c => firestoreData[c.id] ?? c)
```

Si `prevCities` es `[]`, el map devuelve `[]` aunque Firestore tenga datos. El listener de
Firestore no puede rescatar la app si la carga inicial falla completamente.

Estado: pendiente verificacion en produccion post-fix del Circuito 2.

---

## Error conocido en produccion

### `auth/invalid-api-key` en consola del browser

```
❌ Firebase initialization failed (lazy): FirebaseError: Firebase: Error (auth/invalid-api-key).
```

**Causa:** Firebase Authentication se inicializa de forma lazy en `firebaseConfig.ts`. Cuando se llama a `getAuth()` (usado por algunos servicios), Firebase valida la `VITE_FIREBASE_API_KEY`. Si la key configurada en Vercel es valida para Firestore pero no tiene Firebase Auth habilitado, o si el dominio de Vercel no esta en la lista de dominios autorizados de Firebase, Authentication falla.

**Impacto:** Solo afecta a Firebase Authentication. La app NO usa Auth para login de usuarios. Los servicios que si usa (Firestore, Cloud Functions) funcionan independientemente. El error es ruido en consola pero no rompe ninguna funcionalidad visible.

**Como verificar que no afecta:** Cleanup funciona, tabla predictiva carga datos reales, sidebar muestra ciudades — todo operativo a pesar del error.

**Solucion si se quiere eliminar el error:**
1. Firebase Console → Authentication → Settings → Authorized domains
2. Agregar el dominio de Vercel (ej: `pokeweather-one.vercel.app`)
3. O deshabilitar la inicializacion lazy de Auth si la app no la usa

---

## Pendientes

| # | Descripcion | Dependencia |
|---|-------------|-------------|
| US futura | Eliminar timer `scheduleNextRefresh()` en produccion | `useFirestoreSync` debe actualizar IndexedDB + prediction table |
| US futura | `useFirestoreSync` debe ser el unico mecanismo de actualizacion en produccion | Timer eliminado |
| Verificar | Comportamiento de "Ciudades 0" en sidebar post-deploy — causa raiz en `useWeather.ts:366` | Deploy en produccion |
| Verificar | `weather_analytics.snapshots_flat` en BigQuery — confirmar que ya no aparecen `city_id` obsoletos | 24h post-deploy |

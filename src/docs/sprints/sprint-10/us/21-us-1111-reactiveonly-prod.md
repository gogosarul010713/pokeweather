# US-1111: App Reactiva en Produccion — Eliminar Timer Cliente en Prod

**Sprint:** 10 (Ampliacion, Fase 10)
**Story Points:** 3-4 SP
**Prioridad:** Alta
**Estado:** Documentada, Ready for Implementation
**Rama:** `sprint-10`

---

## Descripcion

En produccion, el unico responsable de consultar AccuWeather y escribir en Firestore
debe ser la Cloud Function cron (`syncWeatherScheduled`, `0 * * * *` UTC).

La app React debe ser **puramente reactiva**: escucha Firestore via `useFirestoreSync`
y refleja los cambios en la UI. No debe tener su propio timer que llame AccuWeather.

En **desarrollo local**, el timer cliente-side (`scheduleNextRefresh` en `useWeather.ts`)
se conserva activo para que el dev pueda trabajar sin necesidad del emulador de Firebase.

---

## Contexto Tecnico

### Estado actual

`useWeather.ts` contiene:
- `scheduleNextRefresh()` — timer JS que a HH:00 del browser llama AccuWeather directamente
- `doRefresh()` — ejecuta `loadCities(forceRefresh=true)` => AccuWeather => Firestore + IndexedDB
- `handleVisibilityChange()` — pausa/reschedule el timer segun visibilidad de la app

`useFirestoreSync.ts` contiene:
- `onSnapshot(collection(db, 'city_weather'))` — listener permanente
- Cuando Firestore cambia, dispara `onUpdate(cities)` que actualiza el sidebar en `App.tsx`

### El problema con eliminar el timer sin mas

Si se elimina el timer, `useFirestoreSync` solo actualiza el sidebar (condicion, tempC, etc.).
Queda sin cubrir:

| Efecto lateral actual (via timer) | Responsable actual |
|-----------------------------------|-------------------|
| Cache IndexedDB actualizado | `doRefresh` -> `cacheService.setCachedWeather` |
| `pwe-lastUpdateHour` en localStorage | `doRefresh` -> `shouldRefreshCities` lo lee |
| Cache de subcol. `forecasts` invalidado | `doRefresh` (forceRefresh) |

Si `useFirestoreSync` no cubre estos efectos, la app en produccion mostrara datos
actualizados en el sidebar pero el cache quedara stale, la tabla de predicciones
no refrescara, y `shouldRefreshCities()` no sabra que ya hay datos frescos.

---

## Objetivo

Modificar `useFirestoreSync` para que, al detectar cambios reales en Firestore, ejecute
los mismos efectos laterales que hoy ejecuta `doRefresh`:

1. Actualizar el sidebar (ya lo hace)
2. Actualizar cache IndexedDB con los nuevos datos de climas
3. Actualizar `pwe-lastUpdateHour` en localStorage
4. Invalidar cache de predicciones para forzar refetch en proxima apertura de la tabla

Y condicionar `scheduleNextRefresh` para que solo corra en entorno de desarrollo.

---

## Criterios de Aceptacion

### Comportamiento en Produccion (`PROD=true` o `import.meta.env.PROD`)

- [ ] `scheduleNextRefresh()` NO se registra al montar la app
- [ ] La app NO llama AccuWeather directamente desde el cliente
- [ ] `useFirestoreSync` detecta cambios en `city_weather` via `onSnapshot`
- [ ] Al recibir datos nuevos de Firestore, actualiza `cacheService.setCachedWeather` para cada ciudad
- [ ] Al recibir datos nuevos de Firestore, escribe `pwe-lastUpdateHour` en localStorage
- [ ] Al recibir datos nuevos de Firestore, invalida el cache de predicciones (subcol. `forecasts`)
  para que la tabla fuerce refetch en la proxima interaccion
- [ ] El sidebar refleja los cambios en <1 segundo desde que Firestore recibe la escritura del cron
- [ ] La tabla de predicciones muestra datos actualizados al abrirse despues del cron

### Comportamiento en Desarrollo (`import.meta.env.DEV`)

- [ ] `scheduleNextRefresh()` se registra normalmente
- [ ] `doRefresh()` funciona igual que antes (AccuWeather => Firestore + IndexedDB)
- [ ] No se requiere Firebase Emulator para que el dev trabaje

### Caso edge: snapshot con `hasPendingWrites`

- [ ] Si el snapshot tiene `hasPendingWrites === true`, los efectos laterales NO se ejecutan
  (evitar double-write durante el flush local de Firestore)

### Caso edge: Firestore offline / error de red

- [ ] Si `onSnapshot` emite un error, la app mantiene los datos del cache IndexedDB
- [ ] No se lanza un error sin manejar (silent log + estado de error en store es suficiente)

### Caso edge: datos de Firestore identicos al cache

- [ ] Se puede comparar `updated_at` del doc de Firestore vs timestamp del cache local
- [ ] Si son iguales, no se reescribe IndexedDB (evitar writes innecesarios)
- [ ] Criterio minimo aceptable: si no se implementa la comparacion, el write igual es correcto
  (idempotente), pero es la opcion suboptima

---

## Notas Tecnicas de Implementacion

### 1. Guard de entorno en `useWeather.ts`

```typescript
// Solo en dev
if (import.meta.env.DEV) {
  scheduleNextRefresh()
}
```

`import.meta.env.PROD` / `import.meta.env.DEV` son inyectadas por Vite en build time.
No requiere variable de entorno adicional.

### 2. Nuevos efectos en `useFirestoreSync.ts`

El callback `onUpdate` que recibe `useFirestoreSync` actualmente solo setea estado React.
Debe ampliarse para ejecutar los efectos laterales despues de actualizar el estado:

```typescript
onSnapshot(collection(db, 'city_weather'), async (snapshot) => {
  if (snapshot.metadata.hasPendingWrites) return

  const cities = snapshot.docs.map(doc => doc.data())

  // Efecto 1: actualizar sidebar (ya existe)
  onUpdate(cities)

  // Efecto 2: actualizar cache IndexedDB
  for (const city of cities) {
    await cacheService.setCachedWeather(city.id, city)
  }

  // Efecto 3: marcar hora de ultima actualizacion
  const hour = new Date().getHours()
  localStorage.setItem('pwe-lastUpdateHour', String(hour))

  // Efecto 4: invalidar cache de predicciones (forecasts)
  for (const city of cities) {
    await cacheService.invalidateForecastCache(city.id)
    // alternativa si no existe el metodo: borrar la entrada de IndexedDB
  }
})
```

La implementacion exacta depende de la API de `cacheService`. El implementador
debe verificar que metodos existen antes de agregar nuevos.

### 3. Separacion de responsabilidades

`useFirestoreSync` es un hook de infraestructura: no debe conocer el store de Zustand.
Los efectos sobre el store (setear ciudades, loading, etc.) deben quedar en el callback
`onUpdate` que el caller (App.tsx o `useWeather.ts`) le pasa.

Los efectos sobre cache/localStorage si pueden ir dentro del hook, o extraerse a
una funcion `syncSideEffects(cities)` que el hook llame internamente.

### 4. Invalidacion de cache de predicciones

La tabla de predicciones usa una subcol. `forecasts` separada. Si `useFirestoreSync`
solo escucha `city_weather`, no tiene los datos de `forecasts` para cachear.

La invalidacion correcta es: marcar el cache de `forecasts` como stale para que
la proxima vez que el usuario abra la tabla se haga un refetch. Esto puede ser:
- Borrar la entrada de IndexedDB para ese `city_id` en el store de forecasts
- O escribir un flag `forecasts_stale: true` en localStorage

La implementacion exacta debe revisarse contra `cacheService` y la logica de
la tabla predictiva antes de decidir.

### 5. Archivos previsiblemente afectados

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useWeather.ts` | Guard `if (import.meta.env.DEV)` en `scheduleNextRefresh` |
| `src/hooks/useFirestoreSync.ts` | Agregar efectos 2, 3, 4 al callback de onSnapshot |
| `src/services/cache/cacheService.ts` | Verificar / agregar `invalidateForecastCache` si no existe |

No se anticipan cambios en `App.tsx` ni en componentes UI salvo que la integracion
lo requiera.

---

## Dependencias

- **US-1101** (completada): Cloud Function `syncWeatherScheduled` cron HH:00 — es el productor
  de datos en produccion. Esta US asume que US-1101 ya esta deployada y funcionando.
- **US-1104** (completada): arquitectura IndexedDB -> Firestore para climas, define como
  se lee y escribe el cache de climas.
- **US-1105** (completada): Delta Sync para tabla predictiva, define el cache de forecasts.

---

## Riesgos

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| `cacheService` no tiene metodo para invalidar forecasts | Media | Agregar el metodo o usar borrado directo de la entrada en IndexedDB |
| Race condition: Firestore snapshot llega antes de que IndexedDB termine de inicializar | Baja | Verificar que `cacheService` esta listo antes de escribir; el hook ya hace setup async |
| Dev confunde que el timer esta desactivado en prod y lo reporta como bug | Media | Documentar el guard en comentario inline en `useWeather.ts` |

---

## Definition of Done

- [ ] Build `npm run build` sin errores ni warnings nuevos
- [ ] En dev (`npm run dev`): `scheduleNextRefresh` corre, comportamiento igual al actual
- [ ] En prod (build deployado en Vercel): no hay llamadas a AccuWeather desde el cliente
  (verificable con DevTools Network tab filtrando por `accuweather`)
- [ ] Despues del cron HH:00: sidebar actualizado, tabla predictiva actualizada al abrirla,
  `pwe-lastUpdateHour` en localStorage refleja la hora actual
- [ ] Tests unitarios de `useFirestoreSync` actualizados para cubrir los nuevos efectos

---

**Creado:** 2026-05-02
**Tipo:** Refactor de arquitectura (produccion vs desarrollo)
**Relacionada con:** US-1101, US-1104, US-1105

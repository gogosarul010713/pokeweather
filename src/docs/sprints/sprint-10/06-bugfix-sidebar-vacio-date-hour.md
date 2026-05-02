# Sprint 10 — Bugfix: Sidebar Vacío + date_hour Incorrecto

**Fecha:** 2026-05-02
**Rama:** sprint-10
**Commit:** 645430d
**Estado:** FIX APLICADO — pendiente validacion en produccion

---

## Bug 1: Sidebar muestra "Ciudades 0" tras segunda ejecucion del cron

### Sintoma
Despues de la primera ejecucion exitosa del cron a HH:00 UTC, la segunda ejecucion
deja el sidebar sin ciudades ("Ciudades 0").

### Causa Raiz
`useWeather.ts` — funcion `doRefresh()`:

```typescript
// ANTES (roto)
} catch (error) {
  console.error('❌ Auto-refresh error:', error)
  setLoadingStatus('error')
  refreshRef.current = setTimeout(() => scheduleNextRefreshRef.current(), 60 * 1000)
  // ❌ onReadyRef.current() NUNCA se llama — cities queda [] en App.tsx
}
```

Cuando `loadCities(true)` falla (AccuWeather rate limit, red, o cualquier error),
el catch solo registra el error y reprograma el timer. Nunca llama `onReadyRef.current()`
con datos alternativos. El estado `cities` en App.tsx queda vacio.

El agravante: `useFirestoreSync` en App.tsx hace merge con `prevCities.map(...)`.
Si `prevCities = []`, el merge devuelve `[]` aunque Firestore tenga datos frescos.

### Fix Aplicado
`src/hooks/useWeather.ts` — `doRefresh()`:

```typescript
// DESPUES (fix)
} catch (error) {
  console.error('❌ Auto-refresh AccuWeather error, falling back to cache/Firestore:', error)

  try {
    const rawCities = await import('../data/pokedensity-cities.json').then(m => m.default || m)
    const cities = transformCitiesToCityFormat(rawCities)
    const fallbackCities = await loadCitiesFromCache(cities)  // IndexedDB → Firestore
    if (fallbackCities.length > 0) {
      setLoadingStatus('ready')
      setLastUpdated(Date.now())
      onReadyRef.current(fallbackCities)  // ✅ sidebar recibe datos
    } else {
      setLoadingStatus('error')
    }
  } catch {
    setLoadingStatus('error')
  }

  // Reintentar AccuWeather en 5 minutos (antes: 1 minuto)
  refreshRef.current = setTimeout(() => scheduleNextRefreshRef.current(), 5 * 60 * 1000)
}
```

`loadCitiesFromCache()` ya implementa 2 capas:
- CAPA 1: IndexedDB por `accuLocationKey` (40ms)
- CAPA 2: Firestore por `city.id` si IndexedDB esta vacio (300-500ms)

### Estado Post-Fix
- Fix commiteado: `645430d`
- Push a `sprint-10` realizado
- Vercel auto-deploya desde el push
- **PENDIENTE VALIDAR**: Si el sidebar mantiene datos cuando AccuWeather falla

---

## Bug 2: date_hour registrado con +1 hora incorrecta

### Sintoma
La tabla predictiva mostraba registros de las "17:00" cuando todavia eran las 16:00.
Los forecasts de las 10:00 y 11:00 aparecian con hora desplazada.

### Causa Raiz
`functions/src/syncWeatherLogic.ts` — funcion `getDateHourKey()`:

```typescript
// ANTES (roto)
function getDateHourKey(): string {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(nextHour.getHours() + 1, 15, 0, 0)  // ← +1 hora innecesaria
  // ...
}
```

El cron se ejecuta exactamente a HH:00 UTC via Google Cloud Scheduler.
Al sumar +1, el documento quedaba guardado con la hora siguiente en lugar de la hora actual.

### Fix Aplicado
`functions/src/syncWeatherLogic.ts`:

```typescript
// DESPUES (fix)
function getDateHourKey(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const hour = String(now.getUTCHours()).padStart(2, '0')
  return `${year}-${month}-${day}-${hour}`
}
```

Cambios:
1. Elimina el `+1` — el cron corre en HH:00, esa ES la hora del forecast
2. Usa metodos UTC explicitos (`getUTCHours()` etc.) — el servidor de Google Cloud
   corre en timezone UTC, pero `getHours()` usaria el timezone del proceso Node.js
   que puede variar

### Deploy
- Fix commiteado en `645430d` junto con Bug 1
- Cloud Functions redeploy ejecutado exitosamente antes del commit de la app
- **VALIDADO PARCIALMENTE**: syncWeatherManual respondio 5/5 ciudades correctas post-deploy

---

## Estado de Validacion

| Bug | Fix aplicado | Validado en prod |
|-----|-------------|-----------------|
| Sidebar vacio tras fallo AccuWeather | SI — commit 645430d | PENDIENTE |
| date_hour +1 hora | SI — commit 645430d (functions) | PENDIENTE — esperar proxima HH:00 UTC |
| Auth anonymous error en consola | NO (requiere accion en Firebase Console) | PENDIENTE |

### Accion pendiente para Auth error
Firebase Console → Authentication → Configuracion → Dominios autorizados:
- Agregar: `pokeweather-one.vercel.app`

---

## Contexto Adicional: Por que sigue fallando

El usuario reporto "esta fallando" al final de la sesion. El fix del sidebar vacio
(Bug 1) fue el ultimo cambio antes de cerrar. Las causas posibles de fallo persistente:

1. **Vercel no termino el deploy** — el push fue el ultimo paso, el deploy tarda ~2 min
2. **Cache del browser** — si el usuario refresco antes de que Vercel terminara
3. **El fallback de Firestore tambien esta vacio** — si se hizo cascade delete de todos
   los docs antes de que el cron escribiera con las ciudades correctas, Firestore puede
   no tener datos para el fallback
4. **Causa desconocida** — la sesion se cerro antes de diagnosticar con evidencia

### Proximos pasos para diagnosticar en nueva sesion
1. Verificar en Vercel Dashboard que el deploy del commit `645430d` fue exitoso
2. Abrir la app y revisar consola del browser — buscar el log nuevo:
   `✅ Fallback: X ciudades desde caché/Firestore`
3. Si el fallback no se activa, el problema es anterior al doRefresh (carga inicial)
4. Revisar si Firestore tiene datos en `city_weather/{nuevas-ciudades}/forecasts/`

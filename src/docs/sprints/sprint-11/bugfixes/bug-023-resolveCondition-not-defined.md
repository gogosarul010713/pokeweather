# BUG-023 — resolveCondition is not defined (5 ciudades fallaban en dev)

**Sprint:** 11
**Tipo:** Bug
**Severidad:** Critica (sidebar vacio en dev — 0/5 ciudades mostradas)
**Estado:** RESUELTO
**Fecha deteccion:** 2026-06-10
**Fecha resolucion:** 2026-06-10

---

## Sintoma

En dev (localhost), al cargar la app todas las ciudades fallaban con:

```
⚠️ 5 ciudades fallaron:
[{city: "Pier 39, San Francisco", error: "Failed to fetch weather for ...: resolveCondition is not defined"}, ...]
```

El sidebar mostraba 0 ciudades. El mapa aparecia vacio.

## Causa raiz

`weatherService.ts` hacia `export * from './weatherClassify'` para re-exportar el algoritmo,
pero **no importaba las funciones al scope local del modulo**.

En JS/TS, `export * from` re-exporta hacia afuera pero no trae los simbolos al scope local.
Las llamadas a `resolveCondition(...)`, `getBaseCondition(...)` y `WEATHER_TRANSLATIONS[...]`
dentro de `fetchCityWeather` y `createForecastSnapshots` lanzaban `ReferenceError` en runtime.

## Cuando se introdujo

BL-012 / D-042 (commit `1192ad5`): al extraer el algoritmo a `weatherClassify.ts`,
se agrego `export * from './weatherClassify'` pero se omitio el `import` para uso interno.

Solo afectaba el path de AccuWeather (dev). El path de Firestore (prod) no llama estas
funciones directamente en `weatherService.ts`, sino en `firebaseWeatherService.ts`
que si tenia el import correcto.

## Fix

**Archivo:** `src/services/weather/weatherService.ts`

Linea agregada:
```ts
import { resolveCondition, getBaseCondition, WEATHER_TRANSLATIONS } from './weatherClassify'
```

## Verificacion

Post-fix: `5/5 ciudades actualizadas, 10 API calls, 702ms`. Sidebar muestra todas las ciudades.

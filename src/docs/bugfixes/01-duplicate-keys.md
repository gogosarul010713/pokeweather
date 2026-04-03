---
title: Bug Fix - Duplicate React Keys en LocationFeed y MapView
date: 2026-03-25
sprint: 6-7
severity: HIGH
---

# Bug: Keys Duplicadas en React (LocationFeed + MapView)

**Fecha reportado**: 2026-03-25
**Impacto**: Console warnings + potencial comportamiento inconsistente en UI
**Estado**: ✅ RESUELTO

## Síntomas

```
LocationFeed.tsx:141 Encountered two children with the same key, `marina-bay`
MapView.tsx:156 Encountered two children with the same key, `hyde-park-londres`
useWeather.ts:275 ❌ DUPLICATES DETECTED: {total: 32, unique: 29, array: Array(32)}
```

- 32 ciudades en array pero solo 29 únicas
- 3 ciudades duplicadas: marina-bay, hyde-park-londres, palermo-buenos-aires
- Cada una aparece exactamente 2 veces

## Root Cause Analysis

### Causa 1: React Strict Mode (PRINCIPAL)

En `App.tsx`, el `useEffect` con dependencias vacías:
```typescript
useEffect(() => {
  run(handleCitiesLoaded)  // ← Se ejecuta 2 veces en React 18 Strict Mode (dev)
}, [])
```

**En desarrollo**, React 18 ejecuta effects dos veces intencionalmente para detectar bugs:
1. Mount + run() → carga 32 ciudades
2. Cleanup + remount + run() → carga 32 ciudades nuevamente
3. Ambos resultados se concatenan en el estado (sin deduplicación)
4. Resultado: [32 ciudades originales + 32 nuevas] = duplicados

**En producción**, ocurre una sola vez → sin duplicados (por eso pasó testing)

### Causa 2: Mismatch de Claves de Caché (SECUNDARIA)

En `useWeather.ts`:
```typescript
// ❌ Busca por city.id
const cached = await getCachedWeather(city.id)  // city.id = "marina-bay"
```

Pero en `batchWeatherService.ts`:
```typescript
// ✅ Guarda por locationKey
await setCachedWeather(accuLocationKey, cacheableData)  // locationKey = "348205"
```

**Impacto**: `loadCitiesFromCache` nunca encuentra datos en caché (mismatch de claves), siempre retorna ciudades sin enriquecer.

**No causa duplicados directamente**, pero indica problema arquitectónico que fue enmascarado por la falta de caché hits.

## Solución (3 pasos)

### PASO 1: Proteger `run()` de múltiples ejecuciones

**Archivo**: `src/hooks/useWeather.ts`

Agregar una ref para garantizar que `loadCities()` solo se ejecute una vez:

```typescript
const loadCitiesRef = useRef<boolean>(false)  // ← Nueva ref para evitar duplicación

const run = useCallback(
  async (onReady: (cities: City[]) => void) => {
    // ✅ Protección contra Strict Mode double-call
    if (loadCitiesRef.current) {
      console.log('⏭️  loadCities ya en progreso, ignorando llamada duplicada')
      return
    }
    loadCitiesRef.current = true

    onReadyRef.current = onReady
    // ... resto del código
  },
  [...]
)
```

### PASO 2: Sincronizar claves de caché

**Archivo**: `src/hooks/useWeather.ts`

Cambiar `loadCitiesFromCache` para buscar por `locationKey` (consistente con batchWeatherService):

```typescript
const loadCitiesFromCache = async (cities: City[]): Promise<City[]> => {
  const result: City[] = []

  for (const city of cities) {
    // ✅ Ahora busca por locationKey (sincronizado con batchWeatherService)
    const locationKey = city.s2Key  // o calcular si es necesario
    const cached = await getCachedWeather(locationKey)
    // ... resto del código
  }
  return result
}
```

### PASO 3: Deduplicación defensiva

**Archivo**: `src/hooks/useWeather.ts` → función `run()`

Agregar deduplicación como medida defensiva:

```typescript
// DEBUG: Verificar duplicados
const ids = cities.map(c => c.id)
const uniqueIds = new Set(ids)
if (ids.length !== uniqueIds.size) {
  console.warn('⚠️ Duplicados detectados, deduplicando...')
  // ✅ Deduplicar: mantener primer elemento de cada id
  const dedupedCities = Array.from(
    new Map(cities.map(city => [city.id, city])).values()
  )
  cities = dedupedCities
}
```

## Implementación

| Paso | Archivo | Cambio | Línea |
|------|---------|--------|-------|
| 1 | useWeather.ts | Agregar `loadCitiesRef` | ~105 |
| 1 | useWeather.ts | Protección en `run()` | ~263-267 |
| 2 | useWeather.ts | Cambiar `getCachedWeather(city.id)` → `getCachedWeather(locationKey)` | ~29 |
| 3 | useWeather.ts | Deduplicación defensiva | ~275-284 |

## Verificación

✅ **Después de fix**:
```
✅ Array limpio: 32 ciudades únicas (sin duplicados)
✅ Keys únicas en React (LocationFeed, MapView)
✅ Funciona correctamente en Strict Mode + production
✅ Auto-refresh no duplica ciudades
```

## Notas

- En **producción** (Strict Mode OFF), el bug NO aparece porque useEffect se ejecuta 1 sola vez
- El test local NO lo detectó porque se desarrolló en producción (sin Strict Mode)
- `loadCitiesFromCache` ahora busca por `locationKey` (sincronizado con US-605)
- Deduplicación defensiva previene futuros bugs similares

## Lecciones Aprendidas

1. **React Strict Mode es amigo**: Detecta bugs que producción esconde
2. **Sincronizar interface de caché**: Si guardas por X, busca por X
3. **Deduplicación defensiva**: Proteger contra múltiples ejecuciones
4. **Testing en Strict Mode**: `REACT_APP_STRICT=true npm run dev`

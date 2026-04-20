# US-1008-D: Tests + Validación

**Story Points:** 1 SP
**Epic:** Optimización Firestore — Caché Inteligente
**Prioridad:** Alta
**Status:** Backlog Sprint 10

---

## ✅ Acceptance Criteria

1. Tests unitarios para las funciones de US-1008-B (cacheService)
2. Test de integración para `syncForecastsOnLoad()` (US-1008-C) con Firestore mockeado
3. Validación manual: Network tab muestra delta real (2da apertura = 0 queries)
4. Validación manual: PredictionAnalysisTable abre sin spinner de Firestore

---

## Tests unitarios — cacheService

**File:** `src/services/cache/cacheService.test.ts`

```typescript
// Mock idb-keyval (ya usado en el proyecto)
vi.mock('idb-keyval')

describe('ForecastDoc cache', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  test('getForecastCache retorna [] si no hay datos', async () => {
    vi.mocked(get).mockResolvedValue(undefined)
    expect(await getForecastCache()).toEqual([])
  })

  test('setForecastCache persiste el array', async () => {
    const docs = [mockForecastDoc('city-1', '2026-04-20-10')]
    await setForecastCache(docs)
    expect(set).toHaveBeenCalledWith('pwe-forecast-cache', docs)
  })

  test('mergeForecastDocs: doc existente se actualiza sin duplicar', () => {
    const old = mockForecastDoc('city-1', '2026-04-20-10', 'Sunny')
    const updated = mockForecastDoc('city-1', '2026-04-20-10', 'Rainy')
    const result = mergeForecastDocs([old], [updated])
    expect(result).toHaveLength(1)
    expect(result[0].calculated_condition).toBe('Rainy')
  })

  test('mergeForecastDocs: doc nuevo se agrega', () => {
    const a = mockForecastDoc('city-1', '2026-04-20-10')
    const b = mockForecastDoc('city-2', '2026-04-20-10')
    expect(mergeForecastDocs([a], [b])).toHaveLength(2)
  })

  test('cleanExpiredForecastDocs: elimina docs > 7 días', () => {
    const old = mockForecastDocWithAge(8 * 24 * 60 * 60 * 1000) // 8 días
    const fresh = mockForecastDocWithAge(1 * 24 * 60 * 60 * 1000) // 1 día
    const result = cleanExpiredForecastDocs([old, fresh])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(fresh)
  })

  test('getLastSyncTimestamp retorna 0 si no hay sync previo', () => {
    expect(getLastSyncTimestamp()).toBe(0)
  })

  test('setLastSyncTimestamp persiste y getLastSyncTimestamp lo lee', () => {
    const ts = Date.now()
    setLastSyncTimestamp(ts)
    expect(getLastSyncTimestamp()).toBe(ts)
  })
})
```

---

## Test de integración — syncForecastsOnLoad

**File:** `src/services/firebase/forecastSyncService.test.ts`

```typescript
vi.mock('../firebase/firebaseWeatherService')
vi.mock('../cache/cacheService')

describe('syncForecastsOnLoad', () => {

  test('primer sync: persiste todos los docs y guarda timestamp', async () => {
    vi.mocked(getLastSyncTimestamp).mockReturnValue(0)
    vi.mocked(getForecastCache).mockResolvedValue([])
    vi.mocked(getRecentForecasts).mockResolvedValue([doc1, doc2, doc3])

    await syncForecastsOnLoad()

    expect(setForecastCache).toHaveBeenCalledWith(expect.arrayContaining([doc1, doc2, doc3]))
    expect(setLastSyncTimestamp).toHaveBeenCalledWith(expect.any(Number))
  })

  test('segundo sync mismo día: 0 docs nuevos → no escribe cache', async () => {
    const lastSync = Date.now() - 5 * 60 * 1000 // 5 min ago
    vi.mocked(getLastSyncTimestamp).mockReturnValue(lastSync)
    vi.mocked(getForecastCache).mockResolvedValue([doc1, doc2])
    vi.mocked(getRecentForecasts).mockResolvedValue([]) // delta = 0

    await syncForecastsOnLoad()

    expect(setForecastCache).not.toHaveBeenCalled() // sin cambios = sin write
  })

  test('Firestore falla → no lanza error, cache viejo intacto', async () => {
    vi.mocked(getRecentForecasts).mockRejectedValue(new Error('Network error'))
    vi.mocked(getForecastCache).mockResolvedValue([doc1])

    await expect(syncForecastsOnLoad()).resolves.not.toThrow()
  })
})
```

---

## Validación manual

```bash
npm run dev
# Abrir http://localhost:5173
# Abrir DevTools → Network tab (filtrar por "firestore.googleapis.com")
```

**Test 1 — Primera carga**
```
Abrir app → ver 1 request a Firestore (forecasts collectionGroup)
Console: [Sync] Started — lastSync: never
Console: [Sync] Delta: X new, 0 cached → X merged. (Xms)
```

**Test 2 — Reload (mismo día)**
```
Recargar página → ver 0 o 1 request con MENOS docs (delta)
Console: [Sync] Delta: 0-5 new, X cached → X merged. (Xms)
```

**Test 3 — Abrir PredictionAnalysisTable**
```
Abrir panel de predicciones
Network tab: 0 nuevos requests a Firestore
Tabla carga inmediatamente (sin spinner de carga de Firestore)
```

**Test 4 — IndexedDB inspection**
```
DevTools → Application → IndexedDB → keyval-store
Key: "pwe-forecast-cache" → ver array de ForecastDoc[]
localStorage → "pwe-lastSync" → ver timestamp numérico
```

---

## Métricas objetivo

| Métrica | Target |
|---------|--------|
| Sync total (1ª vez) | <500ms |
| Sync total (delta 0) | <100ms |
| Abrir tabla (desde cache) | <50ms |
| Tamaño IndexedDB | <2MB para 240 docs |

---

## Dependencias

- Depende de: US-1008-A + US-1008-B + US-1008-C
- Requerido por: nada (última subtarea)

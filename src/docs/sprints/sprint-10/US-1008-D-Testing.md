# US-1008-D: Tests + Validación (QA)

**Story Points:** 2 SP  
**Epic:** Optimización Firestore — Caché Inteligente  
**Prioridad:** Alta  
**Status:** Backlog Sprint 10

---

## 📋 Descripción

Crear tests unitarios e integración para validar:
- Persistencia/retrieve de docs con TTL
- Deduplicación en merge
- Cleanup de expirados
- Sync delta (10 nuevos = 1 query, no 100)
- Validación manual en dev server

---

## ✅ Acceptance Criteria

1. ✅ Tests coverage >80% para `cacheService.ts`
2. ✅ Tests unitarios para:
   - `persistForecastToIndexedDB()` con TTL
   - `getForecastFromCache()` retrieval por (city_id, date_hour)
   - `cleanExpiredForecasts()` elimina solo expirados
   - Deduplicación: upsert sin duplicar
   - `getLastSyncTimestamp()` persiste
3. ✅ Tests de integración:
   - `syncFirestoreToCache()` completo (mock Firestore)
   - Sync delta: 10 docs nuevos = 1 Firestore query
   - Segundo sync: 0 docs nuevos = 0 calls
   - TTL: docs > 7d+1h removidos
4. ✅ Validación manual:
   - DevTools → IndexedDB: ver `forecasts_data` + `forecasts_index`
   - Network tab: Firestore reads reducidos (1 query vs 100)
   - Latencia: sync <500ms
5. ✅ Documentation: test file comenta qué valida cada test
6. ✅ Test command: `npm run test -- cacheService.test.ts`

---

## 📝 Implementación

**File:** `src/services/cache/cacheService.test.ts` (nuevo)

**Structure:**

```typescript
describe('cacheService', () => {
  // Cleanup IndexedDB antes de cada test
  beforeEach(async () => {
    // Limpiar databases
  })

  describe('persistForecastToIndexedDB', () => {
    test('guarda doc con expiresAt correcto', async () => {})
    test('deduplicación: upsert actualiza sin duplicar', async () => {})
  })

  describe('getForecastFromCache', () => {
    test('retrieves por (city_id, date_hour)', async () => {})
    test('retorna null si no existe', async () => {})
  })

  describe('cleanExpiredForecasts', () => {
    test('elimina docs > 7d+1h', async () => {})
    test('preserva docs < 7d', async () => {})
  })

  describe('getLastSyncTimestamp', () => {
    test('persiste entre reads', async () => {})
  })

  describe('syncFirestoreToCache (integration)', () => {
    test('sync delta: 10 nuevos = 1 query', async () => {
      // Mock Firestore con 10 docs nuevos
      // Verificar: query llamado 1 vez (no 100)
    })

    test('segundo sync: 0 nuevos = 0 calls', async () => {
      // Después del primer sync
      // Query sin change → 0 calls
    })

    test('TTL cleanup automático', async () => {
      // Persistir docs con expiración pasada
      // Sync → cleanup automático
      // Verificar removidos
    })

    test('fallback si Firestore falla', async () => {
      // Mock Firestore error
      // Sync debe ser silencioso (no throw)
      // Cache viejo disponible
    })
  })
})
```

---

## 🧪 Manual Validation

**Setup:**
```bash
npm run dev
# Abrir http://localhost:5173
# Abrir DevTools (F12)
```

**Test 1: IndexedDB Inspection**
```
DevTools → Application → IndexedDB → pwe-app
- forecasts_data: ver ~100 docs
- forecasts_index: ver índice con city_id + date_hour
- sync_metadata: ver lastSync timestamp
```

**Test 2: Network tab**
```
Abrir app 1ª vez → 1 query a Firestore (collection group)
Cerrar/reabrir 2ª vez (3 min después) → 0 queries (cache hit)
Console logs: [Sync] Started/Completed
```

**Test 3: Performance**
```
Console: `performance.now()` en logs
Verificar: sync total <500ms
Latencia aceptable: IndexedDB ops <100ms
```

**Test 4: TTL Enforcement**
```
Esperar o falsificar: docs > 7 días en IndexedDB
Hacer sync
Verificar en DevTools: docs expirados removidos
```

---

## 📊 Test Metrics

| Métrica | Target | Validation |
|---------|--------|-----------|
| Coverage | >80% | `npm run test -- --coverage cacheService.test.ts` |
| Sync delta | 10 docs = 1 query | Mock Firestore, contar calls |
| Latencia sync | <500ms | `performance.now()` en logs |
| Storage | <50MB | DevTools → IndexedDB size |
| TTL cleanup | 7d+1h margin | Test docs expirados removidos |

---

## 🔗 Dependencias

- Depende de: US-1008-A + US-1008-B + US-1008-C (todas implementadas)
- Requerido por: Nada (última subtarea)

---

## 📊 Notas

- Tests deben ser aislados (no afectarse unos a otros)
- Mock Firestore para control total (no queries reales)
- Validación manual verifica casos reales que tests pueden no capturar
- Coverage >80% es realista (cacheService es código directo, sin lógica compleja)

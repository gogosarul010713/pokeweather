# US-1008-A: Expandir firebaseWeatherService (Query Delta)

**Story Points:** 2 SP  
**Epic:** Optimización Firestore — Caché Inteligente  
**Prioridad:** Alta  
**Status:** Backlog Sprint 10

---

## 📋 Descripción

Agregar parámetro `since` a `getRecentForecasts()` para permitir queries delta.

En lugar de traer TODOS los documentos cada vez, traer solo `where created_at > since`.

**Ejemplo:**
- Consulta 1 (sin since): trae 100 docs
- Consulta 2 (since=timestamp1): trae 10 docs nuevos (no los 100 viejos)

---

## ✅ Acceptance Criteria

1. ✅ `getRecentForecasts(timeRange, since?: number)` acepta parámetro `since` opcional
2. ✅ Cuando `since` es undefined → comportamiento igual que antes (traer todo)
3. ✅ Cuando `since` está definido → query incluye `where created_at > since` (en milisegundos)
4. ✅ Query con `since` reduce resultados 90% vs sin filtro (10 docs vs 100)
5. ✅ Tipo de `since`: `number` (milisegundos Unix, compatible con `Date.now()`)
6. ✅ TypeScript types correctos, sin `any` casts
7. ✅ Logging console: `[Firebase] Query con since=${since} → ${results.length} docs`

---

## 📝 Implementación

**File:** `src/services/firebase/firebaseWeatherService.ts`

**Cambios:**
```typescript
// ANTES
export async function getRecentForecasts(
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<ForecastDoc[]>

// DESPUÉS
export async function getRecentForecasts(
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h',
  since?: number  // NEW: milisegundos Unix
): Promise<ForecastDoc[]>
```

**Lógica:**
- Si `since` está definido: agregar `where('created_at', '>=', Timestamp.fromMillis(since))`
- Si `since` es undefined: comportamiento actual (sin filtro)
- Validar `since` > 0 (opcional: validación de cordura)

---

## 🧪 Testing

**Unit test:**
- Query sin `since` → trae todos (ej: 100 docs)
- Query con `since` → trae solo nuevos (ej: 10 docs)
- Query con `since` > ahora → trae 0 docs
- Parámetro `since` opcional (backwards compatible)

---

## 🔗 Dependencias

- Depende de: Nada
- Requerido por: US-1008-C (syncFirestoreToCache necesita query delta)

---

## 📊 Notas

- Esta es la pieza más simple de US-1008
- No requiere cambios en IndexedDB aún
- Retrocompatible: código existente sigue funcionando igual

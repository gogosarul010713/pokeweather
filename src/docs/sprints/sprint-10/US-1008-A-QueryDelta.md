# US-1008-A: Query Delta en getRecentForecasts()

**Story Points:** 1 SP
**Epic:** Optimización Firestore — Caché Inteligente
**Prioridad:** Alta
**Status:** Backlog Sprint 10

---

## Problema raíz

El código actual de `getRecentForecasts()` hace un fetch sin filtro de TODOS los documentos Firestore y filtra en memoria:

```typescript
// ⚠️ NOTA: NO usamos where() ni orderBy() porque Firestore requiere un índice
const allSnapshot = await getDocs(collectionGroup(db, 'forecasts'))
```

Esto trae ~240 docs por consulta cuando el delta real entre sesiones es 2-10 docs nuevos.
La solución raíz es habilitar el índice + agregar `since` param — no un cache complejo.

---

## Paso 0 (5 min, 0 SP): Crear índice en Firebase Console

Antes de implementar el código, habilitar la query con filtro:

```
Firebase Console → Firestore → Indexes → Single field indexes
→ Add exemption:
    Collection group: forecasts
    Field path: created_at
    Query scopes: Collection group ✓
```

Sin este paso, el `where('created_at', '>=', ...)` en collectionGroup lanza error.

---

## ✅ Acceptance Criteria

1. `getRecentForecasts(timeRange, since?)` acepta `since?: number` (milisegundos Unix)
2. Sin `since` → query incluye `where('created_at', '>=', minDate)` basado en timeRange
3. Con `since` → query incluye `where('created_at', '>=', Timestamp.fromMillis(since))`
4. El `since` tiene precedencia sobre `timeRange` cuando ambos están definidos
5. Backwards compatible: código existente sin `since` funciona igual
6. Log: `[Firebase] Query delta: since=${date} → ${n} docs`

---

## Implementación

**File:** `src/services/firebase/firebaseWeatherService.ts`

```typescript
// ANTES
export async function getRecentForecasts(
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<ForecastDoc[]>

// DESPUÉS
export async function getRecentForecasts(
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h',
  since?: number
): Promise<ForecastDoc[]>
```

**Cambio en la query:**

```typescript
// Imports adicionales necesarios
const { collectionGroup, getDocs, query, where, orderBy, Timestamp } = await import('firebase/firestore')

// Calcular minDate
const minDate = since
  ? Timestamp.fromMillis(since)
  : Timestamp.fromDate(new Date(now.getTime() - hoursBack * 60 * 60 * 1000))

// Query con filtro (requiere índice — ver Paso 0)
const q = query(
  collectionGroup(db, 'forecasts'),
  where('created_at', '>=', minDate),
  orderBy('created_at', 'desc')
)
const snapshot = await getDocs(q)

// Ya no necesita filtro en memoria — viene filtrado de Firestore
const documents: ForecastDoc[] = snapshot.docs.map(doc => {
  const data = doc.data()
  return {
    city_id: data.city_id,
    // ... resto de campos igual que antes
  }
})
```

**Eliminar:** el bloque de `.filter(doc => doc._createdAtDate >= minDate)` en memoria — ya no necesario.

---

## Testing

- Sin `since`: trae docs de las últimas 24h (timeRange por defecto)
- Con `since=ayer`: trae solo docs nuevos desde ayer
- Con `since=ahora`: trae 0 docs
- Backwards compatible: llamadas existentes sin `since` funcionan

---

## Dependencias

- Depende de: Paso 0 (índice Firebase Console) — sin él el código falla
- Requerido por: US-1008-C (syncForecastsOnLoad usa `since`)

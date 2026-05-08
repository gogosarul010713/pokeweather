# BUG-017: Cache Firestore Previene Actualización Post-Sync

**Status:** FIXED (2026-05-08) — Awaiting validation
**Root Cause:** `getDocs` reads local SDK cache instead of enforcing server read
**Impact:** Listener real-time se dispara, pero datos refetcheados son stale (viejos)
**Severity:** CRÍTICO — Sincronización falla silenciosamente sin errores

---

## Síntoma

Usuario dispara "Sincronizar ahora" en Testing Tools:
- UI muestra: `✅ Sincronización completada: 5 ciudades actualizadas`
- LocationCards en el mapa **NO CAMBIAN**
- Console: Sin errores
- Firestore: Los datos SÍ fueron escritos correctamente

---

## Root Cause Analysis

### Flujo esperado (correcto):
```
Sync Manual → CF escribe updatedAt nuevo
            → Listener onSnapshot se dispara
            → Listener refetch datos clasificados
            → UI actualiza con datos nuevos
```

### Flujo fallido (con bug):
```
Sync Manual → CF escribe updatedAt nuevo ✅
            → Listener onSnapshot se dispara ✅
            → Listener llama getWeatherFromFirestore ✅
            → getWeatherFromFirestore usa getDocs(q) ✅
            → Firebase SDK retorna documento del CACHE LOCAL ❌
            → UI actualiza con datos VIEJOS ❌
```

### El problema técnico

**Archivo:** `src/services/firebase/firebaseWeatherService.ts` línea 305

```typescript
const snapshot = await getDocs(q)
```

`getDocs(query)` en el Firebase SDK tiene este comportamiento:
1. Primero busca en el cache local del cliente
2. Si el documento existe en cache, lo retorna SIN ir al servidor
3. Luego (asincronamente) sincroniza con servidor en background

**Cuando el listener se dispara**, el cache local aún no ha sido actualizado porque:
- CF escribe en Firestore servidor
- Listener cliente notifica al instante
- Pero el documento nuevo no ha llegado al SDK cliente aún
- `getDocs` encuentra el doc viejo en cache y lo retorna

**Resultado:** El UI recibe el mismo dato de antes, parece que no cambió nada.

---

## Solución

Cambiar `getDocs` → `getDocsFromServer`:

**Antes (línea 292):**
```typescript
const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore')
```

**Después:**
```typescript
const { collection, getDocsFromServer, query, orderBy, limit } = await import('firebase/firestore')
```

**Antes (línea 305):**
```typescript
const snapshot = await getDocs(q)
```

**Después:**
```typescript
const snapshot = await getDocsFromServer(q)
```

### Por qué funciona

`getDocsFromServer(query)` **SIEMPRE** va al servidor, nunca usa cache local.

Tradeoff: Una request extra al servidor, pero garantiza datos frescos cuando el listener se dispara post-sync.

---

## Validación (Criterios de Aceptación)

### Test 1: Logs de diagnóstico
Abre DevTools Console (F12) → Filtra por "[DIAG]" o "useFirestoreSync"

**ESPERADO post-sync:**
```
[useFirestoreSync][DIAG] onSnapshot fired — docs: 5, hasPendingWrites: false, fromCache: false, isFirst: false
[useFirestoreSync][DIAG] city=pier-39-san-francisco updatedAt=XXXX lastSeen=YYYY diff=ZZZ isFirst=false
[Firebase][DIAG] getDocsFromServer for pier-39-san-francisco — empty: false, fetched fresh from server
[useFirestoreSync] 5 cities updated by CF, refetching classified data...
[App] Real-time sync: 5/5 cities updated from Firestore
```

✅ Si ves "getDocsFromServer" en los logs → fix funciona

### Test 2: UI actualiza
- Observa LocationCards antes del sync
- Dispara sync manual
- Espera 2 segundos
- Verifica que clima/tipos **CAMBIARON VISIBLEMENTE**

✅ Si los datos cambian en el mapa → fix funciona end-to-end

### Test 3: Sin errores
- F12 Console no debe mostrar errores rojos
- Especialmente no "Cannot read property" o "undefined"

---

## Archivos Modificados

- `src/services/firebase/firebaseWeatherService.ts` — Cambio de `getDocs` → `getDocsFromServer`
- `src/hooks/useFirestoreSync.ts` — Logs diagnóstico temporales (remover post-validación)

---

## Decision Log Entry — D-041

**Firestore client SDK caching in real-time listeners:**
- Real-time listeners (`onSnapshot`) notifican cambios inmediatamente ✅
- Pero lecturas one-shot (`getDocs`) pueden usar cache local ❌
- **Regla:** Cuando se refetch tras listener event, usar `getDocsFromServer` para garantizar datos frescos
- **Aplicación:** Línea 305 en `firebaseWeatherService.ts`
- **Alternativa rechazada:** Cache invalidation manual (complejo, error-prone, no escalable)

---

## Timeline

| Fecha | Evento | Status |
|-------|--------|--------|
| 2026-05-08 | Identificada causa (cache Firestore) | ✅ |
| 2026-05-08 | Implementado fix (getDocs → getDocsFromServer) | ✅ |
| 2026-05-08 | Agregados logs diagnóstico | ✅ |
| 2026-05-08 | Awaiting validation por usuario | ⏳ |
| Post-validación | Remover logs [DIAG] temporales | 🔴 |
| Post-validación | Commit final | 🔴 |

---

## Notes

- Logs `[DIAG]` fueron insertados temporalmente para diagnosticar
- Remover después de validación exitosa
- El fix es un cambio de una palabra en una línea
- No requiere cambios en CF, schema Firestore, o estado local

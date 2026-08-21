---
bug_id: BUG-006
fecha: 2026-04-24
us: US-1106-B
severidad: Alta (Performance)
estado: RESUELTO
---

# BUG-006 — useFirestoreSync: Callback se recrea → listener remount infinito

## Síntoma

Console logs repetitivos indicando desmonte y remonte constante del listener:

```
[useFirestoreSync] Listener detached
[useFirestoreSync] Updated 0 cities from Firestore
[App] Merged Firestore sync: 5 cities
[useFirestoreSync] Listener detached  ← se repite constantemente
[useFirestoreSync] Updated 0 cities from Firestore
[App] Merged Firestore sync: 5 cities
```

**Impacto:** Sincronización inestable, waste de recursos en re-subscripciones, mala UX.

## Causa Raíz

En `App.tsx` línea 91-107, el hook `useFirestoreSync` se llamaba **sin dependency array**:

```typescript
useFirestoreSync(
  (firestoreCities) => {
    // Callback anónimo — se recrea en CADA render
    setCities((prevCities) => { ... })
  },
  (error) => {
    // Error callback anónimo — se recrea en CADA render
    console.error('[App] Firestore sync error:', error)
  }
)
```

El hook internamente tiene `[onUpdate, onError]` en su dependency array (línea 98).

**Flujo problemático:**
1. App renderiza → crea callback anónimo nuevo
2. Hook recibe callback nuevo como prop
3. Dependency array `[onUpdate, onError]` detecta cambio
4. Limpia listener anterior (detach)
5. Vuelve a setupear nuevo listener (setup)
6. App re-renderiza por cambio de estado → paso 1

**Resultado:** Loop infinito de setup/cleanup.

## Solución Aplicada

Envolver callbacks en `useCallback()` para mantener la misma referencia entre renders:

```typescript
const handleFirestoreCitiesUpdate = useCallback((firestoreCities: Partial<City>[]) => {
  setCities((prevCities) => {
    const merged = prevCities.map((city) => {
      const firestoreData = firestoreCities.find((c) => c.id === city.id)
      if (!firestoreData) return city
      return { ...city, ...firestoreData }
    })
    console.log('[App] Merged Firestore sync:', merged.length, 'cities')
    return merged
  })
}, [])

const handleFirestoreSyncError = useCallback((error: Error) => {
  console.error('[App] Firestore sync error:', error)
}, [])

useFirestoreSync(handleFirestoreCitiesUpdate, handleFirestoreSyncError)
```

**Por qué funciona:**
- `useCallback` con dependency array vacío `[]` retorna la MISMA función en cada render
- Hook recibe referencias estables → dependency array `[onUpdate, onError]` NO cambia
- Listener se monta una sola vez y permanece hasta desmontar App

## Archivos Modificados

- `src/App.tsx` — Agregar useCallback para callbacks + ajustar estructura

## Validación

- ✅ Build: 132 modules, 706ms, sin errores
- ✅ Console: Listener se monta 1 vez y se detach solo al desmontar
- ✅ Real-time sync: Funciona correctamente sin loops infinitos
- ✅ Commit: Latest con mensaje fix(useFirestoreSync)

## Si Vuelve a Aparecer

Verificar:
1. Que **todos** los callbacks pasados a `useFirestoreSync` estén envueltos en `useCallback`
2. Que el dependency array de `useCallback` sea explícito (no confiar en "lo hare después")
3. Revisar con React DevTools → Profiler → "Highlight updates when components render" para identificar renders innecesarios
4. Usar `console.log` en el hook para verificar que las referencias sean iguales: `console.log('onUpdate ref:', onUpdate)`

## Patrón General (Aplica a otros hooks)

Cualquier hook que tenga callbacks en sus dependencias:
```typescript
// ❌ MAL
useCustomHook((data) => { /* hacer algo */ })

// ✅ BIEN
const handleData = useCallback((data) => { /* hacer algo */ }, [])
useCustomHook(handleData)
```


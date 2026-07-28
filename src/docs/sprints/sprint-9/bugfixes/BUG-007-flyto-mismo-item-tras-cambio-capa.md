# BUG-007 — FlyTo ignora mismo item tras cambio de capa

**Branch:** `sprint-9-nests`
**Archivo:** `src/components/Map/FlyToCity.tsx`
**Estado:** Resuelto

## Comportamiento

1. Seleccionar ciudad A → flyTo OK
2. Seleccionar un nido → `selectedCity` pasa a `null`
3. Volver a seleccionar ciudad A → **no hace flyTo**, popup del nido desaparece pero el mapa no vuela

La inversa (nido → ciudad → mismo nido) **no fallaba**.

## Causa raiz

`prevCityIdRef` en `FlyToCity` guarda el ultimo id volado. El guard de la linea 38 compara:

```ts
if (selectedCity.id === prevCityIdRef.current && !tickChanged) return
```

Al seleccionar un nido, `setSelectedNest` pone `selectedCity = null` pero **no resetea el ref**. Al volver a clickear ciudad A, el ref sigue siendo `"A"` y el guard bloquea el flyTo.

La inversa no fallaba porque `setSelectedCity` pone `selectedNest = null`, y el useEffect de nido detecta el cambio real (nest != null → null → nest).

## Fix

Resetear el ref a `null` cuando el valor llega a `null`, en ambos efectos:

```ts
if (!selectedCity) { prevCityIdRef.current = null; return }
if (!selectedNest)  { prevNestIdRef.current = null; return }
```

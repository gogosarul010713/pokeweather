# BUG-001 — "Ver en lista" no hacia scroll ni highlight

**Fecha:** Sprint 9 — Sesion 20 (2026-07-25)
**Estado:** Resuelto
**Componentes:** `NestDetail`, `LocationDetail`, `MapView`, `LocationFeed`, `FlyToCity`
**Nota:** BUG-001c (popup fuera de viewport al volver de nidos a ciudad diferente) fue resuelto aqui. El caso de popup bloqueado por nido abierto al volver y click cualquier ciudad → ver BUG-002.

---

## Sintomas

1. Boton "Ver en lista" en `NestDetail` no hacia nada (callback era no-op).
2. Boton "Ver en lista" en `LocationDetail` cerraba el modal pero no hacia scroll ni highlight al item en el sidebar.
3. Popup de clima no aparecia al seleccionar una ciudad del sidebar despues de haber navegado a un nido (si la ciudad no habia cambiado).
4. Al alternar entre clima y nido, scroll/highlight llegaba al elemento equivocado o no se disparaba.

---

## Causas raiz

### BUG-001a — Callback roto en MapView
`onViewInList` en `SelectedNestPopup` estaba implementado como `() => setSelectedNest(selectedNest)` — re-seteaba el mismo valor, sin efecto.

### BUG-001b — selectedNest se limpiaba antes del scroll
Al limpiar `selectedNest` para cerrar el popup de Leaflet, el NestCard perdia `isActive=true` antes de que el scroll ocurriera → sin highlight.

**Fix:** `nestPopupOpen` separa la visibilidad del popup de `selectedNest`. Ver DEC-911.

### BUG-001c — FlyToCity guard por id bloqueaba el vuelo
`FlyToCity` tenia guard `if (selectedCity.id === prevIdRef.current) return`. Si la misma ciudad estaba seleccionada antes de ir al nido, al volver no cambiaba el id → no volaba → popup de clima quedaba fuera del viewport.

**Fix:** `FlyToCity` tambien reacciona a `scrollToFeedTick` con su propio `prevTickRef`.

### BUG-001d — Race condition en scroll
Un solo `scrollToFeedTick` disparaba ambos `useEffect` (ciudad y nido) simultaneamente → el ultimo en ejecutarse ganaba, resultado impredecible.

**Fix:** `scrollToFeedTarget: 'city' | 'nest'` dirige el scroll al efecto correcto. Ver DEC-912.

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/store/useStore.ts` | `nestPopupOpen`, `scrollToFeedTick`, `scrollToFeedTarget`, `scrollToFeed(target)` |
| `src/components/Map/MapView.tsx` | `onViewInList` → `scrollToFeed('nest')`; condicion `nestPopupOpen` |
| `src/components/Map/FlyToCity.tsx` | Reacciona a `scrollToFeedTick` via `prevTickRef` |
| `src/components/Sidebar/LocationDetail.tsx` | `scrollToFeed('city')` en footer |
| `src/components/Sidebar/LocationFeed.tsx` | `useEffect` condicionados por `scrollToFeedTarget` |

---

## BUG-002 — FlyToCity disparaba con tick de nido (sesion 22)

**Fecha:** Sprint 9 — Sesion 22 (2026-07-25)
**Estado:** Resuelto

### Sintoma

Al seleccionar un nido del sidebar con una ciudad previamente activa, "Ver en lista" desde NestDetail hacia flyTo a la ciudad anterior en lugar del nido.

### Causa raiz

`FlyToCity` reaccionaba a cualquier cambio de `scrollToFeedTick` sin verificar `scrollToFeedTarget`. Como `selectedCity` seguia no-nulo (no se limpiaba al seleccionar nido), el tick de nido disparaba el vuelo a la ciudad.

### Fix

1. `FlyToCity.tsx`: condicion `tickChanged` ahora requiere `scrollToFeedTarget === 'city'`.
2. `useStore.ts`: `setSelectedNest` limpia `selectedCity` (DEC-913) — elimina la causa raiz.

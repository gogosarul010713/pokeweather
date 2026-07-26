# BUG-002 — Popup de clima no aparece al volver de nidos

**Fecha:** Sprint 9 — Sesion 21 (2026-07-25)
**Estado:** Resuelto
**Componentes:** `MapView`, `LocationCard`

---

## Sintomas

Al tener un nido seleccionado (popup de nido abierto en el mapa) y luego hacer click en cualquier ciudad del sidebar de climas:
- El mapa vuela a la ciudad correctamente (FlyToCity funciona)
- El popup de clima NO aparece
- El highlight en el sidebar NO aparece

---

## Causas raiz

### BUG-002a — remove handler limpiaba selectedCity al abrir nido
Cuando Leaflet abre el popup de nido, cierra automaticamente el popup de clima. Al cerrarse, `SelectedPopup` disparaba `remove: () => setSelectedCity(null)` → `selectedCity` quedaba en `null`. Al hacer click en una ciudad nueva, `setSelectedCity` se llamaba pero el `SelectedPopup` se montaba en competencia con el popup de nido aun abierto en Leaflet.

**Fix:** `SelectedPopup` guarda `nestPopupOpen` en una ref (`nestPopupOpenRef`). El handler `remove` solo limpia `selectedCity` si `nestPopupOpenRef.current === false` (cierre voluntario con X, no por apertura de nido).

### BUG-002b — Popup de nido seguia abierto al seleccionar ciudad
Al hacer click en una `LocationCard`, el popup de nido seguia montado en Leaflet. Como Leaflet solo muestra un popup a la vez, bloqueaba el popup de clima.

**Fix:** `LocationCard.handleCardClick` llama `setNestPopupOpen(false)` antes de `setSelectedCity(city)`, cerrando el popup de nido limpiamente.

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/Map/MapView.tsx` | `SelectedPopup`: `nestPopupOpenRef` + guard en handler `remove`; agrega `useRef` al import |
| `src/components/Sidebar/LocationCard.tsx` | `handleCardClick`: llama `setNestPopupOpen(false)` antes de `setSelectedCity` |

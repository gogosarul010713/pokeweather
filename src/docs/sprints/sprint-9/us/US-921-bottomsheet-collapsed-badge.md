# US-921 -- BottomSheet colapsado muestra conteo de ciudades activas

**Sprint:** 9
**Story Points:** 1
**Priority:** Low
**Status:** Done
**Dependencies:** --

---

## User Story

> As a mobile user, I want to see how many cities are loaded when the bottom sheet is collapsed, so that I know there is data available without having to open the sheet.

---

## Problem

Cuando el BottomSheet esta colapsado, el usuario solo ve el handle de arrastre. No tiene ninguna indicacion visual de cuantas ciudades hay disponibles, lo que reduce la descubribilidad de la lista.

---

## Acceptance Criteria

- [x] Cuando el BottomSheet esta en estado colapsado, muestra el numero de ciudades actualmente en la lista (ej. "5 ciudades")
- [x] El badge se actualiza si cambia el conteo (por filtros o refresh)
- [x] En estado expandido o semi-expandido, el badge no interfiere con el header del feed

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/BottomSheet/BottomSheet.tsx` | Agregar prop `cityCount` y renderizar badge en el area del handle cuando esta colapsado |
| `src/App.tsx` | Pasar `filteredCities.length` al `BottomSheetPortal` |
| `src/components/BottomSheet/BottomSheetPortal.tsx` | Propagar prop `cityCount` al `BottomSheet` interno |

---

## Notes

El conteo debe ser el de ciudades filtradas (las que se ven en la lista), no el total de ciudades cargadas.

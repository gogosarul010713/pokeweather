# US-925 -- FilterPanel se comporta como BottomSheet en mobile

**Sprint:** 9
**Story Points:** 1
**Priority:** Medium
**Status:** Done
**Dependencies:** --

---

## User Story

> As a mobile user, I want the filter panel to open from the bottom of the screen, so that it feels native and does not cover the header or obstruct navigation.

---

## Problem

El FilterPanel en desktop se abre como modal o panel lateral. En mobile debe abrirse desde el borde inferior de la pantalla, cubriendo la mayor parte del viewport, con scroll interno para los filtros.

---

## Acceptance Criteria

- [x] En mobile (< 768px), al tocar el boton de filtros, el FilterPanel aparece anclado al borde inferior de la pantalla
- [x] El panel tiene handle de arrastre para cerrarlo
- [x] Los filtros internos (capas, condicion, tipo, region, ordenar) son accesibles con scroll vertical
- [x] El boton "Aplicar" permanece visible sin hacer scroll
- [x] En desktop el comportamiento no cambia

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/UI/FilterPanelModal.tsx` | Verificar y agregar media query mobile: posicion bottom, ancho 100%, con handle |
| `src/components/Sidebar/FilterPanel.tsx` | Verificar que delega correctamente al modal en mobile |

---

## Notes

El componente real es `FilterPanelModal.tsx`, no FilterPanelClima/Nests. Verificar si ya tiene media query mobile antes de implementar. Si ya funciona correctamente, cerrar como verificado.

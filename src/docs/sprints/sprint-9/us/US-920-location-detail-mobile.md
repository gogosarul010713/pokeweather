# US-920 -- LocationDetail adaptado a pantalla completa en mobile

**Sprint:** 9
**Story Points:** 2
**Priority:** Medium
**Status:** Done
**Dependencies:** --

---

## User Story

> As a mobile user, I want the location detail to open covering most of the screen, so that I can read all the information without the layout feeling cramped.

---

## Problem

En mobile, `LocationDetail` se renderiza como modal con dimensiones pensadas para desktop. El contenido queda apretado y el usuario no puede ver la informacion completa sin hacer scroll horizontal o el modal se recorta.

---

## Acceptance Criteria

- [x] En viewports < 768px, `LocationDetail` ocupa el ancho completo de la pantalla
- [x] En viewports < 768px, `LocationDetail` ocupa al menos el 85% del alto de la pantalla y se ancla al borde inferior
- [x] El contenido interno (clima, nidos) es navegable via scroll vertical
- [x] El comportamiento en desktop (> 768px) no cambia

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/Sidebar/LocationDetail.tsx` | Agregar media query mobile: width 100%, ancla inferior, min-height 85vh |

---

## Notes

No se cambia la logica ni el contenido del componente -- solo su posicion y dimensiones en mobile. No requiere BottomSheet, solo CSS responsive.

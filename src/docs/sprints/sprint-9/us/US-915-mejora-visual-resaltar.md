# US-915 -- Mejora visual funcionalidad resaltar

**Sprint:** 9
**Story Points:** 3
**Priority:** Medium
**Status:** Pending
**Dependencies:** --

---

## User Story

> As a user, I want the highlight effect on map markers to be visually clearer, so that I can quickly identify highlighted locations.

---

## Problem

El efecto actual de resaltar markers en el mapa es poco notorio. Necesita mayor contraste, animacion o indicador visual que diferencie claramente los elementos resaltados.

---

## Acceptance Criteria

- [ ] Markers resaltados tienen un efecto visual claramente diferenciado (color, borde, sombra o animacion)
- [ ] El efecto no impacta el rendimiento al resaltar multiples markers simultaneamente
- [ ] El resaltado se activa y desactiva correctamente

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/map/` | Actualizar estilos de markers resaltados |
| `src/styles/` | Agregar clases CSS para el efecto de resaltado |

---

## Notes

Considerar uso de CSS animations o Leaflet custom icons para el efecto. Mantener consistencia con el tema visual existente.

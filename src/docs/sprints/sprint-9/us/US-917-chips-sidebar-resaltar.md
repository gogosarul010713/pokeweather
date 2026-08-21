# US-917 -- Chips en sidebar al resaltar

**Sprint:** 9
**Story Points:** 2
**Priority:** Medium
**Status:** Pending
**Dependencies:** US-915

---

## User Story

> As a user, I want to see chips on sidebar items when the highlight mode is active, so that I can identify at a glance which locations are highlighted.

---

## Problem

Cuando el modo resaltar esta activo, los items del sidebar no tienen indicador visual que refleje su estado de resaltado. Agregar chips mejora la legibilidad y consistencia con el mapa.

---

## Acceptance Criteria

- [ ] Cada item resaltado en el sidebar muestra un chip indicador (tipo, distancia, o estado)
- [ ] Los chips aparecen y desaparecen al activar/desactivar el resaltado
- [ ] El diseno de los chips es consistente con el sistema de chips existente en la app

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/sidebar/` | Agregar chips a items de lista cuando resaltar esta activo |
| `src/store/` | Leer estado de resaltado para condicionar chips |

---

## Notes

Reutilizar componentes de chips existentes si los hay. Los chips deben mostrar informacion relevante al contexto del resaltado (ej: tipo Pokemon, distancia).

# US-913 -- Fijar zona desde click derecho en el mapa

**Sprint:** 9
**Story Points:** 2
**Priority:** Medium
**Status:** Implementado (sesion 36)
**Dependencies:** US-909

---

## User Story

> Como usuario, quiero hacer click derecho sobre cualquier punto del mapa para fijar la zona desde ahi, de la misma forma que lo hace el search input.

---

## Problem

Actualmente fijar una zona requiere buscarla por nombre en el input de busqueda. Si el usuario ya tiene el mapa en el lugar correcto, tener que escribir el nombre es una friccion innecesaria. El click derecho en el mapa es un gesto natural y rapido para "fijar aqui".

---

## Acceptance Criteria

- [x] Click derecho sobre el mapa abre un context menu con la opcion "Fijar zona aqui"
- [x] Al seleccionar la opcion, se fija la zona con las coordenadas del punto clickeado (equivalente a fijar zona desde search input)
- [x] El context menu se cierra al hacer click en cualquier otro lugar
- [x] El context menu tiene estilo consistente con la UI existente (dark, borde sutil)
- [x] Si ya hay una zona fijada, la opcion dice "Mover zona aqui" y la reemplaza
- [x] El comportamiento de cooldown y sort automatico por distancia aplica igual que al fijar desde search (reutiliza logica existente de US-909)

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/Map/MapView.tsx` | Sub-componente `ContextMenuCapture` via `useMapEvents`, estado `ctxMenu` |
| `src/components/Map/MapContextMenu.tsx` | Creado — menu flotante dark-theme, cierre al click fuera |

---

## Notes

- El context menu debe bloquearse (o cerrarse) si el usuario hace click derecho sobre un pin, para no interferir con acciones del pin.
- No implementar geocoding inverso en esta US -- solo fijar coordenadas crudas.
- Reutilizar la accion de fijar zona del store sin duplicar logica.

# US-916 -- Efecto radar con loading animado

**Sprint:** 9
**Story Points:** 3
**Priority:** Medium
**Status:** Pending
**Dependencies:** --

---

## User Story

> As a user, I want to see a radar loading animation when detecting nearby nests, so that the search process feels intentional and engaging.

---

## Problem

El proceso de detectar nidos cercanos no tiene feedback visual. Agregar un efecto tipo radar con un delay de 3 segundos hace que el usuario perciba que hay un proceso activo de busqueda.

---

## Acceptance Criteria

- [ ] Al iniciar la busqueda de nidos cercanos aparece una animacion tipo radar en el mapa
- [ ] La animacion dura al menos 3 segundos antes de mostrar resultados
- [ ] La animacion se detiene al completar la busqueda o al cancelar
- [ ] El efecto es visible sobre el mapa sin bloquear la interaccion

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/map/` | Agregar componente de overlay radar |
| `src/styles/` | Agregar animacion CSS tipo radar (ondas expansivas) |
| `src/store/` | Controlar estado loading de busqueda de nidos |

---

## Notes

Efecto sugerido: circulos concentricos que se expanden desde el centro de la zona fijada, similares a una señal de radar. Delay minimo de 3s aunque la busqueda sea mas rapida.

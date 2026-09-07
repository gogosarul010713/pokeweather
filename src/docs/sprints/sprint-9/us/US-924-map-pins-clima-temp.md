# US-924 -- Pins del mapa muestran temperatura y condicion climatica

**Sprint:** 9
**Story Points:** 2
**Priority:** Medium
**Status:** Pending
**Dependencies:** --

---

## User Story

> As a mobile user, I want to see the temperature and weather condition on each map pin, so that I can read city data at a glance without opening the bottom sheet.

---

## Problem

En desktop los pins del mapa ya muestran informacion de clima. En mobile, dado que el sidebar esta oculto, los pins son el unico elemento visible sobre el mapa y deben ser informativos por si solos.

---

## Acceptance Criteria

- [ ] Cada pin de ciudad muestra la temperatura actual junto al nombre de la ciudad
- [ ] Cada pin muestra un icono o indicador de la condicion climatica activa
- [ ] Los pins son legibles en mobile (tamano de texto adecuado para touch)
- [ ] El comportamiento en desktop no cambia

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/Map/MapPin.tsx` | Agregar temperatura y condicion al label del pin en mobile |

---

## Notes

Si MapPin ya muestra esta informacion, la US se cierra como verificada. Revisar contra la pantalla 4 del mockup ENH-009.

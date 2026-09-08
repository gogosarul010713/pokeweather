# US-926 -- BottomSheet colapsado muestra badge de Mi Zona cuando esta activa

**Sprint:** 9
**Story Points:** 1
**Priority:** Low
**Status:** Done
**Dependencies:** US-921

---

## User Story

> As a mobile user, I want to see an indicator in the collapsed bottom sheet when Mi Zona is active, so that I know the distance and countdown data is being calculated for my location.

---

## Problem

Cuando Mi Zona esta activa, los cards del feed muestran distancia y countdown. En el estado colapsado del BottomSheet no hay ninguna indicacion de que Mi Zona esta activa, lo que puede confundir al usuario sobre por que los datos cambian.

---

## Acceptance Criteria

- [ ] Cuando Mi Zona esta activa y el BottomSheet esta colapsado, el area del handle muestra un indicador de "Mi Zona activa"
- [ ] Cuando Mi Zona no esta activa, el indicador no aparece (o muestra el conteo de ciudades de US-921)
- [ ] El indicador no interfiere con el drag del handle

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/BottomSheet/BottomSheet.tsx` | Agregar prop `miZonaActive` y renderizar indicador en estado colapsado |
| `src/App.tsx` | Pasar estado de Mi Zona al BottomSheetPortal |
| `src/components/BottomSheet/BottomSheetPortal.tsx` | Propagar prop `miZonaActive` |

---

## Notes

El indicador de Mi Zona tiene prioridad visual sobre el badge de conteo de ciudades (US-921) cuando ambos aplican al mismo tiempo.

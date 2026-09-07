# US-922 -- Auditoria de layout mobile contra mockup ENH-009

**Sprint:** 9
**Story Points:** 1
**Priority:** Medium
**Status:** Done
**Dependencies:** US-920, US-921

---

## User Story

> As a developer, I want a checklist that maps each screen of the ENH-009 mockup to the real app behavior in mobile, so that I can confirm the migration is complete and catch regressions.

---

## Problem

La migracion mobile se hace de forma gradual. Sin un documento de auditoria es dificil saber que pantallas estan completas, cuales tienen gaps y cuales ya no aplican porque la funcionalidad no existe en la app.

---

## Acceptance Criteria

- [ ] Existe un documento de auditoria que lista las 9 pantallas del mockup `docs/mockups/01-PokeWeather-mobile-9-pantallas.html`
- [ ] Cada pantalla tiene estado: Completo / Parcial / No aplica (funcionalidad no existe en app)
- [ ] Cada item "Parcial" referencia la US que lo cubre
- [ ] El documento puede actualizarse en cada sprint sin reescribirse completo

---

## Files to Modify

| File | Action |
|------|--------|
| `docs/sprints/sprint-9/` | Crear `AUDITORIA-mobile-ENH009.md` con tabla de 9 pantallas |

---

## Notes

"No aplica" no es un defecto -- indica que el mockup mostraba algo que no existe en la app y se descarto. El documento es la fuente de verdad de la migracion, no el mockup.

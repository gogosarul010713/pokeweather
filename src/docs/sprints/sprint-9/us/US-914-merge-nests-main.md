# US-914 -- Merge rama nests a main

**Sprint:** 9
**Story Points:** 2
**Priority:** High
**Status:** Pending
**Dependencies:** US-901 al US-913

---

## User Story

> As a developer, I want to merge the sprint-9-nests worktree branch into main, so that all nest features are available in the main codebase.

---

## Problem

La rama sprint-9-nests fue desarrollada en un worktree separado. Debe integrarse a main para unificar el codigo y habilitar el deploy.

---

## Acceptance Criteria

- [ ] Rama intermedia `merge/nests-to-main` creada desde main
- [ ] Merge gradual: cada feature branch/commit mergeado y probado individualmente
- [ ] Se documenta el punto exacto donde se pierde funcionalidad o hay regresion
- [ ] Tests pasan en la rama intermedia antes de tocar main
- [ ] Branch sprint-9-nests mergeado a main sin conflictos (solo tras validacion)
- [ ] Worktree eliminado tras merge exitoso

---

## Approach

**Rama intermedia:** `merge/nests-to-main`
- Se crea desde main para no afectar ni sprint-9-nests ni main durante la validacion
- Se van incorporando los cambios gradualmente (feature por feature o commit por commit)
- En cada paso se prueba la app y se anota si algo deja de funcionar
- Solo cuando todo este validado se hace el merge final a main

Esto permite identificar con precision que cambio rompe algo, sin ensuciar las ramas de trabajo.

---

## Files to Modify

| File | Action |
|------|--------|
| -- | Operacion git, no archivos especificos |

---

## Notes

Verificar conflictos en archivos compartidos como store, components de mapa, y configuracion Vite antes del merge.
La rama intermedia actua como "sandbox de integracion" -- se descarta o se promociona a main segun resultado.

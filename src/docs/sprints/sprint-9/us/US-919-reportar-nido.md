# US-919 -- Boton reportar nido (verificar o rechazar)

**Sprint:** 9
**Story Points:** 3
**Priority:** Low
**Status:** Pending
**Dependencies:** --

---

## User Story

> As a user, I want to verify or reject a nest report, so that the community can keep nest data accurate and up to date.

---

## Problem

Los nidos pueden volverse incorrectos tras rotaciones de Pokemon GO. Un mecanismo de verificacion/rechazo permite a la comunidad mantener la informacion actualizada sin depender de una fuente central.

---

## Acceptance Criteria

- [ ] El usuario puede marcar un nido como "Verificado" o "Incorrecto"
- [ ] El voto se persiste localmente (idb-keyval)
- [ ] El item del nido refleja visualmente el estado de verificacion (icono o chip)
- [ ] El usuario puede cambiar su voto

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/` | Agregar controles de verificacion al card/item de nido |
| `src/store/` | Agregar estado de votos por nido |
| `src/services/` | Persistir votos en IndexedDB |

---

## Notes

Sin backend por ahora -- votos locales con idb-keyval. El conteo de votos es individual por dispositivo. Evaluar sincronizacion en sprint futuro.

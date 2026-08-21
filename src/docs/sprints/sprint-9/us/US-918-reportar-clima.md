# US-918 -- Boton reportar clima incorrecto

**Sprint:** 9
**Story Points:** 3
**Priority:** Low
**Status:** Pending
**Dependencies:** --

---

## User Story

> As a user, I want to report when the displayed weather does not match actual conditions, so that the community can flag inaccurate weather data.

---

## Problem

La app consume datos de AccuWeather pero a veces el clima mostrado no corresponde a la realidad local. Un boton de reporte permite a los usuarios marcar discrepancias.

---

## Acceptance Criteria

- [ ] El usuario puede presionar "Reportar clima" en una ciudad o zona
- [ ] El reporte incluye ciudad, clima mostrado, y timestamp
- [ ] Se muestra confirmacion visual al usuario tras el reporte
- [ ] Los reportes se persisten localmente (idb-keyval) como minimo

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/` | Agregar boton y modal/sheet de reporte de clima |
| `src/store/` | Agregar slice para reportes de clima |
| `src/services/` | Persistir reportes en IndexedDB |

---

## Notes

Sin backend por ahora -- persistencia local con idb-keyval. Evaluar en sprint futuro si se centraliza. El reporte no modifica el clima mostrado, solo lo registra.

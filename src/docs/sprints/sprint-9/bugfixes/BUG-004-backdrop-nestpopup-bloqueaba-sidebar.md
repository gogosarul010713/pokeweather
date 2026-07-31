# BUG-004 — Backdrop de NestPopup bloqueaba scroll del sidebar

**Fecha:** Sprint 9 — Sesion 26 (2026-07-26)
**Estado:** Resuelto
**Componentes:** `src/components/Nests/NestPopup.tsx`

---

## Sintoma

Al abrir el popup de un nido (NestPopup), el sidebar quedaba completamente bloqueado — no se podia hacer scroll ni interactuar con los NestCards ni LocationCards. El unico modo de desbloquear era cerrar el popup.

## Causa raiz

`.np-backdrop` usaba `position: fixed; inset: 0` — cubria el 100% del viewport incluyendo el sidebar (280-360px del lado izquierdo). Cualquier click o scroll en esa zona era capturado por el backdrop transparente.

## Fix

Restringir el backdrop al area del mapa, dejando el sidebar libre:

```css
/* Antes */
.np-backdrop {
  position: fixed;
  inset: 0;
  ...
}

/* Despues (sesion 26) */
.np-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 360px;
  right: 0;
  ...
}
```

## Evolucion posterior — BUG-005 (sesion 27, 2026-07-26, commit 809c2a0)

El backdrop fue **eliminado completamente** para homologar el comportamiento con el popup de climas (que no tiene backdrop). Adicionalmente se corrigio `left: 360px` → `left: 300px` (ancho real del sidebar desktop) y el wrapper se centro correctamente sobre el area del mapa con `calc(300px + (100vw - 300px) / 2)`.

Estado final: `NestPopup` no tiene backdrop — el mapa queda visible al abrir el popup, igual que el popup de clima.

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/Nests/NestPopup.tsx` | `.np-backdrop` eliminado; `.np-wrapper left` corregido a calc() centrado en area mapa |

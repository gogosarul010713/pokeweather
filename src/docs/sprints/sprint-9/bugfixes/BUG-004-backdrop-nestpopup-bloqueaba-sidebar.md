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

/* Despues */
.np-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 360px;
  right: 0;
  ...
}
```

`left: 360px` corresponde al ancho del sidebar (300px desktop + margen). El sidebar queda completamente fuera del backdrop y sigue siendo interactivo mientras el popup esta abierto.

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/Nests/NestPopup.tsx` | `.np-backdrop`: `inset: 0` → `top:0; bottom:0; left:360px; right:0` |

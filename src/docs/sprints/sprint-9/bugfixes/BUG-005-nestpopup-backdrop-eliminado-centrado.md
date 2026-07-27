# BUG-005 — NestPopup: backdrop eliminado + popup centrado en area mapa

**Fecha:** Sprint 9 — Sesion 27 (2026-07-26)
**Estado:** Resuelto (commit 809c2a0)
**Componentes:** `src/components/Nests/NestPopup.tsx`

---

## Contexto

BUG-004 (sesion 26) habia restringido el backdrop de `inset:0` a `left:360px` para liberar el sidebar. En sesion 27 se decidio homologar el comportamiento con el popup de clima, que no tiene backdrop, y ademas corregir el posicionamiento del popup.

## Problemas resueltos

1. **Backdrop innecesario** — el popup de clima no tiene backdrop; NestPopup tampoco deberia. El backdrop agregaba complejidad sin beneficio UX.
2. **`left: 360px` incorrecto** — el sidebar mide 300px en desktop, no 360px.
3. **Popup no centrado** — el wrapper usaba `left: 300px` fijo, dejando el popup pegado al borde del sidebar en vez de centrado sobre el area del mapa.

## Fix

```css
/* Antes (BUG-004) */
.np-backdrop { position: fixed; top: 0; bottom: 0; left: 360px; right: 0; }
.np-wrapper  { left: 300px; }

/* Despues (BUG-005) */
/* backdrop: eliminado completamente */
.np-wrapper  { left: calc(300px + (100vw - 300px) / 2); transform: translateX(-50%); }
```

## Resultado

NestPopup abre sin backdrop, el mapa queda interactuable al fondo, y el popup aparece centrado horizontalmente sobre el area del mapa (igual que el popup de clima).

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/Nests/NestPopup.tsx` | `.np-backdrop` eliminado; `.np-wrapper` con `left: calc(300px + (100vw - 300px) / 2)` y `transform: translateX(-50%)` |

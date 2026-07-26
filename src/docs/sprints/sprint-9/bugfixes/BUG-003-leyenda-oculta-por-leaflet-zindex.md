# BUG-003 — MapLegend oculta por z-index de Leaflet

**Fecha:** Sprint 9 — Sesion 24 (2026-07-25)
**Estado:** Resuelto
**Componentes:** `MapLegend`, `MapView`, `App.tsx`, `zIndex.ts`

---

## Sintomas

- `MapLegend` no se mostraba al cargar la app.
- Aparecia brevemente al hacer zoom out y desaparecia al soltar.

## Causa raiz

Leaflet usa z-index internos de 200–1000 para tiles, panes y controles.
`MapLegend` tenia `z-index: 15` (via `Z.mapOverlay`) — quedaba tapada por los panes de Leaflet.

Ademas, `.mv-root` y `.app-map-area` tenian `z-index: 0` que creaba stacking contexts aislados, agravando el problema.

## Fix aplicado

| Archivo | Cambio |
|---|---|
| `src/App.tsx` | `MapLegend` movido fuera de `MapView` — se renderiza directamente en `app-map-area` |
| `src/components/Map/MapView.tsx` | Eliminado import y render de `MapLegend`; eliminado `z-index` de `.mv-root` |
| `src/App.tsx` | Eliminado `z-index` de `.app-map-area` (evita stacking context que atrapaba la leyenda) |
| `src/components/Map/MapLegend.tsx` | `z-index` subido a `1000` — mismo nivel que controles nativos de Leaflet |

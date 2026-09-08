# US-1208 -- Layer chips scroll horizontal mobile

**Sprint:** 13
**Story Points:** 2
**Priority:** Medium
**Status:** Done
**Dependencies:** US-925 (BottomSheet mobile)

---

## User Story

> As a mobile user, I want to see all map layer toggles in a scrollable horizontal strip, so that new layers (Gyms, Stops, Rutas) can be added without breaking the BottomSheet layout.

---

## Problem

The current `feed-hdr` in the BottomSheet shows Clima and Nidos chips inline in a fixed-width row. As more layers are introduced (Gyms, Stops, Rutas), the row overflows and wraps, breaking the layout on small screens.

---

## Acceptance Criteria

- [x] Chips row is `overflow-x: auto` with `white-space: nowrap` per chip -- no wrapping
- [x] Clima (blue) and Nidos (green) chips are active toggles (multiselect, independent)
- [x] Gyms, Stops, Rutas chips render in disabled/soon state (opacity 38%, non-interactive)
- [x] Scrollbar is hidden (scrollbar-width: none / ::-webkit-scrollbar display none)
- [x] Title row and chips row are stacked vertically inside feed-hdr
- [x] Behavior matches desktop LayerToggles: independent multiselect, state reflected in list content
- [x] No layout regression on pantallas 1, 3-9

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/mobile/BottomSheet/BottomSheet.jsx` | Refactor feed-hdr to column layout; wrap chips in scroll container |
| `src/components/sidebar/FeedHeader/FeedHeader.jsx` | Add `soon` prop/variant for future-layer chips |
| `src/styles/mobile.css` (o modulo equivalente) | Agregar `.feed-chips-scroll`, `.feed-chip.soon` |

---

## Notes

- Mockup de referencia: `docs/mockups/01-PokeWeather-mobile-9-pantallas.html` pantallas 2 y 10
- El patron de scroll horizontal es el mismo que usan Maps/Strava para capas -- familiar para el usuario
- Los chips "pronto" son decorativos por ahora; cuando se implemente cada capa se activan individualmente
- LayerToggles desktop ya tiene la logica de multiselect independiente -- reusar o compartir logica

# BUG-001 -- Carto basemap watermark "API KEY REQUIRED"

**Sprint:** 12
**Status:** Closed
**Severity:** High
**Reported:** 2026-08-28

---

## Description

El mapa mostraba el watermark "API KEY REQUIRED" sobre todos los tiles de Carto. El mapa cargaba correctamente pero el texto estampado lo hacia inutilizable visualmente.

## Reproduction

1. Abrir la app en `localhost:5173`
2. Ver cualquier tab con mapa (Clima o Nidos)
3. **Resultado actual:** watermark "API KEY REQUIRED / carto.com/basemaps/apikey" visible en cada tile

**Expected result:** mapa limpio sin watermark

---

## Root Cause

Carto cambio su politica en 2024/2025: los tiles raster de `basemaps.cartocdn.com` ahora requieren API key. Sin key, el servidor estampa el watermark sobre cada tile PNG. El codigo usaba las URLs sin autenticacion.

---

## Fix

| File | Change |
|------|--------|
| `src/components/Map/MapView.tsx` | Agregar `?key=${VITE_CARTO_KEY}` al final de las URLs de tile |
| `.env.local` | Agregar variable `VITE_CARTO_KEY` con key obtenida en carto.com/basemaps/apikey |

Key gratuita hasta 5M tiles/mes (fair use, uso no comercial).
URL del formulario: https://carto.com/basemaps/apikey/

---

## Closure Criteria

- [x] Watermark no visible con `VITE_CARTO_KEY` configurada
- [x] Fallback graceful si la variable no existe (tiles cargan con watermark, no rompe la app)

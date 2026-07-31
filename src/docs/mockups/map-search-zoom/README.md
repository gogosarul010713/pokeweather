# Mockup: Map Search + Zoom Controls

**Sprint:** 9 | **Estado:** Aprobado | **Fecha:** 2026-07-31

## Que resuelve

Controles de navegacion sobre el mapa: busqueda unificada de ciudades/nidos y botones de zoom rapido.

## Controles definidos

### Search (centro-arriba del mapa)

- Campo unico compartido con el sidebar
- Busca primero en dataset local (ciudades + nidos)
- Sin coincidencia: opcion de buscar en OpenStreetMap (Nominatim, sin API key)
- Al seleccionar dispara `FlyToCity` / `FlyToNest` existente
- Shortcut: `/` o `Ctrl+K`

### Zoom (derecha-arriba, 2 grupos)

| Boton | Icono | Accion |
|-------|-------|--------|
| + | `+` | Leaflet zoom in estandar |
| - | `-` | Leaflet zoom out estandar |
| Mundo | globo SVG | `map.setView([20,0], 2)` — vista mundial |
| Casa | casa SVG | GPS del navegador → `flyTo(coords, 13)` |
| Lupa+ | lupa con + SVG (azul) | `flyTo(selectedCity/Nest, 13)` |
| Pin | pin SVG | Abre popup de coordenadas |

### Coordenadas (popup sobre boton Pin)

- Un solo campo de texto: formato `lat,lon` (ej. `35.6762,139.6503`)
- Hint del formato visible bajo el input
- Boton "Ir" vuela al punto con zoom 15

## Archivo

`mockup.html` — abrir en navegador para ver interactivo (dark/light toggle incluido)

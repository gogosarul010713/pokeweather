# ENH-008 — Official Artwork Sprites (reemplazo sprites pixelados)

**Tipo:** Enhancement / Mejora visual  
**Sprint:** 9  
**Estado:** Completado

---

## Contexto

Los sprites originales de nidos usaban la URL base de PokeAPI (`/sprites/pokemon/{id}.png`), que entrega imagenes de 96x96px renderizadas con `image-rendering: pixelated`. Al hacer zoom o en pantallas de alta densidad se veian borrosas y de baja calidad.

## Solucion aplicada

Cambio de URL a Official Artwork (`/sprites/pokemon/other/official-artwork/{id}.png`): imagenes 475x475px con fondo transparente, sin pixelado, cobertura completa de los 1025 Pokemon.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/components/Map/NestPin.tsx` | `buildNestIcon` recibe `pokemonId`; circulo blanco eliminado del SVG; sprite Official Artwork flotando directo sobre hexagono via `<img>` absoluto |
| `src/components/Nests/NestCard.tsx` | URL → official-artwork; eliminado `image-rendering:pixelated`; sprite 40px |
| `src/components/Nests/NestPopup.tsx` | URL → official-artwork; eliminado `image-rendering:pixelated`; sprite 56px |
| `src/components/Nests/NestDetail.tsx` | URL → official-artwork; eliminado `image-rendering:pixelated`; header-sprite 52px, nd-sprite 72px; eliminados borde/fondo gris del sprite |

## Patron de URL

```
https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{pokemonId}.png
```

## Mockup de referencia

Artifact publicado: `claude.ai/code/artifact/d072c820-fbfb-4290-87ad-5c47cb0226d5`  
Estados documentados: normal, seleccionado (glow dorado + scale), opacado (`opacity:0.35`), desvanecido (`opacity:0.18 + grayscale`), hover (`scale:1.15`).

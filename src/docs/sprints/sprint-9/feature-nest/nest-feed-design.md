# Diseno del Feed de Nidos

**Sprint:** 9 — Sesion 10  
**Fecha:** 2026-07-16  
**Status:** Implementado — sesion 13 (2026-07-22). Diseno ajustado en sesion 13 post-revision Claude Design.  
**Referencia:** DEC-907, US-818

---

## Objetivo

Mostrar los nidos en el sidebar como un feed de tarjetas que permita al usuario identificar rapidamente el pokemon, evaluar si vale la pena ir (SD, spawn, confirmacion) y saber cuanto tiempo queda antes de que migre.

Caso de uso principal: *"Busco nidos de Combee por el polvo estrella que da. Quiero saber si esta confirmado, que tan seguido aparece, y cuanto tiempo me queda para ir."*

---

## Tarjeta Sidebar (NestCard)

Vista compacta en el feed. Estructura de 3 filas + columna derecha (segun Claude Design "Copy of Variantes filtros Pokeweather", seccion "1 · Sidebar Nidos"):

```
┌──────────────────────────────────────────────────────┐
│ [sprite] Central Park  🇺🇸              [✓] o [?]    │
│          Nueva York, USA               [HOT] [NEW]   │
│          Bulbasaur [ico_grass] [ico_poison]   14.2%  │
└──────────────────────────────────────────────────────┘
```

### Campos

| Campo | Fuente | Notas |
|---|---|---|
| Sprite | `pokemonId` via PokeAPI CDN | 36x36px pixelated, grayscale si no confirmado |
| Row 1: Lugar | `nest.name` | 14px bold, igual que LocationCard |
| Row 1: Bandera | `countryFlag(nest.countryCode)` | Emoji derivado via `src/config/countryFlags.ts` |
| Row 2: Ciudad | `nest.city, nest.country` | 12px secondary, igual que LocationCard |
| Row 3: Pokemon | `nest.pokemonName` | 12px secondary |
| Row 3: Tipos | `nest.types` via `TYPE_ICON` | Iconos `/types/ico_N_name.webp` 22x22px, igual que LocationCard |
| Col derecha: Badge confirmado | `confirmed` + `now < NEXT_MIGRATION` | `✓` verde / `?` gris |
| Col derecha: Badge `HOT` | Derivado: `spawnRate >= 65` | Naranja, tooltip "Spawn rate >= 65%" |
| Col derecha: Badge `NEW` | Derivado: `confirmedAt` < 48h | Azul, tooltip "Confirmado en las ultimas 48h" |
| Col derecha: Spawn% | `nest.spawnRate` | `~X%` si no confirmado |

### Logica de badges derivados

```ts
const isConfirmedActive = nest.confirmed && now < new Date(NEXT_MIGRATION).getTime()
const isHot = nest.spawnRate >= 65
const isNew = nest.confirmedAt
  ? Date.now() - new Date(nest.confirmedAt).getTime() < 48 * 60 * 60 * 1000
  : false
```

### Homologacion con LocationCard

NestCard sigue los mismos tokens que `LocationCard`:
- Nombre lugar: `14px bold Exo 2 var(--text-primary)`
- Subtitulo: `12px regular Exo 2 var(--text-secondary)`
- Iconos de tipo: `<img> 22x22 via TYPE_ICON`
- Border-left activo: `3px solid #22c55e` (vs azul en clima)

### MigrationBanner

Componente `src/components/Nests/MigrationBanner.tsx` — se renderiza dentro de `LocationFeed` como primer item de la seccion de nidos (antes de los NestCards), cuando `activeLayers.nidos` es true.

**Nota sesion 15 (2026-07-22):** movido desde `Sidebar.tsx` (entre FilterPanel y LocationFeed) hacia el interior del scroll de `LocationFeed`, para evitar confusion visual cuando clima + nidos estan activos simultaneamente. El banner queda en contexto, asociado a la seccion de nidos.

```
┌─────────────────────────────────────────────┐
│ 🔄  PROXIMA MIGRACION        3d 14h 22m     │
└─────────────────────────────────────────────┘
```

- Countdown derivado de `store.now` vs `NEXT_MIGRATION`
- Verde si aun no migro, amber si ya migro
- Formato: `Xd Yh Zm` / `Yh Zm` / `Zm` segun tiempo restante

---

## Tarjeta Detalle (NestDetail / popup desde pin del mapa)

Vista expandida al hacer click en un pin o en una NestCard.

```
┌─────────────────────────────────────────────────┐
│  📍 Yoyogi Park · Tokyo · Japan                 │
│  Migra en 2d 14h                                │
│  SD: ★ 2100   Spawn: 78%   Stops: ~12           │
│  Ultima confirmacion: hace 2 dias               │
└─────────────────────────────────────────────────┘
```

### Campos

| Campo | Fuente | Display |
|---|---|---|
| Ubicacion | `name`, `city`, `country` | "Yoyogi Park · Tokyo · Japan" |
| Countdown | `nextMigration` vs `store.now` | Ver seccion Countdown |
| SD | `stardust` | "SD: ★ 2100" — omitir si undefined |
| Spawn rate | `nestPokemon[0].spawnRate` | "Spawn: 78%" — barra o numero |
| Stops | `stops` | "Stops: ~12" — omitir si undefined |
| Ultima confirmacion | `confirmedAt` | "hace 2 dias" (relativo) |

---

## Countdown — Logica de display

Funcion pura `getMigrationStatus(nextMigration: string, now: number): string`:

```
now < nextMigration:
  diferencia >= 1 dia   →  "Migra en 2d 14h"
  diferencia < 1 dia    →  "Migra en 6h 23m"
  diferencia < 1 hora   →  "Migra en 45m"

now >= nextMigration:
  →  "Migro hace 3h · Sin confirmar"
  →  "Migro hace 2d · Sin confirmar"
```

El valor se recalcula en cada render usando `store.now` (ver DEC-907 para el interval global).

---

## Orden de prioridad visual en el feed

1. Sprite + nombre (identidad inmediata)
2. Badge `confirmed` (confianza — lo mas critico)
3. Spawn rate (densidad del nido)
4. SD base (valor de la caza)
5. Ciudad + nombre del nido (donde ir)
6. Ultima confirmacion (frescura del dato)
7. Tipo(s) del pokemon (contexto / filtro)
8. Rareza (prioridad relativa)

---

## Notas de implementacion

- El sprite se carga desde la CDN publica de PokeAPI — no requiere API key
- `stardust` y `stops` son opcionales; el detalle los omite si `undefined`
- El badge `confirmed` desaparece en runtime cuando `now >= nextMigration`, aunque el JSON diga `confirmed: true`
- Los badges `hot` y `new` son 100% derivados — sin campo en JSON, sin persistencia
- Ver `src/docs/architecture/11-nests-architecture.md` para la logica del interval global

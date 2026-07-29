# Sprint 9 — INDEX

**Objetivo del sprint:** Migrar la arquitectura de tabs a capas independientes, permitiendo visualizar clima y nidos simultáneamente, con base extensible para gimnasios, PokéParadas y rutas.

**Decisiones arquitectónicas:** ver `decisions.md`

---

## Estado general

| Sesión | Foco | Status |
|---|---|---|
| Sesión 1 | Fundación — tipos, store base, servicios | ✅ Completada |
| Sesión 2 | Rediseño UI — pins, sidebar, layout base | ✅ Completada |
| Sesión 3 | Capas independientes — migración activeTab → activeLayers | ✅ Completada (US-826/823/824/821 done) |
| Sesiones 4-9 | ENH-001/002 + OBS-001 FilterPanel | ✅ Completada |
| Sesión 10-11 | Feed nidos — modelo de datos, logica migracion, tipos/JSON/store/utils | ✅ Completada |
| Sesión 12 | US-818 — schema DEC-909 aprobado, mockup generado, docs actualizadas | ✅ Completada |
| Sesión 13 | US-818 UI — Fase 1 datos, Fase 2 componentes, Fase 3 integracion + bug BUG-001 fix | ✅ Completada |
| Sesion 15 | Observaciones UX feed nidos — headers sticky por seccion, MigrationBanner inline, conteos por seccion | ✅ Completada |
| Sesion 16 | Homologacion visual NestPopup — titulo inline, Ver detalle full-width, feedback copiar coords, eliminar countdown (DEC-910) | ✅ Completada |
| Sesion 23 | ENH-006 — Sidebar oculto con transicion suave cuando no hay capa activa (UX empty state) | ✅ Completada |
| Siguiente | US-815 — Leyenda dinamica por capas | ⏳ Pendiente |
| Sesión N (US-901/902/903) | Validación y testing | ⏳ Pendiente |

---

## Sesión 1 — Fundación

| US | Título | SP | Status |
|---|---|---|---|
| US-811 | Setup inicial Vite + React + TypeScript | 2 | ✅ Done |
| US-812 | Integración Zustand store base | 2 | ✅ Done |
| US-813 | Integración AccuWeather API | 3 | ✅ Done |
| US-814 | Integración S2 geometry para celdas clima | 2 | ✅ Done |

---

## Sesión 2 — Rediseño UI

| US | Título | SP | Status |
|---|---|---|---|
| US-817 | MapPin — pin de clima con icono | 2 | ✅ Done |
| US-819 | NestPin — hexágono coloreado por tipo | 3 | ✅ Done |
| US-820 | CityTooltip — tooltip en hover de pin | 2 | ✅ Done |
| US-822 | MapLegend — leyenda dinámica del mapa | 2 | ✅ Done |
| US-825 | Eliminación del modo "todo" (activeTab) | 1 | ✅ Done (parcial — ver US-826) |

> **Nota US-825:** El valor `'todo'` fue eliminado conceptualmente pero quedó en el código de `MapView.tsx`. US-826 cierra esta deuda técnica.

---

## Sesión 3 — Capas independientes ⬅ ACTUAL

**Orden de implementación recomendado:**

| US | Título | SP | Status | Dependencias |
|---|---|---|---|---|
| **US-826** | Migración `activeTab` → `activeLayers` en Zustand | 3 | ✅ Done (ver nota) | — |
| **US-823** | Layer toggles en Header | 2 | ✅ Done (ver nota) | US-826 |
| **US-824** | Layout general: mapa como protagonista | 1 (reducido, ver DEC-904) | ✅ Done | US-826 |
| **US-821** | Panel de filtros deslizante en sidebar por capa (rediseño 2026-07-05, ver DEC-906) | 5 | ✅ Done (8b602dd) | US-826, US-823 |
| **US-818** | Feed unificado en sidebar (clima + nidos) | 5 | ✅ Done (sesion 13) | US-826, US-821, US-823 |
| **US-815** | Leyenda dinámica por capas activas | 2 | ⏳ Pendiente | US-826, US-823 |

**Total SP sesión 3:** 19 (revisado — US-821 sube de 3 a 5 SP por rediseño a panel deslizante, ver DEC-906)

> US-826 es el desbloqueo de toda la sesión. Implementar primero, el resto en paralelo o secuencial.

> **Nota post-auditoria 2026-06-28:** La implementacion original de 2026-06-21 de US-826/823/821/818 (commits `9d08644, 6dd2468, 342e0e1, fae3265, aeafcd3, 2efee11`) fue revertida en `c6df8e5` por resultado no esperado — el revert NO actualizo el status de los specs individuales, que quedaron incorrectamente marcados "Done". Al reimplementar US-824 (`4a3cca8`, 2026-06-28) se recreo `activeLayers` y `LayerToggles` como efecto colateral, dejando US-826 y US-823 funcionalmente cubiertas hoy. US-821 y US-818 siguen sin codigo real — quedan Pendientes. Ver `decisions.md` DEC-905.

---

## Sesión 4 — Validación y testing

| US | Título | SP | Status |
|---|---|---|---|
| US-901 | Tests de integración store + capas | 3 | ⏳ Pendiente |
| US-902 | Validación visual desktop + mobile | 2 | ⏳ Pendiente |
| US-903 | Performance — carga de capas y cache | 3 | ⏳ Pendiente |

---

## Enhancements — Filter Panel

| ENH | Titulo | Status |
|---|---|---|
| ENH-001 | Homologacion visual + UX del FilterPanel (sticky headers, colapso por grupo, toast, icono +/−) | ✅ Completado |
| ENH-002 | Badges por grupo + grid compacto + indicador contextual por fila + chips scrolleables | ✅ Completado |
| OBS-001 | Fixes observados post ENH-001/002: toast light theme, boton Limpiar unificado, chips onRemove con applied setters | ✅ Completado (sesion 9, 2026-07-15) |
| ENH-004 | Homologacion visual NestDetail — bottom sheet, sprite en header, hora local | ✅ Completado |
| ENH-006 | Sidebar oculto cuando no hay capa activa — transicion suave width+opacity 280ms; Overlay eliminado | ✅ Completado (sesion 23, 2026-07-25) — sin doc propio, ver sesion 23 en estado general |

## Bugfixes

| Bug | Titulo | Status |
|---|---|---|
| BUG-001 | "Ver en lista" no hacia scroll ni highlight | ✅ Resuelto — fix final en App.tsx (sesion 26, 2026-07-26) |
| BUG-002 | Popup de clima bloqueado por nido abierto | ✅ Resuelto |
| BUG-003 | MapLegend oculta por z-index de Leaflet | ✅ Resuelto (sesion 24, 2026-07-25) — z-index hardcodeado a 1000 en MapLegend.tsx |
| BUG-004 | Backdrop NestPopup bloqueaba scroll del sidebar | ✅ Resuelto (sesion 26, 2026-07-26) — `inset:0` → `left:360px` en `.np-backdrop` de NestPopup.tsx |
| BUG-005 | NestPopup backdrop eliminado + left corregido a 300px + popup centrado en area mapa | ✅ Resuelto (sesion 27, 2026-07-26, commit 809c2a0) — backdrop removido; `left: calc(300px + (100vw - 300px) / 2)` |

> Referencia de diseno final: `Filter Panel Final.dc.html` — claude.ai/design proyecto "Copy of Variantes filtros Pokeweather"

---

## Sesion 10 — Feed de Nidos (2026-07-16)

**Foco:** Definicion del modelo de datos del feed de nidos, diseno de tarjetas, logica de migracion.

### Decisiones tomadas

| Decision | Referencia |
|---|---|
| DEC-907 — `nextMigration` UTC + interval global Zustand para countdown | `decisions.md` |

### Documentacion actualizada

| Archivo | Cambio |
|---|---|
| `src/docs/architecture/12-nests-data-dictionary.md` | 7 campos nuevos en tipo `Nest`: `confirmed`, `confirmedAt`, `nextMigration`, `migrationCycle`, `pokemonId`, `stardust`, `stops` |
| `src/docs/architecture/11-nests-architecture.md` | Seccion nueva: logica de migracion + interval global |
| `src/docs/sprints/sprint-9/decisions.md` | DEC-907 agregado |
| `src/docs/sprints/sprint-9/US/US-818.md` | Criterios actualizados: NestCard con sprite/confirmacion/countdown/SD/stops |
| `src/docs/sprints/sprint-9/feature-nest/nest-feed-design.md` | Nuevo — diseno completo de tarjeta sidebar y detalle |

### Implementado esta sesion (codigo)

| Archivo | Cambio |
|---|---|
| `src/types/nest.ts` | 7 campos nuevos agregados al tipo `Nest` |
| `src/data/nests.json` | 8 nidos poblados con todos los campos nuevos |
| `src/store/useStore.ts` | `now: number` + `tickNow()` |
| `src/components/Map/MapView.tsx` | `useEffect` con tick global de migracion |
| `src/utils/timeUtils.ts` | `getMigrationStatus()` — funcion pura de countdown |

---

## Sesion 12 — US-818 Diseno y Documentacion (2026-07-22)

**Foco:** Cierre del diseno de US-818 — schema final aprobado, mockup de los 3 componentes, documentacion actualizada.

### Decisiones tomadas

| Decision | Referencia |
|---|---|
| DEC-909 — Schema definitivo `Nest` para US-818 | `decisions.md` |

### Diseno de referencia

Handoff completo disponible en claude.ai/design, proyecto "Copy of Variantes filtros Pokeweather":
- `design_handoff_nidos/README.md` — especificaciones detalladas de los 3 componentes
- `design_handoff_nidos/Nidos Sidebar.dc.html` — mockup renderizable (sidebar + popup confirmado + popup sin confirmar + detalle confirmado + detalle sin confirmar)

### Mockup generado

Artifact publicado en claude.ai/code/artifact/997dea60-abe3-4c0c-b184-de1e4626f3c8 — los 3 paneles side-by-side usando tokens DS reales (`var(--type-*)`, `var(--bg-*)`, etc.).

### Documentacion actualizada

| Archivo | Cambio |
|---|---|
| `src/docs/architecture/12-nests-data-dictionary.md` | Schema `Nest` reescrito con campos planos, campos derivados, migracion global, ejemplo JSON actualizado |
| `src/docs/sprints/sprint-9/decisions.md` | DEC-909 agregado |
| `src/docs/sprints/sprint-9/US/US-818.md` | Criterios reescritos para NestCard + NestPopup + NestDetail, tabla de archivos actualizada |

### Proximo paso (implementacion)

En orden:
1. `src/types/nest.ts` — aplicar schema DEC-909
2. `src/data/nests.json` — poblar con schema nuevo (8 nidos)
3. `src/config/nestMigration.ts` — constante `NEXT_MIGRATION`
4. `src/components/Nests/NestCard.tsx`
5. `src/components/Nests/NestPopup.tsx`
6. `src/components/Nests/NestDetail.tsx`
7. `src/components/Sidebar/LocationFeed.tsx` — conectar NestCard al feed

---

## Sesion 13 — US-818 Implementacion completa (2026-07-22)

**Foco:** Implementacion de los 3 componentes de nidos + integracion en feed y mapa.

### Implementado esta sesion (codigo)

| Archivo | Cambio |
|---|---|
| `src/types/nest.ts` | Schema DEC-909 — campos planos, sin nestPokemon[], sin nextMigration por nido |
| `src/data/nests.json` | 8 nidos actualizados con pokemonId, hasShiny, rarity, evolutionLine, confirmed, confirmedAt |
| `src/config/nestMigration.ts` | Creado — constante global `NEXT_MIGRATION` |
| `src/utils/timeUtils.ts` | `getMigrationStatus()` — funcion pura, 5 casos de display |
| `src/store/useStore.ts` | `now: number` + `tickNow()` en store |
| `src/components/Nests/NestCard.tsx` | Creado — item feed sidebar: sprite, badges ✓/? HOT/NEW, tipos, spawn%, rareza |
| `src/components/Nests/NestDetail.tsx` | Creado — panel 310px: countdown, grid stardust/shiny/rareza, evo line, grid nido, "Ver en lista" |
| `src/components/Nests/NestPopup.tsx` | Creado — popup 290px: sprite, tipos, stats, countdown, "Ver detalle →" |
| `src/components/Map/FlyToNest.tsx` | Creado — observa selectedNest, flyTo zoom 14 |
| `src/components/Map/NestPin.tsx` | Corregido — campos viejos (pokemon, pokemonType) → schema DEC-909 |
| `src/components/Sidebar/LocationFeed.tsx` | Feed unificado: nidos + ciudades, separador, auto-scroll, empty state |
| `src/components/Map/MapView.tsx` | FlyToNest + NestPopup flotante al seleccionar pin |
| `src/App.tsx` | `setInterval(tickNow, 60_000)` — timer global countdown |
| `src/components/Sidebar/Sidebar.tsx` | Fix BUG-001 — LocationFeed visible con `activeLayers.nidos` activo |

### Bug encontrado y corregido

| Bug | Archivo | Fix |
|---|---|---|
| BUG-001 — LocationFeed no se monta cuando solo Nidos activo | `Sidebar.tsx:103` | `activeLayers.clima` → `activeLayers.clima \|\| activeLayers.nidos` |

---

## Archive

| US | Razón |
|---|---|
| US-816 | Descartada — reemplazada por US-819 |
| *(agregar aquí US descartadas en sesión 3 si aplica)* | |

---

## Capas planificadas

| Capa | LayerKey | Status | US |
|---|---|---|---|
| Clima | `clima` | ✅ Activa | US-826 |
| Nidos | `nidos` | ✅ Activa | US-826 |
| Gimnasios | `gyms` | 🔲 Preparada (toggle deshabilitado) | Futuro sprint |
| PokéParadas | `stops` | 🔲 Preparada (toggle deshabilitado) | Futuro sprint |
| Rutas | `rutas` | 🔲 Preparada (toggle deshabilitado) | Futuro sprint |

---

## Color system — capas

Usar estos valores consistentemente en toda la app (toggles, filtros, pins, tags, leyenda):

| Capa | Color | Hex |
|---|---|---|
| Clima | Azul | `#3b82f6` |
| Nidos | Verde | `#22c55e` |
| Gimnasios | Naranja | `#f97316` |
| PokéParadas | Violeta | `#a78bfa` |
| Rutas | Ámbar | `#f59e0b` |
| Multi-capa | Azul índigo | `#4f7cff` |

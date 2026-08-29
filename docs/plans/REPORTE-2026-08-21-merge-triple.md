# Reporte Ejecutivo — Merge Triple
**Fecha:** 2026-08-21
**Rama sandbox:** `merge/nests-to-main`
**Autor:** Geovanny M + Claude Sonnet 4.6

---

## Resumen Ejecutivo

Se integro exitosamente el trabajo de dos ramas paralelas (`sprint-12` y `sprint-9-nests`) en una sola rama sandbox (`merge/nests-to-main`), sin romper el build en ningun momento. El resultado es una base unificada lista para mergear a `main`.

| Metrica | Valor |
|---|---|
| Commits integrados (sprint-12) | 193 |
| Commits integrados (sprint-9-nests) | 152 |
| Commits generados en sandbox | 11 |
| Archivos nuevos integrados | ~60 |
| Archivos con conflictos resueltos | 14 |
| Errores de build al finalizar | 0 |
| Warnings (preexistentes, sin regresion) | 9 |
| Errores TS preexistentes de sprint-12 | 0 (se resolvieron solos al usar versiones correctas) |

---

## Estrategia de Merge

El merge se ejecuto en **3 etapas macro**:

1. **Etapa A — sprint-12 al sandbox**: `git merge sprint-12` directo. Sin conflictos porque el sandbox estaba vacio.
2. **Etapa B — sprint-9-nests al sandbox (fases B1-B13)**: Integracion manual archivo por archivo, resolviendo conflictos de schema, tipos y React Compiler.
3. **Etapa C — pendiente**: merge `merge/nests-to-main` → `main`.

---

## Detalle por Fase

### Fase A — sprint-12 (merge directo)

**Commit:** `d87d3b7 Merge branch 'sprint-12' into merge/nests-to-main`

Se tomo sprint-12 completo como base. Incluye:
- EPIC-001: sistema Firebase/Firestore como fuente de verdad
- WeatherCondition con condicion `'clear'`
- REF-003/REF-004: eliminacion de `ClassificationReportModal` y `saveCityForecast`
- US-1201/1203/1205/1206/1207: panel de precision, condicion clear, script migracion
- BUG-029/034: fixes de autoSync y tabla predictiva

No hubo conflictos. Build limpio.

---

### Fase B1 — Config exclusivos nests

**Commit:** `af08ccd`

Archivos agregados (nuevos, sin conflicto):
- `src/config/countryFlags.ts`
- `src/config/nestMigration.ts`
- `src/config/nestThresholds.ts`
- `src/config/pokemonTypes.ts`
- `src/config/zIndex.ts`

Errores: ninguno.

---

### Fase B2 — Types y utils exclusivos nests

**Commit:** `131add0`

Archivos agregados:
- `src/types/homeLocation.ts`
- `src/types/navPin.ts`
- `src/types/nest.ts`
- `src/utils/cooldown.ts`
- `src/utils/distance.ts`
- `src/utils/timeUtils.ts`

Errores: ninguno.

---

### Fase B3 — Store fusionado

**Commit:** `9eb2d8e`

El store (`src/store/useStore.ts`) fue el archivo mas critico del merge. Nests y sprint-12 divergieron profundamente.

**Lo que se tomo de cada rama:**

| Campo/Accion | Origen |
|---|---|
| `activeLayers`, `nests`, `homeLocation`, `draftFilters`, `filterPanel` | nests |
| `autoSyncEnabled`, `setAutoSyncEnabled` | sprint-12 |
| `sidebarOpen`, `setSidebarOpen` | sprint-12 |
| `WeatherCondition` (incluye `'clear'`) | sprint-12 (`weatherClassify.ts`) |
| `nestSortBy` con valor `'cooldown'` | sprint-12 |
| `highlightNestRow`, `setHighlightNestRow` | nests (nuevo) |

**Errores resueltos:**

| Error | Causa | Fix |
|---|---|---|
| `WeatherCondition` no incluye `'clear'` | nests usaba union literal sin ese valor | Importar tipo desde `weatherClassify.ts` |
| `autoSyncEnabled` faltante | nests lo elimino; `SyncToggle` y `App.tsx` lo necesitan | Restaurar desde sprint-12 |
| `SortDirection` no exportado | nests lo hizo privado; `FilterPanel.tsx` lo importa | `export type SortDirection` |
| `nestSortBy` sin `'cooldown'` | sprint-12 agrego ese valor; nests no lo tenia | Extender union type |
| `highlightNestRow` faltante | `MapZoomControls` lo usa pero no estaba en store | Agregar campo e inicializar en `null` |

---

### Fase B4-B5 — Servicios Firebase + Data y assets

**Commit:** `2346ee2`

Archivos agregados (nests, sin conflicto):
- `src/data/nests.json` (dataset de nidos)
- `src/data/pokedensity-nests.json`
- `public/assets/icons/*` (iconos webp/avif de tipos Pokemon)
- `src/assets/icons/*`

Servicios Firebase: se conservo la version sprint-12 completa. La version nests no tenia Firebase.

Errores: ninguno.

---

### Fase B7 — Header y componentes exclusivos nests

**Commit:** `2becc7d`

Archivos nuevos desde nests:
- `src/components/Header/FilterPanelClima.tsx`
- `src/components/Header/FilterPanelNests.tsx`
- `src/components/Header/LayerToggles.tsx`
- `src/components/Header/SortDropdown.tsx`

**Errores resueltos:**

| Error | Causa | Fix |
|---|---|---|
| `@tabler/icons-react` no instalado | `LayerToggles.tsx` lo importa; sprint-12 no lo tenia | `npm install @tabler/icons-react` |
| `Header.tsx` pasaba `cities` a `TestingTools` | sprint-12 elimino ese prop de `TestingTools` | Eliminar `HeaderProps`, simplificar a `Header()` sin props |
| `FilterPanelClima.tsx` tenia 4 `as any` | Tipos `SortMode`, `SortDirection`, `Region` no usados explicitamente | Reemplazar con casts tipados via import inline |
| `FilterPanelNests.tsx` tenia 2 `as any` | Mismo patron | Reemplazar con union literal explicito |
| `TestingTools`, `PrecisionMetrics`, `HistoryGrid` incompatibles | Nests usaba schema `classified` y `weatherHistoryService` eliminados en REF-003 | Usar versiones sprint-12; descartar versiones nests |

---

### Fase B8 — Sidebar completo + NestCard/MigrationBanner

**Commit:** `11d0845`

Archivos nuevos desde nests:
- `src/components/Sidebar/FeedHeader.tsx`
- `src/components/Sidebar/FilterPanel.tsx`
- `src/components/Sidebar/HomeChip.tsx`
- `src/components/Sidebar/HomeModal.tsx`
- `src/components/Sidebar/Sidebar.tsx`
- `src/components/Sidebar/filters/AccordionSection.tsx`
- `src/components/Sidebar/filters/GroupHeader.tsx`
- `src/components/Sidebar/filters/PillsGrid.tsx`
- `src/components/Sidebar/filters/PillsWrap.tsx`
- `src/components/Sidebar/filters/RadioList.tsx`
- `src/components/Nests/NestCard.tsx`
- `src/components/Nests/MigrationBanner.tsx`

Archivo con conflicto:
- `src/components/Sidebar/LocationDetail.tsx` — nests importaba `ClassificationReportModal` (eliminado en REF-003). Se uso la version sprint-12.

**Errores resueltos:**

| Error | Causa | Fix |
|---|---|---|
| `FilterPanel.tsx`: `REGION_LABEL` no usado | Variable declarada pero nunca usada (TS6133) | Eliminar |
| `FilterPanel.tsx`: `toggleDraftType` no usado | Funcion declarada pero sin call site | Eliminar |
| `FilterPanel.tsx`: `setDraftType` no usado | Subscripcion al store sin uso | Eliminar |
| `FilterPanel.tsx`: 6 `as any` | Tipos sin cast explicito | Reemplazar con `Region`, `SortMode`, union nestSortBy |
| `HomeChip.tsx`: setState en useEffect | React Compiler prohibe setState sincrono en effects | Envolver en `setTimeout(fn, 0)` |
| `NestCard.tsx`: `Date.now()` en render | React Compiler: funcion impura | Reemplazar con `now` del store |
| `LocationDetail.tsx` conflicto | Nests importa modal eliminado | Usar version sprint-12 |

---

### Fase B9 — Mapa completo

**Commit:** `2c58ec0`

Archivos nuevos desde nests:
- `src/components/Map/FlyToCity.tsx`
- `src/components/Map/FlyToNest.tsx`
- `src/components/Map/HomePin.tsx`
- `src/components/Map/MapContextMenu.tsx`
- `src/components/Map/MapPin.tsx`
- `src/components/Map/MapSearch.tsx`
- `src/components/Map/MapZoomControls.tsx`
- `src/components/Map/NavPin.tsx`
- `src/components/Map/NestPin.tsx`
- `src/components/Nests/NestDetail.tsx`
- `src/components/Nests/NestPopup.tsx`

Archivos con conflicto resuelto:
- `src/components/Map/MapView.tsx`
- `src/components/Map/MapLegend.tsx`

**Errores resueltos:**

| Error | Causa | Fix |
|---|---|---|
| `MapLegend`: `cities?: any[]` | Tipo sin definir | `cities?: City[]` con import |
| `MapLegend`: campo `stops` en lugar de `density` | sprint-12 usa `density`; nests usaba `stops` | `density: c.density ?? 0` para ciudades, `density: n.stops ?? 0` para nidos |
| `MapLegend`: `'spawn'` no en `LegendRowKey` | Nests agrega fila spawn; tipo no la incluia | Extender: `BadgeType \| 'verified' \| 'spawn'` |
| `MapLegend`: `rating` no existe en `Nest` | Tipo `Nest` no tiene ese campo | Hardcodear `rating: 0` |
| `MapView`: `import { Z }` sin uso | Import eliminado en sprint-12 | Eliminar import |
| `MapView`: `Map<string, any[]>` | Tipo impreciso | `Map<string, string[]>` |
| `MapSearch`: `(d: any)` para OSM | Respuesta Nominatim sin tipar | `(d: Record<string, string>)` |
| `MapZoomControls`: parametro `kind` no usado | Funcion `handleHlRow` recibia arg que nadie usaba | Eliminar parametro y actualizar call sites |
| `NestDetail`: 2x `Date.now()` | React Compiler: impuro | Reemplazar con `now` del store |
| `NestPopup`: `Date.now()` | Mismo patron | Reemplazar con `now` del store |
| Store: `highlightNestRow` faltante | `MapZoomControls` lo necesita | Agregar a `AppStore` + estado inicial |

---

### Fase B11 — UI exclusivos nests

**Commit:** `0bf7ef1`

Archivos nuevos desde nests:
- `src/components/UI/LockIcon.tsx`
- `src/components/UI/Overlay.tsx`
- `src/components/UI/OverlayFilterPanel.tsx`
- `src/components/UI/ResponsiveImage.tsx`

Archivos sin cambio (sprint-12 tenia versiones mas nuevas):
- `src/components/UI/Toast.tsx`
- `src/components/UI/FilterPanelModal.tsx`

Errores: ninguno.

---

### Fase B12 — TestingTools y tests

Sin commits. No habia tests propios en nests. `.design-sync` no se incluye en el repo. `TestingTools` ya usaba la version sprint-12 desde B7.

---

### Fase B13 — App.tsx final

**Commit:** `1ee1e96`

El archivo con mayor divergencia entre ramas despues del store.

**Lo que se tomo de cada rama:**

| Elemento | Origen |
|---|---|
| Firebase, Firestore, `syncForecastsOnLoad`, `useFirestoreSync` | sprint-12 |
| `initializeSettings`, `getAutoSyncSetting` | sprint-12 |
| `homeLocation` en deps de `filteredCities` | nests |
| `tickNow` + `setInterval(60s)` countdown nidos | nests |
| CSS `.app-body` con `flex: 1` sin `margin-top` fijo | nests |

**Errores resueltos:**

| Error | Causa | Fix |
|---|---|---|
| `selectedNest` no usado | Nests lo leia pero no lo usaba en JSX | No incluir |
| `scrollToFeed` no usado | Mismo caso | No incluir |
| `console.log` en `useMemo` | Debug de nests | Eliminar |
| `margin-top: 80px` hardcoded | Sprint-12 usaba margin fijo; nests usa flex flow | Adoptar version nests: `flex: 1` |

---

## Patron de errores recurrente

El 80% de los errores vino de 3 fuentes:

1. **React Compiler (nests no lo tenia activo)**: `Date.now()` en render y `setState` sincrono en effects. Fix uniforme: `now` del store y `setTimeout`.
2. **`as any` heredados**: nests fue desarrollado sin strictness total. Fix: tipos explicitos o casts tipados.
3. **Schema de sprint-12 vs nests**: sprint-12 elimino `saveCityForecast`, `ClassificationReportModal`, `weatherHistoryService`. Fix: usar siempre la version sprint-12 para esos modulos.

---

## Estado actual

```
rama:  merge/nests-to-main
build: LIMPIO
lint:  0 errores / 9 warnings preexistentes
tsc:   0 errores
```

**Pendiente Fase C:** `git merge merge/nests-to-main → main`

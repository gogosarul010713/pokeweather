# PLAN-2026-08-20 -- Merge triple: sprint-12 + sprint-9-nests -> main

**Fecha:** 2026-08-20
**US relacionada:** US-914
**Rama sandbox:** `merge/nests-to-main` (creada desde main)
**Estado:** Pendiente

---

## Contexto

Dos ramas activas sobre el mismo repo, ambas divergen de `main`:
- `sprint-12` (pokeweather): 193 commits, 276 archivos
- `sprint-9-nests` (nests worktree): 152 commits, 336 archivos
- **Overlaps de codigo real:** 25 archivos (store, App, servicios firebase, Map, Sidebar, hooks)

## Estrategia

1. Crear `merge/nests-to-main` desde `main`
2. Mergear `sprint-12` primero (base del app core + firebase)
3. Mergear `sprint-9-nests` encima (feature nests completa)
4. Resolver conflictos fase a fase, no todos juntos
5. Probar app despues de cada fase
6. Solo cuando todo este verde: `git merge merge/nests-to-main` en `main`

**Orden elegido:** sprint-12 primero porque tiene la infraestructura firebase/analytics que nests extiende.

---

## Archivos con overlap (conflictos esperados)

| Archivo | Sprint-12 cambia | Sprint-9-nests cambia |
|---------|------------------|-----------------------|
| `src/store/useStore.ts` | SI | SI |
| `src/App.tsx` | SI | SI |
| `src/hooks/useWeather.ts` | SI | SI |
| `src/components/Map/MapView.tsx` | SI | SI |
| `src/components/Map/MapLegend.tsx` | SI | SI |
| `src/components/Sidebar/LocationCard.tsx` | SI | SI |
| `src/components/Sidebar/LocationDetail.tsx` | SI | SI |
| `src/components/Sidebar/LocationFeed.tsx` | SI | SI |
| `src/components/Header/Header.tsx` | SI | SI |
| `src/components/UI/FilterPanelModal.tsx` | SI | SI |
| `src/components/TestingTools/TestingTools.tsx` | SI | SI |
| `src/components/TestingTools/PrecisionMetrics.tsx` | SI | SI |
| `src/services/firebase/*.ts` (4 archivos) | SI | SI |
| `src/services/weather/weatherService.ts` | SI | SI |
| `src/services/weather/batchWeatherService.ts` | SI | SI |
| `vite.config.ts` | SI | SI |
| `package.json` / `package-lock.json` | SI | SI |

---

## Fases -- PARTE A: Merge sprint-12

### A1 -- Config e infraestructura
**Archivos:** `vite.config.ts`, `package.json`, `package-lock.json`, `.gitignore`, `index.html`, `.firebaserc`, `firebase.json`, `.env.local.example`
**Test:** `npm run build` pasa. App arranca en puerto 5173.
**Estado:** [ ] Pendiente

---

### A2 -- Types, utils y config
**Archivos:** `src/types/*`, `src/config/weatherImages.ts`, `src/utils/*`
**Test:** Sin errores TypeScript. `npm run build` pasa.
**Estado:** [ ] Pendiente

---

### A3 -- Store
**Archivos:** `src/store/useStore.ts`
**Test:** App arranca. Zustand sin errores en consola. Estado inicial correcto.
**Riesgo:** Nucleo del estado -- si falla aqui, nada mas es fiable.
**Estado:** [ ] Pendiente

---

### A4 -- Servicios firebase y weather
**Archivos:** `src/services/firebase/*`, `src/services/weather/*`, `src/services/cache/*`, `src/services/cleanup/*`, `src/services/history/*`, `src/services/lookback/*`, `src/services/predictions/*`, `src/services/geo/s2Service.ts`
**Test:** Firebase conecta. Ciudades cargan clima. Sin errores 400/403 en consola.
**Estado:** [ ] Pendiente

---

### A5 -- Hooks
**Archivos:** `src/hooks/useWeather.ts`, `src/hooks/useFirestoreSync.ts`, `src/hooks/usePrecisionStats.ts`
**Test:** Clima se actualiza. Sync badge responde.
**Estado:** [ ] Pendiente

---

### A6 -- Componentes UI base y Header
**Archivos:** `src/components/UI/*`, `src/components/Header/*`, `src/components/Settings/*`
**Test:** Header renderiza. FilterPanel abre. LoadingScreen aparece y desaparece.
**Estado:** [ ] Pendiente

---

### A7 -- Sidebar y LocationCards
**Archivos:** `src/components/Sidebar/LocationCard.tsx`, `src/components/Sidebar/LocationDetail.tsx`, `src/components/Sidebar/LocationFeed.tsx`
**Test:** Lista de ciudades visible. Cards con clima correcto.
**Estado:** [ ] Pendiente

---

### A8 -- Mapa
**Archivos:** `src/components/Map/MapView.tsx`, `src/components/Map/MapLegend.tsx`
**Test:** Mapa carga. Pines aparecen. Sin errores Leaflet.
**Estado:** [ ] Pendiente

---

### A9 -- Analytics y TestingTools
**Archivos:** `src/components/Analytics/*`, `src/components/TestingTools/*`
**Test:** Panel analytics abre. Sin errores React.
**Estado:** [ ] Pendiente

---

### A10 -- App.tsx + main.tsx + scripts
**Archivos:** `src/App.tsx`, `src/main.tsx`, `scripts/*`, `functions/*`
**Test:** App completa arranca. Golden path: ciudad -> clima -> mapa. `npm run test` pasa.
**Estado:** [ ] Pendiente

---

## Fases -- PARTE B: Merge sprint-9-nests (encima de A)

### B1 -- Config exclusivo nests
**Archivos:** `src/config/countryFlags.ts`, `src/config/nestMigration.ts`, `src/config/nestThresholds.ts`, `src/config/pokemonTypes.ts`, `src/config/zIndex.ts`, `src/index.css`
**Test:** `npm run build` pasa. Estilos sin regresion visual.
**Estado:** [ ] Pendiente

---

### B2 -- Types y utils exclusivos nests
**Archivos:** `src/types/homeLocation.ts`, `src/types/navPin.ts`, `src/types/nest.ts`, `src/utils/cooldown.ts`, `src/utils/distance.ts`, `src/utils/timeUtils.ts`
**Test:** Sin errores TypeScript.
**Estado:** [ ] Pendiente

---

### B3 -- Store (merge de conflicto)
**Archivos:** `src/store/useStore.ts` -- CONFLICTO ESPERADO
**Test:** Todas las features del store funcionan: estado clima + estado nests + zona fijada.
**Riesgo alto:** Cambios mas densos del merge. Revisar campo a campo.
**Estado:** [ ] Pendiente

---

### B4 -- Servicios firebase (merge de conflicto)
**Archivos:** `src/services/firebase/*` -- CONFLICTO ESPERADO en classificationReportService, firebaseWeatherService, index, weatherCatalogService
**Test:** Firebase conecta. Nidos se consultan. Sin errores 400/403.
**Estado:** [ ] Pendiente

---

### B5 -- Data y assets
**Archivos:** `src/data/nests.json`, `src/data/pokedensity-cities.json`, `src/data/pokedensity-nests.json`, `public/assets/icons/*`, `src/assets/icons/*`
**Test:** Datos de nidos visibles en app. Iconos cargan.
**Estado:** [ ] Pendiente

---

### B6 -- Hook useWeather (merge de conflicto)
**Archivos:** `src/hooks/useWeather.ts` -- CONFLICTO ESPERADO
**Test:** Clima carga. Nidos con clima potenciado se muestran correctamente.
**Estado:** [ ] Pendiente

---

### B7 -- Componentes Header exclusivos nests
**Archivos:** `src/components/Header/FilterPanelClima.tsx`, `src/components/Header/FilterPanelNests.tsx`, `src/components/Header/LayerToggles.tsx`, `src/components/Header/SortDropdown.tsx`
**Conflicto:** `Header.tsx` -- revisar manualmente
**Test:** Tabs clima/nests en header. Filtros de nidos responden.
**Estado:** [ ] Pendiente

---

### B8 -- Componentes Sidebar (merge de conflicto)
**Archivos:** `src/components/Sidebar/*` -- CONFLICTO en LocationCard, LocationDetail, LocationFeed
**Nuevos:** `FeedHeader.tsx`, `FilterPanel.tsx`, `HomeChip.tsx`, `HomeModal.tsx`, `Sidebar.tsx`, `ClassificationReportModal.tsx`, `filters/*`
**Test:** Sidebar muestra lista clima Y lista nidos. Tabs funcionan. HomeChip visible.
**Estado:** [ ] Pendiente

---

### B9 -- Mapa (merge de conflicto)
**Archivos:** `MapView.tsx`, `MapLegend.tsx` -- CONFLICTO ESPERADO
**Nuevos:** `FlyToCity.tsx`, `FlyToNest.tsx`, `HomePin.tsx`, `MapContextMenu.tsx`, `MapPin.tsx`, `MapSearch.tsx`, `MapZoomControls.tsx`, `NavPin.tsx`, `NestPin.tsx`
**Test:** Mapa con pines nests. Click derecho -> menu. Fijar zona funciona. FlyTo funciona.
**Riesgo alto:** Leaflet + orden de montaje.
**Estado:** [ ] Pendiente

---

### B10 -- Componentes Nests
**Archivos:** `src/components/Nests/*` (NestCard, NestDetail, NestPopup, MigrationBanner)
**Test:** Panel nidos abre. Cards con datos. Migracion ciclica funciona. Cooldown PGSharp visible.
**Estado:** [ ] Pendiente

---

### B11 -- UI exclusivo nests
**Archivos:** `src/components/UI/LockIcon.tsx`, `src/components/UI/Overlay.tsx`, `src/components/UI/OverlayFilterPanel.tsx`, `src/components/UI/ResponsiveImage.tsx`, `src/components/UI/Toast.tsx`
**Conflicto:** `FilterPanelModal.tsx` -- revisar manualmente
**Test:** Overlays abren. Toast aparece. Sin regresion en modales existentes.
**Estado:** [ ] Pendiente

---

### B12 -- TestingTools y tests
**Archivos:** `src/components/TestingTools/ReportsPanel.tsx`, `tests/*`, `.design-sync/*`
**Conflicto:** `TestingTools.tsx`, `PrecisionMetrics.tsx` -- revisar manualmente
**Test:** `npm run test` pasa. App.tsx final sin errores -- CONFLICTO ESPERADO.
**Estado:** [ ] Pendiente

---

### B13 -- App.tsx final (merge de conflicto)
**Archivos:** `src/App.tsx` -- CONFLICTO ESPERADO (el mas complejo)
**Test:** App completa: clima + nests + firebase + mapa. Golden path completo.
**Estado:** [ ] Pendiente

---

## Fase C -- Merge final a main

**Condicion:** Fases A1-A10 y B1-B13 todas verdes, sin regresiones sin resolver.
**Accion:** `git merge merge/nests-to-main` en main desde el worktree principal.
**Estado:** [ ] Pendiente

---

## Bitacora de conflictos

| Fase | Archivo | Conflicto | Resolucion |
|------|---------|-----------|------------|
| --   | --      | --        | --         |

_Completar durante la ejecucion._

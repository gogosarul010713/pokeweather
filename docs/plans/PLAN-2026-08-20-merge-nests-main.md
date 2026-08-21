# PLAN-2026-08-20 -- Merge gradual nests -> main

**Fecha:** 2026-08-20
**US relacionada:** US-914
**Rama sandbox:** `merge/nests-to-main` (creada desde main)
**Estado:** Pendiente

---

## Contexto

30+ commits, 327 archivos cambiados (59841 ins / 5401 del) entre `sprint-9-nests` y `main`.
El merge se hace en una rama intermedia para no afectar ni `main` ni `sprint-9-nests` durante la validacion.

---

## Estrategia

1. Crear `merge/nests-to-main` desde `main`
2. Incorporar cambios por fase (feature a feature, no todo de golpe)
3. Probar la app despues de cada fase con servidor corriendo y datos reales
4. Documentar en este archivo el punto exacto donde se pierde funcionalidad
5. Solo cuando todas las fases esten verdes: `git merge merge/nests-to-main` en `main`

---

## Fases

### FASE 1 -- Infraestructura y config
**Archivos:** `vite.config.ts`, `package.json`, `package-lock.json`, `.gitignore`, `src/index.css`, `src/config/*`
**Test:** `npm run build` pasa. App arranca. Sin pantalla rota.
**Estado:** [ ] Pendiente

---

### FASE 2 -- Store y types
**Archivos:** `src/store/useStore.ts`, `src/types/*`, `src/utils/*`
**Test:** App arranca. Zustand sin errores en consola. Filtros basicos responden.
**Riesgo:** Store es nucleo compartido -- si falla aqui, las fases siguientes no son fiables.
**Estado:** [ ] Pendiente

---

### FASE 3 -- Servicios y datos
**Archivos:** `src/services/**`, `src/data/*.json`, `src/hooks/useWeather.ts`
**Test:** Ciudades cargan. Clima se muestra. Firebase sin errores 400/403.
**Riesgo:** `nests.json` puede introducir datos que el store aun no espera.
**Estado:** [ ] Pendiente

---

### FASE 4 -- Componentes UI base
**Archivos:** `src/components/UI/*`, `src/components/Header/*`, `src/components/Sidebar/filters/*`
**Test:** Header renderiza. FilterPanel abre. Chips responden. Sin errores React.
**Estado:** [ ] Pendiente

---

### FASE 5 -- Sidebar y cards
**Archivos:** `src/components/Sidebar/*` (HomeChip, HomeModal, LocationCard, LocationFeed, FeedHeader, Sidebar)
**Test:** Sidebar muestra lista. HomeChip visible. Mi Zona funciona si hay zona fijada.
**Estado:** [ ] Pendiente

---

### FASE 6 -- Mapa
**Archivos:** `src/components/Map/*` (MapView, MapPin, NestPin, HomePin, NavPin, MapSearch, MapContextMenu, MapLegend, MapZoomControls, FlyToCity, FlyToNest)
**Test:** Mapa carga. Pines aparecen. Click derecho muestra menu. Fijar zona funciona. Nidos visibles.
**Riesgo alto:** Leaflet + React tiene dependencias de orden de montaje -- fase mas probable de regresion.
**Estado:** [ ] Pendiente

---

### FASE 7 -- Componentes Nests
**Archivos:** `src/components/Nests/*` (NestCard, NestDetail, NestPopup, MigrationBanner)
**Test:** Panel nidos abre. Cards con datos. Migracion ciclica funciona. Cooldown PGSharp visible.
**Estado:** [ ] Pendiente

---

### FASE 8 -- Testing tools y scripts
**Archivos:** `src/components/TestingTools/*`, `tests/*`, `scripts/*`, `.design-sync/*`
**Test:** `npm run test` pasa. Herramientas internas no rompen build.
**Estado:** [ ] Pendiente

---

### FASE 9 -- Merge final a main
**Condicion:** Fases 1-8 verdes, sin regresiones sin resolver.
**Accion:** `git merge merge/nests-to-main` en main. Eliminar worktree.
**Estado:** [ ] Pendiente

---

## Bitacora de regresiones

| Fase | Archivo | Comportamiento roto | Resolucion |
|------|---------|---------------------|------------|
| --   | --      | --                  | --         |

_Completar durante la ejecucion._

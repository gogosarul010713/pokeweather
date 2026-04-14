# Sprint 9 — Nidos de Pokémon (Fase 1)

**Status:** En Desarrollo  
**Rama:** `sprint-9-nests`  
**User Stories:** 7 (US-801 a US-807)  
**Story Points:** 16 SP  
**Sesiones Planificadas:** 3 (~7 horas)  
**Última actualización:** 2026-04-13

---

## 📚 Documentación por Sección

### 🏗️ Arquitectura (leer primero)
- **[11-nests-architecture.md](../architecture/11-nests-architecture.md)** — Diseño de módulos, separación Nidos vs Clima, responsabilidades
- **[12-nests-data-dictionary.md](../architecture/12-nests-data-dictionary.md)** — Interfaces TypeScript completas, schemas JSON, modelos de datos

### 📋 User Stories Detalladas
Cada US contiene criterios de aceptación, pseudocódigo y pasos de implementación:

| US | Descripción | SP | Prioridad |
|----|-----------|----|-----------|
| **[US-801](../sprints/sprint-9/US/US-801.md)** | Cargar 5 nidos desde JSON → IndexedDB | 2 | P0 |
| **[US-802](../sprints/sprint-9/US/US-802.md)** | Renderizar pins púrpura en mapa con hover/clic | 3 | P0 |
| **[US-803](../sprints/sprint-9/US/US-803.md)** | Listado de nidos en sidebar (modos list/detalle/favoritos) | 2 | P0 |
| **[US-804](../sprints/sprint-9/US/US-804.md)** | Panel deslizante con info completa del nido | 3 | P0 |
| **[US-805](../sprints/sprint-9/US/US-805.md)** | Toggle para cambiar entre Clima ⇄ Nidos | 2 | P0 |
| **[US-806](../sprints/sprint-9/US/US-806.md)** | Cache persistente en IndexedDB (CRUD) | 2 | P0 |
| **[US-807](../sprints/sprint-9/US/US-807.md)** | Popup de información rápida al clic en pins | 2 | P0 |

### 🛠️ Plan de Trabajo por Sesión

- **[01-sesion-1-servicios.md](../sessions/01-sesion-1-servicios.md)** — SESIÓN 1 (2h): Tipos, servicios, store, useNests hook
- **[02-sesion-2-componentes.md](../sessions/02-sesion-2-componentes.md)** — SESIÓN 2 (3h): Componentes principales (Map, Sidebar, Detail)
- **[03-sesion-3-integracion.md](../sessions/03-sesion-3-integracion.md)** — SESIÓN 3 (2h): Integración, ModeToggle, E2E testing, Build

### 📁 Referencias
- **[ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md)** — Árbol completo de archivos a crear, ubicaciones y responsabilidades
- **[CHECKLIST-FASE-1.md](CHECKLIST-FASE-1.md)** — Checklist maestro con todas las tareas granulares por sesión

### 🎨 Diseño
- **[04-nests-design-system.md](../overview/04-nests-design-system.md)** — Paleta de colores, CSS variables, estilos de badges y tipos Pokémon

---

## 🎯 Resumen Ejecutivo

**Objetivo:**  
Implementar módulo **Nidos de Pokémon** como feature independiente e integrado con el módulo de Clima.

**Alcance Sprint 9:**
- ✅ 5 nidos estáticos (cargados desde JSON)
- ✅ Visualización en mapa (pins púrpura interactivos)
- ✅ Listado en sidebar con modo detalle
- ✅ Panel deslizante con información completa
- ✅ Toggle Clima ⇄ Nidos para cambiar modo
- ✅ Persistencia de favoritos en localStorage (vía Zustand)
- ✅ Caché en IndexedDB separado del clima

**No incluye (Sprint 10+):**
- Filtros/ordenamiento
- Visualización de áreas geográficas (S2 geometry)
- Búsqueda avanzada

---

## 📊 Desglose de Esfuerzo

| Componente | SP | Archivos | Tiempo |
|------------|----|---------|----|
| **Tipos + Interfaces** | 1 | 1 archivo | 15 min |
| **Servicios** | 2 | 2 archivos | 45 min |
| **Hook useNests** | 1 | 1 archivo | 30 min |
| **Store Zustand** | 1 | 1 archivo | 30 min |
| **Componentes UI** | 7 | 6 archivos | 3.5h |
| **Integración** | 2 | 3 archivos | 1h |
| **Testing** | 1 | Tests E2E | 30 min |
| **Build + Docs** | 1 | Documentación | 30 min |
| **TOTAL** | **16 SP** | **18+ archivos** | **~7h** |

---

## 🗓️ Timeline Recomendado

### Fase 1 — Sesión 1: Servicios (2 horas)
**Leer:** [01-sesion-1-servicios.md](../sessions/01-sesion-1-servicios.md)

**Tareas:**
1. Crear `src/types/nests.ts` (Nest, NestPokemon, NestBadge interfaces)
2. Crear `src/services/nests/nestService.ts` (datos, lógica, transformación)
3. Crear `src/services/nests/nestCacheService.ts` (IndexedDB CRUD)
4. Crear `src/hooks/useNests.ts` (hook de datos, auto-caché)
5. Extender `src/store/useStore.ts` con slice de nests

**Validación:** 
- 5 nidos visibles en console.log
- IndexedDB conteniendo nests_data
- No hay errores TS

---

### Fase 2 — Sesión 2: Componentes (3 horas)
**Leer:** [02-sesion-2-componentes.md](../sessions/02-sesion-2-componentes.md)

**Tareas:**
1. Crear `src/components/Nests/NestMapView.tsx` + NestPin.tsx
2. Crear `src/components/Nests/NestTooltip.tsx` + NestLegend.tsx
3. Crear `src/components/Nests/NestFeed.tsx` + NestCard.tsx
4. Crear `src/components/Nests/NestDetail.tsx` (panel modal)
5. Styling: CSS variables, grid layout, interactividad

**Validación:**
- 5 pins púrpura visibles en el mapa
- Hover muestra tooltip
- Clic abre detalle panel
- Favoritos funcionan (toggle ❤️)

---

### Fase 3 — Sesión 3: Integración (2 horas)
**Leer:** [03-sesion-3-integracion.md](../sessions/03-sesion-3-integracion.md)

**Tareas:**
1. Crear `src/components/UI/NestModeToggle.tsx` (botón Clima/Nidos)
2. Integrar en `src/App.tsx` (renderización condicional)
3. Tests E2E: Playwright scenarios
4. Build exitoso: `npm run build`
5. Commit + PR: `sprint-9-nests` → `main`

**Validación:**
- Build sin errores
- Tests PASSED (5/5)
- 0 TypeScript errors
- Commit con mensaje semántico

---

## 🔗 Dependencias Externas

| Recurso | Ubicación | Propósito |
|---------|-----------|----------|
| **Tipos Pokémon** | `src/types/index.ts` | 18 tipos pokémon (Grass, Fire, etc) |
| **Design System** | `src/index.css` | Variables CSS (--nest-purple, etc) |
| **Zustand Store** | `src/store/useStore.ts` | Estado global (nestFavorites, selectedNest) |
| **MapContainer** | `src/components/Map/MapView.tsx` | Componente compartido (Leaflet) |
| **IndexedDB** | `src/services/cache/cacheService.ts` | Base local (tabla: `nests_data`) |
| **React Router** | `src/App.tsx` | Rutas (si aplica para futuro) |

---

## 📝 Convenciones del Proyecto

✅ **Lenguaje:** Español en docs, English en código  
✅ **TypeScript:** Strict mode (`tsconfig.json`), sin `any`, imports con tipo  
✅ **CSS:** Una `<style>` por componente con prefijo `.nest-*`  
✅ **Colores:** SIEMPRE variables CSS (`var(--nest-purple)`), NUNCA hardcodeados  
✅ **Caché:** IndexedDB separado por colección (`nests_data` vs `weather_data`)  
✅ **Store:** Zustand con slices independientes por feature  
✅ **Componentes:** Folder por feature, `index.ts` para exports

---

## 🚀 Checklist Rápido

### Antes de Empezar
- [ ] Leer [11-nests-architecture.md](../architecture/11-nests-architecture.md) (15 min)
- [ ] Leer [12-nests-data-dictionary.md](../architecture/12-nests-data-dictionary.md) (10 min)
- [ ] Crear rama `sprint-9-nests` (ya hecho ✓)
- [ ] Confirmar node_modules actualizado (`npm install`)

### Sesión 1 ✓
- [ ] Crear tipos (nest.ts)
- [ ] Crear servicios (nestService, nestCacheService)
- [ ] Crear hook useNests
- [ ] Extender store Zustand
- [ ] Validar en console: 5 nidos + IndexedDB

### Sesión 2 ✓
- [ ] Crear componentes Map (NestMapView, NestPin)
- [ ] Crear componentes Sidebar (NestFeed, NestDetail)
- [ ] Crear componentes UI (NestTooltip, NestLegend, NestCard)
- [ ] Styling CSS completo
- [ ] Validar en navegador: pins visibles + interactividad

### Sesión 3 ✓
- [ ] Crear NestModeToggle.tsx
- [ ] Integrar en App.tsx
- [ ] Tests E2E Playwright
- [ ] Build exitoso
- [ ] Commit + PR

---

## 📞 Referencias Cruzadas

- **Features Nests (Punto de Entrada):** [README.md](README.md)
- **Índice de Sprints:** [../sprints/00-INDEX.md](../sprints/00-INDEX.md)
- **Proyecto Completo:** [../overview/01-project.md](../overview/01-project.md)

---

**Rama:** `sprint-9-nests`  
**Estado:** En Desarrollo  
**Mantenedor:** Geovanny M  
**Última actualización:** 2026-04-13

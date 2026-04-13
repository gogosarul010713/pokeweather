# 🏠 Nidos de Pokémon — Índice Completo

**Status:** Fase 1 (Sprint 9) — MVP en desarrollo  
**Rama:** `sprint-9-nests`  
**Base:** sprint-9 (commit ff0f74b)  
**Última actualización:** 2026-04-13  

---

## 📚 Navegación

### 🏗️ Arquitectura
- **[11-nests-architecture.md](../../../architecture/11-nests-architecture.md)** — Diseño de módulos, tipos, responsabilidades
- **[12-nests-data-dictionary.md](../../../architecture/12-nests-data-dictionary.md)** — Interfaces TypeScript, schemas JSON, modelos

### 📋 User Stories
- **[US-801](../../../sprints/09-nests/US/US-801.md)** — Cargar 5 nidos desde JSON → IndexedDB
- **[US-802](../../../sprints/09-nests/US/US-802.md)** — Renderizar pins púrpura en mapa
- **[US-803](../../../sprints/09-nests/US/US-803.md)** — Listado de nidos en sidebar
- **[US-804](../../../sprints/09-nests/US/US-804.md)** — Panel información completa del nido
- **[US-805](../../../sprints/09-nests/US/US-805.md)** — Toggle Clima ⇄ Nidos
- **[US-806](../../../sprints/09-nests/US/US-806.md)** — Persistencia en IndexedDB
- **[US-807](../../../sprints/09-nests/US/US-807.md)** — Información rápida al hacer clic

### 🛠️ Plan de Trabajo
- **[01-sesion-1-servicios.md](../../../sprints/09-nests/01-sesion-1-servicios.md)** — SESIÓN 1: Tipos, servicios, store
- **[02-sesion-2-componentes.md](../../../sprints/09-nests/02-sesion-2-componentes.md)** — SESIÓN 2: Componentes principales
- **[03-sesion-3-integracion.md](../../../sprints/09-nests/03-sesion-3-integracion.md)** — SESIÓN 3: Integración final + testing

### 📁 Estructura de Archivos
- **[ESTRUCTURA-PROYECTO.md](../../../sprints/09-nests/ESTRUCTURA-PROYECTO.md)** — Árbol de carpetas, archivos a crear, ubicaciones

### 🎨 Diseño y CSS
- **[04-nests-design-system.md](../../../overview/04-nests-design-system.md)** — Paleta de colores, CSS variables, estilos

### ✅ Checklists
- **[CHECKLIST-FASE-1.md](../../../sprints/09-nests/CHECKLIST-FASE-1.md)** — Checklist maestro de Sprint 9 Fase 1

---

## 🎯 Resumen Ejecutivo

**Objetivo:**  
Agregar módulo **Nidos de Pokémon** como feature independiente, sin afectar Clima.

**Alcance Fase 1:**
- 5 nidos estáticos (JSON)
- Visualización mapa + sidebar
- Panel de detalles completo
- Toggle Clima ⇄ Nidos
- Favoritos + caché IndexedDB

**No incluye:**
- Filtros/ordenamiento (Sprint 9)
- Visualización de áreas (Sprint 10)

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| **Total US** | 7 (US-801 a US-807) |
| **Story Points** | 16 SP |
| **Sesiones** | 3 (~7 horas) |
| **Archivos a crear** | 18+ |
| **Tipos nuevos** | 5 interfaces |
| **Componentes nuevos** | 7 |
| **Servicios nuevos** | 2 |

---

## 🗓️ Timeline

### Sesión 1 — Servicios y Store (2h)
- [ ] Tipos (nest.ts) ✓
- [ ] Servicios (nestService, nestCacheService) ✓
- [ ] Hook (useNests) ✓
- [ ] Store Zustand (nests slice) ✓
- **Validación:** 5 nidos en consola + IndexedDB visible

### Sesión 2 — Componentes Principales (3h)
- [ ] NestMapView + NestPin
- [ ] NestTooltip + NestLegend
- [ ] NestFeed + NestCard
- [ ] NestDetail (modal)
- **Validación:** 5 pins visibles, interactividad funcionando

### Sesión 3 — Integración Final (2h)
- [ ] ModeToggle.tsx
- [ ] App.tsx (renderización condicional)
- [ ] E2E testing
- [ ] Build validation
- **Validación:** Build exitoso, tests PASSED, commit feature/nests

---

## 🔗 Dependencias Externas

| Recurso | Ubicación | Propósito |
|---------|-----------|----------|
| **Tipos Pokémon** | `src/types/index.ts` | 18 tipos pokémon |
| **Design System** | `src/index.css` | Variables de color |
| **Zustand Store** | `src/store/useStore.ts` | State management |
| **Leaflet Map** | `src/components/Map/MapView.tsx` | MapContainer compartido |
| **IndexedDB** | `src/services/cache/cacheService.ts` | Base de datos local |

---

## 📝 Convenciones del Proyecto

✅ **Lenguaje:** Español en docs, English en código  
✅ **TypeScript:** Strict mode, no `any`  
✅ **CSS:** Una `<style>` por componente con prefijo de clase  
✅ **Colores:** Variables CSS (`var(--*)`) nunca hardcodeados  
✅ **Caché:** IndexedDB separado por colección (`nests_data` vs `weather_data`)  
✅ **Store:** Zustand con slices independientes

---

## 🚀 Próximos Pasos

1. **Leer antes de empezar:**
   - [ ] [11-nests-architecture.md](../../../architecture/11-nests-architecture.md)
   - [ ] [12-nests-data-dictionary.md](../../../architecture/12-nests-data-dictionary.md)
   - [ ] [ESTRUCTURA-PROYECTO.md](../../../sprints/09-nests/ESTRUCTURA-PROYECTO.md)

2. **Sesión 1:**
   - [ ] Seguir [01-sesion-1-servicios.md](../../../sprints/09-nests/01-sesion-1-servicios.md) paso a paso
   - [ ] Validar tipos + services en consola

3. **Sesión 2:**
   - [ ] Seguir [02-sesion-2-componentes.md](../../../sprints/09-nests/02-sesion-2-componentes.md)
   - [ ] Validar componentes en navegador

4. **Sesión 3:**
   - [ ] Seguir [03-sesion-3-integracion.md](../../../sprints/09-nests/03-sesion-3-integracion.md)
   - [ ] Build exitoso + commit

---

## 📞 Dudas Frecuentes

**P: ¿Dónde empiezo?**  
R: Lee 01-arquitectura.md, luego sigue 10-sesion-1-servicios.md.

**P: ¿Los nidos afectan el módulo de Clima?**  
R: No. Componentes, servicios y datos completamente separados.

**P: ¿Dónde se guardan los favoritos?**  
R: Store Zustand (nestFavorites array) → auto-persistente en localStorage.

**P: ¿Cómo cambio colores de pins?**  
R: `nestService.ts` → `getPokemonTypeColor(type)` → CSS variable.

---

**Última actualización:** 2026-04-13  
**Rama:** sprint-9-nests  
**Mantenedor:** Geovanny M


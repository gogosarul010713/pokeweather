# Sprint 9 — Nidos de Pokémon

**Branch:** `sprint-9-nests`  
**Base:** `sprint-9`  
**Status:** Fase 1 MVP — En Desarrollo  
**Sesiones:** 3 (~7 horas)  
**Story Points:** 16 SP  
**User Stories:** 7 (US-801 a US-807)

---

## 🎯 ¿Qué es Sprint 9?

Implementar un módulo completo de **Nidos de Pokémon** que funcione en paralelo con el módulo existente de **Clima**. Los nidos son ubicaciones geográficas donde aparecen Pokémon específicos (similar a Pokémon GO).

**Resultado final:**
- Un mapa con 5 nidos representados como pins púrpura
- Cada pin muestra qué tipo/especie de Pokémon se encuentra allí
- Puedes hacer clic para ver detalles completos
- Puedes marcar favoritos
- Toggle para cambiar entre vista Clima ⇄ Nidos

---

## 🚀 Cómo Empezar

### Opción 1: Ruta Rápida (5 min)
1. Lee [00-index.md](00-index.md) — resumen ejecutivo
2. Ve directo a [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md) — lista de archivos a crear

### Opción 2: Arquitectura Completa (20 min)
1. Lee [../../architecture/11-nests-architecture.md](../../architecture/11-nests-architecture.md) — design de módulos
2. Lee [../../architecture/12-nests-data-dictionary.md](../../architecture/12-nests-data-dictionary.md) — tipos de datos
3. Lee [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md) — dónde va cada archivo

### Opción 3: Sesión por Sesión (7 horas)
1. **Sesión 1 (2h):** Sigue [01-sesion-1-servicios.md](../../sessions/01-sesion-1-servicios.md) paso a paso
2. **Sesión 2 (3h):** Sigue [02-sesion-2-componentes.md](../../sessions/02-sesion-2-componentes.md) paso a paso
3. **Sesión 3 (2h):** Sigue [03-sesion-3-integracion.md](../../sessions/03-sesion-3-integracion.md) paso a paso

### Opción 4: Por US Individual (Flexible)
Cada User Story está documentada en [US/](US/) — puedes trabajar en el orden que prefieras:
- [US/US-801.md](US/US-801.md) — Cargar datos
- [US/US-802.md](US/US-802.md) — Pins en mapa
- [US/US-803.md](US/US-803.md) — Sidebar
- [US/US-804.md](US/US-804.md) — Detalle panel
- [US/US-805.md](US/US-805.md) — Toggle modo
- [US/US-806.md](US/US-806.md) — Caché IndexedDB
- [US/US-807.md](US/US-807.md) — Popup tooltip

---

## 📊 Resumen Rápido

| Métrica | Valor |
|---------|-------|
| **User Stories** | 7 (US-801 a US-807) |
| **Story Points** | 16 SP |
| **Tiempo Estimado** | ~7 horas |
| **Componentes Nuevos** | 7 |
| **Servicios Nuevos** | 2 |
| **Tipos Nuevos** | 1 archivo (5 interfaces) |
| **Tests E2E** | 5 scenarios |
| **Archivos a Crear** | 18+ |

---

## 🏗️ Arquitectura en 60 segundos

```
NIDOS (Módulo Independiente)
├── Tipos (nest.ts)
│   └── Nest, NestPokemon, NestBadge, Region
│
├── Servicios
│   ├── nestService.ts      (datos, transformación)
│   └── nestCacheService.ts (IndexedDB CRUD)
│
├── Hook
│   └── useNests.ts         (fetch + caché automático)
│
├── Store (Zustand)
│   └── nests slice         (selectedNest, nestFavorites)
│
└── Componentes
    ├── NestMapView + NestPin     (mapa)
    ├── NestFeed + NestCard       (sidebar listado)
    ├── NestDetail                (panel modal)
    ├── NestTooltip + NestLegend  (info rápida)
    └── NestModeToggle           (Clima ⇄ Nidos)
```

**Datos:** JSON → useNests hook → Zustand store → Componentes  
**Caché:** IndexedDB (tabla `nests_data`) separada de clima  
**Modo:** Toggle en header para cambiar entre Clima y Nidos

---

## 🔑 Decisiones Clave

| Decisión | Razón |
|----------|-------|
| **Módulo separado** | Los nidos tienen datos, caché y componentes propios, no interfieren con clima |
| **IndexedDB** | Persistencia rápida, separada por colección (`nests_data` vs `weather_data`) |
| **Zustand** | Estado simple, no necesita Redux complexity |
| **5 nidos estáticos** | MVP para validar arquitectura antes de agregar búsqueda/sync |
| **Toggle Clima/Nidos** | Users ven una vista a la vez, reduce UI clutter |
| **Pins púrpura** | Color diferente a clima para clarity (clima = amarillo/azul/gris) |

---

## 📋 Checklist de Sprint

### Pre-Desarrollo
- [ ] Crear rama `sprint-9-nests` desde `sprint-9`
- [ ] Confirmar `node_modules` actualizado
- [ ] Leer documentación de arquitectura (20 min)

### Sesión 1: Servicios (2h)
- [ ] Crear tipos en `nest.ts`
- [ ] Crear `nestService.ts` con 5 nidos estáticos
- [ ] Crear `nestCacheService.ts` con CRUD IndexedDB
- [ ] Crear `useNests.ts` hook
- [ ] Extender Zustand store con nests slice
- [ ] ✓ Validar: 5 nidos en console, IndexedDB visible

### Sesión 2: Componentes (3h)
- [ ] Crear componentes Map (NestMapView, NestPin)
- [ ] Crear componentes Sidebar (NestFeed, NestDetail)
- [ ] Crear componentes UI (NestTooltip, NestLegend, NestCard)
- [ ] Agregar CSS: layout, colores, animations
- [ ] ✓ Validar: pins visibles, hover, clic abre detalle

### Sesión 3: Integración (2h)
- [ ] Crear `NestModeToggle.tsx`
- [ ] Integrar en `App.tsx` (renderización condicional)
- [ ] Tests E2E: 5 scenarios Playwright
- [ ] Build: `npm run build` exitoso
- [ ] Commit con mensaje semántico
- [ ] ✓ Push a `sprint-9-nests` + PR a `main`

### Post-Sprint
- [ ] Merge `sprint-9-nests` a `main`
- [ ] Deploy a producción (Vercel)
- [ ] Update backlog para Sprint 10

---

## 📚 Documentación Disponible

### Inicio Rápido
- **Este archivo (README.md)** — estás aquí
- **[00-index.md](00-index.md)** — índice estructurado

### Diseño y Arquitectura
- **[../../architecture/11-nests-architecture.md](../../architecture/11-nests-architecture.md)** — módulos, responsabilidades, diagramas
- **[../../architecture/12-nests-data-dictionary.md](../../architecture/12-nests-data-dictionary.md)** — interfaces TS, schemas JSON

### User Stories
- **[US/US-801.md](US/US-801.md)** — Cargar nidos
- **[US/US-802.md](US/US-802.md)** — Pins en mapa
- **[US/US-803.md](US/US-803.md)** — Sidebar
- **[US/US-804.md](US/US-804.md)** — Detalle
- **[US/US-805.md](US/US-805.md)** — Toggle
- **[US/US-806.md](US/US-806.md)** — Caché
- **[US/US-807.md](US/US-807.md)** — Popup

### Plan de Trabajo
- **[01-sesion-1-servicios.md](../../sessions/01-sesion-1-servicios.md)** — guía paso a paso Sesión 1
- **[02-sesion-2-componentes.md](../../sessions/02-sesion-2-componentes.md)** — guía paso a paso Sesión 2
- **[03-sesion-3-integracion.md](../../sessions/03-sesion-3-integracion.md)** — guía paso a paso Sesión 3

### Referencias
- **[ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md)** — árbol de archivos, ubicaciones, responsabilidades
- **[CHECKLIST-FASE-1.md](CHECKLIST-FASE-1.md)** — checklist maestro (16 tareas granulares)
- **[../../overview/04-nests-design-system.md](../../overview/04-nests-design-system.md)** — paleta CSS, colores, badges

---

## 🤔 Preguntas Frecuentes

**P: ¿Por dónde empiezo?**  
R: Empieza por [00-index.md](00-index.md). Si tienes prisa, salta a [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md).

**P: ¿Cuánto tiempo toma?**  
R: ~7 horas distribuidas en 3 sesiones de 2-3 horas cada una. Depende de tu experiencia con React/TS.

**P: ¿Los nidos afectan el módulo de Clima?**  
R: No. Son completamente independientes. Comparten el MapContainer pero tienen datos, caché y componentes propios.

**P: ¿Dónde se guardan los favoritos?**  
R: En el store Zustand (`nestFavorites` array) que se persiste automáticamente en localStorage.

**P: ¿Puedo saltarme la Sesión 2 y hacer primero la 3?**  
R: No. La Sesión 1 (servicios) es bloqueante. Las Sesiones 2 y 3 se pueden hacer en cualquier orden si los servicios están listos.

**P: ¿Hay tests unitarios?**  
R: Este sprint es E2E (Playwright). Los tests unitarios pueden agregarse en futuro si lo requiere.

---

## 🔗 Enlaces Útiles

- **Feature Nests (Punto de Entrada):** [../../features/nests/](../../features/nests/)
- **Todos los Sprints:** [../00-INDEX.md](../00-INDEX.md)
- **Proyecto Completo:** [../../01-project.md](../../overview/01-project.md)

---

**Branch:** `sprint-9-nests`  
**Última actualización:** 2026-04-13  
**Mantenedor:** Geovanny M

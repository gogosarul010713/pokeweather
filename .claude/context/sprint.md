# 🏃 Sprint 9 — Nidos de Pokémon (Fase 1)

**Período:** 2026-04-13 → 2026-04-26  
**Rama:** `sprint-9-nests` (basada en `sprint-9`)  
**Objetivo:** Implementar módulo Nidos de Pokémon como feature independiente  
**Estado general:** 🚀 **INICIANDO** (Sesión 1: Servicios)

---

## 📋 User Stories

| ID | Descripción | SP | Estado | Notas |
|----|-------------|-----|--------|-------|
| US-801 | Cargar 5 nidos desde JSON → IndexedDB | 2 | ⏳ Pendiente | Tipos + nestService |
| US-802 | Renderizar pins púrpura en mapa | 3 | ⏳ Pendiente | NestMapView + NestPin |
| US-803 | Listado de nidos en sidebar | 2 | ⏳ Pendiente | NestFeed + NestCard |
| US-804 | Panel deslizante con detalles | 3 | ⏳ Pendiente | NestDetail modal |
| US-805 | Toggle Clima ⇄ Nidos | 2 | ⏳ Pendiente | ModeToggle en header |
| US-806 | Cache IndexedDB | 2 | ⏳ Pendiente | CRUD persistencia |
| US-807 | Popup tooltip información | 2 | ⏳ Pendiente | NestTooltip + NestLegend |

---

## 📊 Progreso

**Completadas:** 0/7 US  
**Pendientes:** 7/7 US (16 SP)  
**Bloqueadas:** 0  
**En progreso:** Sesión 1 (servicios y store)

---

## 🎯 Sesiones Planificadas

### 📍 Sesión 1 — Servicios (2h) ← ACTUAL
**Objetivo:** Crear base de datos (tipos, servicios, hook, store)

**Tareas:**
1. Crear `src/types/nests.ts` (5 interfaces)
2. Crear `src/services/nests/nestService.ts` (datos, transformación)
3. Crear `src/services/nests/nestCacheService.ts` (IndexedDB CRUD)
4. Crear `src/hooks/useNests.ts` (hook personalizado)
5. Extender `src/store/useStore.ts` con slice Nests

**US incluidas:** US-801, US-806  
**Validación:** 5 nidos en console + IndexedDB visible

---

### 📍 Sesión 2 — Componentes (3h)
**Objetivo:** Crear UI (mapa, sidebar, panel detalle)

**Tareas:**
- NestMapView + NestPin (componentes mapa)
- NestFeed + NestCard (listado sidebar)
- NestDetail (modal deslizante)
- NestTooltip + NestLegend (info rápida)
- Styling CSS completo

**US incluidas:** US-802, US-803, US-804, US-807  
**Validación:** Pins visibles, interactividad funcionando

---

### 📍 Sesión 3 — Integración (2h)
**Objetivo:** Integrar todo y preparar deployment

**Tareas:**
- NestModeToggle.tsx (botón Clima/Nidos)
- App.tsx (renderización condicional)
- E2E Tests (Playwright 5 scenarios)
- Build exitoso

**US incluidas:** US-805  
**Validación:** Build ok, tests passed, 0 TS errors

---

## 📁 Documentación Referencia

- **Inicio:** `docs/features/nests/README.md`
- **Índice:** `docs/features/nests/00-index.md`
- **Arquitectura:** `docs/architecture/11-nests-architecture.md`
- **Data Dictionary:** `docs/architecture/12-nests-data-dictionary.md`
- **Sesiones:** `docs/sessions/`
- **Decisiones:** `docs/sprints/sprint-9/decisions.md`
- **Estructura:** `docs/features/nests/ESTRUCTURA-PROYECTO.md`

---

## 🏗️ Arquitectura en Breve

```
NIDOS (Feature Independiente)
├── Tipos (nest.ts)
│   └── Nest, NestPokemon, NestBadge, Region
├── Servicios
│   ├── nestService.ts (datos 5 nidos)
│   └── nestCacheService.ts (IndexedDB)
├── Hook
│   └── useNests.ts (fetch + caché)
├── Store
│   └── nests slice (state + favoritos)
└── Componentes
    ├── Mapa: NestMapView, NestPin
    ├── Sidebar: NestFeed, NestDetail
    └── UI: NestTooltip, NestLegend, NestCard
```

---

## 🔑 Decisiones Clave

| Decisión | Valor |
|----------|-------|
| **Módulo separado** | Nidos no afectan Clima (datos, caché, componentes propios) |
| **5 nidos estáticos** | MVP para validar arquitectura |
| **IndexedDB** | Tabla `nests_data` separada de `weather_data` |
| **Zustand** | Estado simple, auto-persistente en localStorage |
| **Toggle Clima/Nidos** | Cambio de vista en header, reduce UI clutter |

---

## 📝 Stack Utilizado

- **React 18** + TypeScript
- **Vite 5** (bundling)
- **Zustand 4** (state management)
- **Leaflet** (mapa — compartido con Clima)
- **IndexedDB** (persistencia local)
- **Playwright** (E2E testing)

---

**Creado:** 2026-04-13  
**Última actualización:** 2026-04-13  
**Estado:** Listo para Sesión 1

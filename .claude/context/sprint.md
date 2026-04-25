# 🏃 Sprint 9 — Nidos de Pokémon (Arquitectura v2)

**Período:** 2026-04-17 → TBD  
**Rama:** `sprint-9-nests`  
**Objetivo:** Implementar Nidos con **tabs en sidebar** (control único de capas) + modo "Todo"  
**Estado general:** ✅ **DOCUMENTACIÓN COMPLETADA** (17-04-2026) → Listo para Sesión 1 implementación

---

## 📋 User Stories (Arquitectura v2)

### Sesión 1 (Crítica) — 9 SP

| ID | Descripción | SP | Estado | Docs |
|----|-------------|-----|--------|------|
| **US-811** | Tabs sidebar (Clima/Nidos/Todo) — fuente única verdad | 3 | ✅ Completa | [`US-811.md`](../src/docs/sprints/sprint-9/US/US-811.md) |
| **US-812** | Pins diferenciados: hexágonos vs círculos | 2 | ⏳ Pendiente | [`US-812.md`](../src/docs/sprints/sprint-9/US/US-812.md) |
| **US-817** | Overlay sidebar/filtros en modo Todo | 2 | ⏳ Pendiente | [`US-817.md`](../src/docs/sprints/sprint-9/US/US-817.md) |
| **US-819** | Datos Nidos (JSON estático) | 1 | ⏳ Pendiente | [`US-819.md`](../src/docs/sprints/sprint-9/US/US-819.md) |

### Sesión 2 — 11 SP

| ID | Descripción | SP | Estado | Docs |
|----|-------------|-----|--------|------|
| **US-814** | Filtros dinámicos por tab | 3 | ⏳ Pendiente | [`US-814.md`](../src/docs/sprints/sprint-9/US/US-814.md) |
| **US-815** | Leyenda dinámica (Clima/Nidos) | 3 | ⏳ Pendiente | [`US-815.md`](../src/docs/sprints/sprint-9/US/US-815.md) |
| **US-816** | Leyenda acordeón en modo Todo | 2 | ⏳ Pendiente | [`US-816.md`](../src/docs/sprints/sprint-9/US/US-816.md) |
| **US-818** | Listado Nidos en sidebar | 3 | ⏳ Pendiente | [`US-818.md`](../src/docs/sprints/sprint-9/US/US-818.md) |

---

## 📊 Progreso

**Completadas:** 1/8 US (3 SP) — US-811 ✅ (2026-04-17, funcionalidad completa)  
**En refinamiento:** US-811 diseño (Opción A — Underline, necesita ajustes SVG/colores)
**Pendientes:** 7/8 US (17 SP)  
**En progreso:** Sesión 1 (US-812, US-817, US-819 bloqueadas por diseño final de US-811)  
**Nota:** US antiguas (US-801-807) archivadas en `04-archive/` — arquitectura reemplazada

---

## 🎯 Sesiones Implementación

### 📍 Sesión 1 — FUNDACIÓN (COMENZAR AQUÍ) ← 9 SP
**Objetivo:** Tabs del sidebar + pins diferenciados + datos + overlay

**US:**
- **US-811** (3 SP): TabControl.tsx + Zustand `activeTab` + renderización condicional
- **US-812** (2 SP): NestPin.tsx (SVG hexágono) + renderizado condicional en mapa
- **US-817** (2 SP): Overlay.tsx + Toast.tsx + bloqueo sidebar/filtros
- **US-819** (1 SP): nests.json con 5-8 nidos estáticos

**Archivos clave:**
- `src/components/Sidebar/TabControl.tsx` ← NUEVA
- `src/components/Map/NestPin.tsx` ← NUEVA
- `src/components/UI/Overlay.tsx` ← NUEVA
- `src/data/nests.json` ← NUEVA
- `src/store/useStore.ts` ← MODIFICAR (agregar `activeTab`)
- `src/App.tsx` ← MODIFICAR (renderización condicional)

**Resultado esperado:** Tabs funcionales + pins diferenciados + modo Todo con overlay + 0 errores

---

### 📍 Sesión 2 — INTERFAZ COMPLETA — 11 SP
**Objetivo:** Filtros dinámicos + leyenda dinámica + listado nidos

**US:**
- **US-814** (3 SP): FilterBarClima.tsx + FilterBarNests.tsx + dinámico
- **US-815** (3 SP): NestLegend.tsx (grid 2col + búsqueda + tabs)
- **US-816** (2 SP): CombinedLegend.tsx (acordeón Clima/Nidos)
- **US-818** (3 SP): NestCard.tsx + NestFeed.tsx (listado)

**Resultado esperado:** Filtros funcionando + leyenda dinámica + listado browseable

---

### 📍 Sesión 3 — VALIDACIÓN (Opcional)
- E2E testing completo
- Optimizaciones performance
- Integración búsqueda/filtros avanzados

---

## 📁 Documentación Referencia (Sprint 9)

**COMENZAR AQUÍ:**
- 📄 [`src/docs/sprints/sprint-9/00-INDEX.md`](../src/docs/sprints/sprint-9/00-INDEX.md) — Índice general + sesiones
- 📄 [`src/docs/sprints/sprint-9/feature-nest/Requirements_nest.md`](../src/docs/sprints/sprint-9/feature-nest/Requirements_nest.md) — Especificación (9 requisitos)

**Individual US:**
- Sesión 1: [`US-811`](../src/docs/sprints/sprint-9/US/US-811.md) | [`US-812`](../src/docs/sprints/sprint-9/US/US-812.md) | [`US-817`](../src/docs/sprints/sprint-9/US/US-817.md) | [`US-819`](../src/docs/sprints/sprint-9/US/US-819.md)
- Sesión 2: [`US-814`](../src/docs/sprints/sprint-9/US/US-814.md) | [`US-815`](../src/docs/sprints/sprint-9/US/US-815.md) | [`US-816`](../src/docs/sprints/sprint-9/US/US-816.md) | [`US-818`](../src/docs/sprints/sprint-9/US/US-818.md)

**Otros:**
- 📝 [`src/docs/sprints/sprint-9/04-archive/README.md`](../src/docs/sprints/sprint-9/04-archive/README.md) — Explica por qué v1 fue archivada
- 📝 [`src/docs/sprints/sprint-9/decisions.md`](../src/docs/sprints/sprint-9/decisions.md) — Decisiones arquitectónicas

---

## 🏗️ Arquitectura v2 (Tabs en Sidebar)

```
NIDOS → Controlado por TABS en Sidebar

Componentes principales:
├── Store
│   └── activeTab: 'clima' | 'nidos' | 'todo' ← FUENTE ÚNICA VERDAD
├── Sidebar
│   ├── TabControl.tsx (Clima / Nidos / Todo)
│   ├── LocationFeed.tsx (cuando tab='clima')
│   ├── NestFeed.tsx (cuando tab='nidos')
│   └── Overlay (cuando tab='todo')
├── Mapa
│   ├── MapPin.tsx (circulares, clima)
│   ├── NestPin.tsx (hexágonos, nidos)
│   ├── MapLegend.tsx (dinámica por tab)
│   └── CombinedLegend.tsx (acordeón en todo)
├── Filtros
│   ├── FilterBarClima.tsx
│   ├── FilterBarNests.tsx
│   └── Overlay (cuando tab='todo')
└── Datos
    └── nests.json (5-8 nidos estáticos)
```

**Clave:** `activeTab` determina TODO lo que se renderiza

---

## 🔑 Decisiones Clave (v2)

| Decisión | Valor | Razón |
|----------|-------|-------|
| **Tabs en sidebar** | Control único de capas (no toggle en header) | UX: es más natural, permite modo combinado |
| **3 modos** | Clima, Nidos, Todo | Feedback: usuarios querían ver ambas capas |
| **Pins diferenciados** | Hexágonos (nidos) vs Círculos (clima) | Usabilidad: forma + color = distinción clara |
| **Modo Todo con overlay** | Bloquea sidebar/filtros visualmente | UX: comunica claramente limitaciones |
| **JSON estático** | 5-8 nidos hardcodeados (v1) | MVP: futura API externa en v3 |
| **Datos independientes** | Nidos ≠ Clima (JSON, caché, componentes) | Arquitectura limpia, no afecta módulo clima |
| **Filtros dinámicos** | Cambian según tab (contextuales) | UX: menos confusión, menos clutter |

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
**Última actualización:** 2026-04-17 (Documentación v2 completada)  
**Estado:** ✅ **DOCUMENTACIÓN COMPLETA** → Listo para Sesión 1 implementación  
**Rama:** `sprint-9-nests` (commit `7f0bbeb`)

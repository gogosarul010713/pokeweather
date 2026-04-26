# 🎯 Tarea Activa: Sesión 2 — Interfaz Completa Nidos (Filtros + Leyenda)

**Sprint:** 9 — Nidos de Pokémon  
**Rama:** `sprint-9-nests`  
**Sesión:** 2/3 (Interfaz: Filtros dinámicos + Leyenda dinámica)  
**Duración estimada:** 3-4 horas  
**Story Points:** 11 SP (US-814, US-815, US-816, US-818)  
**Última actualización:** 2026-04-25

---

## 📋 Objetivo de Sesión 2

Implementar la **interfaz completa** de Nidos con:
1. Filtros dinámicos según tab activo
2. Leyenda dinámica con colores de tipos
3. Leyenda acordeón en modo "Todo"
4. Listado de Nidos en sidebar

**Resultado esperado:** 
- ✅ Filtros contextuales por tab
- ✅ Leyenda actualiza según tipos visibles
- ✅ Listado NestFeed con búsqueda
- ✅ Acordeón en modo "Todo"
- ✅ 0 errores TypeScript

---

## ✅ SESIÓN 1 — COMPLETADA (2026-04-25)

**Commits:**
- 423297b — "feat: Sesión 1 Nidos — Tabs, NestPins, Datos y Overlay"
- e9dc6f7 — "refactor: Renderizar IconClima como SVG inline en JSX"

✅ **US-811** Tabs del Sidebar (3 SP) — COMPLETADA
✅ **US-812** Pins Diferenciados (2 SP) — COMPLETADA
✅ **US-819** Datos JSON (1 SP) — COMPLETADA
✅ **US-817** Overlay Modo Todo (2 SP) — COMPLETADA
✅ **Refinamiento:** Migración SVG → AVIF/WebP icons (2026-04-26)

## ✅ REFINAMIENTOS POST-SESIÓN 1 (2026-04-26)

**Commit:**
- c1782c2 — "refactor: Migrar TabControl icons de SVG inline a imágenes AVIF/WebP"

**Cambios ejecutados:**
- ✅ ResponsiveImage.tsx: componente con fallback AVIF→WebP→fallback img
- ✅ IconClima: nube.avif/webp (sombras, gradientes, detalle)
- ✅ IconNidos: pokéball+nido.avif/webp (textura, colores ricos)
- ✅ Assets servidos desde public/assets/icons/ (Vite static)
- ✅ Validado desktop/tablet/mobile: sin errores, carga rápida

**Justificación:** Mejor UX visual. AVIF/WebP pequeños (56KB) pero valor visual incomparable vs SVG flat.

**Build:** ✓ Clean build, sin errores TypeScript  
**Status:** ✅ Sesión 1 FINALIZADA — Listo para Sesión 2 (US-814/815/816/818)

---

## 🎯 User Stories Sesión 2 (En Orden de Implementación)

### 1️⃣ **US-814** — Filtros Dinámicos por Tab (3 SP) ← COMENZAR AQUÍ

📄 **Referencia:** [`src/docs/sprints/sprint-9/US/US-814.md`](../src/docs/sprints/sprint-9/US/US-814.md)

**Objetivo:** Filtros contextuales que cambian según tab activo

**Archivos a crear:**
- `src/components/UI/FilterBarClima.tsx` (~150 líneas)
  - Filtros: región, condición, búsqueda
- `src/components/UI/FilterBarNests.tsx` (~150 líneas)
  - Filtros: tipo Pokémon, región, búsqueda
- `src/components/UI/FilterBarTodo.tsx` (~80 líneas)
  - Ambos filtros en tab único o acordeón

**Archivos a modificar:**
- `src/components/UI/FilterBar.tsx` → renderización condicional según tab
- `src/store/useStore.ts` → agregar nestTypeFilter state
- `src/components/Sidebar/Sidebar.tsx` → integrar FilterBar condicional

**Criterios de éxito:**
- ✅ En tab Clima: solo filtros de clima
- ✅ En tab Nidos: solo filtros de nidos
- ✅ En tab Todo: ambos filtros (acordeón)
- ✅ Filtros aplicados en tiempo real
- ✅ 0 errores TypeScript

---

### 2️⃣ **US-815** — Leyenda Dinámica (3 SP)

📄 **Referencia:** [`src/docs/sprints/sprint-9/US/US-815.md`](../src/docs/sprints/sprint-9/US/US-815.md)

**Objetivo:** Leyenda que cambia según tab activo

**Archivos a crear:**
- `src/components/Map/NestLegend.tsx` (~200 líneas)
  - Grid 2 columnas con tipos Pokémon
  - Búsqueda por nombre
- `src/components/Map/ClimaLegend.tsx` (actualizar existente)
  - Iconos de condiciones clima

**Archivos a modificar:**
- `src/components/Map/MapLegend.tsx` → renderización condicional
- `src/store/useStore.ts` → agregar filterNestType state

**Criterios de éxito:**
- ✅ En tab Clima: leyenda de condiciones
- ✅ En tab Nidos: leyenda de tipos Pokémon
- ✅ Colores consistentes con pins
- ✅ 0 errores TypeScript

---

### 3️⃣ **US-816** — Leyenda Acordeón en Modo Todo (2 SP)

📄 **Referencia:** [`src/docs/sprints/sprint-9/US/US-816.md`](../src/docs/sprints/sprint-9/US/US-816.md)

**Objetivo:** Leyenda combinada en modo Todo

**Archivos a crear:**
- `src/components/Map/CombinedLegend.tsx` (~150 líneas)
  - Acordeón: Clima / Nidos
  - Colapsables independientes

**Criterios de éxito:**
- ✅ Acordeón funcional en modo Todo
- ✅ Secciones expandible/colapsable
- ✅ Espacio optimizado

---

### 4️⃣ **US-818** — Listado Nidos en Sidebar (3 SP)

📄 **Referencia:** [`src/docs/sprints/sprint-9/US/US-818.md`](../src/docs/sprints/sprint-9/US/US-818.md)

**Objetivo:** Feed de nidos en sidebar (como LocationFeed de clima)

**Archivos a crear:**
- `src/components/Sidebar/NestCard.tsx` (~120 líneas)
  - Card con info del nido
  - Tipo, spawn rate, ubicación
- `src/components/Sidebar/NestFeed.tsx` (~150 líneas)
  - Listado de nidos
  - Búsqueda integrada
  - Click abre popup en mapa

**Archivos a modificar:**
- `src/components/Sidebar/Sidebar.tsx` → renderizar NestFeed cuando tab=nidos
- `src/store/useStore.ts` → agregar filtros de nidos

**Criterios de éxito:**
- ✅ NestFeed visible cuando tab=nidos
- ✅ Click en card → foco en mapa
- ✅ Búsqueda por nombre/tipo
- ✅ Scroll fluido

---

## 📊 Checklist Sesión 2

### ⏳ En Progreso — Sesión 2
- [ ] **US-814:** FilterBarClima.tsx + FilterBarNests.tsx
- [ ] **US-814:** Filtros contextuales por tab
- [ ] **US-815:** NestLegend.tsx con grid 2 columnas
- [ ] **US-815:** MapLegend renderiza condicional
- [ ] **US-816:** CombinedLegend.tsx con acordeón
- [ ] **US-818:** NestCard.tsx + NestFeed.tsx
- [ ] **US-818:** Renderización condicional en Sidebar
- [ ] **npm run build** sin errores
- [ ] Pruebas E2E actualizadas

---

## 🔑 Conceptos Clave

**`activeTab` es la fuente única de verdad:**
```typescript
// En Zustand
activeTab: 'clima' | 'nidos' | 'todo'

// En React
const activeTab = useStore(s => s.activeTab)

// Renderización
{activeTab === 'clima' && <LocationFeed />}
{activeTab === 'nidos' && <NestFeed />}
{(activeTab === 'clima' || activeTab === 'todo') && <MapPin />}
{(activeTab === 'nidos' || activeTab === 'todo') && <NestPin />}
```

**localStorage.**
```typescript
// Persistencia
const setActiveTab = (tab) => {
  set({ activeTab: tab })
  localStorage.setItem('pwe-activeTab', tab)
}

// Recuperación
activeTab: localStorage.getItem('pwe-activeTab') ?? 'clima'
```

---

## 📁 Archivos Documentación

- 🎯 **Índice Sprint:** [`src/docs/sprints/sprint-9/00-INDEX.md`](../src/docs/sprints/sprint-9/00-INDEX.md)
- 📋 **Requirements:** [`src/docs/sprints/sprint-9/feature-nest/Requirements_nest.md`](../src/docs/sprints/sprint-9/feature-nest/Requirements_nest.md)
- 📝 **US-811:** [`src/docs/sprints/sprint-9/US/US-811.md`](../src/docs/sprints/sprint-9/US/US-811.md)
- 📝 **US-812:** [`src/docs/sprints/sprint-9/US/US-812.md`](../src/docs/sprints/sprint-9/US/US-812.md)
- 📝 **US-817:** [`src/docs/sprints/sprint-9/US/US-817.md`](../src/docs/sprints/sprint-9/US/US-817.md)
- 📝 **US-819:** [`src/docs/sprints/sprint-9/US/US-819.md`](../src/docs/sprints/sprint-9/US/US-819.md)

---

## ⚠️ Notas Importantes

1. **No crear servicios/hooks complejos en Sesión 1** — Arquitectura v2 es más simple (datos JSON directos)
2. **Validar con `@design.md`** si existe — UI debe coincidir con diseño
3. **Cambiar de tab resetea filtros** (no persistir entre tabs)
4. **Sesión 2 construye sobre esto** — Mantener código limpio y modular

---

**Creado:** 2026-04-17  
**Rama:** sprint-9-nests  
**Commit base:** 7f0bbeb  
**Estado:** Listo para comenzar — Todos los requerimientos documentados

# 🎯 Tarea Activa: Sesión 1 — Fundación Nidos (Arquitectura v2)

**Sprint:** 9 — Nidos de Pokémon  
**Rama:** `sprint-9-nests`  
**Sesión:** 1/3 (Fundación: Tabs + Pins + Datos + Overlay)  
**Duración estimada:** 3-4 horas  
**Story Points:** 9 SP (US-811, US-812, US-817, US-819)  
**Última actualización:** 2026-04-17

---

## 📋 Objetivo de Sesión 1

Implementar la **base funcional** de Nidos con:
1. Tabs en sidebar como control de capas (fuente única de verdad)
2. Pins diferenciados (hexágonos para nidos, círculos para clima)
3. Datos estáticos cargando desde JSON
4. Overlay en modo "Todo" para bloquear sidebar/filtros

**Resultado esperado:** 
- ✅ Tres tabs en sidebar funcionando
- ✅ Cambiar entre tabs actualiza el mapa
- ✅ Modo "Todo" muestra ambas capas + overlay bloqueante
- ✅ Toast informativo al entrar en modo "Todo"
- ✅ 0 errores TypeScript

---

## 🎯 User Stories (En Orden de Implementación)

### 1️⃣ **US-811** — Tabs del Sidebar (3 SP) ← COMENZAR AQUÍ

📄 **Referencia:** [`src/docs/sprints/sprint-9/US/US-811.md`](../src/docs/sprints/sprint-9/US/US-811.md)

**Objetivo:** Control de capas mediante tabs en sidebar

**Archivos a crear:**
- `src/components/Sidebar/TabControl.tsx` (~120 líneas)
  - 3 tabs: Clima / Nidos / Todo
  - Uno siempre activo (pill style activo)
  - Contador contextual (Ciudades · N / Nidos · N / etc)

**Archivos a modificar:**
- `src/store/useStore.ts` → agregar state `activeTab: 'clima' | 'nidos' | 'todo'` + setter
- `src/components/Sidebar/Sidebar.tsx` → integrar `<TabControl>`
- `src/App.tsx` → renderización condicional según `activeTab`

**Criterios de éxito:**
- ✅ Tabs visibles en sidebar
- ✅ Click en tab → cambio instantáneo
- ✅ localStorage persiste `activeTab`
- ✅ Al recargar se restaura último tab
- ✅ No hay errores de TypeScript

---

### 2️⃣ **US-812** — Pins Diferenciados (2 SP)

📄 **Referencia:** [`src/docs/sprints/sprint-9/US/US-812.md`](../src/docs/sprints/sprint-9/US/US-812.md)

**Objetivo:** Visual diferenciación entre pins

**Archivos a crear:**
- `src/components/Map/NestPin.tsx` (~150 líneas)
  - SVG hexágono (32×32px)
  - Color según tipo de Pokémon
  - Click abre popup

**Archivos a modificar:**
- `src/components/Map/MapView.tsx` → renderizar condicional `<NestPin>` cuando tab=nidos/todo

**Criterios de éxito:**
- ✅ En tab Clima: solo pines circulares
- ✅ En tab Nidos: solo hexágonos
- ✅ En tab Todo: ambos visibles simultáneamente
- ✅ Hexágonos con color correcto

---

### 3️⃣ **US-819** — Datos JSON (1 SP)

📄 **Referencia:** [`src/docs/sprints/sprint-9/US/US-819.md`](../src/docs/sprints/sprint-9/US/US-819.md)

**Objetivo:** Fuente de datos estática

**Archivos a crear:**
- `src/data/nests.json`
  - Array con 5-8 nidos
  - Estructura: id, name, city, country, lat, lng, pokemon, pokemonType[], spawnRate, lastReported
  - Distribución geográfica variada

**Criterios de éxito:**
- ✅ JSON válido
- ✅ Mínimo 5 nidos
- ✅ Tipos válidos (Water, Fire, Grass, Electric, Dragon, etc)
- ✅ Coordenadas realistas

---

### 4️⃣ **US-817** — Overlay Modo Todo (2 SP)

📄 **Referencia:** [`src/docs/sprints/sprint-9/US/US-817.md`](../src/docs/sprints/sprint-9/US/US-817.md)

**Objetivo:** Feedback visual cuando modo = "todo"

**Archivos a crear:**
- `src/components/UI/Overlay.tsx` (~50 líneas)
  - Fondo semi-transparente + mensaje centrado
  - Reutilizable

- `src/components/UI/Toast.tsx` (~80 líneas)
  - Notificación bottom-right
  - Auto-dismiss 3s o click ✕

**Archivos a modificar:**
- `src/components/Sidebar/Sidebar.tsx` → integrar `<Overlay>` cuando tab=todo
- `src/components/UI/FilterBar.tsx` → integrar `<Overlay>` cuando tab=todo
- `src/App.tsx` → mostrar `<Toast>` cuando tab cambia a 'todo'

**Criterios de éxito:**
- ✅ Toast aparece al entrar en modo Todo
- ✅ Overlay visible en sidebar y filtros
- ✅ Cursor `not-allowed` en área bloqueada
- ✅ Desaparece al cambiar de tab

---

## 📊 Checklist Sesión 1

- [ ] **US-811:** TabControl.tsx creado y visible
- [ ] **US-811:** `activeTab` state en Zustand
- [ ] **US-811:** App.tsx renderiza condicional
- [ ] **US-811:** localStorage persiste activeTab
- [ ] **US-812:** NestPin.tsx crea hexágonos SVG
- [ ] **US-812:** MapView renderiza NestPin cuando tab=nidos/todo
- [ ] **US-812:** Pins diferenciados visualmente (forma + color)
- [ ] **US-819:** nests.json creado con 5+ nidos
- [ ] **US-819:** JSON válido y estructura correcta
- [ ] **US-817:** Overlay.tsx visible cuando tab=todo
- [ ] **US-817:** Toast aparece al cambiar a todo
- [ ] **US-817:** Cursor bloqueado en overlay
- [ ] ✅ **npm run build** sin errores
- [ ] ✅ Console limpia (0 TS errors)
- [ ] ✅ Prueba E2E básica (Playwright): cambiar de tabs

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

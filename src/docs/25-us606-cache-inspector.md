# US-606 — Inspector Visual de Caché
**Sprint:** 7 Fase 2 (PRIMERA PRIORIDAD)
**Fecha:** 2026-03-31
**Estado:** ⏳ En progreso
**SP:** 5 · **Prioridad:** 🔴

---

## 📋 Resumen Ejecutivo

**Objetivo:** Proporcionar una interfaz visual interactiva para inspeccionar, gestionar y depurar el caché local (IndexedDB + localStorage) directamente desde la app, sin necesidad de DevTools.

**Ubicación:** Tab 4 "🔧 Caché" en `TestingTools`
**Visibilidad:** Dev-only (solo en `import.meta.env.DEV`)
**Audiencia:** Desarrolladores + QA/Testing

---

## 🎯 Requisitos Confirmados

✅ Dirección de cambios confirmada por el usuario:

| Aspecto | Decisión |
|--------|----------|
| **US ID** | US-606 (existente en backlog) |
| **Location** | Tab "🔧 Caché" en TestingTools (4ª pestaña) |
| **Dev-Only** | Sí — solo visible en `import.meta.env.DEV` |
| **Edición** | NO — solo VIEW + COPY |
| **Eliminación** | Sí, selección manual con confirmación modal |
| **Prioridad** | 🔴 Primera (antes que US-609 y responsive) |

---

## 🏗️ Arquitectura

### Estructura de Componentes

```
TestingTools.tsx
├── activeTab: 'historial' | 'pruebas' | 'metricas' | 'cache' ← NEW
│
└── CachePanel.tsx (NEW — 400+ líneas)
    ├── Estado local:
    │   ├── cacheEntries: Map<string, CacheEntry>
    │   ├── selectedIds: Set<string>
    │   ├── filter: 'all' | 'locationKeys' | 'weather' | 'valid' | 'expired'
    │   ├── searchQuery: string
    │   └── isDetailPopupOpen: boolean
    │
    ├── Secciones (renderizadas por filter):
    │   ├── LocationKeys Table
    │   │   ├── Columna: Clave | Valor S2 | Guardado | Acciones
    │   │   └── Cada fila: [👁️ Ver] [📋 Copiar] ☑️
    │   │
    │   └── Weather Data Table
    │       ├── Columna: Clave | Condición | Expiración | Edad | Estado | Acciones
    │       └── Cada fila: [👁️ Ver] [📋 Copiar] ☑️
    │
    ├── Controles superiores:
    │   ├── Filtro dropdown: [Todos | LocationKeys | Weather | Válidos | Expirados]
    │   ├── Búsqueda por ciudad: <input type="search" />
    │   ├── Botón "🔄 Actualizar"
    │   └── Botón "🗑️ Limpiar TODO" (danger)
    │
    ├── Acciones (cuando hay selección):
    │   └── Botón "🗑️ Eliminar selección (N)" (peligroso, rojo)
    │
    └── Métricas resumen:
        ├── Total entradas (LocationKeys + Weather)
        ├── Almacenamiento usado (bytes → KB/MB)
        └── % usado vs límite (10MB aprox.)

└── CacheDetailPopup.tsx (NEW — 200+ líneas)
    ├── Header: Tipo (LocationKey | Weather) | Clave | [X]
    ├── JSON viewer (monospace, coloreado)
    ├── Metadata:
    │   ├── Timestamp guardado (ISO)
    │   ├── Edad (minutos/horas)
    │   ├── TTL restante (si aplica)
    │   └── Tamaño (bytes)
    └── Footer: Botón "Copiar JSON completo"
```

### Tipos TypeScript

```typescript
// src/types/cache.ts
interface CacheEntry {
  id: string              // clave única
  type: 'locationKey' | 'weather'
  key: string             // nombre de la clave
  value: any              // valor serializado
  savedAt: number         // timestamp guardado
  expiresAt?: number      // timestamp expiración (solo weather)
  size: number            // bytes
}

interface CacheMetrics {
  totalEntries: number
  locationKeyCount: number
  weatherCount: number
  validCount: number
  expiredCount: number
  totalSize: number       // bytes
  storagePercentage: number  // 0-100
}

// Estados de una entrada
type CacheEntryStatus = 'valid' | 'expiring' | 'expired'
```

---

## 📊 Visualización Detallada

### Tab "🔧 Caché" — Layout General

```
┌─────────────────────────────────────────────────────────────┐
│ 🔧 Caché  Filtro: [Todos ▾]  Buscar: [_________] 🔄 Limpiar│
├─────────────────────────────────────────────────────────────┤
│ 📊 MÉTRICAS                                                  │
│ • Total: 94 LocationKeys + 94 Weather = 188 entradas       │
│ • Almacenamiento: 2.4 MB / 10 MB (24%)                     │
├─────────────────────────────────────────────────────────────┤
│ 📍 LOCATIONKEYS (localStorage)                              │
│ ┌──────────────────┬──────────┬──────────────┬───────────┐  │
│ │ Clave            │ S2 Value │ Guardado     │ Acciones  │  │
│ ├──────────────────┼──────────┼──────────────┼───────────┤  │
│ │ ☑️ pwe-loc-001   │ 328409   │ Hace 2h      │ 👁️ 📋   │  │
│ │ ☑️ pwe-loc-002   │ 327164   │ Hace 1h 45m  │ 👁️ 📋   │  │
│ │ ☑️ pwe-loc-003   │ 326812   │ Hace 1h 30m  │ 👁️ 📋   │  │
│ │ ...              │ ...      │ ...          │ ...       │  │
│ └──────────────────┴──────────┴──────────────┴───────────┘  │
│                                                              │
│ 🌦️ WEATHER DATA (IndexedDB)                                │
│ ┌──────────────────┬────────┬──────────────┬─────┬───────┐ │
│ │ Clave            │ Condic.│ Expira en    │Edad │Estado │ │
│ ├──────────────────┼────────┼──────────────┼─────┼───────┤ │
│ │ ☑️ pwe-w-s2-1    │ Sunny  │ 11:47 (47m)  │ 13m │ ✅    │ │
│ │ ☑️ pwe-w-s2-2    │ Partly │ 11:32 (32m)  │ 28m │ ✅    │ │
│ │ ☑️ pwe-w-s2-3    │ Cloudy │ 10:58 ⏰     │ 62m │ ⏰    │ │
│ │ ☑️ pwe-w-s2-4    │ Rain   │ 10:15 ❌     │ 105m│ ❌    │ │
│ │ ...              │ ...    │ ...          │ ... │ ...   │ │
│ └──────────────────┴────────┴──────────────┴─────┴───────┘ │
│                                                              │
│ ☑️ 3 seleccionados                  [🗑️ Eliminar selección]│
└─────────────────────────────────────────────────────────────┘
```

### Estados Visuales

| Estado | Icon | Color | Significado |
|--------|------|-------|-------------|
| Válido | ✅ | Verde | TTL no expirado |
| Expirando | ⏰ | Ámbar | < 5 min hasta expiración |
| Expirado | ❌ | Rojo | TTL ya pasó |

### Popup Detalle

```
┌─────────────────────────────────────────┐
│ 🌦️ Weather Data — pwe-w-s2-1         [X]│
├─────────────────────────────────────────┤
│ {                                       │
│   "s2Key": "s2-1",                      │
│   "condition": "sunny",                 │
│   "tempC": 24,                          │
│   "windKmh": 12,                        │
│   "savedAt": 1711270500000,             │
│   "expiresAt": 1711274100000,           │
│   "boostedTypes": ["fire", "ground"]    │
│ }                                       │
│                                         │
│ 📝 Guardado: 31/03 11:00:00             │
│ ⏰ Edad: 13 minutos                     │
│ ⏱️  TTL: 47 minutos restantes           │
│ 📦 Tamaño: 284 bytes                    │
│                                         │
│            [📋 Copiar JSON]             │
└─────────────────────────────────────────┘
```

---

## 🔄 Flujo de Interacción

### 1. Abrir Tab Caché

```
User clicks "TestingTools" button in Header
  ↓
TestingTools modal opens
  ↓
User clicks "🔧 Caché" tab
  ↓
CachePanel monta
  ↓
useEffect: loadCacheData()
  ├─ getAllLocationKeys() from localStorage
  ├─ getAllWeatherEntries() from IndexedDB
  ├─ calculateMetrics()
  └─ renderTables()
```

### 2. Ver Detalle de Entrada

```
User clicks 👁️ button on a row
  ↓
CacheDetailPopup opens with cacheEntry data
  ↓
showJSON(entry.value)
  ├─ Pretty-print JSON
  ├─ Colorear sintaxis
  └─ Agregar metadata (savedAt, expiresAt, size)
  ↓
User clicks [X] or clicks outside → Close popup
```

### 3. Copiar Clave

```
User clicks 📋 button
  ↓
copy(cacheEntry.key) to clipboard
  ↓
Toast message: "📋 Copiado: pwe-w-s2-1"
  ↓
Toast desaparece después de 2s
```

### 4. Seleccionar Entradas para Eliminar

```
User checks ☑️ on N rows
  ↓
selectedIds: Set<string> se actualiza
  ↓
Button "🗑️ Eliminar selección (N)" se habilita (rojo)
  ↓
User clicks button
  ↓
Modal de confirmación aparece:
  "¿Eliminar 3 entradas?
   Se perderán los datos en caché para estas ciudades.
   [Cancelar] [🗑️ Eliminar]"
  ↓
User clicks "🗑️ Eliminar"
  ↓
deleteMultipleCacheEntries(selectedIds)
  ├─ Iterate selectedIds
  ├─ Remove from localStorage o IndexedDB según tipo
  └─ Refetch data → re-render tabla
  ↓
Toast: "✅ Eliminadas 3 entradas"
  ↓
selectedIds.clear(), button deshabilita
```

### 5. Limpiar TODO

```
User clicks "🗑️ Limpiar TODO" (danger button, rojo)
  ↓
Modal de confirmación fuerte:
  "⚠️ ADVERTENCIA
   Esto ELIMINARÁ TODAS las entradas de caché.
   Los datos se cargarán desde API en la próxima carga.

   [Cancelar] [🗑️ Limpiar TODO]"
  ↓
User clicks "🗑️ Limpiar TODO"
  ↓
await clearAllCache()
  ├─ localStorage.clear() o solo pwe-* keys
  ├─ idbKeyVal.clear() o solo pwe-* keys
  └─ Notification: "✅ Caché completamente limpio"
  ↓
CachePanel se recarga (tabla vacía)
```

---

## 🛠️ Implementación: Pasos

### Paso 1: Crear tipos TypeScript

**Archivo:** `src/types/cache.ts`

```typescript
export interface CacheEntry {
  id: string
  type: 'locationKey' | 'weather'
  key: string
  value: any
  savedAt: number
  expiresAt?: number
  size: number
}

export interface CacheMetrics {
  totalEntries: number
  locationKeyCount: number
  weatherCount: number
  validCount: number
  expiredCount: number
  totalSize: number
  storagePercentage: number
}

export type CacheEntryStatus = 'valid' | 'expiring' | 'expired'
```

### Paso 2: Crear utilidades de caché

**Archivo:** `src/utils/cacheDebugHelper.ts`

Funciones a implementar:
- `getAllLocationKeys()` — lee localStorage pwe-loc-*
- `getAllWeatherEntries()` — lee IndexedDB pwe-w-*
- `calculateCacheMetrics()` — calcula stats
- `getCacheEntryStatus(entry)` — retorna 'valid'|'expiring'|'expired'
- `deleteMultipleCacheEntries(ids)` — elimina del storage
- `getSizeInKB(bytes)` — formatea tamaño
- `getRelativeTime(timestamp)` — "Hace 2 minutos"

### Paso 3: Crear componente CachePanel

**Archivo:** `src/components/TestingTools/CachePanel.tsx` (400+ líneas)

```typescript
interface CachePanelState {
  entries: CacheEntry[]
  metrics: CacheMetrics
  selectedIds: Set<string>
  filter: FilterType
  searchQuery: string
  detailPopup: CacheEntry | null
}

export default function CachePanel() {
  // useEffect: loadCacheData
  // Render: Filtros + Métricas + Tablas + PopupDetalle
}
```

### Paso 4: Crear componente CacheDetailPopup

**Archivo:** `src/components/TestingTools/CacheDetailPopup.tsx` (200+ líneas)

```typescript
interface CacheDetailPopupProps {
  entry: CacheEntry | null
  isOpen: boolean
  onClose: () => void
}

export default function CacheDetailPopup({ entry, isOpen, onClose }: ...) {
  // Modal overlay + JSON viewer + metadata
}
```

### Paso 5: Actualizar TestingTools

**Archivo:** `src/components/TestingTools/TestingTools.tsx`

```typescript
// Agregar tab "caché"
const tabs = ['historial', 'pruebas', 'metricas', 'cache'] as const

// Render:
<nav className="tt-tabs">
  {tabs.map(tab => (
    <button key={tab} className={activeTab === tab ? 'active' : ''}>
      {tabLabel[tab]}
    </button>
  ))}
</nav>

// Content:
{activeTab === 'cache' && <CachePanel />}
```

### Paso 6: Estilos CSS

**Archivo:** `src/components/TestingTools/CachePanel.tsx` — `<style>` tag local

```css
.cp-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.cp-table {
  border-collapse: collapse;
  font-size: 12px;
  width: 100%;
  table-layout: auto;
}

.cp-table th {
  background: var(--bg-tertiary);
  padding: 8px;
  text-align: left;
  font-weight: 600;
}

.cp-table td {
  padding: 8px;
  border-bottom: 1px solid var(--border-primary);
}

.cp-status-valid { color: var(--success); }
.cp-status-expiring { color: var(--warning); }
.cp-status-expired { color: var(--danger); }
```

---

## 📦 Dependencias Necesarias

**Existentes:**
- ✅ `idb-keyval` — acceso a IndexedDB
- ✅ React 18 — hooks
- ✅ Zustand — state (si necesario)

**Nuevas:**
- ❌ `react-json-view` — (OPCIONAL para JSON coloreado)
  - Alternativa: `JSON.stringify()` + custom styling con `<pre>`

---

## ✅ Checklist de Implementación

### Componentes
- [ ] `src/types/cache.ts` — tipos TypeScript
- [ ] `src/utils/cacheDebugHelper.ts` — utilidades
- [ ] `src/components/TestingTools/CachePanel.tsx` — panel principal
- [ ] `src/components/TestingTools/CacheDetailPopup.tsx` — popup detalle
- [ ] `src/components/TestingTools/TestingTools.tsx` — agregar tab 4

### Funcionalidad
- [ ] Cargar LocationKeys desde localStorage
- [ ] Cargar Weather data desde IndexedDB
- [ ] Calcular métricas (total, almacenamiento, %)
- [ ] Filtro: Todos | LocationKeys | Weather | Válidos | Expirados
- [ ] Búsqueda por nombre de ciudad
- [ ] Mostrar estado visual (✅/⏰/❌)
- [ ] Click "Ver" → popup JSON
- [ ] Click "Copiar" → toast
- [ ] Seleccionar múltiples → "Eliminar selección" con confirmación
- [ ] "Limpiar TODO" con confirmación fuerte

### UI/UX
- [ ] Responsive (ScrollX en tablas si necesario)
- [ ] Dev-only: `import.meta.env.DEV` check
- [ ] Toast notifications (success/error)
- [ ] Modal de confirmación con descripción
- [ ] JSON viewer legible (monospace, coloreado)

### Testing
- [ ] Funciona en DEV mode
- [ ] No aparece en BUILD mode
- [ ] Cache data se actualiza correctamente
- [ ] Eliminación funciona (data realmente se borra)

---

## 🎨 Design System Integration

```css
/* Variables que ya existen (reutilizar) */
--bg-primary         /* fondo principal */
--bg-secondary       /* fondo secundario */
--bg-tertiary        /* fondo tablas */
--text-primary       /* texto principal */
--text-secondary     /* texto secundario */
--border-primary     /* bordes */
--success            /* verde */
--warning            /* ámbar/naranja */
--danger             /* rojo */

/* Nuevas variables (si aplica) */
--status-valid       /* = var(--success) */
--status-expiring    /* = var(--warning) */
--status-expired     /* = var(--danger) */
```

---

## 🧪 Casos de Prueba

| Caso | Entrada | Salida Esperada |
|------|---------|-----------------|
| TC-1 | Abrir tab Caché | Tablas cargadas, métricas visibles |
| TC-2 | Hacer click 👁️ | Popup abre con JSON pretty-printed |
| TC-3 | Hacer click 📋 | Toast "Copiado" + clave en clipboard |
| TC-4 | Filtro = "Expirados" | Solo filas con ❌ visibles |
| TC-5 | Búsqueda = "auckland" | Solo entradas de Auckland visibles |
| TC-6 | Seleccionar 3 + Eliminar | Modal confirmación → datos borrados |
| TC-7 | "Limpiar TODO" | Modal fuerte → todo IndexedDB + localStorage limpio |
| TC-8 | En PROD build | Tab NO aparece (dev-only) |

---

## 📝 Documentación Post-Implementación

Después de completar, actualizar:
- [ ] `MEMORY.md` — agregar ptr a 25-us606-cache-inspector.md
- [ ] `06-sprints.md` — marcar US-606 como ✅ Completada
- [ ] `05-backlog.md` — marcar US-606 Estado: ✅ Completada

---

## 🚀 Próximos Pasos (después de US-606)

1. **US-609** — Métricas de Precisión (Tab 3 en TestingTools)
2. **US-701/702** — Responsive (Tablet + Mobile)

---

**Fecha creación:** 2026-03-31
**Última actualización:** 2026-03-31
**Status:** 📋 Analysis Complete — Ready for Implementation

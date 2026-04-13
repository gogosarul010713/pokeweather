# 🏠 Nidos de Pokémon — Arquitectura y Planificación

**Versión:** v1.0.0-alpha (feature/nests)  
**Base:** v1.0.0-stable (commit 71a3932)  
**Estado:** Fase 1 (Sprint 8) — MVP en desarrollo  
**Rama:** `feature/nests`  

---

## 📋 Resumen Ejecutivo

**Objetivo:** Agregar módulo **Nidos de Pokémon** como complemento independiente a PokeWeather v2, sin afectar la funcionalidad de Clima (refactor/firebase-v2).

**Alcance Fase 1 (Sprint 8):**
- 5 nidos estáticos (JSON)
- Visualización en mapa + sidebar
- Panel de información completo
- Toggle Clima ⇄ Nidos
- Favoritos + caché IndexedDB

**No incluye (Fases 2-3):**
- Filtros/ordenamiento (Sprint 9)
- Visualización de áreas (Sprint 10)

---

## 🏗️ Arquitectura de Módulos

### Separación: Clima vs Nidos

```
pokeweather-nests/
├── src/
│   ├── data/
│   │   ├── pokedensity-cities.json          (Clima)
│   │   └── nests.json                       (Nidos) ✨ NEW
│   │
│   ├── services/
│   │   ├── weather/                         (Clima)
│   │   └── nests/                           (Nidos) ✨ NEW
│   │       ├── nestService.ts
│   │       └── nestCacheService.ts
│   │
│   ├── hooks/
│   │   ├── useWeather.ts                    (Clima)
│   │   └── useNests.ts                      (Nidos) ✨ NEW
│   │
│   ├── components/
│   │   ├── Map/ (Clima)
│   │   ├── Nests/ ✨ NEW
│   │   │   ├── NestMapView.tsx
│   │   │   ├── NestPin.tsx
│   │   │   ├── NestTooltip.tsx
│   │   │   ├── NestLegend.tsx
│   │   ├── Sidebar/ (Clima)
│   │   ├── Header/
│   │   │   ├── FilterPanel.tsx (EXTENDER)
│   │   │   └── ModeToggle.tsx ✨ NEW
│   │   ├── Nests-Sidebar/ ✨ NEW
│   │   │   ├── NestFeed.tsx
│   │   │   └── NestDetail.tsx
│   │
│   ├── types/
│   │   ├── cache.ts (Clima)
│   │   └── nest.ts ✨ NEW
│   │
│   └── store/
│       └── useStore.ts (EXTENDER nests slice)
│
└── docs/
    ├── 30-nests-architecture.md (este archivo)
    ├── 31-nests-phase-1.md
    └── (en cada sprint)
```

### Responsabilidades Compartidas

| Aspecto | Compartido | Notas |
|---------|-----------|-------|
| **Mapa (Leaflet)** | ✅ | Mismo MapContainer, diferentes capas |
| **Caché (IndexedDB)** | ✅ | Colecciones separadas: `weather_data` vs `nests_data` |
| **State (Zustand)** | ✅ | Mismo store, slices independientes |
| **Design System** | ✅ | Mismo `index.css`, vars reutilizables |
| **Componentes UI** | ✅ | CustomSelect, LoadingScreen, SyncBadge, etc |
| **Refresh automático** | ❌ | Clima: HH:00 / Nidos: Manual |
| **API Data** | ❌ | Clima: AccuWeather / Nidos: Estático JSON |

---

## 🗂️ Diccionario de Datos

### Type: `Nest` (TypeScript)

```typescript
// src/types/nest.ts
interface Nest {
  // ─── Identidad ───
  id: string                                    // slug único
  name: string                                  // nombre nido

  // ─── Ubicación ───
  lat: number
  lon: number
  country: string
  region: 'asia' | 'europa' | 'america' | 'oceania' | 'africa'
  city: string

  // ─── Pokémon Nidificado ───
  nestPokemon: {
    pokemonId: number
    name: string
    type: PokemonType                           // 18 tipos
    rarity: 'common' | 'uncommon' | 'rare' | 'very_rare'
    spawnRate: number                           // % estimado (0-100)
  }[]

  // ─── Metadatos ───
  discoveredAt: string                         // Fecha ISO
  lastVerifiedAt: string
  radius: number                                // Metros de cobertura
  accuracy: 'high' | 'medium' | 'low'
  notes?: string

  // ─── Insignias ───
  badges: ('new' | 'verified' | 'hot' | 'common_spawn')[]
}
```

### Estructura: `nests.json`

```json
{
  "nests": [
    {
      "id": "shinjuku-sandshrew",
      "name": "Shinjuku Central Park",
      "lat": 35.6839,
      "lon": 139.7462,
      "country": "Japan",
      "region": "asia",
      "city": "Tokyo",
      "nestPokemon": [
        {
          "pokemonId": 27,
          "name": "Sandshrew",
          "type": "ground",
          "rarity": "common",
          "spawnRate": 45
        }
      ],
      "discoveredAt": "2026-01-15",
      "lastVerifiedAt": "2026-04-09",
      "radius": 250,
      "accuracy": "high",
      "badges": ["verified", "hot"]
    }
    // ... 4 nidos más
  ]
}
```

---

## 🎯 Sprint 8: Fase 1 (MVP)

### User Stories Completar

| ID | Descripción | Criterios | SP |
|----|-------------|-----------|-----|
| **US-801** | Carga estática de nidos | 5 nidos desde JSON → IndexedDB | 2 |
| **US-802** | Pins en mapa | NestPin.tsx, colores, hover | 3 |
| **US-803** | Listado sidebar | NestFeed.tsx, scroll, selección | 2 |
| **US-804** | Panel detalle | NestDetail.tsx, información completa | 3 |
| **US-805** | Toggle Clima ⇄ Nidos | ModeToggle.tsx, cambio de vista | 2 |
| **US-806** | Caché IndexedDB | nestCacheService.ts | 2 |
| **US-807** | Popup información | NestTooltip.tsx | 2 |

**Total Sprint 8:** 16 SP

---

## 📁 Checklist Implementación Phase 1

### Tipos y Datos
- [ ] `src/types/nest.ts` — Interface Nest completa
- [ ] `src/data/nests.json` — 5 nidos iniciales

### Servicios
- [ ] `src/services/nests/nestService.ts` — Mapeos y utilidades
- [ ] `src/services/nests/nestCacheService.ts` — IndexedDB (nests_data)
- [ ] `src/hooks/useNests.ts` — Hook orquestación

### Store (Zustand)
- [ ] Extender `src/store/useStore.ts` con nests slice
  - `nests: Nest[]`
  - `selectedNest: Nest | null`
  - `nestFavorites: string[]`
  - `currentMode: 'clima' | 'nests'`
  - Acciones: `setNests()`, `setSelectedNest()`, `toggleNestFavorite()`, etc
  - Derivada: `getFilteredNests(nests)`

### Componentes
- [ ] `src/components/Nests/NestMapView.tsx` — Contenedor mapa nidos
- [ ] `src/components/Nests/NestPin.tsx` — SVG pin (púrpura)
- [ ] `src/components/Nests/NestTooltip.tsx` — Popup info
- [ ] `src/components/Nests/NestLegend.tsx` — Leyenda (pestaña)
- [ ] `src/components/Nests-Sidebar/NestFeed.tsx` — Listado scroll
- [ ] `src/components/Nests-Sidebar/NestDetail.tsx` — Panel detalle
- [ ] `src/components/Header/ModeToggle.tsx` — Toggle Clima ⇄ Nidos
- [ ] Extender `src/components/Header/FilterPanel.tsx` (mostrar/ocultar según modo)

### Integración
- [ ] Actualizar `src/App.tsx` — Renderizar MapView o NestMapView según modo
- [ ] Configurar Vite para puerto 5174 (nests) vs 5173 (firebase)

### Documentación
- [ ] Este archivo (30-nests-architecture.md)
- [ ] `src/docs/31-nests-phase-1.md` — Detalles Sprint 8

### Testing & Build
- [ ] E2E: 5 nidos visible en mapa + sidebar
- [ ] E2E: Toggle Clima ⇄ Nidos funcional
- [ ] E2E: Seleccionar nido → abre detail
- [ ] `npm run build` exitoso
- [ ] Sin TypeErrors

---

## 🔄 Flujo de Datos (Fase 1)

```
┌──────────────────┐
│   App Component  │
└────────┬─────────┘
         │
    currentMode?
    ├─ 'clima'  → MapView (existente)
    └─ 'nests'  → NestMapView (nueva)
           │
           ├─ useNests.run()
           │  ├─ loadNests() → nests.json
           │  ├─ setNestCache() → IndexedDB
           │  └─ setNests(nests) → Zustand
           │
           ├─ Sidebar: NestFeed.tsx
           │  └─ getFilteredNests() → Zustand
           │
           ├─ Map: [NestPin] + NestTooltip
           │  └─ onClick → setSelectedNest()
           │
           └─ Detail: NestDetail.tsx
              └─ selectedNest de store
```

---

## 🎨 Diseño Visual

### Colores Principales

- **Clima:** Naranja (#FFB347)
- **Nidos:** Púrpura (#9C27B0)
- **Tipos Pokémon:** Palette 18 tipos (reutilizar de index.css)

### Pins en Mapa

- **Clima:** Gota naranja
- **Nidos:** Gota púrpura (con icono 🏠)
- **Hover:** Grow + glow
- **Seleccionado:** Zoom + shadow elevada

### Leyenda

- Pestaña "Nidos" paralela a "Clima"
- Muestra: colores tipo Pokémon + badges

---

## 📊 Diferencias: Worktree (feature/nests) vs Rama (refactor/firebase-v2)

| Aspecto | Worktree Nests | Rama Firebase |
|---------|---|---|
| **Carpeta** | `C:\Workspace\React\pokeweather-nests` | `C:\Workspace\React\pokeweather` |
| **Rama Git** | `feature/nests` | `refactor/firebase-v2` |
| **Commit Base** | 71a3932 (v1.0.0-stable) | 6802752 (último firebase) |
| **node_modules** | Copia independiente | Copia independiente |
| **IDE** | VSCode Window 2 o IntelliJ | VSCode Window 1 |
| **Puerto Vite** | 5174 (auto) | 5173 (default) |
| **Conflictos** | ❌ NINGUNO | ❌ NINGUNO |
| **Merge** | `git merge feature/nests` | Ya en progreso |

---

## 🚀 Próximos Pasos

1. **Hoy (Sprint 8 - Sesión 1)**
   - [ ] Crear tipos (nest.ts)
   - [ ] Crear nests.json (5 nidos)
   - [ ] Crear servicios (nestService, nestCacheService)

2. **Mañana (Sprint 8 - Sesión 2)**
   - [ ] Crear hooks (useNests)
   - [ ] Extender store (Zustand nests slice)
   - [ ] Crear componentes (NestMapView, NestPin, etc)

3. **Viernes (Sprint 8 - Sesión 3)**
   - [ ] Integración App.tsx
   - [ ] Testing E2E
   - [ ] Build validation
   - [ ] Documentation

4. **Siguiente Sprint (Sprint 9)**
   - Filtros (región, tipo, rarity)
   - Búsqueda
   - Ordenamiento

---

## 📝 Notas Importantes

- **Documentación:** Este directorio `pokeweather-nests` es INDEPENDIENTE del refactor/firebase-v2
- **Git History:** Ambas ramas (feature/nests y refactor/firebase-v2) parten de v1.0.0-stable
- **Merge Final:** Al terminar Sprint 8, hacer PR: `feature/nests → main` (no a refactor/firebase-v2)
- **Sincronización:** main se actualiza con refactor/firebase-v2 EN PARALELO (no hay conflicto porque módulos son disjuntos)

---

## 📞 Dudas Frecuentes

**¿Los cambios en nests afectan refactor/firebase-v2?**  
No. Worktrees tienen `.git` compartido pero working directories separadas. Cambios en `/pokeweather-nests` no aparecen en `/pokeweather`.

**¿Cómo sincronizo después?**  
PR: `feature/nests → main`, luego `main → refactor/firebase-v2` (rebase/pull) si es necesario.

**¿Qué pasa con dependencias nuevas?**  
Si agregas librería en nests (npm install), solo afecta `/pokeweather-nests/package.json` y su `node_modules`. Refactor/firebase queda sin cambios.

---

**Última actualización:** 2026-04-09  
**Rama:** feature/nests  
**Commit Base:** 71a3932

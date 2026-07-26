# Arquitectura — Nidos de Pokemon

**Rama:** `sprint-9-nests`  
**Status:** Phase 2 completada (Sprint 9 — sesion 13-15)  
**Ultima actualizacion:** 2026-07-22  

---

## 📋 Resumen

El módulo de **Nidos** es completamente independiente del módulo de **Clima**:
- Datos separados (nests.json vs pokedensity-cities.json)
- Componentes en carpetas distintas
- Servicios y hooks propios
- Caché en IndexedDB separado (nests_data vs weather_data)
- Store Zustand con slices independientes

**Comparten:**
- MapContainer de Leaflet (diferentes capas)
- Design system (index.css variables)
- IndexedDB DB (colecciones separadas)

---

## 🗂️ Estructura de Módulos

```
src/
├── data/
│   ├── pokedensity-cities.json     ← Clima
│   └── nests.json                  ← Nidos ✨ (YA EXISTE)
│
├── types/
│   ├── index.ts                    (importa types generales)
│   └── nest.ts                     ← Nidos ✨ (YA EXISTE)
│
├── services/
│   ├── weather/                    (Clima)
│   │   ├── weatherService.ts
│   │   └── batchWeatherService.ts
│   │
│   └── nests/                      ✨ CREAR
│       ├── nestService.ts          (utilidades, mapeos)
│       └── nestCacheService.ts     (IndexedDB CRUD)
│
├── hooks/
│   ├── useWeather.ts               (Clima)
│   └── useNests.ts                 ✨ CREAR (orquestación)
│
├── components/
│   ├── Map/                        (Clima)
│   │
│   ├── Nests/                      ✨ CREAR
│   │   ├── NestMapView.tsx         (contenedor + pins)
│   │   ├── NestPin.tsx             (SVG gota púrpura)
│   │   ├── NestTooltip.tsx         (popup info)
│   │   └── NestLegend.tsx          (leyenda)
│   │
│   ├── Sidebar/                    (Clima)
│   │
│   ├── Nests/                      ✅ IMPLEMENTADO
│   │   ├── NestCard.tsx            (card feed sidebar — sprite, badges, tipos, spawn%)
│   │   ├── NestDetail.tsx          (panel 310px — countdown, stats, evo line)
│   │   ├── NestPopup.tsx           (popup mapa 290px)
│   │   └── MigrationBanner.tsx     (chip inline en header sticky Nidos)
│   │
│   ├── Sidebar/
│   │   ├── LocationFeed.tsx        (feed unificado — grupos sticky Climas + Nidos)
│   │   └── FilterPanel.tsx         (panel deslizante — grupos clima/nidos)
│
├── store/
│   └── useStore.ts                 (extender con nests slice)
│
└── App.tsx                         (actualizar renderización)
```

---

## 🔄 Flujo de Datos (Fase 1)

```
┌─────────────────┐
│  App.tsx (init) │  setInterval(tickNow, 60_000) — countdown global
└────────┬────────┘
         │  activeLayers: { clima, nidos } — capas independientes
         │
    ┌────┴──────────────────────────────┐
    │  MapView                          │
    │  ├─ NestPin[] (hex por tipo)      │
    │  ├─ NestPopup (al seleccionar)    │
    │  └─ FlyToNest (zoom 14)           │
    └────┬──────────────────────────────┘
         │
    ┌────┴──────────────────────────────┐
    │  Sidebar → FilterPanel            │
    │         → LocationFeed            │
    │              ├─ [sticky] Climas · N
    │              │   └─ LocationCard[]
    │              └─ [sticky] Nidos · N
    │                  ├─ MigrationBanner (inline chip)
    │                  └─ NestCard[]
    └───────────────────────────────────┘
         │
    Zustand store:
    ├─ nests: Nest[]          (src/data/nests.json — estatico)
    ├─ selectedNest: Nest|null
    ├─ now: number            (tick cada 60s para countdown)
    ├─ nestTypeFilter: string[]
    └─ nestSortBy: 'name'|'type'|'spawnRate'
```

---

## 💾 Diccionario de Datos

### Type: `Nest` (TypeScript)

```typescript
// src/types/nest.ts — YA EXISTE
interface Nest {
  // Identidad
  id: string                                 // "shinjuku-sandshrew"
  name: string                               // "Shinjuku Central Park"
  
  // Ubicación
  lat: number
  lon: number
  country: string                            // "Japan"
  region: 'asia' | 'europa' | 'america' | 'oceania' | 'africa'
  city: string                               // "Tokyo"
  
  // Pokémon nidificado
  nestPokemon: {
    pokemonId: number                        // 27
    name: string                             // "Sandshrew"
    type: PokemonType                        // 18 tipos
    rarity: 'common' | 'uncommon' | 'rare' | 'very_rare'
    spawnRate: number                        // % (0-100)
    minIV?: number                           // IV mínimo
  }[]
  
  // Metadatos
  discoveredAt: string                       // ISO date
  lastVerifiedAt: string
  radius: number                             // Metros cobertura
  accuracy: 'high' | 'medium' | 'low'
  notes?: string
  
  // Insignias
  badges: ('new' | 'verified' | 'hot' | 'common_spawn')[]
}
```

### Estructura JSON: `nests.json`

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
          "spawnRate": 45,
          "minIV": 60
        }
      ],
      "discoveredAt": "2026-01-15",
      "lastVerifiedAt": "2026-04-10",
      "radius": 250,
      "accuracy": "high",
      "badges": ["verified", "hot"]
    }
    // ... 4 más
  ]
}
```

### Store Zustand (nests slice)

```typescript
type NestsStore = {
  // State
  nests: Nest[]
  selectedNest: Nest | null
  nestFavorites: string[]           // IDs de favoritos
  currentMode: 'clima' | 'nests'
  
  // Actions
  setNests(nests: Nest[]): void
  setSelectedNest(nest: Nest | null): void
  toggleNestFavorite(nestId: string): void
  setCurrentMode(mode: 'clima' | 'nests'): void
  
  // Derived
  getFilteredNests(): Nest[]        // Para filtros futuros
}
```

---

## 🎯 Responsabilidades por Archivo

### Servicios

| Archivo | Responsabilidad |
|---------|-----------------|
| `nestService.ts` | Mapeos, utilidades, color por tipo |
| `nestCacheService.ts` | CRUD en IndexedDB.nests_data |

### Hooks

| Archivo | Responsabilidad |
|---------|-----------------|
| `useNests.ts` | Orquestación: cargar JSON → cache → store |

### Componentes (Mapa)

| Archivo | Responsabilidad |
|---------|-----------------|
| `NestMapView.tsx` | Contenedor: MapContainer + NestPin[] |
| `NestPin.tsx` | Marcador SVG: gota púrpura + interacción |
| `NestTooltip.tsx` | Popup: nombre + pokémon + botones |
| `NestLegend.tsx` | Leyenda: colores tipo + badges |

### Componentes (Sidebar)

| Archivo | Responsabilidad |
|---------|-----------------|
| `NestFeed.tsx` | Listado scroll: map nests → NestCard[] |
| `NestCard.tsx` | Card individual: nombre + pais + tipo |
| `NestDetail.tsx` | Panel modal: info completa del nido |
| `MigrationBanner.tsx` | Banner de countdown a proxima migracion — renderizado dentro de `LocationFeed` como primer item de la seccion de nidos cuando `activeLayers.nidos` es true. Lee `store.now` vs `NEXT_MIGRATION`. |

### Header

| Archivo | Responsabilidad |
|---------|-----------------|
| `ModeToggle.tsx` | Toggle: 🌞 Clima | 🏠 Nidos |

---

## 🔄 Ciclo de Vida

### Primera carga (inicial):
1. App renderiza
2. currentMode = 'nests' → renderiza NestMapView
3. useNests.run() ejecuta:
   - loadNests() → fetch nests.json
   - setNestCache() → save en IndexedDB.nests_data
   - setNests(nests) → update Zustand.nests[]
4. NestMapView recibe nests del store
5. Renderiza [NestPin] + NestFeed

### Cambio de nido seleccionado:
1. Usuario clic en pin o card
2. onClick → setSelectedNest(nest)
3. NestDetail recibe selectedNest del store
4. Panel abre con información

### Toggle Clima ⇄ Nidos:
1. ModeToggle clic
2. setCurrentMode('clima' | 'nests')
3. App renderiza MapView o NestMapView condicionalmente
4. Sidebar cambia LocationFeed ↔ NestFeed

### Segunda sesión:
1. useNests.run() ejecuta
2. Primero intenta cargar desde IndexedDB.nests_data
3. Si no existe, fetch nests.json
4. Tiempo de carga < 1s (de caché)

---

## 🎨 Decisiones de Diseño

### Color del Pin
- Por tipo Pokémon nidificado (mismo palette que clima)
- Ground → amarillo/marrón
- Fire → naranja
- Water → azul
- etc.

### Pins vs Ciudades
- Clima: Gota **naranja** (#FFB347)
- Nidos: Gota **púrpura** (#9C27B0)
- Diferenciación clara en mapa

### Favoritos
- Guardados en store (Zustand → localStorage automático)
- Persist entre sesiones
- Icon ⭐ toggle activo/inactivo

### Badges
- `verified` ✓ → verde
- `hot` 🔥 → naranja
- `new` ⭐ → azul
- `common_spawn` ➕ → gris

---

## ✅ Criterios de Aceptación (Arquitectura)

- [ ] Tipos completamente tipados (no `any`)
- [ ] Servicios independientes de Clima
- [ ] Caché separada en IndexedDB
- [ ] Store Zustand con nests slice
- [ ] Componentes en carpetas correctas
- [ ] Build exitoso sin TypeErrors
- [ ] Sin afectar funcionalidad de Clima

---

---

## Logica de Migracion (Sprint 9)

### Premisa

Niantic aplica las migraciones de nidos en un **instante UTC fijo** — todos los nidos del mundo cambian al mismo tiempo. No hay logica por zona horaria del nido ni del usuario.

El campo `nextMigration` en el JSON es una fecha ISO UTC. El countdown es logica de display pura derivada de `Date.now() - new Date(nextMigration).getTime()`.

### Estados de un nido en runtime

| Condicion | Display |
|---|---|
| `confirmed: true` AND `now < nextMigration` | Badge "Confirmado" + "Migra en Xd Yh" |
| `confirmed: false` AND `now < nextMigration` | Sin badge + "Migra en Xd Yh" |
| `now >= nextMigration` (cualquier `confirmed`) | "Migro hace Xh · Sin confirmar" |

El JSON nunca se muta en runtime — `confirmed` permanece como estaba en el JSON hasta la proxima edicion manual del dataset.

### Interval global en Zustand

Un unico `setTimeout` por ciclo de vida de la app, que apunta al `nextMigration` mas proximo entre todos los nidos:

```ts
// init en useStore o en App.tsx al cargar nests
const nearest = Math.min(...nests.map(n => new Date(n.nextMigration).getTime()))
const msUntil = nearest - Date.now()

setTimeout(() => {
  store.tickNow()                      // dispara re-render de todos los countdowns
  setInterval(store.tickNow, 60_000)   // luego cada minuto para actualizar "Migra en X"
}, Math.max(0, msUntil))
```

`tickNow` actualiza `store.now = Date.now()`. Todos los componentes que muestran countdown leen `store.now` — un solo interval, todos reaccionan.

### Funcion utilitaria

```ts
// src/utils/nestMigration.ts
getMigrationStatus(nextMigration: string, now: number): string
// "Migra en 2d 14h"
// "Migra en 6h 23m"
// "Migro hace 3h · Sin confirmar"
```

---

**Ultima actualizacion:** 2026-07-16  
**Rama:** sprint-9-nests


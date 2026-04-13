# 🏗️ Arquitectura — Nidos de Pokémon

**Rama:** `feature/nests`  
**Status:** Phase 1 (MVP)  
**Última actualización:** 2026-04-10  

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
│   ├── Nests-Sidebar/              ✨ CREAR
│   │   ├── NestFeed.tsx            (listado scroll)
│   │   ├── NestCard.tsx            (card individual)
│   │   └── NestDetail.tsx          (panel modal)
│   │
│   ├── Header/
│   │   ├── Header.tsx              (componente principal)
│   │   ├── FilterPanel.tsx         (clima, extender)
│   │   └── ModeToggle.tsx          ✨ CREAR (Clima ⇄ Nidos)
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
│  App.tsx (init) │
└────────┬────────┘
         │
    currentMode?
    ├─ 'clima'  → MapView (existe)
    └─ 'nests'  → NestMapView (nueva)
                  │
                  ├─ useNests.run()
                  │  ├─ loadNests() → src/data/nests.json
                  │  ├─ setNestCache() → IndexedDB.nests_data
                  │  └─ setNests(nests) → Zustand.nests[]
                  │
                  ├─ Sidebar: NestFeed.tsx
                  │  ├─ Map nests → NestCard[]
                  │  └─ onClick → setSelectedNest()
                  │
                  ├─ Map: NestPin[] + NestTooltip
                  │  ├─ render pinpoint por cada nest
                  │  └─ onClick → setSelectedNest() + show tooltip
                  │
                  └─ Detail: NestDetail.tsx
                     └─ Leer selectedNest del store
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
| `NestCard.tsx` | Card individual: nombre + país + tipo |
| `NestDetail.tsx` | Panel modal: info completa del nido |

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

**Última actualización:** 2026-04-10  
**Rama:** feature/nests


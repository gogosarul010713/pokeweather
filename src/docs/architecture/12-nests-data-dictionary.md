# Diccionario de Datos — Tipos y Schemas

**Rama:** `sprint-9-nests`  
**Status:** Referencia activa  
**Ultima actualizacion:** 2026-07-16  

---

## TypeScript: Interfaces Completas

### `Nest` (Principal)

Schema definitivo aprobado en sesion 12 (2026-07-22). Ver DEC-909 en `decisions.md`.

```typescript
interface Nest {
  // ─── Identidad ───
  id: string                    // "nyc-central-park-grass" (slug unico kebab-case)
  name: string                  // "Central Park"

  // ─── Ubicacion ───
  lat: number                   // 40.7829
  lng: number                   // -73.9654  (ojo: "lng", NO "lon")
  city: string                  // "New York"
  country: string               // "USA"
  countryCode: string           // "US" — ISO 3166-1 alpha-2; emoji derivado via countryFlag(code)
  timezone: string              // "America/New_York" (IANA) — para display de hora local futura

  // ─── Pokemon nidificado ───
  pokemonId: number             // 1 (Bulbasaur) — ID PokeAPI para sprite CDN
  pokemonName: string           // "Bulbasaur"
  types: PokemonType[]          // ["grass", "poison"] — 1 o 2 tipos
  rarity: PokemonRarity         // 'common' | 'uncommon' | 'rare' | 'very_rare'
  hasShiny: boolean             // true si la forma shiny esta disponible en GO
  spawnRate: number             // 14.2 (porcentaje estimado 0-100)
  stardust?: number             // 1000 — SD base al capturar. Omitir si desconocido
  evolutionLine: string         // "Bulbasaur -> Ivysaur -> Venusaur"
  evolutionLineExtra?: string   // "(Mega Venusaur)" — formas alternativas, opcional

  // ─── Confirmacion ───
  confirmed: boolean            // true si el nido esta activo y verificado actualmente
  confirmedAt?: string          // ISO UTC — ultima confirmacion. Ej: "2026-07-19T18:00:00Z"

  // ─── Datos del lugar ───
  stops?: number                // Aproximacion de PokeParadas dentro del nido
  gyms?: number                 // Aproximacion de Gimnasios dentro del nido
}
```

**Campos eliminados respecto a version anterior:**
- `nextMigration` — movido a constante global en config/store (DEC-909). No va por nido.
- `flag` — eliminado. Reemplazado por `countryCode` + funcion `countryFlag()` en `src/config/countryFlags.ts`.
- `nestPokemon[]` — simplificado a campos planos (`pokemonId`, `pokemonName`, `types`, etc.)
- `discoveredAt`, `lastVerifiedAt`, `radius`, `accuracy`, `badges`, `migrationCycle`, `notes`, `region` — deuda tecnica futura, no requeridos para US-818.

**Nota sobre `confirmed` en runtime:** cuando `Date.now() >= store.nextMigration`, el nido se considera migrado aunque `confirmed` sea `true` en el JSON. El estado de display se deriva en runtime — el JSON no se muta.

---

### Campos derivados (calcular en frontend, NO en JSON)

```typescript
// Badge "hot": spawn alto
const isHot = (nest.spawnRate ?? 0) >= 65

// Badge "new": confirmado hace menos de 48h
const isNew = nest.confirmedAt
  ? Date.now() - new Date(nest.confirmedAt).getTime() < 48 * 60 * 60 * 1000
  : false

// Spawn con tilde si no confirmado
const spawnRateDisplay = nest.confirmed ? `${nest.spawnRate}%` : `~${nest.spawnRate}%`

// Estrellas de rareza para display
const rarityStars: Record<PokemonRarity, string> = {
  common:    '★',
  uncommon:  '★★',
  rare:      '★★★',
  very_rare: '★★★★',
}

const rarityLabel: Record<PokemonRarity, string> = {
  common:    'Comun',
  uncommon:  'Poco comun',
  rare:      'Raro',
  very_rare: 'Muy raro',
}
```

---

### Migracion global

`nextMigration` NO esta en cada nido. Es una constante global porque todos los nidos del mundo migran en el mismo instante UTC (definido por Niantic).

```typescript
// src/config/nestMigration.ts
export const NEXT_MIGRATION = '2026-08-06T10:00:00Z'  // actualizar cada ciclo
```

El store expone `store.now` (timestamp reactivo, ver DEC-907) para el countdown. El estado migrado se deriva comparando `Date.now()` vs `new Date(NEXT_MIGRATION).getTime()`.

### `NestPokemon` (Pokemon en Nido)

```typescript
interface NestPokemon {
  pokemonId: number             // 27 (Sandshrew) — mismo que Nest.pokemonId para el primario
  name: string                  // "Sandshrew"
  type: PokemonType             // 'ground' | 'fire' | ... (18 tipos)
  rarity: PokemonRarity         // 'common' | 'uncommon' | 'rare' | 'very_rare'
  spawnRate: number             // 45 (porcentaje estimado 0-100)
  minIV?: number                // 60 (IV minimo observado, opcional)
}
```

### Types (Uniones)

```typescript
// 18 tipos Pokémon
type PokemonType = 
  | 'fire' | 'water' | 'grass' | 'normal' 
  | 'electric' | 'ice' | 'fighting' | 'poison' 
  | 'ground' | 'flying' | 'psychic' | 'bug' 
  | 'rock' | 'ghost' | 'dragon' | 'dark' 
  | 'steel' | 'fairy'

// Rareza de spawn
type PokemonRarity = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'very_rare'

// Región geográfica
type Region = 
  | 'asia' 
  | 'europa' 
  | 'america' 
  | 'oceania' 
  | 'africa'

// Badge (insignia de estado)
type BadgeType = 
  | 'new'           // Recientemente descubierto
  | 'verified'      // Verificado por múltiples usuarios
  | 'hot'           // Activo actualmente
  | 'common_spawn'  // Múltiples apariciones

// Precisión de datos
type Accuracy = 
  | 'high'          // 100% confiable
  | 'medium'        // ~80% confiable
  | 'low'           // ~50% confiable
```

### `NestCacheEntry` (Para IndexedDB)

```typescript
interface NestCacheEntry {
  id: string                    // Nest ID (primary key en IndexedDB)
  data: Nest                    // Objeto nest completo
  cachedAt: number             // Timestamp de carga (Date.now())
  verifiedAt?: number          // Última verificación (opcional)
}
```

### `NestFilters` (Para Filtros Futuros - Sprint 9)

```typescript
interface NestFilters {
  region: Region | 'todas'     // Región seleccionada o todas
  type: PokemonType[]          // Array de tipos seleccionados
  rarity: PokemonRarity[]      // Array de rarezas seleccionadas
  searchQuery: string          // Búsqueda por nombre/ciudad
  sortMode: 'name' | 'type' | 'country' | 'updated'
}
```

---

## JSON: Estructura nests.json

### Ejemplo de nido completo (schema sesion 12 — DEC-909)

```json
{
  "nests": [
    {
      "id": "nyc-central-park-grass",
      "name": "Central Park",
      "lat": 40.7829,
      "lng": -73.9654,
      "city": "New York",
      "country": "USA",
      "countryCode": "US",
      "timezone": "America/New_York",
      "pokemonId": 1,
      "pokemonName": "Bulbasaur",
      "types": ["grass", "poison"],
      "rarity": "rare",
      "hasShiny": true,
      "spawnRate": 14.2,
      "stardust": 1000,
      "evolutionLine": "Bulbasaur -> Ivysaur -> Venusaur",
      "evolutionLineExtra": "(Mega Venusaur)",
      "confirmed": true,
      "confirmedAt": "2026-07-19T18:00:00Z",
      "stops": 34,
      "gyms": 12
    }
  ]
}
```

**Campos opcionales:** `stardust`, `stops`, `gyms`, `evolutionLineExtra`, `confirmedAt` — omitir si desconocidos; los componentes los ocultan si `undefined`.

### Valores de referencia para `stardust`

| SD | Ejemplos de pokemon |
|---|---|
| 100 | Pidgey, Rattata, Weedle |
| 300 | Sandshrew, Vulpix, Abra, la mayoria |
| 2100 | Combee, Meowth, Ekans, Seel — especie seleccionada por la comunidad para farming SD |

---

## Zustand Store: nests Slice

### State (Variables)

```typescript
type NestsSlice = {
  // ─── Variables de estado ───
  
  nests: Nest[]
  // Array de todos los nidos cargados
  // Ejemplo: [nest1, nest2, ..., nest5]
  
  selectedNest: Nest | null
  // Nido actualmente seleccionado (clic en pin o card)
  // null si no hay selección
  
  nestFavorites: string[]
  // Array de IDs de nidos marcados como favorito
  // Ejemplo: ["shinjuku-sandshrew", "harajuku-vulpix"]
  // Persistente en localStorage
  
  currentMode: 'clima' | 'nests'
  // Modo actual del app
  // 'clima' → mostrar MapView + LocationFeed
  // 'nests' → mostrar NestMapView + NestFeed
  
  // ─── Acciones (setters) ───
  
  setNests: (nests: Nest[]) => void
  // Actualiza lista completa de nidos
  
  setSelectedNest: (nest: Nest | null) => void
  // Selecciona un nido (o null para deseleccionar)
  
  toggleNestFavorite: (nestId: string) => void
  // Agrega/quita nido de favoritos
  
  setCurrentMode: (mode: 'clima' | 'nests') => void
  // Cambia modo entre clima y nidos
  
  // ─── Derivadas (computadas) ───
  
  getFilteredNests: () => Nest[]
  // Retorna nidos filtrados (para Sprint 9)
  // Por ahora retorna todos los nidos
  
  getFavoriteNests: () => Nest[]
  // Retorna solo nidos marcados como favorito
  
  isFavorite: (nestId: string) => boolean
  // True si nido es favorito
}
```

### Implementación Zustand

```typescript
export const useStore = create<NestsSlice>()(
  persist(
    (set, get) => ({
      // ─── STATE ───
      nests: [],
      selectedNest: null,
      nestFavorites: [],
      currentMode: 'clima',

      // ─── ACTIONS ───
      setNests: (nests) => set({ nests }),
      
      setSelectedNest: (nest) => set({ selectedNest: nest }),
      
      toggleNestFavorite: (nestId) => {
        const { nestFavorites } = get()
        const updated = nestFavorites.includes(nestId)
          ? nestFavorites.filter((id) => id !== nestId)
          : [...nestFavorites, nestId]
        set({ nestFavorites: updated })
      },
      
      setCurrentMode: (mode) => set({ currentMode: mode }),

      // ─── DERIVADAS ───
      getFilteredNests: () => {
        const { nests } = get()
        return nests // Por ahora retorna todos
      },
      
      getFavoriteNests: () => {
        const { nests, nestFavorites } = get()
        return nests.filter((nest) => nestFavorites.includes(nest.id))
      },
      
      isFavorite: (nestId) => {
        const { nestFavorites } = get()
        return nestFavorites.includes(nestId)
      },
    }),
    { name: 'pokeweather-store' } // localStorage key
  )
)
```

---

## IndexedDB Schema

### Base de Datos: `pokeweather`

```
Database: pokeweather
├── ObjectStore: weather_data        (Clima - existente)
│   └── Key: locationKey
│
└── ObjectStore: nests_data          (Nidos - NUEVO)
    └── Key: nestId
    └── Value: Nest (objeto completo)
```

### CRUD Operaciones

```typescript
// READ: obtener nido
const nest = await getNest('shinjuku-sandshrew')
// → Nest | null

// CREATE/UPDATE: guardar nido
await setNest('shinjuku-sandshrew', nestObject)

// READ: obtener todos
const allNests = await getAllNests()
// → Nest[]

// DELETE: limpiar caché
await clearNestCache()
```

---

## Conversiones y Mappeos

### Tipo → Color Hex

```typescript
const colorMap: Record<PokemonType, string> = {
  fire: '#FF6B35',      // Naranja
  water: '#6890F0',     // Azul
  grass: '#78C850',     // Verde
  normal: '#A8A878',    // Gris
  electric: '#F8D030',  // Amarillo
  ice: '#98D8D8',       // Cyan
  fighting: '#C03028',  // Rojo
  poison: '#A040A0',    // Púrpura
  ground: '#E0C068',    // Marrón
  flying: '#A890F0',    // Azul claro
  psychic: '#F85888',   // Rosa
  bug: '#A8B820',       // Verde oliva
  rock: '#B8A038',      // Gris marrón
  ghost: '#705898',     // Púrpura oscuro
  dragon: '#7038F8',    // Azul oscuro
  dark: '#705848',      // Marrón oscuro
  steel: '#B8B8D0',     // Gris plateado
  fairy: '#EE99AC',     // Rosa claro
}
```

### Badge → Icono

```typescript
const badgeIconMap: Record<BadgeType, string> = {
  verified: '✓',        // Checkmark
  hot: '🔥',            // Fire emoji
  new: '⭐',            // Star emoji
  common_spawn: '➕',   // Plus emoji
}

const badgeLabelMap: Record<BadgeType, string> = {
  verified: 'Verificado',
  hot: 'Activo',
  new: 'Nuevo',
  common_spawn: 'Apariciones comunes',
}
```

### Region → Nombre Legible

```typescript
const regionNameMap: Record<Region, string> = {
  asia: 'Asia',
  europa: 'Europa',
  america: 'América',
  oceania: 'Oceanía',
  africa: 'África',
}
```

---

## Ejemplo Completo: Nido Cargado

```typescript
const nest: Nest = {
  id: 'shinjuku-sandshrew',
  name: 'Shinjuku Central Park',
  lat: 35.6839,
  lon: 139.7462,
  country: 'Japan',
  region: 'asia',
  city: 'Tokyo',
  
  nestPokemon: [
    {
      pokemonId: 27,
      name: 'Sandshrew',
      type: 'ground',              // Color: #E0C068 (marrón)
      rarity: 'common',
      spawnRate: 45,
      minIV: 60,
    },
  ],
  
  discoveredAt: '2026-01-15',
  lastVerifiedAt: '2026-04-09',
  radius: 250,
  accuracy: 'high',
  badges: ['verified', 'hot'],    // Iconos: ✓ 🔥
  notes: 'Apariciones confirmadas cada mañana',
}

// En store:
const store = useStore()
store.setNests([nest])                    // Guardar en state
store.setSelectedNest(nest)               // Seleccionar
store.toggleNestFavorite(nest.id)         // Marcar favorito
store.isFavorite(nest.id)                 // → true
store.getFavoriteNests()                  // → [nest]
```

---

**Ultima actualizacion:** 2026-07-22  
**Rama:** sprint-9-nests  


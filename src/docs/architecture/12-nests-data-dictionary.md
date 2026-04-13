# 📖 Diccionario de Datos — Tipos y Schemas

**Rama:** `feature/nests`  
**Status:** Referencia  
**Última actualización:** 2026-04-12  

---

## TypeScript: Interfaces Completas

### `Nest` (Principal)

```typescript
interface Nest {
  // ─── Identidad ───
  id: string                    // "shinjuku-sandshrew" (slug único)
  name: string                  // "Shinjuku Central Park"

  // ─── Ubicación ───
  lat: number                   // 35.6839
  lon: number                   // 139.7462
  country: string               // "Japan"
  region: Region                // 'asia' | 'europa' | 'america' | 'oceania' | 'africa'
  city: string                  // "Tokyo"

  // ─── Pokémon Nidificado ───
  nestPokemon: NestPokemon[]   // Array de 1+ pokémon

  // ─── Metadatos ───
  discoveredAt: string          // "2026-01-15" (ISO date)
  lastVerifiedAt: string        // "2026-04-09" (ISO date)
  radius: number                // 250 (metros de cobertura)
  accuracy: Accuracy            // 'high' | 'medium' | 'low'
  notes?: string                // Observaciones adicionales (opcional)

  // ─── Insignias ───
  badges: BadgeType[]          // ['verified', 'hot']
}
```

### `NestPokemon` (Pokémon en Nido)

```typescript
interface NestPokemon {
  pokemonId: number             // 27 (Sandshrew)
  name: string                  // "Sandshrew"
  type: PokemonType            // 'ground' | 'fire' | ... (18 tipos)
  rarity: PokemonRarity        // 'common' | 'uncommon' | 'rare' | 'very_rare'
  spawnRate: number            // 45 (porcentaje estimado 0-100)
  minIV?: number               // 60 (IV mínimo observado, opcional)
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

### Archivo Completo

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
      "lastVerifiedAt": "2026-04-09",
      "radius": 250,
      "accuracy": "high",
      "badges": ["verified", "hot"]
    },
    {
      "id": "harajuku-vulpix",
      "name": "Harajuku Omotesando",
      "lat": 35.6653,
      "lon": 139.7297,
      "country": "Japan",
      "region": "asia",
      "city": "Tokyo",
      "nestPokemon": [
        {
          "pokemonId": 37,
          "name": "Vulpix",
          "type": "fire",
          "rarity": "uncommon",
          "spawnRate": 32,
          "minIV": 55
        }
      ],
      "discoveredAt": "2026-02-01",
      "lastVerifiedAt": "2026-04-08",
      "radius": 200,
      "accuracy": "high",
      "badges": ["verified"]
    }
    // ... 3 nidos más
  ]
}
```

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

**Última actualización:** 2026-04-12  
**Rama:** feature/nests  


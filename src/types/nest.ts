export type PokemonType =
  | 'fire' | 'water' | 'grass' | 'normal' | 'electric' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'

export type PokemonRarity = 'common' | 'uncommon' | 'rare' | 'very_rare'

export interface Nest {
  // Identidad
  id: string
  name: string

  // Ubicacion
  lat: number
  lng: number
  city: string
  country: string
  countryCode: string
  timezone: string

  // Pokemon principal (plano — DEC-909)
  pokemonId: number
  pokemonName: string
  types: PokemonType[]
  rarity: PokemonRarity
  hasShiny: boolean
  evolutionLine: string
  evolutionLineExtra?: string

  // Stats de caza
  spawnRate: number
  stardust?: number
  stops?: number
  gyms?: number

  // Confirmacion
  confirmed: boolean
  confirmedAt?: string // ISO UTC
}

export interface NestFilters {
  type: PokemonType[]
  rarity: PokemonRarity[]
  searchQuery: string
  sortMode: 'name' | 'type' | 'spawnRate' | 'distance'
}

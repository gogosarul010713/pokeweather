/**
 * Type definitions for Pokémon Nests
 * Nidos de Pokémon - Sistema independiente del módulo de Clima
 */

export type PokemonType =
  | 'fire'
  | 'water'
  | 'grass'
  | 'normal'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

export type PokemonRarity = 'common' | 'uncommon' | 'rare' | 'very_rare'

export type Region = 'asia' | 'europa' | 'america' | 'oceania' | 'africa'

export type BadgeType = 'new' | 'verified' | 'hot' | 'common_spawn'

export type Accuracy = 'high' | 'medium' | 'low'

export interface NestPokemon {
  pokemonId: number
  name: string
  type: PokemonType
  rarity: PokemonRarity
  spawnRate: number // Porcentaje estimado (0-100)
  minIV?: number // IV mínimo observado
}

export interface Nest {
  // ─── Identidad ───
  id: string // slug único (ej: "shibuya-nest-01")
  name: string // nombre del nido

  // ─── Ubicación ───
  lat: number
  lon: number
  country: string // ej: "Japan"
  region: Region
  city: string // ej: "Tokyo"

  // ─── Pokémon Nidificado ───
  nestPokemon: NestPokemon[]

  // ─── Metadatos ───
  discoveredAt: string // Fecha ISO (ej: "2026-03-01")
  lastVerifiedAt: string // Última confirmación
  radius: number // Radio cobertura en metros (ej: 250)
  accuracy: Accuracy // Confianza en los datos
  notes?: string // Observaciones adicionales

  // ─── Insignias ───
  badges: BadgeType[]
}

export interface NestCacheEntry {
  id: string // Nest ID (primary key)
  data: Nest // Objeto nest completo
  cachedAt: number // Timestamp de carga
  verifiedAt?: number // Última verificación
}

export interface NestFilters {
  region: Region | 'todas'
  type: PokemonType[]
  rarity: PokemonRarity[]
  searchQuery: string
  sortMode: 'name' | 'type' | 'country' | 'updated'
}

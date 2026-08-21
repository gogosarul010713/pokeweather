/**
 * Pokémon Types Configuration
 * Usada en FilterPanelNests y componentes relacionados
 */

export const POKEMON_TYPES = [
  'fire', 'ground', 'normal', 'flying', 'ghost', 'dark',
  'water', 'electric', 'ice', 'steel', 'dragon', 'rock',
  'poison', 'psychic', 'bug', 'grass', 'fighting', 'fairy',
] as const

export const TYPE_IMAGES: Record<string, string> = {
  normal: '/types/ico_0_normal.webp',
  fighting: '/types/ico_1_fighting.webp',
  flying: '/types/ico_2_flying.webp',
  poison: '/types/ico_3_poison.webp',
  ground: '/types/ico_4_ground.webp',
  rock: '/types/ico_5_rock.webp',
  bug: '/types/ico_6_bug.webp',
  ghost: '/types/ico_7_ghost.webp',
  steel: '/types/ico_8_steel.webp',
  fire: '/types/ico_9_fire.webp',
  water: '/types/ico_10_water.webp',
  grass: '/types/ico_11_grass.webp',
  electric: '/types/ico_12_electric.webp',
  psychic: '/types/ico_13_psychic.webp',
  ice: '/types/ico_14_ice.webp',
  dragon: '/types/ico_15_dragon.webp',
  dark: '/types/ico_16_dark.webp',
  fairy: '/types/ico_17_fairy.webp',
}

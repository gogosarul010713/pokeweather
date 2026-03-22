// weatherService.ts
// Sprint 2: solo mapeos de condición → tipos (necesario para mockCities).
// Sprint 5 (US-207): se agregan todas las funciones de fetch AccuWeather.

import type { WeatherCondition } from '../config/weatherImages'

// ─── Mapeo AccuWeather WeatherIcon → condición base ───────────────────────────

export const ACCUWEATHER_TO_CONDITION: Record<string, number[]> = {
  sunny:  [1, 2, 3, 4, 30, 33, 34],
  partly: [5, 6, 35, 36],
  cloudy: [7, 8, 38],
  fog:    [11, 37],
  rain:   [12, 13, 14, 15, 16, 17, 18, 40, 41, 42],
  snow:   [19, 20, 21, 22, 23, 24, 25, 26, 29, 43, 44],
}

// ─── Mapeo condición → tipos Pokémon potenciados ──────────────────────────────

export const CONDITION_TO_TYPES: Record<WeatherCondition, string[]> = {
  sunny:  ['fire',     'ground',   'grass'],
  partly: ['normal',   'rock'],
  cloudy: ['fairy',    'fighting', 'poison'],
  fog:    ['ghost',    'dark'],
  rain:   ['water',    'electric', 'bug'],
  snow:   ['ice',      'steel'],
  windy:  ['flying',   'dragon',   'psychic'],
}

// ─── Colores por condición (hex del design system — ver index.css) ────────────
// Usados en MapPin (DivIcon HTML no hereda CSS vars) y MapLegend.

export const CONDITION_COLORS: Record<WeatherCondition, string> = {
  sunny:  '#FFB347',
  partly: '#87CEEB',
  cloudy: '#9E9E9E',
  fog:    '#C8C8C8',
  rain:   '#5B9BD5',
  snow:   '#B0E0E6',
  windy:  '#78C896',
}

export const CONDITION_LABEL: Record<WeatherCondition, string> = {
  sunny:  'Soleado',
  partly: 'Parcial',
  cloudy: 'Nublado',
  fog:    'Niebla',
  rain:   'Lluvia',
  snow:   'Nieve',
  windy:  'Ventoso',
}

// ─── Score de calidad: identifica los mejores puntos ─────────────────────────
// Score = (densidad/max) × 0.60 + (gyms/max) × 0.25 + (rating/5) × 0.15
// Retorna: 0-100 (normalizado)
// Usado por MapPin (tamaño+color), CityTooltip (breakdown), MapLegend (leyenda)

export type BadgeType = 'stops' | 'gyms' | 'community' | 'best'

export const calculateBadges = (cities: Array<{ density: number; gyms: number; rating: number }>) => {
  const densities = cities.map(c => c.density).sort((a, b) => b - a)
  const gymsArray = cities.map(c => c.gyms).sort((a, b) => b - a)
  const q1Density = densities[Math.floor(densities.length * 0.25)]
  const q1Gyms = gymsArray[Math.floor(gymsArray.length * 0.25)]

  return (city: { density: number; gyms: number; rating: number }): BadgeType[] => {
    const hasStops = city.density >= q1Density
    const hasGyms = city.gyms >= q1Gyms
    const hasCommunity = city.rating >= 4.0

    // Si tiene TODOS, retorna 'best' (Mejores lugares)
    if (hasStops && hasGyms && hasCommunity) {
      return ['best']
    }

    // Si no tiene todos, retorna los badges individuales
    const badges: BadgeType[] = []
    if (hasStops) badges.push('stops')
    if (hasGyms) badges.push('gyms')
    if (hasCommunity) badges.push('community')
    return badges
  }
}

export const BADGE_ICONS: Record<BadgeType, string> = {
  stops: '🎯',
  gyms: '💪',
  community: '👥',
  best: '✨',
}

// ─── Funciones de cálculo ─────────────────────────────────────────────────────

const WINDY_WIND_KMH = 24.1
const WINDY_GUST_KMH = 35.4

export const getBaseCondition = (iconId: number): WeatherCondition => {
  for (const [condition, icons] of Object.entries(ACCUWEATHER_TO_CONDITION)) {
    if (icons.includes(iconId)) return condition as WeatherCondition
  }
  return 'cloudy'
}

export const resolveCondition = (iconId: number, windKmh: number, gustKmh: number): WeatherCondition => {
  const base = getBaseCondition(iconId)
  const isWindy = windKmh >= WINDY_WIND_KMH || gustKmh >= WINDY_GUST_KMH
  if (isWindy && ['sunny', 'partly', 'cloudy'].includes(base)) return 'windy'
  return base
}

export const isExtremeWeather = (alerts: unknown[]): boolean =>
  Array.isArray(alerts) && alerts.length > 0

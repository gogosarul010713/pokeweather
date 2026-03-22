// Mock data para desarrollo sin API key.
// Importa el JSON real y añade clima simulado.
// NUNCA inventa ciudades ni hardcodea datos — todo viene del JSON.

import rawCities from './pokedensity-cities.json'
import { CONDITION_TO_TYPES } from './weatherService'
import { WEATHER_IMAGES } from '../config/weatherImages'
import type { WeatherCondition } from '../config/weatherImages'
import type { City } from './useStore'

const MOCK_CONDITIONS: WeatherCondition[] = [
  'sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy',
]

export const mockCities: City[] = (rawCities as any[]).map((c, i) => {
  const condition = MOCK_CONDITIONS[i % MOCK_CONDITIONS.length]
  return {
    id:              c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name:            c.name,
    country:         c.country,
    flag:            c.flag,
    region:          c.region,
    lat:             c.lat,
    lon:             c.lng,            // lng → lon
    density:         c.density,
    stops:           c.stops,
    gyms:            c.gyms,
    rating:          c.rating,
    tags:            c.tags,
    tips:            c.tips   ?? '',
    best:            c.best   ?? '',
    evento:          c.evento ?? '',
    transporte:      c.transporte ?? '',
    // Clima simulado
    condition,
    isExtreme:       false,
    boostedTypes:    CONDITION_TO_TYPES[condition],
    tempC:           Math.round(15 + Math.random() * 20),
    feelsLike:       Math.round(13 + Math.random() * 20),
    humidity:        Math.round(40 + Math.random() * 50),
    windKmh:         Math.round(5  + Math.random() * 30),
    gustKmh:         Math.round(10 + Math.random() * 40),
    localTime:       new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    s2Key:           '',
    accuLocationKey: '',
    weatherIcon:     1,
    timezone:        0,
    updatedAt:       Date.now(),
    weatherImage:    WEATHER_IMAGES[condition],
  }
})

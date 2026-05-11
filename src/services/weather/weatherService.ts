// weatherService.ts
// Mapeos AccuWeather weatherIcon → condiciones base → tipos Pokémon GO
// Sprint 2-6: Evolución desde mock data → API real AccuWeather
// Sprint 7: Mejorar precision (target 95%+ vs PGO oficial)
// Sprint 7 - US-605: Caché geoespacial optimizado (por locationKey)

// Algoritmo puro de clasificacion clima → PGO. Fuente de verdad: weatherClassify.ts (D-042)
export * from './weatherClassify'

import type { WeatherCondition } from './weatherClassify'

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

export const isExtremeWeather = (alerts: unknown[]): boolean =>
  Array.isArray(alerts) && alerts.length > 0

// ─── US-801: Crear snapshots para Firestore ────────────────────────────────────
// Convierte array de HourlyForecastData en array de ForecastSnapshot clasificados

export interface ForecastSnapshot {
  hour: number
  raw_condition_code: number
  raw_condition_text: string
  classified: string
  types: string[]
  temperature_c: number
  wind_kmh: number
  precipitation_mm: number
  humidity_pct: number
  is_windy_override: boolean
}

/**
 * Crear array de 12 ForecastSnapshot desde datos horarios de AccuWeather
 * Cada snapshot es una hora completa con condición clasificada a PGO
 *
 * @param hourlyData Array de HourlyForecastData (máximo 12 elementos)
 * @param startHour Hora inicial para calcular 'hour' de cada snapshot (default 0)
 * @returns Array de ForecastSnapshot (0-12 elementos, típicamente 12)
 */
export function createForecastSnapshots(
  hourlyData: HourlyForecastData[],
  startHour: number = 0
): ForecastSnapshot[] {
  return hourlyData.map((data, index) => {
    const hour = (startHour + index) % 24

    const iconId = data.WeatherIcon
    const windKmh = data.Wind.Speed.Value
    const gustKmh = data.WindGust.Speed.Value
    const precip = data.HasPrecipitation ? 2.5 : 0 // placeholder: 2.5mm si hay lluvia

    // Clasificar condición y obtener tipos Pokémon
    const classified = resolveCondition(iconId, windKmh, gustKmh)
    const types = CONDITION_TO_TYPES[classified]
    const baseCondition = getBaseCondition(iconId)
    const isWindyOverride = classified === 'windy' && baseCondition !== 'windy'

    return {
      hour,
      raw_condition_code: iconId,
      raw_condition_text: WEATHER_TRANSLATIONS[iconId]?.iconText ?? 'Unknown',
      classified,
      types,
      temperature_c: data.Temperature.Value,
      wind_kmh: windKmh,
      precipitation_mm: precip,
      humidity_pct: data.RelativeHumidity,
      is_windy_override: isWindyOverride,
    }
  })
}

// ─── AccuWeather API Functions (Sprint 6) ─────────────────────────────────────

import { getCachedLocationKey, setCachedLocationKey } from '../cache/cacheService'
import type { WeatherData } from '../cache/cacheService'
import { getS2Key } from '../geo/s2Service'
import type { City } from '../../store/useStore'

// En dev: proxy via Vite a backend Nest (5174) para evitar CORS
// En prod: proxy via Vercel (evita CORS desde dominio de producción)
const ACCUWEATHER_BASE = '/api/accuweather'

interface HourlyForecastData {
  WeatherIcon: number
  Temperature: { Value: number }
  RealFeelTemperature: { Value: number }
  RelativeHumidity: number
  Wind: { Speed: { Value: number } }
  WindGust: { Speed: { Value: number } }
  HasPrecipitation: boolean
  Visibility?: { Value: number }  // ← Para detectar FOG (km)
}

export interface LocationData {
  locationKey: string
  timezone: number  // offset en segundos desde UTC
}

export const getAccuWeatherLocationKey = async (
  lat: number,
  lon: number,
  apiKey: string
): Promise<LocationData> => {
  const s2Key = getS2Key(lat, lon)

  // 1. Verificar caché permanente (localStorage)
  const cached = getCachedLocationKey(s2Key)
  if (cached) {
    // Parsear el caché (es un JSON string con {locationKey, timezone})
    try {
      return JSON.parse(cached) as LocationData
    } catch {
      // Si falla el parse, continuar con API
    }
  }

  // 2. Llamar API
  const url = `${ACCUWEATHER_BASE}/locations/v1/cities/geoposition/search` +
    `?apikey=${apiKey}&q=${lat},${lon}&toplevel=true&details=true`

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) {
    throw new Error(`AccuWeather location error: ${response.status}`)
  }

  const data = await response.json()
  const locationKey = data.Key

  // Extraer timezone: AccuWeather retorna TimeZone.GmtOffset en segundos
  const timezoneSeconds = data.TimeZone?.GmtOffset ?? 0

  const locationData: LocationData = {
    locationKey,
    timezone: timezoneSeconds,
  }

  // 3. Cachear permanentemente (como JSON string)
  setCachedLocationKey(s2Key, JSON.stringify(locationData))

  return locationData
}

export const getHourlyForecast = async (
  locationKey: string,
  apiKey: string
): Promise<HourlyForecastData> => {
  const url = `${ACCUWEATHER_BASE}/forecasts/v1/hourly/12hour/${locationKey}` +
    `?apikey=${apiKey}&details=true&metric=true`

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) {
    throw new Error(`AccuWeather forecast error: ${response.status}`)
  }

  const data = await response.json()
  return data[0] // primer slot = hora actual
}

/**
 * Obtener pronóstico completo de 12 horas desde AccuWeather
 * US-801: Para persistencia en Firestore
 *
 * @param locationKey AccuWeather location identifier
 * @param apiKey AccuWeather API key
 * @returns Array de 12 HourlyForecastData (típicamente)
 */
export const getHourlyForecasts = async (
  locationKey: string,
  apiKey: string
): Promise<HourlyForecastData[]> => {
  const url = `${ACCUWEATHER_BASE}/forecasts/v1/hourly/12hour/${locationKey}` +
    `?apikey=${apiKey}&details=true&metric=true`

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) {
    throw new Error(`AccuWeather forecast error: ${response.status}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : [] // retorna array vacío si no es array
}

export const getAlerts = async (
  locationKey: string,
  apiKey: string
): Promise<unknown[]> => {
  try {
    const url = `${ACCUWEATHER_BASE}/alerts/v1/${locationKey}` +
      `?apikey=${apiKey}&details=true`

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return [] // Si falla, sin alertas

    return await response.json()
  } catch {
    return [] // Si falla, sin alertas (no crítico)
  }
}

export const fetchCityWeather = async (
  city: City,
  apiKey: string,
  enableAlerts: boolean = false
): Promise<{ city: City; snapshots: ForecastSnapshot[] }> => {
  try {
    // 1. Obtener location key y timezone
    const { locationKey, timezone } = await getAccuWeatherLocationKey(city.lat, city.lon, apiKey)

    // 2. Fetch forecast (12 horas) + alerts (opcional, si plan lo soporta)
    // US-801: Obtener array completo de 12 horas para Firestore
    const hourlyForecastsPromise = getHourlyForecasts(locationKey, apiKey)
    const alertsPromise = enableAlerts ? getAlerts(locationKey, apiKey) : Promise.resolve([])

    const [hourlyForecasts, alerts] = await Promise.all([
      hourlyForecastsPromise,
      alertsPromise,
    ])

    // 3. Usar primer elemento para datos de UI (actual behavior)
    const forecast = hourlyForecasts[0]
    if (!forecast) {
      throw new Error('No hourly forecast data returned')
    }

    // 4. Crear snapshots para persistencia (US-801)
    // BUG-015 FIX: pasar startHour actual para que snapshots tengan horas correctas
    // Sin esto, todos los snapshots son [0..11] independientemente del momento de creación
    const now = new Date()
    const startHour = (now.getHours() + 1) % 24
    const snapshots = createForecastSnapshots(hourlyForecasts, startHour)

    // 5. Calcular condición y tipos (para City)
    const condition = resolveCondition(
      forecast.WeatherIcon,
      forecast.Wind.Speed.Value,
      forecast.WindGust.Speed.Value
    )
    const boostedTypes = CONDITION_TO_TYPES[condition]
    const isExtreme = isExtremeWeather(alerts)

    // 6. Construir objeto City actualizado
    const weatherData: City = {
      ...city,
      condition,
      boostedTypes,
      isExtreme,
      tempC: forecast.Temperature.Value,
      feelsLike: forecast.RealFeelTemperature.Value,
      humidity: forecast.RelativeHumidity,
      windKmh: forecast.Wind.Speed.Value,
      gustKmh: forecast.WindGust.Speed.Value,
      visibilityKm: forecast.Visibility?.Value ?? 10,  // ← Default 10km si no viene
      weatherIcon: forecast.WeatherIcon,
      accuLocationKey: locationKey,
      timezone,  // ← Ahora se asigna correctamente
      updatedAt: Date.now(),
      weatherImage: `/weather/${condition}.png`,
      // localTime será calculado en useWeather con timezone
    }

    return { city: weatherData, snapshots }
  } catch (error) {
    // Lanzar error para que useWeather lo maneje y muestre estado informativo
    throw new Error(`Failed to fetch weather for ${city.name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Enriquece un City con datos de WeatherData (del caché geoespacial).
 *
 * US-605: Separa responsabilidades:
 * - WeatherData: Datos climáticos por locationKey (compartidos entre ciudades)
 * - City: Identidad única + datos climáticos
 *
 * @param city Ciudad base (sin datos climáticos)
 * @param weatherData Datos climáticos del caché (o null si no disponibles)
 * @returns City enriquecida con datos climáticos
 */
export function enrichCityWithWeatherData(
  city: City,
  weatherData: WeatherData | null
): City {
  if (!weatherData) {
    // Fallback: valores por defecto si caché está vacío
    return {
      ...city,
      condition: 'cloudy',
      boostedTypes: [],
      isExtreme: false,
      tempC: 0,
      feelsLike: 0,
      humidity: 0,
      windKmh: 0,
      gustKmh: 0,
      visibilityKm: 10,
      weatherIcon: 0,
      weatherImage: '/weather/cloudy.png',
      updatedAt: Date.now(),
      timezone: 0,
    }
  }

  // Enriquecer: city-specific fields + weather data
  return {
    ...city,
    ...weatherData,
  }
}

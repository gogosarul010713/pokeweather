// weatherService.ts
// Mapeos AccuWeather weatherIcon → condiciones base → tipos Pokémon GO
// Sprint 2-6: Evolución desde mock data → API real AccuWeather
// Sprint 7: Mejorar precision (target 95%+ vs PGO oficial)
// Sprint 7 - US-605: Caché geoespacial optimizado (por locationKey)

import type { WeatherCondition } from '../../config/weatherImages'

// ─── Traducción AccuWeather WeatherIcon → Clima Pokémon GO ──────────────────
// Referencia: Doc 20 (20-weather-classification-algorithm.md)
// Cada icono AccuWeather (1-44) tiene un clima PGO asignado + flag canWindy.
// canWindy=true: climas "secos" que pueden convertirse en Windy por viento fuerte.
// canWindy=false: precipitación activa (lluvia, nieve, tormentas, niebla).

export interface WeatherTranslation {
  id: number
  iconText: string
  canWindy: boolean
  pgoCondition: WeatherCondition
}

export const WEATHER_TRANSLATIONS: Record<number, WeatherTranslation> = {
  // ── Día (1-32) ──
  1:  { id: 1,  iconText: 'Sunny',                     canWindy: true,  pgoCondition: 'sunny' },
  2:  { id: 2,  iconText: 'Mostly Sunny',              canWindy: true,  pgoCondition: 'sunny' },
  3:  { id: 3,  iconText: 'Partly Sunny',              canWindy: true,  pgoCondition: 'partly' },
  4:  { id: 4,  iconText: 'Intermittent Clouds',       canWindy: true,  pgoCondition: 'partly' },
  5:  { id: 5,  iconText: 'Hazy Sunshine',             canWindy: true,  pgoCondition: 'cloudy' },
  6:  { id: 6,  iconText: 'Mostly Cloudy',             canWindy: true,  pgoCondition: 'cloudy' },
  7:  { id: 7,  iconText: 'Cloudy',                    canWindy: true,  pgoCondition: 'cloudy' },
  8:  { id: 8,  iconText: 'Dreary (Overcast)',         canWindy: true,  pgoCondition: 'cloudy' },
  // 9, 10: No existen en AccuWeather
  11: { id: 11, iconText: 'Fog',                       canWindy: false, pgoCondition: 'fog' },
  12: { id: 12, iconText: 'Showers',                   canWindy: false, pgoCondition: 'rain' },
  13: { id: 13, iconText: 'Mostly Cloudy w/ Showers',  canWindy: false, pgoCondition: 'cloudy' },
  14: { id: 14, iconText: 'Partly Sunny w/ Showers',   canWindy: false, pgoCondition: 'partly' },
  15: { id: 15, iconText: 'T-Storms',                  canWindy: false, pgoCondition: 'rain' },
  16: { id: 16, iconText: 'Mostly Cloudy w/ T-Storms', canWindy: false, pgoCondition: 'cloudy' },
  17: { id: 17, iconText: 'Partly Sunny w/ T-Storms',  canWindy: false, pgoCondition: 'partly' },
  18: { id: 18, iconText: 'Rain',                      canWindy: false, pgoCondition: 'rain' },
  19: { id: 19, iconText: 'Flurries',                  canWindy: false, pgoCondition: 'snow' },
  20: { id: 20, iconText: 'Mostly Cloudy w/ Flurries', canWindy: false, pgoCondition: 'cloudy' },
  21: { id: 21, iconText: 'Partly Sunny w/ Flurries',  canWindy: false, pgoCondition: 'partly' },
  22: { id: 22, iconText: 'Snow',                      canWindy: false, pgoCondition: 'snow' },
  23: { id: 23, iconText: 'Mostly Cloudy w/ Snow',     canWindy: false, pgoCondition: 'cloudy' },
  24: { id: 24, iconText: 'Ice',                       canWindy: false, pgoCondition: 'snow' },
  25: { id: 25, iconText: 'Sleet',                     canWindy: false, pgoCondition: 'snow' },
  26: { id: 26, iconText: 'Freezing Rain',             canWindy: false, pgoCondition: 'rain' },
  // 27, 28: No existen en AccuWeather
  29: { id: 29, iconText: 'Rain and Snow',             canWindy: false, pgoCondition: 'rain' },
  30: { id: 30, iconText: 'Hot',                       canWindy: true,  pgoCondition: 'sunny' },
  31: { id: 31, iconText: 'Cold',                      canWindy: true,  pgoCondition: 'snow' },
  32: { id: 32, iconText: 'Windy',                     canWindy: true,  pgoCondition: 'windy' },
  // ── Noche (33-44) ──
  33: { id: 33, iconText: 'Clear',                     canWindy: true,  pgoCondition: 'sunny' },
  34: { id: 34, iconText: 'Mostly Clear',              canWindy: true,  pgoCondition: 'sunny' },
  35: { id: 35, iconText: 'Partly Cloudy',             canWindy: true,  pgoCondition: 'partly' },
  36: { id: 36, iconText: 'Intermittent Clouds',       canWindy: true,  pgoCondition: 'partly' },
  37: { id: 37, iconText: 'Hazy Moonlight',            canWindy: true,  pgoCondition: 'cloudy' },
  38: { id: 38, iconText: 'Mostly Cloudy',             canWindy: true,  pgoCondition: 'cloudy' },
  39: { id: 39, iconText: 'Partly Cloudy w/ Showers',  canWindy: false, pgoCondition: 'partly' },
  40: { id: 40, iconText: 'Mostly Cloudy w/ Showers',  canWindy: false, pgoCondition: 'cloudy' },
  41: { id: 41, iconText: 'Partly Cloudy w/ T-Storms', canWindy: false, pgoCondition: 'partly' },
  42: { id: 42, iconText: 'Mostly Cloudy w/ T-Storms', canWindy: false, pgoCondition: 'cloudy' },
  43: { id: 43, iconText: 'Mostly Cloudy w/ Flurries', canWindy: false, pgoCondition: 'snow' },
  44: { id: 44, iconText: 'Mostly Cloudy w/ Snow',     canWindy: false, pgoCondition: 'snow' },
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

// Umbrales de viento para override a Windy (Doc 20)
const WINDY_WIND_KMH = 29    // km/h - viento sostenido
const WINDY_GUST_KMH = 31    // km/h - ráfagas

export const getBaseCondition = (iconId: number): WeatherCondition => {
  const translation = WEATHER_TRANSLATIONS[iconId]
  if (!translation) {
    console.warn(`⚠️ WeatherIcon ${iconId} no reconocido, fallback a cloudy`)
    return 'cloudy'
  }
  return translation.pgoCondition
}

export const resolveCondition = (
  iconId: number,
  windKmh: number,
  gustKmh: number
): WeatherCondition => {
  const base = getBaseCondition(iconId)
  const translation = WEATHER_TRANSLATIONS[iconId]

  // WINDY reemplaza cualquier clima si:
  // 1. El icono AccuWeather permite override por viento (translation.canWindy = true)
  // 2. El viento supera los umbrales (Doc 20: > 29 km/h o > 31 km/h ráfagas)
  //
  // Iconos con canWindy=false (precipitación activa, FOG): nunca se convierten en WINDY
  // Iconos con canWindy=true (climas secos): pueden convertirse en WINDY si hay viento fuerte
  if (translation && translation.canWindy) {
    const isWindy = windKmh > WINDY_WIND_KMH || gustKmh > WINDY_GUST_KMH
    if (isWindy) return 'windy'
  }

  return base
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

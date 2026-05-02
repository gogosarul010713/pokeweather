import axios from 'axios'
import admin from 'firebase-admin'

// Tipos
interface CityData {
  id: string
  name: string
  country: string
  region: string
  accuLocationKey: string
  lat: number
  lon: number
  timezone: number
}

interface WeatherSnapshot {
  hour: number
  condition: string
  tempC: number
  windKmh: number
  humidity: number
  iconCode: number
}

// Ciudades sincronizadas con src/data/pokedensity-cities.json
// IDs generados con mismo algoritmo que transformCitiesToCityFormat: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
// accuLocationKey obtenidos via AccuWeather geoposition API con coordenadas del JSON
const CITIES: CityData[] = [
  {
    id: 'pier-39-san-francisco',
    name: 'Pier 39, San Francisco',
    country: 'EE.UU.',
    region: 'america',
    accuLocationKey: '2628254',
    lat: 37.8086,
    lon: -122.4098,
    timezone: -8,
  },
  {
    id: 'times-square-midtown-nyc',
    name: 'Times Square / Midtown, NYC',
    country: 'EE.UU.',
    region: 'america',
    accuLocationKey: '2627484',
    lat: 40.7552,
    lon: -73.983,
    timezone: -5,
  },
  {
    id: 'zaragoza-centro',
    name: 'Zaragoza Centro',
    country: 'España',
    region: 'europa',
    accuLocationKey: '306788',
    lat: 41.661012,
    lon: -0.893407,
    timezone: 1,
  },
  {
    id: 'auckland-waterfront',
    name: 'Auckland Waterfront',
    country: 'Nueva Zelanda',
    region: 'oceania',
    accuLocationKey: '3590462',
    lat: -36.852095,
    lon: 174.76318,
    timezone: 12,
  },
  {
    id: 'itaewon-jung-gu-se-l',
    name: 'Itaewon / Jung-gu, Seúl',
    country: 'Corea del Sur',
    region: 'asia',
    accuLocationKey: '3430003',
    lat: 37.567308,
    lon: 126.977133,
    timezone: 9,
  },
]

/**
 * Fetch 12-hour forecast from AccuWeather API
 * Calls: https://api.accuweather.com/forecasts/v1/hourly/12hour/{locationKey}
 */
async function fetchAccuWeatherForecast(
  locationKey: string
): Promise<WeatherSnapshot[]> {
  const apiKey = process.env.ACCUWEATHER_KEY
  if (!apiKey) {
    throw new Error('ACCUWEATHER_KEY environment variable not set')
  }

  try {
    const url = `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationKey}`
    const response = await axios.get(url, {
      params: {
        apikey: apiKey,
        details: true,
        metric: true,
      },
      timeout: 10000,
    })

    // Map AccuWeather response to WeatherSnapshot
    const snapshots: WeatherSnapshot[] = response.data.map(
      (item: any, index: number) => ({
        hour: index,
        condition: mapAccuWeatherCondition(item.IconPhrase),
        tempC: item.Temperature.Value,
        windKmh: item.Wind.Speed.Value,
        humidity: item.RelativeHumidity || 0,
        iconCode: item.WeatherIcon,
      })
    )

    return snapshots
  } catch (error) {
    console.error(`Error fetching forecast for ${locationKey}:`, error)
    throw error
  }
}

/**
 * Map AccuWeather IconPhrase to weather condition
 */
function mapAccuWeatherCondition(phrase: string): string {
  const lower = phrase.toLowerCase()

  if (lower.includes('sunny') || lower.includes('clear')) return 'sunny'
  if (lower.includes('cloud')) return 'cloudy'
  if (lower.includes('part') || lower.includes('partly')) return 'partly'
  if (lower.includes('rain') || lower.includes('drizzle')) return 'rain'
  if (lower.includes('snow') || lower.includes('sleet')) return 'snow'
  if (lower.includes('fog') || lower.includes('haze')) return 'fog'
  if (lower.includes('wind')) return 'windy'

  return 'cloudy' // Default
}

/**
 * Calculate main condition from first 3 hours snapshots
 */
function calculateCondition(snapshots: WeatherSnapshot[]): string {
  if (snapshots.length === 0) return 'sunny'

  const firstThree = snapshots.slice(0, 3)
  const conditions = firstThree.map((s) => s.condition)

  // Most common condition wins
  const counts: { [key: string]: number } = {}
  conditions.forEach((c) => {
    counts[c] = (counts[c] || 0) + 1
  })

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

/**
 * Get local time for user's machine (for persistency in Firestore)
 */
function getLocalTimeUser(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const mins = String(now.getMinutes()).padStart(2, '0')
  return `${day}/${month} ${hours}:${mins}`
}

/**
 * Get date_hour key (YYYY-MM-DD-HH)
 * Uses current hour (cron runs AT HH:00, so now IS the forecast hour)
 */
function getDateHourKey(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const hour = String(now.getUTCHours()).padStart(2, '0')

  return `${year}-${month}-${day}-${hour}`
}

/**
 * Save city forecast to Firestore
 */
async function saveCityForecast(
  db: admin.firestore.Firestore,
  city: CityData,
  snapshots: WeatherSnapshot[]
): Promise<void> {
  const dateHour = getDateHourKey()
  const docRef = db
    .collection('city_weather')
    .doc(city.id)
    .collection('forecasts')
    .doc(dateHour)

  const calculatedCondition = calculateCondition(snapshots)

  const forecastDoc = {
    city_id: city.id,
    city_name: city.name,
    country: city.country,
    region: city.region,
    lat: city.lat,
    lon: city.lon,
    accuLocationKey: city.accuLocationKey,
    date_hour: dateHour,
    snapshots: snapshots,
    calculated_condition: calculatedCondition,
    timezone: city.timezone,
    local_time_user: getLocalTimeUser(),
    created_at: admin.firestore.Timestamp.now(),
    ttl: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ),
  }

  await docRef.set(forecastDoc)
  console.log(`Saved forecast for ${city.name} (${dateHour})`)
}

/**
 * Main sync logic (used by both scheduled and manual triggers)
 */
export async function syncWeatherLogic(): Promise<{
  success: boolean
  citiesUpdated: number
  failedCities: string[]
}> {
  const db = admin.firestore()
  const failedCities: string[] = []
  let successCount = 0

  console.log(`Starting sync for ${CITIES.length} cities...`)

  // Fetch all cities in parallel
  const fetchPromises = CITIES.map(async (city) => {
    try {
      const snapshots = await fetchAccuWeatherForecast(city.accuLocationKey)

      // Only save if we got valid snapshots
      if (snapshots.length > 0) {
        await saveCityForecast(db, city, snapshots)
        successCount++
      } else {
        failedCities.push(`${city.name} (no snapshots)`)
      }
    } catch (error) {
      failedCities.push(`${city.name} (${error instanceof Error ? error.message : 'unknown error'})`)
      console.error(`Failed to sync ${city.name}:`, error)
    }
  })

  await Promise.all(fetchPromises)

  console.log(`Sync complete: ${successCount}/${CITIES.length} cities updated`)
  if (failedCities.length > 0) {
    console.warn(`Failed cities: ${failedCities.join(', ')}`)
  }

  return {
    success: failedCities.length === 0,
    citiesUpdated: successCount,
    failedCities,
  }
}

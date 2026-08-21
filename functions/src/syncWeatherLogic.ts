import axios from 'axios'
import admin from 'firebase-admin'
import { resolveCondition } from './shared/weatherClassify.js'

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
  epoch_dt: number
  icon_code: number
  icon_phrase: string
  temp_c: number
  wind_kmh: number
  gust_kmh: number
  humidity: number
  has_precipitation: boolean
  pgo_condition: string
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

    // Map AccuWeather response to raw WeatherSnapshot (sin clasificacion)
    type AccuWeatherHour = {
      EpochDateTime: number
      WeatherIcon: number; IconPhrase: string; HasPrecipitation: boolean
      RelativeHumidity: number
      Temperature: { Value: number }
      Wind: { Speed: { Value: number } }
      WindGust?: { Speed?: { Value?: number } }
    }
    const snapshots: WeatherSnapshot[] = response.data.map(
      (item: AccuWeatherHour, index: number) => {
        const windKmh = item.Wind.Speed.Value
        const gustKmh = item.WindGust?.Speed?.Value ?? windKmh
        return {
          hour: index,
          epoch_dt: item.EpochDateTime,
          icon_code: item.WeatherIcon,
          icon_phrase: item.IconPhrase || '',
          temp_c: item.Temperature.Value,
          wind_kmh: windKmh,
          gust_kmh: gustKmh,
          humidity: item.RelativeHumidity || 0,
          has_precipitation: item.HasPrecipitation ?? false,
          pgo_condition: resolveCondition(item.WeatherIcon, windKmh, gustKmh),
        }
      }
    )

    return snapshots
  } catch (error) {
    console.error(`Error fetching forecast for ${locationKey}:`, error)
    throw error
  }
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
 * BUG-020: Devuelve el inicio (UTC) del slot horario representado por dateHour.
 * Permite que `created_at` quede pegado al slot, no al momento del write.
 */
function startOfSlotUtc(dateHour: string): Date {
  const [year, month, day, hour] = dateHour.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0))
}

/**
 * Save city forecast to Firestore
 *
 * D-039 + Opcion A real-time:
 * - Escribe RAW en subcoleccion /city_weather/{id}/forecasts/{date_hour}
 * - Escribe SUMMARY en doc raiz /city_weather/{id} con updatedAt
 *   El summary doc es solo un trigger para useFirestoreSync. NO contiene datos
 *   clasificados — el frontend los obtiene de la subcoleccion via getWeatherFromFirestore().
 */
async function saveCityForecast(
  db: admin.firestore.Firestore,
  city: CityData,
  snapshots: WeatherSnapshot[]
): Promise<void> {
  const dateHour = getDateHourKey()
  const now = admin.firestore.Timestamp.now()

  // BUG-020: created_at = inicio del slot, no momento del write.
  // Garantiza que la columna "Hora MX" muestra siempre HH:00, sin importar
  // si la CF corre con latencia o si el slot se reescribe.
  const slotStart = admin.firestore.Timestamp.fromDate(startOfSlotUtc(dateHour))

  const forecastRef = db
    .collection('city_weather')
    .doc(city.id)
    .collection('forecasts')
    .doc(dateHour)

  // Doc raw en subcoleccion (source of truth para clasificacion)
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
    timezone: city.timezone,
    target_hour: ((parseInt(dateHour.split('-')[3], 10) + city.timezone + 1) % 24 + 24) % 24,
    local_time_user: getLocalTimeUser(),
    created_at: slotStart,
    last_written_at: now,
    ttl: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ),
  }

  // Summary doc en raiz (trigger para listener real-time)
  const summaryRef = db.collection('city_weather').doc(city.id)
  const summaryDoc = {
    city_id: city.id,
    city_name: city.name,
    last_date_hour: dateHour,
    updatedAt: now.toMillis(),
  }

  // Batch atomico: ambas escrituras o ninguna
  const batch = db.batch()
  batch.set(forecastRef, forecastDoc)
  batch.set(summaryRef, summaryDoc, { merge: true })
  await batch.commit()

  console.log(`Saved forecast + summary for ${city.name} (${dateHour})`)
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

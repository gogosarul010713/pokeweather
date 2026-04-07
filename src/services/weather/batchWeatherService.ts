// batchWeatherService.ts
// Sprint 6: Procesa múltiples ciudades en batches paralelos.
// Reduce consumo de API mediante parallelización + rate limiting.
// Sprint 7 - US-605: Caché geoespacial optimizado (por locationKey)

import type { City } from '../../store/useStore'
import { fetchCityWeather, enrichCityWithWeatherData, getAccuWeatherLocationKey } from './weatherService'
import { getCachedWeather, setCachedWeather } from '../cache/cacheService'

export interface BatchConfig {
  parallelLimit: number  // Ciudades simultáneas (default: 5)
  delayMs: number        // Espera entre batches (default: 200ms)
  cacheTTL: number       // TTL en ms (default: 60 min)
  retryOnError: boolean  // Reintentar en fallo (default: true)
  maxRetries: number     // # máx reintentos (default: 2)
  ignoreCache?: boolean  // Ignorar caché y fetchar siempre API (default: false) — para auto-refresh
  enableAlerts?: boolean // Incluir endpoint /alerts/v1/ (default: false — Core Weather Starter no soporta)
}

export interface BatchMetrics {
  totalCalls: number     // API calls realizadas
  cachedHits: number     // Respuestas desde caché
  executionMs: number    // Tiempo total en ms
  accuracy: number       // % de precisión vs PGO (si disponible)
}

export interface BatchResult {
  successful: City[]
  failed: Array<{ city: string; error: string }>
  metrics: BatchMetrics
}

const DEFAULT_CONFIG: BatchConfig = {
  parallelLimit: 5,
  delayMs: 200,
  cacheTTL: 60 * 60 * 1000,  // 60 minutos
  retryOnError: true,
  maxRetries: 2,
}

/**
 * Procesa un array de ciudades en batches paralelos.
 *
 * Ejemplo: 94 ciudades con limit=5:
 * - Batch 1: 5 ciudades paralelo
 * - Esperar 200ms
 * - Batch 2: 5 ciudades paralelo
 * - ... (19 batches totales)
 *
 * @param cities Array de ciudades a procesar
 * @param apiKey API key de AccuWeather
 * @param config Configuración de batch (opcional)
 * @returns Resultado con ciudades exitosas, fallos, y métricas
 */
export async function loadCitiesInBatch(
  cities: City[],
  apiKey: string,
  config: Partial<BatchConfig> = {}
): Promise<BatchResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const startTime = performance.now()

  const successful: City[] = []
  const failed: Array<{ city: string; error: string }> = []
  let cachedHits = 0
  let totalCalls = 0

  // Procesar en batches
  for (let i = 0; i < cities.length; i += finalConfig.parallelLimit) {
    const batch = cities.slice(i, i + finalConfig.parallelLimit)

    // Procesar batch en paralelo
    const batchPromises = batch.map(async (city) => {
      try {
        // 1. Obtener locationKey y timezone (siempre caché en localStorage — rápido)
        const { locationKey } = await getAccuWeatherLocationKey(city.lat, city.lon, apiKey)

        // 2. Intentar obtener del caché por locationKey (US-605: Caché geoespacial)
        // Si ignoreCache=true, saltamos caché (para auto-refresh a HH:00)
        const cached = finalConfig.ignoreCache
          ? null
          : await getCachedWeather(locationKey)

        if (cached) {
          cachedHits++
          // Enriquecer: city-specific fields + weather data
          const enrichedCity = enrichCityWithWeatherData(
            { ...city, accuLocationKey: locationKey },
            cached
          )
          return {
            success: true as const,
            data: enrichedCity,
          }
        }

        // 3. Si no está en caché, fetchar de API
        const weatherData = await fetchCityWeatherWithRetry(
          city,
          apiKey,
          finalConfig.maxRetries,
          finalConfig.enableAlerts ?? false
        )

        // 4. Cachear resultado por locationKey (NO por city.id)
        // Beneficio US-605: Dos ciudades con mismo locationKey reutilizan caché
        const { accuLocationKey, ...cacheableData } = weatherData
        await setCachedWeather(accuLocationKey, cacheableData)

        // Contar endpoints: location + forecast + (alerts si está habilitado)
        totalCalls += finalConfig.enableAlerts ? 3 : 2

        return { success: true as const, data: weatherData }
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })

    const batchResults = await Promise.all(batchPromises)

    // Separar exitosos de fallos
    batchResults.forEach((result, idx) => {
      const city = batch[idx]
      if (!city) return

      if (result.success === true) {
        successful.push(result.data)
      } else {
        failed.push({ city: city.name, error: result.error || 'Unknown error' })
      }
    })

    // Rate limiting: esperar antes del siguiente batch
    if (i + finalConfig.parallelLimit < cities.length) {
      await sleep(finalConfig.delayMs)
    }
  }

  const endTime = performance.now()

  return {
    successful,
    failed,
    metrics: {
      totalCalls,
      cachedHits,
      executionMs: Math.round(endTime - startTime),
      accuracy: 0,  // Será calculado en tests
    },
  }
}

/**
 * Fetch con reintentos automáticos.
 * Si falla, reintenta hasta maxRetries veces.
 */
async function fetchCityWeatherWithRetry(
  city: City,
  apiKey: string,
  maxRetries: number,
  enableAlerts: boolean = false,
  attempt: number = 0
): Promise<City> {
  try {
    return await fetchCityWeather(city, apiKey, enableAlerts)
  } catch (error) {
    if (attempt < maxRetries) {
      // Esperar un poco antes de reintentar (backoff exponencial)
      await sleep(Math.pow(2, attempt) * 100)
      return fetchCityWeatherWithRetry(city, apiKey, maxRetries, enableAlerts, attempt + 1)
    }
    throw error
  }
}

/**
 * Helper: sleep con delay en ms
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calcula % de precisión comparando contra data esperada
 * (usado en testing contra Pokémon GO)
 */
export function calculateAccuracy(
  results: City[],
  expected: Array<{ name: string; condition: string }>
): number {
  if (expected.length === 0) return 0

  const matches = results.filter((city) => {
    const exp = expected.find((e) => e.name === city.name)
    return exp && city.condition === exp.condition
  })

  return Math.round((matches.length / expected.length) * 100)
}

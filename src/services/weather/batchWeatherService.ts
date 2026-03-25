// batchWeatherService.ts
// Sprint 6: Procesa múltiples ciudades en batches paralelos.
// Reduce consumo de API mediante parallelización + rate limiting.

import type { City } from '../../store/useStore'
import { fetchCityWeather } from './weatherService'
import { getCachedWeather, setCachedWeather } from '../cache/cacheService'

export interface BatchConfig {
  parallelLimit: number  // Ciudades simultáneas (default: 5)
  delayMs: number        // Espera entre batches (default: 200ms)
  cacheTTL: number       // TTL en ms (default: 60 min)
  retryOnError: boolean  // Reintentar en fallo (default: true)
  maxRetries: number     // # máx reintentos (default: 2)
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
        // 1. Intentar obtener del caché (por city.id, NO por s2Key)
        const cached = await getCachedWeather(city.id)
        if (cached) {
          cachedHits++
          // Preservar id/name/lat/lon del city original — nunca del caché
          return {
            success: true as const,
            data: { ...(cached as Partial<City>), id: city.id, name: city.name, lat: city.lat, lon: city.lon, s2Key: city.s2Key } as City,
          }
        }

        // 2. Si no está en caché, fetchar de API
        const weatherData = await fetchCityWeatherWithRetry(
          city,
          apiKey,
          finalConfig.maxRetries
        )

        // 3. Cachear resultado (por city.id para evitar colisiones entre ciudades con mismo s2Key)
        await setCachedWeather(city.id, weatherData)
        totalCalls += 3  // 3 endpoints: location + forecast + alerts

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
  attempt: number = 0
): Promise<City> {
  try {
    return await fetchCityWeather(city, apiKey)
  } catch (error) {
    if (attempt < maxRetries) {
      // Esperar un poco antes de reintentar (backoff exponencial)
      await sleep(Math.pow(2, attempt) * 100)
      return fetchCityWeatherWithRetry(city, apiKey, maxRetries, attempt + 1)
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

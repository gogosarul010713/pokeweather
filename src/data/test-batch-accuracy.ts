/**
 * test-batch-accuracy.ts
 * Valida batch service sin consumir API calls reales.
 *
 * Uso:
 *   import { testBatchAccuracy } from './test-batch-accuracy'
 *   testBatchAccuracy().then(console.log)
 */

import type { City } from './useStore'
import { loadCitiesInBatch, calculateAccuracy } from './batchWeatherService'

/**
 * 5 ciudades random para test
 * Con condiciones esperadas vs Pokémon GO
 */
interface TestCity extends City {
  expected: string
}

const TEST_CITIES: TestCity[] = [
  {
    id: 'test-1',
    name: 'Shibuya, Tokio',
    lat: 35.6595,
    lon: 139.7004,
    country: 'Japón',
    flag: '🇯🇵',
    region: 'asia',
    density: 100,
    stops: 50,
    gyms: 25,
    rating: 5,
    tags: [],
    tips: 'Test city',
    best: 'Testing',
    evento: '',
    transporte: '',
    timezone: 32400,
    condition: 'sunny',
    isExtreme: false,
    boostedTypes: [],
    tempC: 20,
    feelsLike: 20,
    humidity: 60,
    windKmh: 10,
    gustKmh: 15,
    localTime: '12:00',
    s2Key: 'test-s2-1',
    accuLocationKey: '328409_PC',
    weatherIcon: 1,
    updatedAt: Date.now(),
    weatherImage: '/weather/sunny.webp',
    expected: 'sunny',
  },
  {
    id: 'test-2',
    name: 'Gangnam, Seúl',
    lat: 37.4979,
    lon: 127.0276,
    country: 'Corea del Sur',
    flag: '🇰🇷',
    region: 'asia',
    density: 100,
    stops: 50,
    gyms: 25,
    rating: 5,
    tags: [],
    tips: 'Test city',
    best: 'Testing',
    evento: '',
    transporte: '',
    timezone: 32400,
    condition: 'cloudy',
    isExtreme: false,
    boostedTypes: [],
    tempC: 18,
    feelsLike: 18,
    humidity: 65,
    windKmh: 15,
    gustKmh: 20,
    localTime: '12:00',
    s2Key: 'test-s2-2',
    accuLocationKey: '327164_PC',
    weatherIcon: 8,
    updatedAt: Date.now(),
    weatherImage: '/weather/cloudy.webp',
    expected: 'cloudy',
  },
  {
    id: 'test-3',
    name: 'Sapporo',
    lat: 43.0642,
    lon: 141.3469,
    country: 'Japón',
    flag: '🇯🇵',
    region: 'asia',
    density: 100,
    stops: 50,
    gyms: 25,
    rating: 5,
    tags: [],
    tips: 'Test city',
    best: 'Testing',
    evento: '',
    transporte: '',
    timezone: 32400,
    condition: 'windy',
    isExtreme: false,
    boostedTypes: [],
    tempC: 15,
    feelsLike: 12,
    humidity: 70,
    windKmh: 30,
    gustKmh: 40,
    localTime: '12:00',
    s2Key: 'test-s2-3',
    accuLocationKey: '331289_PC',
    weatherIcon: 35,
    updatedAt: Date.now(),
    weatherImage: '/weather/windy.webp',
    expected: 'windy',
  },
  {
    id: 'test-4',
    name: 'Yokohama',
    lat: 35.4437,
    lon: 139.6380,
    country: 'Japón',
    flag: '🇯🇵',
    region: 'asia',
    density: 100,
    stops: 50,
    gyms: 25,
    rating: 5,
    tags: [],
    tips: 'Test city',
    best: 'Testing',
    evento: '',
    transporte: '',
    timezone: 32400,
    condition: 'partly',
    isExtreme: false,
    boostedTypes: [],
    tempC: 22,
    feelsLike: 22,
    humidity: 55,
    windKmh: 12,
    gustKmh: 18,
    localTime: '12:00',
    s2Key: 'test-s2-4',
    accuLocationKey: '330156_PC',
    weatherIcon: 6,
    updatedAt: Date.now(),
    weatherImage: '/weather/partly.webp',
    expected: 'partly',
  },
  {
    id: 'test-5',
    name: 'Nagoya',
    lat: 35.1815,
    lon: 136.9066,
    country: 'Japón',
    flag: '🇯🇵',
    region: 'asia',
    density: 100,
    stops: 50,
    gyms: 25,
    rating: 5,
    tags: [],
    tips: 'Test city',
    best: 'Testing',
    evento: '',
    transporte: '',
    timezone: 32400,
    condition: 'rain',
    isExtreme: false,
    boostedTypes: [],
    tempC: 16,
    feelsLike: 16,
    humidity: 80,
    windKmh: 18,
    gustKmh: 25,
    localTime: '12:00',
    s2Key: 'test-s2-5',
    accuLocationKey: '326810_PC',
    weatherIcon: 12,
    updatedAt: Date.now(),
    weatherImage: '/weather/rainy.webp',
    expected: 'rainy',
  },
]

export interface TestResult {
  status: 'success' | 'error'
  totalTests: number
  passed: number
  failed: number
  citiesProcessed: number
  cachedHits: number
  apiCallsUsed: number
  accuracy: number
  executionMs: number
  details: Array<{
    city: string
    status: 'pass' | 'fail' | 'error'
    condition?: string
    expected?: string
    reason?: string
  }>
}

/**
 * Ejecuta tests de precisión del batch service
 */
export async function testBatchAccuracy(): Promise<TestResult> {
  console.log('🧪 Iniciando test de batch accuracy...')

  const expected = TEST_CITIES.map((c) => ({
    name: c.name,
    condition: c.expected,
  }))

  try {
    // Ejecutar batch (SIN API KEY activa = mock mode)
    const apiKey = import.meta.env.VITE_ACCUWEATHER_KEY || 'MOCK'

    const result = await loadCitiesInBatch(TEST_CITIES, apiKey, {
      parallelLimit: 5,
      delayMs: 200,
      retryOnError: true,
      maxRetries: 1,
    })

    // Analizar resultados
    const details: TestResult['details'] = []
    let passed = 0
    let failed = 0

    result.successful.forEach((city) => {
      const exp = expected.find((e) => e.name === city.name)
      if (!exp) {
        details.push({
          city: city.name,
          status: 'error',
          reason: 'No expected data found',
        })
        failed++
        return
      }

      const isAccurate = city.condition === exp.condition
      if (isAccurate) {
        details.push({
          city: city.name,
          status: 'pass',
          condition: city.condition,
          expected: exp.condition,
        })
        passed++
      } else {
        details.push({
          city: city.name,
          status: 'fail',
          condition: city.condition,
          expected: exp.condition,
          reason: `Mismatch: got ${city.condition}, expected ${exp.condition}`,
        })
        failed++
      }
    })

    // Fallidos en batch
    result.failed.forEach((fail) => {
      details.push({
        city: fail.city,
        status: 'error',
        reason: fail.error,
      })
      failed++
    })

    const accuracy = calculateAccuracy(
      result.successful,
      expected.filter((e) => result.successful.some((c) => c.name === e.name))
    )

    const testResult: TestResult = {
      status: failed === 0 ? 'success' : 'error',
      totalTests: TEST_CITIES.length,
      passed,
      failed,
      citiesProcessed: result.successful.length,
      cachedHits: result.metrics.cachedHits,
      apiCallsUsed: result.metrics.totalCalls,
      accuracy,
      executionMs: result.metrics.executionMs,
      details,
    }

    // Print results
    printTestResults(testResult)

    return testResult
  } catch (error) {
    console.error('❌ Test error:', error)
    return {
      status: 'error',
      totalTests: TEST_CITIES.length,
      passed: 0,
      failed: TEST_CITIES.length,
      citiesProcessed: 0,
      cachedHits: 0,
      apiCallsUsed: 0,
      accuracy: 0,
      executionMs: 0,
      details: [
        {
          city: 'All',
          status: 'error',
          reason: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    }
  }
}

/**
 * Imprime resultados formateados
 */
function printTestResults(result: TestResult): void {
  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  🧪 BATCH ACCURACY TEST RESULTS')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')
  console.log(`Status:           ${result.status === 'success' ? '✅' : '❌'} ${result.status.toUpperCase()}`)
  console.log(`Ciudades:         ${result.citiesProcessed}/${result.totalTests}`)
  console.log(`Precisión:        ${result.accuracy}%`)
  console.log(`Cache hits:       ${result.cachedHits}`)
  console.log(`API calls:        ${result.apiCallsUsed}`)
  console.log(`Tiempo total:     ${result.executionMs}ms`)
  console.log('')
  console.log('Resultados por ciudad:')
  console.log('───────────────────────────────────────────────────────────────')

  result.details.forEach((detail) => {
    const icon =
      detail.status === 'pass'
        ? '✅'
        : detail.status === 'fail'
          ? '⚠️'
          : '❌'

    console.log(`${icon} ${detail.city}`)
    if (detail.condition && detail.expected) {
      console.log(`   Got: ${detail.condition} | Expected: ${detail.expected}`)
    }
    if (detail.reason) {
      console.log(`   Reason: ${detail.reason}`)
    }
  })

  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')

  // Log para console si falla algo
  if (result.status === 'error') {
    console.warn(
      '⚠️ Test no pasó. Ver detalles arriba. ' +
      'Esto es esperado en mock mode sin AccuWeather API key real.'
    )
  } else {
    console.log('🎉 ¡Test completado exitosamente!')
  }
}

/**
 * Export para testing manual
 * En console:
 *   import { testBatchAccuracy } from 'src/data/test-batch-accuracy.ts'
 *   await testBatchAccuracy()
 */
export default testBatchAccuracy

/**
 * Tests para cacheService — funciones de ForecastDoc
 * US-1008-B: Caché local de pronósticos
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  getForecastCache,
  setForecastCache,
  mergeForecastDocs,
  cleanExpiredForecastDocs,
  getLastSyncTimestamp,
  setLastSyncTimestamp,
} from './cacheService'
import type { ForecastDoc } from '../firebase/firebaseWeatherService'

// Mock de idb-keyval
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  clear: vi.fn(),
}))

import { get as idbGet, set as idbSet } from 'idb-keyval'

const mockForecastDoc = (
  city_id: string,
  date_hour: string,
  calculated_condition: string = 'Sunny'
): ForecastDoc => ({
  city_id,
  city_name: 'Test City',
  country: 'Test Country',
  region: 'test',
  lat: 0,
  lon: 0,
  date_hour,
  snapshots: [],
  calculated_condition,
  timezone: 0,
  local_time_user: '01/01 12:00',
  ttl: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  created_at: new Date(),
})

const mockForecastDocWithAge = (ageMs: number): ForecastDoc => ({
  ...mockForecastDoc('city-1', '2026-04-20-10'),
  created_at: new Date(Date.now() - ageMs),
})

describe('cacheService — ForecastDoc', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getForecastCache', () => {
    test('retorna [] si no hay datos', async () => {
      vi.mocked(idbGet).mockResolvedValue(undefined)
      expect(await getForecastCache()).toEqual([])
    })

    test('retorna datos si existen en IndexedDB', async () => {
      const docs = [mockForecastDoc('city-1', '2026-04-20-10')]
      vi.mocked(idbGet).mockResolvedValue(docs)
      expect(await getForecastCache()).toEqual(docs)
    })

    test('maneja errores silenciosamente', async () => {
      vi.mocked(idbGet).mockRejectedValue(new Error('IndexedDB error'))
      expect(await getForecastCache()).toEqual([])
    })
  })

  describe('setForecastCache', () => {
    test('persiste array en IndexedDB', async () => {
      const docs = [mockForecastDoc('city-1', '2026-04-20-10')]
      await setForecastCache(docs)
      expect(idbSet).toHaveBeenCalledWith('pwe-forecast-cache', docs)
    })

    test('maneja errores silenciosamente', async () => {
      vi.mocked(idbSet).mockRejectedValue(new Error('IndexedDB error'))
      await setForecastCache([mockForecastDoc('city-1', '2026-04-20-10')])
      // No debe lanzar error
      expect(true).toBe(true)
    })
  })

  describe('mergeForecastDocs', () => {
    test('deduplicación: doc existente se actualiza sin duplicar', () => {
      const old = mockForecastDoc('city-1', '2026-04-20-10', 'Sunny')
      const updated = mockForecastDoc('city-1', '2026-04-20-10', 'Rainy')
      const result = mergeForecastDocs([old], [updated])

      expect(result).toHaveLength(1)
      expect(result[0].calculated_condition).toBe('Rainy')
    })

    test('doc nuevo se agrega', () => {
      const a = mockForecastDoc('city-1', '2026-04-20-10')
      const b = mockForecastDoc('city-2', '2026-04-20-10')
      const result = mergeForecastDocs([a], [b])

      expect(result).toHaveLength(2)
    })

    test('incoming tiene precedencia sobre cached', () => {
      const cached = mockForecastDoc('city-1', '2026-04-20-10', 'Sunny')
      const incoming = [mockForecastDoc('city-1', '2026-04-20-10', 'Cloudy')]
      const result = mergeForecastDocs([cached], incoming)

      expect(result[0].calculated_condition).toBe('Cloudy')
    })
  })

  describe('cleanExpiredForecastDocs', () => {
    test('elimina docs > 7 días', () => {
      const old = mockForecastDocWithAge(8 * 24 * 60 * 60 * 1000) // 8 días
      const fresh = mockForecastDocWithAge(1 * 24 * 60 * 60 * 1000) // 1 día
      const result = cleanExpiredForecastDocs([old, fresh])

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(fresh)
    })

    test('preserva docs < 7 días', () => {
      const valid = mockForecastDocWithAge(3 * 24 * 60 * 60 * 1000) // 3 días
      const result = cleanExpiredForecastDocs([valid])

      expect(result).toHaveLength(1)
    })
  })

  describe('getLastSyncTimestamp', () => {
    test('retorna 0 si no hay sync previo', () => {
      expect(getLastSyncTimestamp()).toBe(0)
    })

    test('persiste y se lee correctamente', () => {
      const ts = Date.now()
      setLastSyncTimestamp(ts)
      expect(getLastSyncTimestamp()).toBe(ts)
    })
  })

  describe('setLastSyncTimestamp', () => {
    test('guarda timestamp en localStorage', () => {
      const ts = 1234567890
      setLastSyncTimestamp(ts)
      expect(localStorage.getItem('pwe-lastSync')).toBe(String(ts))
    })
  })
})

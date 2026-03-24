// useWeather.ts
// Hook principal de carga de datos climáticos.
// Mock mode (sin VITE_ACCUWEATHER_KEY): usa mockCities + delay 80ms por ciudad.
// API mode (con key): Sprint 6 (US-601).

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from './useStore'
import { mockCities } from './mockCities'
import { getCachedWeather, setCachedWeather } from './cacheService'
import { loadCitiesInBatch } from './batchWeatherService'
import type { City } from './useStore'

const MOCK_DELAY_MS = 80

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hasApiKey = (): boolean =>
  Boolean(import.meta.env.VITE_ACCUWEATHER_KEY)

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const msUntilNextHour = (): number => {
  const now  = new Date()
  const next = new Date(now)
  next.setHours(next.getHours() + 1, 0, 0, 0)
  return next.getTime() - now.getTime()
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWeather() {
  const setLoadingStatus   = useStore((s) => s.setLoadingStatus)
  const setLoadingProgress = useStore((s) => s.setLoadingProgress)
  const setLastUpdated     = useStore((s) => s.setLastUpdated)
  const refreshRef         = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadCities = useCallback(async (): Promise<City[]> => {
    const cities  = mockCities           // Sprint 6: branch real vs mock aquí
    const total   = cities.length
    const result: City[] = []
    let allCached = true

    // Primera pasada: ¿todas en caché válido?
    for (const city of cities) {
      const cacheKey = city.s2Key || city.id
      const cached   = await getCachedWeather(cacheKey)
      if (!cached) { allCached = false; break }
    }

    // Si todas en caché → carga instantánea, sin LoadingScreen
    if (allCached) {
      for (const city of cities) {
        const cacheKey = city.s2Key || city.id
        const cached   = await getCachedWeather(cacheKey) as City
        result.push(cached ?? city)
      }
      return result
    }

    // Carga progresiva: Mock mode (secuencial) o API mode (batch)
    setLoadingStatus('loading')

    if (!hasApiKey()) {
      // ─── MOCK MODE: carga secuencial con delay simulado ──────────────────────
      for (let i = 0; i < cities.length; i++) {
        const city     = cities[i]
        const cacheKey = city.s2Key || city.id
        const current  = i + 1
        const percent  = Math.round((current / total) * 100)

        setLoadingProgress({ cityName: city.name, current, total, percent })

        const cached = await getCachedWeather(cacheKey) as City | null

        if (cached) {
          result.push(cached)
        } else {
          // Mock mode: simula delay de red
          await sleep(MOCK_DELAY_MS)
          await setCachedWeather(cacheKey, city)
          result.push(city)
        }
      }
    } else {
      // ─── API MODE: carga en batch paralelo con progreso ──────────────────────
      const apiKey = import.meta.env.VITE_ACCUWEATHER_KEY
      const batchResult = await loadCitiesInBatch(cities, apiKey, {
        parallelLimit: 5,
        delayMs: 200,
      })

      result.push(...batchResult.successful)

      // Log de métricas
      console.log(
        `✅ Batch load: ${batchResult.successful.length}/${total} ciudades, ` +
        `${batchResult.metrics.cachedHits} cache hits, ` +
        `${batchResult.metrics.totalCalls} API calls, ` +
        `${batchResult.metrics.executionMs}ms`
      )

      // Mostrar errores si los hay
      if (batchResult.failed.length > 0) {
        console.error(
          `⚠️ ${batchResult.failed.length} ciudades fallaron:`,
          batchResult.failed
        )
        // Agregar ciudades fallidas sin datos climáticos
        batchResult.failed.forEach((fail) => {
          const city = cities.find((c) => c.name === fail.city)
          if (city) result.push(city)
        })
      }

      // Actualizar progreso final
      const final = result.length
      const percent = Math.round((final / total) * 100)
      setLoadingProgress({
        cityName: `Cargadas ${final} de ${total}`,
        current: final,
        total,
        percent,
      })
    }

    return result
  }, [setLoadingStatus, setLoadingProgress])

  const run = useCallback(
    async (onReady: (cities: City[]) => void) => {
      try {
        const cities = await loadCities()
        setLoadingStatus('ready')
        setLastUpdated(Date.now())
        onReady(cities)

        // Refresh automático en la próxima HH:00
        if (refreshRef.current) clearTimeout(refreshRef.current)
        refreshRef.current = setTimeout(async () => {
          const refreshed = await loadCities()
          setLoadingStatus('ready')
          setLastUpdated(Date.now())
          onReady(refreshed)
        }, msUntilNextHour())
      } catch {
        setLoadingStatus('error')
      }
    },
    [loadCities, setLoadingStatus, setLastUpdated],
  )

  // Limpia el timer al desmontar
  useEffect(() => {
    return () => {
      if (refreshRef.current) clearTimeout(refreshRef.current)
    }
  }, [])

  return { run }
}

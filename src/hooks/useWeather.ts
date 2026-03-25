// useWeather.ts
// Hook principal de carga de datos climáticos desde AccuWeather API.
// ⚠️ REQUIERE VITE_ACCUWEATHER_KEY configurada en .env.local

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { loadCitiesInBatch } from '../services/weather/batchWeatherService'
import { getS2Key } from '../services/geo/s2Service'
import { shouldRefreshCities, setLastUpdateHour, getCachedWeather } from '../services/cache/cacheService'
import type { City } from '../store/useStore'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const msUntilNextHour = (): number => {
  const now = new Date()
  const next = new Date(now)
  next.setHours(next.getHours() + 1, 0, 0, 0)
  return next.getTime() - now.getTime()
}

const calculateLocalTime = (timezone: number): string => {
  const now = new Date()
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const localDate = new Date(utcTime + timezone * 60 * 60 * 1000)
  const hours = String(localDate.getHours()).padStart(2, '0')
  const minutes = String(localDate.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const loadCitiesFromCache = async (cities: City[]): Promise<City[]> => {
  const result: City[] = []

  for (const city of cities) {
    // Buscar caché por city.id (no por s2Key — ciudades cercanas pueden compartir s2Key)
    const cached = await getCachedWeather(city.id)
    if (cached) {
      // Preservar id/name/lat/lon del city original — nunca del caché
      const merged = {
        ...(cached as Partial<City>),
        id: city.id,
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        s2Key: city.s2Key,
        localTime: calculateLocalTime((cached as any).timezone ?? 0),
      } as City
      result.push(merged)
    } else {
      const withTime = { ...city, localTime: calculateLocalTime(city.timezone) }
      result.push(withTime)
    }
  }

  return result
}

const getApiKey = (): string => {
  const key = import.meta.env.VITE_ACCUWEATHER_KEY
  if (!key) {
    console.error('❌ VITE_ACCUWEATHER_KEY not configured in .env.local')
    console.error('   Create .env.local with: VITE_ACCUWEATHER_KEY=your_api_key')
    throw new Error('AccuWeather API key is required')
  }
  return key
}

// Transformar datos del JSON a formato City
function transformCitiesToCityFormat(jsonCities: any[]): City[] {
  return jsonCities.map((c) => ({
    id: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: c.name,
    country: c.country,
    flag: c.flag,
    region: c.region,
    lat: c.lat,
    lon: c.lng,
    density: c.density,
    stops: c.stops,
    gyms: c.gyms,
    rating: c.rating,
    tags: c.tags || [],
    tips: c.tips || '',
    best: c.best || '',
    evento: c.evento || '',
    transporte: c.transporte || '',
    // Placeholder (será reemplazado por API)
    condition: 'sunny',
    isExtreme: false,
    boostedTypes: [],
    tempC: 0,
    feelsLike: 0,
    humidity: 0,
    windKmh: 0,
    gustKmh: 0,
    localTime: '',
    s2Key: getS2Key(c.lat, c.lng),
    accuLocationKey: '',
    weatherIcon: 0,
    timezone: 0,
    updatedAt: Date.now(),
    weatherImage: '',
  }))
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWeather() {
  const setLoadingStatus = useStore((s) => s.setLoadingStatus)
  const setLoadingProgress = useStore((s) => s.setLoadingProgress)
  const setLastUpdated = useStore((s) => s.setLastUpdated)
  const refreshRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadCities = useCallback(async (): Promise<City[]> => {
    // Cargar ciudades del JSON (siempre)
    const rawCities: any[] = await import('../data/pokedensity-cities.json').then((m) => m.default || m)
    const cities = transformCitiesToCityFormat(rawCities)
    const total = cities.length

    // Verificar si debe refrescar (estrategia Lazy Load Horario)
    const needsRefresh = shouldRefreshCities()

    if (!needsRefresh) {
      console.log(`⏭️  Hora no cambió. Cargando desde caché IndexedDB...`)
      setLoadingStatus('loading')

      try {
        // Cargar desde caché
        const cachedCities = await loadCitiesFromCache(cities)
        const percent = Math.round((cachedCities.length / total) * 100)
        setLoadingProgress({
          cityName: `Cargadas ${cachedCities.length} de ${total} (caché)`,
          current: cachedCities.length,
          total,
          percent,
        })

        console.log(`✅ Loaded ${cachedCities.length} cities from cache (0 API calls)`)
        return cachedCities
      } catch (error) {
        console.error('⚠️ Error loading from cache, falling back to API:', error)
        // Si falla el caché, continuar con API
      }
    }

    // ─ Refrescar desde API ─
    const apiKey = getApiKey() // ⚠️ Throws si no está configurada
    console.log(`🌍 Loading ${total} cities from AccuWeather API...`)
    setLoadingStatus('loading')

    try {
      // Cargar clima en batch desde AccuWeather
      const batchResult = await loadCitiesInBatch(cities, apiKey, {
        parallelLimit: 5,
        delayMs: 200,
      })

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
      }

      const result = batchResult.successful

      // Calcular localTime para cada ciudad
      const resultWithTime = result.map((city) => ({
        ...city,
        localTime: calculateLocalTime(city.timezone),
      }))

      // Actualizar progreso final
      const percent = Math.round((resultWithTime.length / total) * 100)
      setLoadingProgress({
        cityName: `Cargadas ${resultWithTime.length} de ${total}`,
        current: resultWithTime.length,
        total,
        percent,
      })

      // Guardar timestamp de actualización (Lazy Load)
      setLastUpdateHour()

      return resultWithTime
    } catch (error) {
      console.error('❌ Error loading cities:', error)
      throw error
    }
  }, [setLoadingStatus, setLoadingProgress])

  const run = useCallback(
    async (onReady: (cities: City[]) => void) => {
      try {
        const cities = await loadCities()

        // DEBUG: Verificar duplicados
        const ids = cities.map(c => c.id)
        const uniqueIds = new Set(ids)
        if (ids.length !== uniqueIds.size) {
          console.error('❌ DUPLICATES DETECTED:', {
            total: ids.length,
            unique: uniqueIds.size,
            array: cities.map(c => `${c.name}(${c.id})`)
          })
        } else {
          console.log('✅ Array limpio:', ids.length, 'ciudades únicas')
        }

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

// useWeather.ts
// Hook principal de carga de datos climáticos desde AccuWeather API.
// ⚠️ REQUIERE VITE_ACCUWEATHER_KEY configurada en .env.local

import { useEffect, useRef, useCallback, useState } from 'react'
import { useStore } from '../store/useStore'
import { loadCitiesInBatch } from '../services/weather/batchWeatherService'
import { getS2Key } from '../services/geo/s2Service'
import { shouldRefreshCities, setLastUpdateHour, getCachedWeather, setCachedWeather } from '../services/cache/cacheService'
import { msUntilNextHour } from '../utils/timeUtils'
import { saveSnapshots, clearOldSnapshots } from '../services/history/weatherHistoryService'
import { getWeatherFromFirestore } from '../services/firebase/firebaseWeatherService'
import type { City } from '../store/useStore'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calculateLocalTime = (timezone: number): string => {
  const now = new Date()
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const localDate = new Date(utcTime + timezone * 60 * 60 * 1000)
  const hours = String(localDate.getHours()).padStart(2, '0')
  const minutes = String(localDate.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * US-1104: Lectura optimizada de climas con fallback Firestore
 * Flujo: IndexedDB (caché local, <60 min) → Firestore (source of truth) → city vacío
 * CAPA 1: IndexedDB by accuLocationKey (rápido, 40ms)
 * CAPA 2: Firestore by city.id (fallback, 300-500ms)
 */
const loadCitiesFromCache = async (cities: City[]): Promise<City[]> => {
  const result: City[] = []

  for (const city of cities) {
    // FIX: usar city.id como cache key cuando accuLocationKey esta vacio.
    // En modo prod (sin VITE_ACCUWEATHER_KEY), city.accuLocationKey viene '' del JSON,
    // lo que causaba que TODAS las ciudades compartieran la misma entrada en IndexedDB.
    const locationKey = city.accuLocationKey || `cityid-${city.id}`
    const cached = await getCachedWeather(locationKey)

    // CAPA 1: Firestore (source of truth — Cloud Function escribe cada hora)
    // Comparar timestamp: usar Firestore si es más reciente que IndexedDB
    const firestoreWeather = await getWeatherFromFirestore(city.id)

    if (firestoreWeather) {
      const firestoreTime = firestoreWeather.updatedAt ?? 0
      const cachedTime = cached?.updatedAt ?? 0

      // Firestore gana si: no hay cache O Firestore es más reciente o igual
      if (!cached || firestoreTime >= cachedTime) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { weatherImage, ...cacheableData } = firestoreWeather
        await setCachedWeather(locationKey, { ...cacheableData, weatherImage: '' })

        const merged = {
          ...city,
          condition: firestoreWeather.condition as City['condition'],
          boostedTypes: firestoreWeather.boostedTypes,
          tempC: firestoreWeather.tempC,
          feelsLike: firestoreWeather.feelsLike,
          humidity: firestoreWeather.humidity,
          windKmh: firestoreWeather.windKmh,
          gustKmh: firestoreWeather.gustKmh,
          weatherIcon: firestoreWeather.weatherIcon,
          isExtreme: firestoreWeather.isExtreme,
          timezone: firestoreWeather.timezone,
          updatedAt: firestoreWeather.updatedAt,
          localTime: calculateLocalTime(firestoreWeather.timezone),
          weatherImage: firestoreWeather.weatherImage,
        } as City
        result.push(merged)
        continue
      }
    }

    // CAPA 2: IndexedDB (si Firestore vacío o cache es más reciente)
    if (cached) {
      const merged = {
        ...(cached as Partial<City>),
        id: city.id,
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        s2Key: city.s2Key,
        localTime: calculateLocalTime(cached?.timezone ?? 0),
      } as City
      result.push(merged)
      continue
    }

    // FALLBACK: Sin datos
    const withTime = { ...city, localTime: calculateLocalTime(city.timezone) }
    result.push(withTime)
  }

  return result
}

type RawCityJson = {
  name: string; country: string; flag: string; region: string
  lat: number; lng: number; density: number; stops: number; gyms: number; rating: number
  tags?: string[]; tips?: string; best?: string; evento?: string; transporte?: string
}

// Transformar datos del JSON a formato City
function transformCitiesToCityFormat(jsonCities: RawCityJson[]): City[] {
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
    visibilityKm: 10,
    localTime: '',
    s2Key: getS2Key(c.lat, c.lng),
    accuLocationKey: '',
    weatherIcon: 0,
    timezone: 0,
    updatedAt: Date.now(),
    weatherImage: '',
  })) as City[]
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWeather() {
  const setLoadingStatus = useStore((s) => s.setLoadingStatus)
  const setLoadingProgress = useStore((s) => s.setLoadingProgress)
  const setLastUpdated = useStore((s) => s.setLastUpdated)
  const refreshRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onReadyRef = useRef<(cities: City[]) => void>(() => {})
  const loadingCitiesRef = useRef<boolean>(false)  // ✅ FIX #1: Evitar doble ejecución en React Strict Mode

  // Toast state para notificaciones durante auto-refresh
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadCities = useCallback(async (forceRefresh: boolean = false): Promise<City[]> => {
    // Cargar ciudades del JSON (siempre)
    const rawCities: RawCityJson[] = await import('../data/pokedensity-cities.json').then((m) => m.default || m)
    const cities = transformCitiesToCityFormat(rawCities)
    const total = cities.length

    // Verificar si debe refrescar (estrategia Lazy Load Horario)
    const needsRefresh = forceRefresh || shouldRefreshCities()

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

    // ─ Refrescar desde API (solo si hay API key) ─
    // En produccion sin VITE_ACCUWEATHER_KEY, ir directo a Firestore
    const apiKey = import.meta.env.VITE_ACCUWEATHER_KEY
    if (!apiKey) {
      console.log('ℹ️ Sin VITE_ACCUWEATHER_KEY — modo produccion, leyendo desde Firestore...')
      setLoadingStatus('loading')
      const firestoreCities = await loadCitiesFromCache(cities)
      const percent = Math.round((firestoreCities.length / total) * 100)
      setLoadingProgress({
        cityName: `Cargadas ${firestoreCities.length} de ${total} (Firestore)`,
        current: firestoreCities.length,
        total,
        percent,
      })
      // Marcar hora de actualizacion para que siguientes recargas usen cache (IndexedDB)
      // y no vuelvan a Firestore innecesariamente hasta la siguiente hora
      const hasRealData = firestoreCities.some(c => c.tempC > 0)
      if (hasRealData) setLastUpdateHour()
      return firestoreCities
    }
    const isAutoRefresh = forceRefresh && !shouldRefreshCities()
    console.log(`🌍 Loading ${total} cities from AccuWeather API${isAutoRefresh ? ' (auto-refresh)' : ''}...`)
    setLoadingStatus('loading')

    try {
      // Cargar clima en batch desde AccuWeather
      // Para auto-refresh (HH:00), ignorar caché para obtener datos frescos
      const batchResult = await loadCitiesInBatch(cities, apiKey, {
        parallelLimit: 5,
        delayMs: 200,
        ignoreCache: forceRefresh,  // ← Nuevo: fuerza fetch si es auto-refresh
      })

      // Log de métricas — Lazy Load Horario
      console.log(
        `🔄 Auto-refresh HH:00 — ${batchResult.metrics.cachedHits} cache hits, ` +
        `${batchResult.successful.length}/${total} ciudades actualizadas, ` +
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

      // US-607: Guardar snapshots históricos para análisis de precisión
      await saveSnapshots(resultWithTime)

      // US-801: Firebase persistence ya se ejecuta en loadCitiesInBatch
      // (no duplicar aquí — evita writes duplicados a Firestore)

      return resultWithTime
    } catch (error) {
      console.error('❌ Error loading cities:', error)
      throw error
    }
  }, [setLoadingStatus, setLoadingProgress])

  // Ref para quebrar la circular dependency entre doRefresh y scheduleNextRefresh
  const scheduleNextRefreshRef = useRef<() => void>(() => {})

  // Helper para ejecutar refresh y reprogramar siguiente
  const doRefresh = useCallback(async () => {
    setLoadingStatus('loading')

    try {
      const refreshed = await loadCities(true)
      setLoadingStatus('ready')
      setLastUpdated(Date.now())
      onReadyRef.current(refreshed)
      setTimeout(() => scheduleNextRefreshRef.current(), 400)
    } catch (error) {
      console.error('❌ Auto-refresh AccuWeather error, falling back to cache/Firestore:', error)

      // Fallback: cargar desde IndexedDB/Firestore para no dejar sidebar vacío
      try {
        const rawCities: RawCityJson[] = await import('../data/pokedensity-cities.json').then((m) => m.default || m)
        const cities = transformCitiesToCityFormat(rawCities)
        const fallbackCities = await loadCitiesFromCache(cities)
        if (fallbackCities.length > 0) {
          setLoadingStatus('ready')
          setLastUpdated(Date.now())
          onReadyRef.current(fallbackCities)
          console.log(`✅ Fallback: ${fallbackCities.length} ciudades desde caché/Firestore`)
        } else {
          setLoadingStatus('error')
        }
      } catch {
        setLoadingStatus('error')
      }

      // Reintentar AccuWeather en 5 minutos
      refreshRef.current = setTimeout(() => scheduleNextRefreshRef.current(), 5 * 60 * 1000)
    }
  }, [loadCities, setLoadingStatus, setLastUpdated])

  // Reprogramar siguiente refresh a HH:00
  const scheduleNextRefresh = useCallback(() => {
    // Limpiar timer anterior si existe
    if (refreshRef.current) {
      clearTimeout(refreshRef.current)
      refreshRef.current = null
    }

    // No programar si app está oculta
    if (document.hidden) {
      console.log('⏸️ No se programa refresh (app oculta)')
      return
    }

    const msUntilNext = msUntilNextHour()
    console.log(`⏰ Próximo auto-refresh en ${Math.round(msUntilNext / 1000)}s (${new Date(Date.now() + msUntilNext).toLocaleTimeString()})`)

    refreshRef.current = setTimeout(() => {
      console.log('🔄 Trigger auto-refresh HH:00')
      doRefresh()
    }, msUntilNext)
  }, [doRefresh])

  // Actualizar ref después de que scheduleNextRefresh esté definida
  useEffect(() => {
    scheduleNextRefreshRef.current = scheduleNextRefresh
  }, [scheduleNextRefresh])

  // Visibility API: pausa/reschedule refresh según visibilidad
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // App en background: pausar auto-refresh
      if (refreshRef.current) {
        clearTimeout(refreshRef.current)
        refreshRef.current = null
        console.log('⏸️ Auto-refresh pausado (app en background)')
      }
    } else {
      // App visible nuevamente: reschedule y ejecutar si está expirada
      console.log('▶️ App visible — rescheduleando timer...')
      if (shouldRefreshCities()) {
        console.log('⚡ Caché expirado, refrescando inmediatamente...')
        doRefresh()
      } else {
        // Timer no expiró: simplemente reprogramar
        console.log('✓ Caché vigente, reprogramando timer')
        scheduleNextRefresh()
      }
    }
  }, [doRefresh, scheduleNextRefresh])

  const run = useCallback(
    async (onReady: (cities: City[]) => void) => {
      // ✅ FIX #1: Protección contra React Strict Mode double-call
      if (loadingCitiesRef.current) {
        console.log('⏭️ loadCities ya en progreso, ignorando llamada duplicada (Strict Mode)')
        return
      }
      loadingCitiesRef.current = true

      // Guardar onReady en ref para poder usarla en auto-refresh
      onReadyRef.current = onReady

      try {
        // US-607: Limpiar snapshots antiguos (> N días)
        await clearOldSnapshots()

        let cities = await loadCities()

        // Detectar ciudades sin datos reales y forzar refresh API
        const noRealData = cities.length > 0 && cities.every(
          c => c.tempC === 0 && c.boostedTypes.length === 0
        )
        if (noRealData) {
          console.warn('⚠️ Ciudades sin datos reales, forzando refresh API + limpiando localStorage stale...')
          // Limpiar el flag de localStorage que estaba bloqueando el refresh
          localStorage.removeItem('pwe-lastUpdateHour')
          try {
            cities = await loadCities(true)
            console.log('✅ Refresh API completado:', cities.length, 'ciudades')
          } catch (forceErr) {
            console.error('❌ Force refresh API falló:', forceErr)
            // Último intento: Firestore directo
            const rawCities: RawCityJson[] = await import('../data/pokedensity-cities.json').then((m) => m.default || m)
            const baseCities = transformCitiesToCityFormat(rawCities)
            const firestoreCities = await loadCitiesFromCache(baseCities)
            if (firestoreCities.some(c => c.tempC > 0 || c.boostedTypes.length > 0)) {
              cities = firestoreCities
              console.log('✅ Datos recuperados desde Firestore:', cities.length)
            }
          }
        }

        // ✅ FIX #3: Deduplicación defensiva
        const ids = cities.map(c => c.id)
        const uniqueIds = new Set(ids)
        if (ids.length !== uniqueIds.size) {
          console.warn('⚠️ Duplicados detectados, deduplicando...')
          const seen = new Set<string>()
          cities = cities.filter(city => {
            if (seen.has(city.id)) return false
            seen.add(city.id)
            return true
          })
          console.log(`✅ Deduplicadas: ${ids.length} → ${cities.length}`)
        } else {
          console.log('✅ Array limpio:', ids.length, 'ciudades únicas')
        }

        setLoadingStatus('ready')
        setLastUpdated(Date.now())
        onReady(cities)

        // Programar auto-refresh + Visibility listener
        scheduleNextRefresh()
        document.addEventListener('visibilitychange', handleVisibilityChange)
      } catch (err) {
        console.error('❌ run() falló, intentando Firestore como último fallback:', err)
        // Último recurso: cargar desde Firestore para no dejar sidebar vacío
        try {
          const rawCities: RawCityJson[] = await import('../data/pokedensity-cities.json').then((m) => m.default || m)
          const baseCities = transformCitiesToCityFormat(rawCities)
          const fallback = await loadCitiesFromCache(baseCities)
          if (fallback.length > 0) {
            setLoadingStatus('ready')
            setLastUpdated(Date.now())
            onReady(fallback)
            scheduleNextRefresh()
            document.addEventListener('visibilitychange', handleVisibilityChange)
            console.log(`✅ run() fallback Firestore: ${fallback.length} ciudades`)
          } else {
            setLoadingStatus('error')
          }
        } catch {
          setLoadingStatus('error')
        }
      } finally {
        loadingCitiesRef.current = false  // Permitir siguiente carga
      }
    },
    [loadCities, setLoadingStatus, setLastUpdated, scheduleNextRefresh, handleVisibilityChange],
  )

  // Limpia timers y listeners al desmontar
  useEffect(() => {
    return () => {
      if (refreshRef.current) clearTimeout(refreshRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleVisibilityChange])

  return { run, toastMessage, setToastMessage }
}

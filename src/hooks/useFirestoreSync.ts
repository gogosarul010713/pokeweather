/**
 * useFirestoreSync — Real-time listener para cambios en Firestore
 * US-1101 + D-043: Escucha summary docs en /city_weather y refetch al detectar cambios de la CF
 *
 * ARQUITECTURA (D-040 + D-043 — vigente desde 2026-06-12):
 * - CF clasifica y persiste `pgo_condition` en cada snapshot (D-040). No escribe RAW.
 * - CF escribe SUMMARY en /city_weather/{id} con `updatedAt` (trigger doc)
 * - Este hook escucha el summary doc. Cuando cambia (cron HH:00), por cada doc
 *   modificado llama a getWeatherFromFirestore(cityId) que lee pgo_condition directamente
 *   desde snapshots[0] — sin recalcular con resolveCondition.
 * - El payload entregado al callback son ciudades ya listas (Partial<City>).
 */

import { useEffect, useRef } from 'react'
import { onSnapshot, collection, type Unsubscribe } from 'firebase/firestore'
import { getDb } from '../services/firebase/firebaseConfig'
import { getWeatherFromFirestore } from '../services/firebase/firebaseWeatherService'
import type { City } from '../store/useStore'

interface SummaryDoc {
  city_id: string
  city_name?: string
  last_date_hour?: string
  updatedAt?: number
}

/**
 * Hook que escucha cambios en /city_weather (summary docs escritos por la CF).
 * Por cada change, refetcha el clima clasificado desde la subcoleccion forecasts.
 */
export function useFirestoreSync(
  onUpdate: (cities: Partial<City>[]) => void,
  onError?: (error: Error) => void
) {
  // Trackeamos el ultimo updatedAt visto por cityId para evitar re-fetch innecesario
  // (snapshot inicial dispara para todos los docs aunque no haya cambio real)
  const lastUpdatedRef = useRef<Map<string, number>>(new Map())
  const isFirstSnapshotRef = useRef<boolean>(true)

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null

    const setupListener = async () => {
      try {
        const db = await getDb()

        unsubscribe = onSnapshot(
          collection(db, 'city_weather'),
          async (snapshot) => {
            // Ignorar writes locales pendientes
            if (snapshot.metadata.hasPendingWrites) return

            // Detectar que cityIds tienen updatedAt nuevo
            const changedCityIds: string[] = []

            for (const doc of snapshot.docs) {
              const data = doc.data() as SummaryDoc
              const cityId = data.city_id || doc.id
              const updatedAt = data.updatedAt ?? 0

              const lastSeen = lastUpdatedRef.current.get(cityId) ?? 0

              // En el primer snapshot solo registramos baseline, no fetcheamos
              // (los datos ya vienen via useWeather → loadCitiesFromCache)
              if (isFirstSnapshotRef.current) {
                lastUpdatedRef.current.set(cityId, updatedAt)
                continue
              }

              if (updatedAt > lastSeen) {
                lastUpdatedRef.current.set(cityId, updatedAt)
                changedCityIds.push(cityId)
              }
            }

            if (isFirstSnapshotRef.current) {
              isFirstSnapshotRef.current = false
              console.log(
                `[useFirestoreSync] Baseline registered for ${snapshot.docs.length} cities`
              )
              return
            }

            if (changedCityIds.length === 0) return

            console.log(
              `[useFirestoreSync] ${changedCityIds.length} cities updated by CF, refetching classified data...`
            )

            // Refetch clasificado en paralelo
            const refetched = await Promise.all(
              changedCityIds.map(async (cityId) => {
                const weather = await getWeatherFromFirestore(cityId)
                if (!weather) return null
                return {
                  id: cityId,
                  condition: weather.condition,
                  boostedTypes: weather.boostedTypes,
                  isExtreme: weather.isExtreme,
                  tempC: weather.tempC,
                  feelsLike: weather.feelsLike,
                  humidity: weather.humidity,
                  windKmh: weather.windKmh,
                  gustKmh: weather.gustKmh,
                  weatherIcon: weather.weatherIcon,
                  timezone: weather.timezone,
                  updatedAt: weather.updatedAt,
                  weatherImage: weather.weatherImage,
                } as Partial<City>
              })
            )

            const valid = refetched.filter((c): c is Partial<City> => c !== null)
            if (valid.length > 0) onUpdate(valid)
          },
          (error) => {
            console.error('[useFirestoreSync] Listener error:', error)
            onError?.(error as Error)
          }
        )
      } catch (error) {
        console.error('[useFirestoreSync] Setup error:', error)
        onError?.(error as Error)
      }
    }

    setupListener()

    return () => {
      if (unsubscribe) {
        unsubscribe()
        console.log('[useFirestoreSync] Listener detached')
      }
    }
  }, [onUpdate, onError])
}

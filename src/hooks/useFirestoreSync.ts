/**
 * useFirestoreSync — Real-time listener para cambios en Firestore
 * US-1101: Escucha cambios en /city_weather y actualiza estado React automáticamente
 */

import { useEffect } from 'react'
import { onSnapshot, collection, type Unsubscribe } from 'firebase/firestore'
import { getDb } from '../services/firebase/firebaseConfig'
import type { City } from '../store/useStore'

interface FirestoreCityWeather {
  city_id: string
  city_name: string
  condition: string
  tempC: number
  feelsLike: number
  humidity: number
  windKmh: number
  gustKmh: number
  weatherIcon: number
  isExtreme: boolean
  timezone: number
  boostedTypes: string[]
  weatherImage: string
  updatedAt: number
}

/**
 * Hook que escucha cambios en la colección city_weather de Firestore
 * Dispara callback cuando hay cambios (sin pending writes locales)
 */
export function useFirestoreSync(
  onUpdate: (cities: Partial<City>[]) => void,
  onError?: (error: Error) => void
) {
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null

    const setupListener = async () => {
      try {
        const db = await getDb()

        // Escuchar cambios en la colección city_weather
        unsubscribe = onSnapshot(
          collection(db, 'city_weather'),
          (snapshot) => {
            // Ignorar writes locales (pending writes)
            if (snapshot.metadata.hasPendingWrites) {
              console.log('[useFirestoreSync] Ignoring pending writes')
              return
            }

            // Mapear documentos de Firestore a formato City
            const cities: Partial<City>[] = snapshot.docs.map((doc) => {
              const data = doc.data() as FirestoreCityWeather
              return {
                id: data.city_id,
                condition: data.condition as any,
                tempC: data.tempC,
                feelsLike: data.feelsLike,
                humidity: data.humidity,
                windKmh: data.windKmh,
                gustKmh: data.gustKmh,
                weatherIcon: data.weatherIcon,
                isExtreme: data.isExtreme,
                timezone: data.timezone,
                boostedTypes: data.boostedTypes,
                weatherImage: data.weatherImage,
                updatedAt: data.updatedAt,
              }
            })

            console.log(
              `[useFirestoreSync] Updated ${cities.length} cities from Firestore`
            )
            onUpdate(cities)
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

    // Cleanup: desuscribirse cuando el componente se desmonta
    return () => {
      if (unsubscribe) {
        unsubscribe()
        console.log('[useFirestoreSync] Listener detached')
      }
    }
  }, [onUpdate, onError])
}

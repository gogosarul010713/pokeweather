// FlyToCity.tsx — US-503
// Componente interno de MapContainer que observa selectedCity en el store
// y vuela automáticamente a esa ciudad cuando cambia.

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useStore } from '../../store/useStore'

const FLY_ZOOM     = 10
const FLY_DURATION = 1.5   // segundos

export default function FlyToCity() {
  const selectedCity = useStore((s) => s.selectedCity)
  const map          = useMap()
  const prevIdRef    = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedCity) return
    // Solo vuela si es una ciudad distinta a la anterior
    if (selectedCity.id === prevIdRef.current) return

    prevIdRef.current = selectedCity.id
    map.flyTo([selectedCity.lat, selectedCity.lon], FLY_ZOOM, {
      duration: FLY_DURATION,
    })
  }, [selectedCity, map])

  return null
}

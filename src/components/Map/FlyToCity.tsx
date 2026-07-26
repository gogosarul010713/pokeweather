// FlyToCity.tsx — US-503
// Componente interno de MapContainer que observa selectedCity en el store
// y vuela automáticamente a esa ciudad cuando cambia.

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useStore } from '../../store/useStore'

const FLY_ZOOM     = 10
const FLY_DURATION = 1.5   // segundos

export default function FlyToCity() {
  const selectedCity      = useStore((s) => s.selectedCity)
  const scrollToFeedTick  = useStore((s) => s.scrollToFeedTick)
  const scrollToFeedTarget = useStore((s) => s.scrollToFeedTarget)
  const map               = useMap()
  const prevIdRef         = useRef<string | null>(null)
  const prevTickRef       = useRef<number>(0)

  useEffect(() => {
    if (!selectedCity) return
    const tickChanged = scrollToFeedTick !== prevTickRef.current && scrollToFeedTarget === 'city'
    if (selectedCity.id === prevIdRef.current && !tickChanged) return

    prevIdRef.current  = selectedCity.id
    prevTickRef.current = scrollToFeedTick
    map.flyTo([selectedCity.lat, selectedCity.lon], FLY_ZOOM, {
      duration: FLY_DURATION,
    })
  }, [selectedCity, scrollToFeedTick, scrollToFeedTarget, map])

  return null
}

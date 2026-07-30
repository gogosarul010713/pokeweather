// FlyToCity.tsx — US-503
// Componente interno de MapContainer que observa selectedCity en el store
// y vuela automáticamente a esa ciudad cuando cambia.

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { Map } from 'leaflet'
import { useStore } from '../../store/useStore'

const FLY_ZOOM       = 10
const FLY_DURATION   = 1.5
// El popup sale ARRIBA del pin. Para que pin quede visible:
// el pin debe estar en la mitad inferior -> sumar px al destino (bajar el pin en pantalla)
// city: popup 153 + tip 20 = 173, pin a centro + 173/2 - margen
const OFFSET_CITY_PX = 60   // subir el mapa para que popup no quede cortado arriba
const OFFSET_NEST_PX = 60   // igual que ciudad — popup vive en el marker

function flyWithOffset(map: Map, lat: number, lng: number, offsetPx: number, direction: 1 | -1 = 1) {
  const pinPoint = map.project([lat, lng], FLY_ZOOM)
  pinPoint.y += offsetPx * direction
  map.flyTo(map.unproject(pinPoint, FLY_ZOOM), FLY_ZOOM, { duration: FLY_DURATION })
}

export default function FlyToCity() {
  const selectedCity       = useStore((s) => s.selectedCity)
  const selectedNest       = useStore((s) => s.selectedNest)
  const scrollToFeedTick   = useStore((s) => s.scrollToFeedTick)
  const scrollToFeedTarget = useStore((s) => s.scrollToFeedTarget)
  const map                = useMap()
  const prevCityIdRef      = useRef<string | null>(null)
  const prevNestIdRef      = useRef<string | null>(null)
  const prevTickRef        = useRef<number>(0)

  // Volar a ciudad seleccionada
  useEffect(() => {
    if (!selectedCity) { prevCityIdRef.current = null; return }
    const tickChanged = scrollToFeedTick !== prevTickRef.current && scrollToFeedTarget === 'city'
    if (selectedCity.id === prevCityIdRef.current && !tickChanged) return

    prevCityIdRef.current = selectedCity.id
    prevTickRef.current   = scrollToFeedTick
    flyWithOffset(map, selectedCity.lat, selectedCity.lon, OFFSET_CITY_PX, -1)
  }, [selectedCity, scrollToFeedTick, scrollToFeedTarget, map])

  // Volar a nido seleccionado
  useEffect(() => {
    if (!selectedNest) { prevNestIdRef.current = null; return }
    if (selectedNest.id === prevNestIdRef.current) return

    prevNestIdRef.current = selectedNest.id
    flyWithOffset(map, selectedNest.lat, selectedNest.lng, OFFSET_NEST_PX, -1)
  }, [selectedNest, map])

  return null
}

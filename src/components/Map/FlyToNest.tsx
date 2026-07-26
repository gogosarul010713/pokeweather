import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useStore } from '../../store/useStore'

const FLY_ZOOM     = 14
const FLY_DURATION = 1.5

export default function FlyToNest() {
  const selectedNest = useStore((s) => s.selectedNest)
  const map          = useMap()
  const prevIdRef    = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedNest) return
    if (selectedNest.id === prevIdRef.current) return

    prevIdRef.current = selectedNest.id
    map.flyTo([selectedNest.lat, selectedNest.lng], FLY_ZOOM, {
      duration: FLY_DURATION,
    })
  }, [selectedNest, map])

  return null
}

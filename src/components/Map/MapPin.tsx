// MapPin.tsx — US-501 + Badges
// Pin teardrop fijo. Badges pequeños para categorías (stops, gyms, community).

import { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { useStore } from '../../store/useStore'
import { CONDITION_COLORS, BADGE_ICONS, type BadgeType } from '../../services/weather/weatherService'
import type { City } from '../../store/useStore'

interface MapPinProps {
  city: City
  badges?: BadgeType[]
}

function buildIcon(color: string, selected: boolean, badges: BadgeType[] = [], showBadges: boolean = true): L.DivIcon {
  const w = selected ? 28 : 22
  const h = selected ? 37 : 29
  const cx = w / 2
  const cy = Math.round(w * 0.46)
  const r = Math.round(w * 0.42)

  const path = `M${cx},1 A${r},${r} 0 1,1 ${cx - 0.01},1 L${cx},${h - 1} Z`

  const filter = selected
    ? 'drop-shadow(0 0 8px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,255,255,0.6))'
    : 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))'

  // Badges HTML (máx 3, 12px cada uno) — solo si showBadges es true
  let badgesHtml = ''
  if (showBadges && badges.length > 0) {
    const positions = ['top:-6px;left:-6px', 'top:-6px;right:-6px', 'bottom:-2px;right:-6px']
    badgesHtml = badges
      .slice(0, 3)
      .map(
        (badge, i) =>
          `<div style="position:absolute;${positions[i]};font-size:12px;line-height:1;z-index:10;">${BADGE_ICONS[badge]}</div>`,
      )
      .join('')
  }

  const html = `
    <div style="position:relative;width:${w}px;height:${h}px;filter:${filter};">
      <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <path d="${path}" fill="${color}" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 0.42)}" fill="rgba(255,255,255,0.9)"/>
      </svg>
      ${badgesHtml}
    </div>`

  return L.divIcon({
    className: '',
    html,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h],
  })
}

export default function MapPin({ city, badges = [] }: MapPinProps) {
  const selectedCity = useStore((s) => s.selectedCity)
  const setSelectedCity = useStore((s) => s.setSelectedCity)
  const showBadgesOnPins = useStore((s) => s.showBadgesOnPins)

  const isSelected = selectedCity?.id === city.id
  const color = CONDITION_COLORS[city.condition]

  const icon = useMemo(() => buildIcon(color, isSelected, badges, showBadgesOnPins), [color, isSelected, badges, showBadgesOnPins])

  return (
    <Marker
      position={[city.lat, city.lon]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => setSelectedCity(city),
      }}
    />
  )
}

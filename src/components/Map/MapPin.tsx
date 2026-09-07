// MapPin.tsx — US-501 + Badges
// Pin teardrop fijo. Badges pequeños para categorías (stops, gyms, community).

import { useMemo, useRef, useEffect } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useStore } from '../../store/useStore'
import { CONDITION_COLORS, BADGE_ICONS, type BadgeType } from '../../services/weather/weatherService'
import { WEATHER_IMAGES } from '../../config/weatherImages'
import type { City } from '../../store/useStore'
import CityTooltip from './CityTooltip'

interface MapPinProps {
  city: City
  badges?: BadgeType[]
  dimmed?: boolean
}

function buildIcon(color: string, selected: boolean, badges: BadgeType[] = [], showBadges: boolean = true, dimmed = false, weatherImg?: string, tempC?: number): L.DivIcon {
  const size = selected ? 36 : 28
  const half = size / 2
  const cx = half
  const cy = Math.round(size * 0.46)
  const r = Math.round(size * 0.42)

  const path = `M${cx},1 A${r},${r} 0 1,1 ${cx - 0.01},1 L${cx},${size - 1} Z`

  const filter = selected
    ? 'drop-shadow(0 0 8px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,255,255,0.6))'
    : 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))'

  const spriteHtml = weatherImg
    ? `<img src="${weatherImg}" width="${Math.round(size * 0.85)}" height="${Math.round(size * 0.85)}"
         style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);object-fit:contain;pointer-events:none;z-index:2;" />`
    : `<circle cx="${cx}" cy="${cy}" r="${Math.round(r * 0.42)}" fill="rgba(255,255,255,0.9)"/>`

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

  const opacity = dimmed ? 'opacity:0.25;' : ''
  const svgInner = weatherImg
    ? `<path d="${path}" fill="${color}"/>`
    : `<path d="${path}" fill="${color}"/>
       <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 0.42)}" fill="rgba(255,255,255,0.9)"/>`

  const tempLabel = tempC !== undefined
    ? `<div style="position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.9);pointer-events:none;">${Math.round(tempC)}°</div>`
    : ''

  const html = `
    <div style="position:relative;width:${size}px;height:${size + (tempC !== undefined ? 14 : 0)}px;filter:${filter};${opacity}transition:opacity 200ms ease;">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        ${svgInner}
      </svg>
      ${weatherImg ? spriteHtml : ''}
      ${badgesHtml}
      ${tempLabel}
    </div>`

  return L.divIcon({
    className: '',
    html,
    iconSize: [size, size],
    iconAnchor: [half, size],
    popupAnchor: [0, -size],
  })
}

export default function MapPin({ city, badges = [], dimmed = false }: MapPinProps) {
  const selectedCity = useStore((s) => s.selectedCity)
  const setSelectedCity = useStore((s) => s.setSelectedCity)
  const highlightCategories = useStore((s) => s.highlightCategories)

  // Badges: solo mostrar los que coinciden con la categoria seleccionada en la leyenda
  const activeBadges = highlightCategories.length > 0
    ? badges.filter(b => highlightCategories.includes(b))
    : []

  const isSelected = selectedCity?.id === city.id
  const color = CONDITION_COLORS[city.condition]
  const markerRef = useRef<L.Marker>(null)

  const weatherImg = WEATHER_IMAGES[city.condition as keyof typeof WEATHER_IMAGES]
  const isMobile = window.innerWidth < 768
  const icon = useMemo(() => buildIcon(color, isSelected, activeBadges, true, dimmed, weatherImg, isMobile ? city.tempC : undefined), [color, isSelected, activeBadges, dimmed, weatherImg, isMobile, city.tempC])

  useEffect(() => {
    if (isSelected) markerRef.current?.openPopup()
    else markerRef.current?.closePopup()
  }, [isSelected])

  return (
    <Marker
      ref={markerRef}
      position={[city.lat, city.lon]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => setSelectedCity(city),
      }}
    >
      <Popup autoPan={false} closeButton={true}>
        <CityTooltip city={city} />
      </Popup>
    </Marker>
  )
}

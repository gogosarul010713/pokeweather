import { useMemo, useRef, useEffect } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useStore } from '../../store/useStore'
import { BADGE_ICONS } from '../../services/weather/weatherService'
import type { Nest } from '../../types/nest'
import NestPopup from '../Nests/NestPopup'

interface NestPinProps {
  nest: Nest
  badges?: string[]
  dimmed?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
  electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC',
}

function buildNestIcon(color: string, selected: boolean, badges: string[], pokemonId: number): L.DivIcon {
  const size = selected ? 36 : 28
  const half = size / 2
  const filter = selected
    ? 'drop-shadow(0 0 8px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,255,255,0.6))'
    : 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))'

  // Hexagon points scaled to size
  const pts = [
    `${half},2`, `${size - 2},${Math.round(size * 0.27)}`,
    `${size - 2},${Math.round(size * 0.73)}`, `${half},${size - 2}`,
    `2,${Math.round(size * 0.73)}`, `2,${Math.round(size * 0.27)}`,
  ].join(' ')

  const positions = ['top:-6px;left:-6px', 'top:-6px;right:-6px', 'bottom:-2px;right:-6px']
  const badgesHtml = badges.slice(0, 3).map((b, i) =>
    `<div style="position:absolute;${positions[i]};font-size:12px;line-height:1;z-index:10;">${BADGE_ICONS[b as keyof typeof BADGE_ICONS] ?? b}</div>`
  ).join('')

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;filter:${filter};">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${pts}" fill="${color}" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
      </svg>
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png"
           width="${Math.round(size * 0.72)}" height="${Math.round(size * 0.72)}"
           style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);object-fit:contain;pointer-events:none;z-index:2;"
      />
      ${badgesHtml}
    </div>`

  return L.divIcon({
    className: '',
    html,
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half],
  })
}

export default function NestPin({ nest, badges = [], dimmed = false }: NestPinProps) {
  const setSelectedNest = useStore((s) => s.setSelectedNest)
  const selectedNest = useStore((s) => s.selectedNest)
  const scrollToFeed = useStore((s) => s.scrollToFeed)

  const isSelected = selectedNest?.id === nest.id
  const color = TYPE_COLORS[nest.types[0]?.toLowerCase() || 'normal'] || '#999999'
  const markerRef = useRef<L.Marker>(null)

  const icon = useMemo(
    () => buildNestIcon(color, isSelected, badges, nest.pokemonId),
    [color, isSelected, badges, nest.pokemonId]
  )

  useEffect(() => {
    if (isSelected) markerRef.current?.openPopup()
    else markerRef.current?.closePopup()
  }, [isSelected])

  return (
    <Marker
      ref={markerRef}
      position={[nest.lat, nest.lng]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : dimmed ? -5 : 0}
      opacity={dimmed ? 0.13 : 1}
      eventHandlers={{ click: () => setSelectedNest(nest) }}
    >
      <Popup autoPan={false} closeButton={false} minWidth={290} maxWidth={290} className="leaflet-popup-nest">
        <NestPopup
          nest={nest}
          onClose={() => markerRef.current?.closePopup()}
          onViewInList={() => { markerRef.current?.closePopup(); scrollToFeed('nest') }}
        />
      </Popup>
    </Marker>
  )
}

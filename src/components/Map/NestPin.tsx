import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useStore } from '../../store/useStore'
import type { Nest } from '../../types/nest'

interface NestPinProps {
  nest: Nest
}

const TYPE_COLORS: Record<string, string> = {
  'normal': '#A8A878',
  'fire': '#F08030',
  'water': '#6890F0',
  'grass': '#78C850',
  'electric': '#F8D030',
  'ice': '#98D8D8',
  'fighting': '#C03028',
  'poison': '#A040A0',
  'ground': '#E0C068',
  'flying': '#A890F0',
  'psychic': '#F85888',
  'bug': '#A8B820',
  'rock': '#B8A038',
  'ghost': '#705898',
  'dragon': '#7038F8',
  'dark': '#705848',
  'steel': '#B8B8D0',
  'fairy': '#EE99AC',
}

export default function NestPin({ nest }: NestPinProps) {
  const setSelectedNest = useStore((s) => s.setSelectedNest)

  // Get primary type color
  const primaryType = nest.pokemonType[0]?.toLowerCase() || 'normal'
  const color = TYPE_COLORS[primaryType] || '#999999'

  // SVG hexagon (32x32px)
  const hexagonSvg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,2 28,8 28,24 16,30 4,24 4,8"
               fill="${color}"
               stroke="white"
               stroke-width="1.5"/>
      <circle cx="16" cy="16" r="3" fill="white" opacity="0.8"/>
    </svg>
  `

  const icon = L.divIcon({
    html: hexagonSvg,
    className: 'nest-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  const handleClick = () => {
    setSelectedNest(nest)
  }

  return (
    <Marker
      position={[nest.lat, nest.lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup>
        <div style={{ minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            {nest.name}
          </h4>
          <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#666' }}>
            <p style={{ margin: '4px 0' }}>
              <strong>Pokémon:</strong> {nest.pokemon}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Tipo:</strong> {nest.pokemonType.join(', ')}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Ubicación:</strong> {nest.city}, {nest.country}
            </p>
            {nest.spawnRate !== undefined && (
              <p style={{ margin: '4px 0' }}>
                <strong>Tasa de spawn:</strong> {nest.spawnRate}%
              </p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

import { useEffect, useMemo } from 'react'
import { MapContainer, useMap, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStore } from '../../store/useStore'
import { calculateBadges } from '../../services/weather/weatherService'
import type { City } from '../../store/useStore'
import type { Nest } from '../../types/nest'
import nestsData from '../../data/nests.json'
import MapPin from './MapPin'
import NestPin from './NestPin'
import CityTooltip from './CityTooltip'
import FlyToCity from './FlyToCity'
import MapLegend from './MapLegend'
import { Z } from '../../config/zIndex'

// ─── Tile URLs ────────────────────────────────────────────────────────────────
// dark_matter bloqueado por ORB en Chromium → usamos positron + CSS invert para dark mode.
// positron (light_all) no tiene CORS issues y con invert/hue-rotate queda dark grisáceo.
const TILES = {
  dark:  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
}

const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'

// ─── TileSwitcher — imperativo, garantiza cleanup antes de agregar nueva capa ─
// Usar key={theme} en <TileLayer> causa race condition en react-leaflet v5:
// el cleanup del layer viejo puede ejecutarse DESPUÉS del mount del nuevo,
// removiendo inmediatamente la capa recién agregada (falla en dark mode).

function TileSwitcher() {
  const theme = useStore((s) => s.theme)
  const map   = useMap()

  useEffect(() => {
    const layer = L.tileLayer(TILES[theme], { attribution: ATTRIBUTION, maxZoom: 19 })
    layer.addTo(map)
    return () => { map.removeLayer(layer) }
  }, [theme, map])

  return null
}

// ─── SelectedPopup — popup sincronizado con selectedCity ──────────────────────
// Se monta dentro de MapContainer para tener acceso al mapa.

function SelectedPopup({ cities }: { cities: City[] }) {
  const selectedCity = useStore((s) => s.selectedCity)
  const setSelectedCity = useStore((s) => s.setSelectedCity)

  if (!selectedCity) return null

  const city = cities.find((c) => c.id === selectedCity.id) ?? selectedCity

  return (
    <Popup
      position={[city.lat, city.lon]}
      eventHandlers={{ remove: () => setSelectedCity(null) }}
      closeButton={true}
      autoPan={false}
    >
      <CityTooltip city={city} />
    </Popup>
  )
}

// ─── MapView ──────────────────────────────────────────────────────────────────

interface MapViewProps {
  cities: City[]
}

export default function MapView({ cities }: MapViewProps) {
  const activeLayers = useStore((s) => s.activeLayers)
  const badgeFilter = useStore((s) => s.badgeFilter)
  const nests = useStore((s) => s.nests)
  const setNests = useStore((s) => s.setNests)

  // Load nests on mount
  useEffect(() => {
    if (nests.length === 0 && nestsData?.nests) {
      setNests(nestsData.nests as Nest[])
    }
  }, [nests.length, setNests])

  // Calcular badges por ciudad
  const badgesByCity = useMemo(() => {
    if (cities.length === 0) return new Map()
    const badgeCalculator = calculateBadges(cities)
    const badges = new Map<string, any[]>()
    cities.forEach(city => {
      badges.set(city.id, badgeCalculator(city))
    })
    return badges
  }, [cities])

  // Filtrar ciudades por badges seleccionados (OR logic)
  const filteredCities = useMemo(() => {
    if (badgeFilter.length === 0) return cities
    return cities.filter(city => {
      const cityBadges = badgesByCity.get(city.id) || []
      return cityBadges.some((badge: string) => badgeFilter.includes(badge))
    })
  }, [cities, badgeFilter, badgesByCity])

  return (
    <>
      <style>{`
        .mv-root {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: ${Z.mapBase};
        }

        /* Compactar atribución */
        .mv-root .leaflet-control-attribution {
          font-size: 9px;
          opacity: 0.5;
          background: transparent;
        }

        /* Popup dark-theme */
        .mv-root .leaflet-popup-content-wrapper {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        }

        .mv-root .leaflet-popup-tip {
          background: var(--bg-secondary);
        }

        .mv-root .leaflet-popup-content {
          margin: 12px 14px;
        }

        .mv-root .leaflet-popup-close-button {
          color: var(--text-secondary) !important;
          font-size: 16px !important;
          top: 6px !important;
          right: 8px !important;
        }

        .mv-root .leaflet-popup-close-button:hover {
          color: var(--text-primary) !important;
        }

        /* Dark mode: invierte positron → dark grisáceo sin CORS issues */
        .mv-root .leaflet-tile-container {
          filter: var(--tile-filter, none);
        }
      `}</style>

      <div className="mv-root">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          attributionControl={true}
          worldCopyJump={true}
        >
          <TileSwitcher />
          <FlyToCity />

          {/* MapPin (Clima) */}
          {activeLayers.clima &&
            filteredCities.map((city) => (
              <MapPin
                key={city.id}
                city={city}
                badges={badgesByCity.get(city.id)}
              />
            ))
          }

          {/* NestPin (Nidos) */}
          {activeLayers.nidos &&
            nests.map((nest) => (
              <NestPin key={nest.id} nest={nest} />
            ))
          }

          <SelectedPopup cities={cities} />
        </MapContainer>

        {/* Leyenda fuera del MapContainer para evitar z-index conflicts */}
        <MapLegend />
      </div>
    </>
  )
}

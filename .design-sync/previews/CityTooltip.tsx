// CityTooltip preview — popup standalone (sin MapContainer ni Leaflet)
// Variantes: ciudad soleada, ciudad con lluvia

import CityTooltip from 'pokeweather'
import { useStore } from '../../src/store/useStore'

useStore.setState({})

const CITY_SUNNY = {
  id: 'tokyo',
  name: 'Tokyo',
  country: 'Japon',
  flag: '🇯🇵',
  region: 'asia' as const,
  lat: 35.6762,
  lon: 139.6503,
  density: 6158,
  stops: 480,
  gyms: 120,
  rating: 5 as const,
  tags: ['raid'] as any,
  tips: '',
  best: 'Shinjuku',
  evento: '',
  transporte: 'metro',
  condition: 'sunny' as const,
  isExtreme: false,
  boostedTypes: ['fire', 'ground'],
  tempC: 28,
  feelsLike: 31,
  humidity: 65,
  windKmh: 12,
  gustKmh: 18,
  visibilityKm: 10,
  localTime: '14:30',
  s2Key: '',
  accuLocationKey: '',
  weatherIcon: 1,
  timezone: 9,
  updatedAt: Date.now(),
  weatherImage: '',
}

const CITY_RAIN = {
  id: 'london',
  name: 'London',
  country: 'UK',
  flag: '🇬🇧',
  region: 'europa' as const,
  lat: 51.5074,
  lon: -0.1278,
  density: 5432,
  stops: 310,
  gyms: 85,
  rating: 4 as const,
  tags: ['community'] as any,
  tips: '',
  best: 'Hyde Park',
  evento: '',
  transporte: 'tube',
  condition: 'rain' as const,
  isExtreme: false,
  boostedTypes: ['water', 'electric'],
  tempC: 14,
  feelsLike: 11,
  humidity: 88,
  windKmh: 22,
  gustKmh: 35,
  visibilityKm: 5,
  localTime: '09:15',
  s2Key: '',
  accuLocationKey: '',
  weatherIcon: 12,
  timezone: 1,
  updatedAt: Date.now(),
  weatherImage: '',
}

const CITY_SNOW = {
  id: 'helsinki',
  name: 'Helsinki',
  country: 'Finlandia',
  flag: '🇫🇮',
  region: 'europa' as const,
  lat: 60.1699,
  lon: 24.9384,
  density: 2100,
  stops: 120,
  gyms: 40,
  rating: 3 as const,
  tags: [] as any,
  tips: '',
  best: 'Esplanadi',
  evento: '',
  transporte: 'tram',
  condition: 'snow' as const,
  isExtreme: true,
  boostedTypes: ['ice', 'water'],
  tempC: -8,
  feelsLike: -14,
  humidity: 72,
  windKmh: 18,
  gustKmh: 28,
  visibilityKm: 3,
  localTime: '11:00',
  s2Key: '',
  accuLocationKey: '',
  weatherIcon: 22,
  timezone: 2,
  updatedAt: Date.now(),
  weatherImage: '',
}

const VARIANTS = [
  { city: CITY_SUNNY,  label: 'Soleado — boostedTypes: fire, ground' },
  { city: CITY_RAIN,   label: 'Lluvia — boostedTypes: water, electric' },
  { city: CITY_SNOW,   label: 'Nieve — isExtreme: true' },
]

export function CityTooltip() {
  return (
    <>
      <style>{`
        .ctp-root {
          padding: 20px;
          font-family: 'Exo 2', sans-serif;
          background: var(--bg-primary);
          border-radius: 8px;
          border: 1px solid var(--border-default);
        }

        .ctp-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .ctp-note {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .ctp-variants {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .ctp-variant {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ctp-variant-label {
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Wrapper que simula el fondo del popup de Leaflet */
        .ctp-popup-wrapper {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          overflow: hidden;
        }
      `}</style>

      <div className="ctp-root">
        <div className="ctp-title">CityTooltip — Popup de ciudad en el mapa</div>

        <div className="ctp-note">
          Se muestra como Leaflet Popup al hacer click en un MapPin.
          Contiene: nombre+condicion, tipos potenciados (imagenes), coordenadas + copiar, boton "Ver detalle".
        </div>

        <div className="ctp-variants">
          {VARIANTS.map(({ city, label }) => (
            <div key={city.id} className="ctp-variant">
              <div className="ctp-variant-label">{label}</div>
              <div className="ctp-popup-wrapper">
                <CityTooltip city={city} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

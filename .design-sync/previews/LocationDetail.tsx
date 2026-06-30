import type { City } from '../../src/store/useStore'
import { useStore } from '../../src/store/useStore'
import LocationDetail from 'pokeweather'

const MOCK_CITY: City = {
  id: 'tokyo', name: 'Tokyo', country: 'Japon', flag: '🇯🇵', region: 'asia',
  lat: 35.6762, lon: 139.6503, density: 6158, stops: 480, gyms: 120, rating: 5,
  tags: ['raid', 'nidos'], tips: 'Shinjuku', best: 'Shinjuku', evento: '', transporte: 'metro',
  condition: 'sunny', isExtreme: false, boostedTypes: ['fire', 'ground'],
  tempC: 28, feelsLike: 31, humidity: 65, windKmh: 12, gustKmh: 18, visibilityKm: 10,
  localTime: '14:30', s2Key: '', accuLocationKey: '', weatherIcon: 1, timezone: 9,
  updatedAt: Date.now(), weatherImage: ''
}

const MOCK_CITY_RAIN: City = {
  ...MOCK_CITY,
  id: 'london', name: 'Londres', country: 'Reino Unido', flag: '🇬🇧', region: 'europa',
  condition: 'rain', boostedTypes: ['water', 'electric'], tempC: 14, feelsLike: 11,
  localTime: '06:30', timezone: 1,
}

export function CiudadSoleada() {
  useStore.setState({ selectedCity: MOCK_CITY, sidebarMode: 'detail', favorites: [] })
  return (
    <div style={{ overflow: 'hidden', height: 600, position: 'relative' }}>
      <LocationDetail city={MOCK_CITY} />
    </div>
  )
}

export function CiudadConLluvia() {
  useStore.setState({ selectedCity: MOCK_CITY_RAIN, sidebarMode: 'detail', favorites: [] })
  return (
    <div style={{ overflow: 'hidden', height: 600, position: 'relative' }}>
      <LocationDetail city={MOCK_CITY_RAIN} />
    </div>
  )
}

export function CiudadFavorita() {
  useStore.setState({ selectedCity: MOCK_CITY, sidebarMode: 'detail', favorites: ['tokyo'] })
  return (
    <div style={{ overflow: 'hidden', height: 600, position: 'relative' }}>
      <LocationDetail city={MOCK_CITY} />
    </div>
  )
}

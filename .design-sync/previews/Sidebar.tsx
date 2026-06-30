import type { City } from '../../src/store/useStore'
import { useStore } from '../../src/store/useStore'
import Sidebar from 'pokeweather'

const MOCK_CITY: City = {
  id: 'tokyo', name: 'Tokyo', country: 'Japon', flag: '🇯🇵', region: 'asia',
  lat: 35.6762, lon: 139.6503, density: 6158, stops: 480, gyms: 120, rating: 5,
  tags: ['raid', 'nidos'], tips: 'Shinjuku', best: 'Shinjuku', evento: '', transporte: 'metro',
  condition: 'sunny', isExtreme: false, boostedTypes: ['fire', 'ground'],
  tempC: 28, feelsLike: 31, humidity: 65, windKmh: 12, gustKmh: 18, visibilityKm: 10,
  localTime: '14:30', s2Key: '', accuLocationKey: '', weatherIcon: 1, timezone: 9,
  updatedAt: Date.now(), weatherImage: ''
}
const MOCK_CITY_2: City = { ...MOCK_CITY, id: 'london', name: 'Londres', country: 'Reino Unido', flag: '🇬🇧', region: 'europa', condition: 'rain', boostedTypes: ['water', 'electric'], tempC: 14, localTime: '06:30', timezone: 1 }
const MOCK_CITY_3: City = { ...MOCK_CITY, id: 'nyc', name: 'Nueva York', country: 'EEUU', flag: '🇺🇸', region: 'america', condition: 'cloudy', boostedTypes: ['normal', 'flying'], tempC: 22, localTime: '01:30', timezone: -4 }

const CITIES = [MOCK_CITY, MOCK_CITY_2, MOCK_CITY_3]

const BASE_STATE = {
  sidebarMode: 'list' as const,
  selectedCity: null,
  favorites: [] as string[],
  regionFilter: 'todas',
  conditionFilter: [] as string[],
  searchQuery: '',
  sortMode: '',
  sortDirection: 'asc' as const,
  typeFilter: [] as string[],
  nests: [],
}

export function CapaClima() {
  useStore.setState({
    ...BASE_STATE,
    activeLayers: { clima: true, nidos: false, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ height: 600, width: 300, position: 'relative', overflow: 'hidden' }}>
      <Sidebar cities={CITIES} />
    </div>
  )
}

export function CapaClimaYNidos() {
  useStore.setState({
    ...BASE_STATE,
    activeLayers: { clima: true, nidos: true, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ height: 600, width: 300, position: 'relative', overflow: 'hidden' }}>
      <Sidebar cities={CITIES} />
    </div>
  )
}

export function SinCapasActivas() {
  useStore.setState({
    ...BASE_STATE,
    activeLayers: { clima: false, nidos: false, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ height: 600, width: 300, position: 'relative', overflow: 'hidden' }}>
      <Sidebar cities={CITIES} />
    </div>
  )
}

export function SoloNidos() {
  useStore.setState({
    ...BASE_STATE,
    activeLayers: { clima: false, nidos: true, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ height: 600, width: 300, position: 'relative', overflow: 'hidden' }}>
      <Sidebar cities={CITIES} />
    </div>
  )
}

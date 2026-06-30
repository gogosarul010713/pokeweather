import { LocationCard } from 'pokeweather'
import { useStore } from '../../src/store/useStore'
import type { City } from '../../src/store/useStore'

const MOCK_CITY: City = {
  id: 'tokyo',
  name: 'Tokyo',
  country: 'Japon',
  flag: '🇯🇵',
  region: 'asia',
  lat: 35.6762,
  lon: 139.6503,
  density: 6158,
  stops: 480,
  gyms: 120,
  rating: 5,
  tags: ['raid', 'nidos', 'turistico'],
  tips: 'Zona Shinjuku densisima',
  best: 'Shinjuku',
  evento: '',
  transporte: 'metro',
  condition: 'sunny',
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

const MOCK_CITY_RAIN: City = {
  ...MOCK_CITY,
  id: 'london',
  name: 'Londres',
  country: 'Reino Unido',
  flag: '🇬🇧',
  region: 'europa',
  condition: 'rain',
  boostedTypes: ['water', 'electric'],
  tempC: 14,
  localTime: '06:30',
  timezone: 1,
}

function Seed({ children }: { children: React.ReactNode }) {
  useStore.setState({ favorites: [] })
  return <>{children}</>
}

export function Default() {
  return (
    <Seed>
      <div style={{ width: 320, padding: 8 }}>
        <LocationCard city={MOCK_CITY} isActive={false} />
      </div>
    </Seed>
  )
}

export function Active() {
  return (
    <Seed>
      <div style={{ width: 320, padding: 8 }}>
        <LocationCard city={MOCK_CITY} isActive={true} />
      </div>
    </Seed>
  )
}

export function RainCondition() {
  return (
    <Seed>
      <div style={{ width: 320, padding: 8 }}>
        <LocationCard city={MOCK_CITY_RAIN} isActive={false} />
      </div>
    </Seed>
  )
}

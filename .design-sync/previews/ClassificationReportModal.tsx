import type { City } from '../../src/store/useStore'
import { useStore } from '../../src/store/useStore'
import ClassificationReportModal from 'pokeweather'

const MOCK_CITY: City = {
  id: 'tokyo', name: 'Tokyo', country: 'Japon', flag: '🇯🇵', region: 'asia',
  lat: 35.6762, lon: 139.6503, density: 6158, stops: 480, gyms: 120, rating: 5,
  tags: ['raid', 'nidos'], tips: 'Shinjuku', best: 'Shinjuku', evento: '', transporte: 'metro',
  condition: 'sunny', isExtreme: false, boostedTypes: ['fire', 'ground'],
  tempC: 28, feelsLike: 31, humidity: 65, windKmh: 12, gustKmh: 18, visibilityKm: 10,
  localTime: '14:30', s2Key: '', accuLocationKey: '', weatherIcon: 1, timezone: 9,
  updatedAt: Date.now(), weatherImage: ''
}

export function ModalAbierto() {
  useStore.setState({ selectedCity: MOCK_CITY })
  return (
    <div style={{ height: 600, position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <ClassificationReportModal
        city={MOCK_CITY}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    </div>
  )
}

export function ModalConCondicionSeleccionada() {
  useStore.setState({ selectedCity: MOCK_CITY })
  // Nota: selectedCondition es estado local del componente, no del store.
  // Este preview muestra el modal recien abierto; el dropdown se interactua manualmente.
  return (
    <div style={{ height: 600, position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <ClassificationReportModal
        city={MOCK_CITY}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    </div>
  )
}

export function ModalCiudadRain() {
  const CITY_RAIN: City = {
    ...MOCK_CITY,
    id: 'london',
    name: 'Londres',
    country: 'Reino Unido',
    flag: '🇬🇧',
    region: 'europa',
    condition: 'rain',
    boostedTypes: ['water', 'electric'],
    tempC: 14,
  }
  useStore.setState({ selectedCity: CITY_RAIN })
  return (
    <div style={{ height: 600, position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <ClassificationReportModal
        city={CITY_RAIN}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    </div>
  )
}

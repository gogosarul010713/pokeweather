import { useStore } from '../../src/store/useStore'
import FilterPanel from 'pokeweather'

export function SoloClima() {
  useStore.setState({
    activeLayers: { clima: true, nidos: false, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ width: 300, background: 'var(--bg-secondary)' }}>
      <FilterPanel />
    </div>
  )
}

export function SoloNidos() {
  useStore.setState({
    activeLayers: { clima: false, nidos: true, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ width: 300, background: 'var(--bg-secondary)' }}>
      <FilterPanel />
    </div>
  )
}

export function AmbosActivos() {
  useStore.setState({
    activeLayers: { clima: true, nidos: true, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ width: 300, background: 'var(--bg-secondary)' }}>
      <FilterPanel />
    </div>
  )
}

export function NingunaCapaActiva() {
  useStore.setState({
    activeLayers: { clima: false, nidos: false, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ width: 300, background: 'var(--bg-secondary)' }}>
      <FilterPanel />
    </div>
  )
}

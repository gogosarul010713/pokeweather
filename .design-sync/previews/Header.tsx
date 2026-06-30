import { useStore } from '../../src/store/useStore'
import Header from 'pokeweather'

const baseState = {
  theme: 'dark' as const,
  activeLayers: { clima: true, nidos: false, gyms: false, stops: false, rutas: false },
  searchQuery: '',
  isFilterPanelOpen: false,
  sortMode: '',
  sortDirection: 'asc' as const,
}

export function Default() {
  useStore.setState(baseState)
  return (
    <div style={{ width: '100%', background: 'var(--bg-secondary)' }}>
      <Header />
    </div>
  )
}

export function WithSearch() {
  useStore.setState({ ...baseState, searchQuery: 'Tokyo' })
  return (
    <div style={{ width: '100%', background: 'var(--bg-secondary)' }}>
      <Header />
    </div>
  )
}

export function MultiLayers() {
  useStore.setState({
    ...baseState,
    activeLayers: { clima: true, nidos: true, gyms: false, stops: false, rutas: false },
  })
  return (
    <div style={{ width: '100%', background: 'var(--bg-secondary)' }}>
      <Header />
    </div>
  )
}

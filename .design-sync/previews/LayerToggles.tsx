import { LayerToggles } from 'pokeweather'
import { useStore } from '../../src/store/useStore'

function SeedClimaOnly({ children }: { children: React.ReactNode }) {
  useStore.setState({
    activeLayers: { clima: true, nidos: false, gyms: false, stops: false, rutas: false },
  })
  return <>{children}</>
}

function SeedClimaAndNidos({ children }: { children: React.ReactNode }) {
  useStore.setState({
    activeLayers: { clima: true, nidos: true, gyms: false, stops: false, rutas: false },
  })
  return <>{children}</>
}

function SeedAllActive({ children }: { children: React.ReactNode }) {
  useStore.setState({
    activeLayers: { clima: true, nidos: true, gyms: true, stops: true, rutas: true },
  })
  return <>{children}</>
}

export function LayerTogglesClimaOnly() {
  return (
    <SeedClimaOnly>
      <div
        style={{
          height: 56,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'stretch',
          width: 600,
        }}
      >
        <LayerToggles />
      </div>
    </SeedClimaOnly>
  )
}

export function LayerTogglesClimaAndNidos() {
  return (
    <SeedClimaAndNidos>
      <div
        style={{
          height: 56,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'stretch',
          width: 600,
        }}
      >
        <LayerToggles />
      </div>
    </SeedClimaAndNidos>
  )
}

export function LayerTogglesAllActive() {
  return (
    <SeedAllActive>
      <div
        style={{
          height: 56,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'stretch',
          width: 700,
        }}
      >
        <LayerToggles />
      </div>
    </SeedAllActive>
  )
}

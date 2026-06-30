import FilterPanelClima from 'pokeweather'
import { useStore } from '../../src/store/useStore'

function SeedEmpty({ children }: { children: React.ReactNode }) {
  useStore.setState({
    regionFilter: 'todas',
    conditionFilter: [],
    typeFilter: [],
    sortMode: '',
    sortDirection: 'asc',
    searchQuery: '',
  })
  return <>{children}</>
}

function SeedWithFilters({ children }: { children: React.ReactNode }) {
  useStore.setState({
    regionFilter: 'asia',
    conditionFilter: ['sunny', 'rain'],
    typeFilter: ['fire', 'water'],
    sortMode: 'name',
    sortDirection: 'asc',
    searchQuery: '',
  })
  return <>{children}</>
}

export function FilterPanelClimaEmpty() {
  return (
    <SeedEmpty>
      <div
        style={{
          padding: 16,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          width: 900,
        }}
      >
        <FilterPanelClima />
      </div>
    </SeedEmpty>
  )
}

export function FilterPanelClimaWithFilters() {
  return (
    <SeedWithFilters>
      <div
        style={{
          padding: 16,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          width: 900,
        }}
      >
        <FilterPanelClima />
      </div>
    </SeedWithFilters>
  )
}

export function FilterPanelClimaTablet() {
  return (
    <SeedEmpty>
      <div
        style={{
          padding: 12,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          width: 768,
        }}
      >
        <FilterPanelClima />
      </div>
    </SeedEmpty>
  )
}

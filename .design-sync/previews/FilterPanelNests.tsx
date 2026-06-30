import FilterPanelNests from 'pokeweather'
import { useStore } from '../../src/store/useStore'

function SeedDefault({ children }: { children: React.ReactNode }) {
  useStore.setState({
    nestTypeFilter: [],
    nestSortBy: 'name',
    nestSortDirection: 'asc',
  })
  return <>{children}</>
}

function SeedWithTypeFilter({ children }: { children: React.ReactNode }) {
  useStore.setState({
    nestTypeFilter: ['dragon', 'psychic'],
    nestSortBy: 'name',
    nestSortDirection: 'asc',
  })
  return <>{children}</>
}

function SeedWithSortAndFilter({ children }: { children: React.ReactNode }) {
  useStore.setState({
    nestTypeFilter: ['fire'],
    nestSortBy: 'density',
    nestSortDirection: 'desc',
  })
  return <>{children}</>
}

export function FilterPanelNestsDefault() {
  return (
    <SeedDefault>
      <div
        style={{
          padding: 16,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          width: 700,
        }}
      >
        <FilterPanelNests />
      </div>
    </SeedDefault>
  )
}

export function FilterPanelNestsWithTypeFilter() {
  return (
    <SeedWithTypeFilter>
      <div
        style={{
          padding: 16,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          width: 700,
        }}
      >
        <FilterPanelNests />
      </div>
    </SeedWithTypeFilter>
  )
}

export function FilterPanelNestsSortedByDensity() {
  return (
    <SeedWithSortAndFilter>
      <div
        style={{
          padding: 16,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          width: 700,
        }}
      >
        <FilterPanelNests />
      </div>
    </SeedWithSortAndFilter>
  )
}

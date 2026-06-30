import { useStore } from '../../src/store/useStore'
import FilterPanelModal from 'pokeweather/src/components/UI/FilterPanelModal'

export function FilterPanelModalOpen() {
  useStore.setState({
    regionFilter: 'asia',
    conditionFilter: ['sunny', 'rain'],
    typeFilter: ['fire', 'water'],
    sortMode: 'name',
    sortDirection: 'asc',
  })
  return (
    <div style={{ position: 'relative', height: 600, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <FilterPanelModal isOpen={true} onClose={() => {}} />
    </div>
  )
}

export function FilterPanelModalClosed() {
  useStore.setState({
    regionFilter: 'todas',
    conditionFilter: [],
    typeFilter: [],
    sortMode: '',
    sortDirection: 'asc',
  })
  return (
    <div style={{ height: 200, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        FilterPanelModal cerrado (isOpen: false)
      </span>
      <FilterPanelModal isOpen={false} onClose={() => {}} />
    </div>
  )
}

export function FilterPanelModalNoFilters() {
  useStore.setState({
    regionFilter: 'todas',
    conditionFilter: [],
    typeFilter: [],
    sortMode: '',
    sortDirection: 'asc',
  })
  return (
    <div style={{ position: 'relative', height: 600, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <FilterPanelModal isOpen={true} onClose={() => {}} />
    </div>
  )
}

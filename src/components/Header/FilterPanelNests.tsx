import { useCallback } from 'react'
import { useStore } from '../../store/useStore'
import CustomSelect from '../UI/CustomSelect'
import SortDropdown from './SortDropdown'
import { POKEMON_TYPES, TYPE_IMAGES } from '../../config/pokemonTypes'

export default function FilterPanelNests() {
  const nestTypeFilter = useStore((s) => s.nestTypeFilter)
  const nestSortBy = useStore((s) => s.nestSortBy)
  const nestSortDirection = useStore((s) => s.nestSortDirection)
  const setNestTypeFilter = useStore((s) => s.setNestTypeFilter)
  const setNestSortBy = useStore((s) => s.setNestSortBy)
  const setNestSortDirection = useStore((s) => s.setNestSortDirection)

  const hasActiveFilters = nestTypeFilter.length > 0 || nestSortBy !== 'name'

  const handleTypeChange = (items: string | string[]) => {
    const selected = Array.isArray(items) ? items : (items ? [items] : [])
    setNestTypeFilter(selected)
  }

  const handleSortChange = useCallback((mode: string, direction: string) => {
    setNestSortBy(mode as any)
    setNestSortDirection(direction as any)
  }, [setNestSortBy, setNestSortDirection])

  const handleClearAll = () => {
    setNestTypeFilter([])
    setNestSortBy('name')
    setNestSortDirection('asc')
  }

  return (
    <>
      <style>{`
        .fpn-root {
          display: flex;
          gap: 8px;
          align-items: center;
          flex: 1;
          flex-wrap: wrap;
          min-height: 48px;
          max-width: none;
        }

        .fpn-divider {
          width: 1px;
          height: 28px;
          background: var(--border-default);
        }

        .fpn-clear-btn {
          position: relative;
          width: 32px;
          height: 32px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 200ms ease;
        }

        .fpn-clear-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border-color: var(--border-strong);
          transform: rotate(-20deg);
        }

        .fpn-clear-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--ui-accent);
          color: var(--bg-primary);
          border-radius: 10px;
          font-size: 9px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          pointer-events: none;
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .fpn-root {
            gap: 6px;
            height: 44px;
          }
        }
      `}</style>

      <div className="fpn-root">
        {/* Tipo Pokémon - Multi-select */}
        <CustomSelect
          label="Tipo"
          selectedItems={nestTypeFilter}
          options={POKEMON_TYPES.map((type) => ({
            label: type.charAt(0).toUpperCase() + type.slice(1),
            value: type,
            icon: TYPE_IMAGES[type],
          }))}
          onChange={handleTypeChange}
          isMulti={true}
        />

        {/* Ordenamiento */}
        <SortDropdown
          sortMode={nestSortBy}
          sortDirection={nestSortDirection}
          onSortChange={handleSortChange}
        />

        {/* Botón Restablecer — solo si hay filtros activos */}
        {hasActiveFilters && (
          <button
            className="fpn-clear-btn"
            onClick={handleClearAll}
            title={`Restablecer ${nestTypeFilter.length > 0 ? nestTypeFilter.length + ' tipo(s)' : ''} ${nestSortBy !== 'name' ? '+ orden' : ''}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="fpn-divider" />
      </div>
    </>
  )
}

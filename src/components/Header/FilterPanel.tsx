import { useCallback } from 'react'
import { useStore } from '../../store/useStore'
import CustomSelect from '../UI/CustomSelect'
import type { SelectOption } from '../UI/CustomSelect'
import SortDropdown from './SortDropdown'
import SearchInput from './SearchInput'

const POKEMON_TYPES = [
  'fire', 'ground', 'normal', 'flying', 'ghost', 'dark',
  'water', 'electric', 'ice', 'steel', 'dragon', 'rock',
  'poison', 'psychic', 'bug', 'grass', 'fighting', 'fairy',
]

// Map type to image icon (ico_n_type.webp)
const TYPE_IMAGES: Record<string, string> = {
  normal: '/types/ico_0_normal.webp',
  fighting: '/types/ico_1_fighting.webp',
  flying: '/types/ico_2_flying.webp',
  poison: '/types/ico_3_poison.webp',
  ground: '/types/ico_4_ground.webp',
  rock: '/types/ico_5_rock.webp',
  bug: '/types/ico_6_bug.webp',
  ghost: '/types/ico_7_ghost.webp',
  steel: '/types/ico_8_steel.webp',
  fire: '/types/ico_9_fire.webp',
  water: '/types/ico_10_water.webp',
  grass: '/types/ico_11_grass.webp',
  electric: '/types/ico_12_electric.webp',
  psychic: '/types/ico_13_psychic.webp',
  ice: '/types/ico_14_ice.webp',
  dragon: '/types/ico_15_dragon.webp',
  dark: '/types/ico_16_dark.webp',
  fairy: '/types/ico_17_fairy.webp',
}


const REGION_OPTIONS: SelectOption[] = [
  { label: 'Todas', value: 'todas' },
  { label: '🌏 Asia', value: 'asia' },
  { label: '🌍 Europa', value: 'europa' },
  { label: '🌎 América', value: 'america' },
  { label: '🌊 Oceanía', value: 'oceania' },
  { label: '🌍 África', value: 'africa' },
]

const CLIMATE_OPTIONS: SelectOption[] = [
  { label: 'Sunny',  value: 'sunny',  icon: '/weather/sunny.png'  },
  { label: 'Partly', value: 'partly', icon: '/weather/partly.png' },
  { label: 'Cloudy', value: 'cloudy', icon: '/weather/cloudy.png' },
  { label: 'Fog',    value: 'fog',    icon: '/weather/fog.png'    },
  { label: 'Rain',   value: 'rain',   icon: '/weather/rain.png'   },
  { label: 'Snow',   value: 'snow',   icon: '/weather/snow.png'   },
  { label: 'Windy',  value: 'windy',  icon: '/weather/windy.png'  },
]


export default function FilterPanel() {
  const regionFilter = useStore((s) => s.regionFilter)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter = useStore((s) => s.typeFilter)
  const sortMode = useStore((s) => s.sortMode)
  const sortDirection = useStore((s) => s.sortDirection)
  const setRegionFilter = useStore((s) => s.setRegionFilter)
  const setConditionFilter = useStore((s) => s.setConditionFilter)
  const setTypeFilter = useStore((s) => s.setTypeFilter)
  const setSortMode = useStore((s) => s.setSortMode)
  const setSortDirection = useStore((s) => s.setSortDirection)

  const handleConditionChange = (items: string | string[]) => {
    setConditionFilter(Array.isArray(items) ? items : [items])
  }

  // Handler para cambios de ordenamiento (criterio + dirección)
  const handleSortChange = useCallback((mode: string, direction: string) => {
    setSortMode(mode as any)
    setSortDirection(direction as any)
  }, [setSortMode, setSortDirection])

  const activeFilterCount =
    (regionFilter !== 'todas' ? 1 : 0) +
    conditionFilter.length +
    typeFilter.length +
    (sortMode !== '' ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  const handleClearAll = () => {
    setRegionFilter('todas')
    setConditionFilter([])
    setTypeFilter([])
    setSortMode('' as any)
    setSortDirection('asc')
  }

  return (
    <>
      <style>{`
        .fp-root {
          display: flex;
          gap: 8px;
          align-items: center;
          flex: 1;
          height: 48px;
          max-width: none;
        }

        .fp-filters {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .fp-divider {
          width: 1px;
          height: 28px;
          background: var(--border-default);
        }

        .fp-clear-btn {
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

        .fp-clear-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border-color: var(--border-strong);
          transform: rotate(-20deg);
        }

        .fp-clear-badge {
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

        .fp-search-wrapper {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
        }

        /* TABLET: Make FilterPanel more compact */
        @media (min-width: 768px) and (max-width: 1023px) {
          .fp-root {
            gap: 6px;
            height: 44px;
          }

          .fp-filters {
            gap: 6px;
          }
        }

      `}</style>

      <div className="fp-root">
        {/* Continente */}
        <CustomSelect
          label="Continente"
          value={regionFilter}
          options={REGION_OPTIONS}
          onChange={(v) => setRegionFilter(v as any)}
          isMulti={false}
        />

        {/* Clima */}
        <CustomSelect
          label="Clima"
          selectedItems={conditionFilter}
          options={CLIMATE_OPTIONS}
          onChange={handleConditionChange}
          isMulti={true}
        />

        {/* Tipo Pokémon - Multi-select with images */}
        <CustomSelect
          label="Tipo"
          selectedItems={typeFilter}
          options={POKEMON_TYPES.map((type) => ({
            label: type.charAt(0).toUpperCase() + type.slice(1),
            value: type,
            icon: TYPE_IMAGES[type],
          }))}
          onChange={(items) => {
            const selected = Array.isArray(items) ? items : [items]
            setTypeFilter(selected)
          }}
          isMulti={true}
        />

        {/* Ordenamiento unificado */}
        <SortDropdown
          sortMode={sortMode}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />

        {/* Botón Restablecer — icono compacto con badge de conteo */}
        {hasActiveFilters && (
          <button
            className="fp-clear-btn"
            onClick={handleClearAll}
            title={`Restablecer ${activeFilterCount} filtro${activeFilterCount > 1 ? 's' : ''}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="fp-clear-badge">{activeFilterCount}</span>
          </button>
        )}

        {/* Divider */}
        <div className="fp-divider" />

        {/* SearchInput */}
        <div className="fp-search-wrapper">
          <SearchInput />
        </div>
      </div>
    </>
  )
}

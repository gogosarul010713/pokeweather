import { useState } from 'react'
import { useStore } from '../../store/useStore'
import CustomSelect from '../UI/CustomSelect'
import type { SelectOption } from '../UI/CustomSelect'
import SearchInput from './SearchInput'

const POKEMON_TYPES = [
  'fire', 'ground', 'normal', 'flying', 'ghost', 'dark',
  'water', 'electric', 'ice', 'steel', 'dragon', 'rock',
  'poison', 'psychic', 'bug', 'grass', 'fighting', 'fairy',
]

const TYPE_EMOJIS: Record<string, string> = {
  fire: '🔥', ground: '⛰️', normal: '⚪', flying: '🦅',
  ghost: '👻', dark: '🌑', water: '💧', electric: '⚡',
  ice: '❄️', steel: '⚙️', dragon: '🐲', rock: '🪨',
  poison: '☠️', psychic: '🧠', bug: '🐛', grass: '🌿',
  fighting: '👊', fairy: '✨',
}

interface TypeFilterDropdownProps {
  typeFilter: string[]
  toggleType: (type: string) => void
}

function TypeFilterDropdown({ typeFilter, toggleType }: TypeFilterDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fp-type-container">
      <button
        className="fp-type-trigger"
        onClick={() => setOpen(!open)}
        title={typeFilter.length > 0 ? `${typeFilter.length} tipos` : 'Seleccionar tipos'}
        type="button"
      >
        🔥 Tipos {typeFilter.length > 0 && `(${typeFilter.length})`}
      </button>

      {open && (
        <div className="fp-type-dropdown">
          <div className="fp-type-grid">
            {POKEMON_TYPES.map((type) => {
              const isActive = typeFilter.includes(type)
              return (
                <button
                  key={type}
                  className={`fp-type-btn ${isActive ? 'active' : ''}`}
                  onClick={() => toggleType(type)}
                  title={type}
                  type="button"
                >
                  {TYPE_EMOJIS[type]} {type.charAt(0).toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
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

const SORT_OPTIONS: SelectOption[] = [
  { label: 'Ordenar por', value: '' },
  { label: 'Nombre', value: 'name' },
  { label: 'Densidad', value: 'density' },
  { label: 'Rating', value: 'rating' },
  { label: 'Hora Local', value: 'time' },
]

export default function FilterPanel() {
  const regionFilter = useStore((s) => s.regionFilter)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter = useStore((s) => s.typeFilter)
  const sortMode = useStore((s) => s.sortMode)
  const setRegionFilter = useStore((s) => s.setRegionFilter)
  const setConditionFilter = useStore((s) => s.setConditionFilter)
  const clearConditions = useStore((s) => s.clearConditions)
  const toggleType = useStore((s) => s.toggleType)
  const setSortMode = useStore((s) => s.setSortMode)

  const handleConditionChange = (items: string | string[]) => {
    setConditionFilter(Array.isArray(items) ? items : [items])
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
          padding: 8px 12px;
          background: rgba(248, 81, 73, 0.1);
          color: var(--ui-error);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 200ms ease;
        }

        .fp-clear-btn:hover {
          background: rgba(248, 81, 73, 0.2);
          border-color: var(--ui-error);
        }

        .fp-search-wrapper {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
        }

        /* ── Type Filter Dropdown ── */
        .fp-type-container {
          position: relative;
        }

        .fp-type-trigger {
          padding: 6px 10px;
          background: transparent;
          border: 1px solid var(--border-default);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 12px;
          cursor: pointer;
          transition: all 150ms ease;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fp-type-trigger:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-default);
        }

        .fp-type-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          padding: 8px;
          z-index: 1001;
          min-width: 200px;
          max-height: 250px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .fp-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        .fp-type-btn {
          padding: 4px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 11px;
          transition: all 100ms ease;
          text-align: center;
        }

        .fp-type-btn:hover {
          background: var(--bg-tertiary);
        }

        .fp-type-btn.active {
          background: rgba(88, 166, 255, 0.2);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
          font-weight: 600;
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

        {/* Tipo Pokémon - Grid Dropdown */}
        <TypeFilterDropdown typeFilter={typeFilter} toggleType={toggleType} />

        {/* Ordenar por */}
        <CustomSelect
          label="Ordenar por"
          value={sortMode || ''}
          options={SORT_OPTIONS}
          onChange={(v) => setSortMode(v as any)}
          isMulti={false}
        />

        {/* Botón Limpiar (solo si hay filtros activos) */}
        {conditionFilter.length > 0 && (
          <button className="fp-clear-btn" onClick={clearConditions}>
            ✕ Limpiar
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

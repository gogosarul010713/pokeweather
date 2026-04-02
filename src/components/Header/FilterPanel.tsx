import { useCallback } from 'react'
import { useStore } from '../../store/useStore'
import CustomSelect from '../UI/CustomSelect'
import type { SelectOption } from '../UI/CustomSelect'
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

const SORT_OPTIONS_BASE: SelectOption[] = [
  { label: 'Ordenar por', value: '', description: '↓ Elige el criterio' },
  { label: '🔤 Nombre', value: 'name', description: 'Ordenar alfabéticamente' },
  { label: '📊 Densidad', value: 'density', description: 'Mayor densidad primero' },
  { label: '⭐ Rating', value: 'rating', description: 'Mayor rating primero' },
  { label: '🕐 Hora Local', value: 'time', description: 'Más temprano primero' },
]

// Helper function para generar los labels dinámicos basado en sortDirection
const getDisplayLabel = (mode: string, direction: string): string => {
  if (mode === '') return 'Ordenar por'

  const dirIcon = direction === 'asc' ? '↑' : '↓'
  const emoji: Record<string, string> = {
    'name': '🔤',
    'density': '📊',
    'rating': '⭐',
    'time': '🕐'
  }

  const labels: Record<string, string> = {
    'name': 'Nombre',
    'density': 'Densidad',
    'rating': 'Rating',
    'time': 'Hora Local'
  }

  return `${emoji[mode] || ''} ${labels[mode] || ''} (${dirIcon})`
}

export default function FilterPanel() {
  const regionFilter = useStore((s) => s.regionFilter)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter = useStore((s) => s.typeFilter)
  const sortMode = useStore((s) => s.sortMode)
  const sortDirection = useStore((s) => s.sortDirection)
  const setRegionFilter = useStore((s) => s.setRegionFilter)
  const setConditionFilter = useStore((s) => s.setConditionFilter)
  const setTypeFilter = useStore((s) => s.setTypeFilter)
  const clearConditions = useStore((s) => s.clearConditions)
  const setSortMode = useStore((s) => s.setSortMode)
  const setSortDirection = useStore((s) => s.setSortDirection)

  const handleConditionChange = (items: string | string[]) => {
    setConditionFilter(Array.isArray(items) ? items : [items])
  }

  const toggleSortDirection = useCallback(() => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    console.log('🔄 toggleSortDirection:', {
      currentDirection: sortDirection,
      newDirection,
      sortMode,
      timestamp: new Date().toISOString(),
    })
    setSortDirection(newDirection)
  }, [sortDirection, setSortDirection])

  // Generar las opciones de ordenamiento dinámicamente basado en sortDirection
  const SORT_OPTIONS = SORT_OPTIONS_BASE.map((opt) => ({
    ...opt,
    label: opt.value === '' ? 'Ordenar por' : getDisplayLabel(opt.value, sortDirection),
  }))

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

        .fp-sort-direction-btn {
          padding: 6px 10px;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 200ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 32px;
        }

        .fp-sort-direction-btn:hover:not(:disabled) {
          background: var(--bg-overlay);
          border-color: var(--border-strong);
        }

        .fp-sort-direction-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
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

        {/* Ordenar por */}
        <CustomSelect
          label="Ordenar por"
          value={sortMode || ''}
          options={SORT_OPTIONS}
          onChange={(v) => setSortMode(v as any)}
          isMulti={false}
        />

        {/* Toggle Dirección (solo si hay ordenamiento activo) */}
        {sortMode !== '' && (
          <button
            className="fp-sort-direction-btn"
            onClick={toggleSortDirection}
            title={`Cambiar a ${sortDirection === 'asc' ? 'descendente' : 'ascendente'}`}
            type="button"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        )}

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

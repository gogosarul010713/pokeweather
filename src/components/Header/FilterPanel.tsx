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
  const clearConditions = useStore((s) => s.clearConditions)
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

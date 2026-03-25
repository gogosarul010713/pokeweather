import { useStore } from '../../store/useStore'
import CustomSelect from '../UI/CustomSelect'
import type { SelectOption } from '../UI/CustomSelect'
import SearchInput from './SearchInput'

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
  const sortMode = useStore((s) => s.sortMode)
  const setRegionFilter = useStore((s) => s.setRegionFilter)
  const setConditionFilter = useStore((s) => s.setConditionFilter)
  const clearConditions = useStore((s) => s.clearConditions)
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

        {/* Tipo Pokémon (placeholder) */}
        <CustomSelect
          label="Tipo Pokémon"
          options={[{ label: 'Todos (próximamente)', value: 'all' }]}
          onChange={() => {}}
          disabled={true}
          isMulti={false}
        />

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

import { useStore } from '../../store/useStore'
import CustomSelect from './CustomSelect'
import type { SelectOption } from './CustomSelect'

const REGION_OPTIONS: SelectOption[] = [
  { label: 'Todas', value: 'todas' },
  { label: '🌏 Asia', value: 'asia' },
  { label: '🌍 Europa', value: 'europa' },
  { label: '🌎 América', value: 'america' },
  { label: '🌊 Oceanía', value: 'oceania' },
  { label: '🌍 África', value: 'africa' },
]

const CLIMATE_OPTIONS: SelectOption[] = [
  { label: '☀️ Soleado', value: 'sunny' },
  { label: '⛅ Parcial', value: 'partly' },
  { label: '☁️ Nublado', value: 'cloudy' },
  { label: '🌫️ Niebla', value: 'fog' },
  { label: '🌧️ Lluvia', value: 'rain' },
  { label: '❄️ Nieve', value: 'snow' },
  { label: '💨 Ventoso', value: 'windy' },
]

interface FilterPanelModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FilterPanelModal({ isOpen, onClose }: FilterPanelModalProps) {
  const regionFilter = useStore((s) => s.regionFilter)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const setRegionFilter = useStore((s) => s.setRegionFilter)
  const setConditionFilter = useStore((s) => s.setConditionFilter)
  const clearConditions = useStore((s) => s.clearConditions)

  const handleConditionChange = (items: string | string[]) => {
    setConditionFilter(Array.isArray(items) ? items : [items])
  }

  const handleToggleCondition = (condition: string) => {
    const newConditions = conditionFilter.includes(condition)
      ? conditionFilter.filter((c) => c !== condition)
      : [...conditionFilter, condition]
    setConditionFilter(newConditions)
  }

  const handleApply = () => {
    onClose()
  }

  const handleClearAll = () => {
    clearConditions()
    setRegionFilter('todas')
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`
        .fpm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 499;
          animation: fadeIn 200ms ease;
        }

        .fpm-modal {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-height: 85vh;
          background: var(--bg-secondary);
          border-radius: 16px 16px 0 0;
          z-index: 500;
          animation: slideUp 300ms ease;
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--border-default);
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
        }

        .fpm-handle {
          width: 40px;
          height: 4px;
          background: var(--border-default);
          border-radius: 2px;
          margin: 12px auto 0;
        }

        .fpm-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px 16px 16px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .fpm-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }

        .fpm-dropdowns {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .fpm-dropdown {
          flex: 1;
          min-width: 100px;
        }

        .fpm-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .fpm-section-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .fpm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .fpm-grid-btn {
          padding: 10px 8px;
          background: var(--bg-primary);
          border: 2px solid var(--border-default);
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-primary);
          transition: all 200ms ease;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 2px;
        }

        .fpm-grid-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        .fpm-grid-btn.active {
          background: var(--bg-overlay);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
          font-weight: 600;
        }

        .fpm-footer {
          padding: 16px;
          border-top: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-shrink: 0;
        }

        .fpm-apply-btn {
          width: 100%;
          padding: 12px;
          background: var(--ui-accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 200ms ease;
        }

        .fpm-apply-btn:hover {
          filter: brightness(1.15);
        }

        .fpm-apply-btn:active {
          filter: brightness(0.95);
        }

        .fpm-footer-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .fpm-clear-all-btn {
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

        .fpm-clear-all-btn:hover {
          background: rgba(248, 81, 73, 0.2);
          border-color: var(--ui-error);
        }
      `}</style>

      {/* Backdrop */}
      <div className="fpm-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="fpm-modal">
        {/* Drag handle */}
        <div className="fpm-handle" />

        {/* Header con dropdowns */}
        <div className="fpm-header">
          <div className="fpm-title">Filtrar ciudades</div>

          <div className="fpm-dropdowns">
            {/* Región */}
            <div className="fpm-dropdown">
              <CustomSelect
                label="Región"
                value={regionFilter}
                options={REGION_OPTIONS}
                onChange={(v) => setRegionFilter(v as any)}
                isMulti={false}
              />
            </div>

            {/* Clima (placeholder, se controla con grid abajo) */}
            <div className="fpm-dropdown">
              <CustomSelect
                label={`Clima (${conditionFilter.length})`}
                selectedItems={conditionFilter}
                options={CLIMATE_OPTIONS}
                onChange={handleConditionChange}
                isMulti={true}
              />
            </div>
          </div>
        </div>

        {/* Content con grids */}
        <div className="fpm-content">
          {/* Grid Condiciones climáticas */}
          <div>
            <div className="fpm-section-title">☀️ Condiciones Climáticas</div>
            <div className="fpm-grid">
              {CLIMATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`fpm-grid-btn ${conditionFilter.includes(option.value) ? 'active' : ''}`}
                  onClick={() => handleToggleCondition(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Placeholder para Tipos */}
          <div>
            <div className="fpm-section-title">⚡ Tipos Pokémon</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              Próximamente disponible
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="fpm-footer">
          <button className="fpm-apply-btn" onClick={handleApply}>
            ✓ Aplicar Filtros
          </button>

          <div className="fpm-footer-meta">
            <span>Filtros activos: {conditionFilter.length}</span>
            <button className="fpm-clear-all-btn" onClick={handleClearAll}>
              Limpiar todos
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

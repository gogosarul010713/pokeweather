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

  const handleApply = () => {
    onClose()
  }

  const handleClearAll = () => {
    setRegionFilter('todas')
    clearConditions()
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`
        .fpm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
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
          border-top: 1px solid var(--border-default);
          border-radius: 12px 12px 0 0;
          display: flex;
          flex-direction: column;
          z-index: 500;
          animation: slideUp 300ms ease;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .fpm-handle {
          width: 40px;
          height: 4px;
          background: var(--border-default);
          border-radius: 2px;
          margin: 12px auto;
          flex-shrink: 0;
          cursor: grab;
        }

        .fpm-handle:active {
          cursor: grabbing;
        }

        .fpm-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 16px 16px;
        }

        .fpm-section {
          margin-bottom: 20px;
        }

        .fpm-section-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          padding-top: 8px;
        }

        .fpm-dropdowns {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .fpm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }

        .fpm-condition-btn {
          padding: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 150ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .fpm-condition-btn:hover {
          background: var(--bg-tertiary);
        }

        .fpm-condition-btn.active {
          background: rgba(88, 166, 255, 0.2);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .fpm-condition-emoji {
          font-size: 16px;
        }

        .fpm-footer {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--border-default);
          background: var(--bg-primary);
        }

        .fpm-apply-btn {
          width: 100%;
          padding: 12px;
          background: var(--ui-accent);
          color: var(--bg-primary);
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 200ms ease;
        }

        .fpm-apply-btn:hover {
          background: rgba(88, 166, 255, 0.8);
        }

        .fpm-footer-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-secondary);
          padding: 0 4px;
        }

        .fpm-clear-link {
          color: var(--ui-error);
          cursor: pointer;
          font-weight: 500;
          transition: opacity 150ms;
        }

        .fpm-clear-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .fpm-active-count {
          background: rgba(88, 166, 255, 0.15);
          color: var(--ui-accent);
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
          font-size: 11px;
        }
      `}</style>

      {/* Backdrop */}
      <div className="fpm-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="fpm-modal">
        {/* Drag Handle */}
        <div className="fpm-handle" />

        {/* Content */}
        <div className="fpm-content">
          {/* Dropdowns */}
          <div className="fpm-dropdowns">
            <CustomSelect
              label="Región"
              value={regionFilter}
              options={REGION_OPTIONS}
              onChange={(v) => setRegionFilter(v as any)}
            />
          </div>

          {/* Climate Section */}
          <div className="fpm-section">
            <div className="fpm-section-title">☀️ Condiciones Climáticas</div>
            <div className="fpm-grid">
              {CLIMATE_OPTIONS.map((option) => {
                const isActive = conditionFilter.includes(option.value)
                return (
                  <button
                    key={option.value}
                    className={`fpm-condition-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (isActive) {
                        handleConditionChange(
                          conditionFilter.filter((c) => c !== option.value)
                        )
                      } else {
                        handleConditionChange([...conditionFilter, option.value])
                      }
                    }}
                  >
                    <span className="fpm-condition-emoji">
                      {option.label.split(' ')[0]}
                    </span>
                    <span>{option.label.split(' ').slice(1).join(' ')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Types Section (Placeholder) */}
          <div className="fpm-section">
            <div className="fpm-section-title">⚡ Tipos Pokémon</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              Próximamente disponible
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fpm-footer">
          <button className="fpm-apply-btn" onClick={handleApply}>
            ✓ Aplicar Filtros
          </button>
          <div className="fpm-footer-meta">
            <span>
              Filtros activos:{' '}
              {conditionFilter.length > 0 ? (
                <span className="fpm-active-count">{conditionFilter.length}</span>
              ) : (
                <span>0</span>
              )}
            </span>
            <span
              className="fpm-clear-link"
              onClick={handleClearAll}
            >
              Limpiar Todos
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

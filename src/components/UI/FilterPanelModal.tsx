import { useState } from 'react'
import { useStore } from '../../store/useStore'

interface ClimateOption {
  label: string
  value: string
}

const CLIMATE_OPTIONS: ClimateOption[] = [
  { label: 'Soleado', value: 'sunny' },
  { label: 'Parcial', value: 'partly' },
  { label: 'Nublado', value: 'cloudy' },
  { label: 'Niebla', value: 'fog' },
  { label: 'Lluvia', value: 'rain' },
  { label: 'Nieve', value: 'snow' },
  { label: 'Ventoso', value: 'windy' },
]

// Map condition value to weather image path
const CONDITION_IMAGES: Record<string, string> = {
  sunny: '/weather/sunny.png',
  partly: '/weather/partly.png',
  cloudy: '/weather/cloudy.png',
  fog: '/weather/fog.png',
  rain: '/weather/rain.png',
  snow: '/weather/snow.png',
  windy: '/weather/windy.png',
}

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

interface FilterPanelModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FilterPanelModal({ isOpen, onClose }: FilterPanelModalProps) {
  const regionFilter = useStore((s) => s.regionFilter)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter = useStore((s) => s.typeFilter)
  const setRegionFilter = useStore((s) => s.setRegionFilter)
  const setConditionFilter = useStore((s) => s.setConditionFilter)
  const toggleType = useStore((s) => s.toggleType)
  const clearConditions = useStore((s) => s.clearConditions)

  // For mobile multi-select regions: treat as array internally
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    regionFilter === 'todas' ? [] : [regionFilter]
  )

  const handleConditionChange = (items: string | string[]) => {
    setConditionFilter(Array.isArray(items) ? items : [items])
  }

  const handleApply = () => {
    // Convert selectedRegions to store format
    // For now: if multiple regions selected, treat as 'todas'
    // TODO: Full multi-region support requires store refactor
    if (selectedRegions.length === 0 || selectedRegions.length > 1) {
      setRegionFilter('todas')
    } else if (selectedRegions.length === 1) {
      setRegionFilter(selectedRegions[0] as any)
    }
    onClose()
  }

  const handleClearAll = () => {
    setRegionFilter('todas')
    clearConditions()
    setSelectedRegions([])
  }

  const handleRegionToggle = (region: string) => {
    setSelectedRegions((prev) => {
      if (prev.includes(region)) {
        return []  // Deselecciona si estaba activo
      } else {
        return [region]  // Selecciona este, deselecciona otros (single-select)
      }
    })
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

        .fpm-condition-img {
          width: 20px;
          height: 20px;
          object-fit: contain;
          filter: var(--tile-filter);
        }

        .fpm-regions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }

        .fpm-region-btn {
          padding: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 150ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .fpm-region-btn:hover {
          background: var(--bg-tertiary);
        }

        .fpm-region-btn.active {
          background: rgba(88, 166, 255, 0.2);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .fpm-region-emoji {
          font-size: 18px;
        }

        .fpm-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }

        .fpm-type-btn {
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

        .fpm-type-btn:hover {
          background: var(--bg-tertiary);
        }

        .fpm-type-btn.active {
          background: rgba(88, 166, 255, 0.2);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .fpm-type-img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          filter: var(--tile-filter);
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

        /* Buttons Group (Aplicar + Cancelar) */
        .fpm-buttons-group {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .fpm-buttons-group > button {
          flex: 1;
        }

        /* Cancel Button */
        .fpm-cancel-btn {
          width: 100%;
          padding: 12px;
          background: rgba(200, 200, 200, 0.15);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms ease;
        }

        .fpm-cancel-btn:hover {
          background: rgba(200, 200, 200, 0.25);
          border-color: var(--border-strong);
        }

        .fpm-cancel-btn:active {
          opacity: 0.8;
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
          {/* Regions Section */}
          <div className="fpm-section">
            <div className="fpm-section-title">🌍 Regiones</div>
            <div className="fpm-regions-grid">
              {[
                { label: 'Asia', value: 'asia', emoji: '🌏' },
                { label: 'Europa', value: 'europa', emoji: '🌍' },
                { label: 'América', value: 'america', emoji: '🌎' },
                { label: 'Oceanía', value: 'oceania', emoji: '🌊' },
                { label: 'África', value: 'africa', emoji: '🌍' },
              ].map((region) => {
                const isActive = selectedRegions.includes(region.value)
                return (
                  <button
                    key={region.value}
                    className={`fpm-region-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleRegionToggle(region.value)}
                  >
                    <span className="fpm-region-emoji">{region.emoji}</span>
                    <span>{region.label}</span>
                  </button>
                )
              })}
            </div>
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
                    <img
                      src={CONDITION_IMAGES[option.value]}
                      alt={option.label}
                      className="fpm-condition-img"
                    />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Types Section */}
          <div className="fpm-section">
            <div className="fpm-section-title">⚡ Tipos Pokémon</div>
            <div className="fpm-type-grid">
              {POKEMON_TYPES.map((type) => {
                const isActive = typeFilter.includes(type)
                return (
                  <button
                    key={type}
                    className={`fpm-type-btn ${isActive ? 'active' : ''}`}
                    onClick={() => toggleType(type)}
                  >
                    <img
                      src={TYPE_IMAGES[type]}
                      alt={type}
                      className="fpm-type-img"
                    />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fpm-footer">
          <div className="fpm-buttons-group">
            <button className="fpm-apply-btn" onClick={handleApply}>
              ✓ Aplicar
            </button>
            <button className="fpm-cancel-btn" onClick={onClose} title="Descartar cambios">
              ✕ Cancelar
            </button>
          </div>
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

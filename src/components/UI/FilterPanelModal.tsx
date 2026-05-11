import { useState } from 'react'
import { useStore, type SortMode, type Region } from '../../store/useStore'

const CLIMATE_OPTIONS = [
  { label: 'Todos', value: 'todos', icon: '/weather/all.png' },
  { label: 'Soleado', value: 'sunny', icon: '/weather/sunny.png' },
  { label: 'Parcial', value: 'partly', icon: '/weather/partly.png' },
  { label: 'Nublado', value: 'cloudy', icon: '/weather/cloudy.png' },
  { label: 'Niebla', value: 'fog', icon: '/weather/fog.png' },
  { label: 'Lluvia', value: 'rain', icon: '/weather/rain.png' },
  { label: 'Nieve', value: 'snow', icon: '/weather/snow.png' },
  { label: 'Ventoso', value: 'windy', icon: '/weather/windy.png' },
]

const POKEMON_TYPES = [
  'fire', 'ground', 'normal', 'flying', 'ghost', 'dark',
  'water', 'electric', 'ice', 'steel', 'dragon', 'rock',
  'poison', 'psychic', 'bug', 'grass', 'fighting', 'fairy',
]

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

const SORT_OPTIONS = [
  { label: 'Sin orden', value: '', icon: '🔤' },
  { label: 'Nombre', value: 'name', icon: '🔤' },
  { label: 'Densidad', value: 'density', icon: '📊' },
  { label: 'Rating', value: 'rating', icon: '⭐' },
  { label: 'Hora Local', value: 'time', icon: '🕐' },
]

const REGIONS = [
  { label: 'Todas', value: 'todas' },
  { label: 'Asia', value: 'asia' },
  { label: 'Europa', value: 'europa' },
  { label: 'América', value: 'america' },
  { label: 'Oceanía', value: 'oceania' },
  { label: 'África', value: 'africa' },
]

interface FilterPanelModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FilterPanelModal({ isOpen, onClose }: FilterPanelModalProps) {
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

  // Local state for sections
  const [expandedSections, setExpandedSections] = useState({
    regions: false,
    climate: false,
    types: false,
    sort: false,
  })
  const [showAllTypes, setShowAllTypes] = useState(false)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleApply = () => {
    onClose()
  }

  const handleClearAll = () => {
    setRegionFilter('todas')
    setConditionFilter([])
    setTypeFilter([])
    setSortMode('')
    setSortDirection('asc')
    setExpandedSections({ regions: false, climate: false, types: false, sort: false })
    setShowAllTypes(false)
  }

  const getSortLabel = () => {
    if (!sortMode) return 'SIN ORDEN'
    const option = SORT_OPTIONS.find((o) => o.value === sortMode)
    if (!option) return 'SIN ORDEN'
    const direction = sortDirection === 'desc' ? '↓' : '↑'
    return `${option.label.toUpperCase()} ${direction}`
  }

  if (!isOpen) return null

  const visibleTypes = showAllTypes ? POKEMON_TYPES : POKEMON_TYPES.slice(0, 9)
  const isTodosSelected = conditionFilter.length === 0

  return (
    <>
      <style>{`
        .fpm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1100;
          animation: fadeIn 200ms ease;
        }

        .fpm-modal {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-height: 90vh;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-default);
          border-radius: 16px 16px 0 0;
          display: flex;
          flex-direction: column;
          z-index: 1101;
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

        .fpm-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px 16px;
        }

        /* Section Styles */
        .fpm-section {
          margin-bottom: 0;
          border: 1px solid var(--border-default);
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;
        }

        .fpm-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: var(--bg-tertiary);
          cursor: pointer;
          user-select: none;
          transition: background 150ms ease;
        }

        .fpm-section-header:hover {
          background: var(--bg-overlay);
        }

        .fpm-section-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .fpm-section-label {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-primary);
          flex: 1;
        }

        .fpm-section-badge {
          font-size: 11px;
          font-weight: 600;
          background: var(--ui-accent);
          color: var(--bg-primary);
          padding: 4px 10px;
          border-radius: 12px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .fpm-section-chevron {
          font-size: 12px;
          color: var(--text-secondary);
          transition: transform 200ms ease;
          flex-shrink: 0;
        }

        .fpm-section-chevron.open {
          transform: rotate(180deg);
        }

        .fpm-section-content {
          padding: 14px;
          background: var(--bg-secondary);
          animation: slideDown 200ms ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }

        /* Regions Pills */
        .fpm-regions-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .fpm-pill {
          padding: 8px 16px;
          border: 1.5px solid transparent;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border-radius: 999px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 400;
          transition: all 150ms ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .fpm-pill:hover {
          background: var(--bg-overlay);
          border-color: var(--border-default);
        }

        .fpm-pill.active {
          background: var(--bg-secondary);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
          font-weight: 500;
        }

        .fpm-pill::before {
          content: '🌐';
          font-size: 14px;
          filter: saturate(0.6);
        }

        .fpm-pill.active::before {
          content: '🌍';
          filter: saturate(1.2);
        }

        /* Climate Grid 4x2 */
        .fpm-climate-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .fpm-climate-card {
          padding: 8px;
          border: 1.5px solid transparent;
          background: var(--bg-tertiary);
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          color: var(--text-secondary);
          transition: all 150ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          aspect-ratio: 1;
        }

        .fpm-climate-card:hover {
          background: var(--bg-overlay);
          border-color: var(--border-strong);
        }

        .fpm-climate-card.active {
          background: var(--bg-secondary);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .fpm-climate-img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        /* Types Grid 5x2 */
        .fpm-types-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          margin-bottom: 8px;
        }

        .fpm-type-card {
          padding: 6px 4px;
          border: 1.5px solid transparent;
          background: var(--bg-tertiary);
          border-radius: 12px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          color: var(--text-secondary);
          transition: all 150ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          aspect-ratio: 1 / 1.1;
        }

        .fpm-type-card:hover {
          background: var(--bg-overlay);
          border-color: var(--border-strong);
        }

        .fpm-type-card.active {
          background: var(--bg-secondary);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .fpm-type-icon {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }

        .fpm-expand-types-btn {
          width: 100%;
          padding: 8px 12px;
          border: 2px dashed var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 150ms ease;
        }

        .fpm-expand-types-btn:hover {
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        /* Sort Radio Buttons */
        .fpm-sort-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fpm-sort-option {
          padding: 12px 14px;
          border: 1.5px solid var(--border-default);
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 150ms ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fpm-sort-option:hover {
          border-color: var(--ui-accent);
        }

        .fpm-sort-option.active {
          background: rgba(88, 166, 255, 0.1);
          border-color: var(--ui-accent);
          color: var(--text-primary);
        }

        .fpm-sort-radio {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border-default);
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 150ms ease;
        }

        .fpm-sort-option.active .fpm-sort-radio {
          border-color: var(--ui-accent);
          border-width: 3px;
        }

        .fpm-sort-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .fpm-sort-label {
          flex: 1;
          text-align: left;
        }

        .fpm-sort-direction {
          font-size: 14px;
          font-weight: 700;
          color: var(--ui-accent);
          flex-shrink: 0;
        }

        /* Footer */
        .fpm-footer {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--border-default);
          background: var(--bg-primary);
        }

        .fpm-buttons-group {
          display: flex;
          gap: 8px;
        }

        .fpm-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms ease;
        }

        .fpm-btn-primary {
          background: var(--ui-accent);
          color: var(--bg-primary);
        }

        .fpm-btn-primary:hover {
          background: rgba(88, 166, 255, 0.9);
        }

        .fpm-btn-primary:active {
          opacity: 0.9;
        }

        .fpm-btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
        }

        .fpm-btn-secondary:hover {
          background: var(--bg-overlay);
          border-color: var(--border-strong);
        }

        .fpm-btn-secondary:active {
          opacity: 0.9;
        }

        .fpm-btn-clear {
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          color: var(--text-secondary);
          border: 1px dashed var(--border-default);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .fpm-btn-clear:hover {
          border-color: var(--ui-error);
          color: var(--ui-error);
        }
      `}</style>

      {/* Backdrop */}
      <div className="fpm-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="fpm-modal">
        <div className="fpm-handle" />

        <div className="fpm-content">
          {/* REGIONS Section */}
          <div className="fpm-section">
            <div className="fpm-section-header" onClick={() => toggleSection('regions')}>
              <span className="fpm-section-icon">🌍</span>
              <span className="fpm-section-label">Regiones</span>
              <span className="fpm-section-badge">
                {regionFilter === 'todas' ? 'TODAS' : regionFilter.toUpperCase()}
              </span>
              <span className={`fpm-section-chevron ${expandedSections.regions ? 'open' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.regions && (
              <div className="fpm-section-content">
                <div className="fpm-regions-pills">
                  {REGIONS.map((region) => (
                    <button
                      key={region.value}
                      className={`fpm-pill ${regionFilter === region.value ? 'active' : ''}`}
                      onClick={() => setRegionFilter(region.value as Region)}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CLIMATE Section */}
          <div className="fpm-section">
            <div className="fpm-section-header" onClick={() => toggleSection('climate')}>
              <span className="fpm-section-icon">🌤️</span>
              <span className="fpm-section-label">Clima</span>
              <span className="fpm-section-badge">
                {isTodosSelected
                  ? 'TODOS'
                  : conditionFilter.length === 1
                    ? (CLIMATE_OPTIONS.find((c) => c.value === conditionFilter[0])?.label || 'SELEC.').toUpperCase()
                    : `${conditionFilter.length} SELEC.`}
              </span>
              <span className={`fpm-section-chevron ${expandedSections.climate ? 'open' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.climate && (
              <div className="fpm-section-content">
                <div className="fpm-climate-grid">
                  {CLIMATE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`fpm-climate-card ${
                        (option.value === 'todos' && isTodosSelected) ||
                        (option.value !== 'todos' && conditionFilter.includes(option.value))
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        if (option.value === 'todos') {
                          setConditionFilter([])
                        } else {
                          if (conditionFilter.includes(option.value)) {
                            setConditionFilter(
                              conditionFilter.filter((c) => c !== option.value)
                            )
                          } else {
                            setConditionFilter([...conditionFilter, option.value])
                          }
                        }
                      }}
                    >
                      <img
                        src={option.icon}
                        alt={option.label}
                        className="fpm-climate-img"
                      />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TYPES Section */}
          <div className="fpm-section">
            <div className="fpm-section-header" onClick={() => toggleSection('types')}>
              <span className="fpm-section-icon">⚡</span>
              <span className="fpm-section-label">Tipos</span>
              <span className="fpm-section-badge">
                {typeFilter.length === 0
                  ? 'TODOS'
                  : typeFilter.length === 1
                    ? typeFilter[0].toUpperCase()
                    : `${typeFilter.length} SELEC.`}
              </span>
              <span className={`fpm-section-chevron ${expandedSections.types ? 'open' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.types && (
              <div className="fpm-section-content">
                <div className="fpm-types-grid">
                  {/* TODOS button */}
                  <button
                    className={`fpm-type-card ${typeFilter.length === 0 ? 'active' : ''}`}
                    onClick={() => setTypeFilter([])}
                  >
                    <span style={{ fontSize: '20px' }}>🔄</span>
                    <span>Todos</span>
                  </button>

                  {/* Individual type cards */}
                  {visibleTypes.map((type) => (
                    <button
                      key={type}
                      className={`fpm-type-card ${typeFilter.includes(type) ? 'active' : ''}`}
                      onClick={() => {
                        if (typeFilter.includes(type)) {
                          setTypeFilter(typeFilter.filter((t) => t !== type))
                        } else {
                          setTypeFilter([...typeFilter, type])
                        }
                      }}
                    >
                      <img
                        src={TYPE_IMAGES[type]}
                        alt={type}
                        className="fpm-type-icon"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
                {!showAllTypes && POKEMON_TYPES.length > 9 && (
                  <button
                    className="fpm-expand-types-btn"
                    onClick={() => setShowAllTypes(true)}
                  >
                    + Más tipos
                  </button>
                )}
                {showAllTypes && POKEMON_TYPES.length > 9 && (
                  <button
                    className="fpm-expand-types-btn"
                    onClick={() => setShowAllTypes(false)}
                  >
                    - Menos tipos
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SORT Section */}
          <div className="fpm-section">
            <div className="fpm-section-header" onClick={() => toggleSection('sort')}>
              <span className="fpm-section-icon">📊</span>
              <span className="fpm-section-label">Ordenar</span>
              <span className="fpm-section-badge">{getSortLabel()}</span>
              <span className={`fpm-section-chevron ${expandedSections.sort ? 'open' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.sort && (
              <div className="fpm-section-content">
                <div className="fpm-sort-options">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`fpm-sort-option ${sortMode === option.value ? 'active' : ''}`}
                      onClick={() => {
                        // If clicking same sort, toggle direction
                        if (sortMode === option.value) {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                        } else {
                          // Different sort: set to new sort + reset direction to asc
                          setSortMode(option.value as SortMode)
                          setSortDirection('asc')
                        }
                      }}
                    >
                      <div className="fpm-sort-radio" />
                      <span className="fpm-sort-icon">{option.icon}</span>
                      <span className="fpm-sort-label">{option.label}</span>
                      {sortMode === option.value && (
                        <span className="fpm-sort-direction">
                          {sortDirection === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="fpm-footer">
          <div className="fpm-buttons-group">
            <button className="fpm-btn fpm-btn-primary" onClick={handleApply}>
              ✓ Aplicar
            </button>
            <button className="fpm-btn fpm-btn-secondary" onClick={onClose}>
              ✕ Cancelar
            </button>
          </div>
          <button className="fpm-btn-clear" onClick={handleClearAll}>
            ✕ Limpiar todos los filtros
          </button>
        </div>
      </div>
    </>
  )
}

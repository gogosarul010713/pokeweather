import { useState, useRef, useEffect, useCallback } from 'react'

interface SortOption {
  label: string
  value: string
  icon: string
  tooltip: (isActive: boolean, direction?: string) => string
}

interface SortDropdownProps {
  sortMode: string
  sortDirection: 'asc' | 'desc'
  onSortChange: (mode: string, direction: string) => void
}

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Ordenar por',
    value: '',
    icon: '🔤',
    tooltip: () => 'Haz clic para ordenar',
  },
  {
    label: 'Nombre',
    value: 'name',
    icon: '🔤',
    tooltip: (isActive, direction) => {
      if (!isActive) return 'Click para ordenar A-Z (ascendente)'
      return direction === 'asc'
        ? 'Ascendente · Click para cambiar a descendente'
        : 'Descendente · Click para cambiar a ascendente'
    },
  },
  {
    label: 'Densidad',
    value: 'density',
    icon: '📊',
    tooltip: (isActive, direction) => {
      if (!isActive) return 'Click para ordenar por mayor densidad'
      return direction === 'asc'
        ? 'Menor primero · Click para invertir (mayor primero)'
        : 'Mayor primero · Click para invertir (menor primero)'
    },
  },
  {
    label: 'Rating',
    value: 'rating',
    icon: '⭐',
    tooltip: (isActive, direction) => {
      if (!isActive) return 'Click para ordenar por mayor rating'
      return direction === 'asc'
        ? 'Menor primero · Click para invertir (mayor primero)'
        : 'Mayor primero · Click para invertir (menor primero)'
    },
  },
  {
    label: 'Hora Local',
    value: 'time',
    icon: '🕐',
    tooltip: (isActive, direction) => {
      if (!isActive) return 'Click para ordenar por hora más temprana'
      return direction === 'asc'
        ? 'Temprano primero · Click para invertir (tarde primero)'
        : 'Tarde primero · Click para invertir (temprano primero)'
    },
  },
  {
    label: 'Distancia',
    value: 'distance',
    icon: '📍',
    tooltip: (isActive, direction) => {
      if (!isActive) return 'Click para ordenar por distancia (más cerca primero)'
      return direction === 'asc'
        ? 'Más cerca primero · Click para invertir'
        : 'Más lejos primero · Click para invertir'
    },
  },
  {
    label: 'Cooldown',
    value: 'cooldown',
    icon: '⏳',
    tooltip: (isActive, direction) => {
      if (!isActive) return 'Click para ordenar por menor cooldown requerido'
      return direction === 'asc'
        ? 'Menor cooldown primero · Click para invertir'
        : 'Mayor cooldown primero · Click para invertir'
    },
  },
  {
    label: 'Densidad',
    value: 'spawnRate',
    icon: '🌀',
    tooltip: (isActive, direction) => {
      if (!isActive) return 'Click para ordenar por mayor densidad de aparicion'
      return direction === 'asc'
        ? 'Menor densidad primero · Click para invertir'
        : 'Mayor densidad primero · Click para invertir'
    },
  },
  {
    label: 'Tipo',
    value: 'type',
    icon: '🏷️',
    tooltip: (isActive, direction) => {
      if (!isActive) return 'Click para ordenar por tipo Pokémon'
      return direction === 'asc'
        ? 'Ascendente A-Z · Click para invertir'
        : 'Descendente Z-A · Click para invertir'
    },
  },
]

export default function SortDropdown({
  sortMode,
  sortDirection,
  onSortChange,
}: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, handleClickOutside])

  // Lógica principal: determinar qué hacer al hacer click
  const handleOptionClick = useCallback((optionValue: string) => {
    if (optionValue === '') {
      // Opción "Ordenar por..." → desactiva
      onSortChange('', 'asc')
    } else if (optionValue === sortMode && sortMode !== '') {
      // Mismo criterio activo → alterna dirección
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      onSortChange(optionValue, newDirection)
    } else {
      // Criterio diferente → activa con asc por defecto
      onSortChange(optionValue, 'asc')
    }
    setOpen(false)
  }, [sortMode, sortDirection, onSortChange])

  // Obtener el header display text
  const getHeaderText = () => {
    if (sortMode === '') {
      return 'Ordenar por'
    }
    const option = SORT_OPTIONS.find(o => o.value === sortMode)
    if (!option) return 'Ordenar por'
    return option.label
  }

  // Obtener la flecha para el header
  // La flecha indica la dirección SIGUIENTE (si clickeas):
  // - ⬇️ (inactivo o asc) = si clickeas irá hacia arriba (siguiente será desc)
  // - ⬆️ (desc) = si clickeas irá hacia abajo (siguiente será asc)
  const getHeaderDirectionArrow = () => {
    if (sortMode === '') return '⬇️'  // Inactivo: flecha hacia abajo
    return sortDirection === 'asc' ? '⬆️' : '⬇️'  // asc→⬆️, desc→⬇️
  }

  return (
    <>
      <style>{`
        .sd-container {
          position: relative;
          display: inline-block;
        }

        .sd-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 200ms ease;
          min-width: 140px;
          justify-content: space-between;
        }

        .sd-trigger:hover {
          background: var(--bg-overlay);
          border-color: var(--border-strong);
        }

        .sd-trigger.open {
          background: var(--bg-overlay);
          border-color: var(--ui-accent);
        }

        .sd-trigger-content {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .sd-trigger-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sd-trigger-direction {
          font-size: 14px;
          flex-shrink: 0;
        }

        .sd-chevron {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms ease;
          flex-shrink: 0;
        }

        .sd-trigger.open .sd-chevron {
          transform: rotate(180deg);
        }

        .sd-popup {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1001;
          min-width: 240px;
          max-height: 300px;
          overflow-y: auto;
          animation: popIn 150ms ease;
        }

        .sd-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          cursor: pointer;
          color: var(--text-primary);
          font-size: 13px;
          transition: background 150ms ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }

        .sd-option:hover {
          background: var(--bg-tertiary);
        }

        .sd-option.active {
          background: rgba(var(--ui-accent-rgb, 88, 166, 255), 0.1);
          color: var(--ui-accent);
          font-weight: 600;
        }

        .sd-option-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .sd-option-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .sd-option-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sd-option-directions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .sd-direction-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          font-size: 13px;
          background: transparent;
          border: none;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 150ms ease;
          padding: 0;
        }

        .sd-option:hover .sd-direction-btn {
          opacity: 0.8;
        }

        .sd-option.active .sd-direction-btn.active {
          opacity: 1;
          color: var(--ui-accent);
          font-weight: bold;
        }

        .sd-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }

        /* Scrollbar */
        .sd-popup::-webkit-scrollbar { width: 4px; }
        .sd-popup::-webkit-scrollbar-track { background: transparent; }
        .sd-popup::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
        .sd-popup::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

        .sd-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          pointer-events: none;
          margin-bottom: 4px;
          z-index: 1002;
          opacity: 0;
          transition: opacity 150ms ease;
        }

        .sd-option:hover .sd-tooltip {
          opacity: 1;
        }
      `}</style>

      <div className="sd-container" ref={containerRef}>
        {/* Header (Trigger Button) */}
        <button
          className={`sd-trigger ${open ? 'open' : ''}`}
          onClick={() => setOpen(!open)}
          type="button"
          title={sortMode === '' ? 'Ordenar por...' : `${getHeaderText()} ${getHeaderDirectionArrow()}`}
        >
          <div className="sd-trigger-content">
            <span className="sd-trigger-label">
              {getHeaderText()}
            </span>
            {sortMode !== '' && (
              <span className="sd-trigger-direction">{getHeaderDirectionArrow()}</span>
            )}
          </div>
          <div className="sd-chevron">▼</div>
        </button>

        {/* Dropdown Content */}
        {open && (
          <div className="sd-popup">
            {SORT_OPTIONS.map((option) => {
              const isActive = sortMode === option.value && option.value !== ''
              const tooltipText = option.tooltip(isActive, sortDirection)

              return (
                <div key={option.value}>
                  <button
                    className={`sd-option ${isActive ? 'active' : ''}`}
                    onClick={() => handleOptionClick(option.value)}
                    onMouseEnter={() => setHoveredOption(option.value)}
                    onMouseLeave={() => setHoveredOption(null)}
                    type="button"
                    title={tooltipText}
                  >
                    <div className="sd-option-left">
                      {option.value !== '' && (
                        <span className="sd-option-icon">{option.icon}</span>
                      )}
                      <span className="sd-option-label">{option.label}</span>
                    </div>

                    {/* Dirección */}
                    <div className="sd-option-directions">
                      {option.value === '' ? null : (
                        // Mostrar una sola flecha
                        // Inactivo o asc → ⬆️ (próxima será desc)
                        // desc → ⬇️ (próxima será asc)
                        <span className={`sd-direction-btn ${isActive ? 'active' : ''}`}>
                          {isActive ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '⬇️'}
                        </span>
                      )}
                    </div>

                    {/* Tooltip */}
                    {hoveredOption === option.value && (
                      <div className="sd-tooltip">{tooltipText}</div>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

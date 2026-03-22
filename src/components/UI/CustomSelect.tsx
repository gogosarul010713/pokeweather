import { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  label: string
  value: string
  icon?: string   // ruta a imagen — si existe, reemplaza texto en la opción
}

interface CustomSelectProps {
  label: string
  value?: string
  selectedItems?: string[]
  options: SelectOption[]
  onChange: (value: string | string[]) => void
  isMulti?: boolean
  disabled?: boolean
}

export default function CustomSelect({
  label,
  value,
  selectedItems = [],
  options,
  onChange,
  isMulti = false,
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleSelect = (optValue: string) => {
    if (isMulti) {
      const items = selectedItems.includes(optValue)
        ? selectedItems.filter((v) => v !== optValue)
        : [...selectedItems, optValue]
      onChange(items)
    } else {
      onChange(optValue)
      setOpen(false)
    }
  }

  const selectedOption = !isMulti ? options.find((o) => o.value === value) : undefined

  const displayText = isMulti
    ? selectedItems.length > 0
      ? `${selectedItems.length} seleccionado${selectedItems.length > 1 ? 's' : ''}`
      : label
    : selectedOption?.label || label

  return (
    <>
      <style>{`
        .cs-container {
          position: relative;
          display: inline-block;
        }

        .cs-trigger {
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
          min-width: 120px;
          justify-content: space-between;
        }

        .cs-trigger:not(:disabled):hover {
          background: var(--bg-overlay);
          border-color: var(--border-strong);
        }

        .cs-trigger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cs-trigger.open {
          background: var(--bg-overlay);
          border-color: var(--ui-accent);
        }

        .cs-chevron {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms ease;
          flex-shrink: 0;
        }

        .cs-trigger.open .cs-chevron {
          transform: rotate(180deg);
        }

        .cs-popup {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1001;
          min-width: 160px;
          max-width: 280px;
          max-height: 280px;
          overflow-y: auto;
          animation: popIn 150ms ease;
        }

        .cs-option {
          display: flex;
          align-items: center;
          gap: 10px;
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

        .cs-option:hover {
          background: var(--bg-tertiary);
        }

        .cs-option.selected {
          background: rgba(var(--ui-accent-rgb, 88, 166, 255), 0.1);
          color: var(--ui-accent);
          font-weight: 600;
        }

        .cs-checkbox {
          width: 16px;
          height: 16px;
          border: 1.5px solid var(--border-default);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 150ms ease;
        }

        .cs-option.selected .cs-checkbox {
          background: var(--ui-accent);
          border-color: var(--ui-accent);
        }

        .cs-option.selected .cs-checkbox::after {
          content: '✓';
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }

        .cs-option-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .cs-trigger-icon {
          width: 18px;
          height: 18px;
          object-fit: contain;
          flex-shrink: 0;
        }

        /* Scrollbar */
        .cs-popup::-webkit-scrollbar { width: 4px; }
        .cs-popup::-webkit-scrollbar-track { background: transparent; }
        .cs-popup::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
        .cs-popup::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
      `}</style>

      <div className="cs-container" ref={containerRef}>
        <button
          className={`cs-trigger ${open ? 'open' : ''}`}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          type="button"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            {selectedOption?.icon && (
              <img className="cs-trigger-icon" src={selectedOption.icon} alt="" />
            )}
            <span>{displayText}</span>
          </div>
          <div className="cs-chevron">▼</div>
        </button>

        {open && (
          <div className="cs-popup">
            {options.map((opt) => {
              const isSelected = isMulti
                ? selectedItems.includes(opt.value)
                : value === opt.value

              return (
                <button
                  key={opt.value}
                  className={`cs-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  type="button"
                >
                  {isMulti && <div className="cs-checkbox" />}
                  {opt.icon
                    ? <img className="cs-option-icon" src={opt.icon} alt={opt.label} />
                    : null
                  }
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

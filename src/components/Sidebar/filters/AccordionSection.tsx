import type { ReactNode } from 'react'

interface AccordionSectionProps {
  label: string
  icon?: string
  isOpen: boolean
  onToggle: () => void
  accentColor?: string
  /** valores activos seleccionados para esta sección */
  activeValues?: string[]
  /** etiqueta del valor cuando hay exactamente 1 activo */
  activeLabel?: string
  children: ReactNode
}

export default function AccordionSection({
  label,
  icon,
  isOpen,
  onToggle,
  accentColor = '#58a6ff',
  activeValues = [],
  activeLabel,
  children,
}: AccordionSectionProps) {
  const count = activeValues.length

  return (
    <>
      <style>{`
        .fp-accordion {
          border-top: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .fp-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          cursor: pointer;
          user-select: none;
          gap: 6px;
        }
        .fp-accordion-header:hover {
          background: var(--bg-hover, rgba(255,255,255,0.04));
        }
        .fp-accordion-left {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .fp-accordion-icon-wrap {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .fp-accordion-label {
          font: 700 10px/1 'Rajdhani', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .fp-accordion-right {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
        }
        .fp-accordion-value-text {
          font: 600 10px/1 'Exo 2', sans-serif;
        }
        .fp-accordion-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 6px;
          border-radius: 9px;
          font: 700 10px/18px 'Exo 2', sans-serif;
          text-align: center;
          box-sizing: border-box;
        }
        .fp-accordion-chevron {
          font-size: 8px;
          color: var(--text-secondary);
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .fp-accordion-chevron.open {
          transform: rotate(180deg);
        }
        .fp-accordion-body {
          overflow: hidden;
        }
      `}</style>
      <div className="fp-accordion">
        <div className="fp-accordion-header" onClick={onToggle} role="button" aria-expanded={isOpen}>
          <div className="fp-accordion-left">
            {icon && (
              <div
                className="fp-accordion-icon-wrap"
                style={{ background: accentColor === '#58a6ff' ? 'rgba(88,166,255,.1)' : 'rgba(34,197,94,.1)' }}
              >
                {icon}
              </div>
            )}
            <span className="fp-accordion-label" style={{ color: accentColor }}>{label}</span>
          </div>

          <div className="fp-accordion-right">
            {count === 1 && activeLabel && (
              <span className="fp-accordion-value-text" style={{ color: `${accentColor}B3` }}>
                {activeLabel}
              </span>
            )}
            {count >= 2 && (
              <div
                className="fp-accordion-badge"
                style={{
                  background: accentColor === '#58a6ff' ? 'rgba(88,166,255,.15)' : 'rgba(34,197,94,.15)',
                  border: `1px solid ${accentColor === '#58a6ff' ? 'rgba(88,166,255,.3)' : 'rgba(34,197,94,.3)'}`,
                  color: accentColor,
                }}
              >
                {count}
              </div>
            )}
            <span className={`fp-accordion-chevron ${isOpen ? 'open' : ''}`}>&#9660;</span>
          </div>
        </div>
        {isOpen && <div className="fp-accordion-body">{children}</div>}
      </div>
    </>
  )
}

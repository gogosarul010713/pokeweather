import type { ReactNode } from 'react'

interface AccordionSectionProps {
  label: string
  isOpen: boolean
  onToggle: () => void
  badge?: number
  badgeText?: string
  icon?: string
  children: ReactNode
}

export default function AccordionSection({ label, isOpen, onToggle, badge, badgeText, icon, children }: AccordionSectionProps) {
  return (
    <>
      <style>{`
        .fp-accordion {
          border-top: 1px solid var(--border-default);
          flex-shrink: 0;
        }
        .fp-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 16px;
          cursor: pointer;
          user-select: none;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          gap: 6px;
        }
        .fp-accordion-header:hover {
          background: var(--bg-hover, rgba(255,255,255,0.04));
        }
        .fp-accordion-label {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .fp-accordion-badge {
          font-size: 10px;
          font-weight: 700;
          background: var(--accent, #58a6ff);
          color: #fff;
          border-radius: 8px;
          padding: 0 5px;
          line-height: 16px;
        }
        .fp-accordion-chevron {
          font-size: 10px;
          color: var(--text-muted);
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .fp-accordion-chevron.open {
          transform: rotate(180deg);
        }
        .fp-accordion-body {
          padding: 0 16px 12px;
          overflow: hidden;
        }
      `}</style>
      <div className="fp-accordion">
        <div className="fp-accordion-header" onClick={onToggle} role="button" aria-expanded={isOpen}>
          <span className="fp-accordion-label">
            {icon && <span className="fp-accordion-icon">{icon}</span>}
            {label}
            {badgeText && <span className="fp-accordion-badge">{badgeText}</span>}
          </span>
          <span className={`fp-accordion-chevron ${isOpen ? 'open' : ''}`}>&#9660;</span>
        </div>
        {isOpen && <div className="fp-accordion-body">{children}</div>}
      </div>
    </>
  )
}

interface GroupHeaderProps {
  color: string
  title: string
  subtitle?: string
  isOpen?: boolean
  onToggle?: () => void
  badgeCount?: number
}

export default function GroupHeader({ color, title, subtitle, isOpen = true, onToggle, badgeCount }: GroupHeaderProps) {
  const isClickable = !!onToggle
  const Tag = isClickable ? 'button' : 'div'

  return (
    <>
      <style>{`
        .fp-group-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px 6px;
          background: linear-gradient(90deg, var(--fp-group-bg, rgba(88,166,255,0.08)) 0%, transparent 100%);
          border-bottom: 1px solid var(--fp-group-border, rgba(88,166,255,0.15));
          position: sticky;
          top: 0;
          z-index: 2;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0,0,0,0);
          transition: box-shadow 0.2s;
          width: 100%;
          box-sizing: border-box;
          cursor: default;
          text-align: left;
          border: none;
        }
        .fp-group-header.clickable {
          cursor: pointer;
        }
        .fp-group-header.clickable:hover {
          filter: brightness(1.06);
        }
        .fp-group-bar {
          width: 3px;
          border-radius: 2px;
          flex-shrink: 0;
          align-self: stretch;
          min-height: 28px;
        }
        .fp-group-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .fp-group-title {
          font: 700 11px/1 'Rajdhani', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }
        .fp-group-subtitle {
          font: 400 10px/1.3 'Exo 2', sans-serif;
          color: var(--text-secondary);
          opacity: 0.7;
        }
        .fp-group-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .fp-group-badge {
          height: 18px;
          min-width: 18px;
          padding: 0 5px;
          border-radius: 9px;
          font: 700 10px/18px 'Exo 2', sans-serif;
          text-align: center;
          box-sizing: border-box;
        }
        .fp-group-chevron {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.85;
          color: var(--text-secondary);
          transition: transform 0.22s ease;
          line-height: 1;
        }
        .fp-group-chevron.open {
          transform: rotate(0deg);
        }
        .fp-group-chevron.closed {
          transform: rotate(-90deg);
        }
      `}</style>
      <Tag
        className={`fp-group-header${isClickable ? ' clickable' : ''}`}
        style={{
          '--fp-group-bg': color === '#58a6ff'
            ? 'rgba(88,166,255,0.08)'
            : 'rgba(34,197,94,0.08)',
          '--fp-group-border': color === '#58a6ff'
            ? 'rgba(88,166,255,0.15)'
            : 'rgba(34,197,94,0.15)',
        } as React.CSSProperties}
        onClick={onToggle}
        type={isClickable ? 'button' : undefined}
      >
        <span className="fp-group-bar" style={{ background: color }} />
        <div className="fp-group-text">
          <span className="fp-group-title" style={{ color }}>{title}</span>
          {subtitle && <span className="fp-group-subtitle">{subtitle}</span>}
        </div>
        {(badgeCount !== undefined && badgeCount > 0) && (
          <div
            className="fp-group-badge"
            style={{
              background: color === '#58a6ff'
                ? 'rgba(88,166,255,0.15)'
                : 'rgba(34,197,94,0.15)',
              color,
            }}
          >
            {badgeCount}
          </div>
        )}
        {isClickable && (
          <span className={`fp-group-chevron ${isOpen ? 'open' : 'closed'}`}>
            ▼
          </span>
        )}
      </Tag>
    </>
  )
}

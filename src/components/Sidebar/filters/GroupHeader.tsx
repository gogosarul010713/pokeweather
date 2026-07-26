interface GroupHeaderProps {
  color: string
  title: string
  isOpen?: boolean
  onToggle?: () => void
}

export default function GroupHeader({ color, title, isOpen = true, onToggle }: GroupHeaderProps) {
  const isClickable = !!onToggle
  const Tag = isClickable ? 'button' : 'div'
  const isClima = color === '#58a6ff'

  const borderColor = isClima ? 'rgba(88,166,255,0.45)' : 'rgba(34,197,94,0.45)'
  const boxBg = isClima ? 'rgba(88,166,255,0.06)' : 'rgba(34,197,94,0.06)'
  const groupBorder = isClima ? 'rgba(88,166,255,0.18)' : 'rgba(34,197,94,0.18)'

  return (
    <>
      <style>{`
        .fp-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-secondary);
          position: sticky;
          top: 0;
          z-index: 2;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          width: 100%;
          box-sizing: border-box;
          cursor: default;
          text-align: left;
          border: none;
          padding: 10px 14px 9px 11px;
        }
        .fp-group-header.clickable {
          cursor: pointer;
        }
        .fp-group-header.clickable:hover {
          filter: brightness(1.06);
        }
        .fp-group-title {
          font: 700 11px/1 'Rajdhani', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }
        .fp-group-box {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .fp-group-box-icon {
          font: 700 16px/1 'Exo 2', sans-serif;
          margin-top: -1px;
          line-height: 1;
        }
      `}</style>
      <Tag
        className={`fp-group-header${isClickable ? ' clickable' : ''}`}
        style={{ borderBottom: `1px solid ${groupBorder}` } as React.CSSProperties}
        onClick={onToggle}
        type={isClickable ? 'button' : undefined}
      >
        <span className="fp-group-title" style={{ color }}>{title}</span>
        {isClickable && (
          <div
            className="fp-group-box"
            style={{ border: `1.5px solid ${borderColor}`, background: boxBg }}
          >
            <span className="fp-group-box-icon" style={{ color }}>{isOpen ? '−' : '+'}</span>
          </div>
        )}
      </Tag>
    </>
  )
}

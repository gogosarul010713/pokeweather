interface PillItem {
  value: string
  label: string
  emoji?: string
  color?: string
  img?: string
}

interface PillsGridProps {
  items: PillItem[]
  selected: string[]
  cols?: number
  onToggle: (value: string) => void
  accentColor?: string
}

export default function PillsGrid({ items, selected, cols = 4, onToggle, accentColor = '#58a6ff' }: PillsGridProps) {
  const isGreen = accentColor === '#22c55e'
  const activeStyle = {
    background: isGreen ? 'rgba(34,197,94,0.15)' : 'rgba(88,166,255,0.15)',
    borderColor: accentColor,
    color: accentColor,
  }

  return (
    <>
      <style>{`
        .fp-pills-grid {
          display: grid;
          gap: 5px;
        }
        .fp-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 2px;
          padding: 6px 2px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: transparent;
          cursor: pointer;
          font-size: 10px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          text-align: center;
          line-height: 1.2;
          min-height: 44px;
        }
        .fp-pill:hover {
          background: var(--bg-hover, rgba(255,255,255,0.04));
        }
        .fp-pill-emoji {
          font-size: 14px;
          line-height: 1;
        }
        .fp-pill-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .fp-pill-img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .fp-pill-img-type {
          width: 24px;
          height: 24px;
          object-fit: contain;
          flex-shrink: 0;
        }
      `}</style>
      <div className="fp-pills-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {items.map((item) => {
          const isActive = item.value === '' ? selected.length === 0 : selected.includes(item.value)
          return (
            <button
              key={item.value}
              className="fp-pill"
              style={isActive ? activeStyle : undefined}
              onClick={() => onToggle(item.value)}
              type="button"
            >
              {item.color && <span className="fp-pill-dot" style={{ background: item.color }} />}
              {item.emoji && <span className="fp-pill-emoji">{item.emoji}</span>}
              {item.img && (
                <img
                  src={item.img}
                  alt=""
                  className={item.img.includes('/types/') ? 'fp-pill-img-type' : 'fp-pill-img'}
                />
              )}
              {item.label}
            </button>
          )
        })}
      </div>
    </>
  )
}

interface RadioItem {
  value: string
  label: string
}

interface RadioListProps {
  items: RadioItem[]
  selected: string
  onSelect: (value: string) => void
  sortDirection?: 'asc' | 'desc'
  onToggleDirection?: () => void
}

export default function RadioList({ items, selected, onSelect, sortDirection, onToggleDirection }: RadioListProps) {
  return (
    <>
      <style>{`
        .fp-radio-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .fp-radio-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-secondary);
          transition: background 0.15s;
        }
        .fp-radio-item:hover {
          background: var(--bg-hover, rgba(255,255,255,0.04));
        }
        .fp-radio-item.active {
          color: var(--text-primary);
        }
        .fp-radio-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--border-default);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.15s;
        }
        .fp-radio-item.active .fp-radio-dot {
          border-color: #58a6ff;
        }
        .fp-radio-dot::after {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #58a6ff;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .fp-radio-item.active .fp-radio-dot::after {
          opacity: 1;
        }
        .fp-radio-dir {
          margin-left: auto;
          font-size: 11px;
          color: #58a6ff;
          padding: 1px 4px;
          border-radius: 4px;
          background: rgba(88,166,255,0.12);
          cursor: pointer;
          user-select: none;
        }
        .fp-radio-dir:hover { background: rgba(88,166,255,0.22); }
      `}</style>
      <div className="fp-radio-list">
        {items.map((item) => {
          const isActive = selected === item.value
          return (
            <div
              key={item.value}
              className={`fp-radio-item ${isActive ? 'active' : ''}`}
              onClick={() => isActive && onToggleDirection ? onToggleDirection() : onSelect(item.value)}
              role="radio"
              aria-checked={isActive}
            >
              <span className="fp-radio-dot" />
              {item.label}
              {isActive && sortDirection && (
                <span className="fp-radio-dir" onClick={(e) => { e.stopPropagation(); onToggleDirection?.() }}>
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

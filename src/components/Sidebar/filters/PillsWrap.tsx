interface PillItem {
  value: string
  label: string
}

interface PillsWrapProps {
  items: PillItem[]
  selected: string
  onSelect: (value: string) => void
}

export default function PillsWrap({ items, selected, onSelect }: PillsWrapProps) {
  return (
    <>
      <style>{`
        .fp-pills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .fp-pill-wrap-item {
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid var(--border-default);
          background: transparent;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .fp-pill-wrap-item:hover {
          background: var(--bg-hover, rgba(255,255,255,0.04));
        }
        .fp-pill-wrap-item.active {
          background: rgba(88,166,255,0.15);
          border-color: #58a6ff;
          color: #58a6ff;
        }
      `}</style>
      <div className="fp-pills-wrap">
        {items.map((item) => (
          <button
            key={item.value}
            className={`fp-pill-wrap-item ${selected === item.value ? 'active' : ''}`}
            onClick={() => onSelect(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}

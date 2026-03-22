interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
}

export default function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <>
      <style>{`
        .ui-chip {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 12px;
          border-radius: 14px;
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .ui-chip:hover {
          border-color: var(--ui-accent);
          color: var(--text-primary);
        }

        .ui-chip.ui-chip-active {
          border-color: var(--ui-accent);
          background: rgba(var(--ui-accent-rgb), 0.08);
          color: var(--text-primary);
        }
      `}</style>

      <button
        className={`ui-chip${active ? ' ui-chip-active' : ''}`}
        onClick={onClick}
      >
        {label}
      </button>
    </>
  )
}

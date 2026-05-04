interface Props {
  isExpanded: boolean
  onToggle: () => void
}

export default function SidebarToggle({ isExpanded, onToggle }: Props) {
  return (
    <button
      className="sidebar-toggle"
      onClick={onToggle}
      aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-pressed={isExpanded}
      type="button"
    >
      <style>{`
        .sidebar-toggle {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 200ms ease;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .sidebar-toggle:hover {
          background: var(--bg-overlay);
          border-color: var(--border-strong);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }

        .sidebar-toggle:active {
          background: var(--bg-secondary);
        }

        .sidebar-toggle svg {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }
      `}</style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Línea izquierda (collapsa cuando expandido) */}
        <path
          d="M15 6 L9 12 L15 18"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

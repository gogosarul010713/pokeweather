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
          background: var(--bg-secondary);
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
          background: var(--bg-tertiary);
          border-color: var(--ui-accent);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }

        .sidebar-toggle:active {
          background: var(--bg-overlay);
        }

        .sidebar-toggle svg {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }
      `}</style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}
      >
        <circle cx="16" cy="16" r="16" fill="var(--ui-accent)" />
        <path
          d="M12 10 L18 16 L12 22"
          stroke="var(--bg-secondary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 10 L23 16 L17 22"
          stroke="var(--bg-secondary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

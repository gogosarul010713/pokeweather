interface GroupHeaderProps {
  color: string
  title: string
  subtitle?: string
}

export default function GroupHeader({ color, title, subtitle }: GroupHeaderProps) {
  return (
    <>
      <style>{`
        .fp-group-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px 6px;
          flex-shrink: 0;
        }
        .fp-group-bar {
          height: 28px;
          width: 3px;
          border-radius: 2px;
          flex-shrink: 0;
          align-self: stretch;
        }
        .fp-group-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .fp-group-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .fp-group-subtitle {
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.2px;
        }
      `}</style>
      <div className="fp-group-header">
        <span className="fp-group-bar" style={{ background: color }} />
        <div className="fp-group-text">
          <span className="fp-group-title">{title}</span>
          {subtitle && <span className="fp-group-subtitle">{subtitle}</span>}
        </div>
      </div>
    </>
  )
}

interface FeedHeaderProps {
  label: string
  icon?: string
}

export default function FeedHeader({ label, icon = '📍' }: FeedHeaderProps) {
  return (
    <>
      <style>{`
        .feed-header {
          padding: 4px 8px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          flex-shrink: 0;
          white-space: nowrap;
        }

        .feed-header-icon {
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="feed-header">
        <span className="feed-header-icon">{icon}</span>
        <span>{label}</span>
      </div>
    </>
  )
}

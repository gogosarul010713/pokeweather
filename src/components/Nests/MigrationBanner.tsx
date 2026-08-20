import { useStore } from '../../store/useStore'
import { getNextMigration } from '../../config/nestMigration'

function formatCountdown(now: number): { label: string; expired: boolean } {
  const target = getNextMigration(now).getTime()
  const diff = target - now
  if (diff <= 0) return { label: 'Migrado', expired: true }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (diff >= 86400000) return { label: `${days}d ${hours}h ${mins}m`, expired: false }
  if (diff >= 3600000) return { label: `${hours}h ${mins}m`, expired: false }
  return { label: `${mins}m`, expired: false }
}

export default function MigrationBanner() {
  const now = useStore((s) => s.now)
  const { label, expired } = formatCountdown(now)

  return (
    <>
      <style>{`
        .mb-root {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 8px;
          background: rgba(34,197,94,.06);
          border: 1px solid rgba(34,197,94,.15);
          flex-shrink: 0;
          white-space: nowrap;
        }
        .mb-icon { font-size: 11px; }
        .mb-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 9px;
          font-weight: 600;
          color: var(--text-secondary);
          opacity: .6;
          text-transform: uppercase;
          letter-spacing: .06em;
        }
        .mb-value {
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          font-weight: 700;
        }
        .mb-value.active { color: #22c55e; }
        .mb-value.expired { color: var(--ui-warning, #f59e0b); }
      `}</style>
      <div className="mb-root">
        <span className="mb-icon">🔄</span>
        <span className="mb-label">Migra en</span>
        <span className={`mb-value ${expired ? 'expired' : 'active'}`}>{label}</span>
      </div>
    </>
  )
}

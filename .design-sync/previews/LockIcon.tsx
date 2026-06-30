import LockIcon from 'pokeweather/src/components/UI/LockIcon'

export function LockIconSmall() {
  return (
    <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <LockIcon size={16} />
      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>size=16</span>
    </div>
  )
}

export function LockIconMedium() {
  return (
    <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <LockIcon size={32} />
      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>size=32 (default)</span>
    </div>
  )
}

export function LockIconLarge() {
  return (
    <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <LockIcon size={48} />
      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>size=48</span>
    </div>
  )
}

export function LockIconColored() {
  return (
    <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
      <LockIcon size={32} color="var(--ui-accent)" />
      <LockIcon size={32} color="var(--ui-error)" />
      <LockIcon size={32} color="var(--ui-success)" />
      <LockIcon size={32} color="var(--ui-warning)" />
    </div>
  )
}

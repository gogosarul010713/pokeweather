export const msUntilNextHour = (): number => {
  const now = new Date()
  const next = new Date(now)
  next.setHours(next.getHours() + 1, 0, 0, 0)
  return next.getTime() - now.getTime()
}

export function getMigrationStatus(nextMigration: string, now: number): string {
  const target = new Date(nextMigration).getTime()
  const diff = target - now

  if (diff > 0) {
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    if (diff >= 86400000) return `Migra en ${days}d ${hours}h`
    if (diff >= 3600000) return `Migra en ${hours}h ${mins}m`
    return `Migra en ${mins}m`
  }

  const elapsed = now - target
  const days = Math.floor(elapsed / 86400000)
  const hours = Math.floor(elapsed / 3600000)
  if (elapsed >= 86400000) return `Migro hace ${days}d · Sin confirmar`
  return `Migro hace ${hours}h · Sin confirmar`
}

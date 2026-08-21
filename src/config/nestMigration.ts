export const MIGRATION_ANCHOR = '2026-08-06T10:00:00Z'
export const MIGRATION_CYCLE_DAYS = 14

const CYCLE_MS = MIGRATION_CYCLE_DAYS * 24 * 60 * 60 * 1000

export function getNextMigration(now: number): Date {
  const anchor = new Date(MIGRATION_ANCHOR).getTime()
  const elapsed = now - anchor
  const cycles = elapsed <= 0 ? 0 : Math.floor(elapsed / CYCLE_MS)
  return new Date(anchor + (cycles + 1) * CYCLE_MS)
}

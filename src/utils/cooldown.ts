const COOLDOWN_TABLE: [number, string][] = [
  [1000, '30 seg'],
  [5000, '2 min'],
  [10000, '8 min'],
  [25000, '12 min'],
  [65000, '15 min'],
  [80000, '16 min'],
  [100000, '22 min'],
  [250000, '25 min'],
  [500000, '35 min'],
  [750000, '45 min'],
  [1000000, '52 min'],
  [1500000, '56 min'],
]

export function getCooldown(meters: number): string {
  for (const [limit, label] of COOLDOWN_TABLE) {
    if (meters < limit) return label
  }
  return '2 hrs'
}

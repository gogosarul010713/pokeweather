import { useMemo } from 'react'
import type { PredictionRow } from '../components/Analytics/PredictionAnalysisTable'

export interface ConditionStat {
  condition: string
  hits: number
  misses: number
  total: number
  rate: number
}

export interface PrecisionStats {
  total: number
  hits: number
  globalRate: number
  byCondition: ConditionStat[]
  worstCondition: ConditionStat | null
  perfectConditions: ConditionStat[]
  failsByHour: Record<number, number>
  worstHourRange: string
}

export function usePrecisionStats(rows: PredictionRow[]): PrecisionStats {
  return useMemo(() => {
    const reported = rows.filter((r) => r.correct !== null)

    if (reported.length === 0) {
      return {
        total: 0,
        hits: 0,
        globalRate: 0,
        byCondition: [],
        worstCondition: null,
        perfectConditions: [],
        failsByHour: {},
        worstHourRange: '—',
      }
    }

    const hits = reported.filter((r) => r.correct === true).length
    const globalRate = hits / reported.length

    // Agrupar por condicion predicha
    const condMap = new Map<string, { hits: number; misses: number }>()
    reported.forEach((r) => {
      const cond = r.prediction
      const entry = condMap.get(cond) ?? { hits: 0, misses: 0 }
      if (r.correct === true) entry.hits++
      else entry.misses++
      condMap.set(cond, entry)
    })

    const byCondition: ConditionStat[] = Array.from(condMap.entries())
      .map(([condition, { hits: h, misses }]) => ({
        condition,
        hits: h,
        misses,
        total: h + misses,
        rate: h / (h + misses),
      }))
      .sort((a, b) => a.rate - b.rate)

    const worstCondition = byCondition.find((c) => c.misses > 0) ?? null
    const perfectConditions = byCondition.filter((c) => c.misses === 0)

    // Agrupar fallos por hora extraida de dateHour ("YYYY-MM-DD-HH")
    const failsByHour: Record<number, number> = {}
    reported
      .filter((r) => r.correct === false)
      .forEach((r) => {
        const parts = r.dateHour.split('-')
        const hour = parts.length === 4 ? parseInt(parts[3], 10) : -1
        if (hour >= 0 && hour <= 23) {
          failsByHour[hour] = (failsByHour[hour] ?? 0) + 1
        }
      })

    // Franja con mas fallos (ventana de 3 horas)
    let worstHourRange = '—'
    if (Object.keys(failsByHour).length > 0) {
      let maxFails = 0
      let worstH = 0
      Object.entries(failsByHour).forEach(([h, count]) => {
        if (count > maxFails) {
          maxFails = count
          worstH = parseInt(h, 10)
        }
      })
      const end = (worstH + 2) % 24
      worstHourRange = `${String(worstH).padStart(2, '0')}h-${String(end).padStart(2, '0')}h`
    }

    return {
      total: reported.length,
      hits,
      globalRate,
      byCondition,
      worstCondition,
      perfectConditions,
      failsByHour,
      worstHourRange,
    }
  }, [rows])
}

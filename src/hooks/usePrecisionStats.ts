import { useMemo } from 'react'
import type { WeatherReport } from '../services/firebase/classificationReportService'

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

export function usePrecisionStats(reports: WeatherReport[]): PrecisionStats {
  return useMemo(() => {
    if (reports.length === 0) {
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

    const hits = reports.filter(
      (r) => r.predicted_condition === r.reported_condition
    ).length
    const globalRate = hits / reports.length

    // Agrupar por condicion predicha
    const condMap = new Map<string, { hits: number; misses: number }>()
    reports.forEach((r) => {
      const isHit = r.predicted_condition === r.reported_condition
      const entry = condMap.get(r.predicted_condition) ?? { hits: 0, misses: 0 }
      if (isHit) entry.hits++
      else entry.misses++
      condMap.set(r.predicted_condition, entry)
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

    // Agrupar fallos por hora extraida de date_hour ("YYYY-MM-DD-HH")
    const failsByHour: Record<number, number> = {}
    reports
      .filter((r) => r.predicted_condition !== r.reported_condition)
      .forEach((r) => {
        const parts = r.date_hour.split('-')
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
      total: reports.length,
      hits,
      globalRate,
      byCondition,
      worstCondition,
      perfectConditions,
      failsByHour,
      worstHourRange,
    }
  }, [reports])
}

/**
 * src/utils/metricsCalculator.ts
 * Calculador de métricas de precisión (US-609)
 */

import type { WeatherSnapshot } from '../services/history/weatherHistoryService'

export interface ConditionMetrics {
  condition: string
  verified: number          // snapshots con actualCondition definido
  correct: number           // donde condition === actualCondition
  precision: number         // 0-100
  status: 'good' | 'warning' | 'danger'
}

export interface RegionMetrics {
  region: string
  verified: number
  correct: number
  precision: number
  status: 'good' | 'warning' | 'danger'
}

export interface PrecisionReport {
  totalSnapshots: number
  totalVerified: number
  totalCorrect: number
  overallPrecision: number
  byCondition: ConditionMetrics[]
  byRegion: RegionMetrics[]
  target: number
  gap: number
  isReliable: boolean       // true si verified >= 10
}

const TARGET_PRECISION = 98
const CONDITION_THRESHOLDS = {
  good: 98,      // >= 98%
  warning: 80,   // >= 80%
  danger: 0,     // < 80%
}

const REGION_NAMES: Record<string, string> = {
  'america': 'América',
  'europa': 'Europa',
  'asia': 'Asia',
  'oceania': 'Oceanía',
  'africa': 'África',
}

/**
 * Obtiene el estado visual de una precisión
 */
export function getPrecisionStatus(precision: number): 'good' | 'warning' | 'danger' {
  if (precision >= CONDITION_THRESHOLDS.good) return 'good'
  if (precision >= CONDITION_THRESHOLDS.warning) return 'warning'
  return 'danger'
}

/**
 * Obtiene el emoji para el estado
 */
export function getStatusEmoji(status: 'good' | 'warning' | 'danger'): string {
  switch (status) {
    case 'good':
      return '🟢'
    case 'warning':
      return '🟡'
    case 'danger':
      return '🔴'
  }
}

/**
 * Calcula métricas de precisión a partir de snapshots
 */
export function calculatePrecisionMetrics(snapshots: WeatherSnapshot[]): PrecisionReport {
  // Filtrar solo snapshots verificados (con actualCondition definido)
  const verified = snapshots.filter(s => s.actualCondition && s.actualCondition !== '')

  if (verified.length === 0) {
    return {
      totalSnapshots: snapshots.length,
      totalVerified: 0,
      totalCorrect: 0,
      overallPrecision: 0,
      byCondition: [],
      byRegion: [],
      target: TARGET_PRECISION,
      gap: -TARGET_PRECISION,
      isReliable: false,
    }
  }

  // Contar correctos
  const correct = verified.filter(s => s.condition === s.actualCondition)
  const overallPrecision = Math.round((correct.length / verified.length) * 100)
  const gap = overallPrecision - TARGET_PRECISION

  // Agrupar por condición
  const byConditionMap = new Map<string, { verified: number; correct: number }>()
  verified.forEach(snapshot => {
    const cond = snapshot.condition || 'unknown'
    const entry = byConditionMap.get(cond) || { verified: 0, correct: 0 }

    entry.verified += 1
    if (cond === snapshot.actualCondition) {
      entry.correct += 1
    }

    byConditionMap.set(cond, entry)
  })

  const byCondition: ConditionMetrics[] = Array.from(byConditionMap.entries())
    .map(([condition, { verified: v, correct: c }]) => {
      const precision = Math.round((c / v) * 100)
      return {
        condition,
        verified: v,
        correct: c,
        precision,
        status: getPrecisionStatus(precision),
      }
    })
    .sort((a, b) => b.precision - a.precision)

  // Agrupar por región
  const byRegionMap = new Map<string, { verified: number; correct: number }>()
  verified.forEach(snapshot => {
    const region = snapshot.cityRegion || 'unknown'
    const entry = byRegionMap.get(region) || { verified: 0, correct: 0 }

    entry.verified += 1
    if (snapshot.condition === snapshot.actualCondition) {
      entry.correct += 1
    }

    byRegionMap.set(region, entry)
  })

  const byRegion: RegionMetrics[] = Array.from(byRegionMap.entries())
    .map(([region, { verified: v, correct: c }]) => {
      const precision = Math.round((c / v) * 100)
      return {
        region: REGION_NAMES[region] || region,
        verified: v,
        correct: c,
        precision,
        status: getPrecisionStatus(precision),
      }
    })
    .sort((a, b) => b.precision - a.precision)

  return {
    totalSnapshots: snapshots.length,
    totalVerified: verified.length,
    totalCorrect: correct.length,
    overallPrecision,
    byCondition,
    byRegion,
    target: TARGET_PRECISION,
    gap,
    isReliable: verified.length >= 10,
  }
}

/**
 * Formatea un porcentaje con color
 */
export function formatPrecisionWithColor(precision: number): string {
  return `${precision}%`
}

/**
 * Obtiene el color CSS para una precisión
 */
export function getPrecisionColor(status: 'good' | 'warning' | 'danger'): string {
  switch (status) {
    case 'good':
      return 'var(--success)'
    case 'warning':
      return 'var(--warning)'
    case 'danger':
      return 'var(--danger)'
  }
}

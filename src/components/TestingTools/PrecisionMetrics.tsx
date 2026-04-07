/**
 * src/components/TestingTools/PrecisionMetrics.tsx
 * Panel de métricas de precisión climática — Optimizado para mostrar tabla de condiciones
 * US-609: Métricas de Precisión
 */

import { useEffect, useState } from 'react'
import {
  getSnapshots,
  getRetentionDays,
} from '../../services/history/weatherHistoryService'
import {
  calculatePrecisionMetrics,
  getStatusEmoji,
  getPrecisionColor,
  type PrecisionReport,
} from '../../utils/metricsCalculator'

interface PrecisionMetricsProps {
  retentionDays?: 7 | 14 | 30
}

export default function PrecisionMetrics({ retentionDays = 7 }: PrecisionMetricsProps) {
  const [report, setReport] = useState<PrecisionReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [retentionDays])

  const loadMetrics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const days = retentionDays || (getRetentionDays() as 7 | 14 | 30) || 7
      const snapshots = await getSnapshots({ retentionDays: days })
      const precisionReport = calculatePrecisionMetrics(snapshots)
      setReport(precisionReport)
    } catch (err) {
      console.error('Error loading metrics:', err)
      setError('Error al cargar métricas')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pm-container">
        <div className="pm-loading">Calculando métricas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pm-container">
        <div className="pm-error">❌ {error}</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="pm-container">
        <div className="pm-empty">📭 No hay datos de precisión disponibles</div>
      </div>
    )
  }

  const { totalVerified, totalCorrect, overallPrecision, target, gap, isReliable } = report

  return (
    <div className="pm-container">
      {/* Header — Una sola línea */}
      <div className="pm-header-compact">
        <div className="pm-header-main">
          <h3 className="pm-title">📊 Métricas de Precisión</h3>
          <span className="pm-subtitle">
            Basado en: {totalVerified} verificaciones (de {report.totalSnapshots} snapshots)
          </span>
        </div>

        {!isReliable && (
          <div className="pm-warning-inline">
            ⚠️ Datos insuficientes
          </div>
        )}
      </div>

      {/* Overall Stats — Lineal */}
      <div className="pm-overall-linear">
        <div className="pm-stat-inline">
          <span className="pm-stat-label">Precisión General:</span>
          <span
            className="pm-stat-value-large"
            style={{ color: getPrecisionColor(overallPrecision >= 98 ? 'good' : overallPrecision >= 80 ? 'warning' : 'danger') }}
          >
            {overallPrecision}% {getStatusEmoji(overallPrecision >= 98 ? 'good' : overallPrecision >= 80 ? 'warning' : 'danger')}
          </span>
        </div>

        <div className="pm-stat-inline">
          <span className="pm-stat-label">Correctos:</span>
          <span className="pm-stat-value-inline">
            {totalCorrect} / {totalVerified}
          </span>
        </div>

        <div className="pm-stat-inline">
          <span className="pm-stat-label">Target:</span>
          <span className="pm-stat-value-inline">{target}%</span>
        </div>

        <div className="pm-stat-inline">
          <span className="pm-stat-label">Gap:</span>
          <span
            className="pm-stat-value-inline"
            style={{ color: gap >= 0 ? 'var(--success)' : 'var(--danger)' }}
          >
            {gap >= 0 ? '+' : ''}{gap}%
          </span>
        </div>
      </div>

      {/* Tabla de Condiciones — Grande */}
      <div className="pm-table-wrapper">
        <div className="pm-table-title">🌡️ Precisión por Condición</div>
        <table className="pm-table">
          <thead>
            <tr>
              <th className="th-condition">Condición</th>
              <th className="th-verified">Verificados</th>
              <th className="th-correct">Correctos</th>
              <th className="th-precision">Precisión</th>
            </tr>
          </thead>
          <tbody>
            {report.byCondition.map(metric => (
              <tr key={metric.condition} className={`pm-row-${metric.status}`}>
                <td className="pm-condition-cell">{metric.condition}</td>
                <td className="pm-verified-cell">{metric.verified}</td>
                <td className="pm-correct-cell">{metric.correct}</td>
                <td className="pm-precision-cell">
                  <span
                    className="pm-precision-value"
                    style={{ color: getPrecisionColor(metric.status) }}
                  >
                    {metric.precision}% {getStatusEmoji(metric.status)}
                  </span>
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="pm-total-row">
              <td className="pm-condition-cell">
                <strong>TOTAL</strong>
              </td>
              <td className="pm-verified-cell">
                <strong>{totalVerified}</strong>
              </td>
              <td className="pm-correct-cell">
                <strong>{totalCorrect}</strong>
              </td>
              <td className="pm-precision-cell">
                <strong>
                  <span
                    className="pm-precision-value"
                    style={{ color: getPrecisionColor(overallPrecision >= 98 ? 'good' : overallPrecision >= 80 ? 'warning' : 'danger') }}
                  >
                    {overallPrecision}% {getStatusEmoji(overallPrecision >= 98 ? 'good' : overallPrecision >= 80 ? 'warning' : 'danger')}
                  </span>
                </strong>
              </td>
            </tr>

            {/* Gap Row */}
            <tr className="pm-target-row">
              <td className="pm-condition-cell">Target: {target}%</td>
              <td colSpan={3} className="pm-gap-cell">
                <span style={{ color: gap >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {gap >= 0 ? '✅' : '❌'} Gap: {gap >= 0 ? '+' : ''}{gap}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="pm-legend">
        <div className="pm-legend-item">
          <span className="pm-legend-dot" style={{ backgroundColor: 'var(--success)' }}></span>
          <span>Bueno (≥98%)</span>
        </div>
        <div className="pm-legend-item">
          <span className="pm-legend-dot" style={{ backgroundColor: 'var(--warning)' }}></span>
          <span>Advertencia (80–97%)</span>
        </div>
        <div className="pm-legend-item">
          <span className="pm-legend-dot" style={{ backgroundColor: 'var(--danger)' }}></span>
          <span>Crítico (&lt;80%)</span>
        </div>
      </div>

      <style>{`
        .pm-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          max-height: 600px;
          overflow-y: auto;
        }

        .pm-loading,
        .pm-error,
        .pm-empty {
          padding: 24px;
          text-align: center;
          color: var(--text-secondary);
        }

        .pm-error {
          color: var(--danger);
          font-weight: 500;
        }

        /* Header Compacto — Una línea */
        .pm-header-compact {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pm-header-main {
          display: flex;
          align-items: baseline;
          gap: 6px;
          min-width: 0;
        }

        .pm-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .pm-subtitle {
          margin: 0;
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pm-warning-inline {
          padding: 4px 8px;
          background: rgba(255, 152, 0, 0.1);
          border-left: 2px solid var(--warning);
          border-radius: 2px;
          font-size: 10px;
          color: var(--warning);
          font-weight: 500;
          white-space: nowrap;
        }

        /* Overall Stats — Lineal */
        .pm-overall-linear {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 4px;
          border: 1px solid var(--border-primary);
        }

        .pm-stat-inline {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .pm-stat-label {
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pm-stat-value-large {
          font-size: 15px;
          font-weight: 700;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .pm-stat-value-inline {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: 'Monaco', 'Courier New', monospace;
        }

        /* Tabla — Grande y Prominente */
        .pm-table-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid var(--border-primary);
        }

        .pm-table-title {
          padding: 10px 12px;
          background: var(--bg-tertiary);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pm-table {
          border-collapse: collapse;
          font-size: 12px;
          width: 100%;
          background: var(--bg-secondary);
        }

        .pm-table th {
          background: var(--bg-primary);
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border-primary);
          font-size: 11px;
        }

        .th-condition {
          min-width: 100px;
        }

        .th-verified {
          text-align: center;
          min-width: 85px;
          font-weight: 700;
        }

        .th-correct {
          text-align: center;
          min-width: 70px;
        }

        .th-precision {
          text-align: right;
          min-width: 90px;
        }

        .pm-table td {
          padding: 12px 8px;
          border-bottom: 1px solid var(--border-primary);
          color: var(--text-primary);
        }

        .pm-condition-cell {
          font-weight: 500;
          text-transform: capitalize;
        }

        .pm-verified-cell {
          text-align: center;
          font-weight: 700;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
        }

        .pm-correct-cell {
          text-align: center;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .pm-precision-cell {
          text-align: right;
          font-weight: 600;
        }

        .pm-precision-value {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.1);
          font-size: 11px;
          font-weight: 600;
        }

        .pm-row-good {
          background: rgba(76, 175, 80, 0.05);
        }

        .pm-row-good:hover {
          background: rgba(76, 175, 80, 0.1);
        }

        .pm-row-warning {
          background: rgba(255, 152, 0, 0.05);
        }

        .pm-row-warning:hover {
          background: rgba(255, 152, 0, 0.1);
        }

        .pm-row-danger {
          background: rgba(244, 67, 54, 0.05);
        }

        .pm-row-danger:hover {
          background: rgba(244, 67, 54, 0.1);
        }

        .pm-total-row {
          background: var(--bg-tertiary);
          font-weight: 600;
          border-top: 2px solid var(--border-primary);
          border-bottom: 2px solid var(--border-primary);
        }

        .pm-target-row {
          background: var(--bg-primary);
          border-top: 1px dashed var(--border-primary);
          font-size: 11px;
        }

        .pm-gap-cell {
          text-align: right;
          padding: 12px 8px;
          font-weight: 600;
        }

        .pm-legend {
          display: flex;
          gap: 12px;
          padding: 10px 12px;
          background: var(--bg-primary);
          border-radius: 4px;
          border: 1px solid var(--border-primary);
          flex-wrap: wrap;
          font-size: 10px;
        }

        .pm-legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
        }

        .pm-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}

/**
 * src/components/TestingTools/PrecisionMetrics.tsx
 * Panel de métricas de precisión climática
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
  const [activeTab, setActiveTab] = useState<'conditions' | 'regions'>('conditions')

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
      {/* Header */}
      <div className="pm-header">
        <div className="pm-header-info">
          <h3 className="pm-title">📊 Métricas de Precisión</h3>
          <p className="pm-subtitle">
            Basado en: {totalVerified} verificaciones (de {report.totalSnapshots} snapshots)
          </p>
        </div>

        {!isReliable && (
          <div className="pm-warning">
            ⚠️ Datos insuficientes para estadísticas confiables (&lt;10 verificaciones)
          </div>
        )}
      </div>

      {/* Overall Stats */}
      <div className="pm-overall">
        <div className="pm-stat">
          <span className="pm-stat-label">Precisión General</span>
          <span className="pm-stat-value" style={{ color: getPrecisionColor(report.overallPrecision >= 98 ? 'good' : overallPrecision >= 80 ? 'warning' : 'danger') }}>
            {overallPrecision}% {getStatusEmoji(report.overallPrecision >= 98 ? 'good' : overallPrecision >= 80 ? 'warning' : 'danger')}
          </span>
        </div>

        <div className="pm-stat">
          <span className="pm-stat-label">Correctos</span>
          <span className="pm-stat-value">
            {totalCorrect} / {totalVerified}
          </span>
        </div>

        <div className="pm-stat">
          <span className="pm-stat-label">Target</span>
          <span className="pm-stat-value">{target}%</span>
        </div>

        <div className="pm-stat">
          <span className="pm-stat-label">Gap</span>
          <span className="pm-stat-value" style={{ color: gap >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {gap >= 0 ? '+' : ''}{gap}%
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="pm-tabs">
        <button
          className={`pm-tab ${activeTab === 'conditions' ? 'active' : ''}`}
          onClick={() => setActiveTab('conditions')}
        >
          🌡️ Por Condición ({report.byCondition.length})
        </button>
        <button
          className={`pm-tab ${activeTab === 'regions' ? 'active' : ''}`}
          onClick={() => setActiveTab('regions')}
        >
          🌍 Por Región ({report.byRegion.length})
        </button>
      </div>

      {/* Conditions Table */}
      {activeTab === 'conditions' && (
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Condición</th>
                <th>Verificados</th>
                <th>Correctos</th>
                <th>Precisión</th>
              </tr>
            </thead>
            <tbody>
              {report.byCondition.map(metric => (
                <tr key={metric.condition} className={`pm-row-${metric.status}`}>
                  <td className="pm-condition-cell">{metric.condition}</td>
                  <td className="pm-number-cell">{metric.verified}</td>
                  <td className="pm-number-cell">{metric.correct}</td>
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
                <td className="pm-number-cell">
                  <strong>{totalVerified}</strong>
                </td>
                <td className="pm-number-cell">
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
      )}

      {/* Regions Table */}
      {activeTab === 'regions' && (
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Región</th>
                <th>Verificados</th>
                <th>Correctos</th>
                <th>Precisión</th>
              </tr>
            </thead>
            <tbody>
              {report.byRegion.map(metric => (
                <tr key={metric.region} className={`pm-row-${metric.status}`}>
                  <td className="pm-condition-cell">{metric.region}</td>
                  <td className="pm-number-cell">{metric.verified}</td>
                  <td className="pm-number-cell">{metric.correct}</td>
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
                <td className="pm-number-cell">
                  <strong>{totalVerified}</strong>
                </td>
                <td className="pm-number-cell">
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
      )}

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
          gap: 16px;
          padding: 16px;
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

        .pm-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pm-header-info {
          margin: 0;
        }

        .pm-title {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pm-subtitle {
          margin: 0;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .pm-warning {
          padding: 8px 12px;
          background: rgba(255, 152, 0, 0.1);
          border-left: 3px solid var(--warning);
          border-radius: 3px;
          font-size: 11px;
          color: var(--warning);
          font-weight: 500;
        }

        .pm-overall {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 4px;
          border: 1px solid var(--border-primary);
        }

        .pm-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pm-stat-label {
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .pm-stat-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .pm-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--border-primary);
          background: var(--bg-primary);
          border-radius: 4px 4px 0 0;
        }

        .pm-tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
          border-bottom: 2px solid transparent;
          text-align: center;
        }

        .pm-tab:hover {
          color: var(--text-primary);
        }

        .pm-tab.active {
          color: var(--text-primary);
          border-bottom-color: #1F77E3;
        }

        .pm-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
        }

        .pm-table {
          border-collapse: collapse;
          font-size: 11px;
          width: 100%;
          background: var(--bg-secondary);
        }

        .pm-table th {
          background: var(--bg-tertiary);
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-primary);
          white-space: nowrap;
        }

        .pm-table td {
          padding: 10px 8px;
          border-bottom: 1px solid var(--border-primary);
          color: var(--text-primary);
        }

        .pm-condition-cell {
          font-weight: 500;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pm-number-cell {
          text-align: center;
          font-family: 'Monaco', 'Courier New', monospace;
          width: 80px;
        }

        .pm-precision-cell {
          text-align: right;
          font-weight: 600;
          width: 100px;
        }

        .pm-precision-value {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.1);
          font-size: 10px;
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
        }

        .pm-gap-cell {
          text-align: right;
          padding: 10px 8px;
          font-weight: 600;
        }

        .pm-legend {
          display: flex;
          gap: 16px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 4px;
          border: 1px solid var(--border-primary);
          flex-wrap: wrap;
          font-size: 11px;
        }

        .pm-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
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

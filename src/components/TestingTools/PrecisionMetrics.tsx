/**
 * src/components/TestingTools/PrecisionMetrics.tsx
 * Panel de métricas de precisión climática — Optimizado para mostrar tabla de condiciones
 * US-609: Métricas de Precisión
 */

import { useEffect, useState } from 'react'
import {
  // BUG-020: getSnapshots removed (fn doesn't exist). TestingTools is DEV-only anyway.
  // getSnapshots,
  getRetentionDays,
} from '../../services/history/weatherHistoryService'
import {
  getRecentForecasts,
} from '../../services/firebase/firebaseWeatherService'
import {
  calculatePrecisionMetrics,
  getStatusEmoji,
  getPrecisionColor,
  type PrecisionReport,
} from '../../utils/metricsCalculator'

interface PrecisionMetricsProps {
  retentionDays?: 7 | 14 | 30
}

type DataSource = 'indexeddb' | 'firestore'
type TimeRange = '1h' | '6h' | '24h' | '7d'

export default function PrecisionMetrics({ retentionDays = 7 }: PrecisionMetricsProps) {
  const [report, setReport] = useState<PrecisionReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<DataSource>('firestore')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [firestoreStats, setFirestoreStats] = useState<{
    totalSnapshots: number
    uniqueCities: number
    conditionCounts: Record<string, number>
  } | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [retentionDays, source, timeRange])

  const loadMetrics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setReport(null)
      setFirestoreStats(null)

      if (source === 'firestore') {
        // Cargar desde Firestore
        const forecasts = await getRecentForecasts(timeRange)

        if (forecasts.length === 0) {
          setError('No hay datos en Firestore para este rango')
          setIsLoading(false)
          return
        }

        // Procesar estadísticas de Firestore
        const uniqueCities = new Set<string>()
        const conditionCounts: Record<string, number> = {}
        let totalSnapshots = 0

        forecasts.forEach(doc => {
          uniqueCities.add(doc.city_id)
          doc.snapshots.forEach(snap => {
            totalSnapshots++
            const cond = snap.classified || 'unknown'
            conditionCounts[cond] = (conditionCounts[cond] || 0) + 1
          })
        })

        setFirestoreStats({
          totalSnapshots,
          uniqueCities: uniqueCities.size,
          conditionCounts,
        })
      } else {
        // Cargar desde IndexedDB
        // BUG-020: getSnapshots doesn't exist, TestingTools is DEV-only stub
        // const days = retentionDays || (getRetentionDays() as 7 | 14 | 30) || 7
        // const snapshots = await getSnapshots({ retentionDays: days })
        // const precisionReport = calculatePrecisionMetrics(snapshots)
        // setReport(precisionReport)
        setReport({ byCondition: {}, correctCount: 0, totalCount: 0, accuracy: 0 })
      }
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

  if (!report && !firestoreStats) {
    return (
      <div className="pm-container">
        <div className="pm-empty">📭 No hay datos de precisión disponibles</div>
      </div>
    )
  }

  return (
    <div className="pm-container">
      {/* Header con Selectores */}
      <div className="pm-header-with-controls">
        <div className="pm-header-main">
          <h3 className="pm-title">📊 Métricas de Precisión</h3>
        </div>

        <div className="pm-controls">
          {/* Selector Fuente */}
          <div className="pm-control-group">
            <label className="pm-control-label">Fuente:</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value as DataSource)}
              className="pm-select"
            >
              <option value="firestore">🔥 Firestore (Histórico)</option>
              <option value="indexeddb">💾 IndexedDB (Verificado)</option>
            </select>
          </div>

          {/* Selector Rango */}
          <div className="pm-control-group">
            <label className="pm-control-label">Rango:</label>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value as TimeRange)}
              className="pm-select"
            >
              <option value="1h">Última hora</option>
              <option value="6h">Últimas 6h</option>
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Renderizar según fuente */}
      {source === 'firestore' && firestoreStats ? (
        <FirestoreStatsView stats={firestoreStats} />
      ) : report ? (
        <IndexedDBPrecisionView report={report} />
      ) : null}

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

        .pm-header-with-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .pm-header-inline {
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

        .pm-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .pm-control-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pm-control-label {
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .pm-select {
          padding: 4px 8px;
          font-size: 11px;
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
        }

        .pm-select:hover {
          background: var(--bg-secondary);
        }

        .pm-select:focus {
          outline: none;
          border-color: var(--primary);
        }

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

        .pm-info-note {
          padding: 8px 12px;
          background: rgba(33, 150, 243, 0.1);
          border-left: 3px solid #2196f3;
          border-radius: 2px;
          font-size: 10px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
      `}</style>
    </div>
  )
}

// ─── Componente: Vista de Firestore ───────────────────────────────────────────

function FirestoreStatsView({
  stats,
}: {
  stats: { totalSnapshots: number; uniqueCities: number; conditionCounts: Record<string, number> }
}) {
  const { totalSnapshots, uniqueCities, conditionCounts } = stats
  const conditionArray = Object.entries(conditionCounts)
    .map(([condition, count]) => ({ condition, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <>
      {/* Overall Stats */}
      <div className="pm-overall-linear">
        <div className="pm-stat-inline">
          <span className="pm-stat-label">Total Clasificaciones:</span>
          <span className="pm-stat-value-large">{totalSnapshots}</span>
        </div>

        <div className="pm-stat-inline">
          <span className="pm-stat-label">Ciudades:</span>
          <span className="pm-stat-value-inline">{uniqueCities}</span>
        </div>

        <div className="pm-stat-inline">
          <span className="pm-stat-label">Promedio/Ciudad:</span>
          <span className="pm-stat-value-inline">
            {totalSnapshots > 0 ? Math.round(totalSnapshots / uniqueCities) : 0}
          </span>
        </div>
      </div>

      {/* Tabla de Condiciones */}
      <div className="pm-table-wrapper">
        <div className="pm-table-title">🌡️ Snapshots por Condición</div>
        <table className="pm-table">
          <thead>
            <tr>
              <th className="th-condition">Condición</th>
              <th className="th-verified">Snapshots</th>
              <th className="th-precision">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {conditionArray.map(({ condition, count }) => {
              const percent = totalSnapshots > 0 ? Math.round((count / totalSnapshots) * 100) : 0
              return (
                <tr key={condition} className="pm-row-good">
                  <td className="pm-condition-cell">{condition || 'unknown'}</td>
                  <td className="pm-verified-cell">{count}</td>
                  <td className="pm-precision-cell">
                    <span className="pm-precision-value">{percent}%</span>
                  </td>
                </tr>
              )
            })}

            {/* Total */}
            <tr className="pm-total-row">
              <td className="pm-condition-cell">
                <strong>TOTAL</strong>
              </td>
              <td className="pm-verified-cell">
                <strong>{totalSnapshots}</strong>
              </td>
              <td className="pm-precision-cell">
                <strong>
                  <span className="pm-precision-value">100%</span>
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pm-info-note">
        ℹ️ Firestore muestra el volumen histórico de clasificaciones (sin verificación de precisión).
        Los datos persisten entre sesiones y dispositivos.
      </div>
    </>
  )
}

// ─── Componente: Vista de IndexedDB (Precisión) ─────────────────────────────

function IndexedDBPrecisionView({ report }: { report: PrecisionReport }) {
  const { totalVerified, totalCorrect, overallPrecision, target, gap, isReliable } = report

  return (
    <>
      {/* Header inline */}
      <div className="pm-header-inline">
        <span className="pm-subtitle">
          Basado en: {totalVerified} verificaciones (de {report.totalSnapshots} snapshots)
        </span>

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
    </>
  )
}

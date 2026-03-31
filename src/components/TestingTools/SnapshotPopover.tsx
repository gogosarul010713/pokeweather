import { useState } from 'react'
import { updateActualCondition } from '../../services/history/weatherHistoryService'
import { CONDITION_EMOJIS, CONDITION_NAMES, CONDITIONS } from '../../config/conditionEmojis'
import type { WeatherSnapshot } from '../../services/history/weatherHistoryService'

interface SnapshotPopoverProps {
  snapshot: WeatherSnapshot
  allSnapshots: WeatherSnapshot[]
  onClose: () => void
  onUpdated: () => void
}

export default function SnapshotPopover({ snapshot, allSnapshots, onClose, onUpdated }: SnapshotPopoverProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleUpdateActualCondition = async (snapshotId: string, condition: string | null) => {
    setUpdating(snapshotId)
    try {
      await updateActualCondition(snapshotId, condition)
      onUpdated()
    } catch (error) {
      console.error('Error updating actual condition:', error)
      alert('Error al actualizar. Ver consola.')
    } finally {
      setUpdating(null)
    }
  }

  const dateStr = new Date(snapshot.capturedAt).toLocaleDateString('es-ES')
  const sortedSnapshots = [...allSnapshots].sort((a, b) => a.capturedAt - b.capturedAt)

  const getStatusIcon = (snap: WeatherSnapshot): string => {
    if (snap.actualCondition === undefined || snap.actualCondition === null) return '?'
    if (snap.isCorrect) return '✓'
    if (snap.isCorrect === false) return '✗'
    return '—'
  }

  const getStatusColor = (snap: WeatherSnapshot): string => {
    if (snap.actualCondition === undefined || snap.actualCondition === null) return 'unverified'
    if (snap.isCorrect) return 'correct'
    if (snap.isCorrect === false) return 'incorrect'
    return 'empty'
  }

  return (
    <>
      <style>{`
        .sp-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2500;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .sp-modal {
          position: relative;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          width: 90%;
          max-width: 450px;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
          animation: popIn 0.3s ease-out;
          z-index: 2501;
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .sp-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .sp-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .sp-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .sp-close:hover {
          background-color: var(--bg-tertiary);
        }

        .sp-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .sp-row {
          display: grid;
          grid-template-columns: 50px 1fr 140px 50px;
          gap: 8px;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border-default);
          border-radius: 4px;
          margin-bottom: 8px;
          background: var(--bg-primary);
        }

        .sp-time {
          font-weight: 600;
          font-size: 12px;
          color: var(--text-secondary);
          text-align: center;
        }

        .sp-condition {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-primary);
        }

        .sp-condition-emoji {
          font-size: 16px;
        }

        .sp-select {
          padding: 6px 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sp-select:hover {
          background: var(--bg-quaternary);
        }

        .sp-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .sp-status {
          font-weight: 600;
          font-size: 12px;
          text-align: center;
          padding: 4px 8px;
          border-radius: 4px;
          min-width: 40px;
        }

        .sp-status-unverified {
          background: rgba(255, 193, 7, 0.15);
          color: #ff9800;
        }

        .sp-status-correct {
          background: rgba(76, 175, 80, 0.15);
          color: #4caf50;
        }

        .sp-status-incorrect {
          background: rgba(244, 67, 54, 0.15);
          color: #f44336;
        }

        .sp-status-empty {
          background: rgba(158, 158, 158, 0.15);
          color: #9e9e9e;
        }

        .sp-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border-default);
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .sp-button {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sp-button-close {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .sp-button-close:hover {
          background: var(--bg-quaternary);
        }
      `}</style>

      <div className="sp-overlay" onClick={onClose}>
        <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sp-header">
            <div>
              <div className="sp-title">
                {snapshot.cityName} — {dateStr}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {CONDITION_EMOJIS[snapshot.condition as keyof typeof CONDITION_EMOJIS] || '❓'} {CONDITION_NAMES[snapshot.condition as keyof typeof CONDITION_NAMES]}
              </div>
            </div>
            <button className="sp-close" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* List */}
          <div className="sp-list">
            {sortedSnapshots.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No hay snapshots para este día
              </div>
            ) : (
              sortedSnapshots.map((snap) => {
                const hour = new Date(snap.capturedAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const statusClass = getStatusColor(snap)
                const statusIcon = getStatusIcon(snap)

                return (
                  <div key={snap.snapshotId} className="sp-row">
                    <div className="sp-time">{hour}</div>
                    <div className="sp-condition">
                      <span className="sp-condition-emoji">{CONDITION_EMOJIS[snap.condition as keyof typeof CONDITION_EMOJIS] || '❓'}</span>
                      <span>{CONDITION_NAMES[snap.condition as keyof typeof CONDITION_NAMES]}</span>
                    </div>
                    <select
                      className="sp-select"
                      value={snap.actualCondition || ''}
                      onChange={(e) => handleUpdateActualCondition(snap.snapshotId, e.target.value || null)}
                      disabled={updating === snap.snapshotId}
                    >
                      <option value="">No verificado</option>
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {CONDITION_NAMES[cond]}
                        </option>
                      ))}
                    </select>
                    <div className={`sp-status sp-status-${statusClass}`}>{statusIcon}</div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="sp-footer">
            <button className="sp-button sp-button-close" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

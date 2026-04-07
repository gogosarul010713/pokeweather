import { useState } from 'react'
import { updateActualCondition } from '../../services/history/weatherHistoryService'
import { CONDITION_EMOJIS, CONDITION_NAMES, CONDITIONS } from '../../config/conditionEmojis'
import type { WeatherSnapshot } from '../../services/history/weatherHistoryService'

interface HistoryEntry {
  fecha: string
  ciudad: { id: string; name: string; country: string; region: string }
  snapshots: WeatherSnapshot[]
  precisionPercentage: number
}

interface SnapshotPopoverProps {
  entry: HistoryEntry
  onClose: () => void
  onUpdated?: () => void
  isMaximized?: boolean
}

export default function SnapshotPopover({ entry, onClose, onUpdated, isMaximized = false }: SnapshotPopoverProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const sortedSnapshots = [...entry.snapshots].sort((a, b) => a.capturedAt - b.capturedAt)
  const mainCondition = entry.snapshots[0]?.condition || 'unknown'
  const mainConditionEmoji = CONDITION_EMOJIS[mainCondition as keyof typeof CONDITION_EMOJIS] || '❓'
  const mainConditionName = CONDITION_NAMES[mainCondition as keyof typeof CONDITION_NAMES] || mainCondition

  const handleUpdateActualCondition = async (snapshotId: string, condition: string | null) => {
    setUpdating(snapshotId)
    try {
      const result = await updateActualCondition(snapshotId, condition || null)
      if (result) {
        // Actualización exitosa - recarga el popover si callback existe
        if (onUpdated) {
          onUpdated()
        }
      } else {
        console.error('Failed to update actual condition')
        alert('Error al actualizar el clima real.')
      }
    } catch (error) {
      console.error('Error updating actual condition:', error)
      alert('Error al actualizar. Ver consola.')
    } finally {
      setUpdating(null)
    }
  }

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
          background: rgba(0, 0, 0, 0.6);
          z-index: ${isMaximized ? 3500 : 2500};
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
          padding: 20px;
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
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
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
          padding: 20px;
          border-bottom: 1px solid var(--border-default);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .sp-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .sp-header-condition {
          font-size: 48px;
          line-height: 1;
        }

        .sp-header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sp-location {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .sp-date-condition {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .sp-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
          flex-shrink: 0;
        }

        .sp-close:hover {
          background-color: var(--bg-tertiary);
        }

        .sp-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sp-row {
          display: grid;
          grid-template-columns: 60px 1fr 150px 45px;
          gap: 12px;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border-default);
          border-radius: 6px;
          background: var(--bg-primary);
        }

        .sp-time {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          text-align: center;
        }

        .sp-condition {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-primary);
        }

        .sp-condition-emoji {
          font-size: 18px;
        }

        .sp-select {
          padding: 8px 10px;
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
          font-weight: 700;
          font-size: 16px;
          text-align: center;
          padding: 6px;
          border-radius: 4px;
          min-width: 40px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
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
          padding: 16px 20px;
          border-top: 1px solid var(--border-default);
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .sp-button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
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

        .sp-empty-message {
          padding: 20px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 14px;
        }
      `}</style>

      <div className="sp-overlay" onClick={onClose}>
        <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sp-header">
            <div className="sp-header-content">
              <div className="sp-header-condition">{mainConditionEmoji}</div>
              <div className="sp-header-text">
                <div className="sp-location">
                  {entry.ciudad.name} — {entry.fecha}
                </div>
                <div className="sp-date-condition">{mainConditionName}</div>
              </div>
            </div>
            <button className="sp-close" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* List */}
          <div className="sp-list">
            {sortedSnapshots.length === 0 ? (
              <div className="sp-empty-message">No hay snapshots para este día</div>
            ) : (
              sortedSnapshots.map((snap) => {
                const hour = new Date(snap.capturedAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
                const statusClass = getStatusColor(snap)
                const statusIcon = getStatusIcon(snap)

                return (
                  <div key={snap.snapshotId} className="sp-row">
                    <div className="sp-time">{hour}</div>
                    <div className="sp-condition">
                      <span className="sp-condition-emoji">
                        {CONDITION_EMOJIS[snap.condition as keyof typeof CONDITION_EMOJIS] || '❓'}
                      </span>
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
              ✓ Guardar y Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

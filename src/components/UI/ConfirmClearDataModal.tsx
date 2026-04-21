import React, { useState, useEffect } from 'react'
import { fetchCleanupCounts } from '../../services/cleanup/cleanupService'

export interface CleanupOptions {
  nullSnapshots: boolean
  olderThan7d: boolean
  allIndexedDb: boolean
  allLocalStorage: boolean
}

interface ConfirmClearDataModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: CleanupOptions) => Promise<void>
}

interface CleanupCounts {
  nullDocs: number
  oldDocs: number
  cacheSize: string
}

export const ConfirmClearDataModal: React.FC<ConfirmClearDataModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [cleanupOptions, setCleanupOptions] = useState<CleanupOptions>({
    nullSnapshots: false,
    olderThan7d: false,
    allIndexedDb: false,
    allLocalStorage: false,
  })
  const [counts, setCounts] = useState<CleanupCounts>({
    nullDocs: 0,
    oldDocs: 0,
    cacheSize: '0 MB',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const loadCounts = async () => {
      try {
        const result = await fetchCleanupCounts()
        setCounts(result)
        setErrorMsg('')
      } catch (error) {
        console.error('Failed to fetch cleanup counts:', error)
        setCounts({ nullDocs: 0, oldDocs: 0, cacheSize: '0 MB' })
      }
    }

    loadCounts()
  }, [isOpen])

  const handleOptionChange = (key: keyof CleanupOptions, value: boolean) => {
    setCleanupOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleConfirm = async () => {
    if (!Object.values(cleanupOptions).some(Boolean)) {
      setErrorMsg('Selecciona al menos una opción para limpiar')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      await onConfirm(cleanupOptions)
      onClose()
    } catch (error) {
      setErrorMsg((error as Error).message || 'Error durante la limpieza')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const anyOptionSelected = Object.values(cleanupOptions).some(Boolean)

  return (
    <div className="ccdm-backdrop">
      <div className="ccdm-modal">
        <div className="ccdm-header">
          <h2 className="ccdm-title">Limpiar datos</h2>
          <button className="ccdm-close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="ccdm-content">
          <div className="ccdm-section">
            <h3 className="ccdm-section-subtitle">Opciones Firestore</h3>

            <label className="ccdm-checkbox-label">
              <input
                type="checkbox"
                checked={cleanupOptions.nullSnapshots}
                onChange={e =>
                  handleOptionChange('nullSnapshots', e.target.checked)
                }
              />
              <span className="ccdm-label-text">
                Documentos sin snapshots <span className="ccdm-count">({counts.nullDocs})</span>
              </span>
            </label>

            <label className="ccdm-checkbox-label">
              <input
                type="checkbox"
                checked={cleanupOptions.olderThan7d}
                onChange={e =>
                  handleOptionChange('olderThan7d', e.target.checked)
                }
              />
              <span className="ccdm-label-text">
                Documentos &gt; 7 días <span className="ccdm-count">({counts.oldDocs})</span>
              </span>
            </label>
          </div>

          <div className="ccdm-separator"></div>

          <div className="ccdm-section">
            <h3 className="ccdm-section-subtitle">Reset Total (Peligroso)</h3>

            <label className="ccdm-checkbox-label ccdm-reset-label">
              <input
                type="checkbox"
                checked={cleanupOptions.allIndexedDb}
                onChange={e =>
                  handleOptionChange('allIndexedDb', e.target.checked)
                }
              />
              <span className="ccdm-label-text">
                <strong>TODO IndexedDB</strong> <span className="ccdm-count">({counts.cacheSize})</span>
              </span>
            </label>

            <label className="ccdm-checkbox-label ccdm-reset-label">
              <input
                type="checkbox"
                checked={cleanupOptions.allLocalStorage}
                onChange={e =>
                  handleOptionChange('allLocalStorage', e.target.checked)
                }
              />
              <span className="ccdm-label-text">
                <strong>TODO localStorage</strong>
              </span>
            </label>
          </div>

          {errorMsg && <div className="ccdm-error">{errorMsg}</div>}

          <div className="ccdm-warning">
            <span className="ccdm-warning-icon">⚠️</span>
            <span className="ccdm-warning-text">
              Esta acción no se puede deshacer. Los datos se eliminarán permanentemente.
            </span>
          </div>
        </div>

        <div className="ccdm-footer">
          <button
            className="ccdm-button ccdm-button-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className="ccdm-button ccdm-button-danger"
            onClick={handleConfirm}
            disabled={isLoading || !anyOptionSelected}
          >
            {isLoading ? 'Limpiando...' : 'Confirmar limpieza'}
          </button>
        </div>

        <style>{`
          .ccdm-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1100;
            display: flex;
            align-items: flex-end;
            animation: fadeIn 0.3s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .ccdm-modal {
            background: var(--bg-primary);
            color: var(--text-primary);
            border-radius: 16px 16px 0 0;
            width: 100%;
            max-width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            z-index: 1101;
            animation: slideUp 0.3s ease-out;
            display: flex;
            flex-direction: column;
          }

          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .ccdm-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
          }

          .ccdm-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }

          .ccdm-close-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
          }

          .ccdm-close-btn:hover {
            color: var(--text-primary);
          }

          .ccdm-content {
            flex: 1;
            padding: 20px 24px;
            overflow-y: auto;
          }

          .ccdm-section {
            margin-bottom: 20px;
          }

          .ccdm-section-subtitle {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 0 0 12px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .ccdm-checkbox-label {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            margin-bottom: 8px;
            background: var(--bg-secondary);
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s;
            border: 1px solid transparent;
          }

          .ccdm-checkbox-label:hover {
            background: var(--bg-tertiary);
          }

          .ccdm-checkbox-label input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
            flex-shrink: 0;
          }

          .ccdm-label-text {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
          }

          .ccdm-count {
            color: var(--text-secondary);
            font-size: 13px;
          }

          .ccdm-reset-label {
            background: rgba(220, 38, 38, 0.05);
            border: 1px solid rgba(220, 38, 38, 0.2);
          }

          .ccdm-reset-label:hover {
            background: rgba(220, 38, 38, 0.1);
            border-color: rgba(220, 38, 38, 0.3);
          }

          .ccdm-separator {
            height: 1px;
            background: var(--border-color);
            margin: 12px 0;
          }

          .ccdm-warning {
            display: flex;
            gap: 12px;
            padding: 12px;
            background: rgba(220, 38, 38, 0.05);
            border: 1px solid rgba(220, 38, 38, 0.2);
            border-radius: 8px;
            margin-top: 16px;
          }

          .ccdm-warning-icon {
            font-size: 18px;
            flex-shrink: 0;
          }

          .ccdm-warning-text {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.4;
          }

          .ccdm-error {
            padding: 12px;
            background: rgba(220, 38, 38, 0.1);
            border-left: 3px solid rgb(220, 38, 38);
            color: rgb(220, 38, 38);
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 12px;
          }

          .ccdm-footer {
            display: flex;
            gap: 12px;
            padding: 16px 24px 24px;
            border-top: 1px solid var(--border-color);
            flex-shrink: 0;
            justify-content: flex-end;
          }

          .ccdm-button {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 120px;
          }

          .ccdm-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .ccdm-button-secondary {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
          }

          .ccdm-button-secondary:hover:not(:disabled) {
            background: var(--bg-tertiary);
          }

          .ccdm-button-danger {
            background: rgb(220, 38, 38);
            color: white;
          }

          .ccdm-button-danger:hover:not(:disabled) {
            background: rgb(185, 28, 28);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          }

          @media (max-width: 640px) {
            .ccdm-modal {
              border-radius: 12px 12px 0 0;
              max-height: 80vh;
            }

            .ccdm-footer {
              flex-direction: column;
            }

            .ccdm-button {
              width: 100%;
              min-width: unset;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

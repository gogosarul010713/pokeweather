import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { CleanupPanel } from './CleanupPanel'
import { PredictionAnalysisDemo } from '../Analytics/PredictionAnalysisDemo'
import { updateAutoSyncSetting } from '../../services/firebase/settingsService'

const AUTOSYNC_MSG_KEY = 'pwe-autosync-msg'

interface TestingToolsProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'limpiar' | 'predicciones' | 'sincronizacion'

export default function TestingTools({ isOpen, onClose }: TestingToolsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('predicciones')
  const [isMaximized, setIsMaximized] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [predictionRefreshKey, setPredictionRefreshKey] = useState(0)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSyncSaving, setIsSyncSaving] = useState(false)
  const [toggleMessage, setToggleMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(() => {
    try {
      const saved = localStorage.getItem(AUTOSYNC_MSG_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const autoSyncEnabled = useStore((s) => s.autoSyncEnabled)
  const setAutoSyncEnabled = useStore((s) => s.setAutoSyncEnabled)

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  // US-1101: Disparar sincronización manual de climas
  const handleManualSync = async () => {
    setIsSyncing(true)
    setSyncMessage(null)

    try {
      // Obtener la URL de la Cloud Function
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
      const cronSecret = import.meta.env.VITE_CRON_SECRET || ''

      console.log('[TestingTools][DIAG] Manual sync iniciado')

      if (!cronSecret) {
        setSyncMessage({
          type: 'error',
          text: 'VITE_CRON_SECRET no configurado. Revisa .env.local',
        })
        setIsSyncing(false)
        return
      }

      const url = `https://us-central1-${projectId}.cloudfunctions.net/syncWeatherManual`

      console.log('[TestingTools][DIAG] Llamando CF en:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-cron-secret': cronSecret,
          'Content-Type': 'application/json',
        },
      })

      console.log('[TestingTools][DIAG] CF respondió con status:', response.status)

      const data = await response.json()

      console.log('[TestingTools][DIAG] CF response data:', data)

      if (response.ok && data.success) {
        setSyncMessage({
          type: 'success',
          text: `✅ Sincronización completada: ${data.citiesUpdated} ciudades actualizadas`,
        })
        setPredictionRefreshKey(k => k + 1)
      } else {
        setSyncMessage({
          type: 'error',
          text: `❌ Error: ${data.error || 'Fallo desconocido'}`,
        })
      }
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: `❌ Error de conexión: ${error instanceof Error ? error.message : 'Fallo desconocido'}`,
      })
      console.error('[TestingTools][DIAG] Manual sync error:', error)
    } finally {
      setIsSyncing(false)
      console.log('[TestingTools][DIAG] Manual sync finalizado')
      // Limpiar mensaje después de 4 segundos
      setTimeout(() => setSyncMessage(null), 4000)
    }
  }

  // US-1106b: Toggle auto-sync con feedback visual persistente en localStorage
  const handleToggleAutoSync = async () => {
    setIsSyncSaving(true)
    try {
      const newState = !autoSyncEnabled
      await updateAutoSyncSetting(newState)
      setAutoSyncEnabled(newState)

      const now = new Date()
      let msg: { type: 'success' | 'info'; text: string }

      if (newState) {
        const next = new Date(now)
        next.setMinutes(0, 0, 0)
        next.setHours(next.getHours() + 1)
        const nextStr = next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        msg = { type: 'success', text: `Auto-sync activado. Proxima ejecucion: ${nextStr}.` }
      } else {
        const lastRun = new Date(now)
        lastRun.setMinutes(0, 0, 0)
        const lastStr = lastRun.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        msg = { type: 'info', text: `Auto-sync desactivado. Ultima ejecucion: ${lastStr}. La CF no correra hasta que lo reactives.` }
      }

      localStorage.setItem(AUTOSYNC_MSG_KEY, JSON.stringify(msg))
      setToggleMessage(msg)
    } catch (error) {
      console.error('[TestingTools] Error toggling auto-sync:', error)
    } finally {
      setIsSyncSaving(false)
    }
  }

  return (
    <>
      <style>{`
        .tt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          display: ${isOpen ? 'block' : 'none'};
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

        .tt-drawer {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 360px;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-default);
          z-index: 2001;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease-out;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease-out;
        }

        .tt-drawer.maximized {
          right: 0;
          left: 0;
          width: 100%;
          border-left: none;
          border-radius: 0;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .tt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .tt-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tt-header-actions {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .tt-button-icon {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 6px 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .tt-button-icon:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .tt-close {
          background: none;
          border: none;
          font-size: 20px;
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
        }

        .tt-close:hover {
          background-color: var(--bg-tertiary);
        }

        .tt-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--border-default);
          padding: 0;
          background: var(--bg-primary);
          flex-shrink: 0;
        }

        .tt-tab {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
          text-align: center;
        }

        .tt-tab:hover {
          color: var(--text-primary);
        }

        .tt-tab.active {
          color: var(--text-primary);
          border-bottom-color: #1F77E3;
        }

        .tt-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tt-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tt-section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tt-section-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          line-height: 1.5;
        }

        .tt-button {
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .tt-button-primary {
          background: linear-gradient(135deg, #1F77E3, #1856B4);
          color: white;
        }

        .tt-button-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 119, 227, 0.3);
        }

        .tt-button-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .tt-button-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .tt-button-secondary:hover:not(:disabled) {
          background: var(--bg-quaternary);
        }

        .tt-info {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          padding: 12px;
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .tt-city-count {
          font-weight: 600;
          color: var(--text-primary);
        }

        .tt-button-group {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }
      `}</style>

      {/* Overlay */}
      {isOpen && <div className="tt-overlay" onClick={onClose} />}

      {/* Drawer */}
      {isOpen && (
        <div className={`tt-drawer ${isMaximized ? 'maximized' : ''}`}>
          {/* Header */}
          <div className="tt-header">
            <h2 className="tt-title">🧪 Testing Tools</h2>
            <div className="tt-header-actions">
              <button
                className="tt-button-icon"
                onClick={handleToggleMaximize}
                title={isMaximized ? 'Minimizar' : 'Maximizar'}
                aria-label={isMaximized ? 'Minimizar' : 'Maximizar'}
              >
                {isMaximized ? '⛶' : '⛶'}
              </button>
              <button className="tt-close" onClick={onClose} title="Cerrar" aria-label="Cerrar">
                ✕
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tt-tabs">
            <button
              className={`tt-tab ${activeTab === 'limpiar' ? 'active' : ''}`}
              onClick={() => setActiveTab('limpiar')}
            >
              🗑️ Limpiar
            </button>
            <button
              className={`tt-tab ${activeTab === 'predicciones' ? 'active' : ''}`}
              onClick={() => setActiveTab('predicciones')}
            >
              📊 Predicciones
            </button>
            <button
              className={`tt-tab ${activeTab === 'sincronizacion' ? 'active' : ''}`}
              onClick={() => setActiveTab('sincronizacion')}
            >
              ⚙️ Sincronización
            </button>
          </div>

          {/* Content */}
          <div className="tt-content">
            {/* Tab: Limpiar */}
            {activeTab === 'limpiar' && <CleanupPanel onCleanupComplete={() => setPredictionRefreshKey(k => k + 1)} />}
            {/* Tab: Predicciones */}
            {activeTab === 'predicciones' && <PredictionAnalysisDemo refreshKey={predictionRefreshKey} />}
            {/* Tab: Sincronización */}
            {activeTab === 'sincronizacion' && (
              <>
                {/* Auto-sync Toggle */}
                <div className="tt-section">
                  <h3 className="tt-section-title">⏰ Auto-sync</h3>
                  <p className="tt-section-desc">
                    Controlar si la sincronización ocurre automáticamente cada hora
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '6px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={handleToggleAutoSync}
                      disabled={isSyncSaving}
                      style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {autoSyncEnabled ? '🟢 Auto-sync ACTIVADO' : '🔴 Auto-sync DESACTIVADO'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {autoSyncEnabled
                          ? 'Se sincroniza automáticamente cada HH:00 UTC'
                          : 'Solo sincroniza cuando presionas el botón'}
                      </div>
                    </div>
                  </div>
                  {toggleMessage && (
                    <div
                      className="tt-info"
                      style={{
                        backgroundColor: toggleMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 179, 237, 0.1)',
                        borderColor: toggleMessage.type === 'success' ? '#22c55e' : '#63b3ed',
                        color: toggleMessage.type === 'success' ? '#22c55e' : '#63b3ed',
                      }}
                    >
                      {toggleMessage.text}
                    </div>
                  )}
                </div>

                <hr style={{ margin: '16px 0', borderColor: 'var(--border-default)' }} />

                {/* Manual Sync */}
                <div className="tt-section">
                  <h3 className="tt-section-title">⚡ Sincronización Manual</h3>
                  <p className="tt-section-desc">
                    Disparar sincronización de climas manualmente (sin esperar HH:00)
                  </p>
                  <button className="tt-button tt-button-primary" onClick={handleManualSync} disabled={isSyncing}>
                    {isSyncing ? '🔄 Sincronizando...' : '🔄 Sincronizar ahora'}
                  </button>
                  {syncMessage && (
                    <div
                      className="tt-info"
                      style={{
                        backgroundColor: syncMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderColor: syncMessage.type === 'success' ? '#22c55e' : '#ef4444',
                        color: syncMessage.type === 'success' ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {syncMessage.text}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

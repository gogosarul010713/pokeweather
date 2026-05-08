import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { updateAutoSyncSetting } from '../../services/firebase/settingsService'

/**
 * SyncToggle — Control UI para habilitar/desabilitar sincronización automática
 * US-1106: Permite al usuario pausar el cron de Firebase (HH:00)
 */
export default function SyncToggle() {
  const { autoSyncEnabled, setAutoSyncEnabled } = useStore()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async (enabled: boolean) => {
    setIsSaving(true)
    setError(null)

    try {
      await updateAutoSyncSetting(enabled)
      setAutoSyncEnabled(enabled)
      console.log(
        `[SyncToggle] Auto-sync ${enabled ? 'enabled' : 'disabled'}`
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('[SyncToggle] Error updating setting:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="st-root">
      <label className="st-label">
        <input
          type="checkbox"
          checked={autoSyncEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={isSaving}
          className="st-checkbox"
          aria-label="Auto-sync toggle"
        />
        <span className="st-label-text">
          {autoSyncEnabled ? '🟢 Automático' : '🔴 Manual'}
        </span>
      </label>

      <span className="st-help-text">
        {autoSyncEnabled
          ? 'Sincronización cada HH:00 UTC'
          : 'Solo al abrir la app'}
      </span>

      {error && <span className="st-error">{error}</span>}

      <style>{`
        .st-root {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          border: 1px solid var(--border-default);
          border-radius: 4px;
          background: var(--bg-tertiary);
          font-size: 0.875rem;
        }

        .st-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .st-checkbox {
          cursor: pointer;
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
        }

        .st-checkbox:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .st-label-text {
          font-weight: 500;
          color: var(--text-primary);
        }

        .st-help-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-left: 26px;
        }

        .st-error {
          font-size: 0.8rem;
          color: var(--error, #ff4444);
          margin-left: 26px;
        }
      `}</style>
    </div>
  )
}

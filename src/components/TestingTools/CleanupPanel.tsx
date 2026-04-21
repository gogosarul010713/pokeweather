import React, { useState, useEffect } from 'react'
import { fetchCleanupCounts, executeCleanup, type CleanupOptions, type CleanupCounts } from '../../services/cleanup/cleanupService'

export const CleanupPanel: React.FC = () => {
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Cargar counts al montar
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const result = await fetchCleanupCounts()
        setCounts(result)
      } catch (error) {
        console.error('Failed to fetch cleanup counts:', error)
      }
    }
    loadCounts()
  }, [])

  const handleOptionChange = (key: keyof CleanupOptions, value: boolean) => {
    setCleanupOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleConfirm = async () => {
    if (!Object.values(cleanupOptions).some(Boolean)) {
      setMessage({
        type: 'error',
        text: 'Selecciona al menos una opción para limpiar',
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      await executeCleanup(cleanupOptions)
      setMessage({
        type: 'success',
        text: '✅ Limpieza completada. Los datos han sido eliminados.',
      })
      // Reset options después de éxito
      setCleanupOptions({
        nullSnapshots: false,
        olderThan7d: false,
        allIndexedDb: false,
        allLocalStorage: false,
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Fallo desconocido'}`,
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const anyOptionSelected = Object.values(cleanupOptions).some(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Opción 1: NULL Snapshots */}
      <div style={styles.optionBox}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={cleanupOptions.nullSnapshots}
            onChange={e => handleOptionChange('nullSnapshots', e.target.checked)}
            disabled={isLoading}
          />
          <span style={styles.labelText}>
            Documentos sin snapshots <span style={styles.count}>({counts.nullDocs})</span>
          </span>
        </label>
        <p style={styles.description}>Elimina docs de Firestore sin datos válidos (D-018)</p>
      </div>

      {/* Opción 2: Old Docs */}
      <div style={styles.optionBox}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={cleanupOptions.olderThan7d}
            onChange={e => handleOptionChange('olderThan7d', e.target.checked)}
            disabled={isLoading}
          />
          <span style={styles.labelText}>
            Documentos &gt; 7 días <span style={styles.count}>({counts.oldDocs})</span>
          </span>
        </label>
        <p style={styles.description}>Elimina docs antiguos de Firestore (limpieza manual de TTL)</p>
      </div>

      <hr style={styles.separator} />

      {/* Opción 3: TODO IndexedDB */}
      <div style={{ ...styles.optionBox, ...styles.dangerBox }}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={cleanupOptions.allIndexedDb}
            onChange={e => handleOptionChange('allIndexedDb', e.target.checked)}
            disabled={isLoading}
          />
          <span style={styles.labelText}>
            <strong>RESET: TODO IndexedDB</strong> <span style={styles.count}>({counts.cacheSize})</span>
          </span>
        </label>
        <p style={styles.description}>Elimina TODAS las tablas locales de caché (reset completo)</p>
      </div>

      {/* Opción 4: TODO localStorage */}
      <div style={{ ...styles.optionBox, ...styles.dangerBox }}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={cleanupOptions.allLocalStorage}
            onChange={e => handleOptionChange('allLocalStorage', e.target.checked)}
            disabled={isLoading}
          />
          <span style={styles.labelText}>
            <strong>RESET: TODO localStorage</strong>
          </span>
        </label>
        <p style={styles.description}>Elimina TODOS los datos de configuración local (fuerza resync)</p>
      </div>

      {/* Warning */}
      <div style={styles.warning}>
        <span style={styles.warningIcon}>⚠️</span>
        <span style={styles.warningText}>Esta acción no se puede deshacer. Los datos se eliminarán permanentemente.</span>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderLeft: `3px solid ${message.type === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}`,
            color: message.type === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Button */}
      <button
        style={{
          ...styles.button,
          ...(anyOptionSelected && !isLoading ? styles.buttonDanger : styles.buttonDisabled),
        }}
        onClick={handleConfirm}
        disabled={isLoading || !anyOptionSelected}
      >
        {isLoading ? '🔄 Limpiando...' : '🗑️ Confirmar limpieza'}
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  optionBox: {
    padding: '12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dangerBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  labelText: {
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  count: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  description: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '0 0 0 32px',
    lineHeight: '1.4',
  },
  separator: {
    margin: '8px 0',
    borderColor: 'var(--border-color)',
  },
  warning: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    border: '1px solid rgba(220, 38, 38, 0.2)',
    borderRadius: '6px',
  },
  warningIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  warningText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  button: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonDanger: {
    background: 'rgb(220, 38, 38)',
    color: 'white',
  },
  buttonDisabled: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
}

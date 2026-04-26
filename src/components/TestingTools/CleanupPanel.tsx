import React, { useState, useEffect } from 'react'
import { fetchCleanupCounts, executeCleanup, type CleanupOptions, type CleanupCounts } from '../../services/cleanup/cleanupService'

export const CleanupPanel: React.FC = () => {
  const [cleanupOptions, setCleanupOptions] = useState<CleanupOptions>({
    nullSnapshots: false,
    olderThan7d: false,
    allIndexedDb: false,
    allLocalStorage: false,
    cascadeDeleteAll: false,
  })
  const [counts, setCounts] = useState<CleanupCounts>({
    nullDocs: 0,
    oldDocs: 0,
    cacheSize: '0 MB',
    cascadeDocs: 0,
    reportsDocs: 0,
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
    // Opción B: Mutual exclusion selectiva
    // Sección 1 (granular Firestore) ↔ Sección 3 (cascade Firestore) son excluyentes
    // Sección 2 (reset local) es siempre libre

    const isSection1 = key === 'nullSnapshots' || key === 'olderThan7d'
    const isSection3 = key === 'cascadeDeleteAll'

    if (isSection1 && value) {
      // Si activa Sección 1, desactiva Sección 3
      setCleanupOptions(prev => ({ ...prev, [key]: value, cascadeDeleteAll: false }))
    } else if (isSection3 && value) {
      // Si activa Sección 3, desactiva Sección 1
      setCleanupOptions(prev => ({ ...prev, [key]: value, nullSnapshots: false, olderThan7d: false }))
    } else {
      // Cambios normales (desactivar, cambiar en Sección 2)
      setCleanupOptions(prev => ({ ...prev, [key]: value }))
    }
  }

  // Opción D3: Retry logic (2 auto + manual fallback)
  const executeWithRetry = async (maxRetries = 2): Promise<any> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await executeCleanup(cleanupOptions)
      } catch (error) {
        if (attempt === maxRetries - 1) throw error
        // Backoff exponencial: 1s, 2s
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
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
      // Ejecutar con retry logic (2 intentos automáticos)
      const results = await executeWithRetry(2)

      // Toast detallado (Mejora A)
      const parts = []
      if (results.firestore.deleted > 0) {
        parts.push(`${results.firestore.deleted} docs (Firestore)`)
      }
      if (results.firestore.reportsDeleted > 0) {
        parts.push(`${results.firestore.reportsDeleted} reportes (Firestore)`)
      }
      if (results.indexedDb.deleted > 0) {
        parts.push(`${results.indexedDb.deleted} items (IDB)`)
      }
      if (results.localStorage.cleared) {
        parts.push(`localStorage`)
      }

      const text = parts.length > 0
        ? `✅ Eliminados: ${parts.join(' + ')}`
        : `✅ Limpieza completada`

      setMessage({
        type: 'success',
        text,
      })

      // Reset options después de éxito
      setCleanupOptions({
        nullSnapshots: false,
        olderThan7d: false,
        allIndexedDb: false,
        allLocalStorage: false,
        cascadeDeleteAll: false,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Fallo desconocido'
      setMessage({
        type: 'error',
        text: `❌ Error: ${errorMsg}. Reintentar?`,
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(null), 6000)
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

      <hr style={styles.separator} />

      {/* Opción 5: Cascade Delete /city_weather */}
      <div
        style={{
          ...styles.optionBox,
          ...styles.dangerBox,
          opacity: (cleanupOptions.nullSnapshots || cleanupOptions.olderThan7d) ? 0.5 : 1,
          pointerEvents: (cleanupOptions.nullSnapshots || cleanupOptions.olderThan7d) ? 'none' : 'auto',
        }}
      >
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={cleanupOptions.cascadeDeleteAll}
            onChange={e => handleOptionChange('cascadeDeleteAll', e.target.checked)}
            disabled={isLoading || cleanupOptions.nullSnapshots || cleanupOptions.olderThan7d}
          />
          <span style={styles.labelText}>
            <strong>🔥 CASCADE DELETE: Todo /city_weather + reports</strong> <span style={styles.count}>({counts.cascadeDocs} forecasts, {counts.reportsDocs} reports)</span>
          </span>
        </label>
        <p style={styles.description}>
          Elimina TODOS los documentos de city_weather, weather_reports y classification_reports
          (nuclear reset). Sin ForecastDoc, los reportes son datos huerfanos (D-035). No se puede combinar con limpieza selectiva.
        </p>
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

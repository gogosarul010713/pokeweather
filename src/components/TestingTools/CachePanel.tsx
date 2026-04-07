/**
 * src/components/TestingTools/CachePanel.tsx
 * Panel principal para inspeccionar, filtrar y gestionar caché
 * US-606: Inspector Visual de Caché
 */

import { useEffect, useState, useCallback } from 'react'
import type { CacheEntry, CacheMetrics, CacheFilterType } from '../../types/cache'
import {
  loadAllCacheData,
  calculateCacheMetrics,
  getCacheEntryStatus,
  deleteMultipleCacheEntries,
  clearAllCache,
  formatBytes,
  getRelativeTime,
  getTimeUntilExpiration,
  extractCityNameFromEntry,
} from '../../utils/cacheDebugHelper'
import CacheDetailPopup from './CacheDetailPopup'

interface CachePanelState {
  entries: CacheEntry[]
  metrics: CacheMetrics | null
  selectedIds: Set<string>
  filter: CacheFilterType
  searchQuery: string
  detailEntry: CacheEntry | null
  isLoading: boolean
  error: string | null
}

const INITIAL_STATE: CachePanelState = {
  entries: [],
  metrics: null,
  selectedIds: new Set(),
  filter: 'all',
  searchQuery: '',
  detailEntry: null,
  isLoading: true,
  error: null,
}

export default function CachePanel() {
  const [state, setState] = useState<CachePanelState>(INITIAL_STATE)

  // Cargar datos al montar
  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    try {
      setState(s => ({ ...s, isLoading: true, error: null }))
      const { locationKeys, weatherEntries } = await loadAllCacheData()
      const allEntries = [...locationKeys, ...weatherEntries]
      const metrics = await calculateCacheMetrics(locationKeys, weatherEntries)

      setState(s => ({
        ...s,
        entries: allEntries,
        metrics,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Error loading cache data:', error)
      setState(s => ({
        ...s,
        isLoading: false,
        error: 'Error al cargar datos de caché',
      }))
    }
  }, [])

  const handleSelectEntry = useCallback((id: string, checked: boolean) => {
    setState(s => {
      const newSelected = new Set(s.selectedIds)
      if (checked) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
      return { ...s, selectedIds: newSelected }
    })
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    setState(s => {
      const filtered = getFilteredEntries(s.entries, s.filter, s.searchQuery)
      const newSelected = new Set<string>()
      if (checked) {
        filtered.forEach(e => newSelected.add(e.id))
      }
      return { ...s, selectedIds: newSelected }
    })
  }, [])

  const handleDeleteSelected = useCallback(async () => {
    if (state.selectedIds.size === 0) return

    const confirmed = window.confirm(
      `¿Eliminar ${state.selectedIds.size} entradas?\nSe perderán los datos en caché para estas ciudades.`
    )
    if (!confirmed) return

    try {
      await deleteMultipleCacheEntries(state.selectedIds)
      setState(s => ({ ...s, selectedIds: new Set() }))
      await loadData()
    } catch (error) {
      console.error('Error deleting cache entries:', error)
      alert('Error al eliminar entradas')
    }
  }, [state.selectedIds, loadData])

  const handleClearAll = useCallback(async () => {
    const confirmed = window.confirm(
      '⚠️ ADVERTENCIA\n\nEsto ELIMINARÁ TODAS las entradas de caché.\nLos datos se cargarán desde API en la próxima carga.\n\n¿Continuar?'
    )
    if (!confirmed) return

    try {
      await clearAllCache()
      setState(s => ({ ...s, selectedIds: new Set() }))
      await loadData()
    } catch (error) {
      console.error('Error clearing all cache:', error)
      alert('Error al limpiar caché')
    }
  }, [loadData])

  const handleViewDetail = useCallback((entry: CacheEntry) => {
    setState(s => ({ ...s, detailEntry: entry }))
  }, [])

  const handleCopyKey = useCallback(async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      alert('📋 Copiado: ' + key)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }, [])

  const getFilteredEntries = (
    entries: CacheEntry[],
    filter: CacheFilterType,
    search: string
  ) => {
    let filtered = entries

    // Filtro por tipo
    if (filter === 'locationKeys') {
      filtered = filtered.filter(e => e.type === 'locationKey')
    } else if (filter === 'weather') {
      filtered = filtered.filter(e => e.type === 'weather')
    } else if (filter === 'valid') {
      filtered = filtered.filter(e => getCacheEntryStatus(e) === 'valid')
    } else if (filter === 'expired') {
      filtered = filtered.filter(e => getCacheEntryStatus(e) === 'expired')
    }

    // Búsqueda por ciudad
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(e => {
        const cityName = extractCityNameFromEntry(e)
        const key = e.key.toLowerCase()
        return cityName.toLowerCase().includes(q) || key.includes(q)
      })
    }

    return filtered
  }

  const filteredEntries = getFilteredEntries(state.entries, state.filter, state.searchQuery)
  const selectedInFiltered = filteredEntries.filter(e => state.selectedIds.has(e.id)).length

  if (state.isLoading) {
    return (
      <div className="cp-container">
        <div className="cp-loading">Cargando caché...</div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="cp-container">
        <div className="cp-error">❌ {state.error}</div>
      </div>
    )
  }

  return (
    <div className="cp-container">
      {/* Controles */}
      <div className="cp-controls">
        <div className="cp-controls-top">
          <select
            className="cp-filter"
            value={state.filter}
            onChange={e => setState(s => ({ ...s, filter: e.target.value as CacheFilterType }))}
          >
            <option value="all">Todos</option>
            <option value="locationKeys">📍 LocationKeys</option>
            <option value="weather">🌦️ Weather</option>
            <option value="valid">✅ Válidos</option>
            <option value="expired">❌ Expirados</option>
          </select>

          <input
            type="search"
            className="cp-search"
            placeholder="Buscar por ciudad..."
            value={state.searchQuery}
            onChange={e => setState(s => ({ ...s, searchQuery: e.target.value }))}
          />

          <button className="cp-button cp-button-refresh" onClick={loadData} title="Actualizar">
            🔄
          </button>

          <button
            className="cp-button cp-button-danger"
            onClick={handleClearAll}
            title="Limpiar TODO (confirmación requerida)"
          >
            🗑️ Limpiar TODO
          </button>
        </div>
      </div>

      {/* Métricas */}
      {state.metrics && (
        <div className="cp-metrics">
          <div className="cp-metric">
            <span className="cp-metric-label">📊 Total:</span>
            <span className="cp-metric-value">
              {state.metrics.locationKeyCount} LocationKeys + {state.metrics.weatherCount} Weather
            </span>
          </div>
          <div className="cp-metric">
            <span className="cp-metric-label">💾 Almacenamiento:</span>
            <span className="cp-metric-value">
              {formatBytes(state.metrics.totalSize)} / 10 MB ({state.metrics.storagePercentage}%)
            </span>
          </div>
          <div className="cp-metric">
            <span className="cp-metric-label">📈 Estados:</span>
            <span className="cp-metric-value">
              ✅ {state.metrics.validCount} · ⏰ {state.metrics.expiringCount} · ❌{' '}
              {state.metrics.expiredCount}
            </span>
          </div>
        </div>
      )}

      {/* Tabla */}
      {filteredEntries.length > 0 ? (
        <>
          <div className="cp-table-header">
            <label className="cp-checkbox-label">
              <input
                type="checkbox"
                checked={selectedInFiltered > 0 && selectedInFiltered === filteredEntries.length}
                onChange={e => handleSelectAll(e.target.checked)}
              />
              Mostrar {filteredEntries.length} entradas
            </label>
          </div>

          <div className="cp-table-wrapper">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedInFiltered > 0 && selectedInFiltered === filteredEntries.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Tipo</th>
                  <th>Clave</th>
                  <th>Guardado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(entry => (
                  <tr key={entry.id}>
                    <td className="cp-checkbox-cell">
                      <input
                        type="checkbox"
                        checked={state.selectedIds.has(entry.id)}
                        onChange={e => handleSelectEntry(entry.id, e.target.checked)}
                      />
                    </td>
                    <td className="cp-type">
                      {entry.type === 'locationKey' ? '📍' : '🌦️'}
                    </td>
                    <td className="cp-key" title={entry.key}>
                      {entry.key}
                    </td>
                    <td className="cp-saved">{getRelativeTime(entry.savedAt)}</td>
                    <td className="cp-status">
                      <CacheStatusBadge entry={entry} />
                    </td>
                    <td className="cp-actions">
                      <button
                        className="cp-action-btn cp-action-view"
                        onClick={() => handleViewDetail(entry)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        className="cp-action-btn cp-action-copy"
                        onClick={() => handleCopyKey(entry.key)}
                        title="Copiar clave"
                      >
                        📋
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Acciones selección */}
          {state.selectedIds.size > 0 && (
            <div className="cp-selection-actions">
              <span className="cp-selection-count">
                ☑️ {state.selectedIds.size} seleccionadas
              </span>
              <button className="cp-button cp-button-danger" onClick={handleDeleteSelected}>
                🗑️ Eliminar selección ({state.selectedIds.size})
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="cp-empty">
          {state.entries.length === 0 ? (
            <>
              <p>📭 Caché vacío</p>
              <p className="cp-empty-hint">Los datos se cargarán desde API en la próxima carga</p>
            </>
          ) : (
            <p>🔍 No hay entradas que coincidan con el filtro</p>
          )}
        </div>
      )}

      {/* Popup de detalle */}
      <CacheDetailPopup
        entry={state.detailEntry}
        isOpen={!!state.detailEntry}
        onClose={() => setState(s => ({ ...s, detailEntry: null }))}
      />

      <style>{`
        .cp-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          max-height: 600px;
          overflow-y: auto;
        }

        .cp-loading,
        .cp-error {
          padding: 24px;
          text-align: center;
          color: var(--text-secondary);
        }

        .cp-error {
          color: var(--danger);
          font-weight: 500;
        }

        .cp-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cp-controls-top {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .cp-filter,
        .cp-search {
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid var(--border-primary);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 12px;
          flex: 0 1 auto;
        }

        .cp-filter {
          min-width: 120px;
        }

        .cp-search {
          flex: 1;
          min-width: 150px;
        }

        .cp-button {
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid var(--border-primary);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 150ms ease;
          white-space: nowrap;
        }

        .cp-button:hover {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .cp-button-danger {
          background: var(--danger);
          border-color: var(--danger);
          color: white;
        }

        .cp-button-danger:hover {
          background: var(--danger);
          filter: brightness(1.1);
        }

        .cp-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 4px;
          border: 1px solid var(--border-primary);
        }

        .cp-metric {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 11px;
        }

        .cp-metric-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .cp-metric-value {
          color: var(--text-primary);
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .cp-table-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-secondary);
          padding: 0 4px;
        }

        .cp-checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .cp-table-wrapper {
          overflow-x: auto;
          border-radius: 4px;
          border: 1px solid var(--border-primary);
        }

        .cp-table {
          border-collapse: collapse;
          font-size: 11px;
          width: 100%;
          background: var(--bg-secondary);
        }

        .cp-table th {
          background: var(--bg-tertiary);
          padding: 8px;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-primary);
          white-space: nowrap;
        }

        .cp-table td {
          padding: 8px;
          border-bottom: 1px solid var(--border-primary);
          color: var(--text-primary);
        }

        .cp-checkbox-cell {
          text-align: center;
          width: 24px;
        }

        .cp-type {
          text-align: center;
          width: 28px;
        }

        .cp-key {
          font-family: 'Monaco', 'Courier New', monospace;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cp-saved {
          color: var(--text-secondary);
          width: 80px;
        }

        .cp-status {
          text-align: center;
          width: 60px;
        }

        .cp-actions {
          display: flex;
          gap: 4px;
          justify-content: center;
          width: 60px;
        }

        .cp-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 12px;
          transition: all 150ms ease;
        }

        .cp-action-btn:hover {
          background: var(--bg-tertiary);
        }

        .cp-selection-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          font-size: 11px;
        }

        .cp-selection-count {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .cp-empty {
          padding: 48px 24px;
          text-align: center;
          color: var(--text-secondary);
        }

        .cp-empty p {
          margin: 0;
          font-size: 13px;
        }

        .cp-empty-hint {
          font-size: 11px;
          margin-top: 4px;
        }

        input[type='checkbox'] {
          cursor: pointer;
          accent-color: var(--accent-primary);
        }
      `}</style>
    </div>
  )
}

/**
 * Componente pequeño para mostrar el estado visual
 */
function CacheStatusBadge({ entry }: { entry: CacheEntry }) {
  const status = getCacheEntryStatus(entry)

  const getStatusDisplay = (): [string, string] => {
    switch (status) {
      case 'valid':
        return ['✅', 'Valid']
      case 'expiring':
        return ['⏰', getTimeUntilExpiration(entry.expiresAt)]
      case 'expired':
        return ['❌', 'Expired']
    }
  }

  const [icon, text] = getStatusDisplay()

  return (
    <span
      className={`cp-status-badge cp-status-${status}`}
      title={`${status}: ${text}`}
    >
      {icon}
    </span>
  )
}

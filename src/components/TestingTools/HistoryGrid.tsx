import { useState, useEffect, useCallback } from 'react'
import { getSnapshots } from '../../services/history/weatherHistoryService'
import SnapshotPopover from './SnapshotPopover'
import { exportHistoryToExcel } from '../../utils/exportHistory'
import type { City } from '../../store/useStore'
import type { WeatherSnapshot } from '../../services/history/weatherHistoryService'

interface HistoryGridProps {
  cities: City[]
  retentionDays: 7 | 14 | 30
  onRetentionChange: (days: 7 | 14 | 30) => void
}

interface HistoryEntry {
  fecha: string
  ciudad: City
  snapshots: WeatherSnapshot[]
  precisionPercentage: number
}

export default function HistoryGrid({ cities, retentionDays, onRetentionChange }: HistoryGridProps) {
  const [snapshots, setSnapshots] = useState<WeatherSnapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [isMaximized, setIsMaximized] = useState(false)
  const [popoverData, setPopoverData] = useState<{ entry: HistoryEntry; key: string } | null>(null)

  // Cargar snapshots al montar o cambiar retentionDays
  useEffect(() => {
    loadSnapshots()
  }, [retentionDays])

  const loadSnapshots = async () => {
    setLoading(true)
    try {
      const data = await getSnapshots({ retentionDays })
      setSnapshots(data)

      // Crear entradas: [fecha + ciudad] = snapshots para ese día
      const entriesMap = new Map<string, HistoryEntry>()

      for (const snapshot of data) {
        const dateStr = new Date(snapshot.capturedAt).toLocaleDateString('es-ES')
        const key = `${dateStr}-${snapshot.cityId}`

        if (!entriesMap.has(key)) {
          const city = cities.find((c) => c.id === snapshot.cityId)
          if (city) {
            entriesMap.set(key, {
              fecha: dateStr,
              ciudad: city,
              snapshots: [],
              precisionPercentage: 0,
            })
          }
        }

        const entry = entriesMap.get(key)
        if (entry) {
          entry.snapshots.push(snapshot)
        }
      }

      // Calcular precisión para cada entrada
      const entries = Array.from(entriesMap.values())
      entries.forEach((entry) => {
        const verified = entry.snapshots.filter((s) => s.actualCondition !== undefined && s.actualCondition !== null)
        const correct = verified.filter((s) => s.isCorrect === true)
        entry.precisionPercentage = verified.length > 0 ? Math.round((correct.length / verified.length) * 100) : 0
      })

      // Ordenar: más recientes primero
      entries.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

      setHistoryEntries(entries)
    } catch (error) {
      console.error('Error loading snapshots:', error)
    } finally {
      setLoading(false)
    }
  }

  // Usar useCallback para garantizar que la función persista
  const handleOpenPopover = useCallback((entry: HistoryEntry) => {
    const key = `${entry.fecha}-${entry.ciudad.id}`
    setPopoverData({ entry, key })
  }, [])

  const handleClosePopover = useCallback(() => {
    setPopoverData(null)
  }, [])

  const handlePopoverUpdated = useCallback(async () => {
    await loadSnapshots()
    setPopoverData(null)
  }, [])

  const handleExportClick = async () => {
    if (snapshots.length === 0) {
      alert('No hay datos para exportar')
      return
    }
    try {
      await exportHistoryToExcel(snapshots)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error al exportar. Ver consola.')
    }
  }

  return (
    <>
      <style>{`
        .hg-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }

        .hg-container.maximized {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 3000;
          background: var(--bg-secondary);
          border-radius: 0;
          gap: 0;
          padding: 0;
        }

        .hg-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-default);
        }

        .hg-container.maximized .hg-controls {
          padding: 16px;
        }

        .hg-retention-select {
          padding: 6px 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .hg-retention-select:hover {
          background: var(--bg-quaternary);
        }

        .hg-export-btn {
          padding: 6px 12px;
          background: linear-gradient(135deg, #1F77E3, #1856B4);
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hg-export-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 119, 227, 0.3);
        }

        .hg-maximize-btn {
          padding: 6px 12px;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hg-maximize-btn:hover {
          background: var(--bg-quaternary);
        }

        .hg-controls-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hg-table {
          flex: 1;
          overflow: auto;
          border: 1px solid var(--border-default);
          border-radius: 4px;
          background: var(--bg-primary);
        }

        .hg-table-inner {
          width: 100%;
          border-collapse: collapse;
        }

        .hg-table-header {
          background: var(--bg-secondary);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .hg-table-th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-default);
          border-right: 1px solid var(--border-default);
        }

        .hg-table-th:last-child {
          border-right: none;
        }

        .hg-table-row {
          border-bottom: 1px solid var(--border-default);
          transition: background-color 0.15s;
        }

        .hg-table-row:hover {
          background-color: var(--bg-tertiary);
        }

        .hg-table-td {
          padding: 12px 16px;
          font-size: 13px;
          color: var(--text-primary);
          border-right: 1px solid var(--border-default);
        }

        .hg-table-td:last-child {
          border-right: none;
        }

        .hg-fecha {
          font-weight: 500;
          width: 100px;
        }

        .hg-ciudad {
          flex: 1;
          min-width: 200px;
        }

        .hg-precision {
          width: 100px;
          text-align: center;
          font-weight: 600;
        }

        .hg-precision-low {
          color: #f44336;
        }

        .hg-precision-medium {
          color: #ff9800;
        }

        .hg-precision-high {
          color: #4caf50;
        }

        .hg-precision-none {
          color: var(--text-tertiary);
        }

        .hg-verificar-btn {
          padding: 8px 16px;
          background: #1F77E3;
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          min-height: 36px;
        }

        .hg-verificar-btn:hover {
          background: #1856B4;
          transform: translateY(-1px);
        }

        .hg-verificar-btn:active {
          transform: translateY(0);
        }

        .hg-empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-tertiary);
          font-size: 14px;
        }

        .hg-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-secondary);
          font-size: 14px;
        }
      `}</style>

      <div className={`hg-container ${isMaximized ? 'maximized' : ''}`}>
        {/* Controls */}
        <div className="hg-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Retención:</label>
            <select
              className="hg-retention-select"
              value={retentionDays}
              onChange={(e) => {
                const days = parseInt(e.target.value, 10) as 7 | 14 | 30
                onRetentionChange(days)
              }}
            >
              <option value="7">7 días</option>
              <option value="14">14 días</option>
              <option value="30">30 días</option>
            </select>
          </div>
          <div className="hg-controls-right">
            <button className="hg-maximize-btn" onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? '⛶ Minimizar' : '⛶ Maximizar'}
            </button>
            <button className="hg-export-btn" onClick={handleExportClick} disabled={snapshots.length === 0}>
              📥 Exportar
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="hg-loading">Cargando snapshots...</div>
        ) : historyEntries.length === 0 ? (
          <div className="hg-empty-state">No hay datos históricos para este período</div>
        ) : (
          <div className="hg-table">
            <table className="hg-table-inner">
              <thead className="hg-table-header">
                <tr>
                  <th className="hg-table-th hg-fecha">Fecha</th>
                  <th className="hg-table-th hg-ciudad">Ciudad</th>
                  <th className="hg-table-th" style={{ width: '120px', textAlign: 'center' }}>
                    Verificar
                  </th>
                  <th className="hg-table-th hg-precision">% Precisión</th>
                </tr>
              </thead>
              <tbody>
                {historyEntries.map((entry) => {
                  const precisionColor =
                    entry.precisionPercentage === 0
                      ? 'hg-precision-none'
                      : entry.precisionPercentage >= 90
                        ? 'hg-precision-high'
                        : entry.precisionPercentage >= 70
                          ? 'hg-precision-medium'
                          : 'hg-precision-low'

                  return (
                    <tr key={`${entry.fecha}-${entry.ciudad.id}`} className="hg-table-row">
                      <td className="hg-table-td hg-fecha">{entry.fecha}</td>
                      <td className="hg-table-td hg-ciudad">{entry.ciudad.name}</td>
                      <td className="hg-table-td" style={{ textAlign: 'center', width: '120px' }}>
                        <button
                          className="hg-verificar-btn"
                          onClick={() => {
                            handleOpenPopover(entry)
                          }}
                          type="button"
                        >
                          Verificar
                        </button>
                      </td>
                      <td className={`hg-table-td hg-precision ${precisionColor}`}>
                        {entry.precisionPercentage > 0 ? `${entry.precisionPercentage}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Popover Modal - Renderizado FUERA de HistoryGrid container */}
      {popoverData && (
        <SnapshotPopover
          entry={popoverData.entry}
          onClose={handleClosePopover}
          onUpdated={handlePopoverUpdated}
        />
      )}
    </>
  )
}

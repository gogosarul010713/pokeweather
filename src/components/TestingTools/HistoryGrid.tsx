import { useState, useEffect } from 'react'
import { getSnapshots } from '../../services/history/weatherHistoryService'
import { CONDITION_EMOJIS } from '../../config/conditionEmojis'
import SnapshotPopover from './SnapshotPopover'
import { exportHistoryToExcel } from '../../utils/exportHistory'
import type { City } from '../../store/useStore'
import type { WeatherSnapshot } from '../../services/history/weatherHistoryService'

interface HistoryGridProps {
  cities: City[]
  retentionDays: 7 | 14 | 30
  onRetentionChange: (days: 7 | 14 | 30) => void
}

interface SnapshotsByDateByCity {
  [cityId: string]: {
    [dateStr: string]: WeatherSnapshot[]
  }
}

export default function HistoryGrid({ cities, retentionDays, onRetentionChange }: HistoryGridProps) {
  const [snapshots, setSnapshots] = useState<WeatherSnapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPopover, setSelectedPopover] = useState<{ snapshotId: string; snapshot: WeatherSnapshot } | null>(null)
  const [dataStructure, setDataStructure] = useState<SnapshotsByDateByCity>({})

  // Cargar snapshots al montar o cambiar retentionDays
  useEffect(() => {
    loadSnapshots()
  }, [retentionDays])

  const loadSnapshots = async () => {
    setLoading(true)
    try {
      const data = await getSnapshots({ retentionDays })
      setSnapshots(data)

      // Agrupar por ciudad → fecha
      const grouped: SnapshotsByDateByCity = {}
      for (const snapshot of data) {
        if (!grouped[snapshot.cityId]) {
          grouped[snapshot.cityId] = {}
        }
        const dateStr = new Date(snapshot.capturedAt).toLocaleDateString('es-ES')
        if (!grouped[snapshot.cityId][dateStr]) {
          grouped[snapshot.cityId][dateStr] = []
        }
        grouped[snapshot.cityId][dateStr].push(snapshot)
      }

      // Ordenar snapshots por hora dentro de cada fecha
      Object.keys(grouped).forEach((cityId) => {
        Object.keys(grouped[cityId]).forEach((dateStr) => {
          grouped[cityId][dateStr].sort((a, b) => a.capturedAt - b.capturedAt)
        })
      })

      setDataStructure(grouped)
    } catch (error) {
      console.error('Error loading snapshots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePopoverClose = () => {
    setSelectedPopover(null)
  }

  const handlePopoverUpdated = async () => {
    await loadSnapshots()
    setSelectedPopover(null)
  }

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

  // Obtener todas las fechas únicas (ordenadas, más recientes primero)
  const allDates = Array.from(
    new Set(
      Object.values(dataStructure).flatMap((cityData) => Object.keys(cityData))
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const getStatusIcon = (snapshot: WeatherSnapshot): string => {
    if (snapshot.actualCondition === undefined || snapshot.actualCondition === null) return '?'
    if (snapshot.isCorrect) return '✓'
    if (snapshot.isCorrect === false) return '✗'
    return '—'
  }

  const getStatusColor = (snapshot: WeatherSnapshot): string => {
    if (snapshot.actualCondition === undefined || snapshot.actualCondition === null) return 'unverified'
    if (snapshot.isCorrect) return 'correct'
    if (snapshot.isCorrect === false) return 'incorrect'
    return 'empty'
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

        .hg-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-default);
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

        .hg-wrapper {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-default);
          border-radius: 4px;
          background: var(--bg-primary);
        }

        .hg-scroll-container {
          flex: 1;
          overflow: auto;
          display: grid;
          grid-template-columns: 140px 1fr;
          grid-auto-rows: 40px;
        }

        .hg-header-city {
          position: sticky;
          left: 0;
          top: 0;
          background: var(--bg-secondary);
          border-right: 2px solid var(--border-default);
          border-bottom: 1px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
          color: var(--text-secondary);
          z-index: 20;
          padding: 0 8px;
          text-align: center;
        }

        .hg-header-date {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 11px;
          color: var(--text-primary);
          border-right: 1px solid var(--border-default);
          padding: 0 4px;
        }

        .hg-cell-city {
          position: sticky;
          left: 0;
          background: var(--bg-tertiary);
          border-right: 2px solid var(--border-default);
          border-bottom: 1px solid var(--border-default);
          display: flex;
          align-items: center;
          padding: 0 8px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          z-index: 10;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hg-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border-right: 1px solid var(--border-default);
          border-bottom: 1px solid var(--border-default);
          cursor: pointer;
          gap: 2px;
          transition: background-color 0.15s;
        }

        .hg-cell:hover {
          background-color: var(--bg-quaternary);
        }

        .hg-cell-empty {
          color: var(--text-tertiary);
          background: var(--bg-tertiary);
          cursor: default;
        }

        .hg-cell-empty:hover {
          background-color: var(--bg-tertiary);
        }

        .hg-cell-unverified {
          background: rgba(255, 193, 7, 0.1);
          color: var(--text-primary);
        }

        .hg-cell-correct {
          background: rgba(76, 175, 80, 0.15);
          color: var(--text-primary);
        }

        .hg-cell-incorrect {
          background: rgba(244, 67, 54, 0.15);
          color: var(--text-primary);
        }

        .hg-status-icon {
          font-size: 12px;
          font-weight: 600;
        }

        .hg-empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
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

      <div className="hg-container">
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
          <button className="hg-export-btn" onClick={handleExportClick} disabled={snapshots.length === 0}>
            📥 Exportar
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="hg-loading">Cargando snapshots...</div>
        ) : snapshots.length === 0 ? (
          <div className="hg-empty-state">No hay datos históricos para este período</div>
        ) : (
          <div className="hg-wrapper">
            <div className="hg-scroll-container" style={{ gridTemplateColumns: `140px repeat(${allDates.length}, 80px)` }}>
              {/* Header: Fechas */}
              <div className="hg-header-city">Ciudad</div>
              {allDates.map((dateStr) => (
                <div key={`header-${dateStr}`} className="hg-header-date">
                  {dateStr.split('/').slice(0, 2).join('/')}
                </div>
              ))}

              {/* Rows: Ciudades */}
              {cities.map((city) => (
                <div key={`city-${city.id}`}>
                  <div className="hg-cell-city" title={city.name}>
                    {city.name}
                  </div>

                  {allDates.map((dateStr) => {
                    const snapshotForDate = dataStructure[city.id]?.[dateStr]?.[0]
                    if (!snapshotForDate) {
                      return <div key={`cell-${city.id}-${dateStr}`} className="hg-cell hg-cell-empty">—</div>
                    }

                    const statusClass = getStatusColor(snapshotForDate)
                    const statusIcon = getStatusIcon(snapshotForDate)
                    const conditionEmoji = CONDITION_EMOJIS[snapshotForDate.condition as keyof typeof CONDITION_EMOJIS] || '❓'

                    return (
                      <div
                        key={`cell-${city.id}-${dateStr}`}
                        className={`hg-cell hg-cell-${statusClass}`}
                        onClick={() => setSelectedPopover({ snapshotId: snapshotForDate.snapshotId, snapshot: snapshotForDate })}
                      >
                        <span>{conditionEmoji}</span>
                        <span className="hg-status-icon">{statusIcon}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popover Modal */}
      {selectedPopover && (
        <SnapshotPopover
          snapshot={selectedPopover.snapshot}
          allSnapshots={dataStructure[selectedPopover.snapshot.cityId]?.[new Date(selectedPopover.snapshot.capturedAt).toLocaleDateString('es-ES')] || []}
          onClose={handlePopoverClose}
          onUpdated={handlePopoverUpdated}
        />
      )}
    </>
  )
}

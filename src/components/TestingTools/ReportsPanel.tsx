import { useEffect, useState } from 'react'
import { getRecentClassificationReports } from '../../services/firebase/classificationReportService'
import type { ClassificationReport } from '../../services/firebase/classificationReportService'

export default function ReportsPanel() {
  const [reports, setReports] = useState<ClassificationReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await getRecentClassificationReports(24)
      setReports(data)
    } catch (err) {
      console.error('Error loading reports:', err)
      setError('Error al cargar reportes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (reports.length === 0) return

    // Prepare CSV content
    const headers = [
      'Ciudad',
      'Clasificado como',
      'Debería ser',
      'Fecha/Hora',
      'Comentario',
    ]

    const rows = reports.map((report) => [
      report.city_name,
      report.classified_as,
      report.should_be,
      report.timestamp?.toDate?.()?.toLocaleString?.() || 'N/A',
      `"${report.comment || ''}"`,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `classification-reports-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <style>{`
        .rp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .rp-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rp-badge {
          display: inline-block;
          background: var(--ui-accent, #58a6ff);
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .rp-empty {
          padding: 20px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 12px;
        }

        .rp-error {
          padding: 12px;
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 6px;
          color: #ff4757;
          font-size: 12px;
        }

        .rp-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rp-item {
          padding: 10px 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          font-size: 12px;
          color: var(--text-primary);
        }

        .rp-city {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .rp-condition {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 4px;
          font-size: 11px;
        }

        .rp-condition-label {
          color: var(--text-secondary);
        }

        .rp-arrow {
          color: var(--text-secondary);
        }

        .rp-meta {
          display: flex;
          gap: 8px;
          font-size: 10px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .rp-button {
          width: 100%;
          padding: 10px;
          margin-top: 12px;
          border: 1px solid var(--border-default);
          border-radius: 6px;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .rp-button:hover {
          background: var(--bg-quaternary);
          border-color: var(--border-strong);
        }

        .rp-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="rp-header">
        <span className="rp-title">
          Reportes de clasificación
          {reports.length > 0 && (
            <span className="rp-badge" style={{ marginLeft: '8px' }}>
              {reports.length}
            </span>
          )}
        </span>
      </div>

      {isLoading && (
        <div className="rp-empty">Cargando reportes...</div>
      )}

      {error && (
        <div className="rp-error">{error}</div>
      )}

      {!isLoading && reports.length === 0 && (
        <div className="rp-empty">
          No hay reportes en las últimas 24 horas
        </div>
      )}

      {!isLoading && reports.length > 0 && (
        <>
          <div className="rp-list">
            {reports.map((report, idx) => (
              <div key={report.report_id || idx} className="rp-item">
                <div className="rp-city">{report.city_name}</div>
                <div className="rp-condition">
                  <span className="rp-condition-label">
                    {report.classified_as}
                  </span>
                  <span className="rp-arrow">→</span>
                  <span style={{ fontWeight: 600 }}>
                    {report.should_be}
                  </span>
                </div>
                {report.comment && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                      fontStyle: 'italic',
                    }}
                  >
                    "{report.comment}"
                  </div>
                )}
                <div className="rp-meta">
                  <span>
                    {report.timestamp?.toDate?.()?.toLocaleString?.() ||
                      'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            className="rp-button"
            onClick={handleExportCSV}
            disabled={reports.length === 0}
            type="button"
          >
            📥 Exportar CSV
          </button>
        </>
      )}
    </>
  )
}

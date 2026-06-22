import { useState, useEffect } from 'react'
import { usePrecisionStats } from '../../hooks/usePrecisionStats'
import { getRecentWeatherReports } from '../../services/firebase/classificationReportService'
import type { WeatherReport } from '../../services/firebase/classificationReportService'
import { CONDITION_LABEL, WEATHER_IMAGES } from '../../config/weatherImages'
import type { WeatherCondition } from '../../config/weatherImages'

function rateColor(rate: number): string {
  if (rate >= 0.75) return 'var(--ui-success)'
  if (rate >= 0.5)  return 'var(--ui-warning, #f0883e)'
  return 'var(--ui-error)'
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

export function PrecisionPanel() {
  const [reports, setReports] = useState<WeatherReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getRecentWeatherReports(720).then((data) => {
      if (!cancelled) {
        setReports(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const stats = usePrecisionStats(reports)

  if (loading) {
    return (
      <div className="pp-empty">Cargando estadisticas...</div>
    )
  }

  if (stats.total === 0) {
    return (
      <div className="pp-empty">
        Sin reportes suficientes. Reporta el clima en la tabla para ver estadisticas.
      </div>
    )
  }

  const maxFails = Math.max(...Object.values(stats.failsByHour), 1)

  return (
    <div className="pp-panel">
      {/* Header */}
      <div className="pp-header">
        <span className="pp-header-title">Precision del algoritmo</span>
        <span className="pp-header-sub">Ultimos 30 dias · {stats.total} reportes</span>
      </div>

      {stats.total < 10 && (
        <div className="pp-warning">
          Estadisticas preliminares — menos de 10 reportes confirmados
        </div>
      )}

      {/* KPI cards */}
      <div className="pp-kpis">
        <div className="pp-kpi">
          <div className="pp-kpi-value" style={{ color: rateColor(stats.globalRate) }}>
            {pct(stats.globalRate)}
          </div>
          <div className="pp-kpi-label">Precision global</div>
          <div className="pp-kpi-sub">{stats.hits} / {stats.total} aciertos</div>
        </div>

        <div className="pp-kpi">
          <div className="pp-kpi-value" style={{ color: 'var(--ui-error)' }}>
            {stats.worstCondition
              ? (CONDITION_LABEL[stats.worstCondition.condition as WeatherCondition] ?? stats.worstCondition.condition)
              : '—'}
          </div>
          <div className="pp-kpi-label">Clima con mas fallos</div>
          <div className="pp-kpi-sub">
            {stats.worstCondition
              ? `${stats.worstCondition.misses} fallos de ${stats.worstCondition.total}`
              : 'Sin fallos'}
          </div>
        </div>

        <div className="pp-kpi">
          <div className="pp-kpi-value" style={{ color: 'var(--ui-success)' }}>
            {stats.perfectConditions.length > 0
              ? (CONDITION_LABEL[stats.perfectConditions[0].condition as WeatherCondition] ?? stats.perfectConditions[0].condition)
              : '—'}
          </div>
          <div className="pp-kpi-label">Clima sin fallos</div>
          <div className="pp-kpi-sub">
            {stats.perfectConditions.length > 0
              ? `${stats.perfectConditions[0].total} / ${stats.perfectConditions[0].total} aciertos`
              : 'Ninguno aun'}
          </div>
        </div>

        <div className="pp-kpi">
          <div className="pp-kpi-value" style={{ color: 'var(--ui-warning, #f0883e)' }}>
            {stats.worstHourRange}
          </div>
          <div className="pp-kpi-label">Franja con mas fallos</div>
          <div className="pp-kpi-sub">
            {stats.worstHourRange !== '—'
              ? `${Math.max(...Object.values(stats.failsByHour))} fallos`
              : 'Sin datos'}
          </div>
        </div>
      </div>

      <div className="pp-body">
        {/* Tabla por condicion */}
        <div className="pp-section">
          <div className="pp-section-title">Precision por condicion</div>
          <table className="pp-table">
            <thead>
              <tr>
                <th>Condicion</th>
                <th>Aciertos</th>
                <th>Fallos</th>
                <th>Total</th>
                <th>Precision</th>
              </tr>
            </thead>
            <tbody>
              {stats.byCondition.map((c) => (
                <tr key={c.condition}>
                  <td className="pp-cond-cell">
                    <img
                      src={WEATHER_IMAGES[c.condition as WeatherCondition] ?? ''}
                      alt={c.condition}
                      className="pp-cond-img"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    {CONDITION_LABEL[c.condition as WeatherCondition] ?? c.condition}
                  </td>
                  <td className="pp-hits">{c.hits}</td>
                  <td className="pp-misses">{c.misses}</td>
                  <td>{c.total}</td>
                  <td>
                    <div className="pp-bar-row">
                      <div className="pp-bar-track">
                        <div
                          className="pp-bar-fill"
                          style={{
                            width: pct(c.rate),
                            background: rateColor(c.rate),
                          }}
                        />
                      </div>
                      <span className="pp-bar-pct" style={{ color: rateColor(c.rate) }}>
                        {pct(c.rate)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grafico de fallos por hora */}
        {Object.keys(stats.failsByHour).length > 0 && (
          <div className="pp-section">
            <div className="pp-section-title">Fallos por hora del dia</div>
            <div className="pp-chart">
              {Array.from({ length: 24 }, (_, h) => {
                const count = stats.failsByHour[h] ?? 0
                const heightPct = count === 0 ? 4 : Math.max(8, Math.round((count / maxFails) * 100))
                const color = count === 0
                  ? 'var(--border-subtle)'
                  : count === maxFails
                    ? 'var(--ui-error)'
                    : count >= maxFails * 0.6
                      ? 'var(--ui-warning, #f0883e)'
                      : 'var(--border-subtle)'
                return (
                  <div key={h} className="pp-bar-col" title={`${h}h: ${count} fallo${count !== 1 ? 's' : ''}`}>
                    <div
                      className="pp-bar-v"
                      style={{ height: `${heightPct}%`, background: color }}
                    />
                    <span className="pp-bar-label">{h}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pp-panel {
          border-bottom: 2px solid var(--border-subtle);
          background: var(--bg-primary);
        }
        .pp-empty {
          padding: 12px 16px;
          font-size: 12px;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
        }
        .pp-warning {
          margin: 0 16px 8px;
          padding: 4px 10px;
          font-size: 11px;
          color: var(--ui-warning, #f0883e);
          background: rgba(240, 136, 62, 0.08);
          border-radius: 4px;
          border: 1px solid rgba(240, 136, 62, 0.25);
        }
        .pp-header {
          padding: 8px 16px 6px;
          display: flex;
          align-items: baseline;
          gap: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .pp-header-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
        }
        .pp-header-sub {
          font-size: 11px;
          color: var(--text-muted);
        }
        .pp-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .pp-kpi {
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 10px 12px;
          text-align: center;
        }
        .pp-kpi-value {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.2;
          font-family: 'Rajdhani', monospace;
        }
        .pp-kpi-label {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .pp-kpi-sub {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 1px;
        }
        .pp-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .pp-section {
          padding: 12px 16px;
        }
        .pp-section:first-child {
          border-right: 1px solid var(--border-subtle);
        }
        .pp-section-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .pp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          color: var(--text-primary);
        }
        .pp-table thead tr {
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .pp-table th {
          padding: 4px 8px;
          font-weight: 600;
          text-align: center;
        }
        .pp-table th:first-child { text-align: left; }
        .pp-table td {
          padding: 5px 8px;
          text-align: center;
          border-bottom: 1px solid var(--border-subtle);
        }
        .pp-table tr:last-child td { border-bottom: none; }
        .pp-cond-cell {
          text-align: left !important;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pp-cond-img {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }
        .pp-hits   { color: var(--ui-success); font-weight: 600; }
        .pp-misses { color: var(--ui-error);   font-weight: 600; }
        .pp-bar-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pp-bar-track {
          flex: 1;
          background: var(--bg-tertiary, #21262d);
          border-radius: 4px;
          height: 6px;
          overflow: hidden;
        }
        .pp-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .pp-bar-pct {
          font-size: 11px;
          font-weight: 700;
          min-width: 34px;
          text-align: right;
        }
        /* Chart */
        .pp-chart {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 80px;
        }
        .pp-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 2px;
          height: 100%;
        }
        .pp-bar-v {
          width: 100%;
          border-radius: 2px 2px 0 0;
          min-height: 3px;
          transition: height 0.3s ease;
        }
        .pp-bar-label {
          font-size: 8px;
          color: var(--text-muted);
          line-height: 1;
        }
        @media (max-width: 700px) {
          .pp-kpis { grid-template-columns: repeat(2, 1fr); }
          .pp-body  { grid-template-columns: 1fr; }
          .pp-section:first-child { border-right: none; border-bottom: 1px solid var(--border-subtle); }
        }
      `}</style>
    </div>
  )
}

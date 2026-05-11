import { WEATHER_IMAGES, CONDITION_LABEL } from '../../config/weatherImages'
import type { WeatherCondition } from '../../config/weatherImages'
import type { LookbackEntry } from '../../services/lookback/lookbackService'

interface Props {
  entries: LookbackEntry[]
  loading: boolean
  isSuccess: boolean | null
  colSpan: number
}

function SkeletonCard() {
  return (
    <div className="lbp-item lbp-skeleton">
      <div className="lbp-sk-bar" style={{ width: '40px', height: '9px' }} />
      <div className="lbp-sk-bar" style={{ width: '28px', height: '8px', marginTop: '3px' }} />
      <div className="lbp-sk-bar" style={{ width: '24px', height: '24px', borderRadius: '50%', marginTop: '4px' }} />
      <div className="lbp-sk-bar" style={{ width: '36px', height: '9px', marginTop: '3px' }} />
    </div>
  )
}

export function LookbackPanel({ entries, loading, isSuccess, colSpan }: Props) {
  const colorClass = isSuccess === true ? 'success' : 'error'

  const confirmed = entries.filter(e => e.isMatch !== null)
  const hits = confirmed.filter(e => e.isMatch).length
  const subtitle =
    confirmed.length > 0
      ? ` · ${hits}/${confirmed.length} confirmados acertaron`
      : ''

  return (
    <tr className={`lbp-row ${colorClass}`}>
      <td colSpan={colSpan}>
        <style>{`
          .lbp-row td {
            padding: 0;
          }
          .lbp-row.success td { background: rgba(63, 185, 80, 0.02); }
          .lbp-row.error td   { background: rgba(248, 81, 73, 0.02); }

          .lbp-panel {
            padding: 12px 16px;
            border-top: 1px solid rgba(248, 81, 73, 0.15);
            border-bottom: 1px solid rgba(248, 81, 73, 0.15);
          }
          .lbp-row.success .lbp-panel {
            border-color: rgba(63, 185, 80, 0.15);
          }

          .lbp-title {
            font-family: 'Rajdhani', monospace;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .lbp-title.success { color: var(--ui-success); }
          .lbp-title.error   { color: var(--ui-error); }

          .lbp-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
            gap: 8px;
          }

          .lbp-item {
            padding: 6px;
            border-radius: 6px;
            border: 1px solid var(--border-subtle);
            font-family: 'Rajdhani', monospace;
            font-size: 10px;
            color: var(--text-secondary);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            text-align: center;
            background: var(--bg-tertiary);
          }
          .lbp-item.hit {
            border-color: var(--ui-success);
            background: rgba(63, 185, 80, 0.12);
            color: var(--ui-success);
          }
          .lbp-item.miss {
            border-color: var(--ui-error);
            background: rgba(248, 81, 73, 0.06);
          }

          .lbp-ago       { font-size: 9px; opacity: 0.7; font-weight: 600; }
          .lbp-dh        { font-size: 8px; opacity: 0.5; }
          .lbp-cond      { display: flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; margin-top: 2px; }
          .lbp-check     { font-size: 12px; font-weight: 700; color: var(--ui-success); }
          .lbp-cross     { font-size: 11px; font-weight: 700; color: var(--ui-error); }

          .lbp-empty {
            font-family: 'Rajdhani', monospace;
            font-size: 11px;
            color: var(--text-secondary);
            opacity: 0.6;
          }

          .lbp-skeleton { animation: lbp-pulse 1.2s ease-in-out infinite; }
          .lbp-sk-bar {
            background: var(--border-default);
            border-radius: 3px;
          }
          @keyframes lbp-pulse {
            0%, 100% { opacity: 0.5; }
            50%       { opacity: 1; }
          }
        `}</style>

        <div className="lbp-panel">
          <div className={`lbp-title ${colorClass}`}>
            {loading ? 'Cargando lookback...' : `Lookback 12h — ${entries.length} entradas${subtitle}`}
          </div>

          <div className="lbp-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
              : entries.length === 0
                ? <span className="lbp-empty">Sin datos historicos disponibles</span>
                : entries.map((entry) => {
                    const cond = entry.condition.toLowerCase() as WeatherCondition
                    const itemClass = entry.isMatch === true ? 'hit' : entry.isMatch === false ? 'miss' : ''
                    return (
                      <div key={entry.dateHour} className={`lbp-item ${itemClass}`}>
                        <div className="lbp-ago">-{entry.hoursAgo}h</div>
                        <div className="lbp-dh">{entry.dateHour.slice(8, 13).replace('-', ':')}</div>
                        <div className="lbp-cond">
                          <img
                            src={WEATHER_IMAGES[cond] || '/weather/cloudy.png'}
                            alt={entry.condition}
                            style={{ width: 16, height: 16 }}
                          />
                          <span>{CONDITION_LABEL[cond] || entry.condition}</span>
                        </div>
                        {entry.isMatch === true  && <div className="lbp-check">✓</div>}
                        {entry.isMatch === false && <div className="lbp-cross">✕</div>}
                      </div>
                    )
                  })
            }
          </div>
        </div>
      </td>
    </tr>
  )
}

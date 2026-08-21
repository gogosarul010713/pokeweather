import { useStore } from '../../store/useStore'
import { TYPE_ICON } from '../../config/typeIcons'
import { getNextMigration } from '../../config/nestMigration'
import { getMigrationStatus } from '../../utils/timeUtils'
import type { Nest } from '../../types/nest'

interface NestDetailProps {
  nest: Nest
  onClose: () => void
  onViewInList: () => void
}

const RARITY_LABEL: Record<string, string> = {
  common: 'Comun',
  uncommon: 'Poco comun',
  rare: 'Raro',
  very_rare: 'Muy raro',
}
const RARITY_STARS: Record<string, string> = {
  common: '★',
  uncommon: '★★',
  rare: '★★★',
  very_rare: '★★★★',
}

function getLocalDateTime(timezone: string): { date: string; time: string } {
  try {
    const now = new Date()
    const dateStr = now.toLocaleDateString('es-CL', { timeZone: timezone, day: '2-digit', month: '2-digit' })
    const timeStr = now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true })
    return { date: dateStr, time: timeStr }
  } catch {
    return { date: '--/--', time: '--:-- --' }
  }
}

export default function NestDetail({ nest, onClose, onViewInList }: NestDetailProps) {
  const now = useStore((s) => s.now)

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${nest.pokemonId}.png`
  const nextMigration = getNextMigration(now)
  const isConfirmedActive = nest.confirmed && now < nextMigration.getTime()
  const countdown = getMigrationStatus(nextMigration.toISOString(), now)

  const isHot = nest.spawnRate >= 65
  const isNew = nest.confirmedAt
    ? now - new Date(nest.confirmedAt).getTime() < 48 * 60 * 60 * 1000
    : false

  const confirmedRelative = nest.confirmedAt
    ? (() => {
        const diff = now - new Date(nest.confirmedAt).getTime()
        const days = Math.floor(diff / 86400000)
        const hours = Math.floor(diff / 3600000)
        if (days >= 1) return `hace ${days}d`
        return `hace ${hours}h`
      })()
    : null

  const { date: localDate, time: localTime } = getLocalDateTime(nest.timezone)

  const copyCoords = () => {
    navigator.clipboard.writeText(`${nest.lat}, ${nest.lng}`)
  }

  return (
    <>
      <style>{`
        .nd-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1100;
          animation: nd-fadeIn 200ms ease;
        }
        @keyframes nd-fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }

        .nd-modal {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(600px, 100vw);
          max-height: 72vh;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 16px 16px 0 0;
          z-index: 1101;
          display: flex;
          flex-direction: column;
          animation: nd-slideUp 250ms ease;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
        }
        @keyframes nd-slideUp {
          from { transform: translateX(-50%) translateY(100%); }
          to   { transform: translateX(-50%) translateY(0); }
        }

        /* Header */
        .nd-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }
        .nd-header-sprite {
          width: 52px;
          height: 52px;
          object-fit: contain;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .nd-header-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nd-header-name {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nd-header-sub {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .nd-coords-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
        .nd-coords {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
          letter-spacing: 0.2px;
        }
        .nd-copy-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 3px 5px;
          font-size: 11px;
          transition: all 150ms ease;
          flex-shrink: 0;
        }
        .nd-copy-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
        .nd-header-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }
        .nd-icon-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 150ms ease;
          font-size: 18px;
          line-height: 1;
        }
        .nd-icon-btn:hover { color: var(--text-primary); }

        /* Content */
        .nd-content {
          flex: 1;
          overflow-y: auto;
          padding: 14px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .nd-content::-webkit-scrollbar { width: 4px; }
        .nd-content::-webkit-scrollbar-track { background: transparent; }
        .nd-content::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }

        .nd-section-label {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 6px;
        }

        /* Pokemon card */
        .nd-pokemon-card {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nd-sprite {
          width: 72px;
          height: 72px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .nd-pokemon-info { flex: 1; min-width: 0; }
        .nd-pokemon-name {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }
        .nd-types-row {
          display: flex;
          gap: 3px;
          margin-top: 4px;
          align-items: center;
          flex-wrap: wrap;
        }
        .nd-type-icon { width: 20px; height: 20px; object-fit: contain; }
        .nd-confirm-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
          margin-left: 4px;
        }
        .nd-confirm-badge.ok { background: rgba(34,197,94,0.15); color: #22c55e; }
        .nd-confirm-badge.nope { background: rgba(156,163,175,0.15); color: var(--text-secondary); }
        .nd-badges-row { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
        .nd-badge-hot { font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 4px; background: rgba(249,115,22,0.15); color: #f97316; }
        .nd-badge-new { font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 4px; background: rgba(59,130,246,0.15); color: #3b82f6; }

        /* Stats grid */
        .nd-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .nd-stat-cell {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          padding: 8px 6px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nd-stat-value {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }
        .nd-stat-value.green { color: #22c55e; }
        .nd-stat-value.gold  { color: #f59e0b; }
        .nd-stat-value.muted { color: var(--text-secondary); }
        .nd-stat-label { font-size: 9px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; }

        /* Evo */
        .nd-evo { font-size: 11px; color: var(--text-secondary); text-align: center; }
        .nd-evo-extra { font-size: 10px; color: var(--text-secondary); opacity: 0.7; margin-top: 2px; text-align: center; }

        /* Hora local */
        .nd-datetime-value {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        /* Countdown */
        .nd-countdown {
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
          padding: 4px 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
        }

        .nd-confirmed-text { font-size: 11px; color: var(--text-secondary); }

        /* Footer */
        .nd-footer {
          padding: 10px 20px;
          border-top: 1px solid var(--border-default);
          flex-shrink: 0;
        }
        .nd-footer-btn {
          width: 100%;
          padding: 9px;
          border-radius: 6px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-primary);
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 150ms ease;
        }
        .nd-footer-btn:hover { background: var(--bg-tertiary); border-color: var(--border-strong); }

        @media (max-width: 600px) {
          .nd-modal { width: 100vw; max-height: 85vh; border-radius: 12px 12px 0 0; }
        }
      `}</style>

      <div className="nd-backdrop" onClick={onClose} />

      <div className="nd-modal">
        {/* Header */}
        <div className="nd-header">
          <img
            className="nd-header-sprite"
            src={spriteUrl}
            alt={nest.pokemonName}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />

          <div className="nd-header-info">
            <div className="nd-header-name" title={nest.name}>{nest.name}</div>
            <div className="nd-header-sub">{nest.city}, {nest.country}</div>
            <div className="nd-coords-row">
              <span className="nd-coords">{nest.lat.toFixed(4)}, {nest.lng.toFixed(4)}</span>
              <button className="nd-copy-btn" onClick={copyCoords} title="Copiar coordenadas">📋</button>
            </div>
          </div>

          <div className="nd-header-actions">
            <button className="nd-icon-btn" title="Guardar">🤍</button>
            <button className="nd-icon-btn" title="Reportar">⚠️</button>
            <button className="nd-icon-btn" onClick={onClose} title="Cerrar">✕</button>
          </div>
        </div>

        {/* Content */}
        <div className="nd-content">

          {/* Pokemon */}
          <div>
            <div className="nd-section-label">Pokemon</div>
            <div className="nd-pokemon-card">
              <img
                className="nd-sprite"
                src={spriteUrl}
                alt={nest.pokemonName}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div className="nd-pokemon-info">
                <div className="nd-pokemon-name">{nest.pokemonName}</div>
                <div className="nd-types-row">
                  {nest.types.map((type) => {
                    const src = TYPE_ICON[type]
                    if (!src) return null
                    return (
                      <img key={type} className="nd-type-icon" src={src} alt={type} title={type}
                        onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    )
                  })}
                  <span className={`nd-confirm-badge ${isConfirmedActive ? 'ok' : 'nope'}`}>
                    {isConfirmedActive ? '✓ Confirmado' : '? Sin confirmar'}
                  </span>
                </div>
                {(isHot || isNew) && (
                  <div className="nd-badges-row">
                    {isHot && <span className="nd-badge-hot">HOT</span>}
                    {isNew && <span className="nd-badge-new">NEW</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats pokemon */}
          <div className="nd-stats-grid">
            {nest.stardust !== undefined && (
              <div className="nd-stat-cell">
                <span className="nd-stat-value">★ {nest.stardust.toLocaleString()}</span>
                <span className="nd-stat-label">polvo estelar</span>
              </div>
            )}
            <div className="nd-stat-cell">
              {nest.hasShiny
                ? <span className="nd-stat-value gold">✦</span>
                : <span className="nd-stat-value muted">—</span>
              }
              <span className="nd-stat-label">{nest.hasShiny ? 'Shiny' : 'No shiny'}</span>
            </div>
            <div className="nd-stat-cell">
              <span className="nd-stat-value" style={{ fontSize: '12px', color: '#f59e0b' }}>
                {RARITY_STARS[nest.rarity]}
              </span>
              <span className="nd-stat-label">{RARITY_LABEL[nest.rarity]}</span>
            </div>
          </div>

          {/* Linea evolutiva */}
          <div>
            <div className="nd-evo">{nest.evolutionLine}</div>
            {nest.evolutionLineExtra && (
              <div className="nd-evo-extra">{nest.evolutionLineExtra}</div>
            )}
          </div>

          {/* Hora local */}
          <div>
            <div className="nd-section-label">Hora Local</div>
            <div className="nd-datetime-value">{localDate} · {localTime}</div>
          </div>

          {/* Datos nido */}
          <div>
            <div className="nd-section-label">Datos del Nido</div>
            <div className="nd-stats-grid">
              <div className="nd-stat-cell">
                <span className="nd-stat-value green">
                  {isConfirmedActive ? '' : '~'}{nest.spawnRate}%
                </span>
                <span className="nd-stat-label">spawn</span>
              </div>
              {nest.stops !== undefined && (
                <div className="nd-stat-cell">
                  <span className="nd-stat-value">~{nest.stops}</span>
                  <span className="nd-stat-label">paradas</span>
                </div>
              )}
              {nest.gyms !== undefined && (
                <div className="nd-stat-cell">
                  <span className="nd-stat-value">{nest.gyms}</span>
                  <span className="nd-stat-label">gimnasios</span>
                </div>
              )}
            </div>
          </div>

          {/* Migracion */}
          <div className="nd-countdown">{countdown}</div>

          {/* Confirmacion */}
          {confirmedRelative && (
            <div className="nd-confirmed-text">Ultima confirmacion: {confirmedRelative}</div>
          )}

        </div>

        {/* Footer */}
        <div className="nd-footer">
          <button className="nd-footer-btn" onClick={onViewInList}>Ver en lista</button>
        </div>
      </div>
    </>
  )
}

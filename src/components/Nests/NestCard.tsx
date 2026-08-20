import { useStore } from '../../store/useStore'
import { TYPE_ICON } from '../../config/typeIcons'
import { getNextMigration } from '../../config/nestMigration'
import { countryFlag } from '../../config/countryFlags'
import { calculateDistance, formatDistance } from '../../utils/distance'
import { getCooldown } from '../../utils/cooldown'
import type { Nest } from '../../types/nest'

interface NestCardProps {
  nest: Nest
  isActive: boolean
  onSelect: (nest: Nest) => void
}

export default function NestCard({ nest, isActive, onSelect }: NestCardProps) {
  const now = useStore((s) => s.now)
  const homeLocation = useStore((s) => s.homeLocation)

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${nest.pokemonId}.png`
  const isConfirmedActive = nest.confirmed && now < getNextMigration(now).getTime()
  const isHot = nest.spawnRate >= 65
  const isNew = nest.confirmedAt
    ? Date.now() - new Date(nest.confirmedAt).getTime() < 48 * 60 * 60 * 1000
    : false

  const flag = countryFlag(nest.countryCode)

  const distInfo = homeLocation
    ? (() => {
        const m = calculateDistance(homeLocation.lat, homeLocation.lon, nest.lat, nest.lng)
        return { dist: formatDistance(m), cooldown: getCooldown(m) }
      })()
    : null

  return (
    <>
      <style>{`
        .nc-root {
          position: relative;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          cursor: pointer;
          transition: all 200ms ease;
          user-select: none;
          overflow: hidden;
        }
        .nc-root:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }
        .nc-root.active {
          background: rgba(34,197,94,.08);
          border-color: #22c55e;
          border-left: 3px solid #22c55e;
        }
        .nc-main {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
        }
        .nc-root.active .nc-main { padding-left: 10px; }

        .nc-sprite {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          object-fit: contain;
        }
        .nc-body { flex: 1; min-width: 0; display: flex; gap: 6px; }
        .nc-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }

        /* Row 1: lugar + bandera */
        .nc-r1 { display: flex; align-items: center; gap: 4px; }
        .nc-place {
          font-family: 'Exo 2', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nc-flag { font-size: 11px; flex-shrink: 0; }

        /* Row 2: ciudad */
        .nc-city {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Row 3: pokemon + tipos */
        .nc-r3 { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
        .nc-pokemon {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: var(--text-secondary);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nc-type-icon {
          width: 22px;
          height: 22px;
          object-fit: contain;
          flex-shrink: 0;
        }

        /* Barra inferior: distancia + ETA */
        .nc-bar {
          display: flex;
          align-items: center;
          padding: 5px 12px 5px 62px;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-overlay);
          gap: 10px;
          border-radius: 0 0 8px 8px;
        }
        .nc-root.active .nc-bar { padding-left: 60px; }
        .nc-bar-item { display: flex; align-items: center; gap: 5px; }
        .nc-bar-val {
          font-size: 11px;
          font-weight: 700;
          color: var(--home);
          text-shadow: 0 0 6px var(--home-glow);
          font-variant-numeric: tabular-nums;
        }
        .nc-bar-divider {
          width: 1px;
          height: 11px;
          background: var(--border-default);
        }

        /* Columna derecha */
        .nc-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          flex-shrink: 0;
        }
        .nc-badges-row {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .nc-badges-row2 {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .nc-badge {
          padding: 2px 6px;
          border-radius: 5px;
          font-family: 'Exo 2', sans-serif;
          font-size: 8px;
          font-weight: 700;
          white-space: nowrap;
        }
        .nc-badge-confirmed {
          background: rgba(34,197,94,.15);
          color: #22c55e;
        }
        .nc-badge-unconfirmed {
          background: rgba(128,128,128,.12);
          color: var(--text-secondary);
        }
        .nc-badge-hot {
          background: rgba(255,100,0,.15);
          color: #ff6400;
        }
        .nc-badge-new {
          background: rgba(100,180,255,.12);
          color: #64b4ff;
        }
        .nc-spawn-badge {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px 5px;
          border-radius: 5px;
          background: rgba(34,197,94,.10);
          font-size: 8px;
          font-weight: 700;
          color: var(--ui-success);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
          font-family: 'Exo 2', sans-serif;
        }
        .nc-spawn {
          font-family: 'Exo 2', sans-serif;
          font-size: 9px;
          font-weight: 600;
          color: var(--text-secondary);
          opacity: .5;
          white-space: nowrap;
        }
      `}</style>

      <div
        className={`nc-root${isActive ? ' active' : ''}${!isConfirmedActive ? ' unconfirmed' : ''}`}
        onClick={() => onSelect(nest)}
      >
        <div className="nc-main">
          <img
            className="nc-sprite"
            src={spriteUrl}
            alt={nest.pokemonName}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />

          <div className="nc-body">
            <div className="nc-info">
              <div className="nc-r1">
                <span className="nc-place">{nest.name}</span>
                <span className="nc-flag">{flag}</span>
              </div>
              <span className="nc-city">{nest.city}, {nest.country}</span>
              <div className="nc-r3">
                <span className="nc-pokemon">{nest.pokemonName}</span>
                {nest.types.map((type) => {
                  const src = TYPE_ICON[type]
                  if (!src) return null
                  return (
                    <img
                      key={type}
                      className="nc-type-icon"
                      src={src}
                      alt={type}
                      title={type}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )
                })}
              </div>
            </div>

            <div className="nc-right">
              <div className="nc-badges-row">
                {isConfirmedActive
                  ? <span className="nc-badge nc-badge-confirmed" title="Confirmado por la comunidad">✓</span>
                  : <span className="nc-badge nc-badge-unconfirmed" title="Sin confirmar">?</span>
                }
                {isHot && <span className="nc-badge nc-badge-hot" title="Spawn rate >= 65%">HOT</span>}
              </div>
              <div className="nc-badges-row2">
                {isNew && <span className="nc-badge nc-badge-new" title="Confirmado en las ultimas 48h">NEW</span>}
                <span className={`nc-spawn-badge${!isConfirmedActive ? ' unconf' : ''}`}>
                  {'\u{1F43E}'} {isConfirmedActive ? '' : '~'}{nest.spawnRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {distInfo && (
          <div className="nc-bar">
            <div className="nc-bar-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--home)" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
              <span className="nc-bar-val">{distInfo.dist}</span>
            </div>
            <div className="nc-bar-divider"/>
            <div className="nc-bar-item" title="Cooldown requerido antes de cazar">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--home)" strokeWidth="2.5" style={{opacity:.8}}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span className="nc-bar-val">{distInfo.cooldown}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

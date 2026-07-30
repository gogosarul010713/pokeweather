import { useStore } from '../../store/useStore'
import { TYPE_ICON } from '../../config/typeIcons'
import { NEXT_MIGRATION } from '../../config/nestMigration'
import { countryFlag } from '../../config/countryFlags'
import type { Nest } from '../../types/nest'

interface NestCardProps {
  nest: Nest
  isActive: boolean
  onSelect: (nest: Nest) => void
}

export default function NestCard({ nest, isActive, onSelect }: NestCardProps) {
  const now = useStore((s) => s.now)

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${nest.pokemonId}.png`
  const migrationMs = new Date(NEXT_MIGRATION).getTime()
  const isConfirmedActive = nest.confirmed && now < migrationMs
  const isHot = nest.spawnRate >= 65
  const isNew = nest.confirmedAt
    ? Date.now() - new Date(nest.confirmedAt).getTime() < 48 * 60 * 60 * 1000
    : false

  const flag = countryFlag(nest.countryCode)

  return (
    <>
      <style>{`
        .nc-root {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          cursor: pointer;
          transition: all 200ms ease;
          user-select: none;
        }
        .nc-root:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }
        .nc-root.active {
          background: rgba(34,197,94,.08);
          border-color: #22c55e;
          border-left: 3px solid #22c55e;
          padding-left: 10px;
        }
        .nc-root.unconfirmed { opacity: 0.7; }

        .nc-sprite {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          object-fit: contain;
        }
        .nc-root.unconfirmed .nc-sprite {
          filter: grayscale(1) opacity(0.5);
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

        /* Columna derecha */
        .nc-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          flex-shrink: 0;
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
        <img
          className="nc-sprite"
          src={spriteUrl}
          alt={nest.pokemonName}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        <div className="nc-body">
          <div className="nc-info">
            {/* Row 1: lugar + bandera */}
            <div className="nc-r1">
              <span className="nc-place">{nest.name}</span>
              <span className="nc-flag">{flag}</span>
            </div>

            {/* Row 2: ciudad */}
            <span className="nc-city">{nest.city}, {nest.country}</span>

            {/* Row 3: pokemon + tipos (iconos igual que LocationCard) */}
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

          {/* Columna derecha: confirmado + badges + spawn */}
          <div className="nc-right">
            {isConfirmedActive
              ? <span className="nc-badge nc-badge-confirmed" title="Confirmado por la comunidad">✓</span>
              : <span className="nc-badge nc-badge-unconfirmed" title="Sin confirmar">?</span>
            }
            {isHot && <span className="nc-badge nc-badge-hot" title="Spawn rate >= 65%">HOT</span>}
            {isNew && <span className="nc-badge nc-badge-new" title="Confirmado en las ultimas 48h">NEW</span>}
            <span className="nc-spawn">{isConfirmedActive ? '' : '~'}{nest.spawnRate}%</span>
          </div>
        </div>
      </div>
    </>
  )
}

import { useStore } from '../../store/useStore'
import type { Nest } from '../../types/nest'
import { TYPE_IMAGES } from '../../config/pokemonTypes'

interface NestCardProps {
  nest: Nest
  isActive: boolean
}

export default function NestCard({ nest, isActive }: NestCardProps) {
  const setSelectedNest = useStore((s) => s.setSelectedNest)
  const selectedNest    = useStore((s) => s.selectedNest)

  const primaryType = Array.isArray(nest.pokemonType) && nest.pokemonType.length > 0
    ? nest.pokemonType[0]
    : ''

  return (
    <>
      <style>{`
        .nc-root {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          cursor: pointer;
          transition: background 150ms ease;
          background: transparent;
        }

        .nc-root:hover {
          background: var(--bg-tertiary);
        }

        .nc-root.nc-active {
          background: rgba(34, 197, 94, 0.08);
          border-color: rgba(34, 197, 94, 0.4);
        }

        .nc-sprite {
          width: 40px;
          height: 40px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .nc-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }

        .nc-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Exo 2', sans-serif;
        }

        .nc-location {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nc-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }

        .nc-type-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 500;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .nc-type-icon {
          width: 12px;
          height: 12px;
          object-fit: contain;
        }
      `}</style>

      <div
        className={`nc-root${isActive ? ' nc-active' : ''}`}
        onClick={() => setSelectedNest(selectedNest?.id === nest.id ? null : nest)}
      >
        <img
          className="nc-sprite"
          src={`/pokemon/${nest.pokemon.toLowerCase()}.png`}
          alt={nest.pokemon}
          onError={(e) => { e.currentTarget.style.opacity = '0' }}
        />

        <div className="nc-body">
          <div className="nc-name">{nest.name}</div>
          <div className="nc-location">
            {[nest.city, nest.country].filter(Boolean).join(', ')}
          </div>
        </div>

        <div className="nc-right">
          {primaryType && (
            <span className="nc-type-pill">
              {TYPE_IMAGES[primaryType] && (
                <img
                  className="nc-type-icon"
                  src={TYPE_IMAGES[primaryType]}
                  alt={primaryType}
                />
              )}
              {primaryType}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

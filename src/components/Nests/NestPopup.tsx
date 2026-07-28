import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../store/useStore'
import { TYPE_ICON } from '../../config/typeIcons'
import { NEXT_MIGRATION } from '../../config/nestMigration'
import NestDetail from './NestDetail'
import type { Nest } from '../../types/nest'

interface NestPopupProps {
  nest: Nest
  onClose: () => void
  onViewInList: () => void
}

const RARITY_STARS: Record<string, string> = {
  common: '★',
  uncommon: '★★',
  rare: '★★★',
  very_rare: '★★★★',
}

export default function NestPopup({ nest, onClose, onViewInList }: NestPopupProps) {
  const now = useStore((s) => s.now)
  const [showDetail, setShowDetail] = useState(false)
  const [copied, setCopied] = useState(false)

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nest.pokemonId}.png`
  const migrationMs = new Date(NEXT_MIGRATION).getTime()
  const isConfirmedActive = nest.confirmed && now < migrationMs

  const isHot = nest.spawnRate >= 65
  const isNew = nest.confirmedAt
    ? Date.now() - new Date(nest.confirmedAt).getTime() < 48 * 60 * 60 * 1000
    : false

  const copyCoords = () => {
    navigator.clipboard.writeText(`${nest.lat}, ${nest.lng}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCloseAll = () => {
    setShowDetail(false)
    onClose()
  }

  return (
    <>
      <style>{`
        .np-root {
          width: 290px;
          background: var(--bg-primary);
          border: 1px solid var(--border-strong);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          overflow: visible;
          animation: np-enter 200ms ease both;
          position: relative;
        }
        .np-tip-container {
          width: 40px;
          height: 20px;
          position: absolute;
          bottom: -19px;
          left: 50%;
          margin-left: -20px;
          overflow: hidden;
          pointer-events: none;
        }
        .np-tip {
          width: 17px;
          height: 17px;
          margin: -10px auto 0;
          background: var(--bg-primary);
          box-shadow: 0 3px 14px rgba(0,0,0,0.4);
          transform: rotate(45deg);
        }
        @keyframes np-enter {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to   { opacity: 1; transform: translate(0, 0) scale(1); }
        }

        .np-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px 8px;
          border-bottom: 1px solid var(--border-default);
          gap: 6px;
        }
        .np-header-info {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          overflow: hidden;
        }
        .np-title {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 1;
        }
        .np-location {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .np-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 2px;
          line-height: 1;
          color: var(--text-secondary);
          border-radius: 4px;
          flex-shrink: 0;
          transition: background 150ms;
        }
        .np-close-btn:hover { background: var(--bg-tertiary); }

        .np-body {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .np-pokemon-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .np-sprite {
          width: 48px;
          height: 48px;
          image-rendering: pixelated;
          object-fit: contain;
          flex-shrink: 0;
        }
        .np-pokemon-info { flex: 1; min-width: 0; }
        .np-pokemon-name {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }
        .np-types-row {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 3px;
          flex-wrap: wrap;
        }
        .np-type-icon {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }
        .np-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 4px;
        }
        .np-badge.confirmed  { background: rgba(34,197,94,0.15);  color: #22c55e; }
        .np-badge.nope       { background: rgba(156,163,175,0.15); color: var(--text-secondary); }
        .np-badge.hot        { background: rgba(249,115,22,0.15);  color: #f97316; }
        .np-badge.new        { background: rgba(59,130,246,0.15);  color: #3b82f6; }

        .np-stats-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .np-rarity { color: #f59e0b; letter-spacing: -1px; }
        .np-spawn  { font-weight: 600; }
        .np-spawn.ok { color: #22c55e; }

        .np-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-top: 1px solid var(--border-default);
          gap: 6px;
        }
        .np-coords-wrap {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }
        .np-coords {
          font-family: monospace;
          font-size: 10px;
          color: var(--text-tertiary, var(--text-secondary));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .np-copy-btn {
          padding: 2px 4px;
          border-radius: 3px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 9px;
          font-weight: 600;
          transition: all 150ms ease;
          flex-shrink: 0;
          line-height: 1;
        }
        .np-copy-btn.copied {
          background: rgba(88,166,255,0.1);
          color: var(--ui-accent);
        }
        .np-detail-row {
          padding: 0 12px 10px;
        }
        .np-detail-btn {
          width: 100%;
          background: none;
          border: 1px solid var(--border-default);
          border-radius: 4px;
          padding: 6px;
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: var(--ui-accent);
          cursor: pointer;
          transition: background 150ms;
        }
        .np-detail-btn:hover { background: var(--bg-tertiary); }

      `}</style>

      <div className="np-root">
          {/* Header */}
          <div className="np-header">
            <div className="np-header-info">
              <span className="np-title">{nest.name}</span>
              <span className="np-location">{nest.city}, {nest.country}</span>
            </div>
            <button className="np-close-btn" onClick={handleCloseAll}>✕</button>
          </div>

          <div className="np-body">
            {/* Pokemon row */}
            <div className="np-pokemon-row">
              <img
                className="np-sprite"
                src={spriteUrl}
                alt={nest.pokemonName}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div className="np-pokemon-info">
                <div className="np-pokemon-name">{nest.pokemonName}</div>
                <div className="np-types-row">
                  {nest.types.map((type) => {
                    const src = TYPE_ICON[type]
                    if (!src) return null
                    return (
                      <img key={type} className="np-type-icon" src={src} alt={type}
                        onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    )
                  })}
                  <span className={`np-badge ${isConfirmedActive ? 'confirmed' : 'nope'}`}>
                    {isConfirmedActive ? '✓' : '?'}
                  </span>
                  {isHot && <span className="np-badge hot">HOT</span>}
                  {isNew && <span className="np-badge new">NEW</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="np-stats-row">
              <span className="np-rarity">{RARITY_STARS[nest.rarity]}</span>
              <span>{nest.rarity.replace('_', ' ')}</span>
              <span>·</span>
              <span className={`np-spawn${isConfirmedActive ? ' ok' : ''}`}>
                Spawn {isConfirmedActive ? '' : '~'}{nest.spawnRate}%
              </span>
            </div>
          </div>

          {/* Footer coords */}
          <div className="np-footer">
            <div className="np-coords-wrap">
              <span className="np-coords">{nest.lat.toFixed(4)}, {nest.lng.toFixed(4)}</span>
              <button
                className={`np-copy-btn${copied ? ' copied' : ''}`}
                onClick={copyCoords}
                title={copied ? 'Copiado' : 'Copiar coordenadas'}
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* Boton Ver detalle */}
          <div className="np-detail-row">
            <button className="np-detail-btn" onClick={() => setShowDetail(true)}>
              Ver detalle →
            </button>
          </div>
        </div>
          <div className="np-tip-container">
            <div className="np-tip" />
          </div>

      {showDetail && createPortal(
        <NestDetail
          nest={nest}
          onClose={() => setShowDetail(false)}
          onViewInList={() => { setShowDetail(false); onViewInList() }}
        />,
        document.body
      )}
    </>
  )
}

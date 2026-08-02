import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { BADGE_ICONS } from '../../services/weather/weatherService'
import type { BadgeType } from '../../services/weather/weatherService'

const BADGE_LABELS: Record<BadgeType, string> = {
  stops: 'Pokestop Hub',
  gyms: 'Gym Hub',
  community: 'Comunidad Activa',
  best: 'Mejores Lugares',
}
const BADGE_ORDER: BadgeType[] = ['stops', 'gyms', 'community', 'best']

const CATEGORY_COLORS: Record<BadgeType, string> = {
  stops:     '#58A6FF',
  gyms:      '#F85149',
  community: '#3FB950',
  best:      '#FFD700',
}

type NestRow = 'verified' | 'spawn' | 'dust' | 'top'

const NEST_ROWS: { key: NestRow; label: string; icon: string; color: string }[] = [
  { key: 'verified', label: 'Verificado',     icon: '✅', color: '#A78BFA' },
  { key: 'spawn',    label: 'Mayor Spawn',    icon: '⭐', color: '#FB923C' },
  { key: 'dust',     label: 'Mayor Polvo',    icon: '✨', color: '#F472B6' },
  { key: 'top',      label: 'Mejores Nidos',  icon: '🏆', color: '#34D399' },
]

type MainTab = 'clima' | 'nidos'

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768)
  const [mainTab, setMainTab] = useState<MainTab>('clima')

  const highlightCategories = useStore((s) => s.highlightCategories)
  const toggleHighlightCategory = useStore((s) => s.toggleHighlightCategory)
  const nests = useStore((s) => s.nests)
  const highlightNestRow = useStore((s) => s.highlightNestRow)
  const setHighlightNestRow = useStore((s) => s.setHighlightNestRow)

  // Conteos globales para tab Clima (categorias de ciudad)
  // El badge count viene de la data de ciudades — usamos placeholder por ahora
  // ya que MapLegend no tiene acceso directo a cities con badges
  const climaCounts: Record<BadgeType, number> = { stops: 0, gyms: 0, community: 0, best: 0 }

  // Conteos globales para tab Nidos
  const nestCounts: Record<NestRow, number> = {
    verified: nests.filter((n) => n.confirmed).length,
    spawn:    nests.filter((n) => (n.spawnRate ?? 0) > 60).length,
    dust:     nests.filter((n) => (n.stardust ?? 0) > 2000).length,
    top:      nests.filter((n) => n.confirmed && (n.spawnRate ?? 0) > 60).length,
  }

  const activeCount = highlightCategories.length + (highlightNestRow ? 1 : 0)

  return (
    <>
      <style>{`
        .ml-root {
          position: absolute;
          bottom: 28px;
          right: 50px;
          z-index: 1000;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          overflow: hidden;
          width: 188px;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
        }

        .ml-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }
        .ml-header:hover { background: var(--bg-tertiary); }

        .ml-title {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
        }

        .ml-chevron {
          font-size: 9px;
          color: var(--text-secondary);
          transition: transform 200ms ease;
        }
        .ml-chevron.open { transform: rotate(180deg); }

        .ml-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-default);
          background: var(--bg-primary);
          flex-shrink: 0;
        }

        .ml-tab {
          flex: 1;
          padding: 7px 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          border-bottom: 2px solid transparent;
          transition: all 150ms ease;
        }
        .ml-tab:hover { color: var(--text-primary); background: var(--bg-tertiary); }
        .ml-tab.active { color: var(--ui-accent); border-bottom-color: var(--ui-accent); }

        .ml-body {
          overflow-y: auto;
          flex: 1;
          padding: 4px 0;
        }

        /* Tipo clima: sprite + label (solo referencia visual, sin interaccion) */
        .ml-clima-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
        }

        .ml-sprite {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ml-sprite img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ml-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          flex: 1;
        }

        /* Filas interactivas con radio exclusivo */
        .ml-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px 6px 8px;
          cursor: pointer;
          border-left: 3px solid transparent;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .ml-row:hover { background: var(--bg-tertiary); }

        .ml-row-icon {
          font-size: 14px;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .ml-row-count {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-tertiary);
          margin-left: auto;
          flex-shrink: 0;
          min-width: 18px;
          text-align: right;
        }

        @media (max-width: 767px) {
          .ml-root {
            bottom: 75px;
            right: 8px;
            max-width: 90vw;
            max-height: 50vh;
          }
        }
      `}</style>

      <div className="ml-root">
        <div className="ml-header" onClick={() => setCollapsed((c) => !c)}>
          <span className="ml-title">Leyenda</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {activeCount > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 700, fontFamily: "'Exo 2', sans-serif",
                background: 'var(--ui-accent)', color: '#fff',
                borderRadius: 8, padding: '1px 5px', lineHeight: 1.4,
              }}>
                {activeCount}
              </span>
            )}
            <span className={`ml-chevron ${collapsed ? '' : 'open'}`}>&#9660;</span>
          </div>
        </div>

        {!collapsed && (
          <>
            <div className="ml-tabs">
              <button
                className={`ml-tab ${mainTab === 'clima' ? 'active' : ''}`}
                onClick={() => setMainTab('clima')}
                type="button"
              >
                Clima
              </button>
              <button
                className={`ml-tab ${mainTab === 'nidos' ? 'active' : ''}`}
                onClick={() => setMainTab('nidos')}
                type="button"
              >
                Nidos
              </button>
            </div>

            <div className="ml-body">
              {mainTab === 'clima' && (
                <>
                  {BADGE_ORDER.map((badge) => {
                    const active = highlightCategories.includes(badge)
                    const color = CATEGORY_COLORS[badge]
                    return (
                      <div
                        key={badge}
                        className="ml-row"
                        onClick={() => toggleHighlightCategory(badge)}
                        style={{
                          borderLeftColor: active ? color : 'transparent',
                          background: active ? `${color}18` : undefined,
                        }}
                      >
                        <span className="ml-row-icon">{BADGE_ICONS[badge]}</span>
                        <span
                          className="ml-label"
                          style={active ? { color, fontWeight: 600 } : undefined}
                        >
                          {BADGE_LABELS[badge]}
                        </span>
                        <span className="ml-row-count">{climaCounts[badge]}</span>
                      </div>
                    )
                  })}
                </>
              )}

              {mainTab === 'nidos' && NEST_ROWS.map(({ key, label, icon, color }) => {
                const active = highlightNestRow === key
                return (
                  <div
                    key={key}
                    className="ml-row"
                    onClick={() => setHighlightNestRow(key)}
                    style={{
                      borderLeftColor: active ? color : 'transparent',
                      background: active ? `${color}18` : undefined,
                    }}
                  >
                    <span className="ml-row-icon">{icon}</span>
                    <span
                      className="ml-label"
                      style={active ? { color, fontWeight: 600 } : undefined}
                    >
                      {label}
                    </span>
                    <span className="ml-row-count">{nestCounts[key]}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}

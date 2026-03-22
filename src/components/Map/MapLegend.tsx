// MapLegend.tsx — Leyenda con pestañas (Clima + Categorías)
// Tab 1: Condiciones de clima
// Tab 2: Filtros de categorías + Toggle de badges en pines

import { useState } from 'react'
import { useStore } from '../../data/useStore'
import { CONDITION_COLORS, CONDITION_LABEL, BADGE_ICONS } from '../../data/weatherService'
import type { WeatherCondition } from '../../config/weatherImages'
import type { BadgeType } from '../../data/weatherService'

const CONDITIONS: WeatherCondition[] = [
  'sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy',
]

const BADGE_LABELS: Record<BadgeType, string> = {
  stops: 'Pokestop Hub',
  gyms: 'Gym Hub',
  community: 'Comunidad Activa',
  best: 'Mejores Lugares',
}

const BADGE_ORDER: BadgeType[] = ['stops', 'gyms', 'community', 'best']

type TabType = 'clima' | 'categorias'

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('clima')
  const badgeFilter = useStore((s) => s.badgeFilter)
  const setBadgeFilter = useStore((s) => s.setBadgeFilter)
  const showBadgesOnPins = useStore((s) => s.showBadgesOnPins)
  const setShowBadgesOnPins = useStore((s) => s.setShowBadgesOnPins)

  const handleBadgeToggle = (badge: BadgeType) => {
    const isChecked = badgeFilter.includes(badge)
    if (isChecked) {
      setBadgeFilter(badgeFilter.filter(b => b !== badge))
    } else {
      setBadgeFilter([...badgeFilter, badge])
    }
  }

  return (
    <>
      <style>{`
        .ml-root {
          position: absolute;
          bottom: 28px;
          right: 12px;
          z-index: 450;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          overflow: hidden;
          min-width: 150px;
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
          gap: 8px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--border-default);
        }

        .ml-header:hover {
          background: var(--bg-tertiary);
        }

        .ml-title {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
        }

        .ml-chevron {
          font-size: 10px;
          color: var(--text-secondary);
          transition: transform 200ms ease;
        }

        .ml-chevron.open {
          transform: rotate(180deg);
        }

        /* ── Pestañas ── */
        .ml-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
          background: var(--bg-primary);
        }

        .ml-tab {
          flex: 1;
          padding: 8px 10px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          border-bottom: 2px solid transparent;
          transition: all 150ms ease;
          font-family: 'Exo 2', sans-serif;
        }

        .ml-tab:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .ml-tab.active {
          color: var(--ui-accent);
          border-bottom-color: var(--ui-accent);
        }

        .ml-body {
          padding: 8px 0;
          overflow-y: auto;
          flex: 1;
        }

        .ml-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
        }

        .ml-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ml-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .ml-checkbox-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          cursor: pointer;
          user-select: none;
          transition: background 150ms ease;
        }

        .ml-checkbox-row:hover {
          background: var(--bg-tertiary);
        }

        .ml-checkbox {
          width: 14px;
          height: 14px;
          border: 1.5px solid var(--border-default);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 150ms ease;
        }

        .ml-checkbox.checked {
          background: var(--ui-accent);
          border-color: var(--ui-accent);
        }

        .ml-checkbox.checked::after {
          content: '✓';
          color: white;
          font-size: 10px;
          font-weight: bold;
        }

        .ml-checkbox-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .ml-checkbox-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          flex: 1;
        }

        /* ── Toggle Switch ── */
        .ml-toggle-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }

        .ml-toggle-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          flex: 1;
        }

        .ml-switch {
          width: 32px;
          height: 18px;
          border-radius: 9px;
          background: var(--border-default);
          border: none;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: background 200ms ease;
          position: relative;
        }

        .ml-switch.on {
          background: var(--ui-accent);
        }

        .ml-switch-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          transition: transform 200ms ease;
          flex-shrink: 0;
        }

        .ml-switch.on .ml-switch-thumb {
          transform: translateX(14px);
        }
      `}</style>

      <div className="ml-root">
        <div className="ml-header" onClick={() => setCollapsed((c) => !c)}>
          <span className="ml-title">Leyenda</span>
          <span className={`ml-chevron ${collapsed ? '' : 'open'}`}>▼</span>
        </div>

        {!collapsed && (
          <>
            {/* ── Pestañas ── */}
            <div className="ml-tabs">
              <button
                className={`ml-tab ${activeTab === 'clima' ? 'active' : ''}`}
                onClick={() => setActiveTab('clima')}
                type="button"
              >
                Clima
              </button>
              <button
                className={`ml-tab ${activeTab === 'categorias' ? 'active' : ''}`}
                onClick={() => setActiveTab('categorias')}
                type="button"
              >
                Categorías
              </button>
            </div>

            {/* ── Body ── */}
            <div className="ml-body">
              {/* Tab: Clima */}
              {activeTab === 'clima' && (
                <>
                  {CONDITIONS.map((cond) => (
                    <div key={cond} className="ml-row">
                      <div className="ml-dot" style={{ background: CONDITION_COLORS[cond] }} />
                      <span className="ml-label">{CONDITION_LABEL[cond]}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Tab: Categorías */}
              {activeTab === 'categorias' && (
                <>
                  {/* ── Toggle Badges en Pines ── */}
                  <div className="ml-toggle-row">
                    <span className="ml-toggle-label">Iconos en pines</span>
                    <button
                      className={`ml-switch ${showBadgesOnPins ? 'on' : ''}`}
                      onClick={() => setShowBadgesOnPins(!showBadgesOnPins)}
                      type="button"
                      title={showBadgesOnPins ? 'Desactivar iconos' : 'Activar iconos'}
                    >
                      <div className="ml-switch-thumb" />
                    </button>
                  </div>

                  {/* ── Filtro de Categorías ── */}
                  {BADGE_ORDER.map((badge) => (
                    <div
                      key={badge}
                      className="ml-checkbox-row"
                      onClick={() => handleBadgeToggle(badge)}
                    >
                      <div className={`ml-checkbox ${badgeFilter.includes(badge) ? 'checked' : ''}`} />
                      <span className="ml-checkbox-icon">{BADGE_ICONS[badge]}</span>
                      <span className="ml-checkbox-label">{BADGE_LABELS[badge]}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

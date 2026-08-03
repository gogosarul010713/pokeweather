import { useStore } from '../../store/useStore'
import { calculateBadges } from '../../services/weather/weatherService'
import type { BadgeType } from '../../services/weather/weatherService'
import { useState } from 'react'
import { NEST_THRESHOLDS } from '../../config/nestThresholds'

type LegendRowKey = BadgeType | 'spawn' | 'verified'

interface LegendRow {
  key: LegendRowKey
  icon: string
  label: string
  color: string
  kind: 'clima' | 'nido'
}

const ROWS: LegendRow[] = [
  { key: 'stops',     icon: '🎯', label: 'Pokestop Hub',     color: '#58A6FF', kind: 'clima' },
  { key: 'gyms',      icon: '💪', label: 'Gym Hub',          color: '#F85149', kind: 'clima' },
  { key: 'community', icon: '👥', label: 'Comunidad Activa', color: '#3FB950', kind: 'clima' },
  { key: 'best',      icon: '🏆', label: 'Mejor Lugar',      color: '#FFD700', kind: 'clima' },
  { key: 'spawn',     icon: '🌿', label: 'Mayor Spawn',      color: '#FB923C', kind: 'nido' },
]

export default function MapLegend({ cities = [] }: { cities?: any[] }) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768)

  const highlightCategories = useStore((s) => s.highlightCategories)
  const highlightNestRow    = useStore((s) => s.highlightNestRow)
  const setHighlightCategories = useStore((s) => s.setHighlightCategories)
  const setHighlightNestRow    = useStore((s) => s.setHighlightNestRow)
  const nests = useStore((s) => s.nests)

  const activeKey: LegendRowKey | null =
    highlightCategories.length > 0 ? (highlightCategories[0] as LegendRowKey)
    : highlightNestRow ? (highlightNestRow as LegendRowKey)
    : null

  const title = activeKey ? 'Leyenda · Activo' : 'Leyenda'

  // Conteos por fila
  const badgesByCity = cities.length > 0 ? (() => {
    const calc = calculateBadges(cities)
    return new Map(cities.map(c => [c.id, calc(c)]))
  })() : new Map()

  function getCount(row: LegendRow): number {
    if (row.kind === 'clima') {
      let count = 0
      badgesByCity.forEach(badges => { if (badges.includes(row.key)) count++ })
      return count
    }
    if (row.key === 'spawn') return nests.filter(n => (n.spawnRate ?? 0) >= NEST_THRESHOLDS.spawnRate).length
    if (row.key === 'stops') return nests.filter(n => (n.stops ?? 0) >= NEST_THRESHOLDS.stops).length
    if (row.key === 'gyms')  return nests.filter(n => (n.gyms  ?? 0) >= NEST_THRESHOLDS.gyms).length
    return 0
  }

  function handleClick(row: LegendRow) {
    const isActive = activeKey === row.key
    // Limpiar ambos primero
    setHighlightCategories([])
    setHighlightNestRow(null)
    if (!isActive) {
      if (row.kind === 'clima') setHighlightCategories([row.key as string])
      else setHighlightNestRow(row.key as string)
    }
  }

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
          width: 192px;
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
          transition: color 200ms ease;
        }
        .ml-title.active { color: var(--ui-accent); }
        .ml-chevron {
          font-size: 9px;
          color: var(--text-secondary);
          transition: transform 200ms ease;
        }
        .ml-chevron.open { transform: rotate(180deg); }
        .ml-body {
          overflow-y: auto;
          flex: 1;
          padding: 4px 0;
        }
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
        .ml-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          flex: 1;
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
        <div className="ml-header" onClick={() => setCollapsed(c => !c)}>
          <span className={`ml-title${activeKey ? ' active' : ''}`}>{title}</span>
          <span className={`ml-chevron${collapsed ? '' : ' open'}`}>&#9660;</span>
        </div>

        {!collapsed && (
          <div className="ml-body">
            {ROWS.map(row => {
              const active = activeKey === row.key
              const count = getCount(row)
              return (
                <div
                  key={row.key}
                  className="ml-row"
                  onClick={() => handleClick(row)}
                  style={{
                    borderLeftColor: active ? row.color : 'transparent',
                    background: active ? `${row.color}18` : undefined,
                  }}
                >
                  <span className="ml-row-icon">{row.icon}</span>
                  <span
                    className="ml-label"
                    style={active ? { color: row.color, fontWeight: 600 } : undefined}
                  >
                    {row.label}
                  </span>
                  <span className="ml-row-count">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

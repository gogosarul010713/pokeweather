import { useStore } from '../../store/useStore'
import type { City } from '../../store/useStore'
import { calculateBadges } from '../../services/weather/weatherService'
import type { BadgeType } from '../../services/weather/weatherService'
import { useState, useMemo } from 'react'

type LegendRowKey = BadgeType | 'verified' | 'spawn'

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
  { key: 'spawn',     icon: '🌿', label: 'Mayor Spawn',      color: '#FB923C', kind: 'clima' },
]

export default function MapLegend({ cities = [] }: { cities?: City[] }) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768)

  const highlightCategories = useStore((s) => s.highlightCategories)
  const setHighlightCategories = useStore((s) => s.setHighlightCategories)
  const setHighlightNestRow = useStore((s) => s.setHighlightNestRow)
  const nests = useStore((s) => s.nests)

  const activeKeys = new Set(highlightCategories as LegendRowKey[])
  const title = activeKeys.size > 0 ? 'Leyenda · Activo' : 'Leyenda'

  // Badges por separado: ciudades entre ciudades, nidos entre nidos
  const badgesById = useMemo(() => {
    const map = new Map<string, string[]>()
    if (cities.length > 0) {
      const cityPool = cities.map((c) => ({ id: c.id, density: c.density ?? 0, gyms: c.gyms, rating: c.rating }))
      const calcCity = calculateBadges(cityPool)
      cityPool.forEach((p) => map.set(p.id, calcCity(p)))
    }
    if (nests.length > 0) {
      const nestPool = nests.map(n => ({ id: n.id, density: n.stops ?? 0, gyms: n.gyms ?? 0, rating: 0, spawnRate: n.spawnRate }))
      const calcNest = calculateBadges(nestPool)
      nestPool.forEach(p => map.set(p.id, calcNest(p)))
    }
    return map
  }, [cities, nests])

  function getCount(row: LegendRow): number {
    let count = 0
    badgesById.forEach(badges => { if (badges.includes(row.key)) count++ })
    return count
  }

  function handleClick(row: LegendRow) {
    const next = activeKeys.has(row.key)
      ? highlightCategories.filter(k => k !== row.key)
      : [...highlightCategories, row.key as string]
    setHighlightCategories(next)
    setHighlightNestRow(null)
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
        .ml-reset-chip {
          font-family: 'Exo 2', sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: var(--ui-accent);
          background: rgba(var(--ui-accent-rgb), 0.12);
          border: 1px solid rgba(var(--ui-accent-rgb), 0.3);
          border-radius: 10px;
          padding: 1px 6px;
          cursor: pointer;
          user-select: none;
          transition: background 150ms ease;
          white-space: nowrap;
        }
        .ml-reset-chip:hover { background: rgba(var(--ui-accent-rgb), 0.22); }
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
        .ml-row:hover { background: rgba(var(--ui-accent-rgb), 0.08); }
        .ml-row-active { background: rgba(var(--ui-accent-rgb), 0.06); }
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
          <span className={`ml-title${activeKeys.size > 0 ? ' active' : ''}`}>{title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {activeKeys.size > 0 && (
              <span
                className="ml-reset-chip"
                onClick={e => { e.stopPropagation(); setHighlightCategories([]); setHighlightNestRow(null) }}
              >
                Top {activeKeys.size} ×
              </span>
            )}
            <span className={`ml-chevron${collapsed ? '' : ' open'}`}>&#9660;</span>
          </div>
        </div>

        {!collapsed && (
          <div className="ml-body">
            {ROWS.map(row => {
              const active = activeKeys.has(row.key)
              const count = getCount(row)
              return (
                <div
                  key={row.key}
                  className={`ml-row${active ? ' ml-row-active' : ''}`}
                  onClick={() => handleClick(row)}
                  style={{
                    borderLeftColor: active ? row.color : 'transparent',
                  }}
                >
                  <span className="ml-row-icon">{row.icon}</span>
                  <span
                    className="ml-label"
                    style={active ? { color: row.color, fontWeight: 600 } : { color: 'var(--text-primary)' }}
                  >
                    {row.label}
                  </span>
                  <span className="ml-row-count" style={{ color: 'var(--text-primary)' }}>{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

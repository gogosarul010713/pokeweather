import { useState } from 'react'
import { useStore } from '../../store/useStore'
import Brand from './Brand'
import ThemeToggle from './ThemeToggle'
import SyncBadge from '../UI/SyncBadge'
import FilterPanel from './FilterPanel'
import FilterPanelModal from '../UI/FilterPanelModal'
import TestingButton from './TestingButton'
import TestingTools from '../TestingTools/TestingTools'
import type { City } from '../../store/useStore'

interface HeaderProps {
  cities?: City[]
}

export default function Header({ cities = [] }: HeaderProps) {
  const [isTestingOpen, setIsTestingOpen] = useState(false)
  const isFilterPanelOpen = useStore((s) => s.isFilterPanelOpen)
  const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)
  const conditionFilter = useStore((s) => s.conditionFilter)

  return (
    <>
      <style>{`
        .hd-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 1001;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .hd-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* Filter Button (mobile only) */
        .hd-filter-btn {
          display: none;
          position: relative;
          width: 36px;
          height: 36px;
          background: rgba(88, 166, 255, 0.1);
          border: 1px solid rgba(88, 166, 255, 0.3);
          border-radius: 6px;
          color: var(--ui-accent);
          cursor: pointer;
          font-size: 16px;
          transition: all 150ms ease;
        }

        .hd-filter-btn:hover {
          background: rgba(88, 166, 255, 0.2);
          border-color: var(--ui-accent);
        }

        .hd-filter-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          background: var(--ui-error);
          color: white;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mobile: show filter button, hide FilterPanel */
        @media (max-width: 767px) {
          .hd-filter-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .hd-filter-panel {
            display: none;
          }
        }
      `}</style>

      <header className="hd-root">
        {/* Izquierda */}
        <Brand />

        {/* Centro — filtros + búsqueda (desktop/tablet only) */}
        <div className="hd-filter-panel">
          <FilterPanel />
        </div>

        {/* Derecha — testing + sync + tema + filter button */}
        <div className="hd-right">
          {/* Filter button (mobile only) */}
          <button
            className="hd-filter-btn"
            onClick={() => setIsFilterPanelOpen(true)}
            title="Filtros"
            type="button"
          >
            ⚙️
            {conditionFilter.length > 0 && (
              <span className="hd-filter-badge">{conditionFilter.length}</span>
            )}
          </button>

          <TestingButton onClick={() => setIsTestingOpen(true)} />
          <SyncBadge />
          <ThemeToggle />
        </div>
      </header>

      {/* Filter Panel Modal (mobile only) */}
      <FilterPanelModal
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
      />

      {/* Testing Tools Drawer */}
      <TestingTools cities={cities} isOpen={isTestingOpen} onClose={() => setIsTestingOpen(false)} />
    </>
  )
}

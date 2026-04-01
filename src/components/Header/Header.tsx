import { useState } from 'react'
import { useStore } from '../../store/useStore'
import Brand from './Brand'
import ThemeToggle from './ThemeToggle'
import SyncBadge from '../UI/SyncBadge'
import FilterPanel from './FilterPanel'
import TestingButton from './TestingButton'
import TestingTools from '../TestingTools/TestingTools'
import type { City } from '../../store/useStore'

interface HeaderProps {
  cities?: City[]
}

export default function Header({ cities = [] }: HeaderProps) {
  const [isTestingOpen, setIsTestingOpen] = useState(false)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)

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

        .hd-menu-toggle {
          display: none;
          width: 32px;
          height: 32px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-primary);
          font-size: 18px;
          align-items: center;
          justify-content: center;
          transition: background 200ms ease;
        }

        .hd-menu-toggle:hover {
          background: var(--bg-tertiary);
        }

        .hd-menu-toggle:active {
          background: var(--bg-overlay);
        }

        .hd-filter-btn {
          display: none;
          width: 32px;
          height: 32px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-primary);
          font-size: 16px;
          align-items: center;
          justify-content: center;
          transition: background 200ms ease;
        }

        .hd-filter-btn:hover {
          background: var(--bg-tertiary);
        }

        .hd-filter-btn:active {
          background: var(--bg-overlay);
        }
      `}</style>

      <header className="hd-root">
        {/* Izquierda */}
        <Brand />

        {/* Centro — filtros + búsqueda */}
        <FilterPanel />

        {/* Filtros button — visible en mobile <768px */}
        <button
          className="hd-filter-btn"
          onClick={() => setIsFilterPanelOpen(true)}
          aria-label="Open filters panel"
          title="Filtros"
        >
          ⚙️
        </button>

        {/* Menu toggle (visible en tablet) */}
        <button
          className="hd-menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar menu"
          title="Toggle menu"
        >
          ≡
        </button>

        {/* Derecha — testing + sync + tema */}
        <div className="hd-right">
          <TestingButton onClick={() => setIsTestingOpen(true)} />
          <SyncBadge />
          <ThemeToggle />
        </div>
      </header>

      {/* Testing Tools Drawer */}
      <TestingTools cities={cities} isOpen={isTestingOpen} onClose={() => setIsTestingOpen(false)} />
    </>
  )
}

import { useState } from 'react'
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
      `}</style>

      <header className="hd-root">
        {/* Izquierda */}
        <Brand />

        {/* Centro — filtros + búsqueda */}
        <FilterPanel />

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

import Brand from './Brand'
import ThemeToggle from './ThemeToggle'
import SyncBadge from '../UI/SyncBadge'
import FilterPanel from './FilterPanel'

export default function Header() {
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

        {/* Derecha — sync + tema */}
        <div className="hd-right">
          <SyncBadge />
          <ThemeToggle />
        </div>
      </header>
    </>
  )
}

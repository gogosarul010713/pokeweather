import { useStore, type City } from '../../store/useStore'
import LocationFeed from './LocationFeed'
import SidebarToggle from './SidebarToggle'
import SidebarFilterPanel from './SidebarFilterPanel'

interface SidebarProps {
  cities: City[]
}

export default function Sidebar({ cities }: SidebarProps) {
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)

  return (
    <>
      <style>{`
        .sb-wrapper {
          position: relative;
          height: 100%;
        }

        .sb-root {
          width: 280px;
          min-width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-default);
          overflow: hidden;
          height: 100%;
          transition: width 300ms ease, min-width 300ms ease;
          position: relative;
          z-index: 20;
        }

        .sb-root.sb-collapsed {
          width: 0;
          min-width: 0;
        }

        /* ── Content ── */
        .sb-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sb-feed-badge {
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 400;
          color: var(--text-muted);
          flex-shrink: 0;
          white-space: nowrap;
        }

        .sb-detail-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font: Exo 2 400 13px;
          padding: 24px;
          text-align: center;
        }

        .sb-detail-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 8px;
        }

        /* ── SidebarToggle (fixed, below map zoom controls) ── */
        .sb-toggle-wrapper {
          position: fixed;
          top: 130px;
          left: 12px;
          z-index: 400;
          opacity: 1;
          pointer-events: auto;
          transition: opacity 300ms ease;
        }

        /* Fade out cuando sidebar está colapsado, pero sigue siendo interactivo */
        .sb-toggle-wrapper.sb-collapsed {
          opacity: 0.4;
        }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .sb-root {
            display: none;
          }

          .sb-toggle-wrapper {
            display: none;
          }
        }
      `}</style>

      <div className="sb-wrapper">
        {/* ── Sidebar Content ── */}
        <aside className={`sb-root ${!sidebarOpen ? 'sb-collapsed' : ''}`}>
        {/* ── Content ── */}
        <div className="sb-content" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SidebarFilterPanel />
            <LocationFeed cities={cities} />
          </div>
        </div>
      </aside>

        {/* ── Toggle Button (después del sidebar, en hermano position) ── */}
        <div className={`sb-toggle-wrapper ${sidebarOpen ? 'sb-expanded' : 'sb-collapsed'}`}>
          <SidebarToggle
            isExpanded={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
      </div>
    </>
  )
}

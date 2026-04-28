import { useStore, type City } from '../../store/useStore'
import LocationFeed from './LocationFeed'
import TabControl from './TabControl'
import Overlay from '../UI/Overlay'

interface SidebarProps {
  cities: City[]
}

export default function Sidebar({ cities }: SidebarProps) {
  const activeTab = useStore((s) => s.activeTab)
  const sidebarOpen = useStore((s) => s.sidebarOpen)

  return (
    <>
      <style>{`
        .sb-root {
          width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-default);
          overflow: hidden;
          height: 100%;
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

        /* ── TABLET: Colapsable sidebar ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sb-root {
            width: 280px;
            transition: width 300ms ease, transform 300ms ease;
          }

          .sb-root.sb-collapsed {
            width: 44px;
          }

          .sb-root.sb-collapsed .sb-content {
            display: none;
          }
        }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .sb-root {
            display: none;
          }
        }
      `}</style>

      <aside className={`sb-root ${!sidebarOpen ? 'sb-collapsed' : ''}`}>
        {/* ── Content ── */}
        <div className="sb-content" style={{ position: 'relative' }}>
          {/* TabControl: Clima / Nidos / Todo */}
          <TabControl />

          {/* Content Wrapper — posición relativa para Overlay */}
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Overlay cuando activeTab = 'todo' — bloquea solo contenido (bajo TabControl) */}
            <Overlay
              isActive={activeTab === 'todo'}
              message="Activa Clima o Nidos para explorar la lista y mostrar los filtros"
              zIndex={100}
            />

            {/* LocationFeed — lista de ciudades */}
            {activeTab === 'clima' && (
              <LocationFeed cities={cities} />
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

import { useStore, type City } from '../../store/useStore'
import LocationFeed from './LocationFeed'

interface SidebarProps {
  cities: City[]
}

export default function Sidebar({ cities }: SidebarProps) {
  const sidebarMode = useStore((s) => s.sidebarMode)
  const setSidebarMode = useStore((s) => s.setSidebarMode)
  const selectedCity = useStore((s) => s.selectedCity)
  const sidebarOpen = useStore((s) => s.sidebarOpen)

  return (
    <>
      <style>{`
        .sb-root {
          width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: row;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-default);
          overflow: hidden;
          height: 100%;
        }

        /* ── MenuStrip ── */
        .sb-menu-strip {
          width: 44px;
          flex-shrink: 0;
          background: var(--bg-primary);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 12px;
          gap: 4px;
        }

        .sb-menu-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.12s, background 0.12s;
          position: relative;
          font-size: 18px;
        }

        .sb-menu-btn:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .sb-menu-btn.sb-active {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }

        /* ── Content ── */
        .sb-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
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
        {/* ── MenuStrip — 3 modos ── */}
        <div className="sb-menu-strip">
          {/* Lista */}
          <button
            className={`sb-menu-btn ${sidebarMode === 'list' ? 'sb-active' : ''}`}
            onClick={() => setSidebarMode('list')}
            title="Lista de ciudades"
            type="button"
          >
            📋
          </button>

          {/* Detalle */}
          <button
            className={`sb-menu-btn ${sidebarMode === 'detail' ? 'sb-active' : ''}`}
            onClick={() => setSidebarMode('detail')}
            title="Detalle de ciudad"
            type="button"
          >
            📍
          </button>

          {/* Favoritos */}
          <button
            className={`sb-menu-btn ${sidebarMode === 'favorites' ? 'sb-active' : ''}`}
            onClick={() => setSidebarMode('favorites')}
            title="Ciudades favoritas"
            type="button"
          >
            ⭐
          </button>
        </div>

        {/* ── Content ── */}
        <div className="sb-content">
          {/* Modo Lista / Favoritos: LocationFeed (hidden in mobile, visible in tablet+) */}
          {(sidebarMode === 'list' || sidebarMode === 'favorites') && (
            <LocationFeed cities={cities} />
          )}

          {/* Modo Detalle: Placeholder */}
          {sidebarMode === 'detail' && (
            <div className="sb-detail-placeholder">
              <span className="sb-detail-icon">📍</span>
              {selectedCity ? (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {selectedCity.name}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    (Modal se abre sobre el mapa)
                  </div>
                </div>
              ) : (
                <div>Selecciona una ciudad para verdetalles</div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

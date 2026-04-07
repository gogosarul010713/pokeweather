import { useState } from 'react'
import { useStore } from '../../store/useStore'
import Brand from './Brand'
import SearchInput from './SearchInput'
import ThemeToggle from './ThemeToggle'
import SyncBadge from '../UI/SyncBadge'
import FilterPanel from './FilterPanel'
import FilterPanelModal from '../UI/FilterPanelModal'
import TestingButton from './TestingButton'
import TestingTools from '../TestingTools/TestingTools'
import type { City } from '../../store/useStore'

interface HeaderProps {
  cities?: City[]
  onRefresh?: () => void
}

export default function Header({ cities = [], onRefresh }: HeaderProps) {
  const [isTestingOpen, setIsTestingOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    if (refreshing || !onRefresh) return
    setRefreshing(true)
    onRefresh()
    setTimeout(() => setRefreshing(false), 1500)
  }
  const isFilterPanelOpen = useStore((s) => s.isFilterPanelOpen)
  const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)

  return (
    <>
      <style>{`
        /* Header: columna para poder apilar filas */
        .hd-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        /* Fila principal: Brand + FilterPanel/spacer + Right icons */
        .hd-row1 {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          flex: 1;
        }

        /* Fila de búsqueda (solo mobile) — oculta por defecto */
        .hd-center {
          display: none;
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

        /* Sidebar toggle button (tablet only) */
        .hd-sidebar-toggle {
          display: none;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid var(--border-default);
          border-radius: 6px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 16px;
          transition: all 150ms ease;
          align-items: center;
          justify-content: center;
        }

        .hd-sidebar-toggle:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        /* Tablet: show sidebar toggle */
        @media (min-width: 768px) and (max-width: 1023px) {
          .hd-sidebar-toggle {
            display: flex;
          }
        }

        /* ── MOBILE (<768px): Header de 2 filas ── */
        @media (max-width: 767px) {
          .hd-root {
            height: 96px;
          }

          /* Fila 1: Brand (izq) + Right icons (der) */
          .hd-row1 {
            flex: 0 0 52px;
            padding: 0 12px;
            gap: 8px;
          }

          /* Spacer entre Brand y hd-right */
          .hd-filter-panel {
            display: none;
          }

          .hd-right {
            margin-left: auto;
          }

          /* Fila 2: SearchInput full-width */
          .hd-center {
            display: flex;
            align-items: center;
            padding: 0 12px 10px;
          }

          .hd-center .fb-search {
            flex: 1;
            width: 100%;
          }

          .hd-center .fb-search-input {
            width: 100%;
            min-width: unset;
            max-width: none;
            height: 30px;
            font-size: 13px;
            padding: 0 30px 0 30px;
          }

          .hd-center .fb-search-icon {
            color: var(--text-secondary);
          }

          .hd-filter-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .hd-sidebar-toggle {
            display: none;
          }
        }

        /* TABLET: FilterPanel más compacto */
        @media (min-width: 768px) and (max-width: 1023px) {
          .hd-row1 {
            gap: 6px;
          }
        }

        /* Refresh button */
        .hd-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid var(--border-default);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms ease;
          flex-shrink: 0;
        }

        .hd-refresh-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        .hd-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hd-refresh-btn svg {
          transition: transform 150ms ease;
        }

        .hd-refresh-btn.spinning svg {
          animation: hd-refresh-spin 0.8s linear infinite;
        }

        @keyframes hd-refresh-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <header className="hd-root">
        {/* ── Fila 1: Brand + FilterPanel + Iconos derecha ── */}
        <div className="hd-row1">
          <Brand />

          {/* Desktop/Tablet: filtros + búsqueda */}
          <div className="hd-filter-panel">
            <FilterPanel />
          </div>

          {/* Iconos derecha */}
          <div className="hd-right">
            <button
              className="hd-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
              type="button"
            >
              {sidebarOpen ? '☰' : '›'}
            </button>

            <button
              className="hd-filter-btn"
              onClick={() => setIsFilterPanelOpen(true)}
              title="Filtros"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <circle cx="8" cy="6" r="2" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <circle cx="16" cy="12" r="2" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="12" cy="18" r="2" />
              </svg>
              {conditionFilter.length > 0 && (
                <span className="hd-filter-badge">{conditionFilter.length}</span>
              )}
            </button>

            {/* Refresh button */}
            {onRefresh && (
              <button
                className={`hd-refresh-btn${refreshing ? ' spinning' : ''}`}
                onClick={handleRefresh}
                disabled={refreshing}
                title="Actualizar datos"
                type="button"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            <TestingButton onClick={() => setIsTestingOpen(true)} />
            <SyncBadge />
            <ThemeToggle />
          </div>
        </div>

        {/* ── Fila 2: SearchInput (solo mobile) ── */}
        <div className="hd-center">
          <SearchInput />
        </div>
      </header>

      <FilterPanelModal
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
      />

      <TestingTools cities={cities} isOpen={isTestingOpen} onClose={() => setIsTestingOpen(false)} />
    </>
  )
}

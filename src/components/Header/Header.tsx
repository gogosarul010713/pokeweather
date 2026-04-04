import { useState, useRef } from 'react'
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

const PTR_THRESHOLD = 60  // px de arrastre para activar refresh

export default function Header({ cities = [], onRefresh }: HeaderProps) {
  const [isTestingOpen, setIsTestingOpen] = useState(false)
  const [ptrState, setPtrState] = useState<'idle' | 'pulling' | 'refreshing'>('idle')
  const [ptrDelta, setPtrDelta] = useState(0)
  const touchStartY = useRef(0)
  const isFilterPanelOpen = useStore((s) => s.isFilterPanelOpen)
  const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onRefresh) return
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0) {
      setPtrState('pulling')
      setPtrDelta(Math.min(delta, PTR_THRESHOLD + 10))
    }
  }

  const handleTouchEnd = () => {
    if (!onRefresh || ptrState !== 'pulling') return
    if (ptrDelta >= PTR_THRESHOLD) {
      setPtrState('refreshing')
      setPtrDelta(0)
      onRefresh()
      setTimeout(() => setPtrState('idle'), 1500)
    } else {
      setPtrState('idle')
      setPtrDelta(0)
    }
  }

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

        /* Pull-to-refresh indicator (mobile only) */
        .hd-ptr {
          display: none;
        }

        @media (max-width: 767px) {
          .hd-ptr {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 0;
            overflow: hidden;
            transition: height 150ms ease;
            color: var(--text-secondary);
            font-family: 'Exo 2', sans-serif;
            font-size: 11px;
            gap: 6px;
          }

          .hd-ptr.visible {
            height: 24px;
          }

          .hd-ptr-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid var(--border-default);
            border-top-color: var(--ui-accent);
            border-radius: 50%;
            animation: hd-spin 0.7s linear infinite;
          }

          @keyframes hd-spin {
            to { transform: rotate(360deg); }
          }
        }
      `}</style>

      <header
        className="hd-root"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        <div className={`hd-ptr${ptrState !== 'idle' ? ' visible' : ''}`}>
          {ptrState === 'refreshing' ? (
            <><div className="hd-ptr-spinner" /> Actualizando...</>
          ) : (
            <span>{ptrDelta >= PTR_THRESHOLD ? '↑ Suelta para actualizar' : '↓ Desliza para actualizar'}</span>
          )}
        </div>

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
              🔍
              {conditionFilter.length > 0 && (
                <span className="hd-filter-badge">{conditionFilter.length}</span>
              )}
            </button>

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

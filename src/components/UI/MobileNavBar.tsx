interface MobileNavBarProps {
  activeTab: 'map' | 'list'
  onTabChange: (tab: 'map' | 'list') => void
  filterCount: number
  onFiltersOpen: () => void
}

export default function MobileNavBar({ activeTab, onTabChange, filterCount, onFiltersOpen }: MobileNavBarProps) {
  return (
    <>
      <style>{`
        .mnb-root {
          display: none;
        }

        @media (max-width: 767px) {
          .mnb-root {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-default);
            z-index: 1000;
            flex-direction: row;
          }

          .mnb-tab {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--text-muted);
            font-family: 'Exo 2', sans-serif;
            font-size: 10px;
            font-weight: 500;
            transition: color 150ms ease;
            position: relative;
            padding: 0;
          }

          .mnb-tab.active {
            color: var(--ui-accent);
          }

          .mnb-tab-icon {
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mnb-tab-label {
            line-height: 1;
          }

          /* Active indicator line at top */
          .mnb-tab.active::before {
            content: '';
            position: absolute;
            top: 0;
            left: 20%;
            right: 20%;
            height: 2px;
            background: var(--ui-accent);
            border-radius: 0 0 2px 2px;
          }

          /* Filter badge */
          .mnb-filter-badge {
            position: absolute;
            top: 6px;
            right: calc(50% - 18px);
            background: var(--ui-accent);
            color: var(--bg-primary);
            border-radius: 8px;
            font-size: 9px;
            font-weight: 700;
            min-width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 3px;
          }
        }
      `}</style>

      <nav className="mnb-root">
        {/* Tab Mapa */}
        <button
          className={`mnb-tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => onTabChange('map')}
          type="button"
        >
          <span className="mnb-tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <line x1="9" y1="3" x2="9" y2="18" stroke="currentColor" strokeWidth="1.8"/>
              <line x1="15" y1="6" x2="15" y2="21" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
          </span>
          <span className="mnb-tab-label">Mapa</span>
        </button>

        {/* Tab Lista */}
        <button
          className={`mnb-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => onTabChange('list')}
          type="button"
        >
          <span className="mnb-tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="3.5" cy="6" r="1.2" fill="currentColor"/>
              <circle cx="3.5" cy="12" r="1.2" fill="currentColor"/>
              <circle cx="3.5" cy="18" r="1.2" fill="currentColor"/>
            </svg>
          </span>
          <span className="mnb-tab-label">Lista</span>
        </button>

        {/* Tab Filtros */}
        <button
          className="mnb-tab"
          onClick={onFiltersOpen}
          type="button"
        >
          <span className="mnb-tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="10" y1="18" x2="14" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="mnb-tab-label">Filtros</span>
          {filterCount > 0 && (
            <span className="mnb-filter-badge">{filterCount}</span>
          )}
        </button>
      </nav>
    </>
  )
}

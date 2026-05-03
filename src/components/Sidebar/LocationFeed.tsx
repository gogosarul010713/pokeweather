import { useMemo, useEffect, useRef } from 'react'
import { useStore, type City } from '../../store/useStore'
import { calculateBadges } from '../../services/weather/weatherService'
import LocationCard from './LocationCard'

interface LocationFeedProps {
  cities: City[]
}

export default function LocationFeed({ cities }: LocationFeedProps) {
  const selectedCity = useStore((s) => s.selectedCity)
  const sidebarMode = useStore((s) => s.sidebarMode)
  const favorites = useStore((s) => s.favorites)
  const badgeFilter = useStore((s) => s.badgeFilter)
  const loadingStatus = useStore((s) => s.loadingStatus)
  const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter = useStore((s) => s.typeFilter)
  const regionFilter = useStore((s) => s.regionFilter)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const activeFilterCount =
    (regionFilter !== 'todas' ? 1 : 0) +
    conditionFilter.length +
    typeFilter.length

  // Calcular badges por ciudad
  const badgesByCity = useMemo(() => {
    if (cities.length === 0) return new Map()
    const badgeCalculator = calculateBadges(cities)
    const badges = new Map<string, string[]>()
    cities.forEach(city => {
      badges.set(city.id, badgeCalculator(city))
    })
    return badges
  }, [cities])

  // Filtrar ciudades según el modo (los filtros de header ya están aplicados en App.tsx)
  const displayedCities = useMemo(() => {
    let result = [...cities]

    // Filtrar por modo (list vs favorites)
    if (sidebarMode === 'favorites') {
      result = result.filter((city) => favorites.includes(city.id))
    }

    // Filtrar por badges seleccionados (OR logic) — secundario al filtrado de header
    // Solo filtra si el usuario ha modificado el filtro respecto al default (los 4 badges).
    // Default = todos los badges seleccionados = no debe ocultar ciudades sin badge calculado.
    const ALL_BADGES = ['stops', 'gyms', 'community', 'best']
    const isDefaultFilter = badgeFilter.length === ALL_BADGES.length &&
      ALL_BADGES.every(b => badgeFilter.includes(b))
    if (badgeFilter.length > 0 && !isDefaultFilter) {
      result = result.filter(city => {
        const cityBadges = badgesByCity.get(city.id) || []
        return cityBadges.some((badge: string) => badgeFilter.includes(badge))
      })
    }

    console.log('🔬 [LocationFeed] displayedCities:', {
      input: cities.length,
      output: result.length,
      sidebarMode,
      badgeFilter,
      isDefaultFilter,
      sampleBadges: cities[0] ? badgesByCity.get(cities[0].id) : null,
    })

    return result
  }, [cities, sidebarMode, favorites, badgeFilter, badgesByCity])

  const cityCount = displayedCities.length

  // Auto-scroll al LocationCard activo
  useEffect(() => {
    if (!selectedCity || !scrollContainerRef.current) return

    const activeCard = scrollContainerRef.current.querySelector(
      `[data-city-id="${selectedCity.id}"]`
    ) as HTMLElement | null

    if (activeCard) {
      activeCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [selectedCity?.id])

  return (
    <>
      <style>{`
        .lf-root {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;  /* Critical: allows flex:1 with children that have content */
          background: var(--bg-primary);
          border-top: 1px solid var(--border-default);
          overflow: hidden;
        }

        .lf-header {
          display: flex;
          align-items: center;
          padding: 0 12px;
          height: 40px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
          gap: 8px;
        }

        .lf-header-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          flex: 1;
        }

        /* Botones de acción — solo mobile */
        .lf-actions {
          display: none;
        }

        @media (max-width: 767px) {
          .lf-actions {
            display: flex;
            align-items: center;
            gap: 6px;
          }
        }

        .lf-action-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms ease;
          flex-shrink: 0;
        }

        .lf-action-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        .lf-action-btn.active {
          background: rgba(88, 166, 255, 0.12);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .lf-action-btn.spinning svg {
          animation: lf-spin 0.8s linear infinite;
        }

        @keyframes lf-spin {
          to { transform: rotate(360deg); }
        }

        .lf-action-badge {
          position: absolute;
          top: -5px;
          right: -5px;
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
          padding: 0 2px;
          pointer-events: none;
        }

        /* Sort mini-dropdown */
        .lf-sort-popup {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          z-index: 600;
          min-width: 150px;
          overflow: hidden;
        }

        .lf-sort-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          font-family: 'Exo 2', sans-serif;
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
          transition: background 100ms ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }

        .lf-sort-option:hover {
          background: var(--bg-tertiary);
        }

        .lf-sort-option.active {
          color: var(--ui-accent);
          font-weight: 600;
          background: rgba(88, 166, 255, 0.08);
        }

        .lf-sort-dir {
          margin-left: auto;
          font-size: 11px;
          opacity: 0.7;
        }

        .lf-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
        }

        .lf-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: var(--text-secondary);
          font: Exo 2 400 13px;
        }

        .lf-empty-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        /* Scrollbar styling */
        .lf-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .lf-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .lf-scroll::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 2px;
        }

        .lf-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--border-strong);
        }
      `}</style>

      <div className="lf-root">
        {/* Header con contador + acciones mobile */}
        <div className="lf-header">
          <span className="lf-header-label">
            {sidebarMode === 'favorites' ? '⭐ Favoritos' : '📋 Ciudades'} • {cityCount}
          </span>

          <div className="lf-actions">
            {/* Filtros */}
            <button
              className={`lf-action-btn${activeFilterCount > 0 ? ' active' : ''}`}
              onClick={() => setIsFilterPanelOpen(true)}
              title="Filtros"
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <circle cx="8" cy="6" r="2" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <circle cx="16" cy="12" r="2" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="12" cy="18" r="2" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="lf-action-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Lista o mensaje vacío */}
        {cityCount > 0 ? (
          <div className={`lf-scroll ${loadingStatus === 'loading' ? 'fade-refresh' : ''}`} ref={scrollContainerRef}>
            {displayedCities.map((city) => (
              <div key={city.id} data-city-id={city.id}>
                <LocationCard
                  city={city}
                  isActive={selectedCity?.id === city.id}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="lf-empty">
            <div>
              <div className="lf-empty-icon">
                {sidebarMode === 'favorites' ? '🤍' : '🔍'}
              </div>
              <div>
                {sidebarMode === 'favorites'
                  ? 'Sin favoritos aún'
                  : 'Sin resultados'}
              </div>
              {sidebarMode === 'favorites' && (
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
                  Marca ciudades como favoritas para verlas aquí
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

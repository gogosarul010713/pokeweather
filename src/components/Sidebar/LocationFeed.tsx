import { useMemo, useEffect, useRef } from 'react'
import { useStore, type City } from '../../store/useStore'
import { calculateBadges } from '../../services/weather/weatherService'
import LocationCard from './LocationCard'
import NestCard from './NestCard'

interface LocationFeedProps {
  cities: City[]
}

export default function LocationFeed({ cities }: LocationFeedProps) {
  const selectedCity         = useStore((s) => s.selectedCity)
  const selectedNest         = useStore((s) => s.selectedNest)
  const sidebarMode          = useStore((s) => s.sidebarMode)
  const favorites            = useStore((s) => s.favorites)
  const badgeFilter          = useStore((s) => s.badgeFilter)
  const loadingStatus        = useStore((s) => s.loadingStatus)
  const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)
  const conditionFilter      = useStore((s) => s.conditionFilter)
  const typeFilter           = useStore((s) => s.typeFilter)
  const regionFilter         = useStore((s) => s.regionFilter)
  const activeLayers         = useStore((s) => s.activeLayers)
  const nests                = useStore((s) => s.nests)
  const nestTypeFilter       = useStore((s) => s.nestTypeFilter)
  const scrollContainerRef   = useRef<HTMLDivElement>(null)

  const activeFilterCount =
    (regionFilter !== 'todas' ? 1 : 0) +
    conditionFilter.length +
    typeFilter.length

  const badgesByCity = useMemo(() => {
    if (cities.length === 0) return new Map()
    const calc = calculateBadges(cities)
    const badges = new Map<string, string[]>()
    cities.forEach(city => badges.set(city.id, calc(city)))
    return badges
  }, [cities])

  const displayedCities = useMemo(() => {
    if (!activeLayers.clima) return []
    let result = [...cities]
    if (sidebarMode === 'favorites') {
      result = result.filter((c) => favorites.includes(c.id))
    }
    if (badgeFilter.length > 0) {
      result = result.filter(city => {
        const cityBadges = badgesByCity.get(city.id) || []
        return cityBadges.some((b: string) => badgeFilter.includes(b))
      })
    }
    return result
  }, [cities, sidebarMode, favorites, badgeFilter, badgesByCity, activeLayers.clima])

  const displayedNests = useMemo(() => {
    if (!activeLayers.nidos) return []
    if (nestTypeFilter.length === 0) return nests
    return nests.filter((nest) => {
      const types = Array.isArray(nest.pokemonType) ? nest.pokemonType : []
      return types.some((t: string) => nestTypeFilter.includes(t))
    })
  }, [nests, nestTypeFilter, activeLayers.nidos])

  const hasAny = activeLayers.clima || activeLayers.nidos
  const totalCount = displayedCities.length + displayedNests.length

  // Auto-scroll al LocationCard activo
  useEffect(() => {
    if (!selectedCity || !scrollContainerRef.current) return
    const activeCard = scrollContainerRef.current.querySelector(
      `[data-city-id="${selectedCity.id}"]`
    ) as HTMLElement | null
    if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedCity?.id])

  return (
    <>
      <style>{`
        .lf-root {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-default);
          overflow: hidden;
        }

        .lf-header {
          display: flex;
          align-items: center;
          padding: 0 8px;
          height: 28px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
          gap: 6px;
        }

        .lf-header-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: var(--text-secondary);
          flex: 1;
        }

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
          font-family: 'Exo 2', sans-serif;
          font-size: 13px;
        }

        .lf-section-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 0 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .lf-section-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .lf-scroll::-webkit-scrollbar { width: 4px; }
        .lf-scroll::-webkit-scrollbar-track { background: transparent; }
        .lf-scroll::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
        .lf-scroll::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
      `}</style>

      <div className="lf-root">
        <div className="lf-header">
          <span className="lf-header-label">
            {sidebarMode === 'favorites' ? 'Favoritos' : 'Lugares'} • {totalCount}
          </span>

          <div className="lf-actions">
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

        {!hasAny ? (
          <div className="lf-empty">
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺</div>
              <div>Activa una capa para ver resultados</div>
            </div>
          </div>
        ) : totalCount === 0 ? (
          <div className="lf-empty">
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div>Sin resultados</div>
            </div>
          </div>
        ) : (
          <div
            className={`lf-scroll${loadingStatus === 'loading' ? ' fade-refresh' : ''}`}
            ref={scrollContainerRef}
          >
            {activeLayers.clima && displayedCities.length > 0 && (
              <>
                {activeLayers.nidos && (
                  <div className="lf-section-label" style={{ color: '#3b82f6' }}>
                    <span className="lf-section-dot" style={{ background: '#3b82f6' }} />
                    Clima
                  </div>
                )}
                {displayedCities.map((city) => (
                  <div key={city.id} data-city-id={city.id}>
                    <LocationCard
                      city={city}
                      isActive={selectedCity?.id === city.id}
                    />
                  </div>
                ))}
              </>
            )}

            {activeLayers.nidos && displayedNests.length > 0 && (
              <>
                {activeLayers.clima && (
                  <div className="lf-section-label" style={{ color: '#22c55e' }}>
                    <span className="lf-section-dot" style={{ background: '#22c55e' }} />
                    Nidos
                  </div>
                )}
                {displayedNests.map((nest) => (
                  <NestCard
                    key={nest.id}
                    nest={nest}
                    isActive={selectedNest?.id === nest.id}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

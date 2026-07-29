import { useMemo, useEffect, useRef } from 'react'
import { useStore, type City } from '../../store/useStore'
import { calculateBadges } from '../../services/weather/weatherService'
import LocationCard from './LocationCard'
import NestCard from '../Nests/NestCard'
import MigrationBanner from '../Nests/MigrationBanner'
import type { Nest } from '../../types/nest'

interface LocationFeedProps {
  cities: City[]
}

export default function LocationFeed({ cities }: LocationFeedProps) {
  const selectedCity = useStore((s) => s.selectedCity)
  const sidebarMode = useStore((s) => s.sidebarMode)
  const favorites = useStore((s) => s.favorites)
  const badgeFilter = useStore((s) => s.badgeFilter)
  const categoryFilter = useStore((s) => s.categoryFilter)
  const highlightCategories = useStore((s) => s.highlightCategories)
  const loadingStatus = useStore((s) => s.loadingStatus)
  const setIsFilterPanelOpen = useStore((s) => s.setIsFilterPanelOpen)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter = useStore((s) => s.typeFilter)
  const regionFilter = useStore((s) => s.regionFilter)
  const activeLayers = useStore((s) => s.activeLayers)
  const nests = useStore((s) => s.nests)
  const selectedNest = useStore((s) => s.selectedNest)
  const scrollToFeedTick   = useStore((s) => s.scrollToFeedTick)
  const scrollToFeedTarget = useStore((s) => s.scrollToFeedTarget)
  const setSelectedNest = useStore((s) => s.setSelectedNest)
  const nestTypeFilter = useStore((s) => s.nestTypeFilter)
  const nestSortBy = useStore((s) => s.nestSortBy)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const activeFilterCount =
    (regionFilter !== 'todas' ? 1 : 0) +
    conditionFilter.length +
    typeFilter.length +
    categoryFilter.length +
    nestTypeFilter.length

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
    if (badgeFilter.length > 0) {
      result = result.filter(city => {
        const cityBadges = badgesByCity.get(city.id) || []
        return cityBadges.some((badge: string) => badgeFilter.includes(badge))
      })
    }

    // US-828: filtrar por categoria desde FilterPanelClima (OR logic)
    if (categoryFilter.length > 0) {
      result = result.filter(city => {
        const cityBadges = badgesByCity.get(city.id) || []
        return cityBadges.some((badge: string) => categoryFilter.includes(badge))
      })
    }

    return result
  }, [cities, sidebarMode, favorites, badgeFilter, categoryFilter, badgesByCity])

  // Filtrar nidos
  const displayedNests = useMemo<Nest[]>(() => {
    if (!activeLayers.nidos) return []
    let result = [...nests]
    if (nestTypeFilter.length > 0) {
      result = result.filter((n) => n.types.some((t) => nestTypeFilter.includes(t)))
    }
    if (nestSortBy === 'type') {
      result.sort((a, b) => (a.types[0] ?? '').localeCompare(b.types[0] ?? ''))
    } else if (nestSortBy === 'spawnRate') {
      result.sort((a, b) => b.spawnRate - a.spawnRate)
    } else {
      result.sort((a, b) => a.pokemonName.localeCompare(b.pokemonName))
    }
    return result
  }, [nests, activeLayers.nidos, nestTypeFilter, nestSortBy])

  // US-827: set de ids resaltados para dim en sidebar
  const highlightedCityIds = useMemo(() => {
    if (highlightCategories.length === 0) return null
    const ids = new Set<string>()
    cities.forEach(city => {
      const cityBadges = badgesByCity.get(city.id) || []
      if (cityBadges.some((badge: string) => highlightCategories.includes(badge))) {
        ids.add(city.id)
      }
    })
    return ids
  }, [cities, highlightCategories, badgesByCity])

  const cityCount = displayedCities.length
  const totalCount = cityCount + displayedNests.length

  // Auto-scroll al LocationCard activo
  useEffect(() => {
    if (!selectedCity || !scrollContainerRef.current) return
    const activeCard = scrollContainerRef.current.querySelector(
      `[data-city-id="${selectedCity.id}"]`
    ) as HTMLElement | null
    if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedCity?.id, scrollToFeedTarget === 'city' ? scrollToFeedTick : 0])

  // Auto-scroll al NestCard activo
  useEffect(() => {
    if (!selectedNest || !scrollContainerRef.current) return
    const activeCard = scrollContainerRef.current.querySelector(
      `[data-nest-id="${selectedNest.id}"]`
    ) as HTMLElement | null
    if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedNest?.id, scrollToFeedTarget === 'nest' ? scrollToFeedTick : 0])

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
          display: block;
          padding: 0 8px 8px;
        }

        .lf-group {
          display: block;
        }

        .lf-group-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 0;
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

        .lf-section-sep {
          position: sticky;
          top: 0;
          z-index: 1;
          background: var(--bg-primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          margin: 0 -8px;
          width: calc(100% + 16px);
          box-sizing: border-box;
        }
      `}</style>

      <div className="lf-root">
        {/* Lista o mensaje vacío */}
        {totalCount > 0 ? (
          <div className={`lf-scroll ${loadingStatus === 'loading' ? 'fade-refresh' : ''}`} ref={scrollContainerRef}>
            {/* Grupo Climas */}
            {activeLayers.clima && (
              <div className="lf-group">
                <div className="lf-header lf-section-sep">
                  <span className="lf-header-label">
                    {sidebarMode === 'favorites'
                      ? `⭐ Favoritos · ${cityCount}`
                      : `📋 Climas · ${cityCount}`
                    }
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
                <div className="lf-group-content">
                  {displayedCities.map((city) => (
                    <div
                      key={city.id}
                      data-city-id={city.id}
                      className="lf-card-wrap"
                      style={
                        highlightedCityIds !== null && !highlightedCityIds.has(city.id)
                          ? { opacity: 0.3, transition: 'opacity 200ms ease' }
                          : { transition: 'opacity 200ms ease' }
                      }
                    >
                      <LocationCard city={city} isActive={selectedCity?.id === city.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grupo Nidos */}
            {activeLayers.nidos && (
              <div className="lf-group">
                <div className="lf-header lf-section-sep">
                  <span className="lf-header-label">{`🌿 Nidos · ${displayedNests.length}`}</span>
                  <MigrationBanner />
                </div>
                <div className="lf-group-content">
                  {displayedNests.map((nest) => (
                    <div key={nest.id} data-nest-id={nest.id} className="lf-card-wrap">
                      <NestCard nest={nest} isActive={selectedNest?.id === nest.id} onSelect={setSelectedNest} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lf-empty">
            <div>
              <div className="lf-empty-icon">
                {!activeLayers.clima && !activeLayers.nidos
                  ? '🗺️'
                  : sidebarMode === 'favorites'
                    ? '🤍'
                    : '🔍'}
              </div>
              <div>
                {!activeLayers.clima && !activeLayers.nidos
                  ? 'Activa una capa para ver resultados'
                  : sidebarMode === 'favorites'
                    ? 'Sin favoritos aun'
                    : 'Sin resultados'}
              </div>
              {sidebarMode === 'favorites' && (activeLayers.clima || activeLayers.nidos) && (
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
                  Marca ciudades como favoritas para verlas aqui
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

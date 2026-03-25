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
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  // Filtrar ciudades según el modo y los badges seleccionados
  const displayedCities = useMemo(() => {
    let result = [...cities]

    // Filtrar por modo
    if (sidebarMode === 'favorites') {
      result = result.filter((city) => favorites.includes(city.id))
    }

    // Filtrar por badges seleccionados (OR logic)
    if (badgeFilter.length > 0) {
      result = result.filter(city => {
        const cityBadges = badgesByCity.get(city.id) || []
        return cityBadges.some((badge: string) => badgeFilter.includes(badge))
      })
    }

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
          height: 100%;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-default);
          overflow: hidden;
        }

        .lf-header {
          padding: 12px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          font: Exo 2 600 12px;
          color: var(--text-secondary);
          flex-shrink: 0;
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
        {/* Header con contador */}
        <div className="lf-header">
          {sidebarMode === 'favorites' ? '⭐ Favoritos' : '📋 Ciudades'} • {cityCount}
        </div>

        {/* Lista o mensaje vacío */}
        {cityCount > 0 ? (
          <div className="lf-scroll" ref={scrollContainerRef}>
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

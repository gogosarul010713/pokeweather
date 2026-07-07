import { useState, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { POKEMON_TYPES, TYPE_IMAGES } from '../../config/pokemonTypes'
import GroupHeader from './filters/GroupHeader'
import AccordionSection from './filters/AccordionSection'
import PillsGrid from './filters/PillsGrid'
import PillsWrap from './filters/PillsWrap'
import RadioList from './filters/RadioList'

const CONDITION_ITEMS = [
  { value: '',       label: 'Todos',    img: '/weather/all.png' },
  { value: 'sunny',  label: 'Soleado',  img: '/weather/sunny.png' },
  { value: 'partly', label: 'Parcial',  img: '/weather/partly.png' },
  { value: 'cloudy', label: 'Nublado',  img: '/weather/cloudy.png' },
  { value: 'fog',    label: 'Niebla',   img: '/weather/fog.png' },
  { value: 'rain',   label: 'Lluvia',   img: '/weather/rain.png' },
  { value: 'snow',   label: 'Nieve',    img: '/weather/snow.png' },
  { value: 'windy',  label: 'Ventoso',  img: '/weather/windy.png' },
]

const REGION_ITEMS = [
  { value: 'todas',   label: 'Todas' },
  { value: 'asia',    label: 'Asia' },
  { value: 'europa',  label: 'Europa' },
  { value: 'america', label: 'América' },
  { value: 'oceania', label: 'Oceanía' },
  { value: 'africa',  label: 'África' },
]

const SORT_CLIMA_ITEMS = [
  { value: '',        label: '🔤 Sin orden' },
  { value: 'name',    label: '🔤 Nombre' },
  { value: 'density', label: '📊 Densidad' },
  { value: 'rating',  label: '⭐ Rating' },
  { value: 'time',    label: '🕐 Hora Local' },
]

const SORT_NIDOS_ITEMS = [
  { value: 'name',      label: 'Nombre A-Z' },
  { value: 'type',      label: 'Tipo Pokemon' },
  { value: 'spawnRate', label: 'Tasa de spawn' },
]

const TYPE_ITEMS_ALL = [
  { value: '', label: 'Todos', img: '' },
  ...POKEMON_TYPES.map((t) => ({
    value: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
    img: TYPE_IMAGES[t] ?? '',
  })),
]

function badgeForMulti(selected: string[], allItems: { value: string; label: string }[]): string {
  if (selected.length === 0) return 'TODOS'
  if (selected.length === 1) {
    const found = allItems.find((i) => i.value === selected[0])
    return (found?.label ?? selected[0]).toUpperCase()
  }
  return `${selected.length} SELEC.`
}

function badgeForSort(value: string, items: { value: string; label: string }[]): string {
  if (!value) return 'SIN ORDEN'
  const found = items.find((i) => i.value === value)
  return (found?.label ?? value).toUpperCase()
}

function badgeForRegion(region: string, items: { value: string; label: string }[]): string {
  if (region === 'todas') return 'TODAS'
  const found = items.find((i) => i.value === region)
  return (found?.label ?? region).toUpperCase()
}

const FILTER_ICON = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 2.5h12M3 7h8M5 11.5h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const CLEAR_ICON = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 2l8 8M10 2l-8 8" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export default function FilterPanel({ citiesCount }: { citiesCount?: number }) {
  const [groupClima, setGroupClima] = useState(true)
  const [groupNidos, setGroupNidos] = useState(true)
  const [showToast, setShowToast] = useState(false)

  const activeLayers = useStore((s) => s.activeLayers)
  const filterPanelOpen = useStore((s) => s.filterPanelOpen)
  const accordionState = useStore((s) => s.accordionState)
  const draftFilters = useStore((s) => s.draftFilters)

  const openFilterPanel = useStore((s) => s.openFilterPanel)
  const applyFilterPanel = useStore((s) => s.applyFilterPanel)
  const cancelFilterPanel = useStore((s) => s.cancelFilterPanel)
  const clearDraftFilters = useStore((s) => s.clearDraftFilters)
  const clearAppliedFilters = useStore((s) => s.clearAppliedFilters)
  const toggleAccordion = useStore((s) => s.toggleAccordion)
  const setDraftRegion = useStore((s) => s.setDraftRegion)
  const setDraftCondition = useStore((s) => s.setDraftCondition)
  const setDraftType = useStore((s) => s.setDraftType)
  const setDraftSortMode = useStore((s) => s.setDraftSortMode)
  const setDraftNestType = useStore((s) => s.setDraftNestType)
  const setDraftNestSortBy = useStore((s) => s.setDraftNestSortBy)

  const regionFilter = useStore((s) => s.regionFilter)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter = useStore((s) => s.typeFilter)
  const sortMode = useStore((s) => s.sortMode)
  const nestTypeFilter = useStore((s) => s.nestTypeFilter)
  const nestSortBy = useStore((s) => s.nestSortBy)
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)

  const appliedCount =
    (regionFilter !== 'todas' ? 1 : 0) +
    conditionFilter.length +
    typeFilter.length +
    (sortMode !== '' ? 1 : 0) +
    nestTypeFilter.length +
    (nestSortBy !== 'name' ? 1 : 0)

  const hasApplied = appliedCount > 0

  const toggleDraftCondition = (v: string) => {
    if (v === '') { setDraftCondition([]); return }
    setDraftCondition(
      draftFilters.condition.includes(v)
        ? draftFilters.condition.filter((c) => c !== v)
        : [...draftFilters.condition, v]
    )
  }

  const toggleDraftType = (v: string) => {
    if (v === '') { setDraftType([]); return }
    setDraftType(
      draftFilters.type.includes(v)
        ? draftFilters.type.filter((t) => t !== v)
        : [...draftFilters.type, v]
    )
  }

  const toggleDraftNestType = (v: string) => {
    if (v === '') { setDraftNestType([]); return }
    setDraftNestType(
      draftFilters.nestType.includes(v)
        ? draftFilters.nestType.filter((t) => t !== v)
        : [...draftFilters.nestType, v]
    )
  }

  const climaBadgeCount =
    conditionFilter.length +
    (regionFilter !== 'todas' ? 1 : 0) +
    typeFilter.length +
    (sortMode !== '' ? 1 : 0)

  const nidosBadgeCount =
    nestTypeFilter.length +
    (nestSortBy !== 'name' ? 1 : 0)

  const handleClearWithToast = useCallback(() => {
    clearDraftFilters()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2200)
  }, [clearDraftFilters])

  const noLayers = !activeLayers.clima && !activeLayers.nidos

  return (
    <>
      <style>{`
        /* ── Search row ── */
        .fsp-search-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          flex-shrink: 0;
        }

        .fsp-search-wrap {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .fsp-search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
          display: flex;
        }
        .fsp-search {
          width: 100%;
          height: 34px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 12px;
          padding: 0 10px 0 30px;
          outline: none;
          box-sizing: border-box;
        }
        .fsp-search::placeholder { color: var(--text-muted); }
        .fsp-search:focus { border-color: #58a6ff; }

        /* ── Fila boton filtros ── */
        .fsp-action-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px 8px;
          flex-shrink: 0;
        }

        .fsp-filter-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 40px;
          border-radius: 10px;
          border: none;
          background: var(--ui-accent);
          color: #fff;
          font: 700 13px 'Exo 2', sans-serif;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(88,166,255,0.25);
          transition: opacity 0.15s;
        }
        .fsp-filter-btn:hover { opacity: 0.88; }

        .fsp-filter-badge {
          background: #fff;
          color: var(--ui-accent);
          font-size: 10px;
          font-weight: 700;
          border-radius: 9px;
          padding: 0 6px;
          line-height: 18px;
          height: 18px;
          min-width: 18px;
          text-align: center;
        }

        .fsp-clear-quick {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border-default);
          background: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .fsp-clear-quick:hover { background: var(--bg-elevated); }

        /* ── Header ciudades ── */
        .fsp-cities-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 10px 6px;
          flex-shrink: 0;
        }
        .fsp-cities-label {
          font: 700 10px 'Rajdhani', sans-serif;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
        }
        .fsp-cities-count {
          background: var(--ui-accent);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 8px;
          padding: 0 6px;
          line-height: 16px;
        }

        /* ── Panel overlay ── */
        .fsp-panel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 10;
        }
        .fsp-panel-overlay.open {
          transform: translateX(0);
          pointer-events: auto;
        }

        .fsp-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
          min-height: 48px;
          box-sizing: border-box;
        }
        .fsp-panel-back {
          display: flex;
          align-items: center;
          gap: 4px;
          font: 500 12px 'Exo 2', sans-serif;
          color: var(--text-secondary);
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px 6px;
          border-radius: 6px;
        }
        .fsp-panel-back:hover { background: var(--bg-elevated); }
        .fsp-panel-title {
          font: 700 13px 'Rajdhani', sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-primary);
        }
        .fsp-panel-clear-header {
          font: 500 11px 'Exo 2', sans-serif;
          color: var(--text-secondary);
          opacity: 0.7;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px 6px;
          border-radius: 6px;
        }
        .fsp-panel-clear-header:hover { opacity: 1; }

        .fsp-panel-scroll {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }

        .fsp-empty {
          padding: 24px 16px;
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
        }

        .fsp-panel-footer {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px 12px;
          border-top: 1px solid var(--border-default);
          flex-shrink: 0;
        }
        .fsp-footer-btns {
          display: flex;
          gap: 7px;
        }
        .fsp-btn-apply {
          flex: 2;
          height: 40px;
          border-radius: 9px;
          border: none;
          background: var(--ui-accent);
          color: #fff;
          font: 700 13px 'Exo 2', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .fsp-btn-apply:hover { opacity: 0.85; }
        .fsp-btn-cancel {
          flex: 1;
          height: 40px;
          border-radius: 9px;
          border: 1px solid var(--border-default);
          background: var(--bg-primary);
          color: var(--text-secondary);
          font: 600 13px 'Exo 2', sans-serif;
          cursor: pointer;
          transition: background 0.15s;
        }
        .fsp-btn-cancel:hover { background: var(--bg-elevated); }
        .fsp-footer-clear-all {
          text-align: center;
          font: 400 11px 'Exo 2', sans-serif;
          color: var(--text-secondary);
          opacity: 0.6;
          cursor: pointer;
          background: none;
          border: none;
          padding: 2px 0;
          text-decoration: underline;
        }
        .fsp-footer-clear-all:hover { opacity: 1; }

        /* ── Grupos con barra lateral de color ── */
        .fsp-group {
          border-left: 3px solid transparent;
        }
        .fsp-group-clima {
          border-left-color: #58a6ff;
        }
        .fsp-group-nidos {
          border-left-color: #22c55e;
        }

        /* ── Animacion de colapso de grupo ── */
        .fsp-group-content {
          overflow: hidden;
          max-height: 2000px;
          transition: max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fsp-group-content.collapsed {
          max-height: 0;
        }

        /* ── Toast ── */
        .fsp-toast {
          position: absolute;
          bottom: 72px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-elevated, #1c2333);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          padding: 8px 14px;
          font: 500 12px 'Exo 2', sans-serif;
          color: var(--text-primary);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          white-space: nowrap;
          z-index: 20;
          animation: fsp-toast-in 0.15s ease forwards;
          pointer-events: none;
        }
        .fsp-toast.hiding {
          animation: fsp-toast-out 0.3s ease forwards;
        }
        @keyframes fsp-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fsp-toast-out {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to   { opacity: 0; transform: translateX(-50%) translateY(6px); }
        }
      `}</style>

      {/* Search */}
      <div className="fsp-search-row">
        <div className="fsp-search-wrap">
          <span className="fsp-search-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            className="fsp-search"
            placeholder="Buscar ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Boton filtros + limpiar rapido */}
      <div className="fsp-action-row">
        <button className="fsp-filter-btn" onClick={openFilterPanel} type="button">
          {FILTER_ICON}
          Filtros
          {hasApplied && <span className="fsp-filter-badge">{appliedCount}</span>}
        </button>
        {hasApplied && (
          <button className="fsp-clear-quick" onClick={clearAppliedFilters} title="Limpiar filtros" type="button">
            {CLEAR_ICON}
          </button>
        )}
      </div>

      {/* Header ciudades */}
      {citiesCount !== undefined && (
        <div className="fsp-cities-header">
          <span className="fsp-cities-label">Ciudades</span>
          <span className="fsp-cities-count">{citiesCount}</span>
        </div>
      )}

      {/* Panel overlay */}
      <div className={`fsp-panel-overlay ${filterPanelOpen ? 'open' : ''}`}>
        <div className="fsp-panel-header">
          <button className="fsp-panel-back" onClick={cancelFilterPanel} type="button">
            &#8249; Volver
          </button>
          <span className="fsp-panel-title">Filtros</span>
          <button className="fsp-panel-clear-header" onClick={handleClearWithToast} type="button">
            Limpiar
          </button>
        </div>

        <div className="fsp-panel-scroll">
          {noLayers && (
            <p className="fsp-empty">Activa Clima o Nidos en el header para ver filtros</p>
          )}

          {activeLayers.clima && (
            <div className="fsp-group fsp-group-clima">
              <GroupHeader
                color="#58a6ff"
                title="Filtros de Clima"
                subtitle="Condicion · Region · Tipo · Orden"
                isOpen={groupClima}
                onToggle={() => setGroupClima((v) => !v)}
                badgeCount={climaBadgeCount}
              />
              <div className={`fsp-group-content${groupClima ? '' : ' collapsed'}`}>
                <AccordionSection
                  label="Condicion"
                  icon="⛅"
                  isOpen={accordionState.condicion}
                  onToggle={() => toggleAccordion('condicion')}
                  badgeText={badgeForMulti(draftFilters.condition, CONDITION_ITEMS)}
                >
                  <PillsGrid
                    items={CONDITION_ITEMS}
                    selected={draftFilters.condition}
                    cols={4}
                    onToggle={toggleDraftCondition}
                  />
                </AccordionSection>

                <AccordionSection
                  label="Region"
                  icon="🌐"
                  isOpen={accordionState.region}
                  onToggle={() => toggleAccordion('region')}
                  badgeText={badgeForRegion(draftFilters.region, REGION_ITEMS)}
                >
                  <PillsWrap
                    items={REGION_ITEMS}
                    selected={draftFilters.region}
                    onSelect={(v) => setDraftRegion(v as any)}
                  />
                </AccordionSection>

                <AccordionSection
                  label="Tipo Clima"
                  icon="🌡️"
                  isOpen={accordionState.tipoClima}
                  onToggle={() => toggleAccordion('tipoClima')}
                  badgeText={badgeForMulti(draftFilters.type, TYPE_ITEMS_ALL)}
                >
                  <PillsGrid
                    items={TYPE_ITEMS_ALL}
                    selected={draftFilters.type}
                    cols={3}
                    onToggle={toggleDraftType}
                  />
                </AccordionSection>

                <AccordionSection
                  label="Ordenar"
                  icon="↕️"
                  isOpen={accordionState.orden}
                  onToggle={() => toggleAccordion('orden')}
                  badgeText={badgeForSort(draftFilters.sortMode, SORT_CLIMA_ITEMS)}
                >
                  <RadioList
                    items={SORT_CLIMA_ITEMS}
                    selected={draftFilters.sortMode}
                    onSelect={(v) => setDraftSortMode(v as any)}
                  />
                </AccordionSection>
              </div>
            </div>
          )}

          {activeLayers.nidos && (
            <div className="fsp-group fsp-group-nidos">
              <GroupHeader
                color="#22c55e"
                title="Filtros de Nidos"
                subtitle="Tipo Pokemon · Orden"
                isOpen={groupNidos}
                onToggle={() => setGroupNidos((v) => !v)}
                badgeCount={nidosBadgeCount}
              />
              <div className={`fsp-group-content${groupNidos ? '' : ' collapsed'}`}>
                <AccordionSection
                  label="Tipo Pokemon"
                  icon="⚡"
                  isOpen={accordionState.tipoPoke}
                  onToggle={() => toggleAccordion('tipoPoke')}
                  badgeText={badgeForMulti(draftFilters.nestType, TYPE_ITEMS_ALL)}
                >
                  <PillsGrid
                    items={TYPE_ITEMS_ALL}
                    selected={draftFilters.nestType}
                    cols={3}
                    onToggle={toggleDraftNestType}
                  />
                </AccordionSection>

                <AccordionSection
                  label="Ordenar"
                  icon="↕️"
                  isOpen={accordionState.ordenNidos}
                  onToggle={() => toggleAccordion('ordenNidos')}
                  badgeText={badgeForSort(draftFilters.nestSortBy, SORT_NIDOS_ITEMS)}
                >
                  <RadioList
                    items={SORT_NIDOS_ITEMS}
                    selected={draftFilters.nestSortBy}
                    onSelect={(v) => setDraftNestSortBy(v as any)}
                  />
                </AccordionSection>
              </div>
            </div>
          )}
        </div>

        <div className="fsp-panel-footer">
          <div className="fsp-footer-btns">
            <button className="fsp-btn-apply" onClick={applyFilterPanel} type="button">
              &#10003; Aplicar
            </button>
            <button className="fsp-btn-cancel" onClick={cancelFilterPanel} type="button">
              &#10005; Cancelar
            </button>
          </div>
          <button className="fsp-footer-clear-all" onClick={handleClearWithToast} type="button">
            &#10005; Limpiar todos los filtros
          </button>
        </div>

        {showToast && (
          <div className="fsp-toast">Filtros eliminados</div>
        )}
      </div>
    </>
  )
}

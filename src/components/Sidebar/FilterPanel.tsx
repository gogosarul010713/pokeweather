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

export default function FilterPanel() {
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

  // Conteo de filtros activos (estado real, para badge del boton)
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

  const noLayers = !activeLayers.clima && !activeLayers.nidos

  return (
    <>
      <style>{`
        /* ── Search row — siempre visible, fuera del panel deslizante ── */
        .fsp-search-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--border-default);
        }

        .fsp-search {
          flex: 1;
          min-width: 0;
          height: 30px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 12px;
          padding: 0 10px;
          outline: none;
        }
        .fsp-search::placeholder { color: var(--text-muted); }
        .fsp-search:focus { border-color: #58a6ff; }

        /* ── Fila boton filtros ── */
        .fsp-action-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px 8px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--border-default);
        }

        .fsp-filter-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .fsp-filter-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .fsp-filter-btn.active {
          border-color: #58a6ff;
          color: #58a6ff;
          background: rgba(88,166,255,0.08);
        }
        .fsp-filter-badge {
          background: #58a6ff;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 8px;
          padding: 0 5px;
          line-height: 16px;
          min-width: 16px;
          text-align: center;
        }

        .fsp-clear-quick {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          transition: color 0.15s, background 0.15s;
        }
        .fsp-clear-quick:hover {
          color: var(--text-primary);
          background: var(--bg-hover, rgba(255,255,255,0.06));
        }

        /* ── Panel overlay — cubre toda el area del sidebar bajo el search ── */
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
          padding: 10px 16px 8px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }
        .fsp-panel-back {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #58a6ff;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-weight: 600;
        }
        .fsp-panel-back:hover { opacity: 0.75; }
        .fsp-panel-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: var(--text-primary);
        }
        .fsp-panel-clear-header {
          font-size: 11px;
          color: var(--text-muted);
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .fsp-panel-clear-header:hover { color: var(--text-secondary); }

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
          padding: 10px 16px;
          border-top: 1px solid var(--border-default);
          flex-shrink: 0;
        }
        .fsp-footer-btns {
          display: flex;
          gap: 8px;
        }
        .fsp-btn-apply {
          flex: 2;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: #58a6ff;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .fsp-btn-apply:hover { opacity: 0.85; }
        .fsp-btn-cancel {
          flex: 1;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .fsp-btn-cancel:hover { background: var(--bg-hover, rgba(255,255,255,0.04)); }
        .fsp-footer-clear-all {
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          cursor: pointer;
          background: none;
          border: none;
          padding: 2px 0;
        }
        .fsp-footer-clear-all:hover { color: var(--text-secondary); }
      `}</style>

      {/* Search — siempre visible */}
      <div className="fsp-search-row">
        <input
          className="fsp-search"
          placeholder="Buscar ciudad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Boton filtros + limpiar rapido */}
      <div className="fsp-action-row">
        <button
          className={`fsp-filter-btn ${hasApplied ? 'active' : ''}`}
          onClick={openFilterPanel}
          type="button"
        >
          &#9776; Filtros
          {hasApplied && <span className="fsp-filter-badge">{appliedCount}</span>}
        </button>
        {hasApplied && (
          <button className="fsp-clear-quick" onClick={clearAppliedFilters} title="Limpiar filtros" type="button">
            ✕
          </button>
        )}
      </div>

      {/* Panel overlay — cubre toda el area del content wrapper */}
      <div className={`fsp-panel-overlay ${filterPanelOpen ? 'open' : ''}`}>
        <div className="fsp-panel-header">
          <button className="fsp-panel-back" onClick={cancelFilterPanel} type="button">
            &#8249; Volver
          </button>
          <span className="fsp-panel-title">FILTROS</span>
          <button className="fsp-panel-clear-header" onClick={clearDraftFilters} type="button">
            Limpiar
          </button>
        </div>

            <div className="fsp-panel-scroll">
              {noLayers && (
                <p className="fsp-empty">Activa Clima o Nidos en el header para ver filtros</p>
              )}

              {activeLayers.clima && (
                <>
                  <GroupHeader color="#58a6ff" title="Clima" subtitle="Condicion · Region · Tipo · Orden" />
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
                </>
              )}

              {activeLayers.nidos && (
                <>
                  <GroupHeader color="#22c55e" title="Nidos" subtitle="Tipo Pokemon · Orden" />
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
                </>
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
              <button className="fsp-footer-clear-all" onClick={clearDraftFilters} type="button">
                &#10005; Limpiar todos los filtros
              </button>
            </div>
          </div>
    </>
  )
}

import { useState, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { POKEMON_TYPES, TYPE_IMAGES } from '../../config/pokemonTypes'
import GroupHeader from './filters/GroupHeader'
import AccordionSection from './filters/AccordionSection'
import PillsGrid from './filters/PillsGrid'
import PillsWrap from './filters/PillsWrap'
import RadioList from './filters/RadioList'
import HomeChip from './HomeChip'

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
  { value: '',        label: 'Sin orden' },
  { value: 'name',    label: 'Nombre' },
  { value: 'density', label: 'Densidad' },
  { value: 'rating',  label: 'Rating' },
  { value: 'time',    label: 'Hora Local' },
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

const COND_EMOJI: Record<string, string> = {
  sunny: '☀️', partly: '⛅', cloudy: '☁️',
  fog: '🌫', rain: '🌧', snow: '❄️', windy: '💨',
}
const REGION_LABEL: Record<string, string> = {
  asia: '🌏 Asia', europa: '🌍 Europa', america: '🌎 America',
  oceania: '🌏 Oceania', africa: '🌍 Africa',
}
const ORDEN_LABEL: Record<string, string> = {
  name: 'A-Z', density: 'Densidad', rating: 'Rating', time: 'Hora',
}
const TYPE_EMOJI: Record<string, string> = {
  fire: '🔥', water: '💧', grass: '🌿', electric: '⚡',
  ice: '❄️', dragon: '🐉', psychic: '🔮', dark: '🌑',
  ghost: '👻', ground: '🏜', normal: '⭐', fairy: '✨',
}
const ORDEN_NIDOS_LABEL: Record<string, string> = {
  name: 'A-Z', type: 'Tipo', spawnRate: 'Spawn',
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

/** Chips que aparecen debajo del boton Filtros cuando el panel esta cerrado */
interface ActiveChip {
  key: string
  emoji?: string
  label: string
  count?: number
  group: 'clima' | 'nidos'
  onRemove: () => void
}

export default function FilterPanel() {
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
  const categoryFilter = useStore((s) => s.categoryFilter)
  const sortMode = useStore((s) => s.sortMode)
  const nestTypeFilter = useStore((s) => s.nestTypeFilter)
  const nestSortBy = useStore((s) => s.nestSortBy)
  const setConditionFilter = useStore((s) => s.setConditionFilter)
  const setRegionFilter = useStore((s) => s.setRegionFilter)
  const setTypeFilter = useStore((s) => s.setTypeFilter)
  const toggleCategory = useStore((s) => s.toggleCategory)
  const setCategoryFilter = useStore((s) => s.setCategoryFilter)
  const setSortMode = useStore((s) => s.setSortMode)
  const setNestTypeFilter = useStore((s) => s.setNestTypeFilter)
  const setNestSortBy = useStore((s) => s.setNestSortBy)

  const appliedCount =
    (regionFilter !== 'todas' ? 1 : 0) +
    conditionFilter.length +
    typeFilter.length +
    categoryFilter.length +
    (sortMode !== '' ? 1 : 0) +
    nestTypeFilter.length +
    (nestSortBy !== 'name' ? 1 : 0)

  const hasApplied = appliedCount > 0

  // ── Chips para la fila horizontal (filtros aplicados, panel cerrado) ──
  const activeChips: ActiveChip[] = []

  if (conditionFilter.length === 1) {
    const v = conditionFilter[0]
    activeChips.push({
      key: `cond-${v}`,
      emoji: COND_EMOJI[v],
      label: CONDITION_ITEMS.find((i) => i.value === v)?.label ?? v,
      group: 'clima',
      onRemove: () => setConditionFilter([]),
    })
  } else if (conditionFilter.length >= 2) {
    activeChips.push({
      key: 'cond-multi',
      emoji: '⛅',
      label: 'Condicion',
      count: conditionFilter.length,
      group: 'clima',
      onRemove: () => setConditionFilter([]),
    })
  }

  if (regionFilter !== 'todas') {
    const label = REGION_ITEMS.find((i) => i.value === regionFilter)?.label ?? regionFilter
    activeChips.push({
      key: `region-${regionFilter}`,
      emoji: '🌐',
      label,
      group: 'clima',
      onRemove: () => setRegionFilter('todas' as any),
    })
  }

  if (typeFilter.length === 1) {
    const v = typeFilter[0]
    activeChips.push({
      key: `type-${v}`,
      emoji: TYPE_EMOJI[v],
      label: v.charAt(0).toUpperCase() + v.slice(1),
      group: 'clima',
      onRemove: () => setTypeFilter([]),
    })
  } else if (typeFilter.length >= 2) {
    activeChips.push({
      key: 'type-multi',
      emoji: '⚡',
      label: 'Tipos',
      count: typeFilter.length,
      group: 'clima',
      onRemove: () => setTypeFilter([]),
    })
  }

  if (sortMode !== '') {
    activeChips.push({
      key: `sort-${sortMode}`,
      emoji: '↕',
      label: ORDEN_LABEL[sortMode] ?? sortMode,
      group: 'clima',
      onRemove: () => setSortMode('' as any),
    })
  }

  const CAT_EMOJI: Record<string, string> = { stops: '🎯', gyms: '💪', community: '👥', best: '✨' }
  const CAT_LABEL: Record<string, string> = { stops: 'Pokestops', gyms: 'Gym Hub', community: 'Comunidad', best: 'Mejores' }
  if (categoryFilter.length === 1) {
    const v = categoryFilter[0]
    activeChips.push({ key: `cat-${v}`, emoji: CAT_EMOJI[v], label: CAT_LABEL[v] ?? v, group: 'clima', onRemove: () => setCategoryFilter([]) })
  } else if (categoryFilter.length >= 2) {
    activeChips.push({ key: 'cat-multi', emoji: '📍', label: 'Categoria', count: categoryFilter.length, group: 'clima', onRemove: () => setCategoryFilter([]) })
  }

  if (nestTypeFilter.length === 1) {
    const v = nestTypeFilter[0]
    activeChips.push({
      key: `ntype-${v}`,
      emoji: TYPE_EMOJI[v],
      label: v.charAt(0).toUpperCase() + v.slice(1),
      group: 'nidos',
      onRemove: () => setNestTypeFilter([]),
    })
  } else if (nestTypeFilter.length >= 2) {
    activeChips.push({
      key: 'ntype-multi',
      emoji: '⚡',
      label: 'Tipos',
      count: nestTypeFilter.length,
      group: 'nidos',
      onRemove: () => setNestTypeFilter([]),
    })
  }

  if (nestSortBy !== 'name') {
    activeChips.push({
      key: `nsort-${nestSortBy}`,
      emoji: '↕',
      label: ORDEN_NIDOS_LABEL[nestSortBy] ?? nestSortBy,
      group: 'nidos',
      onRemove: () => setNestSortBy('name' as any),
    })
  }

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

  const handleClearWithToast = useCallback(() => {
    clearAppliedFilters()
    clearDraftFilters()
    setCategoryFilter([])
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2200)
  }, [clearAppliedFilters, clearDraftFilters, setCategoryFilter])

  const noLayers = !activeLayers.clima && !activeLayers.nidos

  // helpers para AccordionSection
  const condLabel1 = draftFilters.condition.length === 1
    ? `${COND_EMOJI[draftFilters.condition[0]] ?? ''} ${CONDITION_ITEMS.find((i) => i.value === draftFilters.condition[0])?.label ?? draftFilters.condition[0]}`
    : undefined
  const regionLabel1 = draftFilters.region !== 'todas'
    ? `🌐 ${REGION_ITEMS.find((i) => i.value === draftFilters.region)?.label ?? draftFilters.region}`
    : undefined
  const sortClimaLabel1 = draftFilters.sortMode !== ''
    ? SORT_CLIMA_ITEMS.find((i) => i.value === draftFilters.sortMode)?.label
    : undefined
  const nestTypeLabel1 = draftFilters.nestType.length === 1
    ? `${TYPE_EMOJI[draftFilters.nestType[0]] ?? ''} ${draftFilters.nestType[0].charAt(0).toUpperCase() + draftFilters.nestType[0].slice(1)}`
    : undefined
  const nestSortLabel1 = draftFilters.nestSortBy !== 'name'
    ? SORT_NIDOS_ITEMS.find((i) => i.value === draftFilters.nestSortBy)?.label
    : undefined

  return (
    <>
      <style>{`
        /* ── Mi Zona + filter row ── */
        .fsp-search-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          flex-shrink: 0;
        }
        .fsp-filter-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: none;
          background: var(--ui-accent);
          color: #fff;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(88,166,255,0.25);
          transition: opacity 0.15s;
          flex-shrink: 0;
        }
        .fsp-filter-btn:hover { opacity: 0.88; }
        .fsp-filter-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #fff;
          color: var(--ui-accent);
          font-size: 9px;
          font-weight: 700;
          border-radius: 9px;
          padding: 0 4px;
          line-height: 15px;
          height: 15px;
          min-width: 15px;
          text-align: center;
          pointer-events: none;
        }
        .fsp-clear-quick {
          width: 34px;
          height: 34px;
          border-radius: 8px;
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

        /* ── Chips activos ── */
        .fsp-chips-row {
          display: flex;
          gap: 5px;
          overflow-x: auto;
          padding: 7px 10px 0;
          scrollbar-width: none;
          flex-shrink: 0;
        }
        .fsp-chips-row::-webkit-scrollbar { display: none; }
        .fsp-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 24px;
          padding: 0 8px 0 7px;
          border-radius: 12px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .fsp-chip-label {
          font: 600 10px/1 'Exo 2', sans-serif;
        }
        .fsp-chip-count {
          min-width: 14px;
          height: 14px;
          padding: 0 4px;
          border-radius: 7px;
          font: 700 9px/14px 'Exo 2', sans-serif;
          text-align: center;
        }
        .fsp-chip-x {
          font: 600 11px/1 'Exo 2', sans-serif;
          cursor: pointer;
          margin-left: 1px;
          opacity: 0.5;
          background: none;
          border: none;
          padding: 0;
          color: inherit;
          line-height: 1;
        }
        .fsp-chip-x:hover { opacity: 1; }
        .fsp-chip-clima {
          background: rgba(88,166,255,.12);
          border: 1px solid rgba(88,166,255,.25);
          color: #58a6ff;
        }
        .fsp-chip-nidos {
          background: rgba(34,197,94,.10);
          border: 1px solid rgba(34,197,94,.25);
          color: #22c55e;
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
/* ── Grupos con barra lateral de color ── */
        .fsp-group { border-left: 3px solid transparent; }
        .fsp-group-clima { border-left-color: #58a6ff; }
        .fsp-group-nidos { border-left-color: #22c55e; border-top: 2px solid var(--border-default); }

        /* ── Animacion de colapso de grupo ── */
        .fsp-group-content {
          overflow: hidden;
          max-height: 2000px;
          transition: max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fsp-group-content.collapsed { max-height: 0; }

        /* ── Toast ── */
        .fsp-toast {
          position: absolute;
          bottom: 72px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-elevated);
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
        @keyframes fsp-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Mi Zona chip + filtros inline */}
      <div className="fsp-search-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <HomeChip />
        </div>
        <button className="fsp-filter-btn" onClick={openFilterPanel} title="Filtros" type="button">
          {FILTER_ICON}
          {hasApplied && <span className="fsp-filter-badge">{appliedCount}</span>}
        </button>
        {hasApplied && (
          <button className="fsp-clear-quick" onClick={clearAppliedFilters} title="Limpiar filtros" type="button">
            {CLEAR_ICON}
          </button>
        )}
      </div>

      {/* Chips activos — solo si hay filtros y el panel esta cerrado */}
      {!filterPanelOpen && activeChips.length > 0 && (
        <div className="fsp-chips-row">
          {activeChips.map((chip) => (
            <div key={chip.key} className={`fsp-chip fsp-chip-${chip.group}`}>
              {chip.emoji && <span style={{ fontSize: 11 }}>{chip.emoji}</span>}
              <span className="fsp-chip-label">{chip.label}</span>
              {chip.count !== undefined && (
                <div
                  className="fsp-chip-count"
                  style={{
                    background: chip.group === 'clima' ? 'rgba(88,166,255,.25)' : 'rgba(34,197,94,.25)',
                    color: chip.group === 'clima' ? '#58a6ff' : '#22c55e',
                  }}
                >
                  {chip.count}
                </div>
              )}
              <button className="fsp-chip-x" onClick={chip.onRemove} type="button">×</button>
            </div>
          ))}
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
                isOpen={groupClima}
                onToggle={() => setGroupClima((v) => !v)}
              />
              <div className={`fsp-group-content${groupClima ? '' : ' collapsed'}`}>
                <AccordionSection
                  label="Condicion"
                  icon="⛅"
                  isOpen={accordionState.condicion}
                  onToggle={() => toggleAccordion('condicion')}
                  accentColor="#58a6ff"
                  activeValues={draftFilters.condition}
                  activeLabel={condLabel1}
                >
                  <PillsGrid
                    items={CONDITION_ITEMS}
                    selected={draftFilters.condition}
                    cols={4}
                    onToggle={toggleDraftCondition}
                    accentColor="#58a6ff"
                  />
                </AccordionSection>

                <AccordionSection
                  label="Region"
                  icon="🌐"
                  isOpen={accordionState.region}
                  onToggle={() => toggleAccordion('region')}
                  accentColor="#58a6ff"
                  activeValues={draftFilters.region !== 'todas' ? [draftFilters.region] : []}
                  activeLabel={regionLabel1}
                >
                  <PillsWrap
                    items={REGION_ITEMS}
                    selected={draftFilters.region}
                    onSelect={(v) => setDraftRegion(v as any)}
                  />
                </AccordionSection>

                <AccordionSection
                  label="Ordenar"
                  icon="↕"
                  isOpen={accordionState.orden}
                  onToggle={() => toggleAccordion('orden')}
                  accentColor="#58a6ff"
                  activeValues={draftFilters.sortMode !== '' ? [draftFilters.sortMode] : []}
                  activeLabel={sortClimaLabel1}
                >
                  <RadioList
                    items={SORT_CLIMA_ITEMS}
                    selected={draftFilters.sortMode}
                    onSelect={(v) => setDraftSortMode(v as any)}
                  />
                </AccordionSection>

                <AccordionSection
                  label="Categoria del lugar"
                  icon="📍"
                  isOpen={accordionState.categoria}
                  onToggle={() => toggleAccordion('categoria')}
                  accentColor="#58a6ff"
                  activeValues={categoryFilter}
                  activeLabel={categoryFilter.length === 1 ? `${CAT_EMOJI[categoryFilter[0]]} ${CAT_LABEL[categoryFilter[0]]}` : undefined}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 0' }}>
                    {([
                      { value: 'stops',     label: 'Pokéstops',       icon: '🎯' },
                      { value: 'gyms',      label: 'Gym Hub',          icon: '💪' },
                      { value: 'community', label: 'Comunidad Activa', icon: '👥' },
                      { value: 'best',      label: 'Mejores Lugares',  icon: '✨' },
                    ] as const).map((chip) => (
                      <button
                        key={chip.value}
                        onClick={() => toggleCategory(chip.value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '6px 12px', borderRadius: 999,
                          border: categoryFilter.includes(chip.value) ? '1.5px solid #58a6ff' : '1.5px solid var(--border-default)',
                          background: categoryFilter.includes(chip.value) ? 'rgba(88,166,255,.12)' : 'var(--bg-tertiary)',
                          color: categoryFilter.includes(chip.value) ? '#58a6ff' : 'var(--text-secondary)',
                          fontSize: 12, fontWeight: categoryFilter.includes(chip.value) ? 600 : 400,
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                        type="button"
                      >
                        <span>{chip.icon}</span>
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </AccordionSection>
              </div>
            </div>
          )}

          {activeLayers.nidos && (
            <div className="fsp-group fsp-group-nidos">
              <GroupHeader
                color="#22c55e"
                title="Filtros de Nidos"
                isOpen={groupNidos}
                onToggle={() => setGroupNidos((v) => !v)}
              />
              <div className={`fsp-group-content${groupNidos ? '' : ' collapsed'}`}>
                <AccordionSection
                  label="Tipo Pokemon"
                  icon="⚡"
                  isOpen={accordionState.tipoPoke}
                  onToggle={() => toggleAccordion('tipoPoke')}
                  accentColor="#22c55e"
                  activeValues={draftFilters.nestType}
                  activeLabel={nestTypeLabel1}
                >
                  <PillsGrid
                    items={TYPE_ITEMS_ALL}
                    selected={draftFilters.nestType}
                    cols={4}
                    onToggle={toggleDraftNestType}
                    accentColor="#22c55e"
                  />
                </AccordionSection>

                <AccordionSection
                  label="Ordenar"
                  icon="↕"
                  isOpen={accordionState.ordenNidos}
                  onToggle={() => toggleAccordion('ordenNidos')}
                  accentColor="#22c55e"
                  activeValues={draftFilters.nestSortBy !== 'name' ? [draftFilters.nestSortBy] : []}
                  activeLabel={nestSortLabel1}
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
        </div>

        {showToast && (
          <div className="fsp-toast">Filtros eliminados</div>
        )}
      </div>
    </>
  )
}

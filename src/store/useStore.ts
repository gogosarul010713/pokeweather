import { create } from 'zustand'
import type { Nest } from '../types/nest'
import type { NavPinState } from '../types/navPin'
import type { HomeLocation } from '../types/homeLocation'

// ─── Layer Types ──────────────────────────────────────────────────────────────

export type LayerKey = 'clima' | 'nidos' | 'gyms' | 'stops' | 'rutas'

export interface ActiveLayers {
  clima: boolean
  nidos: boolean
  gyms: boolean
  stops: boolean
  rutas: boolean
}

const DEFAULT_LAYERS: ActiveLayers = {
  clima: true,
  nidos: false,
  gyms: false,
  stops: false,
  rutas: false,
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface City {
  // Del JSON
  id: string
  name: string
  country: string
  flag: string
  region: 'asia' | 'europa' | 'america' | 'oceania' | 'africa'
  lat: number
  lon: number
  density: number
  stops: number
  gyms: number
  rating: 1 | 2 | 3 | 4 | 5
  tags: ('evento' | 'raid' | 'nidos' | 'turistico')[]
  tips: string
  best: string
  evento: string
  transporte: string

  // Runtime (AccuWeather + S2)
  condition: 'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy'
  isExtreme: boolean
  boostedTypes: string[]
  tempC: number
  feelsLike: number
  humidity: number
  windKmh: number
  gustKmh: number
  visibilityKm: number  // ← Para detectar FOG
  localTime: string
  s2Key: string
  accuLocationKey: string
  weatherIcon: number
  timezone: number
  updatedAt: number
  weatherImage: string
}

export type Region = 'todas' | 'asia' | 'europa' | 'america' | 'oceania' | 'africa'
export type SortMode = '' | 'name' | 'density' | 'rating' | 'time'  // '' = sin ordenar
type SortDirection = 'asc' | 'desc'
type LoadingStatus = 'idle' | 'loading' | 'ready' | 'error'

export type AccordionKey = 'condicion' | 'region' | 'tipoClima' | 'orden' | 'tipoPoke' | 'ordenNidos' | 'categoria'

export interface DraftFilters {
  region: Region
  condition: string[]
  type: string[]
  sortMode: SortMode
  nestType: string[]
  nestSortBy: 'name' | 'type' | 'spawnRate' | 'distance'
}

const DEFAULT_DRAFT: DraftFilters = {
  region: 'todas',
  condition: [],
  type: [],
  sortMode: '',
  nestType: [],
  nestSortBy: 'name',
}

interface LoadingProgress {
  cityName: string
  current: number
  total: number
  percent: number
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AppStore {
  // State
  regionFilter: Region
  conditionFilter: string[]
  searchQuery: string
  sortMode: SortMode
  sortDirection: SortDirection
  selectedCity: City | null
  theme: 'dark' | 'light'
  loadingStatus: LoadingStatus
  loadingProgress: LoadingProgress
  sidebarMode: 'list' | 'detail' | 'favorites'
  scrollToFeedTick: number
  scrollToFeedTarget: 'city' | 'nest' | null
  favorites: string[]
  badgeFilter: string[] // DEPRECATED: uso en MapLegend eliminado en US-827. Solo FilterPanel lo usa para filtrar ciudades.
  highlightCategories: string[] // US-827/US-815: resaltar pines. Radio exclusivo global. Valores: 'stops'|'gyms'|'community'|'best'|'nest:verified'|'nest:spawn'|'nest:dust'|'nest:top'
  categoryFilter: string[] // US-828: filtrar ciudades por categoria (stops/gyms/community/best) desde FilterPanelClima
  showBadgesOnPins: boolean
  lastUpdated: number | null
  isFilterPanelOpen: boolean
  typeFilter: string[]
  activeLayers: ActiveLayers
  nests: Nest[]
  selectedNest: Nest | null
  nestPopupOpen: boolean
  nestTypeFilter: string[]
  nestSortBy: 'name' | 'type' | 'spawnRate' | 'distance'
  nestSortDirection: 'asc' | 'desc'
  navPin: NavPinState | null
  homeLocation: HomeLocation | null
  homeModalOpen: boolean

  // Migration countdown
  now: number
  tickNow: () => void

  // Filter panel
  filterPanelOpen: boolean
  accordionState: Record<AccordionKey, boolean>
  draftFilters: DraftFilters

  // Actions
  setRegionFilter: (region: Region) => void
  toggleCondition: (condition: string) => void
  setConditionFilter: (conditions: string[]) => void
  clearConditions: () => void
  setSearchQuery: (query: string) => void
  setSortMode: (mode: SortMode) => void
  setSortDirection: (direction: SortDirection) => void
  setSelectedCity: (city: City | null) => void
  toggleTheme: () => void
  setLoadingStatus: (status: LoadingStatus) => void
  setLoadingProgress: (progress: LoadingProgress) => void
  setSidebarMode: (mode: 'list' | 'detail' | 'favorites') => void
  scrollToFeed: (target: 'city' | 'nest') => void
  toggleFavorite: (cityId: string) => void
  clearFavorites: () => void
  setBadgeFilter: (badges: string[]) => void
  setHighlightCategories: (cats: string[]) => void
  setCategoryFilter: (cats: string[]) => void
  toggleCategory: (cat: string) => void
  toggleHighlightCategory: (cat: string) => void
  setShowBadgesOnPins: (show: boolean) => void
  setLastUpdated: (timestamp: number) => void
  setIsFilterPanelOpen: (open: boolean) => void
  setTypeFilter: (types: string[]) => void
  toggleType: (type: string) => void
  resetToHome: () => void
  toggleLayer: (layer: LayerKey) => void
  setLayer: (layer: LayerKey, value: boolean) => void
  setNests: (nests: Nest[]) => void
  setSelectedNest: (nest: Nest | null) => void
  setNestPopupOpen: (open: boolean) => void
  setNestTypeFilter: (types: string[]) => void
  toggleNestType: (type: string) => void
  setNestSortBy: (mode: 'name' | 'type' | 'spawnRate' | 'distance') => void
  setNestSortDirection: (direction: 'asc' | 'desc') => void
  setNavPin: (pin: NavPinState | null) => void
  clearNavPin: () => void
  setHomeLocation: (loc: HomeLocation) => void
  clearHomeLocation: () => void
  setHomeModalOpen: (open: boolean) => void

  // Filter panel actions
  openFilterPanel: () => void
  applyFilterPanel: () => void
  cancelFilterPanel: () => void
  clearDraftFilters: () => void
  clearAppliedFilters: () => void
  setDraftRegion: (region: Region) => void
  setDraftCondition: (conditions: string[]) => void
  setDraftType: (types: string[]) => void
  setDraftSortMode: (mode: SortMode) => void
  setDraftNestType: (types: string[]) => void
  setDraftNestSortBy: (mode: 'name' | 'type' | 'spawnRate' | 'distance') => void
  toggleAccordion: (section: AccordionKey) => void

  // Derived
  getFilteredCities: (cities: City[]) => City[]
}

// ─── Create store ─────────────────────────────────────────────────────────────

export const useStore = create<AppStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  regionFilter: 'todas',
  conditionFilter: [],
  searchQuery: '',
  sortMode: '',  // Default: sin ordenar
  sortDirection: 'asc',  // Default: ascendente (como solicitó el usuario)
  selectedCity: null,
  theme: (localStorage.getItem('pwe-theme') as 'dark' | 'light') || 'dark',
  loadingStatus: 'idle',
  loadingProgress: { cityName: '', current: 0, total: 0, percent: 0 },
  sidebarMode: 'list',
  scrollToFeedTick: 0,
  scrollToFeedTarget: null,
  favorites: (() => {
    try {
      const saved = localStorage.getItem('pwe-favorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })(),
  badgeFilter: ['stops', 'gyms', 'community', 'best'],
  categoryFilter: [],
  highlightCategories: [],
  showBadgesOnPins: (() => {
    try {
      const saved = localStorage.getItem('pwe-showBadgesOnPins')
      return saved ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })(),
  lastUpdated: null,
  isFilterPanelOpen: false,
  typeFilter: [],
  activeLayers: (() => {
    try {
      const stored = localStorage.getItem('pwe-activeLayers')
      if (!stored) return DEFAULT_LAYERS
      return { ...DEFAULT_LAYERS, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_LAYERS
    }
  })(),
  nests: [],
  selectedNest: null,
  nestPopupOpen: false,
  nestTypeFilter: [],
  nestSortBy: 'name',
  nestSortDirection: 'asc',
  navPin: null,
  homeLocation: (() => {
    try {
      const saved = localStorage.getItem('pwe-home-location')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })(),
  homeModalOpen: false,
  now: Date.now(),
  filterPanelOpen: false,
  accordionState: {
    condicion: true,
    region: false,
    tipoClima: false,
    orden: false,
    tipoPoke: true,
    ordenNidos: false,
    categoria: false,
  },
  draftFilters: DEFAULT_DRAFT,

  // ── Actions ────────────────────────────────────────────────────────────────
  setRegionFilter: (region) => set({ regionFilter: region }),

  toggleCondition: (condition) =>
    set((state) => ({
      conditionFilter: state.conditionFilter.includes(condition)
        ? state.conditionFilter.filter((c) => c !== condition)
        : [...state.conditionFilter, condition],
    })),

  setConditionFilter: (conditions) => set({ conditionFilter: conditions }),

  clearConditions: () => set({ conditionFilter: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortMode: (mode) => set({ sortMode: mode }),

  setSortDirection: (direction) => {
    console.log('📝 setSortDirection action:', direction)
    set({ sortDirection: direction })
  },

  setSelectedCity: (city) => set({ selectedCity: city, selectedNest: null, nestPopupOpen: false, navPin: null }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('light', next === 'light')
    localStorage.setItem('pwe-theme', next)
    set({ theme: next })
  },

  setSidebarMode: (mode) => set({ sidebarMode: mode }),
  scrollToFeed: (target) => set((s) => ({ sidebarMode: 'list', scrollToFeedTick: s.scrollToFeedTick + 1, scrollToFeedTarget: target, nestPopupOpen: false })),

  toggleFavorite: (cityId) =>
    set((state) => {
      const newFavorites = state.favorites.includes(cityId)
        ? state.favorites.filter((id) => id !== cityId)
        : [...state.favorites, cityId]
      localStorage.setItem('pwe-favorites', JSON.stringify(newFavorites))
      return { favorites: newFavorites }
    }),

  clearFavorites: () => {
    localStorage.removeItem('pwe-favorites')
    set({ favorites: [] })
  },

  setLoadingStatus: (status) => set({ loadingStatus: status }),

  setLoadingProgress: (progress) => set({ loadingProgress: progress }),

  setBadgeFilter: (badges) => set({ badgeFilter: badges }),

  setCategoryFilter: (cats) => set({ categoryFilter: cats }),

  toggleCategory: (cat) =>
    set((s) => ({
      categoryFilter: s.categoryFilter.includes(cat)
        ? s.categoryFilter.filter((c) => c !== cat)
        : [...s.categoryFilter, cat],
    })),

  setHighlightCategories: (cats) => set({ highlightCategories: cats }),

  toggleHighlightCategory: (cat) =>
    set((s) => ({
      // US-815: radio exclusivo global — una sola fila activa en toda la leyenda
      highlightCategories: s.highlightCategories.includes(cat) ? [] : [cat],
    })),

  setShowBadgesOnPins: (show) => {
    localStorage.setItem('pwe-showBadgesOnPins', JSON.stringify(show))
    set({ showBadgesOnPins: show })
  },

  setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),

  setIsFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),

  setTypeFilter: (types) => set({ typeFilter: types }),

  resetToHome: () => set({
    regionFilter: 'todas',
    conditionFilter: [],
    searchQuery: '',
    sortMode: '',
    sortDirection: 'asc',
    typeFilter: [],
    selectedCity: null,
    sidebarMode: 'list',
    isFilterPanelOpen: false,
    badgeFilter: [],
  }),

  toggleType: (type) =>
    set((state) => ({
      typeFilter: state.typeFilter.includes(type)
        ? state.typeFilter.filter((t) => t !== type)
        : [...state.typeFilter, type],
    })),

  toggleLayer: (layer) =>
    set((state) => {
      const next = { ...state.activeLayers, [layer]: !state.activeLayers[layer] }
      localStorage.setItem('pwe-activeLayers', JSON.stringify(next))
      return { activeLayers: next }
    }),

  setLayer: (layer, value) =>
    set((state) => {
      const next = { ...state.activeLayers, [layer]: value }
      localStorage.setItem('pwe-activeLayers', JSON.stringify(next))
      return { activeLayers: next }
    }),

  setNests: (nests) => set({ nests }),

  setSelectedNest: (nest) => set({ selectedNest: nest, nestPopupOpen: nest !== null, selectedCity: null }),
  setNestPopupOpen: (open) => set({ nestPopupOpen: open }),

  setNestTypeFilter: (types) => set({ nestTypeFilter: types }),

  toggleNestType: (type) =>
    set((state) => ({
      nestTypeFilter: state.nestTypeFilter.includes(type)
        ? state.nestTypeFilter.filter((t) => t !== type)
        : [...state.nestTypeFilter, type],
    })),

  setNestSortBy: (mode) => set({ nestSortBy: mode }),

  setNestSortDirection: (direction) => set({ nestSortDirection: direction }),

  setNavPin: (pin) => set({ navPin: pin }),
  clearNavPin: () => set({ navPin: null }),

  setHomeLocation: (loc) => {
    localStorage.setItem('pwe-home-location', JSON.stringify(loc))
    set({ homeLocation: loc })
  },
  clearHomeLocation: () => {
    localStorage.removeItem('pwe-home-location')
    set({ homeLocation: null })
  },
  setHomeModalOpen: (open: boolean) => set({ homeModalOpen: open }),

  tickNow: () => set({ now: Date.now() }),

  openFilterPanel: () => {
    const { regionFilter, conditionFilter, typeFilter, sortMode, nestTypeFilter, nestSortBy } = get()
    set({
      filterPanelOpen: true,
      draftFilters: {
        region: regionFilter,
        condition: [...conditionFilter],
        type: [...typeFilter],
        sortMode,
        nestType: [...nestTypeFilter],
        nestSortBy,
      },
    })
  },

  applyFilterPanel: () => {
    const { draftFilters } = get()
    set({
      filterPanelOpen: false,
      regionFilter: draftFilters.region,
      conditionFilter: draftFilters.condition,
      typeFilter: draftFilters.type,
      sortMode: draftFilters.sortMode,
      nestTypeFilter: draftFilters.nestType,
      nestSortBy: draftFilters.nestSortBy,
    })
  },

  cancelFilterPanel: () => set({ filterPanelOpen: false, draftFilters: DEFAULT_DRAFT }),

  clearDraftFilters: () => set({ draftFilters: DEFAULT_DRAFT }),

  clearAppliedFilters: () => set({
    regionFilter: 'todas',
    conditionFilter: [],
    typeFilter: [],
    sortMode: '',
    nestTypeFilter: [],
    nestSortBy: 'name',
    categoryFilter: [],
  }),

  setDraftRegion: (region) => set((s) => ({ draftFilters: { ...s.draftFilters, region } })),
  setDraftCondition: (condition) => set((s) => ({ draftFilters: { ...s.draftFilters, condition } })),
  setDraftType: (type) => set((s) => ({ draftFilters: { ...s.draftFilters, type } })),
  setDraftSortMode: (sortMode) => set((s) => ({ draftFilters: { ...s.draftFilters, sortMode } })),
  setDraftNestType: (nestType) => set((s) => ({ draftFilters: { ...s.draftFilters, nestType } })),
  setDraftNestSortBy: (nestSortBy) => set((s) => ({ draftFilters: { ...s.draftFilters, nestSortBy } })),

  toggleAccordion: (section) =>
    set((s) => ({ accordionState: { ...s.accordionState, [section]: !s.accordionState[section] } })),

  // ── Derived ────────────────────────────────────────────────────────────────
  getFilteredCities: (cities) => {
    const { regionFilter, conditionFilter, typeFilter, searchQuery, sortMode, sortDirection } = get()
    let result = [...cities]

    if (regionFilter !== 'todas') {
      result = result.filter((c) => c.region === regionFilter)
    }

    if (conditionFilter.length > 0) {
      result = result.filter((c) => conditionFilter.includes(c.condition))
    }

    if (typeFilter.length > 0) {
      result = result.filter((c) =>
        c.boostedTypes.some((type) => typeFilter.includes(type))
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.best.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q)) ||
          `${c.lat},${c.lon}`.includes(q),
      )
    }

    // Aplicar ordenamiento solo si sortMode !== ''
    if (sortMode !== '') {
      result.sort((a, b) => {
        let comparison = 0

        if (sortMode === 'name') {
          comparison = a.name.localeCompare(b.name)
        } else if (sortMode === 'density') {
          comparison = a.density - b.density
        } else if (sortMode === 'rating') {
          comparison = a.rating - b.rating
        } else if (sortMode === 'time') {
          comparison = a.localTime.localeCompare(b.localTime)
        }

        // Invertir si es descendente
        return sortDirection === 'desc' ? -comparison : comparison
      })
    }

    return result
  },
}))

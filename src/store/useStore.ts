import { create } from 'zustand'
import type { Nest } from '../types/nest'

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

type Region = 'todas' | 'asia' | 'europa' | 'america' | 'oceania' | 'africa'
type SortMode = '' | 'name' | 'density' | 'rating' | 'time'  // '' = sin ordenar
type SortDirection = 'asc' | 'desc'
type LoadingStatus = 'idle' | 'loading' | 'ready' | 'error'

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
  sidebarOpen: boolean
  loadingStatus: LoadingStatus
  loadingProgress: LoadingProgress
  sidebarMode: 'list' | 'detail' | 'favorites'
  favorites: string[]
  badgeFilter: string[]
  showBadgesOnPins: boolean
  lastUpdated: number | null
  isFilterPanelOpen: boolean
  typeFilter: string[]
  activeTab: 'clima' | 'nidos' | 'todo'
  nests: Nest[]
  selectedNest: Nest | null
  nestTypeFilter: string[]
  nestSortBy: 'name' | 'type' | 'spawnRate'
  nestSortDirection: 'asc' | 'desc'

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
  setSidebarOpen: (open: boolean) => void
  setLoadingStatus: (status: LoadingStatus) => void
  setLoadingProgress: (progress: LoadingProgress) => void
  setSidebarMode: (mode: 'list' | 'detail' | 'favorites') => void
  toggleFavorite: (cityId: string) => void
  clearFavorites: () => void
  setBadgeFilter: (badges: string[]) => void
  setShowBadgesOnPins: (show: boolean) => void
  setLastUpdated: (timestamp: number) => void
  setIsFilterPanelOpen: (open: boolean) => void
  setTypeFilter: (types: string[]) => void
  toggleType: (type: string) => void
  resetToHome: () => void
  setActiveTab: (tab: 'clima' | 'nidos' | 'todo') => void
  setNests: (nests: Nest[]) => void
  setSelectedNest: (nest: Nest | null) => void
  setNestTypeFilter: (types: string[]) => void
  toggleNestType: (type: string) => void
  setNestSortBy: (mode: 'name' | 'type' | 'spawnRate') => void
  setNestSortDirection: (direction: 'asc' | 'desc') => void

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
  sidebarOpen: (() => {
    try {
      const saved = localStorage.getItem('pwe-sidebar-open')
      return saved ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })(),
  loadingStatus: 'idle',
  loadingProgress: { cityName: '', current: 0, total: 0, percent: 0 },
  sidebarMode: 'list',
  favorites: (() => {
    try {
      const saved = localStorage.getItem('pwe-favorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })(),
  badgeFilter: ['stops', 'gyms', 'community', 'best'],
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
  activeTab: (localStorage.getItem('pwe-activeTab') as 'clima' | 'nidos' | 'todo') || 'clima',
  nests: [],
  selectedNest: null,
  nestTypeFilter: [],
  nestSortBy: 'name',
  nestSortDirection: 'asc',

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

  setSelectedCity: (city) => set({ selectedCity: city }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('light', next === 'light')
    localStorage.setItem('pwe-theme', next)
    set({ theme: next })
  },

  setSidebarOpen: (open) => {
    localStorage.setItem('pwe-sidebar-open', JSON.stringify(open))
    set({ sidebarOpen: open })
  },

  setSidebarMode: (mode) => set({ sidebarMode: mode }),

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

  setActiveTab: (tab) => {
    localStorage.setItem('pwe-activeTab', tab)
    set({ activeTab: tab })
  },

  setNests: (nests) => set({ nests }),

  setSelectedNest: (nest) => set({ selectedNest: nest }),

  setNestTypeFilter: (types) => set({ nestTypeFilter: types }),

  toggleNestType: (type) =>
    set((state) => ({
      nestTypeFilter: state.nestTypeFilter.includes(type)
        ? state.nestTypeFilter.filter((t) => t !== type)
        : [...state.nestTypeFilter, type],
    })),

  setNestSortBy: (mode) => set({ nestSortBy: mode }),

  setNestSortDirection: (direction) => set({ nestSortDirection: direction }),

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

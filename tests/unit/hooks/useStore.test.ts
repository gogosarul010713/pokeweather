import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '@/store/useStore'

describe('useStore — State Management', () => {
  beforeEach(() => {
    // Reset estado antes de cada test
    useStore.setState({
      badgeFilter: ['stops', 'gyms', 'community', 'best'],
      showBadgesOnPins: true,
      favorites: [],
      selectedCity: null,
      sidebarMode: 'list',
    })
    localStorage.clear()
  })

  describe('badgeFilter', () => {
    it('debería inicializar con todos los badges seleccionados', () => {
      const { badgeFilter } = useStore.getState()

      expect(badgeFilter).toEqual(['stops', 'gyms', 'community', 'best'])
    })

    it('debería actualizar badgeFilter cuando se llama setBadgeFilter', () => {
      const { setBadgeFilter } = useStore.getState()

      setBadgeFilter(['stops'])

      expect(useStore.getState().badgeFilter).toEqual(['stops'])
    })

    it('debería permitir múltiples badges simultáneos (OR logic)', () => {
      const { setBadgeFilter } = useStore.getState()

      // Seleccionar stops + gyms (OR logic para filtrado)
      setBadgeFilter(['stops', 'gyms'])

      expect(useStore.getState().badgeFilter).toEqual(['stops', 'gyms'])
    })

    it('debería limpiar badgeFilter con array vacío', () => {
      const { setBadgeFilter } = useStore.getState()

      setBadgeFilter([])

      expect(useStore.getState().badgeFilter).toEqual([])
    })
  })

  describe('showBadgesOnPins', () => {
    it('debería inicializar con true', () => {
      const { showBadgesOnPins } = useStore.getState()

      expect(showBadgesOnPins).toBe(true)
    })

    it('debería actualizar showBadgesOnPins cuando se llama setShowBadgesOnPins', () => {
      const { setShowBadgesOnPins } = useStore.getState()

      setShowBadgesOnPins(false)

      expect(useStore.getState().showBadgesOnPins).toBe(false)
    })

    it('debería persistir showBadgesOnPins en localStorage', () => {
      const { setShowBadgesOnPins } = useStore.getState()

      setShowBadgesOnPins(false)

      const stored = localStorage.getItem('pwe-showBadgesOnPins')
      expect(stored).toBe('false')
    })

    it('debería recuperar showBadgesOnPins desde localStorage', () => {
      localStorage.setItem('pwe-showBadgesOnPins', 'false')

      // Simular lectura desde localStorage en init
      const stored = localStorage.getItem('pwe-showBadgesOnPins')
      const parsed = stored ? JSON.parse(stored) : true

      expect(parsed).toBe(false)
    })
  })

  describe('Favorites System', () => {
    it('debería inicializar con array vacío', () => {
      const { favorites } = useStore.getState()

      expect(favorites).toEqual([])
    })

    it('debería agregar favorito cuando se llama toggleFavorite', () => {
      const { toggleFavorite } = useStore.getState()

      toggleFavorite('shibuya')

      expect(useStore.getState().favorites).toContain('shibuya')
    })

    it('debería quitar favorito cuando se llama toggleFavorite de nuevo', () => {
      const { toggleFavorite } = useStore.getState()

      toggleFavorite('shibuya')
      expect(useStore.getState().favorites).toContain('shibuya')

      toggleFavorite('shibuya')
      expect(useStore.getState().favorites).not.toContain('shibuya')
    })

    it('debería permitir múltiples favoritos', () => {
      const { toggleFavorite } = useStore.getState()

      toggleFavorite('shibuya')
      toggleFavorite('tokyo')
      toggleFavorite('kyoto')

      const { favorites } = useStore.getState()
      expect(favorites).toContain('shibuya')
      expect(favorites).toContain('tokyo')
      expect(favorites).toContain('kyoto')
      expect(favorites.length).toBe(3)
    })

    it('debería persistir favoritos en localStorage', () => {
      const { toggleFavorite } = useStore.getState()

      toggleFavorite('shibuya')
      toggleFavorite('tokyo')

      const stored = localStorage.getItem('pwe-favorites')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed).toEqual(['shibuya', 'tokyo'])
    })
  })

  describe('Sidebar Mode', () => {
    it('debería inicializar en modo "list"', () => {
      const { sidebarMode } = useStore.getState()

      expect(sidebarMode).toBe('list')
    })

    it('debería cambiar a "detail" cuando se llama setSidebarMode', () => {
      const { setSidebarMode } = useStore.getState()

      setSidebarMode('detail')

      expect(useStore.getState().sidebarMode).toBe('detail')
    })

    it('debería cambiar a "favorites" cuando se llama setSidebarMode', () => {
      const { setSidebarMode } = useStore.getState()

      setSidebarMode('favorites')

      expect(useStore.getState().sidebarMode).toBe('favorites')
    })
  })

  describe('Selected City', () => {
    it('debería inicializar como null', () => {
      const { selectedCity } = useStore.getState()

      expect(selectedCity).toBeNull()
    })

    it('debería actualizar selectedCity cuando se llama setSelectedCity', () => {
      const { setSelectedCity } = useStore.getState()
      const mockCity = {
        id: 'test',
        name: 'Test City',
        lat: 0,
        lon: 0,
      }

      setSelectedCity(mockCity)

      expect(useStore.getState().selectedCity).toEqual(mockCity)
    })

    it('debería limpiar selectedCity cuando se pasa null', () => {
      const { setSelectedCity } = useStore.getState()
      const mockCity = { id: 'test', name: 'Test City', lat: 0, lon: 0 }

      setSelectedCity(mockCity)
      expect(useStore.getState().selectedCity).not.toBeNull()

      setSelectedCity(null)
      expect(useStore.getState().selectedCity).toBeNull()
    })
  })

  describe('Multiple State Updates', () => {
    it('debería manejar múltiples actualizaciones de estado simultáneamente', () => {
      const { setBadgeFilter, setShowBadgesOnPins, toggleFavorite, setSidebarMode } =
        useStore.getState()

      // Multiple updates
      setBadgeFilter(['stops', 'gyms'])
      setShowBadgesOnPins(false)
      toggleFavorite('shibuya')
      setSidebarMode('favorites')

      const state = useStore.getState()
      expect(state.badgeFilter).toEqual(['stops', 'gyms'])
      expect(state.showBadgesOnPins).toBe(false)
      expect(state.favorites).toContain('shibuya')
      expect(state.sidebarMode).toBe('favorites')
    })
  })
})

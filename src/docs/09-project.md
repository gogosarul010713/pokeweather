# 📋 Pokémon Weather Explorer — Backlog & Sprints

---

## **Sprint 1: Layout & Structure** ✅ COMPLETADO
Cimientos de la aplicación: estructura base, navegación, gestión de estado y carga asincrónica.

### US-103: App Layout Shell
**Estado**: ✅ Completado
- Estructura principal: Header (80px) | Sidebar (280px) | MapArea
- CSS Grid 3-columnas
- overflow: hidden en html/body/#root

---

### US-104: Header Placeholder
**Estado**: ✅ Completado
- Height: 80px, fixed top
- Flex layout con Brand en izquierda, derechos en derecha
- Placeholder para FilterBar + ConditionPanel + SyncBadge + ThemeToggle

---

### US-105: Zustand Store (useStore.ts)
**Estado**: ✅ Completado
- State: `regionFilter`, `conditionFilter`, `searchQuery`, `sortMode`, `selectedCity`, `theme`, `sidebarOpen`, `loadingStatus`, `loadingProgress`
- Actions: toggle/set/clear para cada estado
- Selector: `getFilteredCities()`
- Persistencia: `pwe-theme` en localStorage

---

### US-106: Header Brand + ThemeToggle
**Estado**: ✅ Completado
- Brand: PokéBall SVG (34px) + "PokéWeather MAPTRACKER" (Rajdhani 700)
- ThemeToggle: botón 32px con 🌙/☀️, persiste en localStorage

---

### US-107: Sidebar Placeholder
**Estado**: ✅ Completado
- MenuStrip: 44px (3 placeholders de iconos SVG)
- LocationFeed: flex:1, spinner + "Cargando ciudades..."

---

### US-108: MapView + Leaflet Integration
**Estado**: ✅ Completado
- MapContainer (react-leaflet) centrado en lat:20, lon:0, zoom:2
- TileSwitcher: CartoDB Dark Matter (dark) / Positron (light)
- Imperatively swaps tiles en `useEffect` al cambiar theme

---

### US-109: SyncBadge Placeholder
**Estado**: ✅ Completado (refactorizado a funcional)
- Lee `loadingStatus` del store: 'loading' | 'error' | 'ready'
- Estados: spinner → "✓ Actualizado" al terminar

---

## **Sprint 2: Data Layer** ✅ COMPLETADO
Carga progresiva, caché, mock data, e integración de servicios.

### US-201: Weather Config & SVG Assets
**Estado**: ✅ Completado
- `src/config/weatherImages.ts`: tipo `WeatherCondition`, `WEATHER_IMAGES`, `CONDITION_EMOJIS`
- 7 SVGs placeholder: sunny.svg, partly.svg, cloudy.svg, fog.svg, rain.svg, snow.svg, windy.svg

---

### US-202: Mock Cities (94 dinámicas)
**Estado**: ✅ Completado
- `src/data/mockCities.ts`: lee pokedensity-cities.json, asigna condición climática + tipos Pokémon
- **Fix**: `import type { WeatherCondition }` (evita Vite runtime error)

---

### US-203: Cache Service (IndexedDB + localStorage)
**Estado**: ✅ Completado
- `src/data/cacheService.ts`: `getCache()`, `setCache()`, `clearCache()`

---

### US-204: Weather Service (buildCityWeather)
**Estado**: ✅ Completado
- `src/data/weatherService.ts`: `CONDITION_TO_TYPES` map, `buildCityWeather()` function

---

### US-205: useWeather Hook (Progressive Loading)
**Estado**: ✅ Completado
- `src/hooks/useWeather.ts`: carga ciudades iterativamente
- Actualiza `loadingProgress` (cityName, current, total, percent)
- Completa con `loadingStatus: 'ready'`

---

### US-206: LoadingScreen (PokéBall + Progress)
**Estado**: ✅ Completado
- Full-screen overlay mientras `loadingStatus === 'loading'`
- PokéBall spinner + "ciudad X de 94" + progress bar

---

## **Sprint 3: Header Completo (Refactorizado)** 🔄 EN PROGRESO
Filtros jerárquicos con dropdowns, búsqueda debounced, y sincronización.

### US-300: CustomSelect (Nuevo - Dropdown Reutilizable)
**Estado**: 🔄 EN PROGRESO
- Componente dropdown genérico y reutilizable
- Props: `label`, `value`, `options` (label/value), `onChange`
- Soporta single-select (región, hora) y multi-select (clima, tipos)
- Chevron visual + popup scroll
- CSS: colores por tema, bordes, hover/active states
- Archivo: `src/components/UI/CustomSelect.tsx`

**Subtareas:**
- [ ] Crear CustomSelect.tsx
- [ ] Estilos: botón base, popup, open/close animation
- [ ] Integración multi-select: array de valores
- [ ] Keyboard support (Enter/Escape/Arrow)

---

### US-301: FilterPanel (Dropdowns Jerarquizados)
**Estado**: 🔄 EN PROGRESO
**Antes**: FilterBar (chips región) + SearchInput + ConditionPanel (botones clima) → **Ahora**: FilterPanel (4 dropdowns unificados)

**Reemplaza**: US-303 (FilterBar), US-304 (WeatherConditionCard), US-305 (ConditionPanel)

- **Dropdown 1: Continente** (single-select: Todas | Asia | Europa | América | Oceanía | África)
  - Controla `regionFilter` del store

- **Dropdown 2: Clima** (multi-select: ☀️ Sunny | ⛅ Partly | ☁️ Cloudy | 🌫️ Fog | 🌧️ Rain | ❄️ Snow | 💨 Windy)
  - Controla `conditionFilter` del store
  - Incluye botón "Limpiar" (solo visible si hay filtros activos)

- **Dropdown 3: Tipo Pokémon** (multi-select: futura integración con `boostedTypes`)
  - Placeholder p/futuro; inicialmente deshabilitado o "Todos"

- **Dropdown 4: Hora Local** (single-select: Ordenar por | Nombre | Densidad | Rating | Hora Local)
  - Controla `sortMode` del store

- **SearchInput** integrado debajo (magnifier + field + ✕ clear)

**Archivo**: `src/components/Header/FilterPanel.tsx`

---

### US-302: Header Integration (Final)
**Estado**: 🔄 EN PROGRESO
- Reemplaza `FilterBar` + `ConditionPanel` por `FilterPanel`
- Estructura: Brand | FilterPanel | [ConditionPanel derecha] | SyncBadge | ThemeToggle
- **Dirección**: SyncBadge + ThemeToggle a la derecha (sin cambio)
- **Archivo modificado**: `src/components/Header/Header.tsx`

---

### US-303, US-304, US-305: (Deprecated)
**Estado**: ❌ REMOVIDOS / INTEGRADOS
- FilterBar → Integrado en FilterPanel
- WeatherConditionCard → Integrado en FilterPanel (Dropdown Clima)
- ConditionPanel → Integrado en FilterPanel

**Archivos a eliminar:**
- `src/components/Header/FilterBar.tsx`
- `src/components/Header/ConditionPanel/ConditionPanel.tsx`
- `src/components/Header/ConditionPanel/WeatherConditionCard.tsx`

---

### US-306: SyncBadge Funcional
**Estado**: ✅ Completado
- Funcional en Sprint 2/3
- Mantener tal cual

---

## **Sprint 4: Sidebar Completo** 🔄 EN PROGRESO
Sidebar con 3 modos (Lista · Detalle · Favoritos), LocationCard, y LocationDetail modal.

### US-401: LocationCard Component
**Estado**: ⏳ Pendiente
- Card individual: 🚩 Flag | City name · Country | ☀️ Condition | ⭐ Rating
- Click: selecciona city → `setSelectedCity()` → activa Modo Detalle
- Hover: destaca, cursor pointer
- Archivo: `src/components/Sidebar/LocationCard.tsx`

**Subtareas:**
- [ ] Layout horizontal con flag (24px), nombre, país, clima, rating
- [ ] Responsive: no desborde a 280px sidebar
- [ ] Estados: default, hover (bg overlay), active (border accent)

---

### US-402: LocationFeed (Funcional)
**Estado**: ⏳ Pendiente
- Scroll lista de LocationCard
- Conectado a `getFilteredCities()` del store
- Actualiza reactivamente cuando filtros/búsqueda cambian
- Click en card ejecuta US-403 (cambia a Modo Detalle)
- Archivo: actualiza `src/components/Sidebar/Sidebar.tsx`

---

### US-403: MenuStrip (3 Modos)
**Estado**: ⏳ Pendiente
- 3 iconos/botones: 📋 Lista | 📍 Detalle | ⭐ Favoritos
- **Modo Lista** (default): muestra LocationFeed filtrada
- **Modo Detalle**: activado al seleccionar ciudad (US-404)
- **Modo Favoritos**: muestra solo ciudades guardadas (US-405)
- Store: `sidebarMode: 'list' | 'detail' | 'favorites'` + `setSidebarMode()`
- Archivo: actualiza `src/components/Sidebar/Sidebar.tsx`

---

### US-404: LocationDetail Modal (Nuevo)
**Estado**: ⏳ Pendiente
- Modal/panel sobre el mapa con info de ciudad seleccionada
- Contenido: nombre, país, región, clima, tipos, density, stops, gyms, rating, tips
- Botón ❌ close o click fuera cierra
- Click ❤️ agrega/quita favorito (rojo si favorito)
- Botón "Ver en lista" → vuelve a Modo Lista
- Se abre automáticamente cuando `selectedCity !== null` y `sidebarMode === 'detail'`
- Archivo: `src/components/Sidebar/LocationDetail.tsx`

**Subtareas:**
- [ ] Modal posicionado sobre mapa (z-index 500)
- [ ] Animación fade in/out 200ms
- [ ] Responsive: 90vw mobile, 400px desktop
- [ ] Botón ❤️ integrado con US-405

---

### US-405: Favorites System (Nuevo)
**Estado**: ⏳ Pendiente
- Store: `favorites: string[]` (array de city IDs)
- Actions: `toggleFavorite(cityId)`, `clearFavorites()`
- Persistencia: localStorage key `pwe-favorites`
- LocationCard: indica si es favorito (❤️ fill si sí)
- LocationDetail: botón ❤️ para toggle
- LocationFeed en Modo Favoritos: solo muestra ciudades en `favorites`
- Archivo: actualiza `src/data/useStore.ts`

**Subtareas:**
- [ ] Agregar state/actions al store
- [ ] localStorage sync
- [ ] Icon ❤️ en LocationCard
- [ ] LocationFeed filtra por favoritos en Modo Favoritos

---

### Resumen Sprint 4:

| US | Componente | SP | Interdependencias |
|----|-----------|----|----|
| US-401 | LocationCard.tsx | 3 | US-402 |
| US-402 | LocationFeed (refactor) | 3 | US-401, US-403 |
| US-403 | MenuStrip (refactor) | 3 | US-402, US-404 |
| US-404 | LocationDetail.tsx | 4 | US-405 |
| US-405 | Favorites system | 3 | useStore.ts |
| **Total** | | **16 SP** | |

---

## **Sprint 5: MapView Completo** 🗺️ PENDIENTE
Pins en mapa, popups interactivos, clustering.

### US-501: MapPin Component
**Estado**: ⏳ Pendiente
- Custom Leaflet marker con ícono SVG (PokéBall coloreada por tipo)
- Renderiza para cada ciudad en `getFilteredCities()`

---

### US-502: CityPopup (Mapa)
**Estado**: ⏳ Pendiente
- Popup al click pin: nombre, país, tipo, clima, hora local
- Botón "Ver detalles" → selecciona city

---

### US-503: Map Interactions
**Estado**: ⏳ Pendiente
- Zoom a ciudad al seleccionar desde sidebar
- Highlight pin de ciudad seleccionada
- Cluster pins si hay muchos (react-leaflet-markercluster)

---

## **Sprint 6: Polish & PWA** ✨ PENDIENTE
Detalles finales, rendimiento, offline, instalable.

### US-601: Responsive Design
**Estado**: ⏳ Pendiente
- Mobile/tablet breakpoints (sidebar collapsible, header adjustments)

---

### US-602: CityDetail Modal / Panel
**Estado**: ⏳ Pendiente
- Expandible detail view: clima, tipo, hora, tips, transportes, etc.

---

### US-603: PWA Setup (Service Worker + Manifest)
**Estado**: ⏳ Pendiente
- `public/manifest.json`: app name, icons, theme colors
- Offline support vía service worker

---

### US-604: Performance & Optimizations
**Estado**: ⏳ Pendiente
- Code splitting (lazy load componentes)
- Image optimization (SVGs minificadas)
- React.memo para LocationCard, etc.

---

## **Cambios Recientes (2026-03-20)**

### Refactorización Sprint 3 (Dropdowns)
- **Razón**: Escalabilidad, UX profesional, jerarquía clara
- **Impacto**:
  - Nueva US-300 (CustomSelect)
  - US-301 ahora integra Clima, Continente, Tipo, Hora en 4 dropdowns
  - Deprecación: US-303, US-304, US-305 (contenido movido a US-301)
  - Archivos eliminados: FilterBar.tsx, ConditionPanel/, WeatherConditionCard.tsx
  - Archivos nuevos: CustomSelect.tsx, FilterPanel.tsx
  - Archivos updateados: Header.tsx

---

## **Status Overall**

| Sprint | Completado | En Progreso | Pendiente | Estado      |
|--------|-----------|-------------|-----------|------------|
| 1      | ✅ 7/7    | -           | -         | ✅ HECHO   |
| 2      | ✅ 6/6    | -           | -         | ✅ HECHO   |
| 3      | ⏳ 1/6    | 🔄 5/6      | -         | 🔄 EN CURSO |
| 4      | -         | -           | ⏳ 3/3    | ⏳ TODO    |
| 5      | -         | -           | ⏳ 3/3    | ⏳ TODO    |
| 6      | -         | -           | ⏳ 4/4    | ⏳ TODO    |

**Total completado**: 14/32 US (43%)

---

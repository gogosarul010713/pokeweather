# 05-BACKLOG — Pokémon Weather Explorer v2
# Product backlog completo. Todas las épicas y user stories.
# Ver 06-sprints.md para la asignación por sprint.

---

## CONVENCIONES

- **US-XXX** — User Story
- **SP** — Story Points (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Prioridad**: 🔴 Crítico · 🟡 Alto · 🟢 Medio · ⚪ Bajo
- **Estado**: ⏳ Pendiente · 🔨 En progreso · ✅ Completado

---

## ÉPICAS

| ID | Nombre | Descripción |
|----|--------|-------------|
| EP-01 | Foundation | Estructura base, layout, sistema de diseño, Zustand |
| EP-02 | Dataset dinámico | Ciudades actualizables editando solo el JSON |
| EP-03 | Caché local | Persistencia de datos entre sesiones |
| EP-04 | Loading progresivo | Pantalla de carga ciudad por ciudad con progreso |
| EP-05 | Imágenes configurables | Rutas de imágenes de clima intercambiables |
| EP-06 | Header | Búsqueda, filtros, condiciones climáticas, sync |
| EP-07 | Sidebar | Lista de ciudades con métricas Pokémon GO |
| EP-08 | Mapa | Pines, tooltips, navegación geográfica, leyenda |
| EP-09 | API AccuWeather | Datos climáticos reales, refresh, alertas |
| EP-10 | Responsive | Tablet y mobile |

---

## EP-01 · Foundation

### US-101 · Setup del proyecto
**SP:** 2 · **Prioridad:** 🔴

**Como** desarrollador,
**quiero** un proyecto Vite + React 18 configurado con todas las dependencias,
**para** tener una base lista sin fricción.

**Criterios de aceptación:**
- [ ] `npm create vite@latest` con template React
- [ ] Instaladas: `react-leaflet`, `leaflet`, `zustand`, `idb-keyval`, `s2-geometry`
- [ ] Google Fonts (Rajdhani + Exo 2) en `index.css`
- [ ] `npm run dev` sin errores en localhost:5173
- [ ] `.env.example` con `VITE_ACCUWEATHER_KEY=`
- [ ] Carpeta `docs/` con los 6 archivos de contexto

---

### US-102 · Sistema de variables CSS
**SP:** 3 · **Prioridad:** 🔴

**Como** desarrollador,
**quiero** todas las variables CSS del design system en `index.css`,
**para** que los componentes tengan colores y tipografía consistentes.

**Criterios de aceptación:**
- [ ] Variables `:root` (dark): fondos, texto, bordes, UI semántica
- [ ] Override `html.light`: fondos, texto, bordes, UI semántica
- [ ] Variables `--condition-{x}` y `--condition-{x}-rgb` (7 condiciones)
- [ ] Variables `--type-{x}` y `--type-{x}-rgb` (18 tipos Pokémon)
- [ ] Reset CSS y `html, body, #root { height: 100% }`
- [ ] Keyframes: `cardIn`, `popIn`, `glowPulse`, `pokeBallSpin`
- [ ] Cero colores hardcodeados en componentes

---

### US-103 · Init de tema (main.jsx)
**SP:** 1 · **Prioridad:** 🔴

**Como** usuario,
**quiero** que la app recuerde mi tema entre sesiones,
**para** no cambiar el tema cada vez.

**Criterios de aceptación:**
- [ ] Lee `localStorage.getItem('pwe-theme')` antes de renderizar
- [ ] Aplica `classList.add('light')` si valor es `'light'`
- [ ] Default: tema oscuro
- [ ] Sin FOUC (flash de tema incorrecto)

---

### US-104 · Shell de 3 zonas (App.jsx)
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** ver el layout general al cargar (header, sidebar, mapa),
**para** entender la estructura de la app.

**Criterios de aceptación:**
- [ ] Header fijo 80px, ancho 100%
- [ ] Sidebar 280px (MenuStrip 44px + LocationFeed flex:1)
- [ ] MapArea flex:1, altura = viewport - 80px
- [ ] Colores via variables CSS en cada zona
- [ ] Placeholders con texto en cada zona
- [ ] Sin scroll horizontal en > 1024px

---

### US-105 · Zustand store (useStore.js)
**SP:** 3 · **Prioridad:** 🔴

**Como** desarrollador,
**quiero** el store Zustand con todos los campos y acciones,
**para** que los componentes se conecten al estado global.

**Criterios de aceptación:**
- [ ] Estado: `regionFilter`, `conditionFilter`, `searchQuery`, `sortMode`, `selectedCity`, `theme`, `sidebarOpen`, `loadingStatus`, `loadingProgress`
- [ ] Acciones: `setRegionFilter`, `toggleCondition`, `clearConditions`, `setSearchQuery`, `setSortMode`, `setSelectedCity`, `toggleTheme`, `setSidebarOpen`, `setLoadingProgress`
- [ ] `toggleTheme` actualiza classList y localStorage
- [ ] `getFilteredCities(cities)` con filtro región, condición, búsqueda y sort

---

### US-106 · Header placeholder con Brand y ThemeToggle
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** ver el header con logo y botón de tema,
**para** identificar la app y cambiar entre dark/light.

**Criterios de aceptación:**
- [ ] Header.jsx: 80px, `bg-secondary`, `border-bottom`
- [ ] Brand.jsx: PokéBall SVG 34px + "PokéWeather" Rajdhani 700 + "Map Tracker" muted
- [ ] ThemeToggle: 32px, 🌙/☀️, llama `toggleTheme()`
- [ ] Cambio de tema visual en tiempo real
- [ ] Placeholder en zona central y derecha del header

---

### US-107 · Sidebar placeholder
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** ver la sidebar con su estructura de dos zonas,
**para** anticipar la lista de ciudades.

**Criterios de aceptación:**
- [ ] Sidebar.jsx: 280px, `bg-secondary`, `border-right`
- [ ] MenuStrip: 44px, `bg-primary`, 3 íconos placeholder
- [ ] LocationFeed: flex:1, scroll vertical, texto "Cargando..."
- [ ] Sin colapso en desktop

---

### US-108 · MapArea con Leaflet
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** ver un mapa real en la zona de mapa,
**para** confirmar la integración con Leaflet.

**Criterios de aceptación:**
- [ ] MapView.jsx ocupa 100% del área disponible
- [ ] Tiles dark: CartoDB Dark Matter
- [ ] Tiles light: CartoDB Positron
- [ ] Cambia tiles al cambiar tema (sin recargar)
- [ ] Vista inicial: lat 20, lon 0, zoom 2
- [ ] Sin errores Leaflet en consola

---

### US-109 · SyncBadge placeholder
**SP:** 1 · **Prioridad:** 🟢

**Como** usuario,
**quiero** ver el indicador de sincronización en el header,
**para** conocer el estado de los datos.

**Criterios de aceptación:**
- [ ] Pill 28px en header
- [ ] Estado `loading`: `--ui-warning`, spinner
- [ ] Estado `error`: `--ui-error`, "Error · Reintentar"
- [ ] Estado `ok`: `--ui-success`, "✓ hace Xm"
- [ ] Default: `loading` en Sprint 1

---

## EP-02 · Dataset dinámico

### US-201 · mockCities.js dinámico
**SP:** 2 · **Prioridad:** 🔴

**Como** desarrollador,
**quiero** que `mockCities.js` derive todas las ciudades del JSON automáticamente,
**para** que agregar/quitar ciudades no requiera cambios en código.

**Criterios de aceptación:**
- [ ] Importa `pokedensity-cities.json` con import estático
- [ ] Transforma TODOS los entries (sin hardcodear cantidad)
- [ ] `lng` → `lon` en la transformación
- [ ] `id` via slugify del nombre
- [ ] `weatherImage` via `WEATHER_IMAGES[condition]`
- [ ] Funciona igual con 10 o 500 ciudades

---

## EP-03 · Caché local

### US-202 · cacheService.js
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** que los datos climáticos se guarden localmente,
**para** que la app cargue rápido en visitas posteriores.

**Criterios de aceptación:**
- [ ] `getCachedWeather(s2Key)` → null si no existe o expirado
- [ ] `setCachedWeather(s2Key, data)` → guarda con timestamp
- [ ] `getCachedLocationKey(s2Key)` / `setCachedLocationKey` en localStorage
- [ ] TTL 60 min configurable via `WEATHER_TTL_MS`
- [ ] Fallback silencioso si IndexedDB falla
- [ ] `clearWeatherCache()` exportado para debugging

---

## EP-04 · Loading progresivo

### US-203 · useWeather con progreso
**SP:** 8 · **Prioridad:** 🔴

**Como** usuario,
**quiero** que la app cargue progresivamente informando el avance,
**para** saber que la app trabaja y no está congelada.

**Criterios de aceptación:**
- [ ] `useWeather(cities)` acepta array de cualquier tamaño
- [ ] Verifica caché antes de llamar API
- [ ] Emite `setLoadingProgress` por cada ciudad procesada
- [ ] `loadingStatus`: `'loading'` → `'ready'` (o `'error'`)
- [ ] Si TODAS en caché: carga instantánea (sin pantalla de carga)
- [ ] Mock: delays de 80ms para simular progreso visible
- [ ] API: guarda en caché al obtener datos
- [ ] Refresh en próxima HH:00

---

### US-204 · LoadingScreen
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** una pantalla de carga atractiva con progreso real,
**para** saber exactamente qué está cargando.

**Criterios de aceptación:**
- [ ] Fullscreen mientras `loadingStatus === 'loading'`
- [ ] PokéBall animada (pokeBallSpin 2s infinite)
- [ ] Texto "Cargando {cityName}..." Rajdhani 600
- [ ] Subtexto "ciudad {current} de {total}" Exo 2
- [ ] Barra de progreso 0–100% según `percent`
- [ ] Fade-out 0.4s cuando `loadingStatus === 'ready'`
- [ ] No se muestra si caché cubre todas las ciudades
- [ ] Compatible con dark y light

---

## EP-05 · Imágenes configurables

### US-205 · weatherImages.js + assets placeholder
**SP:** 1 · **Prioridad:** 🔴

**Como** diseñador,
**quiero** rutas de imágenes centralizadas por condición,
**para** cambiar todas las imágenes de clima en un solo lugar.

**Criterios de aceptación:**
- [ ] `src/config/weatherImages.js` exporta `WEATHER_IMAGES` con 7 condiciones
- [ ] Rutas apuntan a `public/weather/{condition}.png`
- [ ] 7 archivos placeholder existen en `public/weather/`
- [ ] Ningún componente usa rutas hardcodeadas
- [ ] Si imagen no carga → falla silenciosamente

---

## EP-06 · Header

### US-301 · CustomSelect — Dropdown reutilizable
**SP:** 3 · **Prioridad:** 🔴
> ⚠️ Reemplaza: US-301 (FilterChip), US-304 (WeatherConditionCard) — 2026-03-20

**Como** desarrollador,
**quiero** un componente dropdown genérico y reutilizable,
**para** construir todos los filtros del header con una sola pieza base.

**Criterios de aceptación:**
- [x] Props: `label`, `value`, `options[]`, `onChange`, `isMulti?`, `selectedItems?`, `disabled?`
- [x] `SelectOption` soporta campo `icon?: string` — si existe, renderiza `<img>` en opción y en trigger
- [x] Botón trigger: `bg-tertiary`, borde, chevron ▼ que rota al abrir
- [ ] Popup: `bg-secondary`, sombra, `border-radius 6px`, `max-height 280px`, scroll
- [ ] Animación `popIn` 150ms al abrir
- [ ] Single-select: click opción cierra popup
- [ ] Multi-select: checkbox por opción, permanece abierto, muestra "N seleccionados"
- [ ] Click fuera cierra popup (mousedown listener)
- [ ] Estado `disabled`: opacidad 0.5, cursor not-allowed
- [ ] Opción activa: `rgba(accent, 0.1)`, color accent, font-weight 600
- [ ] Archivo: `src/components/UI/CustomSelect.tsx`

---

### US-302 · SearchInput
**SP:** 2 · **Prioridad:** 🔴

**Como** usuario,
**quiero** un campo de búsqueda en el header,
**para** encontrar ciudades por nombre, país o tipo de lugar.

**Criterios de aceptación:**
- [ ] Pill h:28px, min-width:180px
- [ ] Placeholder "Buscar ciudad..." en `--text-secondary`
- [ ] Focus: `border-color --ui-accent`
- [ ] Debounce 200ms → `setSearchQuery`
- [ ] Ícono lupa a la izquierda
- [ ] Botón X para limpiar (solo si hay texto)

---

### US-303 · FilterPanel — Dropdowns jerarquizados
**SP:** 4 · **Prioridad:** 🔴
> ⚠️ Reemplaza: US-303 (FilterBar chips), US-305 (ConditionPanel) — 2026-03-20

**Como** usuario,
**quiero** filtros jerárquicos con dropdowns en el header,
**para** combinar región, clima, tipo Pokémon y orden de forma escalable.

**Criterios de aceptación:**
- [x] `FilterPanel` flex:1 en centro del header, fila horizontal, `height: 48px`
- [x] **Dropdown 1 — Continente** (single-select): Todas · Asia · Europa · América · Oceanía · África → `setRegionFilter`
- [ ] **Dropdown 2 — Clima** (multi-select): ☀️ Sunny · ⛅ Partly · ☁️ Cloudy · 🌫️ Fog · 🌧️ Rain · ❄️ Snow · 💨 Windy → `setConditionFilter`
- [ ] **Dropdown 3 — Tipo Pokémon** (placeholder, disabled): "Todos (próximamente)" — se activará en Sprint 4
- [ ] **Dropdown 4 — Ordenar por** (single-select): Nombre · Densidad · Rating · Hora Local → `setSortMode`
- [ ] Botón "✕ Limpiar" visible solo si `conditionFilter.length > 0`
- [x] **Dropdown 2 — Clima** (multi-select): 7 condiciones con imagen PNG `/weather/{condition}.png` (sin emojis)
- [x] Divider visual entre dropdowns y SearchInput
- [x] Reactivo: cambio en cualquier dropdown actualiza LocationFeed y pines
- [x] Archivo: `src/components/Header/FilterPanel.tsx`

---

### US-304 · ~~WeatherConditionCard~~ — DEPRECATED
**SP:** ~~3~~ · **Prioridad:** ~~🔴~~
> ❌ Removido 2026-03-20 — funcionalidad integrada en US-303 (FilterPanel, Dropdown Clima)
> Archivo eliminado: `src/components/Header/ConditionPanel/WeatherConditionCard.tsx`

---

### US-305 · ~~ConditionPanel~~ — DEPRECATED
**SP:** ~~2~~ · **Prioridad:** ~~🔴~~
> ❌ Removido 2026-03-20 — funcionalidad integrada en US-303 (FilterPanel, Dropdown Clima)
> Archivo eliminado: `src/components/Header/ConditionPanel/ConditionPanel.tsx`

---

### US-306 · SyncBadge funcional
**SP:** 2 · **Prioridad:** 🟡

**Como** usuario,
**quiero** ver el estado real de sincronización,
**para** saber si los datos son recientes.

**Criterios de aceptación:**
- [ ] Conectado a `loadingStatus` del store
- [ ] `loading` → spinner + "Sincronizando..."
- [ ] `ready` → ✓ + "Actualizado hace Xm"
- [ ] `error` → ✕ + "Error · Reintentar", click re-fetch
- [ ] Timestamp desde `updatedAt` de la última ciudad

---

## EP-07 · Sidebar

### US-405 · Favorites System
**SP:** 3 · **Prioridad:** 🔴
> Implementar primero — base para LocationCard, LocationFeed y MenuStrip

**Como** usuario,
**quiero** marcar ciudades como favoritas y que se guarden entre sesiones,
**para** acceder rápidamente a mis lugares favoritos.

**Criterios de aceptación:**
- [ ] Store: `favorites: string[]` (array de city IDs)
- [ ] Actions: `toggleFavorite(cityId)`, `clearFavorites()`
- [ ] localStorage sync: `pwe-favorites` clave
- [ ] LocationCard muestra ❤️ rojo si es favorito, outline si no
- [ ] LocationDetail modal tiene botón ❤️ para toggle
- [ ] LocationFeed en Modo Favoritos filtra a solo array `favorites`
- [ ] Archivo: actualiza `src/data/useStore.ts`

---

### US-401 · LocationCard
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** cards con los datos de Pokémon GO por ciudad,
**para** ver clima, tipos y decidir qué ciudad explorar.

**Criterios de aceptación:**
- [x] Layout: `[WeatherIcon 36px] + [body: row1(nombre+tipos) / row2(país+datetime)]`
- [x] Weather icon: `/weather/{condition}.png` 36×36px, onError: `display:none`
- [x] Nombre ciudad: Exo 2 700 14px, ellipsis + `title` para tooltip nativo
- [x] País: Exo 2 400 12px, --text-secondary (row 2 izquierda)
- [x] Tipos: `/types/ico_{n}_{type}.webp` 22×22px, máx 4, inline en row 1
- [x] Sin label "TIPOS POTENCIADOS" visible
- [x] Fecha local via `city.timezone` → `new Date() + offset` → `DD/MM`
- [x] Hora: `city.localTime` (24h) → `HH:MM AM/PM` (row 2 derecha)
- [x] ❤️ `position:absolute; top:8px; right:8px` — fuera del flujo
- [x] Body con `padding-right:24px` para no solapar el ❤️
- [x] Click card: `setSelectedCity(city)` + `setSidebarMode('detail')`
- [x] Click ❤️: `toggleFavorite(city.id)` con `stopPropagation`
- [x] Sin flag emoji · Sin rating · Sin ClimateBadge
- [x] Archivo: `src/components/Sidebar/LocationCard.tsx`

---

### US-402 · LocationFeed
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** la lista filtrada de ciudades que puedo navegar,
**para** encontrar rápidamente dónde quiero ir.

**Criterios de aceptación:**
- [ ] Scroll vertical de LocationCard[] componentes
- [ ] Conectado a `getFilteredCities()` del store
- [ ] Si `sidebarMode === 'favorites'`: filtra a solo array `favorites`
- [ ] Contador "N ciudades" en header
- [ ] Mensaje "Sin resultados" si array vacío
- [ ] Actualización reactiva al cambiar filtros/búsqueda del header
- [ ] Click en card → `setSelectedCity()` → abre LocationDetail
- [ ] Archivo: actualiza `src/components/Sidebar/Sidebar.tsx`

---

### US-403 · MenuStrip (3 Modos)
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** íconos de navegación que cambien el contenido de la sidebar,
**para** alternar entre lista, detalle y favoritos.

**Criterios de aceptación:**
- [ ] 3 botones/iconos: 📋 Lista | 📍 Detalle | ⭐ Favoritos
- [ ] Store: `sidebarMode: 'list' | 'detail' | 'favorites'` + `setSidebarMode()`
- [ ] Click ícono → actualiza `sidebarMode`
- [ ] Activo: color primario. Inactivo: muted
- [ ] **Modo Lista** (default): LocationFeed filtrada
- [ ] **Modo Detalle**: LocationDetail modal (activado al seleccionar ciudad)
- [ ] **Modo Favoritos**: LocationFeed filtra por `favorites` array
- [ ] Tooltip al hover
- [ ] Archivo: actualiza `src/components/Sidebar/Sidebar.tsx`

---

### US-404 · LocationDetail Modal
**SP:** 4 · **Prioridad:** 🔴

**Como** usuario,
**quiero** un modal con toda la información detallada de una ciudad,
**para** ver datos completos sin salir de la app.

**Criterios de aceptación:**
- [x] Modal overlay sobre el mapa, z-index 500, animación slideUp 250ms
- [x] **Header**: WeatherIcon 48px + columna (nombre, país·región, coords + 📋) + [❤️][✕]
- [x] Coordenadas `lat.toFixed(4), lon.toFixed(4)` en el header como info principal
- [x] Botón copiar: ícono clipboard SVG → check SVG al copiar, 2s, estilo accent
- [x] **Clima**: PNG `/weather/{condition}.png` 32px + label + `temp°C · Sensación X°C`
- [x] **Tipos potenciados**: imágenes `/types/ico_{n}_{type}.webp` 36px (sin text badges)
- [x] **Hora local**: `DD/MM · HH:MM AM/PM` calculada con `city.timezone` (sin label redundante)
- [x] **Datos Pokémon GO**: 4 stat chips en grid (Densidad · Stops · Gyms · Rating)
- [x] Tips y Evento si existen (Transporte eliminado — irrelevante)
- [x] Sin Humedad ni Viento (eliminados)
- [x] Botón ❤️ toggle favorito (rojo si activo)
- [x] Botón ✕ + click outside + Escape → cierra modal
- [x] Botón "Ver en lista" → `setSidebarMode('list')`
- [x] Se abre si `selectedCity !== null` y `sidebarMode === 'detail'`
- [x] Archivo: `src/components/Sidebar/LocationDetail.tsx`

---

## EP-08 · Mapa

### US-501 · MapPin ✅
**SP:** 5 · **Prioridad:** 🔴 · **Estado:** ✅ Completado (2026-03-22)

**Como** usuario,
**quiero** un pin por ciudad con el color de su clima,
**para** visualizar el clima global de un vistazo.

**Criterios de aceptación:**
- [x] Leaflet DivIcon, tamaño fijo (22×29px)
- [x] Fill: `--condition-{x}` del clima de la ciudad
- [x] Border: `2px solid rgba(255,255,255,0.35)` fijo
- [x] Emoji 11px rotado
- [x] Badges pequeños (12px): 🎯 stops, 💪 gyms, 👥 community, ✨ best
- [x] Renderizado condicional de badges según `showBadgesOnPins`
- [x] Click: `setSelectedCity(city)`
- [x] Se actualiza cuando cambia la condición
- [x] Persistencia de badges en LocalStorage

---

### US-502 · CityTooltip ✅
**SP:** 5 · **Prioridad:** 🔴 · **Estado:** ✅ Completado (2026-03-22)

**Como** usuario,
**quiero** un popup detallado al hacer click en un pin,
**para** ver todos los datos sin salir del mapa.

**Criterios de aceptación:**
- [x] Leaflet Popup personalizado, `bg-secondary`, `border-radius 12px`
- [x] Diseño 3 líneas: [emoji clima] Nombre, País | Condición
- [x] Línea 2: Tipos potenciados [tipo1 tipo2 tipo3]
- [x] Línea 3: Coordenadas [Copiar coords button]
- [x] Botón "Ver detalle →" full-width
- [x] Copiar coords con feedback visual (✓ 2 segundos)
- [x] Sincronizado con ciudad activa en sidebar

---

### US-503 · FlyToCity ✅
**SP:** 2 · **Prioridad:** 🟡 · **Estado:** ✅ Completado (2026-03-22)

**Como** usuario,
**quiero** que el mapa vuele a la ciudad seleccionada en la sidebar,
**para** verla en contexto geográfico automáticamente.

**Criterios de aceptación:**
- [x] Observa `selectedCity` en el store
- [x] `mapRef.flyTo([lat, lon], 10, { duration: 1.2 })`
- [x] No vuela si ya está centrado ahí
- [x] Duración configurable

---

### US-504 · MapLegend ✅
**SP:** 2 · **Prioridad:** 🟢 · **Estado:** ✅ Completado (2026-03-22)

**Como** usuario,
**quiero** una leyenda que explique los colores de los pines y categorías,
**para** entender qué condición/categoría representa cada símbolo.

**Criterios de aceptación:**
- [x] Flotante en esquina inferior derecha
- [x] 2 pestañas: CLIMA (7 condiciones) | CATEGORÍAS (4 filtros + toggle)
- [x] Tab CLIMA: pin + emoji + nombre de condición
- [x] Tab CATEGORÍAS: Toggle "Iconos en pines" + checkboxes para filtrar
- [x] Filtro OR logic: múltiples badges seleccionados simultáneamente
- [x] Persistencia en localStorage: `'pwe-showBadgesOnPins'`
- [x] `bg-secondary`, `border-default`, `border-radius 8px`

### US-505 · Sistema de Badges con Cuartiles ✅
**SP:** 8 · **Prioridad:** 🔴 · **Estado:** ✅ Completado (2026-03-22)

**Criterios de aceptación:**
- [x] 4 categorías de badges calculadas por cuartiles (top 25%)
- [x] 🎯 Pokeparadas: Top 25% densidad
- [x] 💪 Gimnasios: Top 25% gyms
- [x] 👥 Comunidad Activa: Rating ≥ 4.0
- [x] ✨ Mejores Lugares: Tiene TODAS las 3 (exclusivo)
- [x] Lógica: Si tiene todas → solo retorna 'best'
- [x] Implementado en `src/data/weatherService.ts` → `calculateBadges()`
- [x] Badges renderizados en MapPin según `showBadgesOnPins`

---

### US-506 · Filtrado por Badges + Auto-scroll ✅
**SP:** 5 · **Prioridad:** 🔴 · **Estado:** ✅ Completado (2026-03-22)

**Como** usuario,
**quiero** filtrar ciudades por categorías de badges y que se desplace automáticamente a la ciudad seleccionada,
**para** encontrar rápidamente lugares específicos y una mejor experiencia de navegación.

**Criterios de aceptación:**
- [x] Filtrado por badges con lógica OR (múltiples selecciones simultáneamente)
- [x] Filtro aplicado a MapView y LocationFeed
- [x] Default: todos los badges seleccionados
- [x] Actualizaciones reactivas al cambiar filtro
- [x] Auto-scroll en LocationFeed al seleccionar pin
- [x] Scroll suave con posición center
- [x] Implementado en `src/components/Sidebar/LocationFeed.tsx`
- [x] Z-index fixes: Header (100 → 1001), CustomSelect (200 → 1001)

---

## EP-09 · API AccuWeather

### US-206 · s2Service.js
**SP:** 2 · **Prioridad:** 🟡

**Criterios de aceptación:**
- [ ] `getS2Key(lat, lng)` retorna string clave nivel 10
- [ ] `getS2CellCenter(lat, lng)` retorna `{lat, lng}`
- [ ] Fallback si librería no disponible

---

### US-207 · weatherService.js
**SP:** 5 · **Prioridad:** 🟡

**Criterios de aceptación:**
- [ ] `ACCUWEATHER_TO_CONDITION` exportado
- [ ] `CONDITION_TO_TYPES` exportado
- [ ] `getBaseCondition(iconId)` implementado
- [ ] `resolveCondition(iconId, windKmh, gustKmh)` con lógica WINDY
- [ ] `isExtremeWeather(alerts)` implementado
- [ ] `getAccuWeatherLocationKey` con caché
- [ ] `getHourlyForecast` con try/catch
- [ ] `getAlerts` con fallback a []
- [ ] `fetchCityWeather` orquesta todo

---

### US-601 · Integración AccuWeather completa
**SP:** 8 · **Prioridad:** 🟡

**Criterios de aceptación:**
- [ ] Con `VITE_ACCUWEATHER_KEY`: usa API real
- [ ] locationKey cacheado permanentemente
- [ ] Forecast de la hora actual
- [ ] `resolveCondition` aplicado
- [ ] Errores → fallback a caché o mock
- [ ] Rate limit: máx 1 call por ciudad por hora
- [ ] Warning si 403 (límite superado)

---

### US-602 · Refresh automático horario
**SP:** 3 · **Prioridad:** 🟡 · **Estado:** ✅ Completado (2026-03-30)

**Criterios de aceptación:**
- [x] Calcula ms hasta próxima HH:00
- [x] `setTimeout` dispara re-fetch
- [x] `loadingStatus` cycling durante refresh
- [x] SyncBadge muestra tiempo transcurrido
- [x] Tab no visible: pospone refresh

---

### US-603 · isExtreme + alertas
**SP:** 3 · **Prioridad:** 🟢

**Criterios de aceptación:**
- [ ] `isExtreme=true` si AccuWeather retorna alertas
- [ ] LocationCard con `isExtreme`: borde `--ui-error` + ⚠️
- [ ] MapPin con `isExtreme`: `glowPulse` animation
- [ ] CityTooltip: "⚠ Clima extremo"
- [ ] Mock: 2 ciudades random con `isExtreme=true`

---

### US-604 · Lazy Load Horario — Refresh automático HH:00
**SP:** 5 · **Prioridad:** 🔴 · **Estado:** ✅ Completado (2026-03-30) · **Sprint:** 6

**Como** usuario,
**quiero** que el clima se actualice automáticamente cada hora (a HH:00 exacto),
**para** tener datos frescos sin gastar batería ni consumir API innecesariamente.

**Criterios de aceptación:**

#### 1. Timer Automático
- [x] `useWeather.ts`: calcula ms hasta próxima HH:00 (helper `msUntilNextHour`)
- [x] Al iniciar hook, `setTimeout` dispara refresh en HH:00
- [x] Timer se reseta después cada actualización
- [x] Listener de Visibility API (pausa si tab oculta)

#### 2. Comportamiento Lazy Load
- [x] NO actualizar si app está en background
- [x] Si usuario cierra app a 3:50 pm y abre a 4:30 pm → detecta HH:00 y refrescar
- [x] Si usuario permanece en app, refresh transparente a HH:00

#### 3. UX & Transición
- [x] LoadingScreen reutilizado: "Actualizando ciudades" + "Sincronización automática por cambio de hora"
- [x] Fade-out/in de datos (200ms) al reemplazar clima
- [x] SyncBadge muestra estado actual
- [x] Si modal LocationDetail abierto → mostrar LoadingScreen fullscreen

#### 4. Caché Dinámico — TTL hasta HH:00
- [x] `cacheService.ts`: Helper `msUntilNextHour()`
- [x] `setCachedWeather()`: TTL dinámico = `now + msUntilNextHour()`
- [x] `getCachedWeather()`: Verifica expiración absoluta
- [x] Cache expira automáticamente a HH:00 exacto
- [x] Si user entra después de HH:00, detecta caché expirado → fetcha nuevos datos

#### 5. Auto-refresh a HH:00
- [x] Auto-refresh **ignora cache** — siempre fetcha de API
- [x] Batch processing: máx 5 ciudades paralelo (reutilizar `batchWeatherService`)
- [x] Rate limit: 200ms delay entre batches
- [x] Guarda con TTL dinámico (hasta próxima HH:00)

#### 6. Logging & Debugging
- [x] Console: `🔄 Auto-refresh HH:00 — X ciudades actualizadas, Y cache hits`
- [x] Timestamp: `setLastUpdateHour()` al terminar
- [x] Métrica: `metrics.executionMs` en console
- [x] Accesible desde DevTools: `pweCache.lastRefreshTime`

### Estimado API Consumption
- Promedio: ~600-1,200 calls/mes (< presupuesto 15k)
- Pico: 282 calls por refresh horario (100% cache miss)

### Detalles Técnicos

**Archivos a modificar:**
- `src/services/cache/cacheService.ts` — TTL dinámico + helper msUntilNextHour
- `src/hooks/useWeather.ts` — Timer + Visibility API listener
- `src/components/UI/Toast.tsx` (crear si no existe) — Notificación durante refresh
- `src/index.css` — Transición fade (si no existe)
- `src/services/weather/batchWeatherService.ts` — Agregar opción `ignoreCache`

**No modificar:**
- Resto de servicios

**Definición de "Listo"**
- ✅ 94 ciudades refrescan cada hora si app está abierta
- ✅ Zero API calls si app cerrada
- ✅ Cache expira automáticamente a HH:00
- ✅ Consumo <15k calls/mes validado
- ✅ Toast visible, fade suave
- ✅ Sin console errors

---

## EP-09 · Testing & Validación (Sprint 6 Fase 2)

### Fixes previos — Completar US-602 y US-604

**Fix F1 — handleVisibilityChange reschedule** ✅ Completado
- **Archivo:** `src/hooks/useWeather.ts` línea 261-280
- **Problema:** Cuando app vuelve a ser visible, el timer no se reprograma
- **Solución:** Llamar `scheduleNextRefresh()` y disparar refresh inmediato si `shouldRefreshCities()`
- **Impacto:** Tab oculta/visible ahora funciona correctamente
- **Validación:** E2E test "should fade out LoadingScreen after data loads" ✅

**Fix F2 — fade-refresh en datos** ✅ Completado
- **Archivo:** `src/components/Sidebar/LocationFeed.tsx`
- **Problema:** Clase `.fade-refresh` definida en CSS pero nunca aplicada
- **Solución:** Aplicar `className={loadingStatus === 'loading' ? 'fade-refresh' : ''}` al contenedor
- **Impacto:** Fade visual durante auto-refresh a HH:00
- **Validación:** E2E test "should display progress percentage" ✅

**Fix F3 — LoadingScreen visibility during auto-refresh** ✅ Completado
- **Archivo:** `src/components/UI/LoadingScreen.tsx` línea 20-29
- **Problema:** LoadingScreen no aparecía cuando `loadingStatus='loading'` durante auto-refresh
- **Solución:** Agregar `if (loadingStatus === 'loading') setVisible(true)` en useEffect
- **Impacto:** LoadingScreen fullscreen ahora muestra correctamente "Actualizando ciudades"
- **Validación:** E2E test "should trigger auto-refresh when cache expires" ✅

---

### US-606 · Inspector Visual de Caché
**SP:** 5 · **Prioridad:** 🔴 · **Estado:** ⏳ En progreso · **Sprint:** 7 Fase 2

**Como** desarrollador,
**quiero** ver y gestionar el caché de manera visual dentro de la app,
**para** diagnosticar problemas y limpiar datos sin abrir consola ni DevTools.

**Tipo:** Debug Tool (Dev-only, visible solo en modo desarrollo)

**Criterios de aceptación:**

**Visualización:**
- [ ] Nueva tab "🔧 Caché" en `TestingTools` (4ª pestaña)
- [ ] Tabla con 2 secciones:
  - **LocationKeys** (localStorage): Clave | S2 Value | Guardado | Acciones
  - **Weather Data** (IndexedDB): Clave | Condición | Expiración | Edad | Estado
- [ ] Estado visual: ✅ Válido | ⏰ Expirando (<5 min) | ❌ Expirado
- [ ] Métricas resumen: Total entradas | Almacenamiento usado | % vs límite

**Interacción:**
- [ ] Click "👁️ Ver" → popup JSON completo + timestamp exact
- [ ] Click "📋 Copiar" → copia clave al clipboard + toast "Copiado"
- [ ] Checkbox seleccionar entradas → habilita botón "🗑️ Eliminar selección"
- [ ] "🗑️ Limpiar TODO" → modal confirmación → elimina todo caché
- [ ] Modal confirmación: "¿Eliminar N entradas? Se perderán datos en caché"
- [ ] Después de eliminar: tabla se recarga automáticamente

**Funcionalidad avanzada:**
- [ ] Filtro: [Todos | LocationKeys | Weather | Válidos | Expirados]
- [ ] Búsqueda por nombre de ciudad
- [ ] Botón "🔄 Actualizar lista" (recarga tabla desde storage)

**Dev-Only:**
- [ ] Visible SOLO si `import.meta.env.DEV === true`
- [ ] NO aparece en producción
- [ ] Acceso: Header → TestingTools → Tab "Caché"

**Archivos a crear/modificar:**
- `src/components/TestingTools/CachePanel.tsx` (NUEVA) — 400+ líneas
- `src/components/TestingTools/CacheDetailPopup.tsx` (NUEVA) — popup con JSON
- `src/components/TestingTools/TestingTools.tsx` — agregar tab 4
- `src/utils/cacheDebugHelper.ts` (NUEVA) — funciones auxiliares

---

### US-607 · Servicio de Historial de Precisión
**SP:** 5 · **Prioridad:** 🔴 · **Estado:** ✅ Completado (2026-03-30) · **Sprint:** 6 Fase 2

**Como** analista,
**quiero** que la app guarde automáticamente un snapshot por ciudad por hora,
**para** tener evidencia histórica de qué clasificó el algoritmo en cada momento.

**Schema del snapshot:**
```typescript
interface WeatherSnapshot {
  snapshotId: string       // `${cityId}-${YYYYMMDDH}`
  cityId: string
  cityName: string
  cityCountry: string
  cityRegion: string
  capturedAt: number       // timestamp exacto
  condition: string        // lo que clasificó el algoritmo
  weatherIcon: number
  tempC: number
  windKmh: number
  gustKmh: number
  visibilityKm: number
  boostedTypes: string[]
  isExtreme: boolean
  actualCondition?: string // el usuario llena esto — nunca se pisa
  verifiedAt?: number
  isCorrect?: boolean      // auto-computed: condition === actualCondition
}
```

**Criterios de aceptación:**

- [x] `src/services/history/weatherHistoryService.ts` con funciones completas
- [x] `saveSnapshots()` deduplica por clave con preservación de `actualCondition`
- [x] `clearOldSnapshots()` se llama automáticamente al iniciar la app
- [x] `updateActualCondition()` computa `isCorrect` y guarda `verifiedAt`
- [x] `saveSnapshots()` se llama en `useWeather.ts` después de `setLastUpdateHour()`
- [x] Retención configurable en localStorage `pwe-history-retention-days` (7 / 14 / 30 días)
- [x] Storage key prefix: `pwe-hist-`
- [x] Auto-cleanup: elimina entries más antiguas que `retentionDays` al iniciar

**Archivos:**
- `src/services/history/weatherHistoryService.ts` ← nuevo
- `src/hooks/useWeather.ts` — llamar `saveSnapshots()` + `clearOldSnapshots()`

---

### US-608 · Dashboard de Historial — Vista Grilla
**SP:** 8 · **Prioridad:** 🔴 · **Estado:** ⏳ Pendiente · **Sprint:** 6 Fase 2

**Como** analista,
**quiero** ver una grilla ciudad × día con el historial de condiciones y poder llenar el "Real" inline,
**para** centralizar mis observaciones manuales de Pokémon GO.

**Layout:**
```
Tab: "Historial"
┌─────────────────────────────────────────────────────────────┐
│ Retención: [7 días ▾]   Filtrar: [Todas las regiones ▾]    │
│ ──────────────────────────────────────────────────────────  │
│ Ciudad        │ 28/03 │ 29/03 │ 30/03 │ 31/03 │ ...       │
│ San Francisco │ ☀️ ✓  │ 🌧️ ?  │ 💨 ✓  │ ☀️ -  │ ...       │
│ NYC           │ 🌤️ ✗  │ ☀️ ✓  │ 🌧️ ?  │  -    │ ...       │
│ ──────────────────────────────────────────────────────────  │
│ Click en celda → popover: ver snapshots horarios del día    │
│ + dropdown para llenar "Real" por hora                      │
└─────────────────────────────────────────────────────────────┘
```

**Leyenda de iconos de estado:**
- ✓ verde = verificado correcto
- ✗ rojo = verificado incorrecto
- ? amarillo = snapshot existe, sin verificar
- — gris = sin datos ese día

**Criterios de aceptación:**

- [ ] Nueva tab "Historial" en `TestingTools`
- [ ] Grilla: ciudades en filas (todas del JSON), días en columnas (últimos N según retención)
- [ ] Celda muestra: emoji de condición + ícono de estado (✓/✗/?/—)
- [ ] Celda sin datos: "—" con fondo neutro
- [ ] Click en celda → popover con lista de snapshots horarios de ese día para esa ciudad
- [ ] En popover: cada fila tiene dropdown "Real" (7 condiciones + "No verificado")
- [ ] Al seleccionar Real → llama `updateActualCondition()` → icono celda se actualiza sin reload
- [ ] Filtro por región (América / Europa / Asia / Oceanía / África / Todas)
- [ ] Selector de retención (7 / 14 / 30 días) — persiste en localStorage
- [ ] Scroll vertical si hay más de 15 ciudades visibles

**Archivos:**
- `src/components/TestingTools/TestingTools.tsx` — tab Historial
- `src/components/TestingTools/HistoryGrid.tsx` ← nuevo
- `src/components/TestingTools/SnapshotPopover.tsx` ← nuevo

---

### US-609 · Métricas de Precisión
**SP:** 3 · **Prioridad:** 🟡 · **Estado:** ✅ Completada (2026-03-31) · **Sprint:** 7 Fase 2

**Como** analista,
**quiero** ver el % de precisión por condición climática vs el target de 98%,
**para** identificar qué condiciones debo ajustar en el algoritmo.

**Layout:**
```
Tab: "Métricas"
┌──────────────────────────────────────────────────────┐
│ Basado en: 103 verificaciones (de 1,240 snapshots)  │
│                                                      │
│ Condición   │ Verificados │ Correctos │ Precisión    │
│ Soleado     │     45      │    41     │ 91.1% 🟡     │
│ Lluvia      │     23      │    22     │ 95.7% 🟢     │
│ Ventoso     │     12      │     7     │ 58.3% 🔴     │
│ ...         │             │           │              │
│ ─────────────────────────────────────────────────── │
│ TOTAL       │    103      │    89     │ 86.4% 🟡     │
│ Target: 98% │             │           │ gap: -11.6%  │
└──────────────────────────────────────────────────────┘
```

**Criterios de aceptación:**

- [ ] Nueva tab "Métricas" en `TestingTools`
- [ ] Solo cuenta filas donde `actualCondition` está definido
- [ ] Tabla por condición: total verificados, correctos, % precisión
- [ ] Indicador de color: ≥98% = verde, 80–97% = amarillo, <80% = rojo
- [ ] Fila total con gap vs target 98%
- [ ] Si hay < 10 verificaciones: warning "Datos insuficientes para estadísticas confiables"
- [ ] Sección secundaria: precisión por región (misma lógica)

**Archivos:**
- `src/components/TestingTools/TestingTools.tsx` — tab Métricas
- `src/components/TestingTools/PrecisionMetrics.tsx` ← nuevo

---

### US-610 · Export Excel del Historial
**SP:** 2 · **Prioridad:** 🟢 · **Estado:** ⏳ Pendiente · **Sprint:** 6 Fase 2

**Como** analista,
**quiero** exportar el historial completo a Excel,
**para** tener un backup offline y hacer análisis adicionales.

**Criterios de aceptación:**

- [ ] Botón "Exportar historial" en tab Historial (US-608)
- [ ] Un Excel con una pestaña por día (hasta N días según retención)
- [ ] Columnas: Ciudad, País, Región, Hora, Condición App, Real, Correcto (Sí/No/-)
- [ ] Celdas "Correcto" con color: verde/rojo/gris según valor
- [ ] Nombre archivo: `pokeweather-history-YYYY-MM-DD.xlsx`
- [ ] Función separada de `exportCitiesToExcel()` — no modifica el export actual

**Archivos:**
- `src/utils/exportHistory.ts` ← nuevo

---

## EP-10 · Responsive

### US-701 · Layout tablet (768–1024px)
**SP:** 5 · **Prioridad:** 🟢

**Criterios de aceptación:**
- [ ] Sidebar como drawer sobre el mapa
- [ ] MenuStrip 44px permanente
- [ ] Click ícono → drawer slide-in, click fuera → cierra
- [ ] Header compacto

---

### US-702 · Layout mobile (< 768px)
**SP:** 8 · **Prioridad:** 🟢

**Criterios de aceptación:**
- [ ] Header compacto
- [ ] Mapa fullscreen
- [ ] NavBar inferior: Mapa · Lista · Filtros
- [ ] Tab Lista → bottom sheet cards horizontales
- [ ] Tab Filtros → bottom sheet modal
- [ ] CityTooltip → panel bottom fullwidth
- [ ] Sin overflow horizontal

---

## EP-11 · Cache Management

### US-711 · Administrador de Caché
**SP:** 5 · **Prioridad:** 🟡 · **Estado:** ⏳ Pendiente · **Sprint:** 7 Fase 2

**Como** administrador,
**quiero** ver, editar y eliminar datos cacheados por ciudad,
**para** manejar manualmente el caché si necesito resetear o depurar información.

**Layout:**
```
Tab: "💾 Caché"
┌──────────────────────────────────────────────┐
│ Filtro: [Buscar ciudad ▾]   [🗑️ Reset Todo]  │
├──────────────────────────────────────────────┤
│ Pier 39, San Francisco        📍 Ubicación   │
│ └─ LocationKey: ACU12345      ✓ Caché:10m    │
│    ├─ [Editar] [❌ Eliminar]                 │
│    └─ Snapshots: 24 (últimas 24h)            │
│       └─ 31/03 10:00 Lluvia     ❌ Eliminar   │
│       └─ 31/03 21:00 Nublado    ❌ Eliminar   │
│                                              │
│ Auckland Waterfront           📍 Ubicación   │
│ └─ LocationKey: ACU67890      ✓ Caché:65m    │
│    └─ [Editar] [❌ Eliminar]                 │
└──────────────────────────────────────────────┘
```

**Criterios de aceptación:**

- [ ] Listar todas las ciudades cacheadas (con LocationKeys + Weather snapshots)
- [ ] Mostrar tamaño del caché por ciudad (KB) y antigüedad (min/h/d)
- [ ] Buscar ciudad por nombre (autocomplete)
- [ ] **Editar LocationKey:** modal con la clave para copiar/actualizar
- [ ] **Eliminar por ciudad:** borra LocationKey + todos los snapshots
- [ ] **Eliminar snapshot individual:** seleccionar snapshot y eliminar
- [ ] **Reset Total:** botón 🗑️ para limpiar TODO el caché con confirmación
- [ ] Confirmación antes de eliminar ("¿Seguro? Se perderá caché de X ciudades")
- [ ] Estado visual: ✓ (válido), ⚠️ (próximo a expirar), ❌ (expirado)
- [ ] Persistencia: cambios se guardan inmediatamente en IndexedDB

**Comportamiento:**

1. **Ver caché:** Expande ciudad → muestra:
   - LocationKey (copiable)
   - Fecha de última actualización
   - Snapshots con timestamp
   - TTL restante

2. **Editar LocationKey:** Modal popup con:
   - Campo editable
   - Botón copiar al clipboard
   - Guardar cambios

3. **Eliminar snapshot:** Click ❌ en snapshot específico
   - Confirmación rápida: "¿Eliminar snapshot de las 10:00?"
   - Se elimina de IndexedDB inmediatamente

4. **Reset Todo:** Botón 🗑️ rojo
   - Confirmación: "Esto borrará TODO el caché. ¿Continuar?"
   - Limpia LocationKeys + Weather snapshots + History snapshots
   - No afecta ciudades en el mapa (re-fetchea en próximo refresh)

**Archivos:**
- `src/components/TestingTools/CacheManager.tsx` ← nuevo
- `src/services/cache/cacheManagementService.ts` ← nuevo (lectura/escritura directa IndexedDB)

---

## BACKLOG ADICIONAL (sin sprint asignado)

| ID | Historia | SP | Épica |
|----|----------|----|-------|
| US-801 | Exportar ciudades filtradas como CSV | 3 | EP-02 |
| US-802 | Buscar Pokémon y ver qué ciudades los potencian | 5 | EP-07 |
| US-803 | Estadísticas: cuántas ciudades por condición | 3 | EP-08 |
| US-804 | UI para agregar/editar ciudades desde el browser | 13 | EP-02 |
| US-805 | Notificaciones push cuando cambia clima de favorita | 8 | EP-09 |
| US-806 | Marcar ciudades favoritas y filtrar por ellas | 3 | EP-07 |
| US-807 | Historial de condiciones climáticas por ciudad | 5 | EP-09 |

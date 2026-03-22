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

### US-501 · MapPin
**SP:** 5 · **Prioridad:** 🔴

**Como** usuario,
**quiero** un pin por ciudad con el color de su clima,
**para** visualizar el clima global de un vistazo.

**Criterios de aceptación:**
- [ ] Leaflet DivIcon, teardrop SVG 28px, rotate(-45deg)
- [ ] Fill: `--condition-{x}` del clima de la ciudad
- [ ] Border: `2px solid rgba(255,255,255,0.35)` fijo
- [ ] Emoji 11px, rotate(45deg)
- [ ] Hover: scale(1.25)
- [ ] Seleccionado dark: scale(1.3) + glow
- [ ] Seleccionado light: scale(1.3) + shadow
- [ ] Click: `setSelectedCity(city)`
- [ ] Se actualiza cuando cambia la condición

---

### US-502 · CityTooltip
**SP:** 5 · **Prioridad:** 🔴

**Como** usuario,
**quiero** un popup detallado al hacer click en un pin,
**para** ver todos los datos sin salir del mapa.

**Criterios de aceptación:**
- [ ] Leaflet Popup personalizado, `bg-secondary`, `border-radius 12px`
- [ ] Nombre, hora local, coords, clima (emoji + label + imagen 80×80px)
- [ ] tempC, feelsLike, humidity, windKmh, density, stops, gyms, rating
- [ ] TypeBadge[], animación `popIn` 150ms
- [ ] Sincronizado con ciudad activa en sidebar

---

### US-503 · FlyToCity
**SP:** 2 · **Prioridad:** 🟡

**Como** usuario,
**quiero** que el mapa vuele a la ciudad seleccionada en la sidebar,
**para** verla en contexto geográfico automáticamente.

**Criterios de aceptación:**
- [ ] Observa `selectedCity` en el store
- [ ] `mapRef.flyTo([lat, lon], 10, { duration: 1.2 })`
- [ ] No vuela si ya está centrado ahí
- [ ] Duración configurable

---

### US-504 · MapLegend
**SP:** 2 · **Prioridad:** 🟢

**Como** usuario,
**quiero** una leyenda que explique los colores de los pines,
**para** entender qué condición representa cada color.

**Criterios de aceptación:**
- [ ] Flotante en esquina inferior derecha
- [ ] 7 filas: pin + emoji + nombre de condición
- [ ] `bg-secondary`, `border-default`, `border-radius 8px`
- [ ] Colapsable (click en título)

### US-505 · Tiles + Dark Mode + Badge Categories
**SP:** 8 · **Prioridad:** 🔴

**Criterios de aceptación:**
- [x] CartoDB positron + CSS invert (dark), voyager (light) — sin CORS issues
- [x] worldCopyJump activo (pins persisten al cruzar antimeridiano)
- [x] Pins tamaño fijo (22×29px), color según condición climática
- [x] Badges pequeños (12px) en pins: 🎯 stops, 💪 gyms, 👥 community, ⭐ multi (2+)
- [x] Basado en cuartiles: top 25% en cada métrica
- [x] CityTooltip minimalista (nombre, temp, condición, badges, 2 botones)
- [x] MapLegend: 7 condiciones + 4 categorías de badges

---

### US-506 · Popup Unificado + "Ver Detalle"
**SP:** 5 · **Prioridad:** 🔴

**Como** usuario,
**quiero** un popup general al seleccionar una ciudad (desde lista o pin) con opción de ver más detalles,
**para** evitar información confusa y tener control sobre cuándo abrir el modal completo.

**Criterios de aceptación:**
- [x] Click en pin o lista → abre CityTooltip popup (sin LocationDetail modal)
- [x] CityTooltip incluye: icono clima correcto, coords+copiar, tipos, score, "Ver detalle"
- [x] "Ver detalle" → abre LocationDetail bottom sheet modal
- [x] Cerrar popup → clearSelectedCity (permite reabrirlo)
- [x] Botones inside popup usan stopPropagation (no cierran accidentalmente)
- [x] FlyToCity: funciona tanto desde list click como desde pin click

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
**SP:** 3 · **Prioridad:** 🟡

**Criterios de aceptación:**
- [ ] Calcula ms hasta próxima HH:00
- [ ] `setTimeout` dispara re-fetch
- [ ] `loadingStatus` cycling durante refresh
- [ ] SyncBadge muestra tiempo transcurrido
- [ ] Tab no visible: pospone refresh

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

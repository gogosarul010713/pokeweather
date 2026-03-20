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

### US-301 · FilterChip
**SP:** 2 · **Prioridad:** 🔴

**Como** usuario,
**quiero** chips de filtro para filtrar por región,
**para** ver solo ciudades de una zona geográfica.

**Criterios de aceptación:**
- [ ] Pill h:28px, Exo 2 500 12px
- [ ] Props: `label`, `active`, `onClick`
- [ ] Activo: `border-color --ui-accent`, `background rgba(accent, 0.08)`
- [ ] Default: `bg-tertiary`, `border-default`
- [ ] Hover: `border-color --ui-accent`

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

### US-303 · FilterBar — región + búsqueda
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** la barra de filtros completa en el header,
**para** combinar región y búsqueda de texto.

**Criterios de aceptación:**
- [ ] FilterBar.jsx flex:1 en centro del header
- [ ] Chips: Todas · Asia · Europa · América · Oceanía · África
- [ ] Solo un chip activo (radio behavior)
- [ ] SearchInput a la derecha
- [ ] Actualiza store → LocationFeed y pines reactivos

---

### US-304 · WeatherConditionCard
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** botones para cada condición climática,
**para** filtrar ciudades por el tipo de clima que me interesa para jugar.

**Criterios de aceptación:**
- [ ] 7 botones: ☀️ ⛅ ☁️ 🌫️ 🌧️ ❄️ 💨
- [ ] Multi-select
- [ ] Seleccionado dark: borde + glow condition
- [ ] Seleccionado light: borde + bg sutil, sin glow
- [ ] Tooltip con nombre de condición
- [ ] Llama `toggleCondition(condition)`

---

### US-305 · ConditionPanel
**SP:** 2 · **Prioridad:** 🔴

**Como** usuario,
**quiero** el panel de condiciones integrado en el header,
**para** filtrar por clima sin salir de la barra superior.

**Criterios de aceptación:**
- [ ] Agrupa los 7 WeatherConditionCard en fila horizontal
- [ ] Separador visual entre FilterBar y ConditionPanel
- [ ] Botón "Limpiar" cuando hay condiciones activas
- [ ] No desborda en pantallas 1280px+

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

### US-401 · TypeBadge
**SP:** 1 · **Prioridad:** 🔴

**Como** usuario,
**quiero** badges con tipos Pokémon potenciados,
**para** saber qué Pokémon cazar en cada ciudad.

**Criterios de aceptación:**
- [ ] Exo 2 700 9px uppercase, padding 1px 7px, border-radius 8px
- [ ] Background: `rgba(var(--type-x-rgb), 0.18)`
- [ ] Color: `var(--type-x)`, Border: `rgba(var(--type-x-rgb), 0.35)`
- [ ] Light: alpha mayor para contraste
- [ ] Funciona con los 18 tipos

---

### US-402 · ClimateBadge
**SP:** 1 · **Prioridad:** 🔴

**Como** usuario,
**quiero** el badge de condición climática en cada card,
**para** identificar el clima de un vistazo.

**Criterios de aceptación:**
- [ ] Exo 2 700 10px, padding 1px 8px, border-radius 10px
- [ ] Background/color/border con `--condition-{x}` y `--condition-{x}-rgb`
- [ ] Muestra emoji + nombre + imagen (thumbnail) via `WEATHER_IMAGES`

---

### US-403 · LocationCard
**SP:** 5 · **Prioridad:** 🔴

**Como** usuario,
**quiero** cards con todos los datos de Pokémon GO por ciudad,
**para** decidir qué ciudad explorar.

**Criterios de aceptación:**
- [ ] Row 1: flag + nombre (Exo 2 700 13px) + hora (`--text-accent`)
- [ ] Row 2: ClimateBadge + coords (`--text-secondary`)
- [ ] Row 3: TypeBadge[]
- [ ] Row 4: density · stops · gyms · rating
- [ ] Hover: `bg-tertiary`
- [ ] Activo dark: `rgba(accent,0.06)` + `border-left 2px`
- [ ] Activo light: `rgba(accent,0.06)` + `border-left 2px`
- [ ] Click: `setSelectedCity(city)`
- [ ] Animación `cardIn` staggered

---

### US-404 · LocationFeed
**SP:** 3 · **Prioridad:** 🔴

**Como** usuario,
**quiero** la lista filtrada y ordenada de ciudades,
**para** navegar con scroll fluido.

**Criterios de aceptación:**
- [ ] overflow-y auto, scrollbar thin
- [ ] Muestra `getFilteredCities(cities)`
- [ ] Contador "N ciudades" en la parte superior
- [ ] Sort: Nombre · Densidad · Rating · Hora
- [ ] Actualización reactiva al cambiar filtros
- [ ] Ciudad activa marcada
- [ ] Sin resultados: mensaje informativo

---

### US-405 · MenuStrip
**SP:** 2 · **Prioridad:** 🟢

**Como** usuario,
**quiero** íconos de navegación en la franja izquierda,
**para** cambiar entre vistas.

**Criterios de aceptación:**
- [ ] Franja 44px, `bg-primary`, `border-right border-subtle`
- [ ] 3 íconos SVG: Lista (activo) · Mapa · Filtros
- [ ] Activo: `--text-primary`. Inactivo: `--text-secondary`
- [ ] Hover: `--text-primary`, transición 0.12s
- [ ] Tooltip al hover

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

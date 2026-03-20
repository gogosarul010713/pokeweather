# 06-SPRINTS — Pokémon Weather Explorer v2
# Plan de sprints con objetivos, US asignadas y entregables.
# Para el detalle de cada US (criterios de aceptación), ver 05-backlog.md.

---

## RESUMEN

| Sprint | Nombre | SP | Entregable visible |
|--------|--------|----|-------------------|
| 1 | Layout Foundation | 19 | Esqueleto completo, mapa real, cambio de tema |
| 2 | Data Layer | 17 | Loading progresivo, caché, imágenes configurables |
| 3 | Header Completo | 14 | Búsqueda y filtros de región + clima operativos |
| 4 | Sidebar Completa | 12 | Lista de ciudades con datos de Pokémon GO |
| 5 | Mapa Completo | 14 | Pines, tooltips, navegación geográfica |
| 6 | AccuWeather Real | 21 | API real, refresh automático, alertas extremo |
| 7 | Responsive | 13 | Tablet y mobile |
| **Total** | | **110 SP** | |

---

## SPRINT 1 — Layout Foundation

**Objetivo:** Tener el esqueleto completo renderizando en browser. Todas las zonas del layout visibles, sistema de diseño CSS operativo, mapa real de Leaflet con cambio de tiles según tema. Sin lógica de datos — placeholders estáticos.

**Definition of Done:**
- App levanta con `npm run dev` sin errores
- Header (Brand + ThemeToggle), Sidebar (estructura), MapArea (Leaflet) visibles
- Cambio de tema dark/light funciona en tiempo real (tiles del mapa incluidos)
- Todos los colores via variables CSS

### US incluidas

| US | Nombre | SP |
|----|--------|----|
| US-101 | Setup del proyecto | 2 |
| US-102 | Sistema de variables CSS | 3 |
| US-103 | Init de tema (main.jsx) | 1 |
| US-104 | Shell de 3 zonas (App.jsx) | 3 |
| US-105 | Zustand store (useStore.js) | 3 |
| US-106 | Header con Brand y ThemeToggle | 3 |
| US-107 | Sidebar placeholder | 3 |
| US-108 | MapArea con Leaflet | 3 |
| US-109 | SyncBadge placeholder | 1 |
| **Total** | | **22 SP** |

### Archivos generados en Sprint 1

```
src/index.css
src/main.jsx
src/App.jsx
src/data/useStore.js
src/components/Header/Header.jsx
src/components/Header/Brand.jsx
src/components/Header/ThemeToggle.jsx
src/components/Sidebar/Sidebar.jsx
src/components/Map/MapView.jsx
src/components/UI/SyncBadge.jsx
```

---

## SPRINT 2 — Data Layer

**Objetivo:** Tener la capa de datos completamente funcional. Dataset dinámico que carga desde JSON, imágenes de clima configurables, caché en IndexedDB/localStorage y pantalla de carga progresiva ciudad por ciudad.

**Definition of Done:**
- App muestra LoadingScreen al iniciar con progreso real
- Sin API key: usa mock con delays de 80ms por ciudad
- Con caché válido: carga instantánea sin pantalla de carga
- Las imágenes de clima están centralizadas en `weatherImages.js`

### US incluidas

| US | Nombre | SP |
|----|--------|----|
| US-201 | mockCities.js dinámico | 2 |
| US-202 | cacheService.js | 3 |
| US-203 | useWeather con progreso | 8 |
| US-204 | LoadingScreen | 3 |
| US-205 | weatherImages.js + assets placeholder | 1 |
| **Total** | | **17 SP** |

### Archivos generados en Sprint 2

```
src/config/weatherImages.js
src/data/pokedensity-cities.json   (ya existe — solo usar)
src/data/mockCities.js
src/data/cacheService.js
src/data/useWeather.js
src/components/UI/LoadingScreen.jsx
public/weather/sunny.png           (placeholder)
public/weather/partly.png
public/weather/cloudy.png
public/weather/fog.png
public/weather/rain.png
public/weather/snow.png
public/weather/windy.png
```

---

## SPRINT 3 — Header Completo

**Objetivo:** Header 100% funcional con búsqueda de texto, filtros de región, panel de 7 condiciones climáticas con multi-select, y badge de sincronización real conectado al estado de carga.

**Definition of Done:**
- Escribir en SearchInput filtra la lista y los pines reactivamente
- Seleccionar chip de región filtra correctamente
- Seleccionar condiciones filtra y muestra glow/bg según tema
- SyncBadge muestra estado real del hook useWeather

### US incluidas

| US | Nombre | SP |
|----|--------|----|
| US-301 | FilterChip | 2 |
| US-302 | SearchInput | 2 |
| US-303 | FilterBar (región + búsqueda) | 3 |
| US-304 | WeatherConditionCard | 3 |
| US-305 | ConditionPanel | 2 |
| US-306 | SyncBadge funcional | 2 |
| **Total** | | **14 SP** |

### Archivos generados en Sprint 3

```
src/components/Header/FilterBar.jsx
src/components/Header/SearchInput.jsx
src/components/Header/ConditionPanel/ConditionPanel.jsx
src/components/Header/ConditionPanel/WeatherConditionCard.jsx
src/components/UI/FilterChip.jsx
src/components/UI/SyncBadge.jsx   (reemplaza placeholder)
```

---

## SPRINT 4 — Sidebar Completa

**Objetivo:** Sidebar con lista completa de ciudades filtrada y ordenada. Cada card muestra todos los datos de Pokémon GO (density, stops, gyms, rating, tipos potenciados, clima). La selección de ciudad sincroniza sidebar y mapa.

**Definition of Done:**
- LocationFeed muestra todas las ciudades del mock
- Filtros del Sprint 3 actualizan la lista reactivamente
- Click en ciudad: se marca activa en la lista, mapa vuela a esa ciudad (placeholder OK)
- TypeBadge y ClimateBadge renderizando correctamente

### US incluidas

| US | Nombre | SP |
|----|--------|----|
| US-401 | TypeBadge | 1 |
| US-402 | ClimateBadge | 1 |
| US-403 | LocationCard | 5 |
| US-404 | LocationFeed | 3 |
| US-405 | MenuStrip | 2 |
| **Total** | | **12 SP** |

### Archivos generados en Sprint 4

```
src/components/Sidebar/Sidebar.jsx        (reemplaza placeholder)
src/components/Sidebar/MenuIcon.jsx
src/components/Sidebar/LocationFeed.jsx
src/components/Sidebar/LocationCard.jsx
src/components/UI/TypeBadge.jsx
src/components/UI/ClimateBadge.jsx
```

---

## SPRINT 5 — Mapa Completo

**Objetivo:** Mapa con un pin por ciudad (color según condición climática), tooltip detallado al hacer click, navegación automática al seleccionar ciudad en sidebar, y leyenda de condiciones colapsable.

**Definition of Done:**
- Todos los pines renderizan en el mapa con el color correcto
- Click en pin selecciona ciudad y sincroniza con sidebar
- CityTooltip muestra todos los datos incluyendo imagen de clima
- FlyToCity vuela al seleccionar desde la sidebar

### US incluidas

| US | Nombre | SP |
|----|--------|----|
| US-206 | s2Service.js | 2 |
| US-207 | weatherService.js (mapeos + funciones) | 5 |
| US-501 | MapPin | 5 |
| US-502 | CityTooltip | 5 |
| US-503 | FlyToCity | 2 |
| US-504 | MapLegend | 2 |
| **Total** | | **21 SP** |

> Nota: US-206 y US-207 se mueven aquí porque su implementación completa
> depende del mapa. En Sprint 2 solo se usa el mapeo de condiciones para mock.

### Archivos generados en Sprint 5

```
src/data/s2Service.js
src/data/weatherService.js
src/components/Map/MapView.jsx      (reemplaza placeholder con pines)
src/components/Map/MapPin.jsx
src/components/Map/CityTooltip.jsx
src/components/Map/MapLegend.jsx
src/components/Map/FlyToCity.jsx
```

---

## SPRINT 6 — AccuWeather Real + Calidad

**Objetivo:** Integrar la API real de AccuWeather, con manejo de caché optimizado, refresh automático en la hora exacta, y flag de clima extremo con indicadores visuales.

**Definition of Done:**
- Con `VITE_ACCUWEATHER_KEY` configurada: los datos son reales de AccuWeather
- Caché de locationKey en localStorage (no se repite la llamada de geoposición)
- Datos climáticos en IndexedDB con TTL 60 min
- SyncBadge muestra minutos desde última actualización
- Ciudades con clima extremo tienen indicador visual

### US incluidas

| US | Nombre | SP |
|----|--------|----|
| US-601 | Integración AccuWeather completa | 8 |
| US-602 | Refresh automático horario | 3 |
| US-603 | isExtreme flag y alertas | 3 |
| **Total** | | **14 SP** |

### Archivos modificados en Sprint 6

```
src/data/weatherService.js   (agregar fetch functions)
src/data/useWeather.js       (branch real vs mock + refresh)
src/components/Sidebar/LocationCard.jsx    (isExtreme indicator)
src/components/Map/MapPin.jsx              (glowPulse si isExtreme)
src/components/Map/CityTooltip.jsx         (mensaje clima extremo)
```

---

## SPRINT 7 — Responsive

**Objetivo:** Adaptar el layout completo a tablet y mobile según el diseño del design system. El contenido y la funcionalidad son idénticos — solo cambia el layout.

**Definition of Done:**
- En tablet: sidebar es drawer, mapa ocupa todo el ancho
- En mobile: mapa fullscreen, navegación por bottom sheet
- Sin overflow horizontal en ningún breakpoint
- Funcionalidad 100% accesible en mobile (filtros, búsqueda, city selection)

### US incluidas

| US | Nombre | SP |
|----|--------|----|
| US-701 | Layout tablet (768–1024px) | 5 |
| US-702 | Layout mobile (< 768px) | 8 |
| **Total** | | **13 SP** |

### Archivos modificados en Sprint 7

```
src/index.css                           (media queries)
src/App.jsx                             (lógica responsive)
src/components/Header/Header.jsx        (compacto en mobile)
src/components/Sidebar/Sidebar.jsx      (drawer en tablet, bottom sheet en mobile)
src/components/Map/CityTooltip.jsx      (panel bottom en mobile)
```

---

## NOTAS DE PLANIFICACIÓN

### Dependencias entre sprints

```
Sprint 1 ──────────────────────────────────────────► todos los demás
Sprint 2 (useWeather) ────────────────────────────► Sprint 3, 4, 5, 6
Sprint 3 (filtros) ───────────────────────────────► Sprint 4 (LocationFeed reactivo)
Sprint 4 (selectedCity) ──────────────────────────► Sprint 5 (FlyToCity, pin activo)
Sprint 5 (mapa completo) ─────────────────────────► Sprint 6 (pines con isExtreme)
Sprint 6 (API real) ──────────────────────────────► Sprint 7 (datos reales en responsive)
```

### Cómo retomar en una nueva sesión

1. Leer `01-project.md` (siempre)
2. Leer el contexto específico del trabajo del día:
   - Estilos → `02-design.md`
   - Lógica de clima → `03-weather-logic.md`
   - API AccuWeather → `04-api.md`
3. Revisar este archivo para saber en qué sprint/US estamos
4. Indicar en el mensaje: "Estamos en Sprint X, US-XXX, continúa desde aquí"

### Estado de sprints (actualizar manualmente)

| Sprint | Estado |
|--------|--------|
| Sprint 1 | ⏳ Pendiente |
| Sprint 2 | ⏳ Pendiente |
| Sprint 3 | ⏳ Pendiente |
| Sprint 4 | ⏳ Pendiente |
| Sprint 5 | ⏳ Pendiente |
| Sprint 6 | ⏳ Pendiente |
| Sprint 7 | ⏳ Pendiente |

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

## SPRINT 3 — Header Completo (Refactorizado 2026-03-20)

> ⚠️ **Cambio de diseño:** Chips horizontales + botones individuales reemplazados por dropdowns jerarquizados (`CustomSelect` + `FilterPanel`) por escalabilidad y mejor UX.

**Objetivo:** Header 100% funcional con búsqueda de texto y filtros jerarquizados via dropdowns (Continente · Clima · Tipo Pokémon · Ordenar por), y badge de sincronización real.

**Definition of Done:**
- Escribir en SearchInput filtra la lista y los pines reactivamente
- Dropdown Continente filtra por región (single-select)
- Dropdown Clima filtra por condición (multi-select con checkboxes)
- Dropdown Ordenar por cambia el sort del LocationFeed
- SyncBadge muestra estado real del hook useWeather

### US incluidas

| US | Nombre | SP | Estado |
|----|--------|----|--------|
| US-301 | CustomSelect (dropdown reutilizable) | 3 | ✅ |
| US-302 | SearchInput | 2 | ✅ |
| US-303 | FilterPanel (4 dropdowns jerarquizados) | 4 | ✅ |
| ~~US-304~~ | ~~WeatherConditionCard~~ (integrado en US-303) | ~~3~~ | ❌ Deprecated |
| ~~US-305~~ | ~~ConditionPanel~~ (integrado en US-303) | ~~2~~ | ❌ Deprecated |
| US-306 | SyncBadge funcional | 2 | ✅ |
| **Total** | | **11 SP efectivos** | |

### Archivos generados en Sprint 3

```
src/components/UI/CustomSelect.tsx         (nuevo)
src/components/UI/SyncBadge.tsx            (reemplaza placeholder)
src/components/Header/SearchInput.tsx
src/components/Header/FilterPanel.tsx      (nuevo - reemplaza FilterBar + ConditionPanel)
src/components/Header/Header.tsx           (actualizado)
src/data/useStore.ts                       (+ setConditionFilter action)

Eliminados:
src/components/Header/FilterBar.tsx
src/components/Header/ConditionPanel/ConditionPanel.tsx
src/components/Header/ConditionPanel/WeatherConditionCard.tsx
```

---

## SPRINT 4 — Sidebar Completa (Refactorizado 2026-03-20)

**Objetivo:** Sidebar con 3 modos navegables (📋 Lista · 📍 Detalle · ⭐ Favoritos), LocationCards filtradas reactivamente, LocationDetail modal sobre mapa, y sistema de favoritos persistido en localStorage.

**Arquitectura:**
- Sidebar tiene estado `sidebarMode: 'list' | 'detail' | 'favorites'` en store
- **Modo Lista**: LocationFeed muestra ciudades filtradas por dropdowns del header
- **Modo Detalle**: Click en LocationCard abre LocationDetail modal (overlay sobre mapa)
- **Modo Favoritos**: LocationFeed filtra a ciudades marcadas como favoritas
- Favoritos persisten en localStorage (`pwe-favorites`)

**Definition of Done:**
- LocationFeed renderiza LocationCards filtradas (dropdowns + búsqueda del header)
- Click en LocationCard selecciona ciudad + abre modal → cambia a Modo Detalle
- LocationDetail modal: nombre, país, región, clima, tipos, density, stops, gyms, rating, tips
- Botón ❤️ toggle favorito (rojo si es favorito)
- MenuStrip con 3 iconos funcionales cambian `sidebarMode`
- Modo Favoritos filtra por array `favorites` del store
- localStorage mantiene favoritos entre sesiones

### US incluidas

| US | Nombre | SP | Estado |
|----|--------|----|--------|
| US-401 | LocationCard.tsx | 3 | ✅ |
| US-402 | LocationFeed (refactor) | 3 | ✅ |
| US-403 | MenuStrip (3 modos) | 3 | ✅ |
| US-404 | LocationDetail modal | 4 | ✅ |
| US-405 | Favorites system | 3 | ✅ |
| **Total** | | **16 SP** | |

### Archivos a generar/actualizar en Sprint 4

```
src/components/Sidebar/LocationCard.tsx   (nuevo)
src/components/Sidebar/LocationDetail.tsx (nuevo)
src/components/Sidebar/Sidebar.tsx        (refactor: MenuStrip + LocationFeed)
src/data/useStore.ts                      (+ favorites array + actions)

Cambios en store:
  + sidebarMode: 'list' | 'detail' | 'favorites'
  + setSidebarMode(mode)
  + favorites: string[]
  + toggleFavorite(cityId)
  + clearFavorites()
  + localStorage sync para favorites
```

---

## SPRINT 5 — Mapa Completo + Visual Scoring

**Objetivo:** Mapa fully funcional con pins inteligentes escalados por calidad, popup unificado con opción de detalle, navegación automática, y leyenda completa.

**Definition of Done:**
- ✅ Tiles: CartoDB positron+CSS filter (dark), voyager (light) — sin CORS
- ✅ worldCopyJump: true (pins persisten cruzando antimeridiano)
- ✅ Pins: tamaño fijo (22×29px), color = CONDITION_COLORS
- ✅ Badges: 🎯 stops, 💪 gyms, 👥 community (rating≥4), ⭐ multi (2+)
- ✅ Badges basados en cuartiles (top 25%)
- ✅ CityTooltip: minimalista (3 líneas) + 2 botones (copiar coords, ver detalle)
- ✅ Click pin/lista → popup (sin LocationDetail modal)
- ✅ "Ver detalle" → abre LocationDetail con breakdown de badges
- ✅ Cerrar popup → clear selection (reabreible)
- ✅ MapLegend: condiciones + badges explicados

### US incluidas

| US | Nombre | SP |
|----|--------|----|
| US-206 | s2Service.js | 2 |
| US-207 | weatherService.js (mapeos + funciones) | 5 |
| US-501 | MapPin (tamaño dinámico + score visual) | 8 |
| US-502 | CityTooltip (mejorada con score + "Ver detalle") | 5 |
| US-503 | FlyToCity | 2 |
| US-504 | MapLegend (+ score legend) | 3 |
| US-505 | Tiles + Dark Mode + Score Visual | 8 |
| US-506 | Popup Unificado + "Ver Detalle" | 5 |
| **Total** | | **38 SP** |

> Nota: US-206 y US-207 se mueven aquí porque su implementación completa
> depende del mapa. En Sprint 2 solo se usa el mapeo de condiciones para mock.

### Archivos generados/actualizados en Sprint 5

```
src/index.css
  └─ --tile-filter: CSS vars para inversión de tiles

src/data/s2Service.ts

src/data/weatherService.ts
  ├─ CONDITION_COLORS, CONDITION_LABEL
  ├─ calculateScore(cities) → scoring function
  └─ getScoreColor(score) → color gradient (0-100)

src/components/Map/MapView.tsx
  ├─ CartoDB positron + CSS filter (dark), voyager (light)
  ├─ worldCopyJump={true}
  ├─ Score calculation + ranking (top 10)
  └─ SelectedPopup con removeEvent → setSelectedCity(null)

src/components/Map/MapPin.tsx
  ├─ Tamaño dinámico (1.5x - 3.5x) según score
  ├─ Color gradient (azul → rojo) via getScoreColor()
  └─ Badges: 👑 top 3, #4-10 números

src/components/Map/CityTooltip.tsx
  ├─ Icono correcto (/weather/{condition}.png)
  ├─ Coords + copiar button (stopPropagation)
  ├─ Score box + breakdown (stops, gyms, rating, densidad)
  └─ "Ver detalle" button (stopPropagation)

src/components/Map/MapLegend.tsx
  ├─ Leyenda de 7 condiciones climáticas
  └─ Score ranges + color scale

src/components/Map/FlyToCity.tsx

src/components/Sidebar/LocationCard.tsx
  └─ Solo setSelectedCity (sin setSidebarMode)
```

---

## SPRINT 6 — AccuWeather Real + Lazy Load Horario + Testing & Validación

### Fase 1 (Completada)
**Objetivo:** Integrar la API real de AccuWeather con caché dinámico inteligente y refresh automático sin desperdicio de API.

### Fase 2 (En progreso — 2026-03-30)
**Objetivo:** Finalizar US-602/604 con fixes + agregar toolkit de testing/validación para medir precisión del algoritmo.

**Definition of Done:**
- ✅ US-601/602/603 Completadas
- 🔄 US-604 + Fixes F1/F2 (Lazy Load + fade-refresh + Visibility API rescheduling)
- 🔄 US-606/607/608/609/610 (Inspector caché, historial, dashboard, métricas, export)
- ✅ Consumo <15k calls/mes validado
- ✅ Historial de precisión guardado (7 días configurable)
- ✅ Dashboard operativo para análisis manual

### US incluidas

| US | Nombre | SP | Estado |
|----|--------|----|--------|
| US-601 | Integración AccuWeather | 8 | ✅ |
| US-602 | Refresh automático horario | 3 | ⚠️ Fixes F1+F2 |
| US-603 | isExtreme flag y alertas | 3 | ✅ |
| US-604 | Lazy Load + TTL dinámico | 5 | ⚠️ Fixes F1+F2 |
| **US-606** | **Inspector Visual Caché** | **3** | **🆕** |
| **US-607** | **Servicio Historial** | **5** | **🆕** |
| **US-608** | **Dashboard Grilla** | **8** | **🆕** |
| **US-609** | **Métricas Precisión** | **3** | **🆕** |
| **US-610** | **Export Excel Historial** | **2** | **🆕** |
| **Total** | | **40 SP** | |

### Archivos modificados en Sprint 6

```
✅ src/data/weatherService.ts   (fetch functions)
✅ src/hooks/useWeather.ts       (real vs mock + básico refresh)

🔄 src/services/cache/cacheService.ts    (↦ TTL dinámico + msUntilNextHour helper)
🔄 src/hooks/useWeather.ts               (↦ Timer + Visibility API listener + auto-refresh)
🔄 src/services/weather/batchWeatherService.ts  (↦ ignoreCache option)

✅ src/components/Sidebar/LocationCard.tsx    (isExtreme indicator)
✅ src/components/Map/MapPin.tsx              (glowPulse si isExtreme)
✅ src/components/Map/CityTooltip.tsx         (mensaje clima extremo)

🔄 src/components/UI/Toast.tsx           (← crear para notificaciones)
🔄 src/index.css                         (← fade transition)
```

---

## SPRINT 7 — Historial + Testing Tools + Responsive

**Objetivo:**
- Fase 1 ✅ (2026-03-31): Dashboard de Historial interactivo (US-608)
- Fase 2 ✅ (2026-03-31): Debug Tools (US-606 + US-609)
- Fase 3: Responsive design (tablet + mobile)
  - ✅ US-701 Tablet layout completado (2026-04-02): sidebar colapsable, toggle header
  - 🔄 US-702 Mobile layout en progreso: scroll fix, search en header, FilterPanelModal mejorado, botón reset filtros

**Definition of Done (Fase 2):**
- ✅ US-606: Tab "🔧 Caché" con visualización, filtros, eliminación
- ✅ US-609: Tab "📈 Métricas" con precisión por condición/región
- ✅ Ambas dev-only (oculto en producción)

### US incluidas (Sprint 7)

| Fase | US | Nombre | SP | Estado |
|------|----|----|----|----|
| Fase 1 | US-608 | Dashboard de Historial | 8 | ✅ Completada |
| Fase 2 | **US-606** | **Inspector Visual de Caché** | **5** | **✅ Completada** |
| Fase 2 | **US-609** | **Métricas de Precisión** | **3** | **✅ Completada** |
| Fase 3 | **US-703** | **Unified Sort Dropdown UX** | **3** | **✅ Completada** |
| Fase 3 | **US-701** | **Layout tablet (768–1024px)** | **5** | **✅ Completada (2026-04-02)** |
| Fase 3 | US-702 | Layout mobile (< 768px) | 8 | 🔄 En progreso |
| Fase 3 | US-704 | Barra de acciones mobile en lista | 3 | 🔨 En progreso |
| **Total** | | | **35 SP** | |

### Archivos modificados en Sprint 7 Fase 1

```
✅ src/components/TestingTools/TestingTools.tsx       (refactor: tabs)
✅ src/components/TestingTools/HistoryGrid.tsx        (nueva tabla resumen)
✅ src/components/TestingTools/SnapshotPopover.tsx    (nuevo modal detalle)
✅ src/config/conditionEmojis.ts                      (nueva config)
✅ src/utils/exportHistory.ts                         (nuevo export)
✅ src/docs/24-us608-history-dashboard.md             (documentación)
```

### Archivos a crear en Sprint 7 Fase 2

**US-606:**
```
src/components/TestingTools/CachePanel.tsx            (tabla + acciones caché)
src/components/TestingTools/CacheDetailPopup.tsx      (popup JSON + metadata)
src/utils/cacheDebugHelper.ts                         (funciones auxiliares)
src/docs/25-us606-cache-inspector.md                  (documentación)
```

**US-609 (siguiente):**
```
src/components/TestingTools/MetricsPanel.tsx          (tab Métricas)
src/docs/26-us609-precision-metrics.md                (documentación)
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
| Sprint 1 | ✅ Completado |
| Sprint 2 | ✅ Completado |
| Sprint 3 | ✅ Completado (refactorizado + polish 2026-03-21) |
| Sprint 4 | ✅ Completado (2026-03-21) |
| Sprint 5 | ✅ Completado (2026-03-22) — Badges, filtros, auto-scroll, z-index fix |
| **Sprint 6** | **✅ Completado (2026-03-30)** — Fase 1 ✅ (API real, batch, caching), Fase 2 ✅ (Lazy Load, Auto-refresh, Testing) |
| **Sprint 7** | **🔄 En progreso (2026-04-02)** — Fase 1 ✅ Historial, Fase 2 ✅ Debug Tools, Fase 3 🔄 Responsive: US-701 ✅ tablet, US-702 🔄 mobile |

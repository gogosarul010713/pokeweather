# Codebase Context

> Reference for AI agents. Read when exploring project structure or before making architectural decisions.

## Project Overview

Dashboard web interactivo que cruza datos de clima (AccuWeather) con tipos Pokemon potenciados (sistema Pokemon GO). Incluye mapa con pines de ciudades y nidos, sidebar con pronostico, y detalle de nidos Pokemon.

- **Tipo:** SPA React, sin backend propio
- **Package manager:** npm
- **Dev port:** 5174

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| UI | React 18 + Vite 5 |
| Mapa | Leaflet + react-leaflet |
| Estado global | Zustand 4 (`src/store/useStore.ts`) |
| Cache local | idb-keyval (IndexedDB) |
| Geo | s2-geometry (S2 cells para nidos) |
| Icons | @tabler/icons-react |
| Clima API | AccuWeather (pronostico horario) |
| Backend/Auth | Firebase (Firestore + Auth) |
| Export | exceljs |
| Tests | Playwright (e2e) + Vitest (unit) |

## Directory Structure

```
src/
  components/
    Map/          # Mapa principal, pines, busqueda, tooltip, leyenda
    Nests/        # NestCard, NestDetail, NestPopup, NestPin, MigrationBanner
    Sidebar/      # Panel lateral con pronostico y lista de ciudades
    BottomSheet/  # Panel inferior en mobile
    Header/       # Navegacion y tabs
    UI/           # Componentes genericos reutilizables
    TestingTools/ # Herramientas de debug (solo dev)
  config/
    weatherImages.ts    # WEATHER_IMAGES[condition] -> ruta imagen
    pokemonTypes.ts     # Tipos Pokemon y sus condiciones de clima
    nestThresholds.ts   # Umbrales de densidad para nidos
    conditionEmojis.ts  # Emojis por condicion de clima
    typeIcons.ts        # Iconos por tipo Pokemon
    zIndex.ts           # Z-index centralizados
  data/
    nests.json                # Dataset de nidos
    pokedensity-cities.json   # Ciudades con coordenadas y region
    pokedensity-nests.json    # Densidad de nidos por ciudad
  services/
    weather/    # Llamadas AccuWeather + logica de tipos potenciados
    cache/      # Wrappers IndexedDB (verificar antes de llamar API)
    firebase/   # Firestore reads/writes para nidos
    geo/        # S2 cells, distancia, punto base
    history/    # Historial de clima
  store/
    useStore.ts # Unico store Zustand — estado global de la app
  hooks/
    useWeather.ts   # Hook principal: carga clima + tipos potenciados
    useIsMobile.ts  # Breakpoint mobile
  types/        # Interfaces TypeScript (City usa `lon` no `lng`)
  utils/        # Helpers puros
ds-bundle/      # Design system local (tokens, componentes documentados)
tests/e2e/      # Playwright
tests/unit/     # Vitest
```

## Domain Concepts

| Concepto | Significado |
|----------|-------------|
| City | Ciudad del dataset con `lat`, `lon`, `region` (minusculas) |
| Nest | Punto geografico donde aparece un Pokemon especifico |
| Boosted type | Tipo Pokemon potenciado por la condicion climatica actual |
| Condition | Condicion climatica AccuWeather: sunny, cloudy, rain, snow, fog, windy |
| S2 Cell | Celda geografica S2 usada para agrupar nidos por zona |
| Punto base | Coordenada de referencia del usuario para ordenar nidos por distancia |
| Mi Zona | Feature que filtra nidos cercanos al punto base del usuario |

## Key Workflows

1. **Carga inicial:** `LoadingScreen` ciudad por ciudad -> `useWeather` -> cache IndexedDB -> AccuWeather API
2. **Nido detalle:** click NestPin -> NestPopup -> NestDetail (Firestore)
3. **Busqueda mapa:** `MapSearch` -> resultados locales -> fallback OSM si no hay match
4. **Mi Zona:** usuario fija punto base -> filtro por distancia S2 -> lista ordenada

## Patterns

- **Colores:** siempre `var(--x)` del design system, cero hardcodeados
- **Imagenes clima:** siempre `WEATHER_IMAGES[condition]` de `src/config/weatherImages.ts`
- **Cache:** verificar IndexedDB antes de cualquier llamada AccuWeather
- **Dataset:** dinamico, nunca asumir numero fijo de ciudades
- **Loading:** `LoadingScreen` progresivo obligatorio en carga inicial
- **Estilos:** un `<style>` por componente, prefijo de clase = nombre en kebab-case
- **Region:** siempre minusculas: `'asia'`, `'europa'`, `'america'`, `'oceania'`, `'africa'`
- **Coordenadas:** JSON usa `lng`, el tipo `City` usa `lon`

## Gotchas

- `lng` en JSON de ciudades != `lon` en el tipo TypeScript `City` -- siempre convertir
- WINDY reemplaza sunny/partly/cloudy pero NUNCA rain/snow/fog
- AccuWeather es pronostico horario -- NO clima actual, NO OpenWeatherMap
- Firebase Admin solo en contextos server-side (no en el cliente React)
- S2 cells tienen precision variable segun nivel -- nidos usan nivel 14

# CLAUDE.md — Pokémon Weather Explorer v2
# Este archivo lo lee Claude Code automáticamente al abrir el proyecto.

---

## PROYECTO

Dashboard web interactivo: clima de ciudades del mundo → tipos Pokémon potenciados (sistema Pokémon GO).

Stack: React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry.

---

## DOCUMENTACIÓN — carpeta docs/

Lee el archivo correspondiente antes de trabajar en esa área:

| Archivo | Cuándo leerlo |
|---------|--------------|
| `docs/01-project.md` | **Siempre** — arquitectura, estructura, convenciones |
| `docs/02-design.md` | Al tocar `index.css` o cualquier componente |
| `docs/03-weather-logic.md` | Al tocar `weatherService.js`, `useWeather.js`, `cacheService.js`, `mockCities.js` |
| `docs/04-api.md` | Al tocar fetch de AccuWeather o lógica de caché de API |
| `docs/05-backlog.md` | Para ver criterios de aceptación de cualquier US |
| `docs/06-sprints.md` | Para ver el plan de sprints y en qué US estamos |

---

## REGLAS CRÍTICAS

1. **Cero colores hardcodeados** en componentes — todo via `var(--x)` del design system
2. **Dataset dinámico** — el código nunca asume un número fijo de ciudades
3. **Imágenes de clima** — siempre via `WEATHER_IMAGES[condition]` de `src/config/weatherImages.js`
4. **Caché** — verificar IndexedDB antes de llamar a AccuWeather
5. **Loading progresivo** — `LoadingScreen` ciudad por ciudad, obligatorio en carga inicial
6. **API** — AccuWeather pronóstico horario. NO OpenWeatherMap. NO clima actual.
7. **`lng` → `lon`** — el JSON usa `lng`, el tipo `City` usa `lon`
8. **`region` en minúsculas** — `'asia'`, `'europa'`, `'america'`, `'oceania'`, `'africa'`
9. **Un `<style>` por componente** — con prefijo de clase obligatorio
10. **WINDY** — reemplaza sunny/partly/cloudy pero NUNCA rain/snow/fog

---

## VARIABLES DE ENTORNO

```
VITE_ACCUWEATHER_KEY=   # sin key → mock mode automático
```

---

## SPRINT ACTUAL

**Sprint:** 1 — Layout Foundation  
**Completado:** US-101, US-102  
**Siguiente:** US-103 — main.tsx (init tema desde localStorage)

## ARCHIVOS EXISTENTES
- `src/index.css` ✅ completo
- `src/App.tsx` — solo tiene `export default function App() { return null }`
- `src/main.tsx` — boilerplate de Vite sin modificar

## DECISIONES TOMADAS
- TypeScript (.tsx) — no .jsx
- CartoDB tiles (dark matter / positron)
- <style> por componente
- overflow: hidden en html/body/#root (fix Leaflet scroll)
- --glow-rgb como variable local en lugar de hardcoded en glowPulse
```

---
> Actualiza este bloque al avanzar de sprint.

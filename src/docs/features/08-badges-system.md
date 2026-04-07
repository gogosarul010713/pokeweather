# 07-BADGES — Sistema de Categorías y Filtros
# Sprint 5+ : Identificación visual de mejores puntos y filtrado por categorías

---

## CATEGORÍAS (Badges)

Cuatro categorías identifican las fortalezas de cada ubicación en Pokémon GO:

| Badge | Icono | Criterio | Descripción |
|-------|-------|----------|-------------|
| Pokeparadas | 🎯 | Top 25% en `density` | Muchas pokeparadas para farmear |
| Gimnasios | 💪 | Top 25% en `gyms` | Muchos gimnasios para batallas |
| Comunidad Activa | 👥 | `rating ≥ 4.0` | Comunidad muy participativa |
| Mejores Lugares | ✨ | Todas las 3 anteriores | Ubicación completa para todo |

---

## LÓGICA DE ASIGNACIÓN

```typescript
// src/data/weatherService.ts
export const calculateBadges = (cities) => {
  // Calcular cuartiles (top 25%)
  const q1Density = densities[Math.floor(densities.length * 0.25)]
  const q1Gyms = gymsArray[Math.floor(gymsArray.length * 0.25)]

  return (city) => {
    const hasStops = city.density >= q1Density
    const hasGyms = city.gyms >= q1Gyms
    const hasCommunity = city.rating >= 4.0

    // Si tiene TODAS → retorna solo 'best'
    if (hasStops && hasGyms && hasCommunity) {
      return ['best']
    }

    // Si no → retorna badges individuales
    const badges = []
    if (hasStops) badges.push('stops')
    if (hasGyms) badges.push('gyms')
    if (hasCommunity) badges.push('community')
    return badges
  }
}
```

### Regla especial: `'best'` excluye `'stops'`, `'gyms'`, `'community'`

Si una ciudad califica para todas (✨), solo retorna `['best']`, no una lista de 4.
Esto simplifica la UI: una ciudad "Mejores Lugares" se muestra con un único emoji.

---

## FILTRADO POR BADGES

### Store (useStore.ts)

```typescript
interface AppStore {
  badgeFilter: string[]         // Badges seleccionados (default: todos)
  setBadgeFilter: (badges: string[]) => void
}

// Estado inicial
badgeFilter: ['stops', 'gyms', 'community', 'best']
```

### Comportamiento

- **Por defecto**: Todos los badges están seleccionados (mostrar todo)
- **Al deseleccionar**: Se quitan del filtro y desaparecen del mapa y lista
- **Lógica**: OR — si selecciono 'stops' + 'gyms', muestro ciudades que tengan
  CUALQUIERA de esos badges

### Aplicación

**MapView.tsx** — Filtra los pins renderizados
```typescript
const filteredCities = useMemo(() => {
  if (badgeFilter.length === 0) return cities
  return cities.filter(city => {
    const cityBadges = badgesByCity.get(city.id) || []
    return cityBadges.some(badge => badgeFilter.includes(badge))
  })
}, [cities, badgeFilter, badgesByCity])
```

**LocationFeed.tsx** — Filtra la lista del sidebar
```typescript
// Mismo patrón: calcular badges y filtrar con OR logic
```

---

## INTERFAZ DE USUARIO

### MapLegend — Pestañas + Filtros

```
┌─ LEYENDA ─────────────────────────┐
│  [CLIMA] [CATEGORÍAS] ▼            │
├────────────────────────────────────┤
│  🟠 Soleado                        │
│  🔵 Parcial                        │
│  ⚪ Nublado                        │
│  🟦 Lluvia                         │
│  💧 Nieve                          │
│  ❄️ Niebla                         │
│  🌪️ Ventoso                       │
└────────────────────────────────────┘

        (Click CATEGORÍAS)

┌─ LEYENDA ─────────────────────────┐
│  [CLIMA] [CATEGORÍAS] ▼            │
├────────────────────────────────────┤
│  Iconos en pines        [Toggle ON]│
├────────────────────────────────────┤
│  ☑ 🎯 Pokestop Hub                 │
│  ☑ 💪 Gym Hub                      │
│  ☑ 👥 Comunidad Activa             │
│  ☑ ✨ Mejores Lugares              │
└────────────────────────────────────┘
```

**Ubicación**: `bottom-right` del mapa, `z-index: 450`

**Comportamiento**:
- Dos pestañas: **CLIMA** y **CATEGORÍAS**
- Tab CLIMA: Muestra 7 condiciones con sus colores
- Tab CATEGORÍAS:
  - Toggle "Iconos en pines" para mostrar/ocultar badges en los pins
  - Checkboxes para filtrar por categoría (OR logic)
- Todos seleccionados por defecto
- Click alterna estado (selected/deselected)
- Los cambios se aplican inmediatamente al mapa + sidebar
- Colapsable (chevron ▼/▲)

---

## COMPONENTES AFECTADOS

| Archivo | Cambios |
|---------|---------|
| `useStore.ts` | + `badgeFilter: string[]`, `setBadgeFilter()`, `showBadgesOnPins: boolean`, `setShowBadgesOnPins()` |
| `weatherService.ts` | + `'best'` badge, lógica exclusiva |
| `MapLegend.tsx` | + Pestañas (Clima / Categorías), Checkboxes interactivos, Toggle mostrar/ocultar badges |
| `MapView.tsx` | + Filtrado de `filteredCities` antes de renderizar pins |
| `LocationFeed.tsx` | + Filtrado con OR logic igual que MapView |
| `CityTooltip.tsx` | Rediseño 3 líneas (sin badges, solo info esencial) |
| `MapPin.tsx` | + Parámetro `showBadges` para condicionar si renderiza badges |

---

## CASOS DE USO

### Caso 1: Busco solo Pokeparadas
- Usuario deselecciona 'gyms', 'community', 'best'
- Quedan: solo 'stops'
- Mapa muestra: ciudades con top 25% densidad

### Caso 2: Busco Mejores Lugares (multitarea)
- Usuario deselecciona 'stops', 'gyms', 'community'
- Quedan: solo 'best'
- Mapa muestra: ciudades que tienen TODO (✨)

### Caso 3: Busco Comunidad O Gymnasia
- Usuario deselecciona 'stops', 'best'
- Quedan: 'gyms', 'community'
- Mapa muestra: ciudades con top 25% gyms **O** rating ≥ 4.0 (OR lógico)

---

## Z-INDEX FIX

**Bug arreglado en Sprint 5**:
- CustomSelect popup tenía `z-index: 200`
- Leaflet mapa tiene z-index ≥ 1000
- Solución: cambiar a `z-index: 1001` en `.cs-popup`

---

## PRÓXIMOS PASOS

- Sprint 6: AccuWeather real (API, refresh)
- Considerar: reducir espacio de MapLegend (ver sugerencia en final de sesión)

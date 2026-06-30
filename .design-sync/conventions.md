# Pokeweather Design System — Conventions

## Wrapping and Setup

Components are self-contained React components with no global provider needed. The Zustand store (`window.PokeweatherDS` does not export it) is initialized with default state automatically. For components that read from the store (`useStore`), seed state before rendering:

```jsx
import { useStore } from 'pokeweather/src/store/useStore'
// Seed before first render:
useStore.setState({ theme: 'dark', activeLayers: { clima: true, nidos: false, gyms: false, stops: false, rutas: false } })
```

Map components (MapPin, NestPin, CityTooltip, FlyToCity) require Leaflet's MapContainer to function interactively, but render as visual standalone elements in these previews.

## Styling Idiom

**CSS custom properties only** — no utility classes, no Tailwind, no CSS modules. Every component uses scoped `<style>` blocks with a unique class prefix (e.g. `.lc-root`, `.ui-chip`, `.cs-container`).

Key token families (all `var(--token-name)` on `:root`):

| Family | Tokens |
|---|---|
| Backgrounds | `--bg-primary` `--bg-secondary` `--bg-tertiary` `--bg-overlay` |
| Text | `--text-primary` `--text-secondary` `--text-accent` |
| Borders | `--border-subtle` `--border-default` `--border-strong` |
| UI semantic | `--ui-accent` `--ui-success` `--ui-warning` `--ui-error` |
| Weather conditions | `--condition-sunny` `--condition-rain` `--condition-cloudy` `--condition-fog` `--condition-snow` `--condition-windy` `--condition-partly` |
| Pokemon types | `--type-fire` `--type-water` `--type-grass` `--type-electric` `--type-ice` `--type-dragon` `--type-psychic` `--type-dark` `--type-ghost` `--type-fairy` etc. |

Default theme is **dark** (`--bg-primary: #0D1117`). Light theme applies when `<html class="light">`.

Typography: `font-family: 'Exo 2', sans-serif` (body), `'Rajdhani', sans-serif` (headings/accent). Both served via Google Fonts at runtime.

## Where the Truth Lives

- Component APIs: each `components/<group>/<Name>/<Name>.d.ts`
- Usage docs: each `components/<group>/<Name>/<Name>.prompt.md`
- All tokens: `styles.css` → `_ds_bundle.css`

## Idiomatic Build Snippet

```jsx
import { FilterChip, LocationCard, Toast } from 'pokeweather'
// Seed store for components that read global state:
import { useStore } from 'pokeweather/src/store/useStore'
useStore.setState({ favorites: [], theme: 'dark' })

function WeatherFilter() {
  const [active, setActive] = React.useState([])
  return (
    <div style={{ display: 'flex', gap: 8, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
      {['Soleado', 'Lluvia', 'Nieve'].map(c => (
        <FilterChip key={c} label={c} active={active.includes(c)}
          onClick={() => setActive(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} />
      ))}
    </div>
  )
}
```

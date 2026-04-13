# 🎨 Colores y Badges — Paleta Completa

**Rama:** `feature/nests`  
**Última actualización:** 2026-04-12  

---

## CSS Variables a Agregar

### index.css Root

```css
:root {
  /* ─── Nidos: Colores Primarios ─── */
  --nest-primary: #9C27B0;      /* Púrpura principal */
  --nest-hover: #7B1FA2;        /* Púrpura oscuro (hover) */
  --nest-light: #E1BEE7;        /* Púrpura claro (fondo) */
  --nest-icon: #FFFFFF;         /* Blanco para iconos */

  /* ─── Badge Colors ─── */
  --badge-verified: #3FB950;    /* Verde */
  --badge-hot: #D29922;         /* Naranja */
  --badge-new: #58A6FF;         /* Azul */
  --badge-common: #6E7681;      /* Gris */

  /* ─── Tipos Pokémon (18 tipos) ─── */
  --type-fire: #FF6B35;
  --type-water: #6890F0;
  --type-grass: #78C850;
  --type-normal: #A8A878;
  --type-electric: #F8D030;
  --type-ice: #98D8D8;
  --type-fighting: #C03028;
  --type-poison: #A040A0;
  --type-ground: #E0C068;
  --type-flying: #A890F0;
  --type-psychic: #F85888;
  --type-bug: #A8B820;
  --type-rock: #B8A038;
  --type-ghost: #705898;
  --type-dragon: #7038F8;
  --type-dark: #705848;
  --type-steel: #B8B8D0;
  --type-fairy: #EE99AC;
}
```

---

## TypeScript: Mapeos de Color

### nestService.ts

```typescript
export const POKEMON_TYPE_COLORS: Record<PokemonType, string> = {
  fire: '#FF6B35',
  water: '#6890F0',
  grass: '#78C850',
  normal: '#A8A878',
  electric: '#F8D030',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
}

export function getPokemonTypeColor(type: PokemonType): string {
  return POKEMON_TYPE_COLORS[type] || '#9C9C9C'
}
```

---

## Badges: Iconos y Colores

### Mapeos

```typescript
export const BADGE_ICONS: Record<BadgeType, string> = {
  verified: '✓',
  hot: '🔥',
  new: '⭐',
  common_spawn: '➕',
}

export const BADGE_LABELS: Record<BadgeType, string> = {
  verified: 'Verificado',
  hot: 'Activo/Caliente',
  new: 'Nuevo',
  common_spawn: 'Apariciones comunes',
}

export const BADGE_COLORS: Record<BadgeType, string> = {
  verified: '#3FB950',   // Verde
  hot: '#D29922',        // Naranja
  new: '#58A6FF',        // Azul
  common_spawn: '#6E7681', // Gris
}

export function getBadgeIcon(badge: BadgeType): string {
  return BADGE_ICONS[badge]
}

export function getBadgeLabel(badge: BadgeType): string {
  return BADGE_LABELS[badge]
}

export function getBadgeColor(badge: BadgeType): string {
  return BADGE_COLORS[badge]
}
```

---

## Leyenda: Colores por Tipo

### NestLegend.tsx

```tsx
const POKEMON_TYPES = [
  { type: 'fire', label: 'Fuego' },
  { type: 'water', label: 'Agua' },
  { type: 'grass', label: 'Planta' },
  { type: 'normal', label: 'Normal' },
  { type: 'electric', label: 'Eléctrico' },
  { type: 'ice', label: 'Hielo' },
  { type: 'fighting', label: 'Lucha' },
  { type: 'poison', label: 'Veneno' },
  { type: 'ground', label: 'Tierra' },
  { type: 'flying', label: 'Volador' },
  { type: 'psychic', label: 'Psíquico' },
  { type: 'bug', label: 'Bicho' },
  { type: 'rock', label: 'Roca' },
  { type: 'ghost', label: 'Fantasma' },
  { type: 'dragon', label: 'Dragón' },
  { type: 'dark', label: 'Siniestro' },
  { type: 'steel', label: 'Acero' },
  { type: 'fairy', label: 'Hada' },
]

export function NestLegend() {
  return (
    <div className="nest-legend">
      <h3>🎨 Tipos Pokémon</h3>
      {POKEMON_TYPES.map(({ type, label }) => (
        <div key={type} className="legend-item">
          <span
            className="color-box"
            style={{ backgroundColor: getPokemonTypeColor(type as PokemonType) }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## CSS Ejemplos

### Pin SVG

```css
.nest-pin {
  fill: var(--nest-primary);
  filter: drop-shadow(2px 2px 4px rgba(156, 39, 176, 0.3));
}

.nest-pin:hover {
  fill: var(--nest-hover);
  filter: drop-shadow(8px 8px 16px rgba(156, 39, 176, 0.4));
}

.nest-pin.selected {
  fill: var(--nest-hover);
  filter: drop-shadow(12px 12px 20px rgba(0, 0, 0, 0.5));
}
```

### Card

```css
.nest-card {
  border-left: 4px solid var(--nest-light);
  padding: 12px;
  border-radius: 6px;
  background: var(--bg);
  transition: all 150ms;
}

.nest-card.selected {
  background: var(--nest-light);
  border-left-color: var(--nest-primary);
  box-shadow: 0 0 0 2px var(--nest-primary);
}
```

### Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.badge.verified {
  background-color: var(--badge-verified);
}

.badge.hot {
  background-color: var(--badge-hot);
}

.badge.new {
  background-color: var(--badge-new);
}

.badge.common_spawn {
  background-color: var(--badge-common);
  color: white;
}
```

### Toggle Button

```css
.mode-toggle button.active {
  background: linear-gradient(135deg, var(--nest-primary) 0%, var(--nest-hover) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3);
}
```

---

## Tabla de Referencia Completa

| Elemento | Variable | Hex | RGB | Uso |
|----------|----------|-----|-----|-----|
| Nidos Primario | --nest-primary | #9C27B0 | rgb(156,39,176) | Pins, botones activos |
| Nidos Hover | --nest-hover | #7B1FA2 | rgb(123,31,162) | Hover pins, selected |
| Nidos Light | --nest-light | #E1BEE7 | rgb(225,190,231) | Fondos, backgrounds |
| Badge Verified | --badge-verified | #3FB950 | rgb(63,185,80) | Verde checkmark |
| Badge Hot | --badge-hot | #D29922 | rgb(210,153,34) | Naranja flame |
| Badge New | --badge-new | #58A6FF | rgb(88,166,255) | Azul star |
| Badge Common | --badge-common | #6E7681 | rgb(110,118,129) | Gris plus |
| Fuego | --type-fire | #FF6B35 | rgb(255,107,53) | Fire type |
| Agua | --type-water | #6890F0 | rgb(104,144,240) | Water type |
| Planta | --type-grass | #78C850 | rgb(120,200,80) | Grass type |

---

## Dark Mode Considerations

CSS Variables son **automáticamente dark-mode aware** si el proyecto ya tiene:

```css
[data-theme="dark"] {
  --bg: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --border: #404040;
  /* etc */
}
```

Los colores de Nidos (púrpura, badges) funcionan bien en ambos temas por su saturación y contraste.

---

## Validación Visual

Crear test visual checklist:

```
Dark Mode ☀️ / 🌙
├─ Pins púrpura visibles
├─ Badges leíbles
├─ Tooltips legibles
├─ Panel detalle visible
└─ Cards tienen contraste

Light Mode
├─ Pins púrpura visibles
├─ Badges leíbles
├─ Tooltips legibles
├─ Panel detalle visible
└─ Cards tienen contraste
```

---

**Última actualización:** 2026-04-12  
**Rama:** feature/nests  


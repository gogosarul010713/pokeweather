# 📋 US-803 — Sidebar Listado de Nidos

**Sprint:** 8 (Fase 1) | **SP:** 2 | **Prioridad:** P0 | **Status:** ⏳ Pendiente | **Dep:** US-801

---

## Historia

> Como usuario, quiero ver lista de nidos en sidebar para seleccionar rápidamente.

---

## Criterios

- [ ] NestFeed.tsx: scroll list con 5 nidos
- [ ] Cada card: nombre + país + tipo Pokémon
- [ ] Clic en card → abre NestDetail
- [ ] Auto-scroll al seleccionar desde pin en mapa
- [ ] Favoritos: ⭐ toggle activo/inactivo
- [ ] 3 modos: 📋 (list) | 📍 (detalle) | ⭐ (favoritos)

---

## Archivos a Crear

### NestFeed.tsx (~100 líneas)

```tsx
export function NestFeed() {
  const { nests, selectedNest, nestFavorites } = useStore()
  const { setSelectedNest } = useStore()
  
  return (
    <div className="nest-feed">
      {nests.map(nest => (
        <NestCard
          key={nest.id}
          nest={nest}
          isSelected={selectedNest?.id === nest.id}
          isFavorite={nestFavorites.includes(nest.id)}
          onClick={() => setSelectedNest(nest)}
        />
      ))}
    </div>
  )
}
```

**CSS:**
```css
.nest-feed {
  overflow-y: auto;
  max-height: calc(100vh - 120px);
  padding: 12px;
  gap: 8px;
  display: flex;
  flex-direction: column;
}
```

**Ubicación:** `src/components/Nests-Sidebar/NestFeed.tsx`

---

### NestCard.tsx (~80 líneas)

```tsx
interface Props {
  nest: Nest
  isSelected: boolean
  isFavorite: boolean
  onClick: () => void
}

export function NestCard({ nest, isSelected, isFavorite, onClick }: Props) {
  return (
    <div className={isSelected ? 'nest-card selected' : 'nest-card'} onClick={onClick}>
      <div className="nest-card-header">
        <h3>{nest.name}</h3>
        {isFavorite && <span className="favorite-star">⭐</span>}
      </div>
      <p className="nest-card-info">
        {nest.country} • {nest.city}
      </p>
      <p className="nest-card-pokemon">
        {nest.nestPokemon[0].name} ({nest.nestPokemon[0].type})
        <span style={{ color: getPokemonTypeColor(nest.nestPokemon[0].type) }}>■</span>
      </p>
    </div>
  )
}
```

**CSS:**
```css
.nest-card {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms;
  background: var(--bg);
}

.nest-card:hover {
  background: var(--bg-hover);
  border-color: var(--nest-primary);
}

.nest-card.selected {
  background: var(--nest-light);
  border-color: var(--nest-primary);
  box-shadow: 0 0 0 2px var(--nest-primary);
}
```

**Ubicación:** `src/components/Nests-Sidebar/NestCard.tsx`

---

## Validación

- [ ] 5 cards visibles en sidebar
- [ ] Clic card → abre NestDetail
- [ ] Favorito ⭐ visible si está marcado
- [ ] Selección visual funciona
- [ ] Scroll funciona con 5+ items

---

**Última actualización:** 2026-04-12 | **Bloqueante para:** US-804


# 📌 US-804 — Panel Detalle del Nido

**Sprint:** 8 (Fase 1) | **SP:** 3 | **Prioridad:** P0 | **Status:** ⏳ Pendiente | **Dep:** US-801, US-803

---

## Historia

> Como usuario, quiero ver información completa del nido para tomar decisiones informadas.

---

## Criterios

- [ ] Nombre + país + región + ciudad
- [ ] Coordenadas copiables (copy to clipboard feedback)
- [ ] Pokémon: nombre + tipo + % spawn + IV mín
- [ ] Fecha: descubierto + última verificación
- [ ] Radio cobertura + exactitud
- [ ] Badges: verified (✓) | hot (🔥) | new (⭐) | common_spawn (➕)
- [ ] Botón favorito (⭐) con toggle
- [ ] Panel deslizante desde derecha (modal overlay)

---

## Archivo a Crear

### NestDetail.tsx (~150 líneas)

```tsx
interface Props {
  nest: Nest | null
  onClose: () => void
}

export function NestDetail({ nest, onClose }: Props) {
  if (!nest) return null

  return (
    <div className="nest-detail">
      {/* Header */}
      <div className="nd-header">
        <h2>{nest.name}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Ubicación */}
      <section className="nd-section">
        <h3>📍 Ubicación</h3>
        <p>{nest.country} • {nest.region} • {nest.city}</p>
        <div className="nd-coords">
          <code>{nest.lat.toFixed(4)}, {nest.lon.toFixed(4)}</code>
          <button onClick={() => copyToClipboard(...)}>Copiar</button>
        </div>
      </section>

      {/* Pokémon */}
      <section className="nd-section">
        <h3>🎯 Pokémon Nidificado</h3>
        {nest.nestPokemon.map(poke => (
          <div key={poke.pokemonId} className="nd-pokemon">
            <p>{poke.name}</p>
            <p>Tipo: {poke.type}</p>
            <p>Spawn: {poke.spawnRate}%</p>
            {poke.minIV && <p>IV mín: {poke.minIV}</p>}
          </div>
        ))}
      </section>

      {/* Metadatos */}
      <section className="nd-section">
        <h3>ℹ️ Información</h3>
        <p>Descubierto: {nest.discoveredAt}</p>
        <p>Verificado: {nest.lastVerifiedAt}</p>
        <p>Radio: {nest.radius}m</p>
        <p>Exactitud: {nest.accuracy}</p>
      </section>

      {/* Badges */}
      <section className="nd-section">
        <h3>🏅 Badges</h3>
        {nest.badges.map(badge => (
          <span key={badge} className="badge">
            {getBadgeIcon(badge)} {getBadgeLabel(badge)}
          </span>
        ))}
      </section>

      {/* Botón Favorito */}
      <button className="favorite-btn" onClick={toggleFavorite}>
        ⭐ Marcar como favorito
      </button>
    </div>
  )
}
```

**CSS:**
```css
.nest-detail {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: var(--bg);
  border-left: 2px solid var(--nest-primary);
  z-index: 100;
  overflow-y: auto;
  padding: 16px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
}

.nd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
}

.nd-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.nd-coords {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--badge-verified);
  color: white;
  margin-right: 8px;
  font-size: 12px;
}

.favorite-btn {
  width: 100%;
  padding: 12px;
  background: var(--nest-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
```

**Ubicación:** `src/components/Nests-Sidebar/NestDetail.tsx`

---

## Validación

- [ ] Panel abre al hacer clic en "Ver detalle"
- [ ] Información se muestra completa
- [ ] Botón X cierra panel
- [ ] Copy coords funciona
- [ ] Favorito toggle funciona
- [ ] Panel no oculta completamente mapa

---

**Última actualización:** 2026-04-12 | **Bloqueante para:** Integración


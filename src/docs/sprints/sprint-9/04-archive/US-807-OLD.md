# 💬 US-807 — Popup Información Rápida

**Sprint:** 8 (Fase 1) | **SP:** 2 | **Prioridad:** P0 | **Status:** ⏳ Pendiente | **Dep:** US-802

---

## Historia

> Como usuario, quiero ver información rápida del nido al hacer clic en el pin.

---

## Criterios

- [ ] NestTooltip.tsx: 3-4 líneas comprimidas
- [ ] Línea 1: 🟣 Nombre Nido | País
- [ ] Línea 2: Pokémon (tipo) | Spawn Rate (%)
- [ ] Línea 3: Badges (verified, hot, etc)
- [ ] Botón "Ver detalle →" abre NestDetail
- [ ] Botón "Copiar coords" con feedback visual
- [ ] Dark mode aware (CSS variables)
- [ ] Posicionamiento correcto (no sale del viewport)

---

## Archivo a Crear

### NestTooltip.tsx (~120 líneas)

```tsx
import { Popup } from 'react-leaflet'
import { getBadgeIcon, getBadgeLabel } from '@/services/nests/nestService'
import type { Nest } from '@/types/nest'

interface Props {
  nest: Nest
}

export function NestTooltip({ nest }: Props) {
  const handleCopyCoords = async () => {
    const coords = `${nest.lat.toFixed(4)}, ${nest.lon.toFixed(4)}`
    await navigator.clipboard.writeText(coords)
    // Mostrar feedback visual
    alert('✓ Coordenadas copiadas')
  }

  return (
    <Popup position={[nest.lat, nest.lon]} closeButton={true}>
      <div className="nest-tooltip">
        {/* Línea 1: Nombre + País */}
        <div className="nt-row">
          <strong>🟣 {nest.name}</strong>
          <span>{nest.country}</span>
        </div>

        {/* Línea 2: Pokémon + Spawn */}
        <div className="nt-row">
          <span>{nest.nestPokemon[0].name}</span>
          <span>({nest.nestPokemon[0].type})</span>
          <span>{nest.nestPokemon[0].spawnRate}%</span>
        </div>

        {/* Línea 3: Badges */}
        <div className="nt-badges">
          {nest.badges.map(badge => (
            <span key={badge} title={getBadgeLabel(badge)}>
              {getBadgeIcon(badge)}
            </span>
          ))}
        </div>

        {/* Botones */}
        <div className="nt-actions">
          <button onClick={handleCopyCoords} className="btn-copy">
            📍 Copiar
          </button>
          <button className="btn-detail">
            Ver detalle →
          </button>
        </div>
      </div>
    </Popup>
  )
}
```

**CSS:**
```css
.nest-tooltip {
  padding: 12px;
  font-size: 12px;
  line-height: 1.6;
  min-width: 200px;
}

.nt-row {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.nt-row strong {
  color: var(--nest-primary);
}

.nt-badges {
  display: flex;
  gap: 4px;
  margin: 6px 0;
}

.nt-badges span {
  cursor: help;
}

.nt-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.btn-copy,
.btn-detail {
  flex: 1;
  padding: 4px 6px;
  font-size: 11px;
  border: 1px solid var(--nest-primary);
  background: transparent;
  color: var(--nest-primary);
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms;
}

.btn-detail {
  background: var(--nest-primary);
  color: white;
}

.btn-copy:hover,
.btn-detail:hover {
  opacity: 0.8;
}
```

**Ubicación:** `src/components/Nests/NestTooltip.tsx`

---

## Integración

En `NestMapView.tsx`:
```tsx
{selectedNest && <NestTooltip nest={selectedNest} />}
```

Botón "Ver detalle" → `setSelectedNest()` → abre `NestDetail.tsx`

---

## Validación

- [ ] Popup aparece al clic en pin
- [ ] 3 líneas de información visibles
- [ ] Badges se muestran con iconos
- [ ] Botón copiar funciona
- [ ] Botón "Ver detalle" abre panel
- [ ] Popup no sale del viewport
- [ ] Dark mode se ve bien

---

**Última actualización:** 2026-04-12 | **Sesión:** 2


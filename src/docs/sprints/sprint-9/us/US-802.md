# 📌 US-802 — Pins de Nidos en Mapa

**Sprint:** 8 (Fase 1)  
**Story Points:** 3 SP  
**Prioridad:** P0  
**Status:** ⏳ Pendiente  
**Dependencia:** US-801 ✅

---

## Historia de Usuario

> Como usuario, quiero ver los nidos como pins en el mapa para ubicarlos geográficamente.

---

## Criterios de Aceptación

- [ ] NestPin.tsx renderiza SVG gota púrpura
- [ ] Icono diferenciado: naranja (clima) vs púrpura (nidos)
- [ ] Hover: efecto visual (grow + glow)
- [ ] Clic: abre NestTooltip con información
- [ ] Color dinámico por tipo Pokémon
- [ ] Responsive: visible en 768px+
- [ ] Z-index correcto (1000+)
- [ ] Sin afectar pins de Clima

---

## Archivos a Crear

### NestMapView.tsx (~80 líneas)
**Responsabilidad:** Contenedor mapa de nidos

**Estructura:**
```tsx
export function NestMapView() {
  const { nests, selectedNest } = useStore()
  const { setSelectedNest } = useStore()
  
  return (
    <MapContainer {...config}>
      <TileLayer {...tileConfig} />
      {nests.map(nest => (
        <NestPin
          key={nest.id}
          nest={nest}
          isSelected={selectedNest?.id === nest.id}
          onClick={() => setSelectedNest(nest)}
        />
      ))}
      {selectedNest && <NestTooltip nest={selectedNest} />}
      <NestLegend />
    </MapContainer>
  )
}
```

**Ubicación:** `src/components/Nests/NestMapView.tsx`

---

### NestPin.tsx (~100 líneas)
**Responsabilidad:** Marcador SVG en mapa

**Props:**
```typescript
interface Props {
  nest: Nest
  isSelected: boolean
  onClick: () => void
}
```

**Estructura:**
```tsx
export function NestPin({ nest, isSelected, onClick }: Props) {
  const color = getPokemonTypeColor(nest.nestPokemon[0].type)
  
  return (
    <Marker
      position={[nest.lat, nest.lon]}
      icon={L.divIcon({
        className: isSelected ? 'nest-pin selected' : 'nest-pin',
        html: `<svg>...</svg>`, // SVG gota
      })}
      onClick={onClick}
    />
  )
}
```

**CSS Estilos:**
```css
.nest-pin {
  fill: var(--nest-primary);
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 150ms;
  cursor: pointer;
}

.nest-pin:hover {
  transform: scale(1.2);
  filter: drop-shadow(8px 8px 16px rgba(157, 39, 176, 0.4));
}

.nest-pin.selected {
  fill: var(--nest-hover);
  transform: scale(1.35);
  filter: drop-shadow(12px 12px 20px rgba(0, 0, 0, 0.5));
}
```

**Ubicación:** `src/components/Nests/NestPin.tsx`

---

## Validación

### Visual Checks
- [ ] 5 pins púrpura visibles en mapa
- [ ] Pins en coordenadas correctas
- [ ] Hover → efecto grow + glow funciona
- [ ] Clic → NestTooltip aparece
- [ ] Color varía por tipo Pokémon
- [ ] Z-index: pins por encima de mapa

### Responsive
- [ ] Desktop (1920x1080): pins visibles
- [ ] Tablet (768x1024): pins visibles
- [ ] Mobile (375x667): pins visibles (si resize)

---

## Checklist

- [ ] NestMapView.tsx creado
- [ ] NestPin.tsx creado
- [ ] SVG gota implementado
- [ ] Colores dinámicos funcionan
- [ ] Hover/selected states visibles
- [ ] npm run build → PASSED
- [ ] 5 pins visibles en navegador

---

**Última actualización:** 2026-04-12  
**Dependencia:** US-801, US-807 (NestTooltip)  
**Bloqueante para:** US-803 (sidebar necesita mapear nests)


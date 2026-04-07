# US-706: Bottom Sheet con Drag Handle (Mobile)

**Sprint**: 8  
**Story Points**: 13  
**Status**: DISEÑO COMPLETADO (2026-04-07)  
**Asignado a**: Sprint 8 Fase 1

---

## 📋 Resumen Ejecutivo

Implementar un componente **BottomSheet** redimensionable que encapsule `LocationFeed` en mobile (<768px). El panel tendrá un handle de arrastre (píldora gris centrada) con 3 snap positions (80vh, 40vh, colapsado) siguiendo el patrón UX de Google Maps.

---

## 🎯 Propuesta Arquitectura

### Estructura Mobile Final
```
┌─────────────────────────────────────┐
│     HEADER GLOBAL (minimalista)     │  80px fijo
│     (Título + Sync Badge)           │
├─────────────────────────────────────┤
│                                     │
│         MAPA (flex: 1)              │  Se expande al colapsarse sheet
│         (Leaflet MapView)           │
│                                     │
├─────────────────────────────────────┤ ← Sheet comienza aquí
│        [═══ handle pill ═══]        │  4px altura, 40px ancho, draggable
├─────────────────────────────────────┤
│  SHEET HEADER:                      │  Se mueve CON el sheet
│  [Filtros] [Ordenar] [Buscar?]      │
├─────────────────────────────────────┤
│                                     │
│      LocationFeed (scrollable)      │  Scroll interno cuando necesario
│      - Ciudad 1                     │
│      - Ciudad 2                     │
│      - Ciudad 3                     │
│                                     │
└─────────────────────────────────────┘
```

### Cambios en App.tsx (Mobile)
```javascript
@media (max-width: 767px) {
  .app-body {
    flex-direction: column;
    height: 100vh;        // Full viewport
    overflow: hidden;     // ← CAMBIO: No scroll en body
  }

  .app-map-area {
    flex: 1;              // ← CAMBIO: flex:1 en lugar de height:55vh
    overflow: hidden;     // Map no scrollea
  }

  .app-list-area {
    display: none;        // ← LocationFeed ahora en BottomSheet
  }
}
```

### Componentes Involucrados

| Componente | Cambio | Propósito |
|-----------|--------|----------|
| `App.tsx` | Remover `.app-list-area` de mobile | Integrar LocationFeed en BottomSheet |
| `BottomSheet.tsx` | **NUEVO** | Contenedor draggable con 3 snaps |
| `LocationFeed.tsx` | Remover `<style>` relacionados a mobile | Ahora es hijo de BottomSheet |
| `Sidebar.tsx` | Mostrar BottomSheet en mobile | Lógica condicional por viewport |
| `index.css` | Limpiar `.app-list-area` media query | Simplificar |

---

## ⚙️ Especificación Técnica: BottomSheet.tsx

### Props
```typescript
interface BottomSheetProps {
  children: React.ReactNode;  // LocationFeed
  title?: string;             // "📋 Ciudades"
}
```

### State Management (Local)
```typescript
const [sheetHeight, setSheetHeight] = useState(40);  // % del viewport
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState({ y: 0, heightPercent: 0 });
```

### Snap Positions (constantes)
```typescript
const SNAP_POSITIONS = {
  expanded: 80,    // 80vh
  middle: 40,      // 40vh
  collapsed: 5,    // Solo handle visible (~20px)
};
```

### Lógica de Drag

#### 1. Inicio (handleDragStart)
```
- Registrar: startY (mouse/touch), heightPercent inicial
- setIsDragging(true)
```

#### 2. Movimiento (handleDragMove)
```
- Calcular: deltaY = currentY - startY
- Nueva altura = heightPercent - (deltaY / viewportHeight * 100)
- Limitar a [5%, 80%]
- Aplicar altura en tiempo real (NO transition durante drag)
```

#### 3. Soltar (handleDragEnd)
```
- Encontrar snap más cercano a heightPercent actual
- Animar a ese snap con transition: height 0.3s ease
- setIsDragging(false)
```

### Snap Logic (función helper)
```typescript
function findClosestSnap(currentPercent: number): number {
  const snaps = [5, 40, 80];
  return snaps.reduce((closest, snap) => 
    Math.abs(snap - currentPercent) < Math.abs(closest - currentPercent) 
      ? snap 
      : closest
  );
}
```

### Eventos

| Evento | Listeners | Cleanup |
|--------|-----------|---------|
| `handleDragStart` | `onMouseDown` (handle) + `onTouchStart` (handle) | - |
| `handleDragMove` | `mousemove` + `touchmove` (document) | removeEventListener en dragEnd |
| `handleDragEnd` | `mouseup` + `touchend` (document) | Ambos listeners removidos |

---

## 🎨 Estilos (CSS-in-JS)

```css
.bs-root {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  
  /* Altura dinámica */
  height: var(--sheet-height);  /* JS: calc(80vh) / calc(40vh) / etc */
  
  /* Transición suave (excepto durante drag) */
  transition: height 0.3s ease;
  
  /* Sin transición durante drag */
  &.dragging {
    transition: none;
  }
  
  background: var(--bg-primary);
  border-top: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  z-index: 50;
}

.bs-handle {
  /* Píldora de drag */
  width: 40px;
  height: 4px;
  background: var(--border-default);
  border-radius: 2px;
  margin: 8px auto;
  cursor: grab;
  user-select: none;
  
  &:active {
    cursor: grabbing;
  }
}

.bs-header {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 40px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
  gap: 8px;
  
  /* Mostrar filtros + ordenamiento aquí */
}

.bs-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;  /* Crucial para que flex:1 funcione */
}
```

---

## 📏 Estados Visuales

### Estado 1: Expandido (80vh)
```
┌─────────────────┐
│ [handle]        │
│ Filtros | Sort  │
├─────────────────┤
│ Ciudad 1        │
│ Ciudad 2        │
│ Ciudad 3        │  ← Scroll si hay más
│ Ciudad 4        │
│ Ciudad 5        │
│ Ciudad 6        │
└─────────────────┘
```

### Estado 2: Medio (40vh)
```
┌─────────────────┐
│ [handle]        │
│ Filtros | Sort  │
├─────────────────┤
│ Ciudad 1        │
│ Ciudad 2        │
│ Ciudad 3        │  ← Scroll visible
└─────────────────┘
(mapa arriba ocupa más espacio)
```

### Estado 3: Colapsado (5%)
```
┌─────────────────┐
│ [handle]        │
│ (solo 1 píldora)│
└─────────────────┘
(mapa ocupa casi todo)
```

---

## ✅ Criterios de Aceptación

### Funcionalidad
- [ ] **US-706-1**: Handle visible y centrado (píldora gris 40px × 4px)
- [ ] **US-706-2**: Drag vertical con mouse (mousedown → mousemove → mouseup)
- [ ] **US-706-3**: Drag vertical con touch (touchstart → touchmove → touchend)
- [ ] **US-706-4**: 3 snap positions funcionan (80vh, 40vh, colapsado)
- [ ] **US-706-5**: Smart snap al soltar (elige posición más cercana)
- [ ] **US-706-6**: Transición suave 300ms ease al snappear
- [ ] **US-706-7**: Sin transición durante drag (fluidez)
- [ ] **US-706-8**: Filtros/Ordenamiento accesibles en sheet header (siempre visibles)

### Interacción
- [ ] **US-706-9**: LocationFeed scrollea internamente cuando contenido excede altura
- [ ] **US-706-10**: Al expandir (drag up), mapa se achica fluidamente
- [ ] **US-706-11**: Al colapsarse (drag down), mapa se agranda
- [ ] **US-706-12**: Mapa NO redimensiona durante drag (solo al snappear)

### UX
- [ ] **US-706-13**: Handle tiene cursor: grab (feedback visual)
- [ ] **US-706-14**: Handle cambia a cursor: grabbing al arrastrar
- [ ] **US-706-15**: Botones en LocationFeed siguen clickeables en todos los snaps

### Técnico
- [ ] **US-706-16**: Build PASS (npm run build)
- [ ] **US-706-17**: TypeScript sin errores (strict mode)
- [ ] **US-706-18**: Mobile responsive testing (<768px, 375-500px ancho)

### Testing (E2E)
- [ ] **US-706-19**: Drag expand (collapsed → expanded → snap)
- [ ] **US-706-20**: Drag collapse (expanded → collapsed → snap)
- [ ] **US-706-21**: Smart snap (drag a 50% → salta a 40% más cercano)
- [ ] **US-706-22**: LocationFeed scroll (lista de 10+ ciudades, scrollea dentro del sheet)
- [ ] **US-706-23**: Filtros funcionan (click en filtro → lista se actualiza)

---

## 📋 Pasos de Implementación

### Paso 1: Preparar App.tsx (10 min)
1. Leer App.tsx media queries mobile
2. Cambiar `.app-list-area` altura fija → `display: none`
3. Cambiar `.app-map-area` altura fija (55vh) → `flex: 1`
4. Verificar que `.app-body` tiene `overflow: hidden` en mobile

### Paso 2: Crear BottomSheet.tsx (60 min)
1. Crear archivo `src/components/BottomSheet/BottomSheet.tsx`
2. Implementar state (sheetHeight, isDragging, dragStart)
3. Implementar eventos (dragStart, dragMove, dragEnd)
4. Implementar snap logic (findClosestSnap)
5. Agregar estilos CSS-in-JS
6. Exportar en `index.ts`

### Paso 3: Integrar BottomSheet en Sidebar.tsx (30 min)
1. Importar BottomSheet
2. Condicional: `if (viewport < 768px) return <BottomSheet><LocationFeed /></BottomSheet>`
3. En desktop/tablet: mostrar LocationFeed directamente
4. Propagar LocationFeed props (cities, etc.)

### Paso 4: Mover Filtros a BottomSheet Header (20 min)
1. Crear `BottomSheet/SheetHeader.tsx` con Filtros + Ordenamiento
2. Integrar en BottomSheet (no en LocationFeed header)
3. Remover botones de LocationFeed header si existían

### Paso 5: Testing Manual (20 min)
1. Abrir DevTools móvil (375px)
2. Probar drag expand/collapse
3. Probar snap positions
4. Probar LocationFeed scroll interno
5. Probar filtros dentro del sheet

### Paso 6: Testing E2E (30 min)
1. Escribir 5 tests Playwright (expand, collapse, snap, scroll, filters)
2. Ejecutar: `npm run test:e2e`
3. Documentar resultados en PR

### Paso 7: Build + Cleanup (10 min)
1. `npm run build` → debe pasar
2. Revisar tipos TypeScript
3. Remover `.app-list-area` de index.css si no se usa en otros lados

**Tiempo Total Estimado**: ~3-4 horas (con testing)

---

## 🔗 Componentes Relacionados

- `src/components/Sidebar/LocationFeed.tsx` → Hijo de BottomSheet en mobile
- `src/components/Sidebar/LocationCard.tsx` → Dentro de LocationFeed (sin cambios)
- `src/App.tsx` → Cambios media query mobile
- `src/index.css` → Limpiar `.app-list-area`

---

## 📝 Notas de Arquitectura

### ¿Por qué BottomSheet separado?
- **Responsabilidad única**: BottomSheet maneja drag/snap, LocationFeed maneja lista de ciudades
- **Reutilizable**: Futuro: poder usar BottomSheet para otros paneles
- **Testing**: Fácil testear drag logic aisladamente

### ¿Por qué Opción B (header scrollea)?
- **Espacio**: Mobile tiene 375px, no hay espacio para header global + sheet grande
- **Patrón**: Google Maps, Uber, Spotify usan este modelo
- **UX**: Mapa es contenido principal, debe dominar pantalla

### ¿Mapa redimensiona en tiempo real o al soltar?
- **Decisión**: NO redimensiona durante drag (jerky)
- **Alternativa futura**: CSS `resize: vertical` para mapa si user lo solicita

---

## 🧪 Test Plan Ejemplo (Playwright)

```typescript
// tests/mobile-bottom-sheet.spec.ts

describe('BottomSheet Mobile', () => {
  beforeEach(() => {
    cy.viewport(375, 812);  // iPhone
    cy.visit('/');
  });

  it('US-706-19: Drag expand (collapsed → expanded)', () => {
    cy.get('.bs-handle').drag({ x: 0, y: -300 });  // Drag up 300px
    cy.get('.bs-root').should('have.css', 'height', '80vh');
  });

  it('US-706-20: Drag collapse (expanded → collapsed)', () => {
    cy.get('.bs-handle').drag({ x: 0, y: 300 });   // Drag down 300px
    cy.get('.bs-root').should('have.css', 'height', '5%');
  });

  it('US-706-21: Smart snap (50% → 40% closest)', () => {
    cy.get('.bs-handle').drag({ x: 0, y: -150 });  // Drag a ~50%
    // Esperar snap animation
    cy.get('.bs-root').should('have.css', 'height', '40vh');
  });
});
```

---

## 📚 Referencias

- [Google Maps Bottom Sheet Pattern](https://material.io/components/bottom-sheet)
- [Framer Motion Drag Docs](https://www.framer.com/motion/drag/)
- [Touch Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)

---

## Estado

| Fase | Status | Fecha |
|------|--------|-------|
| Diseño | ✅ COMPLETO | 2026-04-07 |
| Implementación | ⏳ Pendiente | - |
| Testing | ⏳ Pendiente | - |
| Merge | ⏳ Pendiente | - |

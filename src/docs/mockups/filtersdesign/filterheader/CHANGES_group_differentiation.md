# Handoff: Filter Panel — Diferenciación de grupos Clima / Nidos

## Contexto

Este documento describe **5 mejoras visuales y de UX** aplicadas encima del diseño base del filter panel (documentado en `README.md`). El problema que resuelven: el usuario no lograba separar mentalmente los filtros de Clima de los de Nidos al scrollear el panel, porque se veían como una lista continua.

Estas mejoras se implementaron juntas y son interdependientes visualmente — no omitas ninguna.

---

## Archivo de referencia

`Filter Panel 4a.dc.html` — prototipo interactivo completo con todas las mejoras activas.  
Para verlo: servir desde la raíz del proyecto y abrir en navegador (necesita `support.js` y `_ds/`).

---

## Las 5 mejoras a implementar

---

### 1. Barra lateral de color por grupo

**Qué hace:** Una línea vertical de `3px` en el borde izquierdo de cada grupo, azul para Clima y verde para Nidos. Corre de arriba a abajo de toda la sección, incluyendo el header sticky y todo el contenido colapsable.

**Cómo:** El wrapper `div` de cada grupo lleva `border-left`:

```jsx
// Wrapper del grupo CLIMA
<div style={{ borderLeft: '3px solid #58a6ff' }}>
  {/* sticky header + contenido */}
</div>

// Wrapper del grupo NIDOS
<div style={{ borderLeft: '3px solid #22c55e' }}>
  {/* sticky header + contenido */}
</div>
```

**Importante:** Este `div` es el contenedor directo de todo lo del grupo — el header sticky y el contenido colapsable van adentro de él. No pongas `border-left` en el header solo; debe abarcar todo.

---

### 2. Headers de grupo sticky

**Qué hace:** El header de cada grupo ("FILTROS DE CLIMA" / "FILTROS DE NIDOS") queda pegado al tope del scroll mientras el usuario navega dentro del panel. Cuando la sección de Clima termina y empieza la de Nidos, el header azul desaparece y el verde toma su lugar.

**Requiere:** El contenedor scrollable del panel (el `div` con `overflow-y: auto` que contiene todos los acordeones) debe ser el scroll container. Los headers sticky son descendientes directos de ese contenedor (a través del wrapper de grupo).

**Estilos del header Clima:**
```jsx
<div
  onClick={toggleClimaGroup}
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 2,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 14px 8px 11px',
    background: 'var(--bg-secondary)',       // mismo bg que el panel — cubre el contenido al scrollear
    backdropFilter: 'blur(8px)',             // difumina contenido que pasa por debajo
    borderBottom: '1px solid rgba(88,166,255,0.2)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)', // sombra para elevar visualmente el header
  }}
>
```

**Estilos del header Nidos:** idénticos excepto `borderBottom: '1px solid rgba(34,197,94,0.2)'`.

**Contenido interno del header (mismo para ambos grupos, distinto color):**

```jsx
<div>
  <div style={{
    font: "700 11px/1 'Rajdhani', sans-serif",
    color: '#58a6ff',          // #22c55e para Nidos
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  }}>
    FILTROS DE CLIMA           {/* o FILTROS DE NIDOS */}
  </div>
  <div style={{
    font: "400 10px/1.3 'Exo 2', sans-serif",
    color: 'var(--text-secondary)',
    marginTop: 2,
    opacity: 0.6,
  }}>
    Condición · Región · Tipo · Orden   {/* o Tipo Pokémon · Orden para Nidos */}
  </div>
</div>

{/* Lado derecho del header */}
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  {/* Badge de filtros activos en este grupo — ver sección 2b */}
  {activeCount > 0 && (
    <div style={{
      minWidth: 16, height: 16, padding: '0 4px',
      borderRadius: 8,
      background: 'rgba(88,166,255,0.2)',    // rgba(34,197,94,0.2) para Nidos
      font: "700 9px/16px 'Exo 2', sans-serif",
      color: '#58a6ff',                       // #22c55e para Nidos
      textAlign: 'center',
    }}>
      {activeCount}
    </div>
  )}
  {/* Chevron */}
  <span style={{
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(88,166,255,0.85)',           // rgba(34,197,94,0.85) para Nidos
  }}>
    {isOpen ? '▾' : '▸'}
  </span>
</div>
```

**`activeCount` para Clima** = suma de:
- `filterCondicion.length > 0 ? 1 : 0`
- `filterRegion !== 'todas' ? 1 : 0`
- `filterTipoClima !== 'todos' ? 1 : 0`
- `filterOrden !== 'sin_orden' ? 1 : 0`

**`activeCount` para Nidos** = suma de:
- `filterTipoPoke.length > 0 ? 1 : 0`
- `filterOrdenNidos !== 'sin_orden' ? 1 : 0`

El badge solo se renderiza cuando `activeCount > 0`.

---

### 3. Colapso por grupo con animación

**Qué hace:** Al hacer click en el header de un grupo, todos los acordeones de ese grupo se colapsan o expanden juntos. La transición es animada con `max-height`. Por defecto ambos grupos están abiertos.

**Estado necesario** (añadir al store o state local del componente):
```js
climaGroupOpen: true,
nidosGroupOpen: true,
```

**Implementación del colapso animado:**

NO uses `display: none` / `display: block` — no anima. Usa `maxHeight` con transición:

```jsx
{/* Contenido colapsable del grupo CLIMA */}
<div style={{
  overflow: 'hidden',
  maxHeight: climaGroupOpen ? '2000px' : '0',
  transition: 'max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
}}>
  {/* Aquí van todos los acordeones de Clima: Condición, Región, Tipo Clima, Ordenar */}
</div>
```

```jsx
{/* Contenido colapsable del grupo NIDOS */}
<div style={{
  overflow: 'hidden',
  maxHeight: nidosGroupOpen ? '2000px' : '0',
  transition: 'max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
}}>
  {/* Aquí van todos los acordeones de Nidos: Tipo Pokémon, Ordenar */}
</div>
```

El valor `2000px` como máximo es suficiente para cualquier contenido — es un truco conocido para animar max-height cuando no conoces la altura exacta. El easing `cubic-bezier(0.16, 1, 0.3, 1)` da una curva que acelera rápido y desacelera suave (spring-like).

**Handlers:**
```js
toggleClimaGroup: () => setState(prev => ({ climaGroupOpen: !prev.climaGroupOpen })),
toggleNidosGroup: () => setState(prev => ({ nidosGroupOpen: !prev.nidosGroupOpen })),
```

---

### 4. Estructura completa del panel después de los cambios

La estructura del cuerpo scrollable del panel queda así (pseudocódigo):

```
<div overflow-y:auto>                         ← scroll container del panel

  {climaLayerActive && (
    <div borderLeft="3px solid #58a6ff">      ← wrapper grupo CLIMA

      <div position:sticky top:0>             ← header sticky CLIMA (clickable)
        "FILTROS DE CLIMA"
        badge activos
        chevron ▾/▸
      </div>

      <div maxHeight={climaGroupOpen ? '2000px' : '0'} transition>   ← colapsable
        <AccordionSection title="Condición" ... />
        <AccordionSection title="Región" ... />
        <AccordionSection title="Tipo clima" ... />
        <AccordionSection title="Ordenar" ... />
      </div>

    </div>
  )}

  {nidosLayerActive && (
    <div borderLeft="3px solid #22c55e">      ← wrapper grupo NIDOS

      <div position:sticky top:0>             ← header sticky NIDOS (clickable)
        "FILTROS DE NIDOS"
        badge activos
        chevron ▾/▸
      </div>

      <div maxHeight={nidosGroupOpen ? '2000px' : '0'} transition>   ← colapsable
        <AccordionSection title="Tipo Pokémon" ... />
        <AccordionSection title="Ordenar" ... />
      </div>

    </div>
  )}

  {!climaLayerActive && !nidosLayerActive && (
    <EmptyState />
  )}

</div>
```

**IMPORTANTE sobre `position: sticky`:** El sticky header funciona porque el scroll container tiene `overflow-y: auto`. Si el wrapper de grupo (`borderLeft div`) tiene `overflow: hidden`, el sticky deja de funcionar — pon `overflow: hidden` solo en el div del contenido colapsable (el de `max-height`), nunca en el wrapper de grupo.

---

### 5. Toast al limpiar filtros

**Qué hace:** Cuando el usuario hace click en "✕ Limpiar todos los filtros" (footer del panel), aparece brevemente un toast en la parte inferior del panel confirmando la acción. Desaparece automáticamente a los 2.2 segundos.

**Estado necesario:**
```js
showClearToast: false,
```

**Handler `clearAll` actualizado:**
```js
const clearAll = () => {
  // Reset todos los filtros a su valor por defecto
  setFilters({
    filterCondicion: [],
    filterRegion: 'todas',
    filterTipoClima: 'todos',
    filterOrden: 'sin_orden',
    filterTipoPoke: [],
    filterOrdenNidos: 'sin_orden',
  });
  // Mostrar toast
  setShowClearToast(true);
  setTimeout(() => setShowClearToast(false), 2200);
};
```

**Posicionamiento del toast:** El panel filter (el div `position:absolute;inset:0`) debe tener `position: relative` (ya lo tiene si usa position absolute interno). El toast va dentro de ese mismo div, posicionado `absolute`:

```jsx
{showClearToast && (
  <div style={{
    position: 'absolute',
    bottom: 72,                    // justo encima del footer (~72px de alto)
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(30, 34, 42, 0.97)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    zIndex: 10,
  }}>
    <span style={{ fontSize: 13 }}>🗑</span>
    <span style={{
      font: "500 12px/1 'Exo 2', sans-serif",
      color: 'var(--text-secondary)',
    }}>
      Filtros eliminados
    </span>
  </div>
)}
```

No hay animación de entrada/salida en el toast — aparece y desaparece directamente. Si quieres añadir `opacity` transition es opcional y no está en el diseño.

---

## Resumen de nuevos valores de estado

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `climaGroupOpen` | `boolean` | `true` | Grupo Clima expandido |
| `nidosGroupOpen` | `boolean` | `true` | Grupo Nidos expandido |
| `showClearToast` | `boolean` | `false` | Toast de confirmación visible |

Estas pueden vivir en state local del componente `FilterPanel` — no necesitan Zustand global salvo que los uses en otro lugar.

---

## Checklist de implementación

- [ ] Wrapper `div` con `borderLeft: '3px solid #58a6ff'` envuelve todo el grupo Clima
- [ ] Wrapper `div` con `borderLeft: '3px solid #22c55e'` envuelve todo el grupo Nidos
- [ ] Header de cada grupo tiene `position: sticky; top: 0; zIndex: 2`
- [ ] Header tiene `backdropFilter: 'blur(8px)'` y `boxShadow: '0 2px 10px rgba(0,0,0,0.5)'`
- [ ] Header tiene `background: 'var(--bg-secondary)'` (sólido, no transparente)
- [ ] Click en header llama a `toggleClimaGroup` / `toggleNidosGroup`
- [ ] Chevron muestra `▾` cuando abierto, `▸` cuando cerrado, `fontSize: 14, fontWeight: 600, opacity: 0.85`
- [ ] Badge en header muestra count de filtros activos del grupo (solo cuando > 0)
- [ ] Contenido colapsable usa `maxHeight` + `transition`, NO `display:none`
- [ ] El div con `overflow: hidden` está en el contenido colapsable, NO en el wrapper del grupo
- [ ] `clearAll` llama `setShowClearToast(true)` + `setTimeout` a 2200ms
- [ ] Toast aparece `position:absolute; bottom:72px; left:50%; transform:translateX(-50%)`
- [ ] Toast tiene `zIndex: 10` para estar sobre el contenido del panel

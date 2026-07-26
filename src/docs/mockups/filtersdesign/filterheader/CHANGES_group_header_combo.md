# Handoff: Group Header Rediseño — FilterPanel (Clima / Nidos)
**Tipo de cambio:** Mejora de UX + Visual — Percepción de jerarquía  
**Clasificación:** Enhancement (no es un bug, no es un feature nuevo — es una mejora de usabilidad sobre un componente ya existente)  
**Impacto:** Solo el componente `FilterPanel` / `FilterPanelClima` / `FilterPanelNests` o equivalente en tu codebase. Nada más cambia.  
**Archivo de referencia interactivo:** `Filter Panel 4a.dc.html` (prototipo final con todos los cambios anteriores)  
**Archivo de referencia de este cambio:** `Filter Group Headers.dc.html` — columna "✦ Combinación 2+3+4" (la última a la derecha)  
**Componente a modificar:** Busca en tu codebase el componente del filter panel — probablemente en `components/sidebar/FilterPanel/FilterPanel.jsx` o en `src/components/FilterPanel.jsx`. Es el componente que renderiza el panel deslizable con los acordeones. En el DS de PokéWeather, los componentes relevantes son `FilterPanel`, `FilterPanelClima` y `FilterPanelNests` bajo `components/sidebar/`.

---

## Problema que resuelve

El usuario no lograba separar mentalmente los filtros de **Clima** de los de **Nidos** dentro del panel. El header de cada grupo usaba el mismo ícono `▾/▸` que los acordeones internos (Condición, Región, etc.), haciendo que todo pareciera un mismo nivel jerárquico. No había señal visual clara de que "FILTROS DE CLIMA" y "FILTROS DE NIDOS" son contenedores de nivel superior.

---

## Qué cambia exactamente

El group header de cada sección (el div clickeable que dice "FILTROS DE CLIMA" / "FILTROS DE NIDOS") tiene tres cambios combinados:

### Cambio A — Ícono `+/−` en caja (reemplaza `▾/▸`)
- El chevron `▾/▸` se elimina completamente.
- Se reemplaza por un cuadro de 22×22px con borde que muestra `−` cuando expandido y `+` cuando colapsado.
- Este ícono es universalmente reconocible como "expandir/colapsar un contenedor", a diferencia de `▾/▸` que se asocia a "navegar" o "seleccionar".
- El cuadro tiene su propio fondo y borde levemente tintados en el color del grupo, diferenciándolo visualmente de las flechas simples de los sub-items.

### Cambio B — Header compacto cuando está colapsado
- Cuando el grupo está **expandido**: el header tiene `padding: 10px 14px 9px 11px` y muestra el subtítulo ("Condición · Región · Tipo · Orden").
- Cuando el grupo está **colapsado**: el header hace transición a `padding: 6px 14px 6px 11px` y el subtítulo se desvanece (`max-height: 0, opacity: 0`).
- El cambio de densidad del header es una señal adicional del estado: compacto = cerrado, full = abierto.

### Cambio C — Pill de resumen cuando está colapsado
- Cuando el grupo está colapsado, debajo del título principal aparece un pill que muestra:
  - **Clima:** resumen de filtros activos, por ejemplo `"☀️ Soleado · 🌐 Europa"`. Si no hay filtros activos: no mostrar pill (o mostrar texto neutro — ver nota de implementación abajo).
  - **Nidos:** si no hay filtros activos: `"Ver filtros de nidos"`.
- Este pill hace que el header colapsado contenga información útil — el usuario sabe qué tiene seleccionado sin abrir el grupo.
- El pill aparece con `max-height` transition igual que el subtítulo pero inverso: `max-height: 28px` cuando colapsado, `max-height: 0` cuando expandido.

---

## Implementación exacta

### 1. Estado nuevo requerido

Añade estos dos booleans al estado local del componente `FilterPanel` (o al store Zustand si ya manejas el estado del panel ahí):

```js
climaGroupOpen: true,   // grupo Clima expandido por defecto
nidosGroupOpen: true,   // grupo Nidos expandido por defecto
```

No necesitas otros estados nuevos. Los valores derivados (padding, max-height, opacity, ícono, pill) se calculan en render desde estos dos booleans.

---

### 2. Valores derivados por grupo

Calcula estos valores en render (o en un `useMemo`/`renderVals`) desde `climaGroupOpen` y `nidosGroupOpen`:

```js
// CLIMA
const climaGroupPad    = climaGroupOpen ? '10px 14px 9px 11px' : '6px 14px 6px 11px';
const climaSubtitleH   = climaGroupOpen ? '20px' : '0px';
const climaSubtitleOp  = climaGroupOpen ? 1 : 0;   // el texto interior ya tiene opacity:0.6 fijo
const climaPillH       = climaGroupOpen ? '0px' : '28px';
const climaIcon        = climaGroupOpen ? '−' : '+';
const climaContentH    = climaGroupOpen ? '2000px' : '0px';  // para el max-height del contenido

// NIDOS
const nidosGroupPad    = nidosGroupOpen ? '10px 14px 9px 11px' : '6px 14px 6px 11px';
const nidosSubtitleH   = nidosGroupOpen ? '20px' : '0px';
const nidosSubtitleOp  = nidosGroupOpen ? 1 : 0;   // el texto interior ya tiene opacity:0.6 fijo
const nidosPillH       = nidosGroupOpen ? '0px' : '28px';
const nidosIcon        = nidosGroupOpen ? '−' : '+';
const nidosContentH    = nidosGroupOpen ? '2000px' : '0px';
```

El valor `2000px` para `contentH` es intencional — es el truco estándar para animar `max-height` cuando no conoces la altura exacta. Es suficientemente grande para cualquier contenido del panel.

---

### 3. Estructura JSX del group header — CLIMA

Reemplaza el actual group header de CLIMA con esta estructura completa:

```jsx
{/* WRAPPER DEL GRUPO — border-left corre por TODA la sección, incluyendo header y contenido */}
<div style={{ borderLeft: '3px solid #58a6ff' }}>

  {/* GROUP HEADER — sticky, clickeable, cambia de tamaño */}
  <div
    onClick={() => setClimaGroupOpen(prev => !prev)}
    style={{
      cursor: 'pointer',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid rgba(88, 166, 255, 0.2)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      // Transición de padding: se comprime al colapsar
      padding: climaGroupPad,
      transition: 'padding 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      // CRÍTICO: NO poner position:sticky aquí si el wrapper tiene overflow:hidden
      // Si necesitas sticky, ponlo aquí y asegúrate que el wrapper NO tiene overflow:hidden
      position: 'sticky',
      top: 0,
      zIndex: 2,
    }}
  >
    {/* LADO IZQUIERDO: título + subtítulo + pill */}
    <div style={{ flex: 1, minWidth: 0 }}>

      {/* Título — siempre visible */}
      <div style={{
        font: "700 11px/1 'Rajdhani', sans-serif",
        color: '#58a6ff',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
      }}>
        FILTROS DE CLIMA
      </div>

      {/* Subtítulo — visible cuando expandido, se desvanece al colapsar */}
      <div style={{
        overflow: 'hidden',
        maxHeight: climaSubtitleH,          // '20px' → '0px'
        opacity: climaSubtitleOp,           // 1 → 0 (el div interior ya tiene opacity:0.6)
        transition: 'max-height 0.25s ease, opacity 0.25s ease',
      }}>
        <div style={{
          font: "400 10px/1.3 'Exo 2', sans-serif",
          color: 'var(--text-secondary)',
          marginTop: 2,
          opacity: 0.6,   // opacidad final del texto: 1 * 0.6 = 0.6 cuando visible
        }}>
          Condición · Región · Tipo · Orden
        </div>
      </div>

      {/* Pill de resumen — visible cuando colapsado, oculto cuando expandido */}
      <div style={{
        overflow: 'hidden',
        maxHeight: climaPillH,              // '0px' → '28px'
        transition: 'max-height 0.25s ease',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          marginTop: 4,
          padding: '3px 8px',
          borderRadius: 10,
          background: 'rgba(88, 166, 255, 0.12)',
          border: '1px solid rgba(88, 166, 255, 0.25)',
        }}>
          <span style={{
            font: "500 10px/1 'Exo 2', sans-serif",
            color: '#58a6ff',
          }}>
            {climaSummaryText}
            {/* Ver nota "Pill summary text" más abajo */}
          </span>
        </div>
      </div>

    </div>

    {/* LADO DERECHO: badge de activos + caja +/− */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

      {/* Badge de filtros activos — solo cuando hay filtros seleccionados */}
      {climaActiveCount > 0 && (
        <div style={{
          minWidth: 16,
          height: 16,
          padding: '0 4px',
          borderRadius: 8,
          background: 'rgba(88, 166, 255, 0.2)',
          font: "700 9px/16px 'Exo 2', sans-serif",
          color: '#58a6ff',
          textAlign: 'center',
        }}>
          {climaActiveCount}
        </div>
      )}

      {/* CAJA +/− — el ícono diferenciador */}
      <div style={{
        width: 22,
        height: 22,
        borderRadius: 5,
        border: '1.5px solid rgba(88, 166, 255, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: 'rgba(88, 166, 255, 0.06)',
      }}>
        <span style={{
          font: "700 16px/1 'Exo 2', sans-serif",
          color: '#58a6ff',
          lineHeight: 1,
          marginTop: -1,  // ajuste óptico para centrar el − y el +
        }}>
          {climaIcon}  {/* '−' cuando open, '+' cuando closed */}
        </span>
      </div>

    </div>
  </div>

  {/* CONTENIDO COLAPSABLE — max-height animado, overflow:hidden SOLO aquí */}
  <div style={{
    overflow: 'hidden',
    maxHeight: climaContentH,              // '2000px' → '0px'
    transition: 'max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
  }}>
    {/* Aquí van los acordeones internos: Condición, Región, Tipo Clima, Ordenar */}
    {/* Estos NO cambian — son exactamente los mismos que tienes ahora */}
    <CondicionSection />
    <RegionSection />
    <TipoClimaSection />
    <OrdenarClimaSection />
  </div>

</div>
```

---

### 4. Estructura JSX del group header — NIDOS

Idéntica a CLIMA, cambiando solo los colores y textos:

```jsx
<div style={{ borderLeft: '3px solid #22c55e' }}>

  <div
    onClick={() => setNidosGroupOpen(prev => !prev)}
    style={{
      cursor: 'pointer',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      padding: nidosGroupPad,
      transition: 'padding 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      position: 'sticky',
      top: 0,
      zIndex: 2,
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>

      <div style={{
        font: "700 11px/1 'Rajdhani', sans-serif",
        color: '#22c55e',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
      }}>
        FILTROS DE NIDOS
      </div>

      <div style={{
        overflow: 'hidden',
        maxHeight: nidosSubtitleH,
        opacity: nidosSubtitleOp,
        transition: 'max-height 0.25s ease, opacity 0.25s ease',
      }}>
        <div style={{
          font: "400 10px/1.3 'Exo 2', sans-serif",
          color: 'var(--text-secondary)',
          marginTop: 2,
          opacity: 0.6,
        }}>
          Tipo Pokémon · Orden
        </div>
      </div>

      <div style={{
        overflow: 'hidden',
        maxHeight: nidosPillH,
        transition: 'max-height 0.25s ease',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          marginTop: 4,
          padding: '3px 8px',
          borderRadius: 10,
          background: 'rgba(34, 197, 94, 0.10)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
        }}>
          <span style={{
            font: "500 10px/1 'Exo 2', sans-serif",
            color: '#22c55e',
          }}>
            {nidosSummaryText}
          </span>
        </div>
      </div>

    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

      {nidosActiveCount > 0 && (
        <div style={{
          minWidth: 16,
          height: 16,
          padding: '0 4px',
          borderRadius: 8,
          background: 'rgba(34, 197, 94, 0.2)',
          font: "700 9px/16px 'Exo 2', sans-serif",
          color: '#22c55e',
          textAlign: 'center',
        }}>
          {nidosActiveCount}
        </div>
      )}

      <div style={{
        width: 22,
        height: 22,
        borderRadius: 5,
        border: '1.5px solid rgba(34, 197, 94, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: 'rgba(34, 197, 94, 0.06)',
      }}>
        <span style={{
          font: "700 16px/1 'Exo 2', sans-serif",
          color: '#22c55e',
          lineHeight: 1,
          marginTop: -1,
        }}>
          {nidosIcon}
        </span>
      </div>

    </div>
  </div>

  <div style={{
    overflow: 'hidden',
    maxHeight: nidosContentH,
    transition: 'max-height 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
  }}>
    <TipoPokeSection />
    <OrdenarNidosSection />
  </div>

</div>
```

---

### 5. Pill summary text — lógica

El texto del pill se construye dinámicamente desde los filtros activos. Implementa esta función:

```js
// Para CLIMA
function buildClimaSummary(filterCondicion, filterRegion, filterOrden) {
  const parts = [];

  // Condición: muestra los emojis de las condiciones seleccionadas
  const COND_EMOJI = {
    sunny: '☀️', partly: '⛅', cloudy: '☁️',
    fog: '🌫', rain: '🌧', snow: '❄️', windy: '💨'
  };
  if (filterCondicion.length > 0) {
    parts.push(filterCondicion.map(v => COND_EMOJI[v] || v).join(''));
  }

  // Región: muestra el nombre si no es "todas"
  const REGION_LABEL = {
    asia: '🌏 Asia', eu: '🌍 Europa', am: '🌎 América',
    oc: '🌏 Oceanía', af: '🌍 África'
  };
  if (filterRegion !== 'todas' && REGION_LABEL[filterRegion]) {
    parts.push(REGION_LABEL[filterRegion]);
  }

  // Orden: muestra si no es sin_orden
  const ORDEN_LABEL = {
    nombre: 'A–Z', densidad: 'Densidad', raid: 'Raid', hora: 'Hora'
  };
  if (filterOrden !== 'sin_orden' && ORDEN_LABEL[filterOrden]) {
    parts.push(ORDEN_LABEL[filterOrden]);
  }

  // Si no hay nada activo, no mostrar pill (el pill está oculto de todas formas cuando expandido)
  // Cuando colapsado sin filtros: mostrar texto neutro
  // Cuando no hay filtros activos y el grupo está colapsado, texto neutro
  return parts.length > 0 ? parts.join(' · ') : 'Ver filtros de clima';
}

// Para NIDOS
function buildNidosSummary(filterTipoPoke, filterOrdenNidos) {
  const parts = [];

  const TYPE_EMOJI = {
    fire: '🔥', water: '💧', grass: '🌿', electric: '⚡',
    ice: '❄️', dragon: '🐉', psychic: '🔮', dark: '🌑',
    ghost: '👻', ground: '🏜', normal: '⭐', fairy: '✨'
  };

  if (filterTipoPoke.length > 0) {
    // Muestra hasta 3 emojis de tipo
    const emojis = filterTipoPoke.slice(0, 3).map(v => TYPE_EMOJI[v] || v).join('');
    parts.push(emojis + (filterTipoPoke.length > 3 ? ` +${filterTipoPoke.length - 3}` : ''));
  }

  const ORDEN_NIDOS_LABEL = { nombre: 'A–Z', nidos: 'Más nidos', hora: 'Hora' };
  if (filterOrdenNidos !== 'sin_orden' && ORDEN_NIDOS_LABEL[filterOrdenNidos]) {
    parts.push(ORDEN_NIDOS_LABEL[filterOrdenNidos]);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Ver filtros de nidos';
}
```

Úsalas así:

```js
const climaSummaryText  = buildClimaSummary(filterCondicion, filterRegion, filterOrden);
const nidosSummaryText  = buildNidosSummary(filterTipoPoke, filterOrdenNidos);
```

---

### 6. `climaActiveCount` y `nidosActiveCount`

Estos ya los tenías (se usan en el badge del header del panel y en los tabs). Si ya los calculas, reutiliza el mismo valor:

```js
const climaActiveCount = 
  (filterCondicion.length > 0 ? 1 : 0) +
  (filterRegion !== 'todas' ? 1 : 0) +
  (filterTipoClima !== 'todos' ? 1 : 0) +
  (filterOrden !== 'sin_orden' ? 1 : 0);

const nidosActiveCount =
  (filterTipoPoke.length > 0 ? 1 : 0) +
  (filterOrdenNidos !== 'sin_orden' ? 1 : 0);
```

---

## ADVERTENCIA CRÍTICA: `position: sticky` + `overflow: hidden`

El sticky header del grupo **DEJA DE FUNCIONAR** si cualquier ancestro en el DOM tiene `overflow: hidden`. Esto es un bug muy común y silencioso.

**Regla:**
- El `overflow: hidden` SOLO va en el `div` del contenido colapsable (el que tiene `maxHeight`).
- El wrapper del grupo (`borderLeft div`) **NO** puede tener `overflow: hidden`.
- El scroll container del panel (el `div` con `overflow-y: auto` o `overflow-y: scroll`) debe ser el ancestro directo del grupo wrapper.

**Estructura de árbol correcta:**
```
<div style={{overflowY: 'auto'}}>           ← scroll container del panel
  <div style={{borderLeft: '3px solid #58a6ff'}}>    ← wrapper grupo CLIMA (sin overflow)
    <div style={{position: 'sticky', top: 0}}>        ← group header sticky ✓
    <div style={{overflow: 'hidden', maxHeight: ...}}> ← contenido colapsable
  <div style={{borderLeft: '3px solid #22c55e'}}>    ← wrapper grupo NIDOS (sin overflow)
    <div style={{position: 'sticky', top: 0}}>        ← group header sticky ✓
    <div style={{overflow: 'hidden', maxHeight: ...}}>
```

Si el sticky no funciona al implementar, busca el primer ancestro con `overflow: hidden` o `overflow: auto` entre el header y la raíz — ese es el problema.

---

## Qué NO cambia

- Los acordeones internos (Condición, Región, Tipo Clima, Ordenar, Tipo Pokémon, Ordenar Nidos) son exactamente iguales — sus headers, contenido, lógica de colapso y selección no se tocan.
- El panel header ("FILTROS" + botón volver + limpiar) no cambia.
- El footer (Aplicar / Cancelar / Limpiar todos) no cambia.
- El toast de confirmación al limpiar no cambia.
- La animación de slide-in/slide-out del panel no cambia.
- El estado de los filtros (filterCondicion, filterRegion, etc.) no cambia.
- El badge en los tabs del header (Clima / Nidos) no cambia.
- El badge en el botón "Filtros" de la sidebar no cambia.
- Los pills sobre el mapa no cambian.

---

## Plan de ejecución para Claude Code

Ejecuta exactamente en este orden:

1. **Localiza el componente.** Busca en tu codebase el componente que renderiza el panel de filtros deslizable — puede llamarse `FilterPanel`, `FilterPanelClima`, `FilterPanelNests`, `Sidebar`, o similar. Es el que contiene el div con `position: sticky` para los group headers y los acordeones internos.

2. **Añade estado.** En el estado local (useState) o en el store Zustand del componente, añade `climaGroupOpen: true` y `nidosGroupOpen: true`.

3. **Calcula valores derivados.** Añade los 12 valores derivados (`climaGroupPad`, `climaSubtitleH`, etc.) en el cuerpo del componente o en un useMemo.

4. **Añade funciones de summary.** Añade `buildClimaSummary` y `buildNidosSummary` como funciones puras en el mismo archivo o en un utils.

5. **Reemplaza el group header de CLIMA.** Busca el div clickeable que hoy dice "FILTROS DE CLIMA" con el chevron `▾/▸` y reemplaza completamente esa estructura con el JSX del bloque 3 de este documento.

6. **Reemplaza el group header de NIDOS.** Misma operación para "FILTROS DE NIDOS" con el JSX del bloque 4.

7. **Verifica el sticky.** Asegúrate de que ningún ancestro del group header wrapper tiene `overflow: hidden`. Si el sticky no sube al hacer scroll, ese es el problema — busca y elimina ese `overflow: hidden` del wrapper, y muévelo solo al div del contenido colapsable.

8. **Verifica en los 4 estados:**
   - Clima abierto + Nidos cerrado
   - Clima cerrado + Nidos abierto
   - Ambos abiertos (estado por defecto)
   - Ambos cerrados

9. **Verifica el pill.** Con filtros activos (selecciona ☀️ Soleado + 🌍 Europa en Clima), colapsa el grupo y confirma que el pill muestra "☀️ · 🌍 Europa". Sin filtros, debe mostrar "Sin filtros activos".

---

## Checklist final

- [ ] `climaGroupOpen` y `nidosGroupOpen` existen en estado, default `true`
- [ ] El wrapper del grupo tiene `borderLeft: '3px solid #58a6ff'` (Clima) / `'3px solid #22c55e'` (Nidos) — sin `overflow: hidden`
- [ ] El group header tiene `position: sticky`, `top: 0`, `zIndex: 2`
- [ ] El group header tiene `backdropFilter: 'blur(8px)'` y `boxShadow: '0 2px 10px rgba(0,0,0,0.4)'`
- [ ] El group header tiene `background: 'var(--bg-secondary)'` (sólido — cubre el contenido que pasa por detrás)
- [ ] El padding del group header hace transición: `10px 14px 9px 11px` ↔ `6px 14px 6px 11px` con `transition: padding 0.28s cubic-bezier(0.16,1,0.3,1)`
- [ ] El subtítulo tiene `maxHeight` + `opacity` transition: visible/opaco cuando abierto, `maxHeight:0` + `opacity:0` cuando cerrado
- [ ] El pill tiene `maxHeight` transition inverso: `maxHeight:0` cuando abierto, `maxHeight:28px` cuando cerrado
- [ ] El pill muestra texto dinámico desde `buildClimaSummary` / `buildNidosSummary`
- [ ] La caja `+/−` tiene `22×22px`, `borderRadius:5`, `border:1.5px solid rgba(color,0.5)`, `background:rgba(color,0.06)`
- [ ] El texto dentro de la caja es `font:700 16px/1`, `marginTop:-1px` para ajuste óptico
- [ ] El texto es `'−'` cuando abierto, `'+'` cuando cerrado
- [ ] El contenido colapsable tiene `overflow:hidden` + `maxHeight:2000px/0px` + `transition:max-height 0.28s cubic-bezier(0.16,1,0.3,1)`
- [ ] El `overflow:hidden` está SOLO en el div del contenido colapsable, NO en el wrapper del grupo
- [ ] Los acordeones internos no cambian

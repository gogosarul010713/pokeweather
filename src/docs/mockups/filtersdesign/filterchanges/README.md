# Filter Panel — Handoff para Claude Code

Estos son **3 cambios específicos + 1 comportamiento** a implementar en el panel de filtros existente (Clima / Nidos). El mockup interactivo está en `filter-panel-mockup.html`.

---

## Cambios a implementar

### B — Unificar color de badges al grupo

**Problema:** cada badge/pill individual usa su propio color (rojo, naranja, lila, etc.), lo que satura visualmente el panel.

**Solución:** eliminar el color propio de cada badge. Usar solo el color del grupo al que pertenece.

| Grupo | Color único a usar |
|---|---|
| Clima | `#58a6ff` |
| Nidos | `#22c55e` |

**Aplica a:**
- El badge de conteo en el header de cada grupo (ej. `2` activos)
- Los badges de conteo en cada sub-sección (Condición, Región, Tipo, Ordenar)

```
// Antes (cada badge con su color)
backgroundColor: typeColor  // naranja, rojo, lila...

// Después (color del grupo)
// En secciones de Clima:
backgroundColor: 'rgba(88, 166, 255, 0.18)'
color: '#58a6ff'

// En secciones de Nidos:
backgroundColor: 'rgba(34, 197, 94, 0.18)'
color: '#22c55e'
```

---

### C — Íconos de tipo más pequeños + grid 4 columnas

**Problema:** la cuadrícula de tipos (Pokémon / Clima) tiene íconos grandes (32px) en 3 columnas — demasiado espacio, muy saturado.

**Solución:**
- Íconos: `32px → 24px` (el emoji o imagen)
- Columnas: `3 → 4`
- Gap entre celdas: `8px → 5px`
- Padding interno de celda: reducir proporcionalmente

```
// Antes
gridTemplateColumns: 'repeat(3, 1fr)'
iconSize: 32px
gap: 8px

// Después
gridTemplateColumns: 'repeat(4, 1fr)'
iconSize: 24px  // font-size: 14px en emoji, width/height: 24px en imágenes
gap: 5px
cellPadding: '6px 2px'
```

**Afecta:** cualquier grid de selección de tipo dentro del panel de filtros.

---

### D — Íconos de tipo activos usan el color del grupo

**Problema:** al seleccionar un tipo (ej. Fire → naranja, Water → azul), el ícono activo muestra su color propio, generando un arcoíris que choca con la identidad del grupo.

**Solución:** cuando un tipo está **activo/seleccionado**, su estado visual usa el color del grupo, no el color del tipo.

```
// Estado inactivo (sin cambios)
background: var(--bg-tertiary)
border: 1.5px solid var(--border-default)
labelColor: var(--text-secondary)

// Estado activo — Clima (todos los tipos dentro de Filtros de Clima)
background: rgba(88, 166, 255, 0.15)
border: 1.5px solid #58a6ff
labelColor: #58a6ff

// Estado activo — Nidos (todos los tipos dentro de Filtros de Nidos)
background: rgba(34, 197, 94, 0.15)
border: 1.5px solid #22c55e
labelColor: #22c55e
```

**IMPORTANTE:** no cambiar el emoji/ícono gráfico en sí — solo el fondo, borde y texto del label.

---

### Comportamiento — Pill visible solo cuando el filtro está colapsado

**Problema:** cada sub-sección (Condición, Región, Tipo Pokémon, Ordenar, etc.) muestra un pill con fondo sólido al lado del título. Este pill es visible siempre, saturando la vista cuando la sección está expandida.

**Regla:**
- ✅ Sección **colapsada** → pill visible (muestra el valor activo)
- ❌ Sección **expandida** → pill oculto (el usuario ya ve las opciones)

**Implementación (animación):**

```
// Al expandir la sección — ocultar pill
pill.style.maxHeight = '0px'
pill.style.opacity = '0'

// Al colapsar la sección — mostrar pill
pill.style.maxHeight = '22px'
pill.style.opacity = '1'

// Transición recomendada
transition: max-height 0.22s ease, opacity 0.18s ease
```

**Qué muestra el pill (texto):**
| Sub-sección | Texto del pill |
|---|---|
| Condición | Valor seleccionado en mayúsculas (ej. `SOLEADO`) |
| Región | Valor seleccionado (ej. `EUROPA`) |
| Tipo Clima | Valor seleccionado (ej. `FIRE`) |
| Tipo Pokémon | `N SELEC.` si hay selección, `TODOS` si no |
| Ordenar | Valor seleccionado (ej. `NOMBRE`) |

**Estilo del pill:**

```
// Clima
background: #58a6ff          // sólido, no transparente
borderRadius: 10px
padding: '2px 7px'
font: 700 9px 'Exo 2'
color: #fff

// Nidos
background: #22c55e          // sólido, no transparente
```

---

## Archivo de referencia

Abrir `filter-panel-mockup.html` directamente en el navegador para ver todos los comportamientos en funcionamiento.

**Interacciones disponibles en el mockup:**
- Click en header de grupo → colapsa/expande grupo completo
- Click en fila de sub-sección → colapsa/expande; observar pill aparecer/desaparecer
- Click en celdas de tipo → selección activa/inactiva con color del grupo
- Botón `☀ Light` / `🌑 Dark` → toggle de tema

---

## Tokens de color de referencia

```
// Colores de grupo (inmutables)
--color-clima: #58a6ff
--color-nidos: #22c55e

// Estados activos
--active-bg-clima: rgba(88, 166, 255, 0.15)
--active-border-clima: #58a6ff
--active-bg-nidos: rgba(34, 197, 94, 0.15)
--active-border-nidos: #22c55e

// Badge activo
--badge-bg-clima: rgba(88, 166, 255, 0.18)
--badge-bg-nidos: rgba(34, 197, 94, 0.18)
```

---

## Notas para Claude Code

1. **No crear componentes nuevos** — estos son cambios de estilo + lógica sobre componentes existentes.
2. **Buscar por** `FilterGroup`, `FilterSection`, `TypeGrid`, `TypeBadge` o similares en el codebase.
3. El cambio B y D van juntos — cualquier lugar que hoy lee `type.color` o `typeColors[type]` para el estado activo debe reemplazarse por el color del grupo padre.
4. El cambio C es puramente CSS/estilos — `gridTemplateColumns` y `fontSize`/`width` del ícono.
5. El pill ya puede existir en el DOM — solo necesita la lógica de visibilidad condicionada al estado `isOpen` de la sección.

# Requerimientos: Feature Nidos de Pokémon — PokéWeather Explorer

> Basado en análisis UX (Sidebar con pestañas + capas simultáneas)  
> Arquitectura elegida: tabs en sidebar (Clima / Nidos / Todo) + leyenda acordeón

---

## Contexto

La app ya tiene funcional la capa de **Clima** con:
- Mapa con pines/círculos de ciudades
- Sidebar con listado de ciudades (clima + Pokémon potenciado)
- Filtros: Todas / Clima (dropdown) / Tipo (dropdown) / Ordenar por (dropdown)
- Leyenda de colores por tipo de clima

Se requiere agregar la capa de **Nidos** como una segunda capa independiente
que puede coexistir con Clima, más un modo combinado "Todo".

**Estado inicial al cargar la app:** tab `Clima` activo.

> **Decisión de arquitectura:** el control de capas del mapa vive exclusivamente
> en las tabs del sidebar. No existen toggles separados en el mapa.
> El tab activo determina qué capa se renderiza en el mapa y qué lista
> se muestra en el sidebar.

---

## 🔗 Mapeo Requerimientos → User Stories

Para implementar estos requerimientos, se han creado las siguientes US:

| Req ID | Título | US ID | Story Points | Sesión | Status |
|--------|--------|-------|--------------|--------|--------|
| US-01  | Tabs del sidebar como control | **US-811** | 3 SP | 1 | 📝 Pendiente |
| US-02  | Diferenciación visual de pines | **US-812** | 2 SP | 1 | 📝 Pendiente |
| US-03  | Tab Clima: sin cambios | **US-813** | 1 SP | - | 📝 (sin cambios) |
| US-04  | Filtros contextuales por tab | **US-814** | 3 SP | 2 | 📝 Pendiente |
| US-05  | Leyenda del mapa dinámica | **US-815** | 3 SP | 2 | 📝 Pendiente |
| US-06  | Leyenda modo Todo (acordeón) | **US-816** | 2 SP | 2 | 📝 Pendiente |
| US-07  | Modo Todo: overlay sidebar | **US-817** | 2 SP | 1 | 📝 Pendiente |
| US-08  | Listado Nidos en sidebar | **US-818** | 3 SP | 2 | 📝 Pendiente |
| US-09  | Datos de Nidos (JSON) | **US-819** | 1 SP | 1 | 📝 Pendiente |

**Totales:**
- **Sesión 1 (crítica):** US-811, US-812, US-817, US-819 (9 SP)
- **Sesión 2:** US-814, US-815, US-816, US-818 (11 SP)
- **Total:** 20 SP (2 sesiones planificadas)

**Documentación detallada:** Consultar archivos individuales `src/docs/sprints/sprint-9/US/US-81X.md`

---

## US-01 — Tabs del sidebar como control de capas

**Como** usuario, **quiero** seleccionar entre Clima, Nidos o Todo desde
el sidebar **para** controlar qué se muestra tanto en la lista como en el mapa,
desde un único punto de control.

### Criterios de aceptación

NOTA. ver @desing.md para confirmar coincide con el diseno actual de la pagina, si no coincide, dar prioridad al diseno en @desing.md y ajustar.
- [ ] El sidebar muestra tres tabs: `[Clima]` `[Nidos]` `[Todo]`
- [ ] Siempre hay exactamente un tab activo — no es posible dejar ninguno sin seleccionar
- [ ] **Tab Clima:** muestra lista de ciudades + renderiza pines de Clima en el mapa
- [ ] **Tab Nidos:** muestra lista de nidos + renderiza pines de Nidos en el mapa
- [ ] **Tab Todo:** muestra sidebar y filtros bloqueados + renderiza ambas capas
  simultáneamente en el mapa (ver US-07)
- [ ] Cambiar entre tabs es la **única** forma de cambiar qué capas se ven en el mapa
- [ ] **Diseño de tabs:** contenedor `flex row`, ancho completo del sidebar, padding horizontal 8px, padding vertical 6px.  gap 4px, border-bottom 0.5px.  NOTA. ver @desing.md para confirmar coincide con el diseno actual de la pagina, si no coincide, dar prioridad al diseno en @desing.md
- [ ] **Tab activo:** pill con border-radius ~99px, fondo superficie elevada clara,
  texto color primario font-weight 500, ícono izquierda 14px
  (☁️ Clima · Pokéball Nidos · ✦ Todo)
- [ ] **Tab inactivo:** fondo transparente, texto color muted, font-weight 400,
  ícono muted — sin borde visible en ningún estado
- [ ] Debajo de los tabs aparece un contador contextual:
  `Ciudades · N` (Clima) / `Nidos · N` (Nidos) / `Ciudades  N Y Nidos · N` en Todo

---

## US-02 — Diferenciación visual de pines en el mapa

**Como** usuario, **quiero** distinguir visualmente los pines de Clima y los pines
de Nidos sin necesidad de leer la leyenda **para** no confundirme cuando
ambas capas están activas (modo Todo).

### Criterios de aceptación

- [ ] Pines de **Clima**: forma círculo (sin cambios respecto al estado actual)
- [ ] Pines de **Nidos**: forma hexágono con variante de color por tipo de Pokémon
- [ ] La diferenciación es por **forma + color**: no depende solo del color
- [ ] Los pines de ambas capas son distinguibles sin leer la leyenda

---

## US-03 — Tab Clima: sin cambios

**Como** usuario, **quiero** que el tab Clima funcione exactamente igual
que la app actual **para** no perder funcionalidad existente.

### Criterios de aceptación

- [ ] **Tab Clima:** sin cambios respecto a la funcionalidad actual en lista,
  filtros y pines del mapa

---

## US-04 — Filtros contextuales por tab

**Como** usuario, **quiero** que la barra de filtros cambie según el tab activo
**para** ver solo los filtros relevantes.

### Criterios de aceptación

**Cuando tab Clima está activo:**
- [ ] Botón: `Todas`
- [ ] Dropdown: `Clima` (soleado, lluvia, viento, etc.)
- [ ] Dropdown: `Tipo` (tipo de Pokémon potenciado)
- [ ] Dropdown: `Ordenar por` → Temperatura, Pokémon potenciado

**Cuando tab Nidos está activo:**
- [ ] Botón: `Todos`
- [ ] Dropdown: `Tipo` (tipo de Pokémon del nido)
- [ ] Dropdown: `Ordenar por` → Tipo de Pokémon · Hora Local · % Spawn (si disponible)

**Reglas generales:**
- [ ] La barra de filtros se **reemplaza completamente** al cambiar de tab
- [ ] Los filtros operan solo sobre la lista del sidebar, no sobre los pines del mapa.
- [ ] Cuando `Todo` está activo, la barra de filtros se bloquea (ver US-07)

---

## US-05 — Leyenda del mapa

**Como** usuario, **quiero** que la leyenda del mapa refleje siempre
la capa activa del tab **para** interpretar los pines correctamente.

### Criterios de aceptación

- [ ] La leyenda es siempre visible en el mapa y refleja el tab activo
- [ ] **Tab Clima:** leyenda actual sin cambios
- [ ] **Tab Nidos:**
  - Header con switch: _"Iconos en pines"_
  - Dos tabs internos: `Tipos` y `Clasificación`
  - **Tab Tipos:** grid de 2 columnas con los 18 tipos de Pokémon
    (ícono hexagonal + nombre corto), scrolleable verticalmente (~9 visibles),
    campo de búsqueda en la parte superior
  - **Tab Clasificación:** ✅ Verificado · ⭐ Mayor Spawn · ✨ Mayor Polvo Estelar
- [ ] **Tab Todo:** leyenda en acordeón con sección **Clima** y sección **Nidos**,
  cada una colapsable de forma independiente (ver US-06)
- [ ] La leyenda completa es colapsable para liberar espacio en el mapa

---

## US-06 — Leyenda en modo Todo

**Como** usuario, **quiero** que en modo Todo la leyenda muestre ambas secciones
de forma organizada **para** no saturar el mapa.

### Criterios de aceptación

- [ ] La leyenda tiene dos secciones acordeón: **Clima** y **Nidos**
- [ ] Cada sección se expande/colapsa de forma independiente
- [ ] **Sección Clima:** sin cambios respecto a la leyenda actual
- [ ] **Sección Nidos:** misma estructura definida en US-05
- [ ] La leyenda completa es colapsable en su totalidad

---

## US-07 — Modo Todo: comportamiento de sidebar y filtros

**Como** usuario, **quiero** que al activar el tab Todo se me comunique
claramente que sidebar y filtros no están disponibles en ese modo
**para** no confundirme al intentar interactuar con ellos.

### Criterios de aceptación

- [ ] Al activar `Todo` se muestra un **toast informativo:**
  _"Mostrando Clima y Nidos simultáneamente en el mapa"_
- [ ] El sidebar muestra un **overlay de opacidad ~40%** — el contenido
  se intuye pero no es interactuable. No se elimina del DOM.
- [ ] Sobre el overlay aparece un **texto centrado:**
  🔒 _"Activa Clima o Nidos para explorar la lista y filtros"_
- [ ] El cursor cambia a `not-allowed` al intentar interactuar con el área bloqueada
- [ ] La barra de filtros recibe el mismo tratamiento: overlay + cursor bloqueado
- [ ] Al cambiar a `Clima` o `Nidos`: sidebar y filtros se reactivan inmediatamente

---

## US-08 — Sidebar: listado de Nidos
NOTA. ver @desing.md para confirmar coincide con el diseno actual de la pagina, si no coincide, dar prioridad al diseno en @desing.md y ajustar.
**Como** usuario, **quiero** que el tab Nidos muestre el listado de todos
los nidos disponibles **para** explorarlos en lista.

### Criterios de aceptación

- [ ] Cada elemento reutiliza la estructura de tarjeta de Clima como base visual
  (mismo contenedor, border-radius ~10px, alto fijo ~64px)
- [ ] **Layout:** `flex row`, 3 columnas, alineación vertical centrada,
  padding horizontal 12px, padding vertical 10px
- [ ] **Columna izquierda:** sprite del Pokémon 44×44px, fondo transparente,
  sin border-radius
- [ ] **Columna central (`flex: 1`):**
  - Línea 1: nombre del lugar — 14px, font-weight 600, color primario
  - Línea 2: ciudad — 12px, color secundario gris
  - Línea 3: país — 12px, color secundario gris
  - Línea 4: badge **Verified** — ícono checkmark en círculo azul + texto, 11px
- [ ] **Columna derecha (`align-items: flex-end`):**
  - Línea 1: pills de tipo con íconos hexagonales del Pokémon
  - Línea 2: hora local del parque — 11px, color terciario gris claro
- [ ] Borde de la tarjeta: color del tipo principal del Pokémon, 0.5px solid

---

## US-09 — Datos de Nidos

**Como** sistema, **necesito** una fuente de datos de nidos **para**
renderizarlos en el mapa y listarlos en el sidebar.

### Criterios de aceptación

- [ ] Estructura de dato de un nido:
```js
  {
    id: string,
    name: string,          // nombre del parque/zona
    city: string,
    country: string,
    lat: number,
    lng: number,
    pokemon: string,
    pokemonType: string[], // ["Agua"], ["Fuego", "Vuelo"]
    spawnRate: number,     // opcional, porcentaje
    lastReported: string   // opcional, ISO date
  }
```
- [ ] Archivo de datos estáticos en `src/data/pokedensity-nests.js`
- [ ] Los datos de nidos son independientes de los datos de clima

---

## Resumen de cambios por archivo

| Área | Cambio |
|------|--------|
| `MapComponent` | Renderizado condicional por tab activo. Pines hexagonales para nidos |
| `MapToggles` | **Eliminado** — el control de capas pasa a las tabs del sidebar |
| `Sidebar` | Tres tabs: Clima / Nidos / Todo. Overlay en modo Todo |
| `FilterBar` | Filtros dinámicos por tab. Overlay + cursor bloqueado en modo Todo |
| `Legend` | Refleja tab activo. Leyenda nidos: grid 2 col + buscador + tabs internos |
| `pokedensity-nests.js` | Datos estáticos de nidos |
| `store` / `state` | `activeTab: 'clima' \| 'nidos' \| 'todo'` — fuente única de verdad |

---

## Notas de implementación

- `activeTab` es la **única fuente de verdad** para qué capas se renderizan en el mapa
- En modo `Todo`, sidebar y filtros se bloquean con feedback visual explícito;
  la leyenda pasa a modo acordeón automáticamente
- Al salir de `Todo`, restaurar el último tab activo antes de entrar en él
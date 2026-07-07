# Decisiones Arquitectónicas — Sprint 9

**Sprint:** 9  
**Período:** 2026-04-13 → 2026-04-26  
**Status:** 🎯 PLANEADO (se llenan durante sprint)

---

## Decisiones Pendientes

### D1: Code-Splitting Strategy (US-901)

**Opciones:**
- **A:** Vite micro-frontends (complex, not needed)
- **B:** Rollup dynamic imports (simple, effective)

**Status:** ⏳ PENDIENTE (spike técnico en Sesión 0)

**Análisis:**
- Vite defaults ya soportan dynamic imports
- Rollup split chunks automáticamente
- Simple > Complex

---

### D2: Tree-Shaking Configuration (US-901)

**Opciones:**
- **A:** Module-level (custom Firebase exports)
- **B:** App-level (vite build config)
- **C:** Both (combined approach)

**Status:** ⏳ PENDIENTE (validar en Sesión 1)

**Análisis:**
- Necesita medición real post-build
- Firebase exports pueden ser reducidos manualmente
- Vite rollupOptions puede aplicarse globalmente

---

### D3: Lazy-Load Trigger (US-902)

**Opciones:**
- **A:** Route-based (cuando user navega a Testing)
- **B:** Component-based (cuando abre modal)
- **C:** Hybrid (preload en background, load on interact)

**Status:** ⏳ PENDIENTE

**Análisis:**
- TestingTools no es ruta, es modal
- Component-based más natural para modals
- Preload en background: no, los usuarios rara vez lo usan

---

## Decisiones Tomadas

### D4: UI Redesign Radical — Layer-Based Architecture sin Tabs (Sesión 2)

**Decisión:** ✅ **Opción C: Rediseño radical** — Arquitectura v3 layer-based + sidebar colapsable

**Contexto:**
- Opción A: Mantener tabs en sidebar (arquitectura v2) — Feedback UX: "sidebar limita el mapa"
- Opción B: Toggle binario en header (v1) — Rechazado: muy pequeño, no es protagonista
- Opción C: Layer selector en header + sidebar colapsable + mapa principal — **ELEGIDA**

**Por qué:**
1. **Mapa como protagonista:** El mapa gana ~30% más de espacio (sidebar colapsable)
2. **Selector más visible:** Layer selector en header es más rápido que tabs en sidebar
3. **Filtros accesibles:** Mover filtros al sidebar mantiene la lógica clara (filters dentro de la capa)
4. **Arquitectura más limpia:** Sin modo "Todo" complejo; cada layer es independiente

**Trade-offs:**
- ❌ Requiere 6 nuevas US en Sesión 2 (14 SP vs 11 SP originales)
- ❌ Cambio significativo después de documentación v2
- ✅ Mejor UX, mapa más accesible, layout más intuitivo

**Impacto:**
- Sesión 2: +3 SP (14 vs 11)
- Total Sprint: 23 SP (vs 20 SP originales)
- Archivos nuevos: 6 (LayerSelector, SidebarToggle, FilterPanel en sidebar, etc.)
- Archivos eliminados: TabControl, ModeToggle (antiguo), Nav vertical

**Validación:**
- [ ] Mapa ocupa ~70% pantalla (sidebar colapsado)
- [ ] Layer selector visible y responsive
- [ ] Sidebar colapsable con transición suave
- [ ] Filtros accesibles en sidebar
- [ ] UX testing: cambio de layer < 1s

---

---

## 📝 Template para Actualizar

Cuando se tome una decisión durante el sprint, copiar este template:

```markdown
### D[N]: [Título] ([US-XXX])

**Decisión:** ✅ [Opción elegida]

**Contexto:**
- [Alternativa A: descripción]
- [Alternativa B: descripción]

**Por qué:** [Razonamiento]

**Trade-offs:** [Qué se pierde]

**Impacto:** [Métricas, performance, etc.]

**Validación:** [Cómo verificar que funciona]
```

---

## 🔗 Referencia Anterior

Ver [Sprint 8 Decisions](../sprint-8/decisions.md) para patrones.

---

## DEC-901 — Reemplazar `activeTab` por `activeLayers` (objeto de capas independientes)

**Fecha:** Sprint 9 — Sesión 3  
**Estado:** Aprobada  
**Afecta:** `useStore.ts`, `Header`, `Sidebar`, `MapView`, `FilterPanel`

### Contexto

El store original modelaba la vista activa como `activeTab: 'clima' | 'nidos' | 'todo'`. Este modelo funcionaba mientras la app solo tuviera dos capas de datos, pero presentó tres problemas al intentar escalar:

1. **Exclusividad forzada** — un string solo puede tener un valor. Mostrar clima y nidos simultáneamente requería el valor especial `'todo'`, que fue eliminado conceptualmente en US-825 pero nunca removido del código.
2. **Filtros incompatibles por diseño** — `FilterPanelClima` y `FilterPanelNests` se intercambiaban completamente al cambiar de tab, sin posibilidad de coexistir.
3. **No escalable** — agregar gimnasios, PokéParadas o rutas como nuevas capas requería extender el union type y agregar más valores especiales (`'todo-con-gyms'`, etc.).

### Decisión

Reemplazar `activeTab` por un objeto de booleanos independientes:

```ts
activeLayers: {
  clima: boolean   // activo por defecto
  nidos: boolean
  gyms: boolean    // preparado, inactivo
  stops: boolean   // preparado, inactivo
  rutas: boolean   // preparado, inactivo
}
```

Cada capa se activa/desactiva de forma independiente con `toggleLayer(key)`. El mapa, el sidebar y los filtros reaccionan a la combinación de capas activas, no a un modo global.

### Consecuencias

| Componente | Cambio |
|---|---|
| `useStore.ts` | `activeTab` → `activeLayers` + `toggleLayer` + `setLayer` |
| `MapView.tsx` | Condición por capa individual en lugar de string comparison |
| `Header.tsx` | `LayerToggles` reemplaza el tab selector |
| `FilterPanel` | Secciones condicionales por capa, no intercambio total |
| `LocationFeed` | Feed unificado, items de cualquier capa activa |

### Alternativas descartadas

- **Mantener `activeTab` y agregar `'todo'`** — descartado en US-825. El problema de escalabilidad permanece.
- **Múltiples stores (uno por capa)** — descartado por complejidad innecesaria. El estado de cada capa es simple y relacionado.
- **URL params como fuente de verdad** — considerado para futuro (deep linking), pero fuera del scope de Sprint 9.

### Migración de localStorage

La key `pwe-activeTab` se abandona. La nueva key es `pwe-activeLayers` con valor JSON. No hay migración automática — en primera carga sin la key, el default es `{ clima: true, nidos: false, ... }`.

---

## DEC-902 — El sidebar muestra un feed unificado, no listas por capa

**Fecha:** Sprint 9 — Sesión 3  
**Estado:** Aprobada  
**Afecta:** `LocationFeed.tsx`, `LocationCard.tsx`, `LocationDetail.tsx`

### Contexto

`LocationFeed` mostraba solo ciudades clima. Al agregar nidos, la primera propuesta fue alternar entre "lista de ciudades" y "lista de nidos" según la capa activa. Este enfoque rompía la sincronización mapa→sidebar cuando ambas capas estaban visibles.

### Decisión

El sidebar muestra **lugares** (ciudades o parques), no capas. Cada lugar en la lista muestra tags de las capas que tiene datos y que están activas en ese momento. Si solo clima está activo, el lugar muestra solo el tag de clima. Si clima y nidos están activos, muestra ambos.

La unidad de información es el **lugar geográfico**, no el tipo de dato.

### Consecuencias

- `LocationCard` recibe `activeLayers` como prop y renderiza tags condicionalmente.
- `LocationFeed` construye una lista unificada de lugares con datos en cualquier capa activa.
- `LocationDetail` (panel de detalle) muestra secciones por capa activa.

---

## DEC-903 — `US-824` no incluye refactor de subcarpetas de MapView

**Fecha:** Sprint 9 — Sesión 3  
**Estado:** Aprobada  
**Afecta:** `US-824.md`, `MapView.tsx`

### Contexto

El código de ejemplo original de US-824 sugería separar `MapView` en `ClimateMapView` y `NestMapView` dentro de subcarpetas. Esa estructura no existe en el proyecto actual.

### Decisión

US-824 cubre solo el layout general (sidebar fixed + MapView flex:1 + transiciones). El código de ejemplo de MapView en la US original se ignora. `MapView.tsx` permanece como archivo único — la separación de responsabilidades se hace con condicionales internos por `activeLayers`, no con componentes separados.

Si en el futuro `MapView.tsx` supera las 400 líneas, se evalúa extracción en ese momento.

---

## DEC-904 — Descartar el toggle de colapso del sidebar en desktop/tablet

**Fecha:** Sprint 9 — Sesión 3 (2026-06-28)  
**Estado:** Aprobada  
**Afecta:** `US-824.md`, `Sidebar.tsx`, `SidebarToggle.tsx`, `useStore.ts` (flag `sidebarOpen`)

### Contexto

US-824 (versión original) pedía que el sidebar pudiera colapsarse en desktop/tablet vía un toggle existente en el Header, con el mapa expandiéndose al colapsar (`width` + `transition` 300ms). Al revisar la implementación revertida en `c6df8e5`, se encontraron dos problemas:

1. **Bug de implementación:** el colapso usaba `transform: translateX(-100%)` sobre un `width: 280px` fijo. El espacio reservado en el flex layout nunca se liberaba, así que el mapa no expandía — contradice el criterio de aceptación original.
2. **Bug de diseño, no solo de código:** al preguntarnos *para qué* sirve ocultar el sidebar en desktop, no hay un problema real de uso que resuelva.

### Análisis UX (vía skill `ui-ux-pro-max`)

- Con sidebar de 280-300px en una pantalla de 1280px+, el mapa ya ocupa ~78% del ancho. Ganar el ~22% restante ocultando el sidebar entero no compensa el costo de interacción que introduce (un click extra para volver a ver la lista o los filtros, pérdida de contexto de qué ciudad/nido está seleccionado).
- Clima, nidos y mapa se consultan **en simultáneo**, no de forma alternada — es un patrón master-detail (como Google Maps, Citymapper, herramientas GIS), donde ambos paneles coexisten. Ocultar uno rompe ese flujo en vez de mejorarlo.
- El caso real donde ocultar contenido SÍ es necesario es mobile: la pantalla no tiene espacio para mapa + sidebar simultáneos. Ese caso ya está resuelto por `BottomSheetPortal` (sesión 2), que es mutuamente excluyente con el mapa a pantalla completa — un patrón distinto y correcto para esa restricción.
- La guía UX general (`ux-guidelines.csv`) no contradice esto: no hay regla que pida colapso de sidebar como default; sí marca como alta severidad la falta de una escala de z-index formal, que es la parte de US-824 que sí permanece.

### Decisión

El sidebar permanece **siempre visible** en desktop (1024px+) y tablet (768-1023px), con ancho fijo (300px / 280px respectivamente) y sin toggle de colapso. El mecanismo de mostrar/ocultar contenido se mantiene únicamente en mobile vía `BottomSheetPortal`, sin cambios.

US-824 se reduce a: layout flex raíz con Header dentro del flow (sin `margin-top` hardcodeado) + escala de z-index formal. Story points bajan de 2 a 1.

### Consecuencias

- `SidebarToggle.tsx` y el flag `sidebarOpen` en `useStore.ts` quedan sin propósito en desktop/tablet. No se eliminan en esta US — se evalúa en limpieza posterior si no tienen otro consumidor (ej. mobile).
- `US-824.md` actualizado: criterios de colapso tachados y marcados como descartados, criterios de z-index y header-en-flex-flow se mantienen.

### Alternativas descartadas

- **Arreglar el bug (cambiar `transform` por `width`) y mantener el toggle** — descartado. Arreglar la implementación no resuelve que la feature no tiene un caso de uso real en desktop/tablet; sería mantener complejidad (estado, animación, botón) sin beneficio medible.
- **Colapso automático en tablet (768-1023px) pero no en desktop** — considerado, pero el mismo argumento de DEC-904 aplica a tablet: a 768px el sidebar de 280px sigue dejando suficiente espacio al mapa, y el patrón master-detail sigue siendo válido. Se descarta por consistencia.

---

## DEC-905 — Auditoria de status post-revert: US-826/823/821/818 quedaron mal marcadas "Done"

**Fecha:** Sprint 9 — Sesión 3 (2026-06-28)
**Estado:** Aprobada
**Afecta:** `US-826.md`, `US-823.md`, `US-821.md`, `US-818.md`, `00-INDEX.md`

### Contexto

El 2026-06-21 se implementaron US-826, US-823, US-821 y US-818 en una sola sesion sin checkpoints intermedios de aprobacion (commits `9d08644, 6dd2468, 342e0e1, 1d8f67c, ad8c155, fae3265, aeafcd3, 2efee11`). El resultado no fue el esperado por el usuario, que trabaja US por US con validacion entre cada una. Se ordeno revertir el codigo (`c6df8e5`), conservando solo la documentacion actualizada (`a82dd80`).

El revert elimino el codigo pero no corrigio el campo `Status:` de los specs individuales, que quedaron en **"Done — implementada 2026-06-21"** para las 4 US a pesar de que su codigo ya no existia. Esto se detecto al auditar el sprint completo a pedido del usuario, cruzando specs vs. `git show --stat` de cada commit revertido vs. el codigo real en disco.

### Hallazgo

Posteriormente, US-824 se reimplemento de forma independiente y posterior al revert (`4a3cca8`, 2026-06-28). Como US-824 depende de `activeLayers` y `LayerToggles`, esa sesion los recreo desde cero como efecto colateral — sin pasar por revision US por US para 826/823 tampoco, pero su resultado si quedo vigente en disco.

| US | Status en spec (antes de auditoria) | Codigo real 2026-06-28 |
|---|---|---|
| US-826 | Done (2026-06-21) | Cubierta — pero por `4a3cca8`, no por el commit que el spec citaba (revertido) |
| US-823 | Done (2026-06-21) | Cubierta — mismo caso que US-826 |
| US-824 | Done (2026-06-28) | Cubierta — coincide con su propio commit, sin discrepancia |
| US-821 | Done (2026-06-21) | **No existe.** `SidebarFilterPanel.tsx` no esta en disco; el FilterPanel adaptativo sigue en Header |
| US-818 | Done (2026-06-21) | **No existe.** `NestCard.tsx`, `types/feed.ts` no estan en disco; `LocationFeed.tsx` no maneja nidos |

### Decision

1. US-826 y US-823: Status se mantiene "Done" pero se anota que el codigo vigente proviene de `4a3cca8` (US-824), no del commit original — para que la traza historica sea correcta.
2. US-821 y US-818: Status corregido a "Pendiente". Quedan en el backlog real de la sesion 3 para implementarse, una US a la vez con checkpoint de aprobacion entre cada una.
3. `00-INDEX.md` actualizado con los status corregidos y nota de auditoria.

### Leccion para el flujo de trabajo

No ejecutar multiples US en una sola sesion sin checkpoint de validacion del usuario entre cada una. Si se revierte codigo, el revert debe incluir la correccion de status en los specs afectados en el mismo commit — no asumir que "conservar solo documentacion" significa que la documentacion ya es correcta.

---

## DEC-906 — US-821 cambia de panel inline a panel deslizante (mockup Turno 4a)

**Fecha:** Sprint 9 — Sesion 3 (2026-07-05)
**Estado:** Aprobada
**Afecta:** `US-821.md`, `Sidebar.tsx`, `FilterPanel.tsx` (Sidebar), `useStore.ts`

### Contexto

La spec original de US-821 (escrita 2026-06-21) describia un `FilterPanel` inline: siempre visible encima del feed, con los controles `CustomSelect` (dropdowns) que ya existen en `FilterPanelClima`/`FilterPanelNests`. Esa version ya esta implementada en disco (`src/components/Sidebar/FilterPanel.tsx`).

El usuario aporto un nuevo paquete de diseno de alta fidelidad (`src/docs/mockups/filtersdesign/`) que reemplaza ese enfoque por un **panel deslizante**: boton "Filtros" + busqueda arriba de la lista, que al activarse desliza un panel completo (`translateX`) sobre la lista de ciudades (el mapa nunca se cubre), con acordeones agrupados por capa (Clima/Nidos), pills, radio list, y footer Aplicar/Cancelar/Limpiar. El prototipo (turno 4a, marcado "diseño definitivo") es de mayor fidelidad visual e interactiva que el diseno original de la sesion 3.

### Decision

Se actualiza el spec de US-821 in-place para reflejar el nuevo diseno del panel deslizante, en lugar de crear una US nueva — es la misma responsabilidad funcional (filtros adaptativos por capa activa en el sidebar), solo cambia el patron visual e interactivo. El codigo de ejemplo y criterios de aceptacion anteriores (dropdowns inline) se reemplazan por completo.

Decisiones de implementacion incluidas:

1. **Aplicar/Cancelar con borrador real:** el panel opera sobre un slice `draftFilters` en el store (Zustand), clonado del estado real al abrir. Los controles del panel leen/escriben el borrador; "Aplicar" lo copia al estado real y cierra; "Cancelar" lo descarta y cierra. Evita que cada click de pill dispare un re-filtrado del feed mientras el panel esta abierto.
2. **Reemplazo completo del inline:** `src/components/Sidebar/FilterPanel.tsx` (version dropdowns) se elimina; su lugar lo toma el nuevo panel deslizante.
3. **Subcomponentes compartidos con el modal mobile:** `FilterPanelModal.tsx` (bottom-sheet, ya existe para mobile) comparte piezas visuales (accordion section, pills, radio list, group header) con el panel nuevo de desktop/tablet, para no duplicar JSX/CSS entre ambos.
4. **"Tipo Clima" del mockup = filtro de tipo Pokemon potenciado:** el mockup rotulo una seccion "Tipo Clima" sin conocer el dominio; en realidad corresponde al filtro `typeFilter` ya existente (tipos Pokemon potenciados por el clima), con el mismo componente visual grid que "Tipo Pokemon" en Nidos. No se agrega ningun campo nuevo de clasificacion climatica.

### Consecuencias

- `src/components/Sidebar/FilterPanel.tsx` cambia de "wrapper con CustomSelect" a "panel deslizante con acordeones" — implementacion practicamente desde cero.
- Nuevo estado en `useStore.ts`: `filterPanelOpen`, `draftFilters`, `accordionState` + acciones `openFilterPanel/applyFilterPanel/cancelFilterPanel/clearDraftFilters/toggleAccordion`.
- `FilterPanelClima.tsx` y `FilterPanelNests.tsx` (los dropdowns actuales en `Header/`) quedan sin consumidor en el sidebar tras este cambio — se evalua su remocion cuando se confirme que no los usa nada mas.

### Alternativas descartadas

- **useState local en el componente del panel para el borrador** — descartado; duplica los tipos de filtro fuera de Zustand y complica compartir el borrador con los subcomponentes reutilizados por el modal mobile.
- **Aplicar en vivo (sin borrador, Cancelar = Aplicar)** — descartado por el usuario; el mockup distingue explicitamente Aplicar de Cancelar y se quiere fidelidad real a ese comportamiento.
- **Omitir "Tipo Clima" por falta de dato** — descartado al confirmarse que no es un campo nuevo, sino el filtro de tipo Pokemon ya existente mal etiquetado por el mockup.

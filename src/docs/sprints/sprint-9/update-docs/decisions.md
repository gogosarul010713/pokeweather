# Decisiones Arquitectónicas — Sprint 9

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

# US-1007: Prediction Analysis Table — Lookback Dashboard

**ID:** US-1007  
**Título:** Componente React — Tabla de Predicciones con Lookback 12h  
**Estimación:** 3 SP (1-2h implementación + 30min refinamiento)  
**Estado:** ✅ COMPLETADA (2026-04-18)  
**Dependencias:** US-1002 ✅ (snapshots_flat en BigQuery)

**Prioridad:** Alta — Debugging y análisis táctico de precisión

---

## 📝 Descripción

Componente React que renderiza tabla detallada de predicciones individuales con análisis retrospectivo ("lookback 12h"). Permite identificar rápidamente:
- Qué predicciones fallaron
- Por qué fallaron (análisis lookback)
- Qué predicción pasada habría acertado
- Patrones de error por ciudad, tipo, horario

---

## ✅ Historial de cambios

### v1 — Implementación inicial (2026-04-18)
1. **Formato hora:** `"DD/MM HH:MM UTC"` con helper `formatQueryTime()`
2. **Lookback:** siempre disponible (aciertos + fallos), botón rojo/verde según resultado
3. **Servicio datos reales:** `src/services/predictions/predictionAnalyticsService.ts`
4. **Integración PredictionAnalysisDemo:** carga automática + fallback a mock

### v2 — Restructuración condiciones climáticas (2026-04-18, commit 62256a1)
1. **`prediction`/`actual` = condiciones climáticas:** "sunny", "rain", "cloudy", "fog", "snow", "windy"
2. **Iconos via `WEATHER_IMAGES[condition]`** y labels via `CONDITION_LABEL[condition]`
3. **Columna "Confianza" eliminada** (ver D-012 — no significativa por fila)
4. **Ordenamiento por columna:** headers clickeables ↑ ↓ ⇅ (cliente-side, 20 filas)
5. **Lookback 3-filas:** hora, cuánto hace, icono+label+✓

### v3 — TanStack Table v8 (2026-04-18, commit 70e062d) ← **VERSIÓN ACTUAL**
Migración de implementación custom a `@tanstack/react-table@8.21.3`.
Ver decisión D-013.

**Features añadidas:**
- Búsqueda global con input en toolbar (filtra todas las columnas simultáneamente)
- Filtro por columna: inputs inline debajo de cada header
- Paginación configurable: selector 10 / 20 / 50 / 100 filas
- Botones primera página `««` y última página `»»`
- CSV y JSON exportan las filas **filtradas** (no el total)
- Estado vacío cuando filtros no devuelven resultados
- Botón "✕ Limpiar filtros" visible cuando hay filtros activos

---

## ✅ Criterios de Aceptación (estado final v3)

- [x] Tabla con 6 columnas: Hora UTC, Ciudad, Predicción, Real, Resultado, Lookback
- [x] Condiciones climáticas en Predicción y Real (no tipos Pokémon) con icono + label
- [x] Filas expandibles inline con panel lookback 12h
- [x] **Paginación configurable:** selector 10/20/50/100 filas por página
- [x] **Botones de navegación:** `««` primera, `‹ Ant`, números, `Sig ›`, `»»` última
- [x] **Búsqueda global:** input toolbar que filtra todas las columnas
- [x] **Filtros por columna:** input en cada header (excepto Lookback)
- [x] **Ordenamiento:** click en header alterna asc ↔ desc con iconos ⇅ ↑ ↓
- [x] Botón "✕ Limpiar filtros" cuando hay filtros activos
- [x] Contador dinámico: "X de Y resultados" cuando hay filtros activos
- [x] Header con botones: Export CSV (filas filtradas), Copy JSON (filas filtradas)
- [x] Estilos coherentes: CSS vars del proyecto, prefijo `.pat-`, sin conflictos
- [x] Estado vacío con mensaje cuando filtros no devuelven resultados
- [x] Integrado en TestingTools → tab "📊 Predicciones"
- [x] Build compila sin errores ✅ (tsc + vite, 979ms)

---

## 📋 Estructura de Datos (Prop `rows`) — versión actual

```typescript
interface PredictionRow {
  queryTime: string | Date;    // ISO string o Date — se formatea a "DD/MM HH:MM"
  hour: number;                // 0-23
  cityId: string;              // "sydney", "tokyo", "london"
  cityName: string;            // Display name
  prediction: string;          // Condición climática: "sunny" | "rain" | "cloudy" | "fog" | "snow" | "windy"
  actual: string | null;       // Condición climática confirmada o null si "Sin datos"
  correct: boolean | null;     // null = aún sin reporte de confirmación
  lookback12h: LookbackItem[];
}

interface LookbackItem {
  hoursAgo: number;            // 1-12
  condition: string;           // Condición climática (igual que PredictionRow.prediction)
  wouldBeCorrect: boolean;     // true si esta condición habría acertado
  timestamp?: string;          // "HH:MM" para mostrar en el chip del lookback
}
```

> **Nota:** `confidence` fue eliminado en v2 (D-012). Confianza acumulada queda para dashboard agregado futuro.

---

## 🎨 Estructura del Componente (v3 — TanStack Table)

### 1. Header
- Título + contador total "X predicciones"
- Botones: Export CSV, Copy JSON (ambos exportan las filas filtradas)

### 2. Toolbar (búsqueda global)
- Input "Buscar en toda la tabla..." — filtra todas las columnas simultáneamente
- Contador dinámico "X de Y resultados" cuando hay filtros activos
- Botón "✕ Limpiar filtros" visible cuando globalFilter o columnFilters activos

### 3. Tabla (6 columnas)
| Columna | Contenido | Ordenable | Filtrable |
|---------|-----------|-----------|-----------|
| Hora UTC | `DD/MM HH:MM` monospace | ✅ | ✅ |
| Ciudad | Nombre + dot-color por city | ✅ | ✅ |
| Predicción | Icono clima + label | ✅ | ✅ |
| Real | Icono clima + label / "Sin datos" | ✅ | ✅ |
| Resultado | ✓ Acierto / ✕ Fallo / "No confirmado" | ✅ | ✅ |
| Lookback | Botón LOOKBACK / CERRAR | ❌ | ❌ |

Cada header filtrable tiene un input de texto inline debajo del label.

### 4. Fila Expandible (inline lookback)
- Panel con grid de chips de 70px mínimo
- Cada chip: hora (HH:MM), cuánto hace (-Xh), icono+label condición, ✓ si habría acertado
- Color: verde si `wouldBeCorrect`, gris por defecto

### 5. Paginación
- Selector de filas: 10 / 20 / 50 / 100
- Botones: `««` primera, `‹ Ant`, ventana de 5 números, `Sig ›`, `»»` última
- Info: "Página X de Y"

---

## 🔧 Implementación técnica

**Librería:** `@tanstack/react-table@8.21.3` (ver D-013)

**Hooks usados:**
```typescript
useReactTable({
  data: rows,
  columns,
  state: { sorting, columnFilters, globalFilter },
  getCoreRowModel:       getCoreRowModel(),
  getFilteredRowModel:   getFilteredRowModel(),   // búsqueda global + filtros columna
  getSortedRowModel:     getSortedRowModel(),      // ordenamiento
  getPaginationRowModel: getPaginationRowModel(),  // paginación
  initialState: { pagination: { pageSize: 20 } },
})
```

**Archivos modificados:**
- `src/components/Analytics/PredictionAnalysisTable.tsx` — reescrito completo (~350 líneas)
- `package.json` — nueva dependencia `@tanstack/react-table`

---

## 🔗 Referencias

- Decisión de arquitectura: D-013 (adopción TanStack Table)
- Decisión de restructura: D-012 (condiciones climáticas vs tipos Pokémon)
- Decisión de origen: D-011 (componente React vs Looker Studio)
- Estilos proyecto: `src/index.css` (CSS vars)
- Servicio datos: `src/services/predictions/predictionAnalyticsService.ts`

---

**Creado:** 2026-04-18  
**Última actualización:** 2026-04-18 (v3 — TanStack Table, commit 70e062d)  
**Status:** ✅ COMPLETADA


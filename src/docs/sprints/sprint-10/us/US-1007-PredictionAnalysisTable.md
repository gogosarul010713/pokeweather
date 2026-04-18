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

## ✅ Completitud (2026-04-18)

### Cambios Realizados:
1. **Formato hora mejorado:** Campo `queryTime` ahora muestra `"DD/MM HH:MM UTC"` para evitar pérdida de contexto
   - Antes: `"16:00 UTC"` (sin día)
   - Después: `"18/04 16:00 UTC"` (día + hora)
   - Función helper: `formatQueryTime(queryTime: string | Date): string`

2. **Lookback siempre disponible:** Botón "LOOKBACK" se muestra para TODAS las filas con datos lookback
   - Antes: solo en filas donde `correct === false` y había lookback
   - Después: disponible en aciertos y fallos
   - Estilo visual: rojo para fallos, verde para aciertos
   - Panel expandible con color fondo diferente

3. **Servicio de datos reales creado:** `src/services/predictions/predictionAnalyticsService.ts`
   - Función `fetchPredictions()`: carga de Firestore y transforma a `PredictionRow[]`
   - Lee de `city_weather` collection usando `getRecentForecasts('24h')`
   - Genera lookback automáticamente comparando snapshots previos
   - Fallback a mock data si error o sin datos
   - Incluye placeholder para `estimateConfidence()` (mejoras futuras)

4. **Integración en PredictionAnalysisDemo:**
   - Componente funcional con `useEffect` y estado de carga
   - Carga automática de datos reales
   - Muestra estado: "⏳ Cargando..." / "⚠️ Error" / "✅ Real data"
   - Fallback a mock data si no hay datos en Firestore

---

## ✅ Criterios de Aceptación

- [x] Componente `PredictionAnalysisTable.tsx` creado en `src/components/Analytics/` (360 líneas)
- [x] Tabla con 7 columnas: hora, ciudad, predicción, real, resultado, confianza, lookback
- [x] Filas expandibles inline con panel lookback 12h
- [x] Paginación: 20 filas/página con prev/next y números
- [x] Header con botones: Export CSV, Copy JSON
- [x] Contador dinámico: "X predicciones"
- [x] Estilos coherentes: uso de CSS vars del proyecto (tipos Pokémon, colores)
- [x] Integrado en TestingTools → tab "📊 Predicciones"
- [x] Validado con datos mock (estructura comprobada)
- [x] **NEW: Formato hora con día/hora (DD/MM HH:MM)**
- [x] **NEW: Lookback siempre disponible (sin condición `correct === false`)**
- [x] **NEW: Servicio `predictionAnalyticsService.ts` para datos reales**
- [x] **NEW: Integración automática en PredictionAnalysisDemo**
- [x] Build compila sin errores ✅

---

## 📋 Estructura de Datos (Prop `rows`)

```typescript
interface PredictionRow {
  queryTime: string;           // ISO: "2026-04-17T16:00:00Z"
  hour: number;                // 0-23
  cityId: string;              // "sydney", "tokyo", "london"
  cityName: string;            // Display name
  prediction: string;          // Pokémon type: "Water", "Fire", etc.
  confidence: number;          // 0-100
  actual: string;              // Pokémon type
  correct: boolean;            // true si prediction === actual
  lookback12h: LookbackItem[]; // Array vacío si correct === true
}

interface LookbackItem {
  hoursAgo: number;            // 1-12
  pokemonType: string;         // Pokémon type
  wouldBeCorrect: boolean;     // true si pokemonType === actual
}
```

---

## 🎨 Estructura del Componente

### 1. Header (simple)
- Título: "Predicciones Detalladas"
- Botones: "Export CSV", "Copy JSON"
- Contador: "X predicciones"

### 2. Tabla (7 columnas)
| Columna | Contenido | Estilo |
|---------|-----------|--------|
| Hora UTC | `HH:MM UTC` | monospace |
| Ciudad | Nombre + indicador color | color por ciudad |
| Predicción | Badge tipo Pokémon | color --type-X |
| Real | Badge tipo Pokémon | color --type-X |
| Resultado | ✅ Acierto / ❌ Fallo | verde/rojo |
| Confianza | Bar + porcentaje | barra dinámica |
| Lookback | Botón (solo si falló) | estilo error |

### 3. Fila Expandible (inline)
- Se abre bajo la fila principal
- Panel con grid de chips (12 máximo)
- Cada chip: `-Xh`, tipo Pokémon, ✅ si habría acertado
- Header: "Lookback 12h — X predicción(es) habrían acertado · Real: [badge actual]"

### 4. Paginación
- 20 filas/página
- Botones prev/next, números página, info "Página X de Y"

### 5. Filtros (opcional para MVP, puede ser expandible después)
- Por ahora: sin filtros
- Prepared para: ciudad, tipo, horario, resultado

---

## 🚀 Pasos de Implementación

### Paso 1: Crear estructura del componente
- Archivo: `src/components/Analytics/PredictionAnalysisTable.tsx`
- Folder: crear `/Analytics/` si no existe
- Interfaz TypeScript para datos
- Estado: filas, página actual, lookbacks abiertos

### Paso 2: Renderizar tabla base
- Header con título y botones
- Tabla vacía (thead solo)
- Paginación estructura

### Paso 3: Poblar tabla con datos
- Mapear `rows` a filas de tabla
- Renderizar cada columna según especificación
- Aplica colores de tipos Pokémon

### Paso 4: Implementar lookback expandible
- Estado para trackear qué rows tienen lookback abierto
- Renderizar fila extra cuando abierto
- Estilos: panel expandible, chips con colores

### Paso 5: Export & Copy
- CSV: columnas separadas por coma
- JSON: stringify de filas filtradas

### Paso 6: Integración en app
- Exportar componente
- Integrar en TestingTools o nueva ruta
- Pasar datos mock para testing

### Paso 7: Refinar estilos
- Asegurar coherencia con design system
- Responsive (mobile-friendly paginación)

---

## 📊 Datos Mock (para testing)

El componente recibirá datos de:
- Prop `rows` (mock para dev)
- Query BigQuery (producción)

```typescript
const MOCK_ROWS: PredictionRow[] = [
  {
    queryTime: "2026-04-17T16:00:00Z",
    hour: 16,
    cityId: "sydney",
    cityName: "Sydney",
    prediction: "Water",
    confidence: 92,
    actual: "Water",
    correct: true,
    lookback12h: []
  },
  {
    queryTime: "2026-04-17T16:00:00Z",
    hour: 16,
    cityId: "tokyo",
    cityName: "Tokyo",
    prediction: "Fire",
    confidence: 78,
    actual: "Electric",
    correct: false,
    lookback12h: [
      { hoursAgo: 12, pokemonType: "Water", wouldBeCorrect: false },
      { hoursAgo: 11, pokemonType: "Electric", wouldBeCorrect: true },
      // ... más
    ]
  }
];
```

---

## 🔗 Referencias

- Documento especificación: `prompt-dashboard-claude-ai.md`
- HTML referencia: `pokemon-weather-dashboard (1).html`
- Estilos proyecto: `src/index.css` (CSS vars)
- Componente base: `src/components/UI/FilterChip.tsx`

---

## 📝 Notas

- Sin librerías nuevas (chart library, react-table, etc.)
- Reutilizar componentes: FilterChip, Toast para feedback
- Estilos: CSS-in-JS con `<style>` tag en componente
- Colores tipos: usar vars `--type-water`, `--type-fire`, etc.
- Fuentes: Rajdhani (tabla), Exo 2 (body)

---

**Próximos pasos:**
1. ✅ Estructura creada — Pasar a Paso 1 (código)
2. Integración en app
3. Testing con datos BigQuery reales

**Creado:** 2026-04-18  
**Status:** 🔄 EN PROGRESO


# US-1107: Lookback 12 Horas — Análisis de Precisión Histórica

**Sprint:** 10 (Ampliación)  
**Story Points:** 3-4  
**Estado:** 📋 Especificación  
**Roles:** 🔍 Analista | 🏛️ Arquitecto | 💻 Desarrollador  

---

## 📋 Descripción

Implementar vista expandible de "lookback de 12 horas" en la tabla de predicciones. Para cada predicción mostrada, mostrar las 12 predicciones ANTERIORES (desde hace 12h hacia atrás) que también predijeron esa misma hora.

**Caso de uso:** Un usuario ve que Pier 39 a las 4 AM se predijo como "soleado" pero resultó "nublado". Expande el lookback y ve:
- A las 3 AM se predijo para 4 AM: "nublado" ❌
- A las 2 AM se predijo para 4 AM: "soleado" ✓
- A las 1 AM se predijo para 4 AM: "nublado" ❌
- ... (9 más)

Esto permite ver **tendencia de precisión** — ¿mejoró la predicción conforme se acercó la hora?

---

## 🔍 Análisis — Lógica de Lookback

### Inputs
```
Row actual (mostrada en tabla):
  - cityId: "pier-39"
  - queryTime: 2026-04-24 04:00 UTC
  - snapshot.hour: 4 (la hora para la cual se predice)
  - prediction: "sunny"
  - actual: "cloudy"

Todos los forecasts de Firestore:
  [
    { city_id: "pier-39", created_at: "2026-04-24T04:00Z", snapshots[...] },
    { city_id: "pier-39", created_at: "2026-04-24T03:00Z", snapshots[...] }, ← 12h atrás
    { city_id: "pier-39", created_at: "2026-04-24T02:00Z", snapshots[...] },
    ...
    { city_id: "pier-39", created_at: "2026-04-23T04:00Z", snapshots[...] }, ← 24h atrás (límite)
  ]
```

### Lógica Core
```typescript
function generateLookback(
  cityId: string,
  targetHour: number,           // la hora que queremos predecir (4)
  referenceTime: Date,          // cuándo se obtuvo la predicción actual (04:00)
  allForecasts: ForecastDoc[],
  reportIndex: Map<string, Report>
): LookbackItem[] {
  
  // 1. Filtrar: Solo forecasts de ESTA ciudad
  const cityForecasts = allForecasts.filter(f => f.city_id === cityId)
  
  // 2. Ordenar: Por createdAt DESC (más recientes primero en lookback)
  const sorted = cityForecasts.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  // 3. Excluir: El forecast actual mismo (no queremos verlo en el lookback)
  const hoursAgoThreshold = 0.5  // items con tiempo muy cercano
  const lookbackItems = []
  
  for (const forecast of sorted) {
    const forecastTime = new Date(forecast.created_at)
    const refTime = new Date(referenceTime)
    
    // Calcular "cuántas horas atrás" se obtuvo este forecast
    const diffMs = refTime.getTime() - forecastTime.getTime()
    const hoursAgo = diffMs / (1000 * 60 * 60)
    
    // Saltar si es el mismo forecast (hoursAgo ~= 0)
    if (hoursAgo < hoursAgoThreshold) continue
    
    // Saltar si es más antiguo que 12h
    if (hoursAgo > 12) break
    
    // 4. Extraer el snapshot que predice ESTA HORA (targetHour)
    const matchingSnapshot = forecast.snapshots.find(s => s.hour === targetHour)
    if (!matchingSnapshot) continue
    
    // 5. Chequear si fue correcto (comparar con report)
    const reportKey = `${cityId}|${forecast.date_hour}`
    const report = reportIndex.get(reportKey)
    const wouldBeCorrect = report
      ? matchingSnapshot.classified === report.should_be
      : false
    
    lookbackItems.push({
      hoursAgo: Math.round(hoursAgo * 10) / 10,  // 1.2, 2.5, etc
      condition: matchingSnapshot.classified,
      wouldBeCorrect,
      timestamp: forecast.created_at,
    })
  }
  
  return lookbackItems
}
```

### Ejemplo Real
```
Fila 1 (actual):
  Pier 39 | 2026-04-24 04:00 UTC | Predicción: "sunny" | Real: "cloudy"

Lookback (expandible):
  [0.5h atrás]  3 AM predijo para 4 AM: "cloudy" ✗
  [1.2h atrás]  2 AM predijo para 4 AM: "sunny" ✓
  [2.0h atrás]  1 AM predijo para 4 AM: "cloudy" ✗
  [3.1h atrás] 12 PM predijo para 4 AM: "sunny" ✓
  [4.5h atrás] 11 PM predijo para 4 AM: "cloudy" ✗
  ... (hasta 12h atrás)
```

---

## 🏛️ Decisiones de Arquitectura

### A-001: Timing para calcular Lookback
**Opción A:** Calcular en cliente en `generateLookback()` (elegida)
- Pro: O(N) solo una vez por fetch, no repetir búsquedas
- Con: Requiere tener todos los forecasts en memory

**Opción B:** Query Firestore lazy (expandir → query)
- Pro: Solo buscar cuando usuario expande
- Con: Network latency por expansión, queries repetidas

**Decisión:** Opción A — calcular en fetch initial

### A-002: Filtración y limitación
- **Límite temporal:** 12h atrás (D-018 inspiración)
- **Excluir:** El forecast actual mismo (hoursAgo < 0.5h threshold)
- **Incluir:** Cualquier forecast con snapshot para esa hora

### A-003: Ordenamiento en UI
- **Descending:** Más recientes primero (3h atrás, 4h atrás, ...)
- **Razón:** Enseña progreso hacia la hora real

---

## 🎯 Requerimientos Funcionales

### RF-1: Generación de Lookback
- **Función:** `generateLookback()` en predictionAnalyticsService.ts
- **Entrada:** cityId, targetHour, referenceTime, allForecasts, reportIndex
- **Salida:** LookbackItem[] (máx 12 items, desc por time)
- **Manejo de edge cases:**
  - Forecast sin snapshots → skip
  - Snapshot no contiene targetHour → skip
  - Forecast es el actual (hoursAgo < 0.5h) → skip
  - Forecast > 12h atrás → break

### RF-2: Renderización Expandible
- **Trigger:** Botón "↓ Lookback" en fila (existe hoy pero sin datos)
- **Estado:** `openLookbacks: Set<string>` (track qué filas expandidas)
- **Contenido expandido:** 3 sub-filas por lookback item (hora, delta, resultado)
- **Styling:** Gris si falló, verde si acertó

### RF-3: Columna Hora Local
- **Mostrar en cada lookback item:** Hora local CUANDO se obtuvo ese forecast
- **Formato:** "HH:MM" (no repite fecha, columna principal ya la tiene)
- **Cálculo:** `getCityLocalTime(forecast.created_at, forecast.timezone)`

### RF-4: Indicador Visual
- **Correcto:** ✓ verde
- **Incorrecto:** ✗ gris
- **Sin data:** Sin icono (gris)

---

## 📊 Cambios por Archivo

| Archivo | Cambio | Tipo | Líneas |
|---------|--------|------|--------|
| `src/services/predictions/predictionAnalyticsService.ts` | Implementar `generateLookback()` | +CODE | +80 |
| `src/components/Analytics/PredictionAnalysisTable.tsx` | Renderizar lookback expandible | +CODE | +40 |
| `src/docs/sprints/sprint-10/12-US-1107-Lookback12h.md` | Este archivo | DOC | — |

---

## ✅ Criterios de Aceptación

1. ✅ Función `generateLookback()` implementada y exportada
2. ✅ Lookback items calculados durante `fetchPredictions()`
3. ✅ Tabla muestra botón "↓ Lookback" en cada fila
4. ✅ Click expande/contrae sin re-render de tabla
5. ✅ Expandido muestra máximo 12 items, ordenado desc por horasAgo
6. ✅ Cada item muestra: horasAgo | hora local | condición | resultado (✓/✗)
7. ✅ Colores: verde=acertó, gris=falló
8. ✅ Testing manual: Pier 39, Sydney, etc. — lookback coincide con historial Firestore
9. ✅ Build sin errores TS, gzip < 900 KB

---

## 🧪 Testing Manual

### Test 1: Lookback Exists
```
1. Abre tabla de predicciones
2. Busca fila con city="Pier 39", hour=4 (o primera fila)
3. Verifica: Botón "↓ Lookback" visible (enabled, no disabled)
4. Haz click → debe expandir con items
5. Expected: 5-12 items, ordenados descendente por horasAgo
```

### Test 2: Aciertos/Fallos
```
1. Expande Pier 39 4 AM predicción "sunny"
2. Mira el lookback:
   - Item 1 (0.5h atrás): 3 AM predijo "sunny" → ¿acertó? (si actual=sunny, ✓)
   - Item 2 (1.5h atrás): 2 AM predijo "cloudy" → ¿acertó? (si actual=sunny, ✗)
3. Valida vs Firestore Console → lookback debe coincidir
```

### Test 3: Edge Cases
```
1. Fila sin reportes (actual=null) → lookback items sin resultado
2. Fila con <5 forecasts previos → mostrar los que hay
3. Fila en primeras 12h de datos → mostrar solo los que hay (no error)
```

---

## 📝 Notas de Implementación

- **Interfaz `LookbackItem`:** Ya existe en PredictionAnalysisTable.tsx
  ```typescript
  export interface LookbackItem {
    hoursAgo: number;           // 1.5, 3.2, etc
    condition: string;           // "sunny", "cloudy", etc
    wouldBeCorrect: boolean;     // si acertó
    timestamp?: string;          // ISO string
  }
  ```
- **ForecastDoc.snapshots[]:** Array de 12 ForecastSnapshot, cada uno tiene `hour` (0-11)
- **Performance:** O(N²) lookback es aceptable porque:
  - N = ~30-50 forecasts por ciudad (últimas 24h)
  - 15 ciudades ~ 450 forecasts total
  - Lookback loop: 450 × 12 = 5,400 comparaciones (negligible en JS)

---

## 🚀 Próximos Pasos (Esta Sesión)

1. ✅ Presentar plan detallado (este documento)
2. 🤔 **Confirmación del usuario**
3. 🔨 Implementar `generateLookback()`
4. 🎨 Actualizar renderizado en PredictionAnalysisTable
5. 🧪 Testing manual
6. 🎉 Commit + Merge Sprint 10

---

**Responsable:** Claude Code | **Fecha:** 2026-04-24  
**Status:** ✏️ Draft — Esperando confirmación del usuario  

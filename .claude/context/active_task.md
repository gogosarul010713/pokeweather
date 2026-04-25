# 🎯 Sprint 10 Features: Reporte Clima Real + Copiar Coords en Tabla

**Fecha Inicio:** 2026-04-24 (Session 10)  
**Fecha Finalización:** 2026-04-24 (Session 10)  
**Sprint:** 10 (Ampliación)  
**Estado:** ✅ COMPLETADA

---

## ✅ Features Implementadas (2026-04-24 Session 10)

### Feature 1: Mover "Reportar Clima" de LocationDetail → Tabla Predictiva

**Completado:**
- ✅ Expandir `PredictionRow` interface: agregar `lat`, `lon`
- ✅ Crear `WeatherReportModal.tsx` (nuevo componente)
  - Propósito: reportar clima real observado (NO fallo de clasificación)
  - Permite reportar del **mismo clima predicho** (sin validación "debe ser diferente")
  - Bottom-sheet centrado, z-index 1100/1101
  - Modal-specific: NO reutilizar ClassificationReportModal
- ✅ Agregar `saveWeatherReport()` en classificationReportService.ts
  - Nueva colección Firestore: `weather_reports`
  - Schema: predicted_condition vs reported_condition, source='prediction-table'
  - TTL: 30 días (auto-delete)
- ✅ Actualizar datos reales:
  - `predictionAnalyticsService.ts`: mapear lat/lon desde ForecastDoc
  - `PredictionAnalysisDemo.tsx`: agregar coords a mock data
- ✅ Remover de LocationDetail:
  - ✅ Remover botón ⚠️ de header
  - ✅ Remover estado: `showReportModal`, `showReportToast`
  - ✅ Remover handler: `handleReportSuccess()`
  - ✅ Remover modal renderizado + toast
  - ✅ Remover import: ClassificationReportModal
  - ✅ **MANTENER:** botón 📋 copiar coords (diferente contexto)

### Feature 2: Botón Copiar Coordenadas en Tabla

**Completado:**
- ✅ Nueva columna "📋 Copiar Coords" en PredictionAnalysisTable
- ✅ Botón solo icono (sin texto)
- ✅ Copia formato: `${lat.toFixed(4)}, ${lon.toFixed(4)}`
- ✅ Feedback visual: icono cambia a ✓ por 2s
- ✅ Estado: `copiedCoords` para trackear fila recientemente copiada

---

## 📊 Cambios por Archivo

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `src/components/Analytics/PredictionAnalysisTable.tsx` | +2 columnas, estado modal, CSS | +50 |
| `src/components/Analytics/WeatherReportModal.tsx` | **NUEVO** | 280 |
| `src/components/Sidebar/LocationDetail.tsx` | Remover reporte | -40 |
| `src/services/firebase/classificationReportService.ts` | +saveWeatherReport() | +60 |
| `src/services/predictions/predictionAnalyticsService.ts` | Mapear lat/lon | +2 |
| `src/components/Analytics/PredictionAnalysisDemo.tsx` | Coords mock data | +12 |

**Total:** 451 líneas agregadas, 33 removidas

---

## ✅ Build & QA

- ✅ **TypeScript:** Sin errores de compilación
- ✅ **Build:** `npm run build` exitoso (132 modules, 842 KB gzip)
- ✅ **Dev server:** Corriendo en `http://localhost:5180`
- ✅ **Commit:** `44d94df` — feat(sprint-10): Reporte clima real en tabla + copiar coords

---

## ✅ Testing Manual Completado (2026-04-24 Session 11)

| # | Test | Resultado | Detalles |
|---|------|-----------|----------|
| 1 | Tabla visible con columnas | ✅ PASS | ⚠️ y 📋 visibles en todas las filas |
| 2 | Click ⚠️ abre modal | ✅ PASS | WeatherReportModal abre correctamente, muestra predicción |
| 3 | Envío reporte | ✅ PASS | Toast "✓ Reporte enviado correctamente", Firestore doc: g5L5LKdHRC6vk1dPejuS |
| 4 | Click 📋 copiar coords | ✅ PASS | Botón funciona, feedback visual confirmado |
| 5 | LocationDetail sin ⚠️ | ✅ PASS | Modal abierto, NO tiene botón ⚠️, mantiene 📋 copiar coords |
| 6 | Firestore schema | ✅ PASS | `weather_reports` collection con source='prediction-table', TTL 30d, todos campos OK |

**Todos los casos de prueba: ✅ PASARON**

---

## 🏗️ Decisiones de Arquitectura Aplicadas

- **D-031 (NUEVA):** Modal único WeatherReportModal para tabla (NO reutilizar ClassificationReportModal)
  - Propósito diferente: reportar clima real vs reportar fallo
  - Permite mismo clima predicho (sin validación)
  - Schema Firestore separado: `weather_reports` (no `classification_reports`)
  - Razón: Semántica distinta, uso separado para analytics

---

## 📝 Documentación Generada

- Plan completo en: `C:\Users\geova\.claude\plans\majestic-yawning-dahl.md`
- Commit message detallado: `44d94df`

---

## ⏭️ Próximos Pasos

1. ✅ Testing manual completado (Session 11)
2. 📋 **NEW: US-1107 — Lookback 12h en Tabla Predictiva (Session 12)**
3. Merge a `develop` (post-1107)
4. Cerrar Sprint 10

---

# 📋 US-1107: Lookback 12 Horas (Session 12)

**Sprint:** 10 (Ampliación)  
**Story Points:** 3  
**Estado:** ✅ COMPLETADA | BUILD OK | TESTING MANUAL PASADO
**Documentación:** [src/docs/sprints/sprint-10/12-US-1107-Lookback12h.md](../../src/docs/sprints/sprint-10/12-US-1107-Lookback12h.md)
**Commit:** c5191c2

## ¿Qué es?
Implementar vista expandible "lookback de 12 horas" en tabla de predicciones. Para cada predicción, mostrar las 12 predicciones ANTERIORES que también predijeron esa misma hora.

**Ejemplo:**
```
Fila actual: Pier 39 | 04:00 | Predicción: "sunny" | Real: "cloudy"

Expandido (lookback):
  [0.5h atrás]  03:00 predijo para 04:00: "cloudy" ✗
  [1.5h atrás]  02:00 predijo para 04:00: "sunny" ✓
  [2.2h atrás]  01:00 predijo para 04:00: "cloudy" ✗
  ... (hasta 12h atrás)
```

## Cambios Requeridos
1. Implementar `generateLookback()` en predictionAnalyticsService.ts (+80 líneas)
2. Renderizar lookback expandible en PredictionAnalysisTable.tsx (+40 líneas)
3. CSS para estilos (gris/verde según acierto)

## Arquitectura
- **Cálculo:** Durante `fetchPredictions()` (una sola vez)
- **Performance:** O(N²) aceptable (450 forecasts × 12h = 5.4K ops)
- **Edge cases:** Forecasts sin snapshots, sin reportes, <12h data
- **Límite:** Máximo 12 items, ordenado desc por horasAgo

## Checklist de Implementación
- [x] `generateLookback()` implementada y probada
- [x] PredictionAnalysisTable renderiza expandible
- [x] Estilos: ✓ verde, ✗ gris
- [x] Build sin errores
- [x] Commit realizado (c5191c2)
- [ ] Merge (PENDIENTE — hay bugs)

---

## 🐛 BUGS IDENTIFICADOS (Session 12, a investigar en Session 13)

| # | Descripción | Severidad | Línea de Investigación |
|---|-------------|-----------|------------------------|
| BUG-001 | Forecasts se borran o dejan de mostrar | 🔴 ALTO | Validar fetchPredictions(), caché sync |
| BUG-002 | Warning: "Forecast for X has no snapshots" | 🟡 MEDIO | `predictionAnalyticsService.ts:55` — snapshots.length === 0 |
| BUG-003 | Lookback no muestra datos aunque existan | 🔴 ALTO | generateLookback() lógica o datos en Firestore |

### BUG-001: Forecasts desaparecen
```
Síntoma: Tabla muestra 20 predicciones, luego se vacía o muestra parcial
Posibles causas:
- fetchPredictions() retorna array vacío
- caché sync está eliminando datos
- TTL Firestore está borrando rápido
```

### BUG-002: Warning sin snapshots
```
Consola: [PredictionAnalytics] Forecast for auckland-waterfront has no snapshots
Ubicación: predictionAnalyticsService.ts:55
Causa: documento sin snapshots array (D-018 implementado pero hay edge cases)
```

### BUG-003: Lookback vacío
```
Síntoma: Botones LOOKBACK disabled "SIN DATOS" aunque exista histórico
Posibles causas:
- generateLookback() retorna array vacío
- Datos de Firestore no tiene estructura esperada
- Validación timestamp fallando silenciosamente
```

---

**Session 10:** Implementación | **Session 11:** Testing & Validation  
**User:** Geovanny M | **Repo:** pokeweather  
**Rama:** sprint-10 (ready to merge + US-1107)  
**Última actualización:** 2026-04-24 (Session 12 - US-1107 especificación iniciada)

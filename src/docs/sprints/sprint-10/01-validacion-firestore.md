# 📊 Prediction Validation & Classification Reporting — Sprint 10

**Última actualización:** 2026-04-19  
**Sprint:** 10  
**Propósito:** Especificar cómo se validan predicciones vs clima real

---

## 🎯 Objetivo

La app predice condiciones climáticas basándose en AccuWeather. Necesitamos:
1. **Guardar lo que la app predijo** (`calculated_condition`)
2. **Capturar lo que realmente ocurrió** (reporte manual del usuario)
3. **Comparar** ambos valores para medir precisión

---

## 📋 Flujo Completo

### Fase 1: Predicción (Background)

```
1. Usuario abre app a las 8:06 AM
   ↓
2. App consulta AccuWeather
   ↓
3. AccuWeather retorna 12 horas de pronóstico:
   [
     { hour: 9,  condition: "sunny",  ... },    ← snapshots[0]
     { hour: 10, condition: "cloudy", ... },    ← snapshots[1]
     ... (11 más)
   ]
   ↓
4. App aplica algoritmo a snapshots[0]:
   calculated_condition = "sunny"
   ↓
5. Firestore guarda ForecastDoc:
   {
     city_id: "pier-39",
     date_hour: "2026-04-19-08",
     calculated_condition: "sunny",     ← Lo que mostró
     snapshots: [12 objetos],           ← Datos puros de AccuWeather
     created_at: 1713607560
   }
   ↓
6. UI muestra a usuario: "Pier 39 → SUNNY"
```

---

### Fase 2: Validación (Manual)

```
1. Usuario verifica el clima real en Pier 39
   ↓
2. Usuario constata: "Es CLOUDY, no sunny"
   ↓
3. Usuario abre TestingTools → "Reportar Error"
   ↓
4. Completa form:
   - Ciudad: Pier 39
   - Predicción: sunny (auto-rellenado)
   - Realidad: cloudy (selecciona usuario)
   - Comentario: "Cielo muy nublado"
   ↓
5. App crea ClassificationReport en Firestore:
   {
     city_id: "pier-39",
     date_hour: "2026-04-19-08",
     classified_as: "sunny",           ← Lo que la app dijo
     should_be: "cloudy",              ← Lo que fue real
     timestamp: 2026-04-19T14:30:00Z,  ← Cuándo reportó
     reporter: "user",
     comment: "Cielo muy nublado",
     ttl: (now + 30 días)
   }
   ↓
6. BigQuery Extension captura automáticamente:
   - Firestore cambio → BigQuery log
   - Looker Studio analiza precisión
```

---

## 🗂️ Estructura de Datos

### ForecastDoc (Lo que se predijo)

```typescript
interface ForecastDoc {
  city_id: string                   // "pier-39"
  city_name: string                 // "Pier 39"
  date_hour: string                 // "2026-04-19-08" (fecha_hora redondeada)
  
  // ✅ LA PREDICCIÓN (resultado del algoritmo)
  calculated_condition: string      // "sunny" | "cloudy" | "rainy" | etc
  
  // 📦 DATOS CRUDOS (12 horas de AccuWeather)
  snapshots: [
    {
      hour: 9,
      classified: "sunny",          // snapshots[0] → se usa para calculated_condition
      types: ["normal", "grass"],
      temperature_c: 16.2,
      wind_kmh: 5.0,
      ... (otros campos AccuWeather)
    },
    // ... (11 más)
  ]
  
  // METADATOS
  created_at: Timestamp             // Cuándo se hizo la consulta
  ttl: Timestamp                    // Auto-delete after 7 días
}

Path: /city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}
```

### ClassificationReport (Lo que fue real)

```typescript
interface ClassificationReport {
  city_id: string                   // "pier-39"
  city_name: string                 // "Pier 39"
  date_hour: string                 // "2026-04-19-08" (hora del pronóstico)
  
  // LO QUE LA APP PREDIJO
  classified_as: string             // "sunny" (calculado_condition original)
  classified_types: string[]        // ["normal", "grass"]
  
  // LO QUE REALMENTE FUE
  should_be: string                 // "cloudy" (corrección del usuario)
  should_be_types: string[]         // ["water", "flying"]
  
  // CONTEXTO DEL PRONÓSTICO
  temperature_c: number             // 16.2 (temp que se pronosticó)
  wind_kmh: number                  // 5.0 (viento que se pronosticó)
  
  // VALIDACIÓN
  comment: string                   // "Cielo muy nublado"
  timestamp: Timestamp              // Cuándo el usuario reportó
  reporter: "user"                  // Siempre "user" (manual)
  ttl: Timestamp                    // Auto-delete after 30 días
}

Path: /classification_reports/{report_id}
```

---

## 📊 Tabla de Predicciones (UI)

La tabla muestra una **fila por ForecastDoc** (consulta):

| Hora UTC | Ciudad | Predicción | Realidad | Resultado | Lookback 12h |
|----------|--------|-----------|----------|-----------|-------------|
| 08:06 AM | Pier 39 | ☀️ sunny | ☁️ cloudy | ❌ | [Datos históricos] |
| 04:20 PM | Pier 39 | 🌧️ rainy | ☀️ sunny | ❌ | [Datos históricos] |

**Campos:**
- **Predicción:** `forecast.calculated_condition` (lo que mostró)
- **Realidad:** `report.should_be` (lo que fue según usuario)
- **Resultado:** `prediction === reality ? "✅" : "❌"`
- **Lookback 12h:** Predicciones anteriores para esa hora (últimas 12 consultas)

---

## 🔄 Lookback 12h (Histórico de Predicciones)

Para cada hora, mostramos cómo la app la predijo en las últimas 12 consultas:

```
Hora: 9 AM (Lookback)

Consulta hace 12h (8 PM anterior):
  - Predijo para 9 AM: "sunny" ✅ (fue correcto)
  
Consulta hace 11h (9 PM anterior):
  - Predijo para 9 AM: "sunny" ✅ (fue correcto)
  
...
  
Consulta hace 1h (7 AM hoy):
  - Predijo para 9 AM: "cloudy" ❌ (fue sunny)
  
Consulta hace 0h (8 AM hoy):
  - Predijo para 9 AM: "sunny" ❌ (fue cloudy) ← ACTUAL
```

El lookback se construye buscando todos los `snapshots` de consultas anteriores que contengan `hour: 9`, y comparando su predicción con el `should_be` reportado.

---

## 🎬 Timeline de Datos

```
Timeline: 2026-04-19

08:06 AM
  └─ Consulta 1 → ForecastDoc (date_hour: "2026-04-19-08")
     snapshots: [9 AM sunny, 10 AM cloudy, ..., 8 PM rainy]
     calculated_condition: "sunny"

09:06 AM
  └─ Consulta 2 → ForecastDoc (date_hour: "2026-04-19-09")
     snapshots: [10 AM cloudy, 11 AM sunny, ..., 9 PM rainy]
     calculated_condition: "cloudy"

...

4:20 PM
  └─ Usuario reporta: "8 AM fue cloudy, no sunny"
     ClassificationReport created
     ├─ date_hour: "2026-04-19-08"
     ├─ classified_as: "sunny" (de ForecastDoc)
     └─ should_be: "cloudy" (del usuario)

...

8 PM
  └─ Consulta final del día → ForecastDoc (date_hour: "2026-04-19-20")
```

---

## ✅ Criterios de Precisión

**Acierto:** `calculated_condition === should_be` (reportado)

**Ejemplos:**
- ✅ Predijo "sunny" → Usuario confirma "sunny" → **Acierto**
- ❌ Predijo "sunny" → Usuario confirma "cloudy" → **Fallo**
- ⏳ Predijo "sunny" → Usuario aún no reporta → **Sin validar**

**Agregación:**
```
Precisión global = (Aciertos / Total_Reportados) × 100

Pier 39: 87 aciertos / 100 reportados = 87%
Sydney: 92 aciertos / 100 reportados = 92%
Moscow: 70 aciertos / 100 reportados = 70%
```

---

## 🔧 Implementación

### Servicio: `firebaseWeatherService.ts`

```typescript
export async function saveCityForecast(
  city: City,
  snapshots: ForecastSnapshot[] = []
): Promise<void> {
  // ...
  
  // Calcular predicted_condition de snapshots[0]
  const calculatedCondition = snapshots.length > 0
    ? (snapshots[0].classified || 'Unknown')
    : 'Unknown'
  
  const forecastDoc: ForecastDoc = {
    city_id: city.id,
    city_name: city.name,
    // ...
    snapshots,
    calculated_condition: calculatedCondition,
    ttl: Timestamp.fromDate(ttl),
    created_at: Timestamp.now(),
  }
  
  // Guardar a Firestore
  await setDoc(docRef, forecastDoc)
}
```

### Servicio: `predictionAnalyticsService.ts`

```typescript
export async function fetchPredictions(): Promise<PredictionRow[]> {
  const forecasts = await getRecentForecasts('24h')
  const reports = await getRecentClassificationReports(24)
  
  // Por cada ForecastDoc
  forecasts.forEach(forecast => {
    // Tomar SOLO snapshots[0]
    const snapshot = forecast.snapshots[0]
    
    // Buscar reporte de validación
    const report = reportIndex.get(`${forecast.city_id}|${forecast.date_hour}`)
    
    // Crear fila
    const row: PredictionRow = {
      queryTime: forecast.created_at,
      hour: snapshot.hour,
      prediction: forecast.calculated_condition,      // Lo que mostró
      actual: report?.should_be ?? null,              // Lo que fue
      correct: report ? forecast.calculated_condition === report.should_be : null,
      lookback12h: generateLookback(...)              // Histórico
    }
    
    rows.push(row)
  })
}
```

---

## 📝 Notas Importantes

1. **`calculated_condition` se calcula UNA SOLA VEZ** cuando se guarda el ForecastDoc
   - Es el valor que la app mostró al usuario
   - No cambia retroactivamente

2. **`snapshots[]` contiene 12 horas sin procesar** de AccuWeather
   - Se guardan completos para análisis histórico
   - BigQuery los expande para análisis agregado

3. **El lookback busca snapshots ANTERIORES**
   - Ejemplo: para validar "9 AM", busca `snapshots.find(s => s.hour === 9)` en documentos previos
   - Esto construye el histórico de predicciones para esa hora

4. **ClassificationReport se crea MANUALMENTE**
   - Solo cuando el usuario reporte una discrepancia
   - Si no hay reporte, la predicción queda "sin validar"

---

## 🔗 Referencias

- **Data Schema:** [`10-firestore-data-schema.md`](../architecture/10-firestore-data-schema.md)
- **Firestore Setup:** [`US-1001-FirebaseExtensionBigquery.md`](./us/US-1001-FirebaseExtensionBigquery.md)
- **Cleanup Guide:** [`FIRESTORE-CLEANUP-GUIDE.md`](./FIRESTORE-CLEANUP-GUIDE.md)

---

**Creado:** 2026-04-19  
**Última actualización:** 2026-04-19  
**Estado:** ✅ Implementado

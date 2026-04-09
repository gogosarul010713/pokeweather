# 📈 Visualizaciones y Flujos de Datos

**Propósito:** Entender cómo fluyen los datos a través del sistema  
**Audience:** Implementadores de US-801  
**Última actualización:** 2026-04-08

---

## 1️⃣ Flujo Completo: AccuWeather → Firestore

### Línea de tiempo (1 ciclo = 1 hora)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CICLO HORARIO COMPLETO                         │
│                    (Ejecución cada HH:00 UTC)                          │
└─────────────────────────────────────────────────────────────────────────┘

T=0ms      T=500ms        T=3000ms        T=4000ms        T=5000ms
│          │              │               │               │
├─ START   ├─ Todas       ├─ Procesar    ├─ Guardar en   ├─ COMPLETE
│ Cargar   │  94 ciudades │  API + clase  │  Firestore    │
│ ciudades │  cargadas    │  weather      │  (async)      │
│          │  (batch de   │  enriquecidas │               │
│          │  5 paralelo) │  en Zustand   │               │
│          │              │               │               │
│          │              ├─ UI UPDATE    │               │
│          │              │  (mapas + pins)               │
│          │              │               │               │
│          │              │               ├─ 94 writes    ├─ Firestore
│          │              │               │  a Firestore  │  persisted
│          │              │               │  (1 per city) │
│          │              │               │               │
│          │              ├─ No bloquea   │               │
│          │              │  en espera    │               │
│          │              │               │               │
└──────────┴──────────────┴───────────────┴───────────────┴──────────────┘

            ESPERAMOS HASTA SIGUIENTE HORA Y REPETIMOS
            ↓
            HH:00 + 60min → HH+1:00 (siguiente ciclo)
```

---

## 2️⃣ Transformación de Datos: Ejemplo Concreto

### Caso: San Francisco, Hora 14-16 UTC

```
╔════════════════════════════════════════════════════════════════════════╗
║                          HORA 14:00 UTC                               ║
╚════════════════════════════════════════════════════════════════════════╝

FASE 1: API Response (AccuWeather - RAW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "DateTime": "2026-04-08T14:00:00",
  "EpochDateTime": 1712606400,
  "WeatherIcon": 3,           ← AccuWeather iconId
  "IconPhrase": "Partly Sunny",
  "Temperature": { "Value": 18.5 },
  "RealFeelTemperature": { "Value": 16.2 },
  "RelativeHumidity": 65,
  "Wind": {
    "Speed": { "Value": 9.0 },
    "Gust": { "Value": 12.5 }
  },
  "Visibility": { "Value": 10.0 },
  "Pressure": { "Value": 1013 }
}

                            ↓ weatherService.ts
                            ↓ resolveCondition()

FASE 2: Clasificación (PGO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lookup WEATHER_TRANSLATIONS[3]:
  ├─ iconText: "Partly Sunny"
  ├─ canWindy: true
  ├─ pgoCondition: "partly"

Check viento:
  ├─ windKmh: 9.0 > 29?     → NO
  ├─ gustKmh: 12.5 > 31?    → NO
  ├─ isWindy: false
  ├─ classified: "partly"   ← SIN OVERRIDE

Lookup CONDITION_TO_TYPES["partly"]:
  └─ types: ["normal", "rock"]

                            ↓ batchWeatherService.ts
                            ↓ enrichCityWithWeatherData()

FASE 3: City Enriquecida (Zustand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  ...STATIC_FIELDS,
  condition: "partly",
  boostedTypes: ["normal", "rock"],
  tempC: 18.5,
  feelsLike: 16.2,
  humidity: 65,
  windKmh: 9.0,
  gustKmh: 12.5,
  visibilityKm: 10.0,
  localTime: "06:45",          ← Calculada (timezone -8)
  weatherIcon: 3,
  isExtreme: false,
  updatedAt: 1712606400000
}

                            ↓ firebaseWeatherService.ts (NEW)
                            ↓ saveCityForecast()

FASE 4: ForecastSnapshot (para Firestore)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  hour: 14,
  raw_condition_code: 3,
  raw_condition_text: "Partly Sunny",
  classified: "partly",
  types: ["normal", "rock"],
  temperature_c: 18.5,
  wind_kmh: 9.0,
  precipitation_mm: 0,
  humidity_pct: 65,
  is_windy_override: false     ← Registro que viento NO lo cambió
}

                            ↓ Firestore.setDoc()

FASE 5: Firestore Document
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Path: /city_weather/san-francisco/forecasts/2026-04-08-14

{
  city_id: "san-francisco",
  city_name: "San Francisco",
  country: "EE.UU.",
  region: "america",
  lat: 37.7749,
  lon: -122.4194,
  date_hour: "2026-04-08-14",
  snapshots: [          ← Array de 12 (de hora 0-23)
    {
      hour: 14,
      raw_condition_code: 3,
      raw_condition_text: "Partly Sunny",
      classified: "partly",
      types: ["normal", "rock"],
      temperature_c: 18.5,
      wind_kmh: 9.0,
      precipitation_mm: 0,
      humidity_pct: 65,
      is_windy_override: false
    },
    { ... hora 15 ... },
    { ... hora 16 ... },
    { ... más horas hasta 23 ... }
  ],
  ttl: Timestamp(1712954400),    ← 7 días desde ahora
  created_at: Timestamp(1712606400)
}

```

---

## 3️⃣ Ejemplo con Override por VIENTO

### Misma ciudad, 1 hora después

```
╔════════════════════════════════════════════════════════════════════════╗
║                          HORA 15:00 UTC                               ║
║                    (VIENTO FUERTE → OVERRIDE)                         ║
╚════════════════════════════════════════════════════════════════════════╝

FASE 1: API Response (RAW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "WeatherIcon": 3,           ← SIGUE SIENDO "Partly Sunny"
  "IconPhrase": "Partly Sunny",
  "Temperature": { "Value": 19.2 },
  "Wind": {
    "Speed": { "Value": 32.0 },    ← VIENTO FUERTE!
    "Gust": { "Value": 45.2 }      ← RÁFAGA FUERTE!
  },
  "RelativeHumidity": 62,
  ...
}

FASE 2: Clasificación (PGO) - CON OVERRIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lookup WEATHER_TRANSLATIONS[3]:
  ├─ pgoCondition: "partly"
  ├─ canWindy: true              ← PERMITE OVERRIDE
  └─ (precipitación: false)

Check viento:
  ├─ windKmh: 32.0 > 29?        → ✅ YES!
  ├─ gustKmh: 45.2 > 31?        → ✅ YES!
  ├─ isWindy: true
  ├─ classified: "windy"         ← 🌪️ OVERRIDE!

Lookup CONDITION_TO_TYPES["windy"]:
  └─ types: ["flying", "dragon", "psychic"]

FASE 4: ForecastSnapshot (para Firestore)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  hour: 15,
  raw_condition_code: 3,                    ← Sigue siendo 3 (raw)
  raw_condition_text: "Partly Sunny",       ← Sigue siendo "Partly"
  classified: "windy",                      ← ¡CAMBIÓ! (clasificado)
  types: ["flying", "dragon", "psychic"],   ← NUEVOS TIPOS
  temperature_c: 19.2,
  wind_kmh: 32.0,
  precipitation_mm: 0,
  humidity_pct: 62,
  is_windy_override: true                   ← ⚠️ FLAG IMPORTANTE
}

                        ↓ Firestore

FIRESTORE DOCUMENT (mismo path, diferente snapshots[15])
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

snapshots: [
  { hour: 14, classified: "partly", is_windy_override: false },
  { hour: 15, classified: "windy",  is_windy_override: true },  ← CAMBIÓ
  { hour: 16, ... },
  ...
]
```

---

## 4️⃣ Comparación: Diferentes Condiciones Base

```
┌──────────────────────────────────────────────────────────────────────┐
│               MAPEO: IconCode → PGO Condition                        │
│                  (Con posibilidad de WINDY override)                 │
└──────────────────────────────────────────────────────────────────────┘

IconCode=3 ("Partly Sunny")
├─ canWindy: true
├─ base: "partly"
├─ SI viento < 29 km/h  → classified = "partly"  ✓
└─ SI viento ≥ 29 km/h  → classified = "windy"   🌪️

IconCode=18 ("Rain")
├─ canWindy: false                        ← CLAVE
├─ base: "rain"
├─ SI viento < 29 km/h  → classified = "rain"   ✓
├─ SI viento ≥ 29 km/h  → classified = "rain"   ✓ (NO override!)
└─ NUNCA becomes "windy"                  ✓✓

IconCode=32 ("Windy")
├─ canWindy: true
├─ base: "windy"
└─ classified = "windy" (ya es, sin cambio)

IconCode=11 ("Fog")
├─ canWindy: false
├─ base: "fog"
└─ classified = "fog" (SIEMPRE, incluso con viento)
```

---

## 5️⃣ Tabla Comparativa: Snapshot vs Doc

```
┌────────────────────────────────────────────────────────────────────┐
│              ForecastSnapshot vs ForecastDoc                       │
└────────────────────────────────────────────────────────────────────┘

PROPIEDAD           SNAPSHOT         DOC              PROPÓSITO
──────────────────────────────────────────────────────────────────────
Ubicación          Array[12]        Raíz             Cada hora vs documento
Cantidad            12              1                12 snapshots por doc
Rango hora          0-23            N/A              Todas las horas del día
city_id             ❌              ✅               Identificar ciudad
snapshots[]         N/A (es array)   ✅              Contener 12 snapshots
ttl                 ❌              ✅               Limpieza automática
created_at          ❌              ✅               Auditoría

EJEMPLO SNAPSHOT:
{
  hour: 14,
  raw_condition_code: 3,
  classified: "partly",
  types: ["normal", "rock"],
  temperature_c: 18.5,
  wind_kmh: 9.0,
  humidity_pct: 65,
  is_windy_override: false
}

EJEMPLO DOC (contiene 12 snapshots):
{
  city_id: "san-francisco",
  city_name: "San Francisco",
  region: "america",
  date_hour: "2026-04-08-14",
  snapshots: [
    { hour: 0,  ... },
    { hour: 1,  ... },
    ...
    { hour: 14, ... },  ← Snapshot anterior
    { hour: 15, ... },
    ...
    { hour: 23, ... }
  ],
  ttl: Timestamp(1712954400),
  created_at: Timestamp(1712606400)
}
```

---

## 6️⃣ Escritura en Firestore: Paso-a-Paso

### Función `saveCityForecast(city, snapshots)`

```typescript
// INPUT:
const city = {
  id: "san-francisco",
  name: "San Francisco",
  country: "EE.UU.",
  region: "america",
  lat: 37.7749,
  lon: -122.4194,
  // ... (38 campos más)
}

const snapshots = [
  { hour: 0,  classified: "sunny",  types: [...], ... },
  { hour: 1,  classified: "sunny",  types: [...], ... },
  // ... (10 más)
  { hour: 14, classified: "partly", types: [...], ... },
  { hour: 15, classified: "windy",  types: [...], ... },  ← Override
  { hour: 16, classified: "cloudy", types: [...], ... },
  // ... (8 más)
]

// PASO 1: Generar date_hour actual
const now = new Date()                     // 2026-04-08T14:30:00Z
const dateHour = "2026-04-08-14"           // YYYY-MM-DD-HH

// PASO 2: Calcular TTL (7 días)
const ttl = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
// → 2026-04-15T14:30:00Z

// PASO 3: Construir ForecastDoc
const forecastDoc = {
  city_id: city.id,
  city_name: city.name,
  country: city.country,
  region: city.region,
  lat: city.lat,
  lon: city.lon,
  date_hour: dateHour,
  snapshots,                             // Array de 12
  ttl: Timestamp.fromDate(ttl),
  created_at: Timestamp.now(),
}

// PASO 4: Escribir en Firestore
const docRef = doc(
  db,
  'city_weather',
  city.id,                               // Document: city_id
  'forecasts',
  dateHour                               // Document: YYYY-MM-DD-HH
)
await setDoc(docRef, forecastDoc)

// PASO 5: Path final en Firestore
// /city_weather/san-francisco/forecasts/2026-04-08-14

// OUTPUT EN FIRESTORE CONSOLE:
// ✅ Document created: city_weather/san-francisco/forecasts/2026-04-08-14
```

---

## 7️⃣ Validación: Qué Puede Salir Mal

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PUNTOS DE VALIDACIÓN CRÍTICA                     │
└─────────────────────────────────────────────────────────────────────┘

1. ICONO INVÁLIDO
   ├─ Entrada: WeatherIcon: 99 (no existe)
   ├─ Lookup: WEATHER_TRANSLATIONS[99] → undefined
   ├─ Riesgo: ❌ Error en getBaseCondition()
   └─ Solución: Fallback a "cloudy" (línea 151, weatherService.ts)

2. VIENTO PERO CANWINDY=FALSE
   ├─ Entrada: IconCode=18 (Rain, canWindy:false), Wind=35 km/h
   ├─ Lógica: translation.canWindy=false → NO override
   ├─ Esperado: classified="rain", is_windy_override=false
   └─ ✓ Correcto: Lluvia se mantiene (no se convierte a windy)

3. ARRAY SNAPSHOTS DE TAMAÑO INCORRECTO
   ├─ Riesgo: ❌ Si snapshots.length !== 12
   ├─ Causa: Línea en useWeather.ts que construye array incompleto
   └─ Validación: Assert snapshots.length === 12 antes de saveForecast()

4. TIMESTAMP FIRESTORE INCORRECTO
   ├─ ❌ Mal: new Date() → number (epoch ms)
   ├─ ✓ Bien: Timestamp.fromDate(date)
   ├─ ✓ Bien: Timestamp.now()
   └─ Firestore rechaza types.Date() nativos

5. TTL MAL CALCULADO
   ├─ Riesgo: TTL = ahora (nunca se elimina)
   ├─ Solución: TTL = ahora + 7 días = now + 604,800,000 ms
   └─ Verificación: TTL siempre > now

6. DOCUMENT PATH INCORRECTO
   ├─ ❌ Mal: /forecasts/{city_id} (invertido)
   ├─ ✓ Bien: /city_weather/{city_id}/forecasts/{date_hour}
   └─ Firestore no permitirá queries si path es incorrecto

7. TIPOS VAKÍOS
   ├─ Riesgo: types: [] (sin tipos boosteados)
   ├─ Causa: CONDITION_TO_TYPES[classified] retorna []?
   └─ Validación: Nunca permitir types.length === 0
```

---

## 8️⃣ Integración en useWeather.ts

```typescript
// Ubicación: src/hooks/useWeather.ts

export function useWeather() {
  // ... código existente ...

  const loadCities = async () => {
    // 1. Cargar ciudades con API (EXISTENTE)
    const result = await loadCitiesInBatch(cities, apiKey)
    setLoadingStatus('ready')

    // 2. NUEVO: Para cada ciudad cargada exitosamente
    //    Persistir en Firestore (async/background)
    result.successful.forEach((enrichedCity) => {
      // Construir snapshots a partir de City
      const snapshots = buildSnapshots(enrichedCity)  // Helper NEW

      // Llamar async (sin await — no bloquea)
      saveCityForecast(enrichedCity, snapshots).catch((err) => {
        console.warn('[Firebase] Error guardando:', enrichedCity.id, err)
        // Falla silenciosa — no reintenta
      })
    })

    // 3. Actualizar Zustand (EXISTENTE)
    setSelectedCity(result.successful[0] || null)
  }

  return { loadCities, ... }
}

// HELPER: Construir array snapshots[12] a partir de City
function buildSnapshots(city: City): ForecastSnapshot[] {
  // PROBLEMA: City solo tiene "ahora" (1 hora)
  // Necesitamos 12 snapshots (12 horas)
  //
  // SOLUCIÓN: AccuWeather API retorna 12 horas
  //           Almacenar en City o derivar de cache

  // TBD: Diseñar dónde almacenar las 12 horas
  //      ¿En City.forecast[]? ¿En caché? ¿En una variable local?
}
```

⚠️ **DISEÑO PENDING:** ¿Dónde almacenar las 12 horas de pronóstico en City?
- **Opción A:** Agregar `forecast: ForecastSnapshot[]` a tipo City
- **Opción B:** Guardar en variable local en useWeather
- **Opción C:** Re-derivar desde cache (risky, duplica lógica)

---

## 9️⃣ Índices de Calidad

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MÉTRICAS DE PERSISTENCIA                        │
└─────────────────────────────────────────────────────────────────────┘

ESCRITURAS POR CICLO:
├─ Ciudades: 94
├─ Documentos por ciudad: 1
├─ Total writes/ciclo: 94
├─ Ciclos por día (1 c/hora × 24): 24
└─ Total writes/día: 94 × 24 = 2,256

FIRESTORE FREE TIER: 20,000 writes/día
├─ Nuestro consumo: 2,256/día = 11.28%
└─ Margen: ✅ Muy cómodo (87.72%)

ALMACENAMIENTO POR DOC:
├─ Documento base: ~300 bytes
├─ Snapshots (12 × 150 bytes): 1,800 bytes
├─ Total por doc: ~2,100 bytes
├─ Documentos por ciudad/7 días: 24 × 7 = 168
├─ Storage por ciudad/7 días: 2,100 × 168 = 352,800 bytes (343 KB)
└─ Storage total (94 ciudades × 343 KB): ~32.2 MB

FIRESTORE FREE TIER: 1 GB
├─ Nuestro consumo: ~32 MB
└─ Margen: ✅ Excelente (96.8%)

QUERIES:
├─ Queries por usuario/día: ~10
├─ Free tier: 50,000 reads/día
└─ Margen: ✅ Infinito

RECOMENDACIÓN:
├─ TTL=7 días es CORRECTO
├─ Auto-delete evita acumulación ilimitada
└─ Revisitar si llega a >100 GB
```

---

## 🔟 Checklist Implementación

```
ANTES DE EMPEZAR US-801:

□ Leer este documento completamente
□ Confirmar schema ForecastSnapshot (12 campos)
□ Confirmar schema ForecastDoc (10 campos)
□ Verificar WEATHER_TRANSLATIONS (44 iconos)
□ Verificar CONDITION_TO_TYPES (7 condiciones)
□ Entender canWindy=true vs false
□ Entender WINDY override (29/31 km/h)
□ Confirmar Firestore está inicializado (US-804 ✓)
□ Confirmar env vars en .env.local

DURANTE IMPLEMENTACIÓN:

□ Crear firebaseWeatherService.ts
□ Función saveCityForecast(city, snapshots)
□ Integrar en useWeather.ts (async/background)
□ Validar snapshots.length === 12
□ Validar types.length > 0
□ Timestamp correctos (Firestore SDK)
□ TTL = now + 7 días
□ date_hour formato YYYY-MM-DD-HH
□ Path correcto /city_weather/{id}/forecasts/{dh}
□ Error handling: falla silenciosa

POST-IMPLEMENTACIÓN:

□ Firestore Console: documentos aparecen
□ Firestore Console: snapshots[12] populados
□ Browser console: sin errores
□ Build: npm run build ✅
□ E2E test: simular ciclo completo
□ Verificar write count en Firestore dashboard
```

---

**Documento generado automáticamente**  
Sprint 8 — US-801 Preparation  
v1.0

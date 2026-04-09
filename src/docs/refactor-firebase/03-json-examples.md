# 📝 Ejemplos JSON Reales — Copiar/Pegar

**Propósito:** Tener ejemplos concretos para validar estructura en Firestore  
**Cómo usar:** Copiar → pegar en Firestore Console → validar que la estructura sea correcta

---

## 1️⃣ Ejemplo Completo: ForecastDoc (San Francisco)

**Path:** `/city_weather/san-francisco/forecasts/2026-04-08-14`

```json
{
  "city_id": "san-francisco",
  "city_name": "San Francisco",
  "country": "EE.UU.",
  "region": "america",
  "lat": 37.7749,
  "lon": -122.4194,
  "date_hour": "2026-04-08-14",
  "snapshots": [
    {
      "hour": 0,
      "raw_condition_code": 33,
      "raw_condition_text": "Clear",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 12.5,
      "wind_kmh": 8.3,
      "precipitation_mm": 0,
      "humidity_pct": 72,
      "is_windy_override": false
    },
    {
      "hour": 1,
      "raw_condition_code": 34,
      "raw_condition_text": "Mostly Clear",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 12.1,
      "wind_kmh": 9.1,
      "precipitation_mm": 0,
      "humidity_pct": 74,
      "is_windy_override": false
    },
    {
      "hour": 2,
      "raw_condition_code": 35,
      "raw_condition_text": "Partly Cloudy",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 11.8,
      "wind_kmh": 8.7,
      "precipitation_mm": 0,
      "humidity_pct": 76,
      "is_windy_override": false
    },
    {
      "hour": 3,
      "raw_condition_code": 35,
      "raw_condition_text": "Partly Cloudy",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 11.5,
      "wind_kmh": 9.2,
      "precipitation_mm": 0,
      "humidity_pct": 77,
      "is_windy_override": false
    },
    {
      "hour": 4,
      "raw_condition_code": 38,
      "raw_condition_text": "Mostly Cloudy",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 11.2,
      "wind_kmh": 10.1,
      "precipitation_mm": 0,
      "humidity_pct": 78,
      "is_windy_override": false
    },
    {
      "hour": 5,
      "raw_condition_code": 38,
      "raw_condition_text": "Mostly Cloudy",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 11.0,
      "wind_kmh": 11.3,
      "precipitation_mm": 0,
      "humidity_pct": 79,
      "is_windy_override": false
    },
    {
      "hour": 6,
      "raw_condition_code": 6,
      "raw_condition_text": "Mostly Cloudy",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 11.5,
      "wind_kmh": 12.2,
      "precipitation_mm": 0,
      "humidity_pct": 78,
      "is_windy_override": false
    },
    {
      "hour": 7,
      "raw_condition_code": 3,
      "raw_condition_text": "Partly Sunny",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 13.0,
      "wind_kmh": 10.8,
      "precipitation_mm": 0,
      "humidity_pct": 74,
      "is_windy_override": false
    },
    {
      "hour": 8,
      "raw_condition_code": 2,
      "raw_condition_text": "Mostly Sunny",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 14.8,
      "wind_kmh": 9.5,
      "precipitation_mm": 0,
      "humidity_pct": 68,
      "is_windy_override": false
    },
    {
      "hour": 9,
      "raw_condition_code": 1,
      "raw_condition_text": "Sunny",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 16.2,
      "wind_kmh": 8.9,
      "precipitation_mm": 0,
      "humidity_pct": 64,
      "is_windy_override": false
    },
    {
      "hour": 10,
      "raw_condition_code": 1,
      "raw_condition_text": "Sunny",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 17.5,
      "wind_kmh": 9.2,
      "precipitation_mm": 0,
      "humidity_pct": 61,
      "is_windy_override": false
    },
    {
      "hour": 11,
      "raw_condition_code": 1,
      "raw_condition_text": "Sunny",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 18.2,
      "wind_kmh": 10.1,
      "precipitation_mm": 0,
      "humidity_pct": 59,
      "is_windy_override": false
    },
    {
      "hour": 12,
      "raw_condition_code": 2,
      "raw_condition_text": "Mostly Sunny",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 18.9,
      "wind_kmh": 11.0,
      "precipitation_mm": 0,
      "humidity_pct": 57,
      "is_windy_override": false
    },
    {
      "hour": 13,
      "raw_condition_code": 3,
      "raw_condition_text": "Partly Sunny",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 19.2,
      "wind_kmh": 11.8,
      "precipitation_mm": 0,
      "humidity_pct": 56,
      "is_windy_override": false
    },
    {
      "hour": 14,
      "raw_condition_code": 3,
      "raw_condition_text": "Partly Sunny",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 18.5,
      "wind_kmh": 9.0,
      "precipitation_mm": 0,
      "humidity_pct": 65,
      "is_windy_override": false
    },
    {
      "hour": 15,
      "raw_condition_code": 3,
      "raw_condition_text": "Partly Sunny",
      "classified": "windy",
      "types": ["flying", "dragon", "psychic"],
      "temperature_c": 19.2,
      "wind_kmh": 32.0,
      "precipitation_mm": 0,
      "humidity_pct": 62,
      "is_windy_override": true
    },
    {
      "hour": 16,
      "raw_condition_code": 4,
      "raw_condition_text": "Intermittent Clouds",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 18.8,
      "wind_kmh": 10.5,
      "precipitation_mm": 0,
      "humidity_pct": 64,
      "is_windy_override": false
    },
    {
      "hour": 17,
      "raw_condition_code": 3,
      "raw_condition_text": "Partly Sunny",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 18.1,
      "wind_kmh": 9.3,
      "precipitation_mm": 0,
      "humidity_pct": 67,
      "is_windy_override": false
    },
    {
      "hour": 18,
      "raw_condition_code": 35,
      "raw_condition_text": "Partly Cloudy",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 17.2,
      "wind_kmh": 8.8,
      "precipitation_mm": 0,
      "humidity_pct": 69,
      "is_windy_override": false
    },
    {
      "hour": 19,
      "raw_condition_code": 35,
      "raw_condition_text": "Partly Cloudy",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 16.5,
      "wind_kmh": 8.2,
      "precipitation_mm": 0,
      "humidity_pct": 71,
      "is_windy_override": false
    },
    {
      "hour": 20,
      "raw_condition_code": 38,
      "raw_condition_text": "Mostly Cloudy",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 15.8,
      "wind_kmh": 8.1,
      "precipitation_mm": 0,
      "humidity_pct": 72,
      "is_windy_override": false
    },
    {
      "hour": 21,
      "raw_condition_code": 38,
      "raw_condition_text": "Mostly Cloudy",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 15.1,
      "wind_kmh": 7.9,
      "precipitation_mm": 0,
      "humidity_pct": 74,
      "is_windy_override": false
    },
    {
      "hour": 22,
      "raw_condition_code": 37,
      "raw_condition_text": "Hazy Moonlight",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 14.5,
      "wind_kmh": 7.7,
      "precipitation_mm": 0,
      "humidity_pct": 75,
      "is_windy_override": false
    },
    {
      "hour": 23,
      "raw_condition_code": 34,
      "raw_condition_text": "Mostly Clear",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 13.8,
      "wind_kmh": 8.0,
      "precipitation_mm": 0,
      "humidity_pct": 76,
      "is_windy_override": false
    }
  ],
  "ttl": {
    "_seconds": 1712954400,
    "_nanoseconds": 0
  },
  "created_at": {
    "_seconds": 1712606400,
    "_nanoseconds": 0
  }
}
```

---

## 2️⃣ Ejemplo Compacto: ForecastSnapshot Individual

Solo el elemento para copia rápida:

```json
{
  "hour": 15,
  "raw_condition_code": 3,
  "raw_condition_text": "Partly Sunny",
  "classified": "windy",
  "types": ["flying", "dragon", "psychic"],
  "temperature_c": 19.2,
  "wind_kmh": 32.0,
  "precipitation_mm": 0,
  "humidity_pct": 62,
  "is_windy_override": true
}
```

---

## 3️⃣ Ejemplo Múltiples Ciudades

**Path structure:**
```
/city_weather/
├── london/forecasts/2026-04-08-14
├── tokyo/forecasts/2026-04-08-14
├── sydney/forecasts/2026-04-08-14
└── ... (94 ciudades)
```

### London (Lluvia)

```json
{
  "city_id": "london",
  "city_name": "London",
  "country": "Reino Unido",
  "region": "europa",
  "lat": 51.5074,
  "lon": -0.1278,
  "date_hour": "2026-04-08-14",
  "snapshots": [
    {
      "hour": 0,
      "raw_condition_code": 39,
      "raw_condition_text": "Partly Cloudy w/ Showers",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 9.2,
      "wind_kmh": 12.5,
      "precipitation_mm": 1.2,
      "humidity_pct": 85,
      "is_windy_override": false
    },
    {
      "hour": 1,
      "raw_condition_code": 40,
      "raw_condition_text": "Mostly Cloudy w/ Showers",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 9.0,
      "wind_kmh": 13.1,
      "precipitation_mm": 2.5,
      "humidity_pct": 87,
      "is_windy_override": false
    },
    {
      "hour": 2,
      "raw_condition_code": 12,
      "raw_condition_text": "Showers",
      "classified": "rain",
      "types": ["water", "electric", "bug"],
      "temperature_c": 8.8,
      "wind_kmh": 14.2,
      "precipitation_mm": 3.8,
      "humidity_pct": 89,
      "is_windy_override": false
    },
    {
      "hour": 3,
      "raw_condition_code": 12,
      "raw_condition_text": "Showers",
      "classified": "rain",
      "types": ["water", "electric", "bug"],
      "temperature_c": 8.5,
      "wind_kmh": 15.0,
      "precipitation_mm": 4.2,
      "humidity_pct": 90,
      "is_windy_override": false
    },
    {
      "hour": 4,
      "raw_condition_code": 12,
      "raw_condition_text": "Showers",
      "classified": "rain",
      "types": ["water", "electric", "bug"],
      "temperature_c": 8.3,
      "wind_kmh": 14.8,
      "precipitation_mm": 3.5,
      "humidity_pct": 89,
      "is_windy_override": false
    },
    {
      "hour": 5,
      "raw_condition_code": 14,
      "raw_condition_text": "Partly Sunny w/ Showers",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 8.2,
      "wind_kmh": 13.5,
      "precipitation_mm": 2.1,
      "humidity_pct": 88,
      "is_windy_override": false
    },
    {
      "hour": 6,
      "raw_condition_code": 14,
      "raw_condition_text": "Partly Sunny w/ Showers",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 8.4,
      "wind_kmh": 12.1,
      "precipitation_mm": 1.3,
      "humidity_pct": 86,
      "is_windy_override": false
    },
    {
      "hour": 7,
      "raw_condition_code": 6,
      "raw_condition_text": "Mostly Cloudy",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 9.1,
      "wind_kmh": 11.0,
      "precipitation_mm": 0.5,
      "humidity_pct": 83,
      "is_windy_override": false
    },
    {
      "hour": 8,
      "raw_condition_code": 4,
      "raw_condition_text": "Intermittent Clouds",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 9.8,
      "wind_kmh": 10.2,
      "precipitation_mm": 0,
      "humidity_pct": 80,
      "is_windy_override": false
    },
    {
      "hour": 9,
      "raw_condition_code": 3,
      "raw_condition_text": "Partly Sunny",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 10.5,
      "wind_kmh": 9.8,
      "precipitation_mm": 0,
      "humidity_pct": 77,
      "is_windy_override": false
    },
    {
      "hour": 10,
      "raw_condition_code": 3,
      "raw_condition_text": "Partly Sunny",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 11.2,
      "wind_kmh": 9.5,
      "precipitation_mm": 0,
      "humidity_pct": 74,
      "is_windy_override": false
    },
    {
      "hour": 11,
      "raw_condition_code": 2,
      "raw_condition_text": "Mostly Sunny",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 11.9,
      "wind_kmh": 9.2,
      "precipitation_mm": 0,
      "humidity_pct": 71,
      "is_windy_override": false
    },
    {
      "hour": 12,
      "raw_condition_code": 1,
      "raw_condition_text": "Sunny",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 12.5,
      "wind_kmh": 9.0,
      "precipitation_mm": 0,
      "humidity_pct": 69,
      "is_windy_override": false
    },
    {
      "hour": 13,
      "raw_condition_code": 2,
      "raw_condition_text": "Mostly Sunny",
      "classified": "sunny",
      "types": ["fire", "ground", "grass"],
      "temperature_c": 12.8,
      "wind_kmh": 8.8,
      "precipitation_mm": 0,
      "humidity_pct": 68,
      "is_windy_override": false
    },
    {
      "hour": 14,
      "raw_condition_code": 3,
      "raw_condition_text": "Partly Sunny",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 12.5,
      "wind_kmh": 9.5,
      "precipitation_mm": 0,
      "humidity_pct": 70,
      "is_windy_override": false
    },
    {
      "hour": 15,
      "raw_condition_code": 4,
      "raw_condition_text": "Intermittent Clouds",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 12.1,
      "wind_kmh": 10.1,
      "precipitation_mm": 0,
      "humidity_pct": 72,
      "is_windy_override": false
    },
    {
      "hour": 16,
      "raw_condition_code": 6,
      "raw_condition_text": "Mostly Cloudy",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 11.8,
      "wind_kmh": 10.5,
      "precipitation_mm": 0,
      "humidity_pct": 74,
      "is_windy_override": false
    },
    {
      "hour": 17,
      "raw_condition_code": 7,
      "raw_condition_text": "Cloudy",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 11.2,
      "wind_kmh": 10.8,
      "precipitation_mm": 0,
      "humidity_pct": 76,
      "is_windy_override": false
    },
    {
      "hour": 18,
      "raw_condition_code": 39,
      "raw_condition_text": "Partly Cloudy w/ Showers",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 10.8,
      "wind_kmh": 11.2,
      "precipitation_mm": 1.5,
      "humidity_pct": 79,
      "is_windy_override": false
    },
    {
      "hour": 19,
      "raw_condition_code": 40,
      "raw_condition_text": "Mostly Cloudy w/ Showers",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 10.2,
      "wind_kmh": 11.8,
      "precipitation_mm": 2.3,
      "humidity_pct": 82,
      "is_windy_override": false
    },
    {
      "hour": 20,
      "raw_condition_code": 12,
      "raw_condition_text": "Showers",
      "classified": "rain",
      "types": ["water", "electric", "bug"],
      "temperature_c": 9.8,
      "wind_kmh": 12.5,
      "precipitation_mm": 3.1,
      "humidity_pct": 85,
      "is_windy_override": false
    },
    {
      "hour": 21,
      "raw_condition_code": 12,
      "raw_condition_text": "Showers",
      "classified": "rain",
      "types": ["water", "electric", "bug"],
      "temperature_c": 9.5,
      "wind_kmh": 12.0,
      "precipitation_mm": 2.8,
      "humidity_pct": 87,
      "is_windy_override": false
    },
    {
      "hour": 22,
      "raw_condition_code": 40,
      "raw_condition_text": "Mostly Cloudy w/ Showers",
      "classified": "cloudy",
      "types": ["fairy", "fighting", "poison"],
      "temperature_c": 9.2,
      "wind_kmh": 11.5,
      "precipitation_mm": 1.9,
      "humidity_pct": 86,
      "is_windy_override": false
    },
    {
      "hour": 23,
      "raw_condition_code": 39,
      "raw_condition_text": "Partly Cloudy w/ Showers",
      "classified": "partly",
      "types": ["normal", "rock"],
      "temperature_c": 8.9,
      "wind_kmh": 11.0,
      "precipitation_mm": 1.2,
      "humidity_pct": 85,
      "is_windy_override": false
    }
  ],
  "ttl": {
    "_seconds": 1712954400,
    "_nanoseconds": 0
  },
  "created_at": {
    "_seconds": 1712606400,
    "_nanoseconds": 0
  }
}
```

---

## 4️⃣ Ejemplo con FOG (Niebla)

```json
{
  "city_id": "san-francisco",
  "city_name": "San Francisco",
  "country": "EE.UU.",
  "region": "america",
  "lat": 37.7749,
  "lon": -122.4194,
  "date_hour": "2026-04-08-05",
  "snapshots": [
    {
      "hour": 5,
      "raw_condition_code": 11,
      "raw_condition_text": "Fog",
      "classified": "fog",
      "types": ["ghost", "dark"],
      "temperature_c": 12.1,
      "wind_kmh": 25.5,
      "precipitation_mm": 0,
      "humidity_pct": 95,
      "is_windy_override": false
    }
  ]
}
```

**NOTA:** Aunque viento = 25.5 km/h, `is_windy_override: false` porque `canWindy: false` para FOG (IconCode=11).

---

## 5️⃣ Validación: TypeScript Check

```typescript
// Verificar estructura con TypeScript

import { Timestamp } from 'firebase/firestore'

interface ForecastSnapshot {
  hour: number
  raw_condition_code: number
  raw_condition_text: string
  classified: string
  types: string[]
  temperature_c: number
  wind_kmh: number
  precipitation_mm: number
  humidity_pct: number
  is_windy_override: boolean
}

interface ForecastDoc {
  city_id: string
  city_name: string
  country: string
  region: string
  lat: number
  lon: number
  date_hour: string
  snapshots: ForecastSnapshot[]
  ttl: Timestamp
  created_at: Timestamp
}

// Validación en tiempo de compilación
const example: ForecastDoc = {
  city_id: "san-francisco",
  city_name: "San Francisco",
  country: "EE.UU.",
  region: "america",
  lat: 37.7749,
  lon: -122.4194,
  date_hour: "2026-04-08-14",
  snapshots: [
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
    }
  ],
  ttl: Timestamp.now(),
  created_at: Timestamp.now()
}

// ✅ TypeScript validará todos los tipos
```

---

## 6️⃣ Checklist: Validar en Firestore Console

```
DESPUÉS DE GUARDAR, VERIFICAR EN FIRESTORE:

□ 1. Navegar a: /city_weather/san-francisco/forecasts/2026-04-08-14
□ 2. Verificar documento existe
□ 3. Expandir campo "snapshots"
   □ 3a. Ver 12 elementos (hora 0-23)
   □ 3b. Cada elemento tiene 10 campos
   □ 3c. is_windy_override es booleano
   □ 3d. types es array de strings
□ 4. Verificar timestamps
   □ 4a. ttl es timestamp (Timestamp type)
   □ 4b. created_at es timestamp
   □ 4c. ttl > created_at (7 días de diferencia)
□ 5. Verificar data types
   □ 5a. Numbers: temperature_c, wind_kmh, etc
   □ 5b. Strings: city_id, classified, etc
   □ 5c. Booleans: is_windy_override
   □ 5d. Arrays: types, snapshots
□ 6. Verificar valores válidos
   □ 6a. temperature_c entre -50 y +60
   □ 6b. humidity_pct entre 0 y 100
   □ 6c. hour entre 0 y 23
   □ 6d. region en [america, asia, europa, oceania, africa]
   □ 6e. classified en [sunny, partly, cloudy, fog, rain, snow, windy]
   □ 6f. types son [válidos tipos PGO]
□ 7. Verificar contadores
   □ 7a. city_weather collection > 0 documentos
   □ 7b. Cada documento tiene subcolección "forecasts"
   □ 7c. Cada "forecasts" tiene documentos con pattern YYYY-MM-DD-HH
```

---

**Documento generado automáticamente**  
Sprint 8 — JSON Examples  
v1.0

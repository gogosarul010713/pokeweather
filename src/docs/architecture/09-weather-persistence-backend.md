# Arquitectura — Weather Persistence Backend

**Sprint:** 8 — Fase 2  
**Fecha análisis:** 2026-04-08  
**Decisión:** Firebase Firestore (BaaS, sin servidor)  
**Status:** ✅ Aprobada — pendiente implementación

---

## 1. Problema a resolver

La precisión de la clasificación AccuWeather → tipos Pokémon GO falla ocasionalmente. Sin persistencia centralizada:

- No hay historial entre sesiones (IndexedDB es local y efímero)
- No se puede auditar qué regla disparó qué clasificación
- No se puede comparar climas en el tiempo para detectar patrones
- No se puede iterar sobre las reglas de clasificación con datos reales

**Objetivo:** Guardar pronósticos por ciudad + catálogo de reglas en una base de datos centralizada accesible desde cualquier sesión.

---

## 2. Volumen estimado

| Dato | Valor |
|------|-------|
| Ciudades | ~94 |
| Horas de pronóstico | 12 |
| Registros por ciclo | ~1,128 |
| Ciclos por día | 24 (refresh horario) |
| Writes/día sin batching | ~26,832 |
| **Writes/día con batching** (1 doc/ciudad con array 12h) | **~94** |
| Storage estimado (30 días) | ~15 MB |

> El batching es clave: en lugar de 12 docs por ciudad, se escribe 1 doc con un array de 12 snapshots.

---

## 3. Evaluación de opciones

### Opción A — Firebase Firestore ⭐ ELEGIDA

| Criterio | Detalle |
|----------|---------|
| Setup | ~2h |
| Free tier | 50k reads/día, 20k writes/día, 1 GB storage |
| Costo con batching | **$0/mes** (94 writes/día << 20k límite) |
| React SDK | Oficial, `onSnapshot` para realtime |
| Auth | Firebase Auth opcional |
| TTL nativo | ✅ Sí (Firestore TTL policy) |
| Mantenimiento | Mínimo (Google lo gestiona) |
| Lock-in | Google Cloud |

### Opción B — Supabase (PostgreSQL)

| Criterio | Detalle |
|----------|---------|
| Free tier requests | 50k req/mes → ~1,667/día (INSUFICIENTE para ~26k/día sin batching) |
| Ventaja | SQL real, Row-level security |
| Riesgo | Free tier insuficiente para este volumen incluso con batching |
| Veredicto | ❌ Descartada |

### Opción C — Cloudflare D1 + Workers

| Criterio | Detalle |
|----------|---------|
| Free tier | 100k reads/día, 100k writes/día — generoso |
| Ventaja | Cron Worker nativo (elimina polling desde React), SQL real |
| Setup | ~8h (nueva plataforma) |
| Veredicto | ✅ Viable pero curva de aprendizaje alta; candidata para Sprint 9+ si Firestore es insuficiente |

### Opción D — Vercel KV + Postgres

| Criterio | Detalle |
|----------|---------|
| KV free tier | 30k req/mes → insuficiente |
| Veredicto | ❌ Descartada |

---

## 4. Arquitectura elegida — Firestore

### Diagrama de flujo

```
┌────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│                                                         │
│  useWeather.ts ──→ AccuWeather API                      │
│       │                │                                │
│       │           raw response                          │
│       ↓                │                                │
│  weatherService.ts ←───┘                                │
│  (classifica condición)                                 │
│       │                                                 │
│       ├──→ Zustand store (UI state, inmediato)          │
│       │                                                 │
│       └──→ firebaseWeatherService.ts (async/background)│
│                   │                                     │
└───────────────────┼─────────────────────────────────────┘
                    │ SDK Firebase
                    ↓
┌─────────────────────────────────────────────────────────┐
│                  Firebase Firestore                      │
│                                                         │
│  /weather_catalog/                                      │
│    conditions          ← datos estáticos (reglas)       │
│    type_mapping                                         │
│    rules                                                │
│                                                         │
│  /city_weather/                                         │
│    {city_id}/                                           │
│      forecasts/                                         │
│        {YYYY-MM-DD-HH}   ← 1 doc/ciudad/hora            │
│          snapshots: [...] ← array 12h de pronóstico     │
│          ttl: Timestamp   ← auto-delete en 7 días       │
└─────────────────────────────────────────────────────────┘
                    │
                    ↓ (leer historial)
┌─────────────────────────────────────────────────────────┐
│              PrecisionMetrics.tsx                        │
│              (dashboard de precisión)                   │
└─────────────────────────────────────────────────────────┘
```

### Estructura de colecciones Firestore

#### `/weather_catalog/` — Datos estáticos

```
/weather_catalog/conditions
{
  sunny:  { label: "Soleado", emoji: "☀️", accuweather_codes: [1, 2] },
  partly: { label: "Parcialmente nublado", emoji: "⛅", accuweather_codes: [3, 4, 5, 6] },
  cloudy: { label: "Nublado", emoji: "☁️", accuweather_codes: [7, 8, 11, ...] },
  rain:   { label: "Lluvia", emoji: "🌧️", accuweather_codes: [18, 26, ...] },
  snow:   { label: "Nieve", emoji: "❄️", accuweather_codes: [22, 23, 25, ...] },
  fog:    { label: "Niebla", emoji: "🌫️", accuweather_codes: [11] },
  windy:  { label: "Ventoso", emoji: "💨", threshold_wind_kmh: 40 }
}

/weather_catalog/type_mapping
{
  sunny:  ["fire", "ground", "grass"],
  partly: ["normal", "rock"],
  cloudy: ["fairy", "fighting", "poison"],
  fog:    ["ghost", "dark"],
  rain:   ["water", "electric", "bug"],
  snow:   ["ice", "steel"],
  windy:  ["flying", "dragon", "psychic"]
}

/weather_catalog/rules
{
  windy_override: {
    replaces: ["sunny", "partly", "cloudy"],
    never_replaces: ["rain", "snow", "fog"],
    threshold_wind_kmh: 40
  },
  dedup: "max_types_displayed: 4"
}
```

#### `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}` — Datos dinámicos

```typescript
interface ForecastDoc {
  city_id: string           // "san-francisco"
  city_name: string         // "San Francisco"
  date_hour: string         // "2026-04-08-14"
  snapshots: ForecastSnapshot[]  // array de 12 snapshots horarios
  ttl: Timestamp            // timestamp + 7 días (Firestore TTL policy)
  created_at: Timestamp
}

interface ForecastSnapshot {
  hour: number              // 0-23
  raw_condition_code: number // código AccuWeather (IconPhrase code)
  raw_condition_text: string // "Partly Cloudy"
  classified: string         // "partly" | "sunny" | "cloudy" | "rain" | "snow" | "fog" | "windy"
  types: string[]            // ["normal", "rock"]
  temperature_c: number
  wind_kmh: number
  precipitation_mm: number
  humidity_pct: number
  is_windy_override: boolean // true si WINDY reemplazó la condición base
}
```

---

## 5. Capa de servicio — `firebaseWeatherService.ts`

```
src/
  services/
    firebase/
      firebaseConfig.ts       ← init SDK + env vars
      firebaseWeatherService.ts ← write/read forecasts
      weatherCatalogService.ts  ← read/seed catalog
```

### Principios de diseño

1. **Async en background** — nunca bloquear la UI
2. **Fire and forget** — errores de Firestore se loggean pero no se propagan
3. **Fallback graceful** — si Firestore falla, IndexedDB sigue funcionando
4. **Single responsibility** — `weatherService.ts` clasifica, `firebaseWeatherService.ts` persiste

---

## 6. Variables de entorno requeridas

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 7. Reglas de Firestore (security rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Catálogo: solo lectura pública
    match /weather_catalog/{doc} {
      allow read: if true;
      allow write: if false; // solo via Firebase Console o script
    }

    // Pronósticos: lectura pública, escritura solo desde frontend autorizado
    match /city_weather/{cityId}/forecasts/{forecastId} {
      allow read: if true;
      allow write: if true; // TODO: restringir a dominio en producción
    }

    // Reportes de clasificación: lectura pública, escritura abierta
    match /classification_reports/{reportId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

> **TODO:** En producción, cambiar `write: if true` a validar `request.origin` o usar Firebase App Check.

---

## 8. Costos proyectados

| Escenario | Writes/día | Reads/día | Costo/mes |
|-----------|-----------|----------|-----------|
| Solo frontend (actual) | 94 | 94 | $0 |
| + Dashboard consultas | 94 | ~2,000 | $0 |
| + Múltiples usuarios | 94×N | 2,000×N | $0 hasta N~50 |
| Blaze plan (si excede) | ilimitado | ilimitado | ~$0.06/100k ops |

---

## 9. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Free tier excedido con crecimiento | Baja | Bajo | Batching + TTL; Blaze plan cuesta <$5/mes |
| Latencia write bloquea UI | Media | Bajo | Write 100% async, sin `await` en flujo principal |
| DB pública sin auth | Alta (actual) | Medio | Firebase App Check en producción |
| Lock-in Google | Media | Medio | Abstraer en service layer — swap fácil |
| Cold start SDK Firebase | Baja | Bajo | Import lazy del SDK |

---

## 10. Decisiones de arquitectura tomadas

| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| Firestore (BaaS) | Supabase | Free tier insuficiente para el volumen |
| 1 doc por ciudad+hora | 1 doc por snapshot | Reduce writes de 1,128 a 94/hora |
| Write async/background | Write sync | No debe bloquear UI ni el ciclo de datos |
| SDK en frontend directo | API layer (Express) | BaaS elimina necesidad de server |
| TTL nativo Firestore | Cron de limpieza | Zero code, zero mantenimiento |

---

## 11. Próximos pasos

1. **US-804** — Crear Firebase project, instalar SDK, configurar env vars
2. **US-801** — Implementar `firebaseWeatherService.ts` + integrar en `useWeather.ts`
3. **US-802** — Seed de catálogo estático
4. **US-806** — Configurar TTL en Firestore Console
5. **US-803** — Actualizar `PrecisionMetrics.tsx` para leer Firestore
6. **US-805** — UI de reporte de clasificación incorrecta

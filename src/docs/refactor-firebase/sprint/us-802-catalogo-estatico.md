# US-802 — Catálogo Estático de Condiciones en Firestore

**Sprint:** 8 — Fase 2  
**Epic:** WDP (Weather Data Persistence)  
**Story Points:** 2 SP  
**Prioridad:** P1  
**Status:** ⏳ Pendiente  

---

## Historia de usuario

> Como sistema, quiero guardar el catálogo de condiciones climáticas y las reglas de clasificación en Firestore para poder actualizar la lógica sin necesidad de deployar nuevo código.

---

## Criterios de aceptación

- [ ] Documento `/weather_catalog/conditions` creado con las 7 condiciones y sus códigos AccuWeather
- [ ] Documento `/weather_catalog/type_mapping` creado con el mapping condition → tipos Pokémon
- [ ] Documento `/weather_catalog/rules` creado con las reglas WINDY y dedup
- [ ] Script de seed ejecutable: `npm run seed:catalog` o script Node independiente
- [ ] Los datos son idénticos a los hardcodeados en `weatherService.ts` (fuente de verdad)
- [ ] Script es idempotente (ejecutar múltiples veces no duplica datos)
- [ ] Verificado en Firestore Console: los 3 documentos existen con datos correctos
- [ ] Build: ✅ PASSED

---

## Schema del catálogo

### `/weather_catalog/conditions`

```json
{
  "sunny": {
    "label": "Soleado",
    "emoji": "☀️",
    "accuweather_codes": [1, 2]
  },
  "partly": {
    "label": "Parcialmente nublado",
    "emoji": "⛅",
    "accuweather_codes": [3, 4, 5, 6]
  },
  "cloudy": {
    "label": "Nublado",
    "emoji": "☁️",
    "accuweather_codes": [7, 8, 11, 19, 20, 21, 32, 33, 34, 35, 36, 38]
  },
  "rain": {
    "label": "Lluvia",
    "emoji": "🌧️",
    "accuweather_codes": [18, 26, 29, 39, 40]
  },
  "snow": {
    "label": "Nieve",
    "emoji": "❄️",
    "accuweather_codes": [22, 23, 24, 25, 41, 42, 43, 44]
  },
  "fog": {
    "label": "Niebla",
    "emoji": "🌫️",
    "accuweather_codes": [11]
  },
  "windy": {
    "label": "Ventoso",
    "emoji": "💨",
    "threshold_wind_kmh": 40,
    "note": "No es un código AccuWeather — se aplica por umbral de viento"
  }
}
```

### `/weather_catalog/type_mapping`

```json
{
  "sunny":  ["fire", "ground", "grass"],
  "partly": ["normal", "rock"],
  "cloudy": ["fairy", "fighting", "poison"],
  "fog":    ["ghost", "dark"],
  "rain":   ["water", "electric", "bug"],
  "snow":   ["ice", "steel"],
  "windy":  ["flying", "dragon", "psychic"]
}
```

### `/weather_catalog/rules`

```json
{
  "windy_override": {
    "description": "WINDY reemplaza sunny/partly/cloudy si viento >= threshold_wind_kmh",
    "replaces": ["sunny", "partly", "cloudy"],
    "never_replaces": ["rain", "snow", "fog"],
    "threshold_wind_kmh": 40
  },
  "dedup": {
    "max_types_displayed": 4,
    "description": "Si una ciudad tiene múltiples condiciones, se muestran máx 4 tipos únicos"
  },
  "version": "1.0.0",
  "last_updated": "2026-04-08"
}
```

---

## Script de seed

```typescript
// scripts/seedWeatherCatalog.ts
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

// Cargar config desde .env.local
const app = initializeApp({ /* config */ })
const db = getFirestore(app)

async function seed() {
  console.log('Seeding weather_catalog...')

  await setDoc(doc(db, 'weather_catalog', 'conditions'), CONDITIONS)
  await setDoc(doc(db, 'weather_catalog', 'type_mapping'), TYPE_MAPPING)
  await setDoc(doc(db, 'weather_catalog', 'rules'), RULES)

  console.log('✅ Seed completo')
}

seed().catch(console.error)
```

---

## Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `scripts/seedWeatherCatalog.ts` | Script de seed ejecutable con `tsx` |
| `src/services/firebase/weatherCatalogService.ts` | Servicio de lectura del catálogo |

---

## Notas de diseño

- El catálogo en Firestore es **read-only desde el frontend** (security rules: `allow write: if false`)
- Solo se actualiza via script de seed o Firebase Console
- El frontend puede leer el catálogo al iniciar para validar que las reglas locales coinciden con Firestore
- Si el catálogo no está disponible (offline), el frontend usa las reglas hardcodeadas como fallback

---

## Dependencias

- US-804 (Firebase setup)

## Bloqueante para

- Ninguna (es datos de referencia)

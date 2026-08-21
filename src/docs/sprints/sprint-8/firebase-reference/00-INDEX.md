# 📖 PVP Generator — Diccionario de Datos Completo

**Propósito:** Panorama 360° de la estructura de datos para US-801 (Persistir Pronóstico)  
**Creado:** Sprint 8 — 2026-04-08  
**Estado:** Listo para revisar antes de implementar

---

## 🎯 Cómo Usar Este Diccionario

### Para entender la estructura:
1. 📊 Lee **[01-data-dictionary.md](01-data-dictionary.md)** — esquemas, tipos, campos, relaciones
2. 📈 Lee **[02-visual-flows.md](02-visual-flows.md)** — flujos paso-a-paso, transformaciones, validaciones
3. 📝 Consulta **[03-json-examples.md](03-json-examples.md)** — ejemplos reales para copiar/pegar

### Para implementar US-801:
1. Leer en orden: 01 → 02 → 03
2. Entender diagrama ER en 01
3. Seguir flujo en 02 (especialmente secciones 2 y 3)
4. Validar con ejemplos de 03

### Para validar en Firestore:
1. Ir a [03-json-examples.md](03-json-examples.md) Sección 6
2. Usar checklist "Validar en Firestore Console"
3. Copiar ejemplos y pegar en Firestore si necesitas verificar estructura

---

## 📑 Estructura de Archivos

```
refactor-firebase/
├── 00-INDEX.md                    ← ESTÁS AQUÍ
│
├── 01-data-dictionary.md          ← ESQUEMAS (tipos, campos, relaciones)
│   ├── Diagrama ER
│   ├── Entidades principales (City, WeatherTranslation, etc)
│   ├── Esquemas detallados (tablas)
│   ├── Ejemplos reales
│   ├── Mapeos y traducciones
│   ├── Flujo de datos
│   └── Relaciones Firestore
│
├── 02-visual-flows.md             ← FLUJOS (paso-a-paso, transformaciones)
│   ├── Línea de tiempo ciclo horario
│   ├── Transformación datos (API → Firestore)
│   ├── Ejemplo CON override por viento
│   ├── Comparación diferentes condiciones
│   ├── Tabla comparativa Snapshot vs Doc
│   ├── Integración en useWeather.ts
│   ├── Índices de calidad (writes/queries)
│   └── Checklist implementación
│
└── 03-json-examples.md            ← EJEMPLOS (copiar/pegar)
    ├── Ejemplo completo San Francisco
    ├── Snapshot individual compacto
    ├── Múltiples ciudades
    ├── Ejemplo con FOG
    ├── Validación TypeScript
    └── Checklist Firestore Console
```

---

## 🔑 Conceptos Clave

### 1. City (Zustand Store)
- **Fuente:** `CITIES.JSON` (estática) + AccuWeather API (dinámica)
- **Campos:** 41 totales (16 estáticos, 25 dinámicos)
- **Ciclo:** Cargado al iniciar → enriquecido con API cada hora
- **Ejemplo:** `{ id: "san-francisco", name: "San Francisco", condition: "partly", tempC: 18.5, ... }`

### 2. ForecastSnapshot (Elemento Individual)
- **Qué es:** 1 hora de pronóstico clasificado
- **Campos:** 10 (hour, raw_condition_code, classified, types, temp, wind, etc)
- **Ubicación:** Array de 12 dentro de ForecastDoc
- **Propósito:** Serializar pronóstico horario para análisis posterior

### 3. ForecastDoc (Documento Firestore)
- **Qué es:** Envoltorio que contiene 12 snapshots de una ciudad en 1 hora de captura
- **Campos:** 10 (city_id, city_name, region, date_hour, snapshots[], ttl, created_at)
- **Path:** `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`
- **Ejemplos:** 
  - `/city_weather/san-francisco/forecasts/2026-04-08-14`
  - `/city_weather/tokyo/forecasts/2026-04-08-14`

### 4. Condición → Tipos Pokémon (Mapeo)
```
sunny  → [fire, ground, grass]
partly → [normal, rock]
cloudy → [fairy, fighting, poison]
fog    → [ghost, dark]
rain   → [water, electric, bug]
snow   → [ice, steel]
windy  → [flying, dragon, psychic]
```

### 5. AccuWeather IconCode → PGO Condition (Traducción)
- **44 iconos** en `WEATHER_TRANSLATIONS` (src/services/weather/weatherService.ts)
- **canWindy flag:** true = puede convertirse a "windy" si viento > 29 km/h
- **canWindy flag:** false = nunca se convierte (precipitación activa)
- **WINDY override:** solo si canWindy=true Y (wind > 29 km/h OR gust > 31 km/h)

---

## 🔄 Flujo Simplificado

```
HORA HH:00 UTC
    ↓
[1] loadCitiesInBatch() — AccuWeather API (94 ciudades, 5 paralelo)
    ↓
[2] enrichCityWithWeatherData() — Clasificar clima → Pokémon GO
    ↓
[3] updateStore() — Zustand (actualizar UI)
    ↓
[4] saveCityForecast() ← NEW (async/background)
    ├─ Extraer 12 snapshots
    ├─ Crear ForecastDoc
    └─ Firestore.setDoc()
    ↓
Esperar hasta SIGUIENTE HORA y repetir
```

---

## 💾 Cardinalidades Firestore

| Relación | Cantidad | Ejemplo |
|----------|----------|---------|
| **Cities** | 94 | San Francisco, Tokyo, London, etc |
| **Documents por city (24h)** | 24 | /city_weather/{id}/forecasts/{0-23} |
| **Snapshots por document** | 12 | Array de 12 horas |
| **Total snapshots (24h × 12h)** | 288 | Por ciudad por día |
| **Writes/hora** | 94 | 1 write por ciudad |
| **Writes/día** | 2,256 | 94 × 24 |
| **Bytes por doc** | ~2,100 | 300 base + 1,800 snapshots |
| **Storage/ciudad (7 días)** | ~343 KB | 2,100 × 168 docs |
| **Storage total (94 ciudades)** | ~32 MB | 343 KB × 94 |

**Límites Firestore Free Tier:**
- Writes: **20,000/día** (nuestro: 2,256 = 11.28% ✅)
- Storage: **1 GB** (nuestro: 32 MB = 3.2% ✅)
- Reads: **50,000/día** (infinito para nuestra app)

---

## 🚨 Validaciones Críticas

### Antes de guardar en Firestore:

1. **snapshots.length === 12**
   - Si < 12: faltan horas
   - Si > 12: horas duplicadas
   - ❌ Nunca permitir array incompleto

2. **types.length > 0**
   - Cada snapshot debe tener al menos 1 tipo
   - Si types = []: error en CONDITION_TO_TYPES lookup
   - ❌ Validar que classified sea válido

3. **Timestamp correcto**
   - ❌ Mal: `new Date()` o number
   - ✅ Bien: `Timestamp.fromDate(date)` o `Timestamp.now()`

4. **TTL > created_at**
   - TTL debe ser 7 días en el futuro
   - Firestore eliminará automáticamente

5. **date_hour formato YYYY-MM-DD-HH**
   - No: "2026-4-8-14" (falta padding)
   - ✅ Bien: "2026-04-08-14" (padStart(2, '0'))

6. **Condición válida**
   - classified debe estar en: sunny, partly, cloudy, fog, rain, snow, windy
   - ❌ Nunca: "rainy", "snowy", "cloudy!", etc

7. **region minúscula**
   - ✅ "america", "asia", "europa", "oceania", "africa"
   - ❌ Nunca: "America", "AMERICA", "América"

---

## 📊 Campos de Referencia Rápida

### ForecastSnapshot (10 campos)
| Campo | Tipo | Rango |
|-------|------|-------|
| hour | number | 0-23 |
| raw_condition_code | number | 1-44 |
| raw_condition_text | string | libre |
| classified | enum | sunny\|partly\|cloudy\|fog\|rain\|snow\|windy |
| types | string[] | enum PGO |
| temperature_c | number | -50 a +60 |
| wind_kmh | number | 0-200 |
| precipitation_mm | number | 0-500 |
| humidity_pct | number | 0-100 |
| is_windy_override | boolean | true/false |

### ForecastDoc (10 campos)
| Campo | Tipo | Rango |
|-------|------|-------|
| city_id | string | [a-z0-9-]+ |
| city_name | string | libre |
| country | string | libre |
| region | enum | america\|asia\|europa\|oceania\|africa |
| lat | number | -90 a +90 |
| lon | number | -180 a +180 |
| date_hour | string | YYYY-MM-DD-HH |
| snapshots | array | [ForecastSnapshot × 12] |
| ttl | Timestamp | now + 7 días |
| created_at | Timestamp | now |

---

## 🎓 Ejemplo Mínimo para Entender

```
INPUT (AccuWeather API):
{
  "WeatherIcon": 3,              ← AccuWeather iconId
  "Temperature": { "Value": 18.5 },
  "Wind": { "Speed": { "Value": 9.0 }, "Gust": { "Value": 12.5 } },
  ...
}

PROCESAMIENTO (weatherService.ts):
├─ getBaseCondition(3) → "partly"
├─ canWindy = true, viento = 9.0 km/h
├─ 9.0 > 29? NO → no override
├─ classified = "partly"
├─ CONDITION_TO_TYPES["partly"] → ["normal", "rock"]

OUTPUT (ForecastSnapshot):
{
  "raw_condition_code": 3,
  "classified": "partly",
  "types": ["normal", "rock"],
  "temperature_c": 18.5,
  "wind_kmh": 9.0,
  "humidity_pct": 65,
  "is_windy_override": false
}

PERSISTENCIA (Firestore):
/city_weather/san-francisco/forecasts/2026-04-08-14
├─ snapshots[0] = {hour: 0, ...}
├─ snapshots[1] = {hour: 1, ...}
├─ ...
├─ snapshots[14] = {hour: 14, classified: "partly", ...} ← ESTE
├─ ...
└─ snapshots[23] = {hour: 23, ...}
```

---

## 📚 Referencias Cruzadas

| Documento | Ubicación | Propósito |
|-----------|-----------|----------|
| US-801 | `src/docs/features/sprint8/us-801-persistir-pronostico.md` | Especificación de US |
| Doc 20 | `src/docs/20-weather-classification-algorithm.md` | Algoritmo clasificación clima |
| weatherService | `src/services/weather/weatherService.ts` | WEATHER_TRANSLATIONS, CONDITION_TO_TYPES |
| useWeather | `src/hooks/useWeather.ts` | Hook de carga (dónde integrar) |
| useStore | `src/store/useStore.ts` | Tipo City |
| batchWeatherService | `src/services/weather/batchWeatherService.ts` | Batch loading |

---

## 🎯 Checklist: Antes de Implementar

**LECTURA:**
- [ ] Leí 01-data-dictionary.md (diagrama ER + esquemas)
- [ ] Leí 02-visual-flows.md (flujos + transformaciones)
- [ ] Leí 03-json-examples.md (ejemplos para validar)

**COMPRENSIÓN:**
- [ ] Entiendo la diferencia entre ForecastSnapshot y ForecastDoc
- [ ] Entiendo cómo funciona el override a WINDY (canWindy flag)
- [ ] Entiendo dónde almacenar las 12 horas (¿City.forecast[]? ¿variable local?)
- [ ] Entiendo que es async/background (no bloquea UI)
- [ ] Entiendo que falla silenciosa (no reintenta en error)

**ACCESO A CÓDIGO:**
- [ ] Firebase está inicializado (US-804 ✅)
- [ ] Variables de entorno están en .env.local
- [ ] Firestore database está activa
- [ ] Credenciales tienen permiso de escritura

**DISEÑO:**
- [ ] Decidimos dónde almacenar las 12 horas de pronóstico
- [ ] Decidimos cómo construir ForecastSnapshot desde City
- [ ] Confirmamos path Firestore: /city_weather/{id}/forecasts/{dhour}
- [ ] Confirmamos TTL: 7 días

---

## 🚀 Próximos Pasos

### Ahora (Sprint 8 — US-801):
1. **Crear** `src/services/firebase/firebaseWeatherService.ts`
   - Función `saveCityForecast(city, snapshots)`
   - Export en `src/services/firebase/index.ts`

2. **Modificar** `src/hooks/useWeather.ts`
   - Integrar llamada a `saveCityForecast()` (async/background)
   - Handlear errores (falla silenciosa)

3. **Validar** en Firestore Console
   - Documentos creados correctamente
   - Snapshots[12] poblados
   - TTL calculado correctamente

### Después (Sprint 8 — US-802+):
- US-802: Catálogo estático (weather_catalog collection)
- US-803: Dashboard Firestore (queries + análisis)
- US-805: Reportes de clasificación (analytics)

---

## ❓ FAQ

**P: ¿Dónde guardo las 12 horas de pronóstico?**  
R: TBD — ver sección "Integración en useWeather.ts" de 02-visual-flows.md

**P: ¿Cuántos documentos se crean por día?**  
R: 94 ciudades × 24 horas = 2,256 documentos/día

**P: ¿Puedo tener snapshot sin types?**  
R: NO — validar que types.length > 0 siempre

**P: ¿Qué pasa si viento es fuerte en lluvia?**  
R: NO se convierte a windy (canWindy=false para lluvia). Consultarsección 3 de 02-visual-flows.md

**P: ¿Cuál es el TTL?**  
R: 7 días (now + 604,800,000 ms). Firestore auto-elimina después.

**P: ¿Cuál es el date_hour?**  
R: Formato `YYYY-MM-DD-HH` (con padding). Ej: "2026-04-08-14"

---

## 📞 Soporte

Si tienes dudas durante la implementación:
1. Consulta el diagrama ER en [01-data-dictionary.md](01-data-dictionary.md)
2. Sigue el flujo paso-a-paso en [02-visual-flows.md](02-visual-flows.md)
3. Valida con ejemplos de [03-json-examples.md](03-json-examples.md)
4. Pregunta al equipo con referencia a este documento

---

**Documento index autogenerado**  
Sprint 8 — Data Dictionary v1.0  
**Próxima revisión:** Después de US-801 (validación real en Firestore)

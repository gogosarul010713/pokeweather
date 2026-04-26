# 🧪 Guía Técnica: Testing de Cloud Functions Auto-Sync

**Última actualización:** 2026-04-25  
**Scope:** US-1101 → US-1109 (auto-sync + cleanup)  
**Ambiente:** Localhost + Vercel + Firebase Console  

---

## 📊 Visión General de Testing

El sistema tiene **3 capas** que deben testearse independientemente:

```
┌─────────────────────────────────────────┐
│ Capa 1: TRIGGER (cron automático)       │
│ ❌ Localhost | ✅ Firebase Console      │
└─────────────────────────────────────────┘
           ↓ dispara
┌─────────────────────────────────────────┐
│ Capa 2: ESCRITURA (Firestore)           │
│ ✅ Localhost | ✅ Vercel                │
└─────────────────────────────────────────┘
           ↓ propaga
┌─────────────────────────────────────────┐
│ Capa 3: CLIENTE (real-time listeners)   │
│ ✅ Localhost | ✅ Vercel                │
└─────────────────────────────────────────┘
```

---

## 🎯 Qué Testear en Cada Ambiente

### Localhost
```bash
✅ Endpoint HTTP manual (syncWeatherManual)
✅ Escritura en Firestore (local o remoto)
✅ Real-time listeners en navegador
❌ Cron automático (Google Cloud Scheduler no se emula)
```

### Firebase Console (Producción)
```bash
✅ Logs de ejecución del cron (syncWeatherScheduled)
✅ Errores en Cloud Functions
✅ Estadísticas de invocaciones
❌ Datos en tiempo real (mejor: verificar en app)
```

### Vercel (Producción)
```bash
✅ Aplicación React corriendo con datos sync'd
✅ Real-time listeners activos
✅ Caché local sincronizado con Firestore
```

---

## 🔧 Herramientas Necesarias

| Herramienta | Propósito | Cómo obtener |
|-------------|----------|------------|
| `curl` | Ejecutar HTTP requests | `brew install curl` o Windows nativo |
| `bq` (BigQuery CLI) | Consultar tabla `snapshots_flat` | `gcloud components install bq` |
| `firebase` CLI | Emulator Suite (opcional) | `npm install -g firebase-tools` |
| Firebase Console | Ver logs y Firestore | https://console.firebase.google.com |
| Browser DevTools | Inspeccionar listeners | F12 en navegador |

---

## ⚠️ Requisitos Previos

### Variables de Entorno en Cloud Functions

Antes de testear, verifica que `functions/.env` contiene:
```bash
CRON_SECRET=test-local-secret-123456789
ACCUWEATHER_KEY=<tu-accuweather-api-key>
CLEANUP_SECRET=test-local-secret-123456789
```

Si falta alguna, agrégalas y ejecuta:
```bash
npm run deploy:functions
```

### Validar API Key de AccuWeather

1. Abre https://www.accuweather.com/en/free-weather-api
2. Verifica que tu key está **habilitada** (no revocada)
3. Chequea cuota disponible (12-hour forecast requiere conexión)
4. Si está revocada: regenera una nueva key y actualiza `functions/.env`

---

## 🚀 FASE 1: Testing en Localhost

### Paso 1.1: Entender la URL del Endpoint

Tu Cloud Function HTTP está en:
```
https://us-central1-[PROJECT_ID].cloudfunctions.net/syncWeatherManual
```

Para obtener la URL exacta:
```bash
firebase functions:list
# O en Firebase Console → Functions → syncWeatherManual
```

**En localhost (Emulator, opcional):**
```
http://localhost:5001/[PROJECT_ID]/us-central1/syncWeatherManual
```

---

### Paso 1.2: Ejecutar Endpoint Manual

#### ✅ Opción A: Curl (recomendado)

```bash
# PRODUCCIÓN (Vercel)
curl -X POST \
  https://us-central1-weather-app-prod-ef50d.cloudfunctions.net/syncWeatherManual \
  -H "x-cron-secret: $(grep VITE_CRON_SECRET .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -v
```

**Output esperado:**
```json
{
  "cities_synced": 5,
  "total_snapshots": 60,
  "firestore_writes": 5,
  "duration_ms": 450,
  "timestamp": "2026-04-25T14:30:00.000Z"
}
```

---

#### ✅ Opción B: Desde Testing Tools (en app)

1. Abre app React en localhost
2. Navega a **Testing Tools** (header icon)
3. Pestaña **Sincronizar** → botón **"Sincronizar ahora"**
4. Mira el toast de confirmación

---

### Paso 1.3: Verificar Escritura en Firestore

Después de ejecutar el endpoint:

```bash
# Verificar usando Firebase CLI
firebase firestore:inspect city_weather

# O en Firebase Console:
# 1. Abre https://console.firebase.google.com
# 2. Proyecto: weather-app-prod-ef50d
# 3. Firestore Database → city_weather
# 4. Busca documentos con fecha HOY
```

**Expected structure:**
```
city_weather/
  ├─ sydney/
  │  ├─ forecasts/
  │  │  ├─ 2026-04-25-14
  │  │  ├─ 2026-04-25-15
  │  │  └─ 2026-04-25-16
  │  └─ (last 3 hours with snapshots)
  ├─ tokyo/
  └─ ...
```

**Campos en cada documento:**
```typescript
{
  created_at: Timestamp,        // Cuándo se creó
  snapshots: WeatherSnapshot[], // [12 horas predichas]
  timezone: number,             // UTC offset de la ciudad
  local_time_user: string,      // "DD/MM HH:MM" cuando se consultó
  expires_at: Timestamp         // TTL (7 días)
}
```

---

### Paso 1.4: Inspeccionar Caché Local

En navegador, abre **DevTools** (F12) y ejecuta:

```javascript
// Muestra caché de climas
pweCache.showForecastCache()

// Output esperado:
// {
//   "sydney|accuLocationKey:4743": {
//     "createdAt": 1713970200000,
//     "expiresAt": 1714575000000,
//     "data": { weather snapshot... }
//   },
//   ...
// }
```

**Validaciones:**
- ✅ `createdAt` es reciente (últimos 5 min)
- ✅ `expiresAt` es en ~7 días
- ✅ Contiene todas las 5 ciudades

---

## 🌐 FASE 2: Verificación en Producción (Vercel)

### Paso 2.1: Ver Logs del Cron en Firebase Console

1. Abre https://console.firebase.google.com
2. Proyecto: `weather-app-prod-ef50d`
3. Funciones → `syncWeatherScheduled`
4. Pestaña **Logs**

**Qué buscar:**
```
[timestamp] Scheduled sync triggered
[timestamp] Scheduled sync completed: { cities_synced: 5, ... }
```

**Si hay error:**
```
[timestamp] Scheduled sync error: [error message]
```

---

### Paso 2.2: Entender el Timing

**Cron: `0 * * * *` = cada HH:00 UTC**

| Hora UTC | Hora Colombia (UTC-5) | Hora España (UTC+2) |
|----------|----------------------|-------------------|
| 00:00    | 19:00 (anterior)     | 02:00             |
| 12:00    | 07:00                | 14:00             |
| 14:00    | 09:00                | 16:00             |

**Ejemplo:** Si está 14:30 UTC → próxima ejecución a las 15:00 UTC

---

### Paso 2.3: Validar Datos en Firestore (desde app Vercel)

1. Deploy actual en Vercel: vercel.com/[user]/pokeweather
2. Abre la app en navegador
3. Espera a que cargue (o clica "Sincronizar ahora" en Testing Tools)
4. Abre DevTools → console
5. Ejecuta `pweCache.showForecastCache()`

**Validar:**
- ✅ Caché tiene 5 ciudades
- ✅ Timestamps son recientes
- ✅ No hay warnings en consola

---

## 📊 FASE 3: Validación en BigQuery (Opcional)

### Paso 3.1: Setup Acceso bq CLI

```bash
# Login con tu cuenta de Google
gcloud auth login

# Set proyecto
gcloud config set project weather-app-prod-ef50d

# Listar datasets
bq ls
```

---

### Paso 3.2: Consultar snapshots_flat

```bash
# Últimos 10 documentos insertados
bq query --use_legacy_sql=false <<'SQL'
SELECT
  city_id,
  date_hour,
  created_at,
  snapshots_count,
  timezone
FROM `weather-app-prod-ef50d.weather_db.snapshots_flat`
ORDER BY created_at DESC
LIMIT 10
SQL
```

**Output esperado:**
```
+---------+---------------------+---------------------+------------------+----------+
| city_id | date_hour           | created_at          | snapshots_count  | timezone |
+---------+---------------------+---------------------+------------------+----------+
| sydney  | 2026-04-25-14:00:00 | 2026-04-25 14:00:00 | 12               | 10       |
| tokyo   | 2026-04-25-14:00:00 | 2026-04-25 14:00:00 | 12               | 9        |
| london  | 2026-04-25-14:00:00 | 2026-04-25 14:00:00 | 12               | 0        |
| newyork | 2026-04-25-14:00:00 | 2026-04-25 14:00:00 | 12               | -5       |
| saopaul | 2026-04-25-14:00:00 | 2026-04-25 14:00:00 | 12               | -3       |
+---------+---------------------+---------------------+------------------+----------+
```

**Validaciones:**
- ✅ 5 ciudades por cada `date_hour`
- ✅ `snapshots_count = 12` (12 horas de pronóstico)
- ✅ `timezone` corresponde a cada ciudad
- ✅ `created_at` reciente (últimas 24h)

---

## 🔍 FASE 4: Debugging en Browser

### Paso 4.1: Ver Listeners Real-time

1. DevTools → Network
2. Pestaña **WebSocket**
3. Busca conexiones a Firestore

```
Nombres de conexión esperados:
- firebaseio.com (Firestore real-time)
```

---

### Paso 4.2: Validar Cambios Live

```javascript
// En DevTools console, agregamos listener manual
const db = await pwe.getDb()
const unsubscribe = db.collection('city_weather')
  .onSnapshot(snapshot => {
    console.log(`Cambios detectados: ${snapshot.docs.length} docs`)
    snapshot.docChanges().forEach(change => {
      console.log(`${change.type.toUpperCase()}: ${change.doc.id}`)
    })
  })

// Luego ejecuta "Sincronizar ahora" en Testing Tools
// Deberías ver: "Changes detected: 5 docs" + "MODIFIED: sydney", etc.
```

---

### Paso 4.3: Inspeccionar Estructura

```javascript
// Ver documento completo
const doc = await (await pwe.getDb())
  .collection('city_weather')
  .doc('sydney')
  .get()

console.log(doc.data())

// Output esperado:
// {
//   forecasts: { /* subcollection, no mostrada aquí */ },
//   created_at: Timestamp { seconds: ..., nanoseconds: ... },
//   timezone: 10,
//   local_time_user: "25/04 14:30"
// }
```

---

## ⚠️ Debugging Común

| Problema | Causa | Solución |
|----------|-------|----------|
| **401 Unauthorized** en curl | CRON_SECRET en functions/.env incorrecto | Verificar `functions/.env` y redeploy |
| **403 Forbidden** en AccuWeather | API key revocada o sin cuota | Regenerar key en AccuWeather console |
| **500 Error en Cloud Function** | ACCUWEATHER_KEY no en functions/.env | Agregar a functions/.env y redeploy |
| **No aparece cron en logs** | Cron no se ejecutó aún | Esperar siguiente HH:00 UTC |
| **Caché vacío** | Primer acceso o caché expirado | Clicker "Sincronizar" o esperar HH:00 |
| **Listener no activo** | Firestore auth fallida | Verificar VITE_FIREBASE_API_KEY |
| **BigQuery tabla vacía** | Extension no instalada | Ver `src/docs/sprints/sprint-10/01-DecisionLookerVsMetabase.md` |

### Session 18 Findings & Fixes

**Issue 1:** Cloud Function `syncWeatherManual` retorna 403 de AccuWeather

**Root cause:** Endpoint incorrecto en Cloud Functions
- ❌ INCORRECTO: `https://api.accuweather.com/forecasts/v1/hourly/12hour/{locationKey}`
- ✅ CORRECTO: `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/{locationKey}`

**Solución aplicada:** 
- Cliente usa proxy `vite.config.ts`: `/api/accuweather/` → `https://dataservice.accuweather.com/`
- Cloud Function ahora usa misma URL base
- Agregado parámetro `metric=true` (consistente con cliente)
- **Commit:** `57ea15d` ✅

**Validación exitosa:**
```bash
curl -X POST https://us-central1-.../syncWeatherManual \
  -H "x-cron-secret: test-local-secret-123456789" \
  -d '{}'

# Response:
# {"success":true,"citiesUpdated":5,"failedCities":[],"timestamp":"2026-04-26T11:11:14.124Z"}
```

**Status:** ✅ Fase 1 Testing en Localhost COMPLETADA

---

## ✅ Checklist de Validación Completo

### Antes de dar US-1110 como DONE

```
LOCALHOST
─────────
☐ Puedo ejecutar curl al endpoint HTTP manual
☐ Recibo respuesta JSON con counts y timestamp
☐ Firestore tiene nuevos docs con estructura correcta
☐ pweCache.showForecastCache() muestra datos frescos

FIREBASE CONSOLE
────────────────
☐ syncWeatherScheduled aparece en logs
☐ Ejecuciones muestran status SUCCESS
☐ Timestamps corresponden a HH:00 UTC

VERCEL (PRODUCCIÓN)
───────────────────
☐ App carga sin errores
☐ pweCache.showForecastCache() en app live muestra datos
☐ Real-time listener WebSocket está activo (DevTools)
☐ Cambios en Firestore se propagan <1s al navegador

BIGQUERY (OPCIONAL)
───────────────────
☐ snapshots_flat contiene 5 ciudades por cada HH:00
☐ snapshots_count = 12 para cada documento
☐ created_at es reciente (últimas 24h)

DOCUMENTACIÓN
──────────────
☐ Guía está completa en 17-CloudFunctionsTesting-Guia.md
☐ Todos los comandos son copy-paste listos
☐ Outputs esperados están documentados
```

---

## 🎬 Próximos Pasos

Después de validar US-1110:

1. **Merge sprint-10 → develop** (requiere confirmación)
2. **Release v2.1.0** (prod en Vercel)
3. **Iniciar Sprint 11** (siguientes features)

---

## 📚 Referencias

- Cloud Functions deployment: `npm run deploy:functions`
- Emulator Suite: `firebase emulators:start --only functions,firestore`
- Firebase Console: https://console.firebase.google.com/u/0/project/weather-app-prod-ef50d
- BigQuery: https://console.cloud.google.com/bigquery?project=weather-app-prod-ef50d
- Vercel App: https://pokeweather-one.vercel.app

---

**Última validación:** Session 18 (2026-04-25)

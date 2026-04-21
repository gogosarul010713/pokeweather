# Auto-Sincronización de Climas — Arquitectura (US-1101)

**Actualizado:** 2026-04-21  
**Estado:** Documentado, Ready for Implementation  
**Scope:** Servidor-side sync a HH:15 UTC

---

## 📖 Visión General

La app sincroniza datos de clima **automáticamente en el servidor** (no en cliente) a las **HH:15 cada día** (24 veces).

```
Firebase Scheduled Function [HH:15]
    ↓ (AccuWeather API × 5 ciudades, paralelo)
Firestore [source of truth]
    ↓ (onSnapshot push real-time)
Cliente React (Vercel Hobby)
    ↓ (IndexedDB caché local)
UI re-renderiza con datos frescos
```

**Ventaja crítica:** Independiente de N usuarios/pestañas. Siempre 5 calls a AccuWeather, nunca más.

---

## 🏗️ Arquitectura

### Componente 1: Firebase Scheduled Function (Servidor)

**Dónde:** `functions/src/index.ts`  
**Cuándo:** Cada día a HH:15 UTC (via Firebase Pub/Sub)  
**Qué:** Sincroniza 5 ciudades en paralelo

```typescript
// Trigger automático (HH:15)
exports.syncWeatherScheduled = functions.pubsub
  .schedule('15 * * * *')
  .timeZone('UTC')
  .onRun(async () => {
    // 1. Cargar 5 ciudades
    // 2. Promise.all() → AccuWeather API
    // 3. Para cada ciudad: saveCityForecast() → Firestore
    // 4. Done
  })

// Trigger manual (testing/local)
exports.syncWeatherManual = functions.https.onRequest(async (req, res) => {
  // Verificar CRON_SECRET
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  // Ejecutar misma lógica
  await syncLogic()
  res.json({ success: true, citiesUpdated: 5, timestamp: new Date() })
})
```

**Variables de entorno (functions/.env):**
```
ACCUWEATHER_KEY=tu_key_aqui         # Moved from client VITE_ACCUWEATHER_KEY
CRON_SECRET=random_secret_token     # Para autenticación HTTP manual
```

**Capacidad:**
- 5 ciudades × 24 veces/día = 120 calls/día
- AccuWeather quota: 15,000/mes → 120/día = 24% uso ✅
- Firebase quota: 2M invocations/mes → 720/mes = 0.036% uso ✅
- Timeout: 540 segundos (suficiente para paralelo ~500ms)

---

### Componente 2: Firestore (Source of Truth)

**Schema:**
```
/city_weather/{cityId}/forecasts/{YYYY-MM-DD-HH}
  ├── city_id
  ├── city_name
  ├── date_hour
  ├── snapshots[]          # 12h pronósticos
  ├── calculated_condition # Predicción mostrada
  ├── timezone
  ├── local_time_user
  ├── created_at           # HH:15:XX (cuando se obtuvieron)
  ├── ttl                  # 7 días (auto-delete)
  └── ...
```

**Actualización:** Firebase Function escribe a las HH:15:XX UTC. Cada documento refleja el momento exacto de la sincronización.

**Listeners:** Firestore mantiene conexión WebSocket abierta (nativa en SDK). Cuando Function escribe, todos los `onSnapshot` listeners reciben push.

---

### Componente 3: Cliente React (useFirestoreSync)

**Archivo:** `src/hooks/useFirestoreSync.ts` (NUEVO)

```typescript
import { onSnapshot, collection } from 'firebase/firestore'

export function useFirestoreSync(onUpdate: (data: any[]) => void) {
  useEffect(() => {
    let unsubscribe: () => void

    const setup = async () => {
      const db = await getDb()
      
      // Escuchar cambios en /city_weather
      unsubscribe = onSnapshot(
        collection(db, 'city_weather'),
        (snapshot) => {
          // Ignorar writes locales, procesar del servidor
          if (snapshot.metadata.hasPendingWrites) return
          
          const cities = snapshot.docs.map(doc => doc.data())
          onUpdate(cities)  // ← React state se actualiza
        }
      )
    }

    setup()
    return () => unsubscribe?.()
  }, [])
}
```

**Cómo se integra:**
```typescript
// En App.tsx o hook useWeather
useFirestoreSync((cities) => {
  // Actualizar estado React
  setLoadingStatus('ready')
  onReadyRef.current(cities)
})
```

**Latencia:** ~100ms desde que la Function escribe en Firestore → push a cliente → re-render.

---

### Componente 4: IndexedDB Caché (Delta Sync D-017)

**Cómo interactúa:**
1. `onSnapshot` actualiza estado React
2. `loadCitiesFromCache()` intenta caché IndexedDB primero (40ms)
3. Si expirado, fallback a Firestore (ya actualizado por Function)
4. Delta Sync verificará `lastSyncTimestamp` y traerá solo docs nuevos

**No hay cambios en D-017.** Sigue funcionando idéntico.

---

## 🔄 Flujo Completo (Momento a Momento)

### HH:14:59
- Cliente está abierto, escuchando `onSnapshot`
- IndexedDB caché muestra datos de HH:14:15 anterior (fresco)
- App está en estado "ready"

### HH:15:00 (exacto)
- Firebase Scheduled Function dispara automáticamente
- Carga 5 ciudades en paralelo desde AccuWeather
- Promise.all() espera todas las respuestas (~500ms)

### HH:15:00.5
- Function recibe respuestas de AccuWeather
- Para cada ciudad: `saveCityForecast(city.id, snapshots)` → Firestore
- Cada documento se escribe con `created_at: Timestamp.now()` (HH:15:XX)

### HH:15:01
- Firestore completó escrituras
- **`onSnapshot` listener en cliente recibe push automáticamente**
- Callback dispara: `onUpdate(cities)`
- React state se actualiza

### HH:15:01.1
- Componentes suscritos a estado re-renderizan
- IndexedDB caché se actualiza vía `setCachedWeather()`
- UI muestra datos frescos de HH:15

### HH:14:59 (próxima hora)
- Ciclo se repite

---

## ✅ Verificación de Reactivity (Testing)

**En local con Firebase Emulator:**
```bash
firebase emulators:start --only functions,firestore
```

**Llamar el endpoint manualmente:**
```bash
curl -X POST http://localhost:5001/PROJECT/us-central1/syncWeatherManual \
  -H "x-cron-secret: test-secret" \
  -H "Content-Type: application/json"
```

**Observar en cliente:**
- Consola: `onSnapshot` callback se dispara dentro de ~100ms
- DevTools Firestore: documentos se escriben
- App UI: datos se actualizan automáticamente

**En TestingTools (botón):**
```typescript
// Botón "Sincronizar ahora" en TestingTools
const handleManualSync = async () => {
  await fetch('https://us-central1-PROJECT.cloudfunctions.net/syncWeatherManual', {
    method: 'POST',
    headers: { 'x-cron-secret': import.meta.env.VITE_CRON_SECRET }
  })
  // onSnapshot disparará en ~100ms, UI se actualiza
}
```

---

## 🔐 Seguridad

### API Key de AccuWeather
- **Antes:** `VITE_ACCUWEATHER_KEY` en cliente (visible en bundle)
- **Ahora:** `ACCUWEATHER_KEY` en `functions/.env` (servidor, nunca expondrá)
- **Cambio en cliente:** Remover `VITE_ACCUWEATHER_KEY` del `.env.local`

### CRON_SECRET
- Protege el endpoint HTTP `syncWeatherManual` de calls no autorizados
- Valor: string aleatorio 32+ caracteres
- Ubicación: `functions/.env` + `VITE_CRON_SECRET` para TestingTools

---

## 📊 Costos vs. Beneficios

| Aspecto | Client-side (Antes) | Server-side (Ahora) |
|--------|---|---|
| **API Calls/día** | 24 × N usuarios | 24 (FIJO) |
| **AccuWeather costo** | Escalable O(N) | Constante O(1) |
| **Firestore reads** | ~5,000/mes | ~1,000/mes (D-017 delta) |
| **Latencia dato fresco** | 5-10s (timer) | ~100ms (onSnapshot) |
| **Confiabilidad** | Si app cierra, no sync | 24/7 independiente |
| **Múltiples pestañas** | Duplicación N×24 | Una sola sincronización |
| **Setup** | Cero (client-side) | +1 Cloud Function |

---

## 🚨 Cambios de Código Necesarios

**Remover del cliente:**
```typescript
// src/hooks/useWeather.ts
- scheduleNextRefresh()      ← Completamente remover
- doRefresh()                ← No necesario
```

**Remover del entorno:**
```bash
# .env.local
- VITE_ACCUWEATHER_KEY       ← Mover a functions/.env
```

**Agregar en cliente:**
```typescript
// src/hooks/useFirestoreSync.ts (NUEVO)
// Usar en App.tsx o useWeather.ts
```

**Agregar en servidor:**
```typescript
// functions/src/index.ts
// + exports.syncWeatherScheduled
// + exports.syncWeatherManual
```

---

## 📝 Decisiones de Arquitectura Aplicadas

| Decisión | Razonamiento |
|----------|-------------|
| **Server-side cron** | Independencia de cliente, 24 calls garantizados |
| **HH:15 timing** | 15 min dentro del período horario para frescura óptima |
| **Paralelo (Promise.all)** | 500ms vs 2.5s secuencial, sin rate-limiting risk |
| **onSnapshot vs polling** | Real-time push, latencia 100ms vs 60s polling |
| **Firebase Functions** | Nativo con Firestore, free tier, no extra setup GCP |
| **Doble trigger** | Automated (HH:15) + manual (testing) en misma función |

---

## 🔗 Relación con otras decisiones

- **D-017 (Delta Sync):** No se ve afectado, sigue sincronizando incremental
- **D-019 (IndexedDB primero):** Caché local sigue siendo CAPA 1, Firestore CAPA 2
- **US-1104/1105:** Lectura optimizada no cambia, Function escribe de la misma forma

---

## 📚 Referencias

- Documentación User Story: `09-US-1101-SyncAutomatic.md` (actualizada)
- Google Cloud Functions docs: https://firebase.google.com/docs/functions/schedule-functions
- Firestore real-time listeners: https://firebase.google.com/docs/firestore/query-data/listen

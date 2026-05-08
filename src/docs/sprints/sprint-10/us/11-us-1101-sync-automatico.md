# US-1101: Sincronización Automática de Climas (Servidor) — HH:15

**Sprint:** 10 (Ampliación)  
**Story Points:** 4-5 SP  
**Prioridad:** Alta  
**Estado:** 📝 Documentada, Ready for Implementation  
**Rama:** `sprint-10`

---

## 📋 Descripción

Implementar **sincronización automática de climas en el servidor** que se ejecute **exactamente a HH:15 cada día** (24 consultas a AccuWeather), **independiente de usuarios/pestañas**.

Hoy: Cada cliente ejecuta su propio timer (~24 × N usuarios = N×24 API calls ineficientes)  
Nuevo: Un servidor ejecuta una sola vez, datos se propagan vía Firestore real-time

---

## 🎯 Requisitos

1. **Ejecutar a HH:15 UTC cada día**
   - Firebase Scheduled Function dispara automáticamente
   - Exactitud: ±0 segundos (Firebase garantiza)

2. **5 ciudades en paralelo**
   - `Promise.all(cities.map(city => fetchAccuWeather(city)))`
   - Latencia: ~500ms (vs 2.5s secuencial)

3. **Flujo completo del sync**
   - AccuWeather API → Firebase Firestore → IndexedDB caché
   - Idéntico a US-1104 (lectura optimizada)

4. **Reactivity automática (cliente)**
   - `onSnapshot` listener detecta cambios en Firestore
   - UI se actualiza automáticamente (~100ms latencia)
   - Sin timer client-side

5. **Testing en local**
   - Endpoint HTTP manual para disparar función
   - Botón en TestingTools para testing sin esperar HH:15
   - Firebase Emulator para local development

6. **Seguridad**
   - AccuWeather API key vive en servidor (`functions/.env`), no en cliente
   - Endpoint HTTP protegido con `CRON_SECRET`

---

## ✅ Criterios de Aceptación

- [ ] **Firebase Scheduled Function**
  - [ ] Dispara a HH:15 UTC automáticamente
  - [ ] Carga 5 ciudades en paralelo
  - [ ] Llama AccuWeather API para cada ciudad
  - [ ] Guarda resultado en Firestore vía `saveCityForecast()`
  - [ ] Completar en < 10 segundos

- [ ] **Endpoint HTTP manual**
  - [ ] POST `/syncWeatherManual` requiere `x-cron-secret` header
  - [ ] Dispara misma lógica que scheduled
  - [ ] Responde con JSON: `{ success: true, citiesUpdated: 5, timestamp }`

- [ ] **Cliente: onSnapshot Listener**
  - [ ] Hook `useFirestoreSync` escucha cambios en Firestore
  - [ ] Cuando servidor escribe a HH:15, cliente recibe push automático
  - [ ] React state se actualiza
  - [ ] UI re-renderiza en <100ms

- [ ] **Remover client-side sync**
  - [ ] Eliminar `scheduleNextRefresh()` en `useWeather.ts`
  - [ ] Eliminar timer que ejecutaba `doRefresh()`
  - [ ] App NO hace llamadas a AccuWeather desde cliente

- [ ] **Variables de entorno**
  - [ ] `functions/.env`: `ACCUWEATHER_KEY`, `CRON_SECRET`
  - [ ] `.env.local`: Remover `VITE_ACCUWEATHER_KEY`
  - [ ] `.env.local`: Agregar `VITE_CRON_SECRET` para TestingTools

- [ ] **Testing**
  - [ ] Firebase Emulator: localEmulator funciona
  - [ ] TestingTools: botón "Sincronizar ahora" dispara función
  - [ ] Manual curl: puedo disparar endpoint desde terminal
  - [ ] onSnapshot: cambios en Firestore actualizan UI automáticamente

- [ ] **Tests unitarios**
  - [ ] Cloud Function: carga ciudades correctamente
  - [ ] Paralelo: promesas se resuelven todas
  - [ ] Firestore: datos se guardan con `created_at` correcto
  - [ ] Cliente: `useFirestoreSync` hook inicializa listener
  - [ ] Cobertura: >85%

- [ ] **Build & Performance**
  - [ ] `firebase deploy --only functions` sin errores
  - [ ] `npm run build` sin warnings (cliente)
  - [ ] Lighthouse Audit: sin regresiones
  - [ ] AccuWeather quota: <25% (120 calls/día vs 15,000/mes)

---

## 🏗️ Arquitectura

Ver documento detallado: [AUTO-SYNC-ARCHITECTURE.md](AUTO-SYNC-ARCHITECTURE.md)

**Flujo esquemático:**
```
Servidor (Firebase)           Cliente (React)
───────────────────────────────────────────

  HH:15:00
     │ scheduleFunction dispara
     ├─ Promise.all(5 cities)
     │  └─ AccuWeather API
     └─ saveCityForecast() → Firestore
            │
            ├──────────────────→ onSnapshot push
                                    │
                                    └─ setState(cities)
                                    └─ re-render UI
```

---

## 📋 Subtareas

### A: Crear Firebase Scheduled Function (Nuevo)

**Archivos a crear:**
```
functions/src/
  ├── index.ts                    ← Entry point, exporta funciones
  ├── syncWeatherLogic.ts         ← Lógica compartida (scheduled + manual)
  └── types.ts                    ← TS interfaces
```

**Paso 1:** Estructura básica
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions'

exports.syncWeatherScheduled = functions.pubsub
  .schedule('15 * * * *')
  .timeZone('UTC')
  .onRun(syncWeatherLogic)

exports.syncWeatherManual = functions.https.onRequest(async (req, res) => {
  // Proteger con CRON_SECRET
  // Llamar syncWeatherLogic
})
```

**Paso 2:** Implementar `syncWeatherLogic`
```typescript
// functions/src/syncWeatherLogic.ts
export const syncWeatherLogic = async () => {
  const cities = await loadCities()  // Desde Firestore o JSON
  
  const results = await Promise.all(
    cities.map(city => 
      loadCitiesInBatch([city], { force: true })
    )
  )
  
  for (const city of results.flat()) {
    await saveCityForecast(city.id, city.snapshots)
  }
  
  return { success: true, citiesUpdated: results.length }
}
```

**Validación:**
- [ ] Function compila sin errores TS
- [ ] Timeout: <10 segundos con 5 ciudades
- [ ] Firestore documents se crean con `created_at` correcto

---

### B: Endpoint HTTP para Testing

**En `functions/src/index.ts`:**
```typescript
exports.syncWeatherManual = functions.https.onRequest(async (req, res) => {
  const secret = req.headers['x-cron-secret']
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    const result = await syncWeatherLogic()
    res.json({ ...result, timestamp: new Date().toISOString() })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

**Validación:**
- [ ] Sin `x-cron-secret`: responde 401
- [ ] Con secret correcto: ejecuta función
- [ ] Respuesta: JSON con éxito, timestamp, ciudades actualizadas

---

### C: Cliente: useFirestoreSync Hook

**Archivo:** `src/hooks/useFirestoreSync.ts` (NUEVO)

```typescript
import { useEffect } from 'react'
import { onSnapshot, collection } from 'firebase/firestore'
import { getDb } from '../services/firebase/firebaseConfig'

export function useFirestoreSync(
  onUpdate: (cities: any[]) => void,
  onError?: (error: Error) => void
) {
  useEffect(() => {
    let unsubscribe: () => void

    const setup = async () => {
      try {
        const db = await getDb()
        
        unsubscribe = onSnapshot(
          collection(db, 'city_weather'),
          (snapshot) => {
            if (snapshot.metadata.hasPendingWrites) return
            
            const cities = snapshot.docs.map(doc => doc.data())
            onUpdate(cities)
          },
          (error) => {
            console.error('onSnapshot error:', error)
            onError?.(error as Error)
          }
        )
      } catch (error) {
        console.error('useFirestoreSync setup error:', error)
        onError?.(error as Error)
      }
    }

    setup()
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])
}
```

**Validación:**
- [ ] Hook inicializa sin errores
- [ ] Listener se activa cuando colección cambia
- [ ] Callback se dispara con datos actualizados
- [ ] Cleanup detach listener on unmount

---

### D: Integración en App.tsx

**Remover:**
```typescript
- scheduleNextRefresh()  ← en useWeather
- doRefresh()            ← si es función standalone
```

**Agregar:**
```typescript
// En App.tsx o en useWeather.ts
import { useFirestoreSync } from './hooks/useFirestoreSync'

useFirestoreSync(
  (cities) => {
    // Actualizar estado
    onReadyRef.current(cities)
  },
  (error) => {
    console.error('Sync error:', error)
  }
)
```

**Validación:**
- [ ] App inicia sin errores
- [ ] onSnapshot listener se activa
- [ ] Primera load: caché IndexedDB (CAPA 1, 40ms)
- [ ] HH:15: Firestore push actualiza UI automáticamente

---

### E: TestingTools: Botón "Sincronizar ahora"

**En `src/components/TestingTools/TestingTools.tsx`:**

```typescript
const [isSyncing, setIsSyncing] = useState(false)

const handleManualSync = async () => {
  setIsSyncing(true)
  try {
    const res = await fetch(
      `https://us-central1-${PROJECT_ID}.cloudfunctions.net/syncWeatherManual`,
      {
        method: 'POST',
        headers: { 'x-cron-secret': import.meta.env.VITE_CRON_SECRET || '' }
      }
    )
    const data = await res.json()
    if (res.ok) {
      // Toast: "Sincronización completada, 5 ciudades actualizadas"
    } else {
      // Toast: error
    }
  } finally {
    setIsSyncing(false)
  }
}

return (
  <div>
    <button onClick={handleManualSync} disabled={isSyncing}>
      {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
    </button>
  </div>
)
```

**Validación:**
- [ ] Botón visible en TestingTools
- [ ] Click → llama endpoint HTTP
- [ ] Success → toast feedback
- [ ] onSnapshot dispara automáticamente, UI se actualiza

---

### F: Configuración de Entorno

**`firebase.json`:**
```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

**`functions/.env`:**
```
ACCUWEATHER_KEY=tu_api_key_aqui
CRON_SECRET=generate_random_32_chars
```

**`.env.local` (cliente):**
```
# REMOVER:
# VITE_ACCUWEATHER_KEY=...

# AGREGAR:
VITE_CRON_SECRET=generate_random_32_chars
VITE_FIREBASE_*=...  # Ya existe
```

**Validación:**
- [ ] `firebase deploy --only functions` sin errores
- [ ] Function puede acceder a `process.env.ACCUWEATHER_KEY`
- [ ] Cliente puede acceder a `import.meta.env.VITE_CRON_SECRET`

---

### G: Tests Unitarios

**Tests para Function (`functions/src/__tests__/syncWeather.test.ts`):**
```typescript
describe('syncWeatherLogic', () => {
  it('should fetch and save 5 cities', async () => {
    const result = await syncWeatherLogic()
    expect(result.citiesUpdated).toBe(5)
  })

  it('should complete in <10 seconds', async () => {
    const start = Date.now()
    await syncWeatherLogic()
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(10000)
  })
})
```

**Tests para cliente (`src/hooks/useFirestoreSync.test.ts`):**
```typescript
describe('useFirestoreSync', () => {
  it('should call onUpdate when data changes', async () => {
    const onUpdate = vi.fn()
    render(() => <TestComponent useFirestoreSync={useFirestoreSync} onUpdate={onUpdate} />)
    
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })
})
```

**Validación:**
- [ ] Tests pasan localmente
- [ ] Coverage >85%
- [ ] CI/CD ejecuta tests en rama

---

## 🧪 Testing en Local

### Opción A: Firebase Emulator
```bash
firebase emulators:start --only functions,firestore
```
- Emulator corre en http://localhost:5001
- Firestore emulado en localhost
- Functions se despliegan en emulator

**Desventaja:** AccuWeather API key real necesita estar en `.env` (no emulada)

### Opción B: Botón TestingTools (Recomendado)
- Botón "Sincronizar ahora" dispara endpoint HTTP real deployado
- No necesita emulator
- Más rápido para testing iterativo

### Opción C: curl (Terminal)
```bash
curl -X POST https://us-central1-PROJECT.cloudfunctions.net/syncWeatherManual \
  -H "x-cron-secret: tu-secret" \
  -H "Content-Type: application/json"
```

---

## 📊 Estimación

| Subtarea | Horas |
|----------|-------|
| A: Function | 2 |
| B: Endpoint HTTP | 0.5 |
| C: useFirestoreSync hook | 1 |
| D: Integración App | 0.5 |
| E: TestingTools botón | 1 |
| F: Env config | 0.5 |
| G: Tests | 1.5 |
| Total | **7 horas** |

Esto excede el 4-5 SP estimado, ajustando a **6-7 SP** con testing incluido.

---

## 🔗 Decisiones Aplicadas

- **D-019:** Lectura 2 capas (IndexedDB → Firestore) respetada
- **D-017:** Delta Sync no se ve afectado
- **D-002:** Firebase como backend mantiene coherencia

---

## 📚 Documentación Relacionada

- [AUTO-SYNC-ARCHITECTURE.md](AUTO-SYNC-ARCHITECTURE.md) — Arquitectura detallada
- [src/docs/architecture/09-weather-persistence-backend.md](../../architecture/09-weather-persistence-backend.md) — Backend Firebase
- [src/docs/sprints/sprint-10/README.md](README.md) — Estado del Sprint 10


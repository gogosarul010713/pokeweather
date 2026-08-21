# BL-001: Firestore Rules — App Check o Validación de Origen

**Prioridad:** 🔴 CRÍTICA | **Tipo:** Seguridad | **Estimación:** 2h | **Bloqueador:** Prod-Ready

---

## Problema

Actualmente `firestore.rules` permite lecturas públicas anónimas (por necesidad de dev offline-first). **PERO** escrituras NO están protegidas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if request.auth != null || true;  // ← PÚBLICO de lectura
      allow write: if false;  // ← Escrituras denegadas PERO...
    }
  }
}
```

**Vulnerabilidad:** Un atacante podría:
1. Llamar `saveWeatherReport()` desde browser con API key falsa
2. Escribir datos arbitrarios en `weather_reports`
3. Contaminar análisis de precisión

**Impacto:** Antes de abrir app a usuarios reales (producción).

---

## Solución

### Opción A: Firebase App Check (RECOMENDADO)

**Qué es:** Valida que el request viene de un cliente autorizado (certificado de app).

**Implementación:**
1. Firebase Console → App Check → Enable App Check
2. Seleccionar proveedor: reCAPTCHA v3 o SafetyNet (Android)
3. En `firestore.rules`:
   ```
   match /databases/{database}/documents {
     match /weather_reports/{document=**} {
       allow write: if request.app.checkToken.app_id == request.auth.uid
                      && request.auth != null
     }
   }
   ```
4. En frontend (`firebaseConfig.ts`):
   ```typescript
   import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
   
   initializeAppCheck(app, {
     provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_KEY'),
   })
   ```

**Pros:**
- ✅ Estándar Firebase (integrado)
- ✅ Funciona offline (caches request)
- ✅ No requiere cambios en CF

**Contras:**
- ⚠️ Requiere reCAPTCHA v3 key (Google Cloud Console)
- ⚠️ Pequeño overhead de validación

**Complejidad:** Media | **Riesgo:** Bajo

---

### Opción B: Validación por Origen

**Qué es:** Rechaza requests que NO vienen de dominios autorizados.

**Implementación:**
1. En `firestore.rules`:
   ```
   match /weather_reports/{document=**} {
     allow write: if request.auth != null 
                     && request.referrer == 'https://pokeweather.vercel.app'
   }
   ```

**Pros:**
- ✅ Más simple que App Check
- ✅ No requiere reCAPTCHA

**Contras:**
- ❌ Menos seguro (header referer puede falsificarse)
- ❌ No funciona offline
- ❌ Requiere CORS configuración adicional

**Complejidad:** Baja | **Riesgo:** Medio (security-wise)

---

## Recomendación

**Proceder con Opción A (App Check):**
- Standard Firebase
- Costo: gratuito hasta 10k requests/día
- Alineado con arquitectura D-039

---

## Pasos de Implementación

### 1. Google Cloud Console

- [ ] Ir a reCAPTCHA admin console
- [ ] Crear reCAPTCHA v3 key para dominio `pokeweather.vercel.app`
- [ ] Copiar Public Key (frontend) + Secret Key (CF)

### 2. Firebase Console

- [ ] Firestore → App Check → Enable
- [ ] Seleccionar reCAPTCHA v3 como proveedor
- [ ] Configurar dominios autorizados

### 3. Código

**Ubicación:** `src/services/firebase/firebaseConfig.ts`

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

// After initializeApp()
if (!__DEV__) {  // Solo en producción
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_PUBLIC_KEY),
    isTokenAutoRefreshEnabled: true,
  })
}
```

**Variables de entorno:**
- `.env.local`: `VITE_RECAPTCHA_PUBLIC_KEY`
- `functions/.env`: `RECAPTCHA_SECRET_KEY`

### 4. Firestore Rules

**Ubicación:** `firestore.rules` (en raíz o Firebase Console)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Públicas: lectura y metadata
    match /city_weather/{document=**} {
      allow read: if true
    }
    
    // Protegidas: solo con auth + App Check
    match /weather_reports/{document=**} {
      allow read: if request.auth != null
      allow write: if request.auth != null
                      && request.app.checkToken.app_id != null
    }
    
    match /classification_reports/{document=**} {
      allow read: if request.auth != null
      allow write: if request.auth != null
                      && request.app.checkToken.app_id != null
    }
  }
}
```

### 5. CF (syncWeatherManual)

App Check en CF debe verificarse antes de guardar:

```typescript
// functions/src/index.ts
import admin from 'firebase-admin'

export const syncWeatherManual = functions.https.onRequest(
  async (req, res) => {
    // ... CORS headers ...
    
    // Verificar App Check token si es client-initiated
    if (req.headers['x-app-check-token']) {
      try {
        const app = admin.app()
        await admin.appCheck().verifyToken(
          req.headers['x-app-check-token'] as string
        )
      } catch (err) {
        return res.status(401).json({ error: 'Invalid App Check token' })
      }
    }
    
    // Proceder con sync...
  }
)
```

### 6. Testing

- [ ] Playwright test: request SIN App Check → 401
- [ ] Playwright test: request CON App Check → 200
- [ ] Firestore emulator test (offline)

---

## Archivos Impactados

| Archivo | Cambio |
|---------|--------|
| `firestore.rules` | Agregar validación App Check |
| `src/services/firebase/firebaseConfig.ts` | Inicializar App Check |
| `functions/src/index.ts` | Verificar token en CF |
| `.env.local` | Agregar `VITE_RECAPTCHA_PUBLIC_KEY` |
| `functions/.env` | Agregar `RECAPTCHA_SECRET_KEY` |

---

## Validación

**Después de deploy:**

1. Firebase Console → Firestore → Monitoring
2. Buscar `appCheck:` en logs → verificar que se valida en cada write
3. Test manual: Abrir DevTools → Network → Fire un `saveWeatherReport()`
4. Verificar header `x-goog-firebase-app-check-token` presente

---

## Referencias

- [Firebase App Check docs](https://firebase.google.com/docs/app-check)
- Handoff Sprint 10: [07-handoff-sprint-11.md](../../sprint-10/07-handoff-sprint-11.md#critico)
- D-039 (clasificación): [decision-log.md](../../architecture/11-decision-log.md)

---

**Siguiente:** ¿Proceder con implementación después de BL-002?


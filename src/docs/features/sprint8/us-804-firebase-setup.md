# US-804 — Setup Firebase + Firestore

**Sprint:** 8 — Fase 2  
**Epic:** WDP (Weather Data Persistence)  
**Story Points:** 2 SP  
**Prioridad:** P0 — Bloqueante (todas las demás US dependen de esta)  
**Status:** ⏳ Pendiente  

---

## Historia de usuario

> Como desarrollador, quiero configurar Firebase Firestore en el proyecto para habilitar la persistencia centralizada de datos climáticos.

---

## Criterios de aceptación

- [ ] Firebase project creado en consola (plan Spark, gratuito)
- [ ] SDK `firebase` instalado: `npm install firebase`
- [ ] Archivo `src/services/firebase/firebaseConfig.ts` creado con inicialización del SDK
- [ ] Variables de entorno en `.env.local`:
  ```
  VITE_FIREBASE_API_KEY=
  VITE_FIREBASE_AUTH_DOMAIN=
  VITE_FIREBASE_PROJECT_ID=
  VITE_FIREBASE_STORAGE_BUCKET=
  VITE_FIREBASE_MESSAGING_SENDER_ID=
  VITE_FIREBASE_APP_ID=
  ```
- [ ] `.env.local.example` actualizado con las nuevas vars (sin valores reales)
- [ ] Firestore habilitado en modo producción (no test mode)
- [ ] Security rules básicas configuradas (ver [architecture/09](../../architecture/09-weather-persistence-backend.md))
- [ ] Colecciones iniciales creadas: `weather_catalog`, `city_weather`
- [ ] Import del SDK funciona sin errores en `npm run dev`
- [ ] Build: `npm run build` ✅ PASSED

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/services/firebase/firebaseConfig.ts` | Crear — init SDK |
| `src/services/firebase/index.ts` | Crear — barrel export |
| `.env.local` | Modificar — agregar VITE_FIREBASE_* |
| `.env.local.example` | Modificar — plantilla vars |
| `package.json` | Modificar — dependencia firebase |

---

## Implementación propuesta

```typescript
// src/services/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

---

## Notas técnicas

- El SDK de Firebase se importa de forma modular (tree-shakeable): `import { getFirestore } from 'firebase/firestore'`
- No usar el SDK legacy (`firebase/app` v8) — solo v9+ modular
- Si `VITE_FIREBASE_PROJECT_ID` está undefined en runtime → log warning, no crash
- En CI/CD (Vercel): agregar env vars en el dashboard de Vercel

---

## Dependencias

- Ninguna (es el primer paso)

## Bloqueante para

- US-801, US-802, US-803, US-805, US-806

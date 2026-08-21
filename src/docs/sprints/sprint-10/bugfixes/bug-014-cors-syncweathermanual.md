# BUG-014: syncWeatherManual bloqueado por CORS policy

**Status:** FIXED ✅  
**Date:** 2026-05-05  
**Branch:** sprint-10  
**Commit:** (pending)

## Síntoma

"Sincronizar ahora" en Testing Tools panel falla con:
```
Access to fetch at 'https://us-central1-weather-app-prod-ef50d.cloudfunctions.net/syncWeatherManual' 
from origin 'https://pokeweather-git-sprint-10-...vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause Investigation

### Phase 1: Evidence Gathering

1. **Error Message Analysis**
   - Browser bloquea preflight OPTIONS request
   - Falta header `Access-Control-Allow-Origin` en la respuesta

2. **Code Review: src/index.ts**
   - `clearFirestoreData()` (linea 88-96): CORS headers ✅ presentes
   - `syncWeatherManual()` (linea 43-73): CORS headers ❌ ausentes

3. **Verificación con curl (preflight test)**
   - Inicial: `curl -i -X OPTIONS ...syncWeatherManual` → `401 Unauthorized` sin CORS headers
   - Problema identificado: handler OPTIONS no ejecuta antes de auth check

### Phase 2: Source vs Compiled Mismatch

4. **Edit Applied**
   - Agregué CORS headers al handler de `syncWeatherManual` en src/index.ts
   - Verificación: `npx tsc --noEmit` → 0 errores TS

5. **First Deploy**
   - Ejecuté: `firebase deploy --only functions`
   - Resultado: "Successful update operation" ✅
   - **Pero:** curl test aún mostraba `401` sin CORS headers ❌

6. **Root Cause Discovery**
   - Comparé `lib/index.js` (compilado) vs `src/index.ts` (source)
   - **El lib/index.js estaba desincronizado** — tenía el código anterior
   - Razón: Firebase 1st Gen functions deploy desde `lib/` (JS), no desde `src/` (TS)
   - El build anterior no se había ejecutado

### Phase 3: Solution

7. **Recompilación y re-deploy**
   - Ejecuté: `npm run build` en functions/
   - Verificé: `lib/index.js` ahora contiene CORS headers (linea 38-42)
   - Ejecuté: `firebase deploy --only functions`
   - Resultado: "Successful update operation" ✅

8. **Verification con curl (POST preflight)**
   ```
   curl -i -X OPTIONS https://us-central1-.../syncWeatherManual
   
   HTTP/1.1 204 No Content
   access-control-allow-origin: *
   access-control-allow-methods: POST, OPTIONS
   access-control-allow-headers: Content-Type, x-cron-secret
   ```
   ✅ CORS headers presentes, preflight pasa

## Technical Details

### Cambios en functions/src/index.ts

```typescript
// ANTES (linea 43-72)
export const syncWeatherManual = functions.https.onRequest(
  async (req, res) => {
    const secret = req.headers['x-cron-secret']
    // ... auth check directo, sin CORS
  }
)

// DESPUÉS (linea 43-84)
export const syncWeatherManual = functions.https.onRequest(
  async (req, res) => {
    // CORS headers — required for all responses including preflight
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type, x-cron-secret')

    // Handle CORS preflight — must respond 204 before auth check
    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }

    // Auth check ejecuta después del preflight
    const secret = req.headers['x-cron-secret']
    // ...
  }
)
```

### Patrón aplicado

Replicado exactamente desde `clearFirestoreData()` que ya funcionaba con CORS correctamente (linea 88-96 original).

## Critical Lesson

**Firebase 1st Gen Functions:**
- Deploy lee `lib/` (JavaScript compilado), no `src/` (TypeScript)
- Si editas `src/` pero no compilas antes de deploy, los cambios no toman efecto
- Solución: siempre ejecutar `npm run build` antes de `firebase deploy`

**Prevención futura:**
- Agregar `predeploy: ["npm run build"]` a `firebase.json` en sección functions
- Esto fuerza compilación automática antes de cada deploy

## Testing

1. **Browser Test (preview URL)**
   - Abrir Testing Tools panel
   - Click "Sincronizar ahora"
   - ✅ Request pasa, no hay CORS error
   - ✅ Manual sync ejecuta sin bloqueos

2. **curl Test (preflight verification)**
   ```bash
   curl -i -X OPTIONS https://us-central1-weather-app-prod-ef50d.cloudfunctions.net/syncWeatherManual \
     -H "Origin: https://pokeweather-git-sprint-10-...vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, x-cron-secret"
   ```
   - ✅ Responde 204 con CORS headers
   - ✅ Browser permitirá POST después del preflight

## Files Modified

- `functions/src/index.ts` — agregados CORS headers a `syncWeatherManual` (7 lineas)
- `functions/lib/index.js` — recompilado (generado automáticamente)

## Deployment

- **Commit:** (pending)
- **Tag:** v2.1.0-bugfix-014
- **URL:** https://us-central1-weather-app-prod-ef50d.cloudfunctions.net/syncWeatherManual

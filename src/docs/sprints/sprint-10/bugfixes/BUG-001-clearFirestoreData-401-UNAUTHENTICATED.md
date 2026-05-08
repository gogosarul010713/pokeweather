---
bug_id: BUG-001
fecha: 2026-04-23
us: US-1102
severidad: Bloqueante
estado: RESUELTO
---

# BUG-001 — 401 UNAUTHENTICATED en clearFirestoreData

## Sintoma

```
Network: POST clearFirestoreData
Status: 401 Unauthorized
Response: {"error":{"message":"User must be authenticated","status":"UNAUTHENTICATED"}}
```

## Causa Raiz

La Cloud Function fue implementada como `onCall()` que exige `context.auth`.
El cliente intentaba usar `signInAnonymously()` de Firebase Auth, pero el
token anonimo no se adjuntaba a `httpsCallable()` porque:

1. Anonymous Auth no estaba habilitado en Firebase Console
2. `signInAnonymously()` fallaba silenciosamente (catch vacio)
3. `getFunctions()` se llamaba sin pasar la referencia al `app`, por lo que
   no usaba el contexto de auth correcto

## Solucion Aplicada

Cambio de arquitectura: de `onCall()` a `onRequest()` HTTP endpoint con
autenticacion via header `x-api-key`.

- Cloud Function: `onRequest()` + verificacion `x-api-key` header
- Cliente: `fetch()` directo con header `x-api-key: VITE_CRON_SECRET`
- Eliminada dependencia de Firebase Anonymous Auth por completo

## Archivos Modificados

- `functions/src/index.ts` — cambio onCall → onRequest
- `src/services/cleanup/cleanupService.ts` — httpsCallable → fetch()

## Si Vuelve a Aparecer

Verificar:
1. Que la funcion en produccion sea `onRequest()` (no `onCall()`)
2. Que `functions/lib/` este compilado desde el `src/` actualizado
3. Que el header `x-api-key` llegue con el valor de `VITE_CRON_SECRET`

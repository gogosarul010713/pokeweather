---
bug_id: BUG-003
fecha: 2026-04-23
us: US-1102
severidad: Bloqueante
estado: RESUELTO
---

# BUG-003 — Variable VITE_* no existe en Cloud Functions (servidor)

## Sintoma

La Cloud Function retorna 401 aunque el cliente envia el header correcto.
En los logs del servidor: `expectedApiKey === undefined`.

## Causa Raiz

El prefijo `VITE_` es exclusivo de Vite (bundler frontend). Las variables con
ese prefijo solo se inyectan en el bundle del cliente durante el build.

En Cloud Functions (Node.js servidor), `process.env.VITE_FIREBASE_API_KEY`
siempre es `undefined` porque Firebase no copia esas variables al servidor.

```typescript
// ESTO SIEMPRE ES undefined EN EL SERVIDOR:
const expectedApiKey = process.env.VITE_FIREBASE_API_KEY  // undefined

// La condicion siempre es true → siempre retorna 401:
if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey)  // true
```

## Solucion Aplicada

1. Crear `functions/.env` con el secreto sin prefijo VITE_:
   ```
   CLEANUP_SECRET=test-local-secret-123456789
   ```

2. En la Cloud Function usar `process.env.CLEANUP_SECRET`

3. En el cliente usar `import.meta.env.VITE_CRON_SECRET` (el mismo valor)

Firebase lee automaticamente `functions/.env` durante el deploy e inyecta
las variables en el entorno de ejecucion del servidor.

## Regla General

| Contexto | Variable | Lectura |
|----------|----------|---------|
| Frontend (Vite) | `VITE_MI_VAR=valor` en `.env.local` | `import.meta.env.VITE_MI_VAR` |
| Cloud Functions | `MI_VAR=valor` en `functions/.env` | `process.env.MI_VAR` |

Nunca usar `VITE_` en Cloud Functions. Son contextos separados.

## Si Vuelve a Aparecer

1. Verificar que `functions/.env` existe con el secreto correcto
2. Verificar que la Cloud Function usa `process.env.CLEANUP_SECRET` (sin VITE_)
3. Re-deployar para que Firebase inyecte las nuevas env vars

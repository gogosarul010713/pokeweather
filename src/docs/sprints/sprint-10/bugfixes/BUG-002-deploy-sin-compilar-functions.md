---
bug_id: BUG-002
fecha: 2026-04-23
us: US-1102
severidad: Critico
estado: RESUELTO
---

# BUG-002 — Deploy de Cloud Functions sin compilar TypeScript

## Sintoma

Los cambios en `functions/src/index.ts` no tienen efecto en produccion.
Firebase despliega la version antigua del codigo aunque el `.ts` fue modificado.

En este caso el error se manifestaba como INVALID_ARGUMENT porque el `lib/`
desactualizado tenia `onCall()` mientras el `src/` ya tenia `onRequest()`.

```
# lib/index.js (desplegado, desactualizado):
export const clearFirestoreData = functions.https.onCall(...)

# src/index.ts (modificado, NO compilado):
export const clearFirestoreData = functions.https.onRequest(...)
```

## Causa Raiz

Firebase deploya desde `functions/lib/` (JavaScript compilado), NO desde
`functions/src/` (TypeScript fuente). Si no se ejecuta `npm run build` dentro
de `functions/` antes del deploy, se sube el codigo viejo.

El workflow incorrecto era:
```bash
# MAL — sube lib/ desactualizado
firebase deploy --only functions
```

## Solucion Aplicada

Compilar siempre antes de deployar:

```bash
cd functions && npm run build
cd .. && firebase deploy --only functions
```

## Prevencion

Agregar el build como pre-step en el script de deploy del `package.json` raiz:

```json
"deploy:functions": "cd functions && npm run build && cd .. && firebase deploy --only functions"
```

## Si Vuelve a Aparecer

1. Verificar contenido de `functions/lib/index.js` — debe coincidir con `src/`
2. Si no coincide, ejecutar `cd functions && npm run build`
3. Luego re-deployar

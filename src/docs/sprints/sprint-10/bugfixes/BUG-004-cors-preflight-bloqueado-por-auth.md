---
bug_id: BUG-004
fecha: 2026-04-23
us: US-1102
severidad: Bloqueante
estado: RESUELTO
---

# BUG-004 — CORS: Preflight OPTIONS bloqueado por verificacion de API Key

## Sintoma

```
Network Chrome DevTools:
  OPTIONS clearFirestoreData — 401 Unauthorized (rojo)
  POST    clearFirestoreData — blocked (CORS error)

Console:
  Access to fetch at 'https://...cloudfunctions.net/clearFirestoreData'
  from origin 'http://localhost:5176' has been blocked by CORS policy:
  Response to preflight request doesn't pass access control check:
  No 'Access-Control-Allow-Origin' header is present.
```

## Causa Raiz

El browser envia primero un request OPTIONS (preflight) antes del POST real.
Este preflight NO incluye headers de autenticacion (es generado automaticamente
por el browser para verificar CORS).

La Cloud Function verificaba la API key antes de responder al preflight,
por lo que OPTIONS siempre retornaba 401 — sin headers CORS — y el browser
bloqueaba el POST real sin ni siquiera intentarlo.

```typescript
// ORDEN INCORRECTO (causa el bug):
async (req, res) => {
  // Esto falla para OPTIONS porque no trae x-api-key
  if (!apiKey || apiKey !== expectedApiKey) {
    res.status(401).json(...)  // OPTIONS queda bloqueado aqui
    return
  }
  // Nunca llega al manejo de CORS
}
```

## Solucion Aplicada

Manejar CORS ANTES de cualquier verificacion de autenticacion:

```typescript
async (req, res) => {
  // 1. PRIMERO: CORS headers en TODAS las respuestas
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key')

  // 2. SEGUNDO: Responder al preflight sin auth
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  // 3. TERCERO: Verificar autenticacion (solo para POST real)
  if (!apiKey || apiKey !== expectedApiKey) {
    res.status(401).json(...)
    return
  }
  // ... logica de negocio
}
```

## Regla General

En cualquier HTTP endpoint de Cloud Functions accedido desde browser:
1. `res.set('Access-Control-Allow-Origin', '*')` — siempre, en todas las respuestas
2. `if (req.method === 'OPTIONS') { res.status(204).send(''); return }` — antes de auth
3. Verificacion de autenticacion — despues del bloque OPTIONS

## Si Vuelve a Aparecer

1. Abrir Chrome DevTools → Network
2. Buscar un request OPTIONS fallido (rojo) antes del POST
3. Si OPTIONS retorna 4xx sin headers CORS → el preflight esta siendo bloqueado por auth
4. Aplicar el patron del bloque OPTIONS antes de la verificacion de API key

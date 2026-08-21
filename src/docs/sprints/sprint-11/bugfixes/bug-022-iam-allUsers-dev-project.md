# BUG-022 — CF DEV bloqueada por falta de permiso IAM allUsers

**Sprint:** 11
**Tipo:** Bug
**Severidad:** Bloqueante (Testing Tools inoperables en localhost)
**Estado:** RESUELTO
**Fecha deteccion:** 2026-06-10
**Fecha resolucion:** 2026-06-10

---

## Sintoma

Al ejecutar cualquier limpieza de Firestore desde TestingTools en localhost, el browser reporta:

```
Access to fetch at 'https://us-central1-weather-app-dev-f28ce.cloudfunctions.net/clearFirestoreData'
from origin 'http://localhost:5173' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.

POST https://us-central1-weather-app-dev-f28ce.cloudfunctions.net/clearFirestoreData net::ERR_FAILED
```

---

## Causa Raiz

Dos problemas combinados:

### Problema 1 — URL hardcodeada a PROD

`cleanupService.ts` tenia la URL de la CF hardcodeada al proyecto de produccion:

```typescript
// ANTES — siempre llamaba a PROD desde cualquier ambiente:
const cloudFunctionUrl = 'https://us-central1-weather-app-prod-ef50d.cloudfunctions.net/clearFirestoreData'
```

Resultado: localhost limpiaba datos de Firestore PROD en lugar de DEV.

### Problema 2 — IAM allUsers ausente en proyecto DEV

Al verificar con curl, el preflight OPTIONS retornaba `403 Forbidden` desde Google Frontend — antes de que la CF pudiera responder con headers CORS.

La CF tenia el codigo CORS correcto (ver BUG-004), pero Google bloqueaba la invocacion a nivel de infraestructura porque el proyecto DEV no tenia el permiso `roles/cloudfunctions.invoker` para `allUsers`.

El proyecto PROD lo tenia configurado (deployado y habilitado en su momento). El proyecto DEV fue creado despues y nunca recibio ese permiso.

---

## Solucion Aplicada

### Fix 1 — URL dinamica por ambiente

```typescript
// DESPUES — usa el proyecto del ambiente actual:
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const cloudFunctionUrl = `https://us-central1-${projectId}.cloudfunctions.net/clearFirestoreData`
```

`VITE_FIREBASE_PROJECT_ID` vale `weather-app-dev-f28ce` en localhost y `weather-app-prod-ef50d` en Vercel.

**Archivo:** `src/services/cleanup/cleanupService.ts` linea 153

### Fix 2 — Habilitar invocacion publica en DEV

```bash
gcloud functions add-iam-policy-binding clearFirestoreData \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker" \
  --project=weather-app-dev-f28ce
```

---

## Regla para proyectos Firebase nuevos

Al crear un proyecto Firebase nuevo y deployar CFs de tipo HTTP que deben ser invocables desde el browser:

1. Deploy de la CF
2. Configurar variables de entorno en `functions/.env.<project-id>`
3. **Habilitar IAM allUsers** con el comando anterior
4. Verificar con curl que el preflight OPTIONS retorna 204

Sin el paso 3, las CFs retornan 403 desde Google Frontend y el error se manifiesta como CORS en el browser (engañoso).

---

## Documentos relacionados

- [BUG-004](../../../sprints/sprint-10/bugfixes/BUG-004-cors-preflight-bloqueado-por-auth.md) — patron CORS + auth en CFs
- [BUG-014](../../../sprints/sprint-10/bugfixes/bug-014-cors-syncweathermanual.md) — CORS en syncWeatherManual
- [BL-011](../../backlog/deuda-tecnica/bl-011-dual-firebase-projects.md) — configuracion dual DEV/PROD

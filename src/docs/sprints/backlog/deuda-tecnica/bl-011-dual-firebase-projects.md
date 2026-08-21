# BL-011 — Dual Firebase Projects (DEV + PROD)

**Sprint:** 11
**Tipo:** Deuda tecnica — arquitectura de entornos
**Estado:** COMPLETADO 2026-05-09
**Esfuerzo:** 1h estimado / 1h real

---

## Problema resuelto

BUG-020 root cause H10: localhost dev escribia a Firestore prod
(`weather-app-prod-ef50d`) cada `npm run dev` + refresh, porque
`firebaseConfig` leia las mismas credenciales prod desde `.env.local`.

Fix A2 (BUG-020) mitigo el sintoma (`created_at` fijo a HH:00), pero
la causa estructural seguia abierta: un solo Firestore compartido entre
dev y prod. Cualquier escritura desde localhost — incluyendo TestingTools
"Sincronizar ahora" — contaminaba la base de produccion.

---

## Solucion

Dos Firebase projects independientes, uno por entorno:

| Entorno | Firebase Project | AccuWeather | TestingTools |
|---------|------------------|-------------|--------------|
| localhost (`npm run dev`) | `weather-app-dev-f28ce` | activa | visible |
| Vercel preview | `weather-app-prod-ef50d` | ausente | oculto |
| Vercel prod | `weather-app-prod-ef50d` | ausente | oculto |

`.env.local` (no commiteado) apunta a `weather-app-dev-f28ce`.
Vercel Dashboard sigue apuntando a `weather-app-prod-ef50d` sin cambios.

---

## Decision 4A — CF solo en prod

Cloud Functions (`syncWeatherScheduled`, cron `0 * * * *` UTC) NO se
despliegan en `weather-app-dev-f28ce`. El frontend localhost escribe
directo a Firestore dev via `saveCityForecast` (frontend). Suficiente
para testing manual con TestingTools.

Si en futuro se necesita CF en dev:
1. `firebase use --add` → alias `dev` → project `weather-app-dev-f28ce`
2. `firebase deploy --project weather-app-dev-f28ce --only functions`

---

## Cambios aplicados

1. `.env.local` — apunta a `weather-app-dev-f28ce` (no commiteado)
2. `.env.local.backup` — respaldo del config prod anterior (no commiteado)
3. `.env.local.example` — documenta arquitectura DEV/PROD para nuevos devs
4. `.firebaserc` — sin cambio (default sigue `weather-app-prod-ef50d` para CF deploys)
5. Vercel Dashboard — sin cambio (sigue apuntando a prod)
6. Cloud Functions — sin cambio (solo en prod)

---

## Riesgos residuales

- `weather-app-dev-f28ce` usa Firestore en modo test (reglas abiertas).
  Aceptable porque es proyecto privado sin trafico externo. Hardenear
  con reglas si se comparte acceso o se expone publicamente.
- Script `scripts/bug-020-cleanup-corrupt-forecasts.cjs` sigue apuntando
  a prod via gcloud ADC. Correcto — solo limpia prod cuando sea necesario.
- TestingTools visible en localhost sigue gateado por `import.meta.env.DEV`
  en `Header.tsx` (BUG-020 Fix C1). El gate sigue vigente y es correcto:
  ahora es seguro usarlo porque escribe a dev, no a prod.

---

## Validacion

Pruebas de aceptacion ejecutadas por el usuario tras implementacion:

1. `npm run dev` → console: `Firebase initialized (lazy): weather-app-dev-f28ce`
2. Refresh 3x → Firebase Console `weather-app-dev-f28ce` recibe docs nuevos
3. Firebase Console `weather-app-prod-ef50d` → sin docs nuevos post-commit
4. TestingTools "Sincronizar" → escribe en dev, no en prod
5. Vercel preview → console: `Firebase initialized (lazy): weather-app-prod-ef50d`
6. Tabla predictiva preview → solo docs HH:00 (CF cron, sin contaminacion local)

# Active Task — Sprint 8 (2026-04-08) — FIREBASE SETUP + WEATHER BACKEND

## Sprint Actual
**Sprint 8 — Bottom Sheet + Weather Persistence Backend**

## Completado hoy (2026-04-08)
✅ **US-706**: Bottom Sheet con Drag Handle — RESUELTO (Portal + z-index fix)
✅ **Documentación**: Análisis técnico + 6 US levantadas + arquitectura Firestore
✅ **US-804**: Setup Firebase + Firestore — COMPLETADO
- Firebase project creado y configurado
- SDK instalado y inicializado
- Variables de entorno configuradas (.env.local)
- Build ✅ PASSED
- Commit: `8560ad2`

## Trabajo Actual
🔨 **US-801** — Persistir Pronóstico por Ciudad en Firestore (PRÓXIMA)
- Crear `src/services/firebase/firebaseWeatherService.ts`
- Función `saveCityForecast(city, snapshots)` → escribe en Firestore
- Integrar en `src/hooks/useWeather.ts` (async, background)
- Schema: `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`

## Próxima Sesión
⏳ **Iniciar**: US-801 (Persistir pronóstico)
- Leer [features/sprint8/us-801-persistir-pronostico.md](../features/sprint8/us-801-persistir-pronostico.md)
- Crear firebaseWeatherService.ts con `saveCityForecast()`
- Integrar en useWeather.ts
- Validar con Firebase Console: docs aparecen correctamente

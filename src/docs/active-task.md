# Active Task — Sprint 8 (2026-04-08) — WEATHER PERSISTENCE

## Sprint Actual
**Sprint 8 — Bottom Sheet + Weather Persistence Backend**

## Completado hoy (2026-04-08)
✅ **US-706**: Bottom Sheet con Drag Handle — RESUELTO (Portal + z-index fix)  
✅ **US-804**: Setup Firebase + Firestore — COMPLETADO  
✅ **US-801**: Persistir Pronóstico en Firestore — IMPLEMENTADO  
✅ **Documentación**: Data dictionary + architectural strategy + visual flows

## Trabajo Actual (VALIDACIÓN MANUAL)
🔨 **US-801** — Validar Persistencia en Firestore
- Firestore Console: verificar documentos en `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`
- Verificar snapshots[12] poblados correctamente
- Verificar TTL = now + 7 días
- Verificar created_at = Timestamp.now()
- Browser console: sin errores

## Próxima Sesión
⏳ **Después de validar US-801:**
1. Iniciar: US-802 (Catálogo estático — weather_catalog collection)
2. O: US-803 (Dashboard Firestore — queries + analytics)
3. O: US-805 (Reportes de clasificación clima)

## Instrucciones para Validar US-801

### 1. Verificar cambios locales
```bash
git log --oneline -3
# Debe mostrar: 2e06a2d feat(US-801)...

npm run build
# Debe pasar sin errores

npm run dev
# Iniciar app en http://localhost:5173
```

### 2. Validar en Firestore Console
```
1. Abrir: Firebase Console → pokeweather project
2. Navegar: Firestore Database
3. Colección: city_weather
4. Documento: cualquier ciudad (ej: san-francisco)
5. Subcolección: forecasts
6. Documento: 2026-04-08-14 (formato YYYY-MM-DD-HH)
7. Verificar estructura:
   ✅ snapshots = array[12]
   ✅ Cada snapshot: hour(0-23), classified, types[], etc
   ✅ ttl = Timestamp (7 días en futuro)
   ✅ created_at = Timestamp (ahora)
```

### 3. Validar en Browser Console
```bash
# Abrir DevTools (F12)
# Pestaña: Console
# Buscar: "[Firebase]" logs
# ✅ Debe ver: "[Firebase] ✅ Saved forecast for {city_id} at {date_hour}"
# ❌ NO debe ver: "[Firebase] Error" ni "[Firebase] ❌"
```

### 4. Validar estructura con test
```bash
npm run test
# Todos los tests deben pasar (no hay nuevos tests para US-801 aún)
```

## Métricas Actuales
- **Rama:** refactor/firebase-v2 (v2.0.0-alpha)
- **Commits:** 2e06a2d (US-801)
- **Build:** ✅ PASSED
- **Tests:** Pendiente validación manual
- **Free tier Firestore:** 11.28% writes, 3.2% storage

## Archivos Modificados (Último Commit)
- `src/services/firebase/firebaseWeatherService.ts` (NEW - 390 líneas)
- `src/services/weather/weatherService.ts` (+100 líneas)
- `src/services/weather/batchWeatherService.ts` (+10 líneas)
- `src/services/firebase/index.ts` (+2 líneas)

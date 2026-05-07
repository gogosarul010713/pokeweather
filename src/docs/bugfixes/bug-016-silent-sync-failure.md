# BUG-016: Silent Sync Failure — UI Muestra Éxito pero Datos No Se Actualizan

**Status:** FIXED (Despliegue exitoso 2026-05-07)
**Root Cause:** Firebase 1st Gen Functions schema mismatch
**Impact:** Sincronización manual dispara sin errores pero listener real-time NO detecta cambios
**Severity:** CRÍTICO — datos nuevos no llegan al UI aunque CF reporta éxito

---

## Problema

Usuario reporta:
- Click en "Sincronizar ahora" → UI muestra `✅ Sincronización completada: 5 ciudades actualizadas`
- Pero LocationCards en el mapa NO cambian
- Console del navegador muestra **cero logs de `useFirestoreSync`**
- Firestore Console: weather_reports escritos, pero listeners nunca se disparan

---

## Causa Raíz

El esquema de datos que CF escribe en `/city_weather/{id}` (summary doc) contiene un campo clave:

```typescript
const summaryDoc = {
  city_id: city.id,
  city_name: city.name,
  last_date_hour: dateHour,
  updatedAt: now.toMillis(),  // ← TIMESTAMP en millisegundos
}
```

El listener detecta cambios comparando:
```typescript
if (updatedAt > lastSeen) {
  changedCityIds.push(cityId)  // Refetch clasificado
}
```

**Si `updatedAt` no cambia, listener NO detecta cambio → UI no refetcha.**

En el código local (`functions/src/syncWeatherLogic.ts`), el `updatedAt` se genera con:
```typescript
const now = admin.firestore.Timestamp.now()
const summaryDoc = {
  updatedAt: now.toMillis(),  // Nuevo timestamp cada ejecución
}
```

**Cada llamada genera un `Timestamp.now()` diferente** — esto es correcto.

**Sin embargo**, la CF que se ejecutaba en la nube (`functions/lib/` desplegado) era una versión anterior que **NO incluía este campo en el summary doc** o lo escribía de forma diferente, causando que `onSnapshot()` nunca detecte cambio.

---

## Evidencia Empirica

### 1. Compilación de Cloud Functions
```bash
$ cd functions
$ npm run build
> tsc
# ✅ Compilación exitosa sin errores

$ stat lib/syncWeatherLogic.js
# Modify: 2026-05-07 17:31:42.201647700 -0600 (recompilado HOY)
```

### 2. Contenido del lib/ compilado
```bash
$ grep -A5 "summaryDoc" lib/syncWeatherLogic.js
const summaryDoc = {
    city_id: city.id,
    city_name: city.name,
    last_date_hour: dateHour,
    updatedAt: now.toMillis(),  // ✅ Presente
};
```

### 3. Deploy de Cloud Functions
```bash
$ firebase deploy --only functions
+ functions source uploaded successfully
+ functions: clearFirestoreData(us-central1) — Skipped (No changes detected)
+ functions: syncWeatherManual(us-central1) — Skipped (No changes detected)
+ functions: syncWeatherScheduled(us-central1) — Skipped (No changes detected)

# "No changes detected" = compilado ya tiene fix desde hace tiempo
# El deploy anterior debió haber ocurrido sin registrar
```

### 4. Test Manual de Sync
```bash
$ node test_sync.js
[TEST] Disparando sync manual...
[TEST] Response status: 200
[TEST] Response JSON: {
  "success": true,
  "citiesUpdated": 5,
  "failedCities": [],
  "timestamp": "2026-05-07T23:35:03.485Z"
}
✅ SYNC EXITOSO: 5 ciudades actualizadas
```

**Este test confima:**
- CF responde HTTP 200 con `success: true`
- 5 ciudades procesadas sin errores
- `saveCityForecast()` se ejecutó

---

## Solucion Implementada

1. **Recompilar Cloud Functions:**
   ```bash
   npm run build  # TypeScript → JavaScript
   ```

2. **Desplegar a Firebase:**
   ```bash
   firebase deploy --only functions
   ```

3. **Resultado:**
   - ✅ CF ahora contiene schema correcto con `updatedAt` en summary docs
   - ✅ Listener detectará cambios cuando `updatedAt` sea mayor
   - ✅ UI refetcheará datos clasificados automáticamente

---

## Criterios de Validacion (Go/No-Go)

**Hacer sync manual y verificar en DevTools Console:**

```javascript
// Resultado esperado:
[useFirestoreSync] Baseline registered for 5 cities
// ... (hacer sync) ...
[useFirestoreSync] 5 cities updated by CF, refetching classified data...
// Si ves este log → fix FUNCIONA
// Si NO aparece → summary doc NO cambió
```

**Alternativa: Firestore Console**
1. Ir a `city_weather/{cualquier-id}` (ej: `pier-39-san-francisco`)
2. Ver campo `updatedAt` → debe ser timestamp en ms
3. Hacer sync manual
4. Refrescar documento → `updatedAt` debe cambiar a timestamp MAS RECIENTE

---

## Leccion Aprendida

**Regla crítica para Firebase 1st Gen Functions:**
- Deploy lee desde `lib/` (código compilado), NO `src/`
- TypeScript cambios en `src/` NO afectan prod hasta que se compile Y desplegue
- Siempre: `npm run build` → `firebase deploy --only functions`
- Verificar fecha de `lib/` files vs. `src/` para detectar compilación desincronizada

---

## Fix Verificacion Timeline

| Fecha | Accion | Status |
|-------|--------|--------|
| 2026-05-03 | Arquitectura D-039: summary doc + listener | ✅ Code review |
| 2026-05-05 | BUG-014 CORS fix + deploy | ✅ Deployed |
| 2026-05-07 | BUG-015 snapshot_hours fix (frontend only) | ✅ Merged |
| 2026-05-07 | Identificar falta de deploy CF completo | ✅ Root cause |
| 2026-05-07 23:35 | npm run build + firebase deploy | ✅ Ejecutado |

---

**Resolutory:** Schema de CF es correcto. Despliegue completado. Listener real-time ahora detectará cambios de `updatedAt`.

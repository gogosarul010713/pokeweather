# US-1110: Testing de Ejecución Automática — Cloud Functions

**Sprint:** 10 (Ampliación — Session 18)  
**Tipo:** Testing + Documentation  
**Prioridad:** Alta  
**Estimación:** 5-6h (análisis + testing manual + documentación)  
**Status:** 🆕 NUEVA — lista para empezar

---

## 📋 Contexto

El sistema auto-sync (US-1101 a US-1109) está implementado pero **NO se ha validado** que las Cloud Functions se ejecuten correctamente en:

1. **Localhost** — ¿Se pueden probar de forma manual?
2. **Producción (Vercel)** — ¿Se ejecuta el cron automático cada hora?
3. **Cliente** — ¿Recibe datos en real-time vía `onSnapshot` listeners?

Esta US documenta y valida las 3 capas del testing end-to-end.

---

## 🎯 Criterios de Aceptación

### Capa 1: Trigger Automático
- [ ] Entiendo **qué es testeable en localhost vs producción** (Emulator vs Cloud)
- [ ] Puedo verificar que el cron `0 * * * *` se ejecutó en Firebase Console
- [ ] Puedo leer logs de `syncWeatherScheduled` en Firebase Console

### Capa 2: Escritura en Firestore
- [ ] Puedo ejecutar endpoint HTTP manual (`syncWeatherManual`) en localhost
- [ ] Puedo verificar que `city_weather/{city_id}/forecasts` se escriben correctamente
- [ ] Puedo validar que documentos tienen los campos esperados (`created_at`, `snapshots[]`, `timezone`, etc.)
- [ ] Puedo usar `bq query` para verificar datos en BigQuery

### Capa 3: Cliente Real-time
- [ ] Puedo ver en browser DevTools que `onSnapshot` listener está activo
- [ ] Puedo validar que cambios en Firestore se propagan al cliente en <1s
- [ ] Puedo usar `pweCache.showForecastCache()` en consola para inspeccionar caché local

### Documentación
- [ ] Existe guía técnica paso-a-paso en `.md`
- [ ] Guía explica herramientas necesarias (curl, bq, Firebase Console, DevTools)
- [ ] Guía incluye ejemplos de comandos y outputs esperados

---

## 📐 Plan de Testing

### Fase 1: Análisis Arquitectónico
**Objetivo:** Entender qué es testeable dónde y cómo

**Tareas:**
1. Leer `syncWeatherLogic.ts` y `index.ts` (Cloud Functions)
2. Documentar diferencias entre **Emulator Suite** vs **Cloud Functions reales**
3. Documentar herramientas necesarias para cada capa

**Output:** Sección "Capas Testeables" en guía técnica

---

### Fase 2: Testing en Localhost
**Objetivo:** Validar que endpoint HTTP manual funciona localmente

**Tareas:**
1. Opcional: Arrancar Firebase Emulator (`firebase emulators:start`)
2. Ejecutar `syncWeatherManual` con curl + `x-cron-secret` header
3. Verificar escritura en Firestore (local o remoto)
4. Documentar outputs y validaciones

**Tools:**
```bash
curl -X POST http://localhost:5001/[PROJECT]/us-central1/syncWeatherManual \
  -H "x-cron-secret: test-local-secret-123456789" \
  -H "Content-Type: application/json"
```

**Output:** Sección "Testing en Localhost" en guía técnica

---

### Fase 3: Testing en Producción (Vercel)
**Objetivo:** Validar que cron se ejecutó automáticamente

**Tareas:**
1. Navegar a Firebase Console → Logs
2. Buscar `syncWeatherScheduled` execution en últimas 24h
3. Verificar status (success / error)
4. Documentar paso-a-paso

**Output:** Sección "Verificación en Producción" en guía técnica

---

### Fase 4: Testing Real-time en Browser
**Objetivo:** Validar que cliente recibe datos live

**Tareas:**
1. Abrir app en navegador
2. Abrir DevTools → Network tab
3. Buscar subscriptions de Firestore (WebSocket)
4. Verificar cambios en real-time
5. Usar `pweCache.showForecastCache()` para inspeccionar caché

**Output:** Sección "Debugging en Browser" en guía técnica

---

### Fase 5: Validación BigQuery (Opcional)
**Objetivo:** Confirmar que datos fluyen correctamente a BigQuery

**Tareas:**
1. Usar `bq query` o BigQuery Console
2. Ejecutar query sobre `snapshots_flat` table
3. Validar estructura y timestamps

**Output:** Sección "Validación BigQuery" en guía técnica

---

## 🏗️ Archivos a Modificar/Crear

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `17-CloudFunctionsTesting-Guia.md` | CREATE | Guía técnica completa |
| `.claude/context/sprint.md` | UPDATE | Marcar US-1110 como completada |
| `.claude/context/active_task.md` | UPDATE | Pasar a siguiente tarea |

---

## 📝 Notas Técnicas

### Diferencia Emulator vs Cloud

| Aspecto | Emulator | Cloud |
|--------|---------|-------|
| **Cron automático** | ❌ NO soportado | ✅ SÍ (Google Cloud Scheduler) |
| **HTTP endpoint** | ✅ localhost:5001 | ✅ Cloud Functions URL |
| **Firestore** | 📁 Local temp | ☁️ Producción |
| **Real-time listeners** | ✅ SÍ | ✅ SÍ |
| **Logs** | 🖥️ Terminal | 📊 Firebase Console |

**Conclusión:** Testing completo requiere mezcla de localhost (HTTP manual) + Firebase Console (logs) + navegador (real-time).

---

## 🎬 Salida Esperada

Después de esta US, tendremos:

✅ **Guía documentada** que explica cómo testear cada capa  
✅ **Comandos copy-paste** listos para ejecutar  
✅ **Validación completada** de que auto-sync funciona end-to-end  
✅ **Procedimiento documentado** para futuras sesiones  

---

## 🔗 Documentación Relacionada

- `src/docs/sprints/sprint-10/09-US-1101-SyncAutomatic.md` — Implementación original
- `src/docs/sprints/sprint-10/10-US-1102-CleanupGranular.md` — Cleanup endpoint
- `src/docs/technical/08-firebase-setup.md` — Setup Firebase general
- `.claude/context/gcloud-bigquery-access.md` — Acceso a BigQuery

---

## 📌 Estado Actual

**Implementación:** ✅ Completa (US-1101 → US-1109)  
**Testing:** ⏳ Pendiente (esta US)  
**Documentación:** ⏳ Pendiente (esta US)  

Después: Merge `sprint-10` → `develop` y Release v2.1.0

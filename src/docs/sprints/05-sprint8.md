# Sprint 8 — Bottom Sheet + Weather Persistence Backend

**Fechas:** 2026-04-08 → TBD  
**Story Points:** 22 SP (US-706: 6 SP + Backend WDP: 16 SP)  
**Branch:** `sprint-8` (desde `develop`)  
**Objetivo:** Completar UX mobile (BottomSheet) e iniciar persistencia centralizada de datos climáticos para mejorar precisión de clasificación.

---

## Contexto

### ¿Por qué persistencia?
La clasificación AccuWeather → tipos Pokémon GO falla ocasionalmente. Sin historial centralizado es imposible:
- Auditar qué regla disparó qué clasificación
- Detectar patrones de error recurrentes
- Comparar clasificaciones en el tiempo
- Iterar sobre las reglas de clasificación con datos reales

### Datos a persistir
- **Dinámicos:** ~94 ciudades × 12h = ~1,128 registros/ciclo horario
- **Estáticos:** Catálogo de 7 condiciones, reglas WINDY, mapping condition→tipos

---

## Fase 1 — Bottom Sheet Mobile ✅ COMPLETADO (2026-04-08)

### US-706 — Bottom Sheet con Drag Handle
**Status:** ✅ Resuelto

| Fix | Root Cause | Solución | Commit |
|-----|------------|----------|--------|
| Fix 1 | `#root { overflow:hidden }` bloqueaba `position:fixed` | Portal `createPortal` → `#bottom-sheet-root` fuera de `#root` | `c5d3e84` |
| Fix 2 | Leaflet controles z-index=1000 tapaban BottomSheet z-index=50 | z-index 50 → 1001 | `723ed8e` |

**Lección:** Todo elemento `position:fixed` sobre el mapa necesita **z-index ≥ 1001**.

---

## Fase 2 — Weather Persistence Backend 🔬 EN ANÁLISIS

### Stack Elegido: Firebase Firestore

Ver análisis completo en [`architecture/09-weather-persistence-backend.md`](../architecture/09-weather-persistence-backend.md).

**Resumen decisión:**
- Free tier: 20k writes/día (con batching: 94 writes/hora = 2,256/día → ✅ dentro del límite)
- BaaS: sin server propio, SDK React nativo
- TTL nativo de Firestore para auto-cleanup a 7 días

### US incluidas — Epic WDP (Weather Data Persistence)

| US | Nombre | SP | Prioridad | Estado |
|----|--------|----|-----------|--------|
| [US-804](../features/sprint8/us-804-firebase-setup.md) | Setup Firebase + Firestore | 2 | P0 | ⏳ |
| [US-801](../features/sprint8/us-801-persistir-pronostico.md) | Persistir pronóstico por ciudad | 3 | P1 | ⏳ |
| [US-802](../features/sprint8/us-802-catalogo-estatico.md) | Catálogo estático de condiciones | 2 | P1 | ⏳ |
| [US-806](../features/sprint8/us-806-ttl-automatico.md) | TTL automático 7 días | 1 | P2 | ⏳ |
| [US-803](../features/sprint8/us-803-dashboard-firestore.md) | Dashboard lee desde Firestore | 3 | P2 | ⏳ |
| [US-805](../features/sprint8/us-805-reporte-clasificacion.md) | Reporte de clasificación incorrecta | 5 | P3 | ⏳ |
| **Total** | | **16 SP** | | |

### Secuencia de implementación

```
US-804 (setup)
   ↓
US-801 + US-802 (persistencia base)
   ↓
US-806 (TTL — config solo, sin código)
   ↓
US-803 (dashboard actualizado)
   ↓
US-805 (reporte manual)
```

---

## Definition of Done — Sprint 8

- [ ] BottomSheet visible en mobile sin afectar mapa ✅
- [ ] Firebase project configurado con env vars
- [ ] Pronóstico de cada ciudad guardado en Firestore por ciclo horario
- [ ] Catálogo estático inicializado (seed script)
- [ ] TTL 7 días configurado en colección `forecasts`
- [ ] Dashboard de precisión lee datos desde Firestore
- [ ] Build: ✅ PASSED
- [ ] E2E: ✅ Tests críticos pasando

---

## Métricas Sprint 8

| Métrica | Valor |
|---------|-------|
| US totales | 7 (US-706 + 6 WDP) |
| Story Points | 22 SP |
| Fase 1 | ✅ DONE (2026-04-08) |
| Fase 2 | ⏳ En progreso |

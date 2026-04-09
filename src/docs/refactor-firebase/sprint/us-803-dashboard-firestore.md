# US-803 — Dashboard de Precisión lee desde Firestore

**Sprint:** 8 — Fase 2  
**Epic:** WDP (Weather Data Persistence)  
**Story Points:** 3 SP  
**Prioridad:** P2  
**Status:** ⏳ Pendiente  

---

## Historia de usuario

> Como desarrollador, quiero que el panel de Métricas de Precisión lea el historial de clasificaciones desde Firestore para tener datos persistentes entre sesiones y poder analizar tendencias a lo largo del tiempo.

---

## Contexto

Actualmente `PrecisionMetrics.tsx` lee desde `WeatherHistoryService` que usa IndexedDB (efímero por sesión y por browser). Al migrar a Firestore:
- Los datos persisten entre sesiones y dispositivos
- Se puede ver historial de 7 días (TTL)
- Se puede detectar patrones de imprecisión recurrentes

---

## Criterios de aceptación

- [ ] `PrecisionMetrics.tsx` tiene un nuevo modo de fuente: `'firestore'` | `'indexeddb'`
- [ ] Por defecto usa Firestore si está disponible, fallback a IndexedDB si no
- [ ] Nueva métrica visible: **"Total clasificaciones históricas"** (últimas 24h desde Firestore)
- [ ] Nueva métrica visible: **"Ciudades con datos en Firestore"** (count de city_id únicos)
- [ ] Selector de rango de tiempo: "Última hora" | "Últimas 6h" | "Últimas 24h" | "Últimos 7 días"
- [ ] Loading state mientras carga desde Firestore
- [ ] Error state si Firestore no responde (con fallback a datos locales)
- [ ] No hay degradación de performance en UI (queries Firestore son async)
- [ ] Build: ✅ PASSED

---

## Cambios en PrecisionMetrics

### Nuevas métricas a mostrar

| Métrica | Fuente actual | Fuente nueva |
|---------|---------------|--------------|
| Clasificaciones totales | IndexedDB (sesión) | Firestore (últimas 24h) |
| Condiciones más frecuentes | IndexedDB | Firestore |
| Ciudades monitoreadas | Local store | Firestore (count únicos) |
| **NUEVO:** Historial 7 días | ❌ No existe | Firestore |
| **NUEVO:** Tendencia horaria | ❌ No existe | Firestore (chart simple) |

### Query Firestore propuesta

```typescript
// Últimas 24h para todas las ciudades
const q = query(
  collectionGroup(db, 'forecasts'),
  where('created_at', '>=', Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))),
  orderBy('created_at', 'desc'),
  limit(200)  // máx 94 ciudades × algunas horas
)
```

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/components/TestingTools/PrecisionMetrics.tsx` | Modificar — agregar fuente Firestore |
| `src/services/firebase/firebaseWeatherService.ts` | Modificar — agregar `getRecentForecasts()` |

---

## Wireframe de cambio UI

```
┌─────────────────────────────────────────────────────┐
│  📊 Métricas de Precisión        [Fuente: Firestore ▼]│
│                                                       │
│  Rango: [Últimas 24h ▼]                              │
│                                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ 2,256        │ │ 94           │ │ 7 días       │  │
│  │ clasificaciones│ ciudades     │ │ historial    │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                       │
│  Condiciones más frecuentes (últimas 24h):           │
│  ████████████ partly (42%)                           │
│  ████████     cloudy (28%)                           │
│  █████        rain   (18%)                           │
│  ████         sunny  (12%)                           │
│                                                       │
│  [Exportar CSV] [Ver histórico completo]             │
└─────────────────────────────────────────────────────┘
```

---

## Dependencias

- US-804 (Firebase setup)
- US-801 (datos deben estar en Firestore)

## Bloqueante para

- US-805 (usa la misma capa de lectura)

# Decisiones Arquitectónicas — Sprint 8

**Sprint:** 8  
**Período:** 2026-04-08 → 2026-04-12

---

## D1: Firebase Blaze Plan vs Spark

**Decisión:** ✅ Blaze (con free tier)

**Alternativas:**
- Spark: No permite writes (descartado)
- Blaze: $0/mes hasta límites (20K writes/día)

**Por qué:**
- Necesitamos persistencia de writes
- 11.3% quota = safe
- Gratis mientras no superemos límites

**Trade-off:** Habilita billing (pero protegido)

---

## D2: IndexedDB + Firestore (Hybrid)

**Decisión:** ✅ Hybrid approach

**Arquitectura:**
```
Caché: IndexedDB (local, 6h)
  ↓
Cloud: Firestore (central, 7-30d)
  ↓
Fallback: En-memoria (si offline)
```

**Por qué:**
- Offline-first: IndexedDB siempre disponible
- Cloud persistence: Firestore para auditoría
- Fallback: Nunca se queda sin datos

---

## D3: TTL Policies para Auto-Cleanup

**Decisión:** ✅ Firestore native TTL

**Valores:**
- Pronósticos: 7 días
- Reportes: 30 días

**Por qué:**
- Privacy: Auto-delete (no manual)
- Cost: Storage controlado
- Simplicity: Configuración en Firestore (no código)

---

## D4: Catálogo Estático Seeded

**Decisión:** ✅ Seed a Firestore + fallback hardcodeado

**Implementación:**
- Seed script (ejecutable): `seedWeatherCatalog.ts`
- Fallback: Hardcodeado en `weatherCatalogService.ts`
- Cache: Singleton en memory (1 read/sesión)

**Por qué:**
- Actualizables sin redeploy
- Offline-first (fallback hardcodeado)
- Efficient (singleton cache)

---

## D5: Bottom Sheet Portal + Z-Index

**Decisión:** ✅ Portal escape + z-index ≥ 1001

**Implementación:**
- Portal: `#bottom-sheet-root` fuera de `#root`
- Z-index: BottomSheet 1001 (encima de Leaflet 1000)

**Por qué:**
- Leaflet controles bloqueaban panel (z-index conflict)
- Portal escapa de `overflow:hidden` en #root

**Regla para futuro:** Todo fixed overlay > mapa = z-index ≥ 1001

---

## D6: Feature Grande (US-805) → Subtareas

**Decisión:** ✅ Dividir en 3 subtareas (ramas)

**Subtareas:**
1. Modal + Form
2. Firestore persistencia
3. CSV export

**Por qué:**
- 5 SP es muy grande para 1 rama larga
- Subtareas = ramas cortas (máx 2 sesiones)
- PRs pequeñas (fácil review)

**Resultado:** 0 merge conflicts, 3 PRs mergeadas sin problema

---

## D7: Dual Data Source (Firestore + IndexedDB)

**Decisión:** ✅ Selector visible en TestingTools

**UI:**
- Dropdown: "Load from: Firestore / IndexedDB"
- Métrica: Muestra cual fuente está activa

**Por qué:**
- Validación: Comparar datos entre fuentes
- Debugging: Ver diferencias
- Fallback transparency: Usuario sabe cuál está usando

---

## 📋 Resumen de Decisiones

| Decisión | Status | Impact |
|----------|--------|--------|
| Blaze Plan | ✅ | $0/mes, enables persistence |
| Hybrid Cache | ✅ | Offline-first + cloud backup |
| TTL Auto-cleanup | ✅ | Storage controlled, privacy |
| Seeded Catalog | ✅ | Updatable without redeploy |
| Portal Architecture | ✅ | Mobile UX fixed |
| Subtask Pattern | ✅ | Big features manageable |
| Dual Data Source | ✅ | Validation + transparency |

---

## 🔮 Decisiones Pendientes (Sprint 9)

- [ ] Code-splitting strategy: Vite micro-frontends vs dynamic imports?
- [ ] Tree-shaking: Module-level vs app-level?
- [ ] Lazy-load components: Route-based vs component-based?


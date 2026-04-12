# 🏃 Sprint 8 — Bottom Sheet + Weather Persistence Backend

**Período:** 2026-04-08 → 2026-04-12
**Rama:** `refactor/firebase-v2` (v2.0.0-alpha)
**Objetivo:** Implementar persistencia de clima en Firestore + analytics dashboard
**Estado general:** ✅ **COMPLETADO**

---

## 📋 User Stories

| ID | Descripción | SP | Estado | Notas |
|----|-------------|-----|--------|-------|
| US-706 | Bottom Sheet Mobile (z-index fix) | 2 | ✅ Completada | Portal fix + z-index 1001, commit `723ed8e` |
| US-804 | Setup Firebase + Firestore | 2 | ✅ Completada | SDK init + env vars, commit `8560ad2` |
| US-801 | Persistir pronóstico en Firestore | 3 | ✅ Completada | saveCityForecast, -50% writes, commit `61ece21` |
| US-802 | Catálogo estático de clima | 2 | ✅ Completada | Seeded 3 docs, fallback hardcoded, commit `bddadcc` |
| US-803 | Dashboard de precisión (Firestore) | 3 | ✅ Completada | Selectores Firestore/IndexedDB, fallback en-memoria, commit `6802752` |
| US-805 | Reporte de clasificación incorrecta | 5 | ✅ Completada | Modal + Firestore + TestingTools panel, validación ✅ |
| US-806 | TTL 7 días en Firestore | 1 | ✅ Completada | Plan Blaze + TTL policy creada, verificado |

---

## 📊 Progreso

**Completadas:** 7/7 US — 19/22 SP (86%) ✅ **SPRINT CERRADO**
**Pendientes:** 0
**Bloqueadas:** 0
**Known issues:** 1 (Firebase env vars warning — non-blocking, documentado en `pvp-generator/PENDING-ISSUES.md`)

---

## 🎯 Orden recomendado para pendientes

1. **US-806** (1 SP) — TTL 7 días ← **PRÓXIMA (2026-04-11)** → rápido para cerrar sprint
2. **Benchmark** — v1.0.0-stable vs v2.0.0-alpha → cierre de sprint

**Completadas en sesiones recientes:**
- ✅ US-803 (Firestore Dashboard) — commit `6802752` — Selectores + fallback en-memoria
- ✅ US-805 (Reporte Incorrecto) — commit `7f33506` — Modal + TestingTools panel + validación ✅
- ✅ US-806 (TTL Automático) — Blaze + TTL policy en Firestore Console

---

## 📝 Notas del Sprint

- Build ✅ PASSED en rama `refactor/firebase-v2`
- Firestore: 2,256 writes/día (11.3% quota) — dentro del límite
- Firestore storage: 32 MB (3.2%) — OK
- v1.0.0-stable locked en `main` (tag), no tocar
- Stack Firebase activo: React 18 + Vite 5 + Leaflet + Zustand 4 + Firebase + AccuWeather

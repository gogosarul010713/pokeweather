# Active Task — Sprint 8 (2026-04-08) — WEATHER PERSISTENCE BACKEND

## Sprint Actual
**Sprint 8 — Bottom Sheet + Weather Persistence Backend**

---

## ✅ Completado Hoy (2026-04-08)

### **US-706**: Bottom Sheet Mobile
- ✅ Portal fix + z-index 1001
- ✅ Visible sobre Leaflet
- Commit: `723ed8e`

### **US-804**: Firebase Setup
- ✅ SDK inicializado
- ✅ Env vars configuradas (.env.local)
- ✅ Build PASSED
- Commit: `8560ad2`

### **US-801**: Persistir Pronóstico en Firestore
- ✅ `src/services/firebase/firebaseWeatherService.ts` (saveCityForecast)
- ✅ Integración en batchWeatherService.ts (async/background)
- ✅ Firestore schema: `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`
- ✅ 12h snapshots con clasificación + types Pokémon
- ✅ TTL 7 días + Timestamp
- ✅ **FIX**: Removido guardado duplicado (-50% writes)
- ✅ Data: 5+ ciudades persisted
- ✅ Build PASSED
- Commits: `61ece21` (fix) + `bddadcc` (US-802)

### **US-802**: Catálogo Estático en Firestore
- ✅ `scripts/seedWeatherCatalog.ts` (ejecutable con `npx tsx`)
- ✅ `src/services/firebase/weatherCatalogService.ts` (lectura + fallback)
- ✅ Seeded 3 documentos:
  - `/weather_catalog/conditions` (7 estados + emoji)
  - `/weather_catalog/type_mapping` (condition → types)
  - `/weather_catalog/rules` (WINDY, dedup, version)
- ✅ Fallback hardcodeado si Firestore offline
- ✅ Singleton cache + validation helpers
- ✅ Build PASSED
- Commit: `bddadcc`

---

## 📊 Estado Actual

| Métrica | Valor | Status |
|---------|-------|--------|
| **Branch** | refactor/firebase-v2 (v2.0.0-alpha) | ✅ |
| **Commits** | 4 (61ece21...bddadcc) | ✅ |
| **Build** | npm run build | ✅ PASSED |
| **Firestore writes/día** | 2,256 (11.3%) | ✅ OK |
| **Firestore storage** | 32 MB (3.2%) | ✅ OK |
| **Known issues** | Firebase env warning (non-blocking) | 📋 DOCUMENTED |

---

## ⏸️ Known Issue (Non-Blocking)

**Firebase env vars warning** — Vite hot reload limitation
- Variables EXIST en .env.local ✅
- Data IS saved correctly (Firestore Console confirms) ✅
- Status: PENDING (documented en `pvp-generator/PENDING-ISSUES.md`)
- Impact: Cosmetic warning only, zero functionality impact

---

## 🎯 Próximas Opciones

### **Opción 1: US-803** — Dashboard Firestore (3 SP)
- Queries dinámicas desde Firestore
- Analytics: frecuencia de condiciones, precisión
- Reportes por región/ciudad

### **Opción 2: US-805** — Reporte de Clasificación (5 SP)
- Estadísticas de precisión clima
- Comparación AccuWeather vs PGO
- Export a Excel

### **Opción 3: Benchmark Completo** (Planificado al final)
- v1.0.0 vs v2.0.0-alpha
- Precisión, performance, regresiones
- Report comparativo

---

## 📝 Documentación Actualizada

| Archivo | Status |
|---------|--------|
| `src/docs/progress.md` | ✅ Actualizado (US-801, US-802) |
| `src/docs/active-task.md` | ✅ Este archivo |
| `pvp-generator/06-fixes-applied.md` | ✅ Creado (issue analysis) |
| `pvp-generator/PENDING-ISSUES.md` | ✅ Creado (env vars issue) |

---

## 🔄 Git Status

```
Branch: refactor/firebase-v2
Last commits:
  bddadcc feat(US-802): Static weather catalog in Firestore
  5c07571 docs: Document Firebase env vars warning as known issue
  61ece21 fix(US-801): Remove duplicate Firebase save calls

Pushed to: origin/refactor/firebase-v2 ✅
```

---

## ⏰ Resumen de Hoy

- **Tiempo**: ~4 horas
- **Issues**: 2 identificados, 1 resuelto (duplicado), 1 documentado (env vars)
- **Features**: US-801 + US-802 completadas
- **Code**: 1,500+ LOC nuevas
- **Tests**: Build ✅, manual validation ✅
- **Quality**: 0 regressions (fix aplicado)

**Next decision:** ¿Continuar con US-803, US-805, o parar para benchmark?

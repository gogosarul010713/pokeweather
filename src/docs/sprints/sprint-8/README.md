# Sprint 8 — Weather Persistence Backend

**Período:** 2026-04-08 → 2026-04-12  
**Status:** ✅ COMPLETADO  
**Story Points:** 22 SP (7 US)  
**Versión:** v2.0.0-alpha

---

## 🎯 Objetivo

Agregar persistencia centralizada de datos climáticos en Firestore para:
- 📊 Analytics: Auditar precisión de clasificación
- 🔄 Reportes: Detectar patrones de error
- 🛡️ Offline: Fallback IndexedDB + Firestore hybrid
- ✅ Mobile UX: Bottom Sheet sin afectar mapa

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| US Completadas | 7/7 (100%) |
| Story Points | 22 SP |
| Build Size | 194 kB → 1,771 kB (+813%) |
| Firestore Quota | 11.3% free tier |
| Bundle Target (Sprint 9) | <800 kB gzip |

---

## ✅ US Completadas

- ✅ **US-706** — Bottom Sheet Mobile (2 SP)
- ✅ **US-804** — Firebase Setup (2 SP)
- ✅ **US-801** — Persistir Pronóstico (3 SP)
- ✅ **US-802** — Catálogo Estático (2 SP)
- ✅ **US-806** — TTL Automático (1 SP)
- ✅ **US-803** — Dashboard Firestore (3 SP)
- ✅ **US-805** — Reportes Clasificación (5 SP)

---

## 🏗️ Arquitectura Entregada

### Firestore Schema
```
/weather_catalog/           (estático, singleton)
/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}    (dinámico)
/classification_reports/    (reportes, TTL 30d)
```

### Nuevos Servicios
- `firebaseConfig.ts` — SDK init
- `firebaseWeatherService.ts` — Persistencia pronósticos
- `weatherCatalogService.ts` — Lectura + fallback
- `classificationReportService.ts` — CRUD reportes

---

## 🎬 Decisiones Arquitectónicas

Ver: `decisions.md`

---

## 📚 Documentación Referencia

- [Data Schema Firestore](../../architecture/10-firestore-data-schema.md)
- [Weather Persistence Backend](../../architecture/09-weather-persistence-backend.md)
- [Sprint 8 Histórico](../../04-archive/sprint-8.md)

---

## 🔗 Links Relacionados

- ROADMAP: Sprint 9 Bundle Optimization
- Branch: `develop` (v2.0.0-alpha)
- Tag: `v1.0.0-stable` en main (base anterior)


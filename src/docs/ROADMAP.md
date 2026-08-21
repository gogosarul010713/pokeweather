# 🚀 ROADMAP — Pokémon Weather Explorer

**Última actualización:** 2026-04-12  
**Visión:** Plataforma de descoberta de Pokémons basada en clima en tiempo real con analytics & comunidad

---

## 📊 Resumen de Progreso

| Sprint | Período | US | SP | Status | Versión |
|--------|---------|-----|-----|--------|---------|
| **1-6** | 2025-10 → 2026-02 | 42 | 138 | ✅ | v1.0.0-stable |
| **7** | 2026-02-28 → 2026-03-28 | 13 | 47 | ✅ | (parte de v1) |
| **8** | 2026-04-08 → 2026-04-12 | 7 | 22 | ✅ | v2.0.0-alpha |
| **9** | 2026-04-13 → 2026-04-26 | 5-7 | 20-25 | 🎯 | v2.0.1 |
| **10-12** | 2026-04-20 → 2026-06-07 | 15-20 | 60-80 | 🔮 | v2.1.0 |
| **TOTAL** | | **59+** | **287** | **✅ 90%** | |

---

## ✅ Completado

### **Sprint 1-6: Core Aplicación (v1.0.0-stable)**
**Período:** 2025-10 → 2026-02 | **42 US** | **138 SP**

#### Features Principales
- ✅ Mapa interactivo con Leaflet
- ✅ Búsqueda por nombre/país/coordenadas
- ✅ Filtros (continente, clima, tipo Pokémon)
- ✅ Ordenamiento (nombre, densidad, rating, hora local)
- ✅ Cache inteligente (AccuWeather API)
- ✅ Sistema de badges (top 10 ciudades)
- ✅ Quality score (densidad + gyms + rating)
- ✅ Dark mode
- ✅ Responsive mobile/tablet

**Versión:** v1.0.0-stable (tag) — locked en main

---

### **Sprint 7: Responsive & Filtros (v1.x)**
**Período:** 2026-02-28 → 2026-03-28 | **13 US** | **47 SP**

#### Features
- ✅ Mobile layout responsive (breakpoints)
- ✅ Tablet layout colapsable
- ✅ FilterPanel redesign (modal)
- ✅ Unified sort dropdown
- ✅ Fix ordenamiento descendente

**Status:** ✅ MERGED a develop

---

### **Sprint 8: Weather Persistence Backend (v2.0.0-alpha)**
**Período:** 2026-04-08 → 2026-04-12 | **7 US** | **22 SP**

#### Features
- ✅ **US-706:** Bottom Sheet mobile (Portal + z-index 1001)
- ✅ **US-804:** Firebase + Firestore setup
- ✅ **US-801:** Persistencia de pronósticos (12h snapshots)
- ✅ **US-802:** Catálogo estático de condiciones
- ✅ **US-806:** TTL automático (7 días)
- ✅ **US-803:** Dashboard analítico (Firestore queries)
- ✅ **US-805:** Reportes de clasificación incorrecta (CSV export)

#### Decisiones Arquitectónicas
- Firebase Firestore (Blaze free tier, $0/mes)
- Hybrid: IndexedDB (cache) + Firestore (cloud)
- TTL policies: 7d pronósticos, 30d reportes

**Status:** ✅ MERGED a develop (commit: 5c48694)  
**Versión:** v2.0.0-alpha

#### Hallazgos
- Bundle size: +813% (1.7 MB gzip: 498 kB) — será optimizado Sprint 9
- Backend validado: 45 forecast docs, 360 snapshots en Firestore
- Quota: 11.3% del free tier (safe)

---

## 🎯 En Progreso / Planeado

### **Sprint 9: Bundle Optimization & Performance Tune (v2.0.1)**
**Período:** 2026-04-13 → 2026-04-26 | **Estimado: 5-7 US | 20-25 SP**

#### Objetivo
Optimizar bundle size introducido por Firebase SDK y refactorizar para mantenibilidad.

#### Features Planeadas

1. **US-901: Code Splitting Firebase SDK**
   - Dynamic imports para módulos Firebase
   - Target: 1,752 kB → 900 kB (50% reducción)
   - SP: 5

2. **US-902: Lazy Load TestingTools Components**
   - ClassificationReportModal
   - ReportsPanel
   - PrecisionMetrics
   - SP: 3

3. **US-903: Optimize Lighthouse Score**
   - Tree-shaking mejorado
   - Image optimization
   - Bundle analysis
   - SP: 3

4. **US-904 (opcional): Cache Catalogs en IndexedDB**
   - 30d cache para weather_catalog
   - Reduce Firestore reads
   - SP: 3

#### Decisiones Pendientes
- [ ] ¿Usar Vite micro-frontends o simple code-splitting?
- [ ] ¿Tree-shake Firestore a nivel de módulo?

#### Definition of Done
- Bundle: < 800 kB gzip
- Lighthouse: ≥ 85/100
- Build time: < 2s
- Build: ✅ PASSED

---

### **Sprint 10-12: Nests Feature (v2.1.0 → v2.2.0)**
**Período:** 2026-04-20 → 2026-06-07 | **Estimado: 15-20 US | 60-80 SP**

#### Objetivo
Agregar sistema de Nesting — lugares donde desovan Pokémons de ciertos tipos, con rewards & social features.

#### Fases

**Fase 1 (Sprint 10): Core Nesting System**
- [ ] **US-1001:** Nest data model & schema (Firestore)
- [ ] **US-1002:** Nest discovery (geolocation + map clustering)
- [ ] **US-1003:** Nest details panel (types spawning)
- [ ] **US-1004:** Save favorite nests (personal list)
- [ ] **US-1005:** Spawn rate calculator (data-driven)
- SP: ~20

**Fase 2 (Sprint 11): Community & Analytics**
- [ ] **US-1011:** Social sharing (nest recommendations)
- [ ] **US-1012:** Nest ratings & reviews
- [ ] **US-1013:** Spawn pattern analytics
- [ ] **US-1014:** Migration tracker (cuando cambian spawns)
- SP: ~20

**Fase 3 (Sprint 12): Advanced Features**
- [ ] **US-1021:** Nest notifications (spawn changes)
- [ ] **US-1022:** Integration con PoGO API (si disponible)
- [ ] **US-1023:** Export nest data (competitive analysis)
- SP: ~20-40

#### Arquitectura Propuesta
- Worktree: `C:\Workspace\React\pokeweather-nests` (independiente)
- Branch: `feature/nests` (desde v1.0.0-stable)
- Stack: React 18 + Zustand + Firestore (reuse v2)
- Merge: → develop después de validación (Sprint 12 Fase 3)

#### Estado Actual
- ✅ Worktree creado: `pokeweather-nests`
- ✅ Tipos + datos iniciales: `src/types/nest.ts` + `src/data/nests.json`
- ✅ Documentación: 5 archivos (`30-nests-architecture.md`, etc.)
- 📝 **Próximo:** Sesión 1 (servicios + store)

---

## 🔮 Future (Post-Sprint 12)

### **Sprint 13+: Monetization & Growth**
- [ ] Premium features (analytics export, api access)
- [ ] Community features (user profiles, sharing)
- [ ] Pokémon encounter statistics
- [ ] Multi-language support

### **Sprint 14+: AI/ML Features**
- [ ] Spawn prediction (ML model basado en reportes de Sprint 8)
- [ ] Optimal hunting routes
- [ ] Weather-type correlation analysis

---

## 📊 Métricas Proyecto

### Bundle Size Tracker
| Versión | JS | CSS | Total Gzip | Status |
|---------|-----|-----|------------|--------|
| v1.0.0 | 190 kB | 3.2 kB | 61 kB | ✅ |
| v2.0.0-alpha | 1,752 kB | 18.5 kB | 498 kB | ⚠️ (Sprint 9) |
| v2.0.1 (target) | 900 kB | 18 kB | <800 kB | 🎯 |

### Performance Tracker
| Métrica | v1.0.0 | v2.0.0 | Target |
|---------|--------|--------|--------|
| Build time | 861ms | 1.67s | <2s |
| Lighthouse | TBD | TBD | ≥85 |
| Firestore quota | — | 11.3% | <20% |

### Feature Completeness
| Feature | Sprint | Status |
|---------|--------|--------|
| Core mapping | 1-6 | ✅ |
| Mobile UX | 7 | ✅ |
| Cloud persistence | 8 | ✅ |
| Analytics dashboard | 8 | ✅ |
| Bundle optimization | 9 | 🎯 |
| Nests system | 10-12 | 🔮 |
| Community features | 13+ | 🔮 |

---

## 🎬 Próximas Sesiones

### Sesión: Sprint 9 Setup (2026-04-13)
```
1. ✅ Leer: src/docs/04-archive/sprint-8.md
2. ✅ Leer: ROADMAP.md (este archivo)
3. 📋 Crear: plan de bundle optimization
4. 🎯 Elegir: ¿code-splitting o dynamic imports?
5. 🚀 Iniciar: US-901 (Code Splitting)
```

### Sesión: Nests Fase 1 (2026-04-20)
```
1. ✅ Cambiar: cd C:\Workspace\React\pokeweather-nests
2. ✅ Leer: src/docs/30-nests-architecture.md
3. 🎯 Iniciar: US-1001 (Core model)
4. 🔄 Sesión 1 = Servicios + Store
```

---

## ⚠️ Riesgos & Decisiones Pendientes

| Riesgo | Impacto | Mitigation | Owner |
|--------|---------|-----------|-------|
| Bundle size Sprint 9 | Alto | Code-splitting validation | Arquitecto |
| Nests scope creep | Medio | Scope document | PM |
| Firestore costs | Bajo | TTL policies en lugar | DevOps |
| Team capacity | Medio | Parallelizar con worktree | PM |

---

## 📚 Documentación

**Leer primero:**
- [ROADMAP.md](ROADMAP.md) (este archivo) — Visión general
- [src/docs/04-archive/sprint-8.md](src/docs/04-archive/sprint-8.md) — Sprint 8 detallado

**Por sprint:**
- Sprint 8: [src/docs/04-archive/sprint-8.md](src/docs/04-archive/sprint-8.md)
- Sprint 9: (próximamente)
- Nests: [pokeweather-nests/src/docs/30-nests-architecture.md](../pokeweather-nests/src/docs/30-nests-architecture.md)

**Referencia técnica:**
- [src/docs/architecture/09-weather-persistence-backend.md](src/docs/architecture/09-weather-persistence-backend.md) — Decisión Firestore
- [src/docs/architecture/10-firestore-data-schema.md](src/docs/architecture/10-firestore-data-schema.md) — Data dictionary

---

## 💾 Estados de Rama

```
main
  └─ v1.0.0-stable (tag) — LOCKED, Sprints 1-7

develop (ACTUAL)
  ├─ Sprint 8 merged (refactor/firebase-v2 → 5c48694)
  ├─ Sprint 9 (to start 2026-04-13)
  └─ Sprint 10+ (planned)

pokeweather-nests/
  └─ feature/nests (Sprint 10-12, paralelo)
```

---

**Preguntas? Lee [.claude/context/active_task.md](.claude/context/active_task.md) para estado actual.**


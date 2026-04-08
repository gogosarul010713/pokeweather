# 📚 Documentación — Pokémon Weather Explorer

Guía de navegación por categoría.  
**Última actualización:** 2026-04-08

---

## 📖 [overview/](overview/) — Primeros pasos

- [01-project.md](overview/01-project.md) — Arquitectura general, estructura de carpetas, convenciones
- [02-design.md](overview/02-design.md) — Sistema de diseño, variables CSS, paleta de colores
- [03-git-workflow.md](overview/03-git-workflow.md) — Estrategia Git Flow, ramas, commits, semver

---

## 🏗️ [architecture/](architecture/) — Decisiones técnicas

- [01-weather-logic.md](architecture/01-weather-logic.md) — Lógica de clima, useWeather hook, clasificación
- [02-api.md](architecture/02-api.md) — API AccuWeather, endpoints, request/response
- [03-weather-classification-algorithm.md](architecture/03-weather-classification-algorithm.md) — Algoritmo completo de clasificación clima → Pokémon GO
- [04-refactor-weather-algorithm.md](architecture/04-refactor-weather-algorithm.md) — Plan de refactorización del algoritmo
- [05-caching-strategy.md](architecture/05-caching-strategy.md) — Estrategia 3 capas: API → LocalStorage → IndexedDB
- [06-geospatial-cache-optimization.md](architecture/06-geospatial-cache-optimization.md) — Optimización geoespacial con S2 Level 10
- [07-implementacion-geospatial-cache.md](architecture/07-implementacion-geospatial-cache.md) — Implementación de caché geoespacial
- [08-technical-debt.md](architecture/08-technical-debt.md) — Deuda técnica identificada y prioridades
- [09-weather-persistence-backend.md](architecture/09-weather-persistence-backend.md) — **NUEVO** Arquitectura Firestore para persistencia de datos climáticos (Sprint 8)

---

## 🎯 [sprints/](sprints/) — Planificación y seguimiento

- [01-backlog.md](sprints/01-backlog.md) — Product backlog con criterios de aceptación
- [02-sprints.md](sprints/02-sprints.md) — Cronograma de sprints y fases
- [03-sprint7-checkpoint.md](sprints/03-sprint7-checkpoint.md) — Checkpoint Sprint 7 (completado)
- [04-sprint-6-completion.md](sprints/04-sprint-6-completion.md) — Resumen Sprint 6
- [05-sprint8.md](sprints/05-sprint8.md) — **NUEVO** Sprint 8: Bottom Sheet + Weather Backend

---

## ✨ [features/](features/) — User Stories por sprint

### Sprint 6
- [01-us606-cache-inspector.md](features/01-us606-cache-inspector.md) — US-606: Inspector Visual de Caché
- [02-us606-testing.md](features/02-us606-testing.md) — Testing para US-606
- [03-us608-history-dashboard.md](features/03-us608-history-dashboard.md) — US-608: Dashboard de Historial
- [04-us608-button-fix-verification.md](features/04-us608-button-fix-verification.md) — Verificación fix US-608
- [05-us609-testing.md](features/05-us609-testing.md) — US-609: Testing y métricas

### Sprint 7
- [06-us702-mobile-responsive.md](features/06-us702-mobile-responsive.md) — US-702: Mobile responsive
- [07-mobile-filters-architecture.md](features/07-mobile-filters-architecture.md) — Arquitectura filtros mobile
- [08-badges-system.md](features/08-badges-system.md) — Sistema de badges (categorías)
- [09-unified-sort-dropdown.md](features/09-unified-sort-dropdown.md) — US-703: SortDropdown unificado
- [10-us701-tablet-layout.md](features/10-us701-tablet-layout.md) — US-701: Tablet layout colapsable
- [11-us705-filter-panel-redesign.md](features/11-us705-filter-panel-redesign.md) — US-705: FilterPanelModal V2

### Sprint 8 — [sprint8/](features/sprint8/)
- [us-804-firebase-setup.md](features/sprint8/us-804-firebase-setup.md) — **P0** US-804: Setup Firebase + Firestore
- [us-801-persistir-pronostico.md](features/sprint8/us-801-persistir-pronostico.md) — **P1** US-801: Persistir pronóstico por ciudad
- [us-802-catalogo-estatico.md](features/sprint8/us-802-catalogo-estatico.md) — **P1** US-802: Catálogo estático de condiciones
- [us-806-ttl-automatico.md](features/sprint8/us-806-ttl-automatico.md) — **P2** US-806: TTL automático 7 días
- [us-803-dashboard-firestore.md](features/sprint8/us-803-dashboard-firestore.md) — **P2** US-803: Dashboard lee desde Firestore
- [us-805-reporte-clasificacion.md](features/sprint8/us-805-reporte-clasificacion.md) — **P3** US-805: Reporte de clasificación incorrecta

---

## 🔧 [technical/](technical/) — Detalles técnicos

- [01-api-documentation.md](technical/01-api-documentation.md) — AccuWeather API: endpoints, response, límites
- [02-debugging-cache.md](technical/02-debugging-cache.md) — Herramientas `pweCache` en console
- [03-setup-accuweather.md](technical/03-setup-accuweather.md) — Setup API key AccuWeather (crítico)
- [04-error-403-alerts.md](technical/04-error-403-alerts.md) — Troubleshooting errores 403
- [05-testing-tools-excel-export.md](technical/05-testing-tools-excel-export.md) — Herramientas testing + export
- [06-next-session-weather-precision.md](technical/06-next-session-weather-precision.md) — Notas precisión climática
- [07-sonar.md](technical/07-sonar.md) — Análisis SonarQube

---

## 🐛 [bugfixes/](bugfixes/) — Bugs y fixes

- [01-duplicate-keys.md](bugfixes/01-duplicate-keys.md) — React Strict Mode + claves duplicadas Leaflet
- [02-verificacion-us605.md](bugfixes/02-verificacion-us605.md) — Verificación US-605
- [03-first-sort-fix-version.md](bugfixes/03-first-sort-fix-version.md) — Primer fix estable ordenamiento
- [04-fixes-traceability.md](bugfixes/04-fixes-traceability.md) — Trazabilidad fixes Sprint 7 Fase 1
- [05-validation-report-sort-icons.md](bugfixes/05-validation-report-sort-icons.md) — Validación iconos ordenamiento

---

## 🔄 [workflow/](workflow/) — Flujo de trabajo

- [01-cicd.md](workflow/01-cicd.md) — GitHub Actions, Vercel, secrets, checklist
- [02-testing.md](workflow/02-testing.md) — Testing strategy, Playwright, E2E
- [03-sprint-6-testing-fixes.md](workflow/03-sprint-6-testing-fixes.md) — Testing fixes Sprint 6

---

## 📌 Navegación rápida

| Necesidad | Documento |
|-----------|-----------|
| Iniciar en el proyecto | [overview/01-project.md](overview/01-project.md) |
| Entender la clasificación clima → Pokémon | [architecture/03-weather-classification-algorithm.md](architecture/03-weather-classification-algorithm.md) |
| Setup AccuWeather API | [technical/03-setup-accuweather.md](technical/03-setup-accuweather.md) |
| Setup Firebase (Sprint 8) | [features/sprint8/us-804-firebase-setup.md](features/sprint8/us-804-firebase-setup.md) |
| Debuggear caché | [technical/02-debugging-cache.md](technical/02-debugging-cache.md) |
| Estado del sprint actual | [sprints/05-sprint8.md](sprints/05-sprint8.md) |
| Arquitectura backend | [architecture/09-weather-persistence-backend.md](architecture/09-weather-persistence-backend.md) |
| US disponibles Sprint 8 | [features/sprint8/](features/sprint8/) |

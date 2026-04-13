# 📚 Documentación — Pokémon Weather Explorer

Guía centralizada de navegación.  
**Última actualización:** 2026-04-12

**👉 EMPIEZA AQUÍ:** [📖 ROADMAP.md](ROADMAP.md) — Visión de Sprints 8-12 | [📊 Sprint Status](sprints/) — Historial completo

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
- [09-weather-persistence-backend.md](architecture/09-weather-persistence-backend.md) — Arquitectura Firestore (Sprint 8)
- [10-firestore-data-schema.md](architecture/10-firestore-data-schema.md) — **NUEVO** Data dictionary completo (tipos, relaciones, esquemas Firestore)

---

## 🎯 [sprints/](sprints/) — Planificación y seguimiento

**Guía rápida:**
- [00-INDEX.md](sprints/00-INDEX.md) — Índice de todos los sprints
- [sprint-8/](sprints/sprint-8/) — Sprint 8 (✅ COMPLETADO: 7 US, 22 SP)
- [sprint-9/](sprints/sprint-9/) — Sprint 9 (Planificado: Bundle Optimization)
- Sprint 1-7: Histórico en archivos individuales

---

## ✨ [features/](features/) — Características por sprint

**Sprint 1-7** (histórico):
- Detalles en [features/](features/) (16 archivos)
- Resumen: Mapa + Búsqueda + Filtros + Responsive

**Sprint 8** (resumen):
- 7 US completadas (US-706 a US-806)
- Ver: [04-archive/sprint-8.md](04-archive/sprint-8.md) para resumen completo
- Detalles: [04-archive/](04-archive/) o [refactor-firebase/sprint/](refactor-firebase/sprint/) (histórico)

---

## 🔧 [technical/](technical/) — Detalles técnicos

- [01-api-documentation.md](technical/01-api-documentation.md) — AccuWeather API: endpoints, response, límites
- [02-debugging-cache.md](technical/02-debugging-cache.md) — Herramientas `pweCache` en console
- [03-setup-accuweather.md](technical/03-setup-accuweather.md) — Setup API key AccuWeather (crítico)
- [04-error-403-alerts.md](technical/04-error-403-alerts.md) — Troubleshooting errores 403
- [05-testing-tools-excel-export.md](technical/05-testing-tools-excel-export.md) — Herramientas testing + export
- [06-next-session-weather-precision.md](technical/06-next-session-weather-precision.md) — Notas precisión climática
- [07-sonar.md](technical/07-sonar.md) — Análisis SonarQube
- [08-firebase-setup.md](technical/08-firebase-setup.md) — **NUEVO** Setup credenciales Firebase (Sprint 8)

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
| **📖 Visión del proyecto** | [📈 ROADMAP.md](../ROADMAP.md) — Sprints 8-12 |
| Iniciar en el proyecto | [overview/01-project.md](overview/01-project.md) |
| Entender clasificación clima → Pokémon | [architecture/03-weather-classification-algorithm.md](architecture/03-weather-classification-algorithm.md) |
| Setup AccuWeather API | [technical/03-setup-accuweather.md](technical/03-setup-accuweather.md) |
| Setup Firebase (Sprint 8) | [technical/08-firebase-setup.md](technical/08-firebase-setup.md) |
| Debuggear caché | [technical/02-debugging-cache.md](technical/02-debugging-cache.md) |
| Estado del sprint actual | [progress.md](progress.md) |
| Arquitectura Firestore | [architecture/09-weather-persistence-backend.md](architecture/09-weather-persistence-backend.md) |
| Data schema Firestore | [architecture/10-firestore-data-schema.md](architecture/10-firestore-data-schema.md) |
| Sprint 8 completado | [04-archive/sprint-8.md](04-archive/sprint-8.md) |

# 📚 Documentación — Pokémon Weather Explorer

Guía de navegación por categoría.

---

## 📖 [overview/](overview/) — Primeros pasos
Documentación inicial para entender el proyecto.

- [01-project.md](overview/01-project.md) — Arquitectura general, estructura de carpetas, convenciones
- [02-design.md](overview/02-design.md) — Sistema de diseño, variables CSS, paleta de colores
- [03-git-workflow.md](overview/03-git-workflow.md) — Estrategia Git Flow, ramas, commits, semver

---

## 🏗️ [architecture/](architecture/) — Decisiones técnicas
Documentación sobre la arquitectura y decisiones de diseño.

- [01-weather-logic.md](architecture/01-weather-logic.md) — Lógica de clima, useWeather hook, clasificación
- [02-api.md](architecture/02-api.md) — API AccuWeather, endpoints, request/response
- [03-weather-classification-algorithm.md](architecture/03-weather-classification-algorithm.md) — Algoritmo completo de clasificación clima → Pokémon GO
- [04-refactor-weather-algorithm.md](architecture/04-refactor-weather-algorithm.md) — Plan de refactorización del algoritmo
- [05-caching-strategy.md](architecture/05-caching-strategy.md) — Estrategia 3 capas: API → LocalStorage → IndexedDB
- [06-geospatial-cache-optimization.md](architecture/06-geospatial-cache-optimization.md) — Optimización geoespacial con S2 Level 10
- [07-implementacion-geospatial-cache.md](architecture/07-implementacion-geospatial-cache.md) — Implementación de caché geoespacial
- [08-technical-debt.md](architecture/08-technical-debt.md) — Deuda técnica identificada y prioridades

---

## 🎯 [sprints/](sprints/) — Planificación y seguimiento
Información sobre sprints, backlog y tracking.

- [01-backlog.md](sprints/01-backlog.md) — Product backlog con criterios de aceptación
- [02-sprints.md](sprints/02-sprints.md) — Cronograma de sprints y fases
- [03-sprint7-checkpoint.md](sprints/03-sprint7-checkpoint.md) — Checkpoint de Sprint 7 actual

---

## ✨ [features/](features/) — User Stories (US-###)
Documentación de features y user stories implementadas.

- [01-us606-cache-inspector.md](features/01-us606-cache-inspector.md) — US-606: Inspector Visual de Caché
- [02-us606-testing.md](features/02-us606-testing.md) — Testing para US-606
- [03-us608-history-dashboard.md](features/03-us608-history-dashboard.md) — US-608: Dashboard de Historial
- [04-us608-button-fix-verification.md](features/04-us608-button-fix-verification.md) — Verificación de fix en US-608
- [05-us609-testing.md](features/05-us609-testing.md) — US-609: Testing y métricas
- [06-us702-mobile-responsive.md](features/06-us702-mobile-responsive.md) — US-702: Mobile responsive design
- [07-mobile-filters-architecture.md](features/07-mobile-filters-architecture.md) — Arquitectura de filtros en mobile
- [08-badges-system.md](features/08-badges-system.md) — Sistema de badges (categorías de ciudades)
- [09-unified-sort-dropdown.md](features/09-unified-sort-dropdown.md) — US-703: Dropdown unificado de ordenamiento (UX mejorado)

---

## 🔧 [technical/](technical/) — Detalles técnicos
Guías técnicas, setup, debugging y herramientas.

- [01-api-documentation.md](technical/01-api-documentation.md) — Documentación de API AccuWeather
- [02-debugging-cache.md](technical/02-debugging-cache.md) — Herramientas de debugging para caché (pweCache console)
- [03-setup-accuweather.md](technical/03-setup-accuweather.md) — Setup de API key AccuWeather (crítico)
- [04-error-403-alerts.md](technical/04-error-403-alerts.md) — Troubleshooting de errores 403
- [05-testing-tools-excel-export.md](technical/05-testing-tools-excel-export.md) — Herramientas de testing y export
- [06-next-session-weather-precision.md](technical/06-next-session-weather-precision.md) — Notas para próxima sesión
- [07-sonar.md](technical/07-sonar.md) — Análisis SonarQube

---

## 🐛 [bugfixes/](bugfixes/) — Bugs y fixes
Documentación de bugs encontrados, fixes y validaciones.

- [01-duplicate-keys.md](bugfixes/01-duplicate-keys.md) — Bug: Claves duplicadas en MapView (Leaflet React)
- [02-verificacion-us605.md](bugfixes/02-verificacion-us605.md) — Verificación de US-605
- [03-first-sort-fix-version.md](bugfixes/03-first-sort-fix-version.md) — Primer fix estable de ordenamiento
- [04-fixes-traceability.md](bugfixes/04-fixes-traceability.md) — Trazabilidad de fixes en Sprint 7 Fase 1
- [05-validation-report-sort-icons.md](bugfixes/05-validation-report-sort-icons.md) — Validación de iconos de ordenamiento

---

## 🔄 [workflow/](workflow/) — Flujo de trabajo
CI/CD, testing, deployment.

- [01-cicd.md](workflow/01-cicd.md) — GitHub Actions, Vercel, secrets, checklist
- [02-testing.md](workflow/02-testing.md) — Testing strategy, Playwright, E2E
- [03-sprint-6-testing-fixes.md](workflow/03-sprint-6-testing-fixes.md) — Testing fixes de Sprint 6

---

## 📌 Cómo navegar

**¿Estoy iniciando en el proyecto?**  
→ Lee [`overview/01-project.md`](overview/01-project.md) primero.

**¿Necesito entender cómo funciona el clima?**  
→ Revisa [`architecture/01-weather-logic.md`](architecture/01-weather-logic.md) y [`architecture/03-weather-classification-algorithm.md`](architecture/03-weather-classification-algorithm.md).

**¿Necesito obtener API key de AccuWeather?**  
→ Sigue [`technical/03-setup-accuweather.md`](technical/03-setup-accuweather.md).

**¿Estoy debuggeando caché?**  
→ Consulta [`technical/02-debugging-cache.md`](technical/02-debugging-cache.md).

**¿Necesito saber el estado actual de los sprints?**  
→ Lee [`sprints/02-sprints.md`](sprints/02-sprints.md) y [`sprints/03-sprint7-checkpoint.md`](sprints/03-sprint7-checkpoint.md).

---

**Última actualización:** 2026-04-02

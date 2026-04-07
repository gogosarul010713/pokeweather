# Active Task — Sprint 8 (2026-04-08) — ANÁLISIS TÉCNICO

## Sprint Actual
**Sprint 8 — Bottom Sheet + Weather Persistence Backend**

## Completado en Sprint 8 Fase 1
✅ **US-706** Bottom Sheet con Drag Handle — RESUELTO (2026-04-08)
- Portal: BottomSheet renderiza fuera de #root (escapa overflow:hidden) — commit `c5d3e84`
- z-index: 50 → 1001 (supera paneles internos de Leaflet tiles=200..controls=1000) — commit `723ed8e`
- Validado con Playwright: screenshot confirma mapa + BottomSheet coexistiendo
- Merge sprint-7 → develop ✅

## Trabajo Actual (2026-04-08)
🔬 **Análisis Técnico — Weather Persistence Backend**
- Levantamiento de requerimientos para persistencia de datos climáticos
- Objetivo: mejorar precisión de clasificación clima → tipos Pokémon GO
- Datos dinámicos: ciudades + climas 12h por ciclo
- Datos estáticos: catálogo de condiciones y reglas
- Entregables: arquitectura, viabilidad, riesgos, costo, US

## Próxima Sesión
⏳ **Sprint 8 Fase 2**: Implementación Weather Backend
- Elección de stack backend (según análisis)
- Implementación según US levantadas

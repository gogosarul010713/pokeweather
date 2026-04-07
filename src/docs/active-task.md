# Active Task — Sprint 8 (2026-04-07) — DEBUGGING

## Sprint Actual
**Sprint 8 — Bottom Sheet Implementation** 

## Estado Anterior Completado
✅ **Sprint 7**: 13/13 US (FilterPanel Redesign, Responsive, Ordenamiento)
✅ **BUGFIX**: LocationFeed scroll (c7f34c9)

## Trabajo Realizado Hoy (2026-04-07)
✅ **US-706 Fase 1-5**: Bottom Sheet Implementation + Refactor
1. Paso 1-4: BottomSheet.tsx + Sidebar mobile integration
2. Paso 5: `/simplify` code review → refactor a App.tsx root level
   - Creado `src/hooks/useIsMobile.ts` (reutilizable)
   - Limpiado BottomSheet (sin dragListenerRef, viewportHeight en handler)
   - Sidebar simplificado (removido wrapper hacks)
3. Commits: `d278049` (pasos 1-4), `4f124d6` (visibility fix), `8798f1b` (positioning), `e65fb13` (refactor)

## Problema Activo (BLOCKER) 🔴
**BottomSheet no visible en mobile viewport**
- **Síntoma**: Usuario no ve lista ni handle en browser (<768px)
- **Paradoja**: Playwright E2E tests dicen `isVisible: true`, DOM correcto, pero browser no muestra
- **Mapa**: SÍ visible (716px height, correctamente renderizado)
- **Build**: ✅ PASSED
- **E2E**: ✅ PASSED (pero contradicción con visual)

## Estado Actual (2026-04-07 EOD)
- Branch: `sprint-7` (4 commits nuevos)
- Build: ✅ PASSED
- Working tree: clean
- Playwright: ✅ 1/1 test passed
- **BLOCKER**: BottomSheet invisible en browser a pesar de estar en DOM

## Próxima Sesión (2026-04-08)
⏳ **DEBUGGEAR**: ¿Por qué Playwright dice visible pero browser no muestra?
- Revisar Dev Tools: computed styles en vivo
- Revisar z-index stacking context
- Comparar con LocationDetail (que SÍ funciona)
- Posibles causas: clip-path, transform, display none somewhere, CSS media query override

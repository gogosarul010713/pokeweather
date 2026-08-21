# Sprint 9 — Bundle Optimization & Performance Tuning

**Período:** 2026-04-13 → 2026-04-26  
**Status:** 🎯 PLANEADO  
**Story Points:** 20-25 SP (3 US)  
**Versión Target:** v2.0.1

---

## 🎯 Objetivo

Reducir bundle size v2.0.0-alpha (1.7 MB → <800 KB gzip) mediante code-splitting, lazy loading, y tree-shaking optimizado.

---

## 📊 Métricas Target

| Métrica | Actual (v2.0.0-alpha) | Target (v2.0.1) | Mejora |
|---------|----------------------|-----------------|--------|
| Bundle JS | 1,752 KB | <900 KB | -49% |
| Gzip | 489 KB | <400 KB | -18% |
| Build Time | 1.67s | <2s | Mantener |
| Lighthouse Score | TBD | ≥85/100 | — |

---

## ✅ US Planeadas

- **US-901** — Code Splitting Firebase SDK (5 SP)
- **US-902** — Lazy Load TestingTools Components (3 SP)
- **US-903** — Optimize Lighthouse Score (3 SP)
- **(Opcional) US-904** — Cache Catalogs en IndexedDB (3 SP)

---

## 📅 Timeline

### Semana 1 (2026-04-13 → 2026-04-19)
- Sesión 1: US-901 Subtarea 1 (Dynamic imports setup)
- Sesión 2: US-901 Subtarea 2 (Tree-shaking validation)
- Sesión 3: US-901 Subtarea 3 (Integration testing)

### Semana 2 (2026-04-20 → 2026-04-26)
- Sesión 4: US-902 (Lazy load components)
- Sesión 5: US-903 (Lighthouse optimization)
- Sesión 6: Testing + Validation

---

## 🚨 Riesgos & Mitigaciones

| Riesgo | Impacto | Mitigation |
|--------|---------|-----------|
| Tree-shaking no funciona | Alto | Spike técnico Sesión 0 |
| Subtarea 2 más larga | Medio | Refactor en Sesión 3 |
| Lighthouse target inalcanzable | Bajo | Aceptar 80/100 |

---

## 🔧 Decisiones Técnicas Pendientes

### D1: Code-Splitting Strategy
- Opción A: Vite micro-frontends (complex)
- Opción B: Rollup dynamic imports (simple)
→ **PENDIENTE:** Decidir en Sesión 0

### D2: Tree-Shaking
- Opción A: Module-level (custom exports)
- Opción B: App-level (webpack config)
→ **PENDIENTE:** Spike técnico

### D3: Lazy-Load Trigger
- Opción A: Route-based (cuando user navega)
- Opción B: Component-based (cuando se abre modal)
→ **PENDIENTE:** Architecture review

---

## 📚 Documentación Referencia

- [v2 Bundle Analysis](../../04-archive/sprint-8.md#hallazgos)
- [ROADMAP Sprint 9](../../../ROADMAP.md#sprint-9)
- [Firebase Bundle Impact](../../architecture/09-weather-persistence-backend.md)

---

## 🔗 Depends On

- Sprint 8: v2.0.0-alpha merge (✅ COMPLETADO)
- Firebase SDK: In production (✅ STABLE)

---

## 📝 Next Steps

1. **Sesión 0:** Spike técnico (code-splitting options)
2. **Sesión 1:** US-901 Subtarea 1
3. ... (ver Timeline arriba)

---

## 💾 Branch Strategy

```
develop (v2.0.0-alpha)
  ├─ feature/sprint-9-code-split-session-1
  ├─ feature/sprint-9-code-split-session-2
  ├─ feature/sprint-9-code-split-session-3
  ├─ feature/sprint-9-lazy-load
  └─ feature/sprint-9-lighthouse
```

**Regla:** Una rama por subtarea, máx 2 sesiones / rama


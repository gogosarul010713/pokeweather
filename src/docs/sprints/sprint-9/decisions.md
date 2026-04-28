# Decisiones Arquitectónicas — Sprint 9

**Sprint:** 9  
**Período:** 2026-04-13 → 2026-04-26  
**Status:** 🎯 PLANEADO (se llenan durante sprint)

---

## Decisiones Pendientes

### D1: Code-Splitting Strategy (US-901)

**Opciones:**
- **A:** Vite micro-frontends (complex, not needed)
- **B:** Rollup dynamic imports (simple, effective)

**Status:** ⏳ PENDIENTE (spike técnico en Sesión 0)

**Análisis:**
- Vite defaults ya soportan dynamic imports
- Rollup split chunks automáticamente
- Simple > Complex

---

### D2: Tree-Shaking Configuration (US-901)

**Opciones:**
- **A:** Module-level (custom Firebase exports)
- **B:** App-level (vite build config)
- **C:** Both (combined approach)

**Status:** ⏳ PENDIENTE (validar en Sesión 1)

**Análisis:**
- Necesita medición real post-build
- Firebase exports pueden ser reducidos manualmente
- Vite rollupOptions puede aplicarse globalmente

---

### D3: Lazy-Load Trigger (US-902)

**Opciones:**
- **A:** Route-based (cuando user navega a Testing)
- **B:** Component-based (cuando abre modal)
- **C:** Hybrid (preload en background, load on interact)

**Status:** ⏳ PENDIENTE

**Análisis:**
- TestingTools no es ruta, es modal
- Component-based más natural para modals
- Preload en background: no, los usuarios rara vez lo usan

---

## Decisiones Tomadas

### D4: UI Redesign Radical — Layer-Based Architecture sin Tabs (Sesión 2)

**Decisión:** ✅ **Opción C: Rediseño radical** — Arquitectura v3 layer-based + sidebar colapsable

**Contexto:**
- Opción A: Mantener tabs en sidebar (arquitectura v2) — Feedback UX: "sidebar limita el mapa"
- Opción B: Toggle binario en header (v1) — Rechazado: muy pequeño, no es protagonista
- Opción C: Layer selector en header + sidebar colapsable + mapa principal — **ELEGIDA**

**Por qué:**
1. **Mapa como protagonista:** El mapa gana ~30% más de espacio (sidebar colapsable)
2. **Selector más visible:** Layer selector en header es más rápido que tabs en sidebar
3. **Filtros accesibles:** Mover filtros al sidebar mantiene la lógica clara (filters dentro de la capa)
4. **Arquitectura más limpia:** Sin modo "Todo" complejo; cada layer es independiente

**Trade-offs:**
- ❌ Requiere 6 nuevas US en Sesión 2 (14 SP vs 11 SP originales)
- ❌ Cambio significativo después de documentación v2
- ✅ Mejor UX, mapa más accesible, layout más intuitivo

**Impacto:**
- Sesión 2: +3 SP (14 vs 11)
- Total Sprint: 23 SP (vs 20 SP originales)
- Archivos nuevos: 6 (LayerSelector, SidebarToggle, FilterPanel en sidebar, etc.)
- Archivos eliminados: TabControl, ModeToggle (antiguo), Nav vertical

**Validación:**
- [ ] Mapa ocupa ~70% pantalla (sidebar colapsado)
- [ ] Layer selector visible y responsive
- [ ] Sidebar colapsable con transición suave
- [ ] Filtros accesibles en sidebar
- [ ] UX testing: cambio de layer < 1s

---

---

## 📝 Template para Actualizar

Cuando se tome una decisión durante el sprint, copiar este template:

```markdown
### D[N]: [Título] ([US-XXX])

**Decisión:** ✅ [Opción elegida]

**Contexto:**
- [Alternativa A: descripción]
- [Alternativa B: descripción]

**Por qué:** [Razonamiento]

**Trade-offs:** [Qué se pierde]

**Impacto:** [Métricas, performance, etc.]

**Validación:** [Cómo verificar que funciona]
```

---

## 🔗 Referencia Anterior

Ver [Sprint 8 Decisions](../sprint-8/decisions.md) para patrones.


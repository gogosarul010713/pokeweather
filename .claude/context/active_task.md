# 🎯 Sprint 9 — Bundle Optimization & Performance

**Período:** 2026-04-13 → 2026-04-26  
**Estado:** 🔨 **EN PROGRESO** — Optimización de bundle y performance  
**Sprint Points:** 11 SP (3 US)  
**Rama:** `sprint-9` (creada 2026-04-12 EOD)

---

## 📊 Sprint 9 — US en Queue

| US | SP | Descripción | Estado |
|----|-----|-------------|--------|
| **US-901** | 5 | Code Splitting + Dynamic Import | 🔨 **NEXT** |
| **US-902** | 3 | Lazy Load Components | ⏳ Planificado |
| **US-903** | 3 | Lighthouse Audit & Optimization | ⏳ Planificado |

---

## 🎯 US-901 — Code Splitting (PRÓXIMA)

**Objetivo:** Reducir bundle size de 1.7 MB gzipped a < 500 kB

**Problema:** Firebase SDK agrega +813% al bundle (v1: 194 kB → v2: 1,771 kB)

**Solución:**
- Dynamic import() para Firestore features (Dashboard, Reports)
- Code-split: core app vs. Firebase features
- Lazy load en-demand cuando usuario abre Dashboard/Reports

**Criterios de Aceptación:**
- ✅ Main bundle: < 500 kB gzipped
- ✅ Firebase chunk: cargado on-demand
- ✅ No regresiones en features principales
- ✅ Build warnings: 0

**Especificación:** `src/docs/sprints/sprint-9/us/US-901.md`

---

## 📋 Cómo Continuar

### Sesión Próxima:
1. Checkout `sprint-9` → `git checkout sprint-9`
2. Leer `src/docs/sprints/sprint-9/us/US-901.md`
3. Ejecutar `npm run build` → validar size actual
4. Implementar dynamic import para Firebase features

### Estructura Propuesta:
```
src/
├── modules/
│   ├── core/          ← Siempre cargado (mapa, búsqueda, filtros)
│   ├── firebase/      ← Dynamic import (Dashboard, Reports)
│   └── ...
```

---

## 🔗 Referencias Rápidas

- **Rama actual:** sprint-9
- **Base:** develop (v2.0.0-alpha)
- **Build warning:** "chunks larger than 500kB" → target a resolver
- **Lighthouse:** Usar para validar performance improvements
- **Documentación Sprint 9:** `src/docs/sprints/sprint-9/`

---

**Creado:** 2026-04-12  
**Última actualización:** 2026-04-12 EOD  
**Status:** Listo para comenzar Sprint 9

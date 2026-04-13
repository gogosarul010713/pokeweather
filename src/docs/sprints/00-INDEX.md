# 📊 Índice de Sprints

**Última actualización:** 2026-04-12

---

## 📖 Cómo Usar Esta Estructura

Cada sprint tiene:
```
sprint-N/
├── README.md         ← Objetivo, timeline, métricas
├── decisions.md      ← Decisiones arquitectónicas
└── us/
    ├── US-XXX.md     ← Detalle de cada US
    └── ...
```

---

## ✅ Completados

### [Sprint 1](sprint-1/) — Project Setup & Core Infrastructure
**Período:** 2025-10 → 2025-11 | **20 SP** | ✅  
Mapa, búsqueda, API, cache

### [Sprint 2-4](sprint-2/) — Features & Optimization
**Período:** 2025-11 → 2026-02 | **~60 SP** | ✅  
Badges, quality scoring, dark mode, etc.

### [Sprint 5](sprint-5/) — Badges & Quality System
**Período:** 2026-02 | **~15 SP** | ✅  
Sistema de badges, quality scoring

### [Sprint 6](sprint-6/) — Caching & History
**Período:** 2026-02-15 → 2026-02-28 | **~20 SP** | ✅  
Caché inteligente, history dashboard

### [Sprint 7](sprint-7/) — Mobile Responsive & Filters
**Período:** 2026-02-28 → 2026-03-28 | **47 SP** | ✅  
Responsive design, filtros mejorados, ordenamiento

### [Sprint 8](sprint-8/) — Weather Persistence Backend
**Período:** 2026-04-08 → 2026-04-12 | **22 SP** | ✅  
Firebase setup, Firestore, reportes, TTL, analytics

---

## 🎯 En Progreso / Planeado

### [Sprint 9](sprint-9/) — Bundle Optimization & Performance
**Período:** 2026-04-13 → 2026-04-26 | **20-25 SP** | 🎯  
Code-splitting, lazy loading, Lighthouse optimization

**US:**
- [US-901 — Code Splitting](sprint-9/us/US-901.md) (5 SP)
- [US-902 — Lazy Load Components](sprint-9/us/US-902.md) (3 SP)
- [US-903 — Lighthouse Optimization](sprint-9/us/US-903.md) (3 SP)

---

## 🔮 Futuro

### Sprint 10-12 — Nests Feature (Paralelo)
**Período:** 2026-04-20 → 2026-06-07 | **60-80 SP** | 🔮  
Sistema de Nesting, descubrimiento, social features

Ver: [ROADMAP.md](../ROADMAP.md#sprint-10-12-nests-feature)

---

## 📈 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Total US Completadas** | 59+ |
| **Total Story Points** | 287+ SP |
| **Sprints Completados** | 8 |
| **Sprints Planificados** | 12+ |
| **Progreso** | 90%+ |

---

## 🔗 Navegación Rápida

| Necesidad | Ir a |
|-----------|------|
| Ver objetivo de Sprint N | `sprint-N/README.md` |
| Ver detalle de US-XXX | `sprint-N/us/US-XXX.md` |
| Ver decisiones del sprint | `sprint-N/decisions.md` |
| Roadmap completo | [ROADMAP.md](../ROADMAP.md) |
| Documentación principal | [INDEX.md](../INDEX.md) |
| Arquitectura del proyecto | [architecture/](../architecture/) |

---

## 📝 Agregar Nuevo Sprint

Cuando comience un nuevo sprint:

1. Crear `sprint-N/` directory
2. Copiar estructura:
   ```
   sprint-N/
   ├── README.md      (copiar template de sprint-9)
   ├── decisions.md   (vacío, se llena durante sprint)
   └── us/
       ├── US-XXX.md
       └── ...
   ```
3. Actualizar este INDEX.md
4. Actualizar ROADMAP.md

---

## 🎬 Sesiones Típicas

**Al iniciar sprint:**
```bash
# Leer:
cat sprint-N/README.md         # Objetivo, timeline
cat sprint-N/us/US-XXX.md      # Detalle de US actual
cat INDEX.md                   # Documentación general
```

**Al completar US:**
```bash
# Actualizar:
sprint-N/decisions.md          # Decisión tomada
sprint-N/README.md             # Progreso y métricas
```

---

## 📚 Documentación Relacionada

- **Arquitectura:** [architecture/](../architecture/)
- **Técnico:** [technical/](../technical/)
- **Flujo de trabajo:** [workflow/](../workflow/)
- **Roadmap:** [ROADMAP.md](../ROADMAP.md)
- **Overview:** [overview/](../overview/)


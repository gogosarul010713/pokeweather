# Sprint 9 — INDEX

**Objetivo del sprint:** Migrar la arquitectura de tabs a capas independientes, permitiendo visualizar clima y nidos simultáneamente, con base extensible para gimnasios, PokéParadas y rutas.

**Decisiones arquitectónicas:** ver `decisions.md`

---

## Estado general

| Sesión | Foco | Status |
|---|---|---|
| Sesión 1 | Fundación — tipos, store base, servicios | ✅ Completada |
| Sesión 2 | Rediseño UI — pins, sidebar, layout base | ✅ Completada |
| Sesión 3 | Capas independientes — migración activeTab → activeLayers | 🔄 En progreso |
| Sesión 4 (US-901/902/903) | Validación y testing | ⏳ Pendiente |

---

## Sesión 1 — Fundación

| US | Título | SP | Status |
|---|---|---|---|
| US-811 | Setup inicial Vite + React + TypeScript | 2 | ✅ Done |
| US-812 | Integración Zustand store base | 2 | ✅ Done |
| US-813 | Integración AccuWeather API | 3 | ✅ Done |
| US-814 | Integración S2 geometry para celdas clima | 2 | ✅ Done |

---

## Sesión 2 — Rediseño UI

| US | Título | SP | Status |
|---|---|---|---|
| US-817 | MapPin — pin de clima con icono | 2 | ✅ Done |
| US-819 | NestPin — hexágono coloreado por tipo | 3 | ✅ Done |
| US-820 | CityTooltip — tooltip en hover de pin | 2 | ✅ Done |
| US-822 | MapLegend — leyenda dinámica del mapa | 2 | ✅ Done |
| US-825 | Eliminación del modo "todo" (activeTab) | 1 | ✅ Done (parcial — ver US-826) |

> **Nota US-825:** El valor `'todo'` fue eliminado conceptualmente pero quedó en el código de `MapView.tsx`. US-826 cierra esta deuda técnica.

---

## Sesión 3 — Capas independientes ⬅ ACTUAL

**Orden de implementación recomendado:**

| US | Título | SP | Status | Dependencias |
|---|---|---|---|---|
| **US-826** | Migración `activeTab` → `activeLayers` en Zustand | 3 | ⏳ Pendiente | — |
| **US-823** | Layer toggles en Header | 2 | ⏳ Pendiente | US-826 |
| **US-824** | Layout general: mapa como protagonista | 1 (reducido, ver DEC-904) | ✅ Done | US-826 |
| **US-821** | Filtros adaptativos en sidebar por capa | 3 | ⏳ Pendiente | US-826, US-823 |
| **US-818** | Feed unificado en sidebar (clima + nidos) | 5 | ⏳ Pendiente | US-826, US-821, US-823 |
| **US-815** | Leyenda dinámica por capas activas | 2 | ⏳ Pendiente | US-826, US-823 |

**Total SP sesión 3:** 17

> US-826 es el desbloqueo de toda la sesión. Implementar primero, el resto en paralelo o secuencial.

---

## Sesión 4 — Validación y testing

| US | Título | SP | Status |
|---|---|---|---|
| US-901 | Tests de integración store + capas | 3 | ⏳ Pendiente |
| US-902 | Validación visual desktop + mobile | 2 | ⏳ Pendiente |
| US-903 | Performance — carga de capas y cache | 3 | ⏳ Pendiente |

---

## Archive

| US | Razón |
|---|---|
| US-816 | Descartada — reemplazada por US-819 |
| *(agregar aquí US descartadas en sesión 3 si aplica)* | |

---

## Capas planificadas

| Capa | LayerKey | Status | US |
|---|---|---|---|
| Clima | `clima` | ✅ Activa | US-826 |
| Nidos | `nidos` | ✅ Activa | US-826 |
| Gimnasios | `gyms` | 🔲 Preparada (toggle deshabilitado) | Futuro sprint |
| PokéParadas | `stops` | 🔲 Preparada (toggle deshabilitado) | Futuro sprint |
| Rutas | `rutas` | 🔲 Preparada (toggle deshabilitado) | Futuro sprint |

---

## Color system — capas

Usar estos valores consistentemente en toda la app (toggles, filtros, pins, tags, leyenda):

| Capa | Color | Hex |
|---|---|---|
| Clima | Azul | `#3b82f6` |
| Nidos | Verde | `#22c55e` |
| Gimnasios | Naranja | `#f97316` |
| PokéParadas | Violeta | `#a78bfa` |
| Rutas | Ámbar | `#f59e0b` |
| Multi-capa | Azul índigo | `#4f7cff` |

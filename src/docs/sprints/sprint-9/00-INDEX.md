# 📊 Sprint 9 — Nidos de Pokémon (Arquitectura v2)

**Fechas:** 2026-04-17 hasta TBD  
**Duración:** 2-3 sesiones  
**Story Points Totales:** 20 SP (distribuidos en 2 sesiones de implementación)

---

## 🎯 Objetivo Sprint

Implementar la feature de **Nidos de Pokémon** como una capa independiente del mapa de Clima, con un control único de capas mediante **tabs en el sidebar** y un modo combinado "Todo" que muestre ambas capas simultáneamente.

---

## 📋 Documentación

| Documento | Contenido | Ubicación |
|-----------|-----------|-----------|
| **Requirements** | Especificación completa de la feature (9 requisitos) | `feature-nest/Requirements_nest.md` |
| **Decisiones** | Decisiones arquitectónicas y trade-offs | `decisions.md` |
| **User Stories** | 8 US documentadas (US-811 a US-819) | `US/` |
| **Archivos Antiguos** | Primera iteración (arquitectura v1, toggle) | `04-archive/` |

---

## 🚀 Sesiones de Implementación

### Sesión 1: Fundación (Crítica) — 9 SP

| US | Título | SP | Status |
|----|--------|----|----|
| **US-811** | Tabs del sidebar como control de capas | 3 | 📝 Pendiente |
| **US-812** | Diferenciación visual de pins (hexágonos) | 2 | 📝 Pendiente |
| **US-817** | Overlay sidebar + filtros en modo Todo | 2 | 📝 Pendiente |
| **US-819** | Datos de Nidos (JSON estático) | 1 | 📝 Pendiente |

**Resultado esperado:**  
Tabs del sidebar funcionales, pins diferenciados, modo Todo con overlay, datos cargando.

---

### Sesión 2: Interfaz Completa — 11 SP

| US | Título | SP | Status |
|----|--------|----|----|
| **US-814** | Filtros contextuales por tab | 3 | 📝 Pendiente |
| **US-815** | Leyenda del mapa dinámica (tipos + clasificación) | 3 | 📝 Pendiente |
| **US-816** | Leyenda modo Todo (acordeón) | 2 | 📝 Pendiente |
| **US-818** | Listado de Nidos en sidebar | 3 | 📝 Pendiente |

**Resultado esperado:**  
Interfaz completa: filtros funcionales, leyenda dinámica, listado de nidos browseables.

---

### Sesión 3: Validación (Opcional)

- Testing E2E completo
- Optimizaciones de performance
- Integración con búsqueda/filtros avanzados
- Preparación para modo en línea (API de nidos)

---

## 📊 Estado Actual

**Documentación:** ✅ **COMPLETADA** (17-04-2026)
- ✅ Requirements redactados (9 casos de uso)
- ✅ US documentadas (8 archivos)
- ✅ Mapa Req → US creado
- ✅ Archivos antiguos archivados

**Implementación:** ⏳ **PENDIENTE**
- ⏳ Código base (Sesión 1)
- ⏳ Interfaz completa (Sesión 2)
- ⏳ Testing & validación (Sesión 3)

---

## 🔄 Cambios vs Arquitectura v1

| Aspecto | v1 (Archivado) | v2 (Actual) |
|---------|---|---|
| **Control de capas** | Toggle en header | Tabs en sidebar |
| **Modos** | Clima ⇄ Nidos (2) | Clima, Nidos, Todo (3) |
| **Componente toggle** | `ModeToggle.tsx` en header | ❌ Eliminado |
| **Pins Nidos** | Gota púrpura | Hexágono coloreado por tipo |
| **Filtros** | Estáticos por modo | Dinámicos + contextuales |
| **Leyenda Nidos** | Grid simple | Grid 2col + búsqueda + tabs internos |
| **Modo Todo** | No existía | ✅ Nuevo (ambas capas + overlay) |
| **Sidebar en Todo** | N/A | Bloqueado con overlay informativo |

**Razón del cambio:** Feedback UX confirmó que tabs en sidebar es más natural y permite modo combinado de forma elegante.

---

## 📝 Referencias Rápidas

- **Requerimientos completos:** [`feature-nest/Requirements_nest.md`](./feature-nest/Requirements_nest.md)
- **US Sesión 1:** [US-811](./US/US-811.md) | [US-812](./US/US-812.md) | [US-817](./US/US-817.md) | [US-819](./US/US-819.md)
- **US Sesión 2:** [US-814](./US/US-814.md) | [US-815](./US/US-815.md) | [US-816](./US/US-816.md) | [US-818](./US/US-818.md)
- **Decisiones:** [`decisions.md`](./decisions.md)
- **Archivados:** [`04-archive/README.md`](./04-archive/README.md)

---

## ⚠️ Notas Importantes

1. **`activeTab` es la fuente única de verdad** para qué se renderiza en el mapa
2. En modo `Todo`, el sidebar y filtros se **bloquean visualmente** con overlay explicativo
3. Cambiar de tab **resetea filtros** (no persisten entre tabs)
4. Datos de nidos son **JSON estático** (hoja de ruta: API externa en futura versión)
5. Validar diseño con `@design.md` si existe — **priorizar design.md en caso de divergencia**

---

**Última actualización:** 2026-04-17  
**Creado por:** Documentación automática
**Estado:** ✅ Listo para comenzar Sesión 1

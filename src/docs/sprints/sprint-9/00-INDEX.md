# 📊 Sprint 9 — Nidos de Pokémon (Arquitectura v3 - Layer-Based + Colapsable)

**Fechas:** 2026-04-17 hasta TBD  
**Duración:** 2-3 sesiones  
**Story Points Totales:** 23 SP (Sesión 1: 9 SP, Sesión 2: 14 SP)

---

## 🎯 Objetivo Sprint

Implementar la feature de **Nidos de Pokémon** como una capa independiente del mapa de Clima, con **layer selector en Header** (Clima/Nidos binario), **sidebar colapsable**, y **filtros relocados al sidebar**. Rediseño radical: mapa como elemento principal.

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

### Sesión 2: Rediseño UI + Interfaz Completa — 14 SP

| US | Título | SP | Status |
|----|--------|----|----|
| **US-820** | Remover TabControl del sidebar | 2 | 📝 Pendiente |
| **US-821** | Panel de filtros en sidebar (top) | 3 | 📝 Pendiente |
| **US-822** | Sidebar colapsable + hamburger | 3 | 📝 Pendiente |
| **US-823** | Layer selector en Header (Clima/Nidos) | 2 | 📝 Pendiente |
| **US-824** | Layout redesign: mapa = elemento principal | 3 | 📝 Pendiente |
| **US-825** | Remover barra vertical izquierda | 1 | ⏳ Bloqueado (aclaración) |
| **US-815** | Leyenda del mapa dinámica (tipos + clasificación) | 3 | 📝 Pendiente |
| **US-818** | Listado de Nidos en sidebar | 3 | 📝 Pendiente |

**Resultado esperado:**  
Interfaz completa con rediseño radical: layer selector en header, sidebar colapsable, filtros en sidebar, mapa principal, leyenda dinámica, listado browseable.

**Archivado (v1 obsoleto):**
- ~~US-814~~ → Reemplazado por US-820/821/823
- ~~US-816~~ → No aplica (sin modo Todo)

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

## 🔄 Cambios vs Arquitectura v1/v2

| Aspecto | v1 (Archivado) | v2 (Archivado) | v3 (Actual) |
|---------|---|---|---|
| **Control de capas** | Toggle en header | Tabs en sidebar | Layer selector en Header |
| **Modos** | Clima ⇄ Nidos (2) | Clima, Nidos, Todo (3) | Clima XOR Nidos (binario) |
| **Ubicación selector** | Header | Sidebar | Header (derecha) |
| **Sidebar** | N/A | Con tabs (fijo) | Colapsable (dinamico) |
| **Filtros** | Estáticos | En Header dinámicos | En Sidebar (top) |
| **Mapa** | Secundario | Secundario | Principal (protagonista) |
| **Modo Todo** | No | ✅ Sí + overlay | ❌ Eliminado |
| **Nav vertical** | ❓ Existe | ❓ Existe | ❌ Se elimina |

**Razón del cambio v2→v3:** UX testing confirmó que mapa debe ser protagonista. Sidebar colapsable permite área máxima para mapa. Layer selector en Header es más rápido que navegar sidebar.

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

# 📋 US-814 — Filtros Contextuales por Tab [ARCHIVADO v1]

**Sprint:** 9 (Sesión 2)  
**Story Points:** 3 SP  
**Status:** 🔴 ARCHIVADO — Reemplazado por US-820/821  
**Razón:** Nueva arquitectura elimina tabs, reemplaza con layer selector + sidebar colapsable

---

## 📝 Contexto Original

Este spec asumía una arquitectura tab-based en sidebar (Clima/Nidos/Todo). La nueva arquitectura rediseña completamente el layout:
- ❌ Sin tabs en sidebar
- ✅ Layer selector en Header (Clima/Nidos)
- ✅ Sidebar colapsable
- ✅ Filtros en sidebar top (no en Header)

---

## 🔗 Reemplazado Por

- **US-820:** Remover TabControl del sidebar
- **US-821:** Panel de filtros en sidebar (top)
- **US-822:** Sidebar colapsable + hamburger
- **US-823:** Layer selector en Header (Clima/Nidos)

---

## 📚 Contenido Original

> Como usuario, quiero que la barra de filtros cambie según el tab activo **para** ver solo los filtros relevantes.

**Criterios:** Filtros dinámicos en Header según tab activo (Clima/Nidos/Todo)

**Archivos:** FilterPanelClima.tsx, FilterPanelNests.tsx, FilterPanel wrapper

---

**Última actualización:** 2026-04-27 (archivado)  
**Ver:** US-820.md, US-821.md para nueva implementación

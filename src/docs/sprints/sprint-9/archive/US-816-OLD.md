# 📋 US-816 — Leyenda Modo Todo (Acordeón) [ARCHIVADO v1]

**Sprint:** 9 (Sesión 2)  
**Story Points:** 2 SP  
**Status:** 🔴 ARCHIVADO — No aplica en nueva arquitectura  
**Razón:** Modo "Todo" eliminado; nueva arquitectura es layer-based (Clima/Nidos solo)

---

## 📝 Contexto Original

Este spec asumía la existencia de un modo "Todo" que mostraba ambas capas (Clima + Nidos) simultáneamente con una leyenda acordeón combinada.

En la nueva arquitectura:
- ❌ No hay modo "Todo"
- ✅ Layer selector binario: Clima XOR Nidos
- ✅ Leyenda dinámica según layer activo
- ✅ US-815 sigue vigente (leyenda por layer)

---

## 🔗 Reemplazado Por

- **US-815:** Leyenda dinámica (sigue vigente, sin cambios)
- **US-823:** Layer selector en Header

---

## 📚 Contenido Original

> Como usuario, quiero que en modo Todo la leyenda muestre ambas secciones de forma organizada **para** no saturar el mapa.

**Criterios:** Acordeón Clima/Nidos, expand/collapse independiente

**Archivos:** CombinedLegend.tsx, cambios en MapLegend.tsx

---

**Última actualización:** 2026-04-27 (archivado)  
**Ver:** US-815.md para leyenda dinámica por layer

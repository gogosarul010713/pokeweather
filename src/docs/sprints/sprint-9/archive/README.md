# 📦 Archivos Antiguos — Sprint 9 Nidos (Arquitectura v1)

**Archivado:** 2026-04-17

---

## Contexto

Estos archivos documentan la **primera iteración de diseño** de la feature de Nidos de Pokémon, propuesta como un toggle binario en el header (Clima ⇄ Nidos).

## Por qué se archivaron

Análisis posterior con stakeholders confirmó que la arquitectura debía cambiar a:
- **Tabs en el sidebar** (no toggle en header)
- **Tres modos** (Clima, Nidos, Todo) en lugar de dos
- **Control único de capas** desde tabs del sidebar
- **Filtros dinámicos** según tab activo
- **Modo "Todo"** con overlay y bloqueo de interacción

La nueva arquitectura es sustancialmente diferente, por lo que las US antiguas fueron **reemplazadas completamente**.

---

## Archivo de Referencia

- **Nueva especificación:** [`src/docs/sprints/sprint-9/feature-nest/Requirements_nest.md`](../feature-nest/Requirements_nest.md)
- **Nuevas US:** [`src/docs/sprints/sprint-9/US/`](../US/) (US-811 a US-819)
- **Decisiones arquitectónicas:** [`src/docs/sprints/sprint-9/decisions.md`](../decisions.md)

---

## Contenido Archivado

| Archivo | Tema | Notas |
|---------|------|-------|
| US-801-OLD.md | Carga Estática de Nidos | Ahora cubierto por US-819 |
| US-802-OLD.md | Pins de Nidos en Mapa | Ahora cubierto por US-812 (pins hexagonales) |
| US-803-OLD.md | Sidebar Listado de Nidos | Ahora cubierto por US-818 |
| US-804-OLD.md | Panel Detalle del Nido | Integrado en US-818 (tarjetas expandibles) |
| US-805-OLD.md | Toggle Clima ⇄ Nidos | ❌ **REEMPLAZADO** por tabs en sidebar (US-811) |
| US-806-OLD.md | Caché IndexedDB de Nidos | Estrategia de caché revisada |
| US-807-OLD.md | Popup Información Rápida | Integrado en experiencia de pins (US-812) |

---

## Cómo Consultar

Si necesitas **recordar decisiones pasadas** o **entender la evolución** del diseño:

1. Leer el archivo específico en esta carpeta
2. Revisar en git log: `git log --oneline -- src/docs/sprints/sprint-9/US/`
3. Comparar con nueva arquitectura en `Requirements_nest.md`

---

## Nota Técnica

Los archivos fueron archivados para:
- ✅ Mantener claridad arquitectónica
- ✅ Evitar confusión durante implementación
- ✅ Preservar historial de decisiones
- ✅ Facilitar onboarding de nuevos miembros del equipo

**No se eliminaron**, solo **se reubicaron** en esta carpeta para referencia histórica.

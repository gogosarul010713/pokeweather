# ENH-006 — Sidebar oculto con transicion suave cuando no hay capa activa

**Tipo:** Enhancement / UX  
**Sprint:** 9 — Sesion 23 (2026-07-25)  
**Estado:** Completado  
**Componentes:** `src/components/Sidebar/Sidebar.tsx`, `src/App.tsx`

---

## Contexto

Cuando el usuario desactiva todas las capas (Clima + Nidos), el sidebar quedaba visible pero vacio — un espacio muerto que ocupaba ~280px sin aportar informacion. El Overlay que oscurecia el mapa al abrir el sidebar en mobile tambien fue eliminado en esta sesion por ser redundante con el BottomSheet.

## Comportamiento implementado

- Cuando `activeLayers` no tiene ninguna capa activa, el sidebar se oculta con transicion suave: `width 0 + opacity 0` en 280ms ease
- Cuando se activa cualquier capa, el sidebar aparece con la transicion inversa
- El mapa se expande para ocupar el espacio liberado (layout flex — el sidebar colapsa su width)
- El Overlay que oscurecia el mapa fue eliminado — ya no se usa en ningun flujo

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/Sidebar/Sidebar.tsx` | Transicion CSS `width + opacity` condicionada a `hasActiveLayers` |
| `src/App.tsx` | Eliminado componente Overlay y su estado/logica |

## Notas

- La transicion es solo visual — el sidebar no se desmonta del DOM (evita perder estado de filtros al reactivar una capa)
- En mobile el comportamiento no cambia — el BottomSheet maneja la visibilidad independientemente

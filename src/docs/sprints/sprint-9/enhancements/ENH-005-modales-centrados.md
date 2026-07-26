# ENH-005 — Modales centrados: LocationDetail + NestDetail

**Tipo:** Enhancement / Mejora UX  
**Componentes:** `src/components/Sidebar/LocationDetail.tsx`, `src/components/Nests/NestDetail.tsx`  
**Sprint:** 9  
**Estado:** Completado ✅ (sesion 20, 2026-07-25)

---

## Problema

Ambos modales se posicionaban como bottom sheet (pegados al borde inferior). El usuario tenia que scrollear para ver el contenido completo, lo que dificultaba la visualizacion.

---

## Solucion

Reemplazar el layout bottom sheet por modal centrado en pantalla en ambos componentes.

| Antes | Despues |
|---|---|
| `bottom: 0`, `border-radius: 16px 16px 0 0` | `top: 50%`, `left: 50%`, `transform: translate(-50%,-50%)` |
| `max-height: 72vh` | `max-height: 80vh` |
| `animation: slideUp` | `animation: popIn (scale + opacity)` |
| `max-width: 600px` | `width: min(520px, 92vw)` |

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/components/Sidebar/LocationDetail.tsx` | `.ld-modal` centrado, animacion `ld-popIn` |
| `src/components/Nests/NestDetail.tsx` | `.nd-modal` centrado, animacion `nd-popIn` |

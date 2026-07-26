# ENH-003 — Search + Filtros: inline en mismo row

**Tipo:** Enhancement / UX compacto  
**Componente:** `src/components/Sidebar/FilterPanel.tsx`  
**Sprint:** 9  
**Estado:** Completado ✅ (sesion 15, 2026-07-22)

---

## Contexto

El boton "Filtros" ocupa un row dedicado debajo del search input. En un sidebar de 300px esto desperdicia altura que la lista necesita. El patron correcto para sidebars compactas es agrupar search + filtros en el mismo row: input a la izquierda, boton icono a la derecha.

Referencia UX: patron estandar en herramientas como GitHub, Linear, Notion.

---

## Cambio

Fusionar `.fsp-search-row` y la fila del boton filtros en un solo row horizontal.

**Antes:** dos rows independientes
```
[ Search input                    ]
[ Filtros btn      ] [ clear btn  ]
```

**Despues:** un row unico
```
[ Search input           ] [ F ]
```

- Search input: `flex: 1`, se acorta ~40px para ceder espacio al boton
- Boton filtros: icono SVG sin label (con `title="Filtros"` para a11y), 36px x 36px, mismo estilo actual
- Badge con conteo de filtros activos se mantiene sobre el icono
- Boton limpiar (`fsp-clear-quick`) se conserva — aparece solo cuando hay filtros activos, a la derecha del icono filtros

---

## Archivos a tocar

| Archivo | Cambio |
|---|---|
| `src/components/Sidebar/FilterPanel.tsx` | Fusionar rows, ajustar estilos `.fsp-search-row`, remover row separado del boton |

---

## Criterio de aceptacion

- [x] Search y boton filtros en el mismo row
- [x] Badge de conteo visible sobre el boton icono cuando hay filtros activos
- [x] El search input no se rompe ni trunca en 300px ni 280px (tablet)
- [x] El boton conserva su comportamiento: abre/cierra el panel de filtros
- [x] Boton limpiar solo visible cuando `activeFilterCount > 0`
- [x] `title="Filtros"` en el boton para accesibilidad

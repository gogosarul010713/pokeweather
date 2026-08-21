# 02 — Sort Chips en headers de seccion

**Sprint:** 9
**Componente:** `FeedHeader` (Climas y Nidos)
**Estado:** aprobado

## Problema

Al fijar zona el usuario no sabe en que orden se muestran los items ni puede cambiarlo sin salir del flujo.

## Diseno aprobado

Chips toggle en el header de cada seccion (Climas y Nidos), visibles solo cuando hay zona fijada.

- **Distancia ↑** — activo por defecto al fijar zona, orden ASC (mas cercano primero)
- **Cooldown ↑** — orden ASC (0 min primero = ya disponible)
- Flecha `↑` fija en el chip activo indica direccion de orden
- Chips independientes por seccion
- Sin zona: header de una sola linea, sin chips

## Artifact

[Ver mockup interactivo](https://claude.ai/code/artifact/ad0beed9-86ac-4e78-b42f-b80a4110c3f4)

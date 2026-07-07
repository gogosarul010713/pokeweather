---
name: checkpoint
description: Usar al terminar una sesion de trabajo. Guarda el estado minimo necesario para continuar en una nueva conversacion: que se completo, que sigue, y pendientes criticos. Reemplaza el estado anterior en CLAUDE.md, no agrega encima.
---

# checkpoint

Guarda el estado del sprint en CLAUDE.md de forma quirurgica. Reemplaza, no acumula.

## Lo que guardas (nada mas)

1. **Completado en esta sesion** — solo items nuevos, con commit si aplica
2. **Siguiente tarea** — la proxima concreta, con suficiente contexto para arrancar
3. **Backlog pendiente critico** — solo items que bloquean o son urgentes

## Lo que NO guardas

- Detalles de implementacion (estan en el codigo y commits)
- Bugs ya resueltos
- Decisiones ya documentadas en decision-log
- Cualquier cosa que no cambie lo que se hace la proxima sesion

## Como ejecutar

### Paso 1 — Lee el estado actual

Lee la seccion `## Estado Sprint XX` de `CLAUDE.md` para saber que ya esta documentado.

### Paso 2 — Determina que cambio

Compara con `git log --oneline -5` y el trabajo de esta sesion.

### Paso 3 — Reemplaza la seccion completa

Edita `CLAUDE.md`: reemplaza TODO el contenido entre `## Estado Sprint XX` y el siguiente `---` con esto:

```
## Estado Sprint [N] (branch: `[rama]`)

**Completado:**
- [ITEM] ✅ — [descripcion en una linea, commit si aplica]

**Siguiente:**
- [ITEM] — [que es, donde esta el doc/plan si existe]

**Backlog critico pendiente:**
- [ITEM] — [por que es critico, estimado]
```

### Paso 4 — Confirma al usuario

Muestra el diff de lo que cambio en 3 lineas o menos.

## Reglas de reemplazo

- Si un item ya estaba como ✅ y sigue igual → lo mantienes
- Si un item cambio de estado → lo actualizas
- Si un item ya no es relevante → lo eliminas
- Si hay items nuevos → los agregas
- La seccion resultante no debe tener mas de 15 lineas

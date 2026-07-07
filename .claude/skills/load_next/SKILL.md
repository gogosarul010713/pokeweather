---
name: load_next
description: Usar al iniciar una sesion de trabajo. Carga el contexto minimo del proyecto desde CLAUDE.md y arranca inmediatamente con la instruccion recibida como argumento, sin preguntas previas.
---

# load_next

Carga contexto y arranca. Sin resumen, sin confirmacion, sin preguntas.

## Como ejecutar

### Paso 1 — Lee CLAUDE.md (solo la seccion Estado Sprint)

Lee unicamente la seccion `## Estado Sprint XX` de `CLAUDE.md`. No leas el archivo completo.

### Paso 2 — Lee git log

```bash
git log --oneline -5
```

### Paso 3 — Arranca con la instruccion

Con el contexto cargado, ejecuta la instruccion recibida como argumento directamente.

Si el argumento dice `BUG-021` → activa `us-start` con ese ID.
Si el argumento es una tarea concreta → ejecutala sin mas preguntas.
Si el argumento esta vacio → muestra el estado actual en 5 lineas y pregunta que sigue.

## Lo que NO haces

- No resumes lo que leiste
- No preguntas "¿quieres que empiece?"
- No lees archivos adicionales salvo que la tarea lo requiera
- No muestras el contenido de CLAUDE.md al usuario

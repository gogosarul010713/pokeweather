---
name: context-save
description: Guardar el estado actual antes de cerrar la conversación o cuando el contexto esté por agotarse. Usar cuando el usuario diga "guarda el estado", "voy a cerrar", "nos vemos después", o cuando Claude detecte que el contexto está largo.
allowed-tools: Read, Write
---

# Skill: Guardar Contexto

> Esta skill se ejecuta rápido y en silencio. El objetivo es que la próxima conversación arranque sin fricciones.

## Qué hacer

### 1. Actualiza `active_task.md`

Actualiza estas secciones con el estado REAL actual:

- **Estado:** actualiza a lo que corresponda
- **Estado de Implementación:** qué está ✅ completo, qué está 🔄 en progreso, qué está ⬜ pendiente
- **Problemas Encontrados:** agrega cualquier problema surgido en esta sesión
- **Decisiones Tomadas:** cualquier decisión tomada durante la sesión

### 2. Actualiza `sprint.md`

- Refleja el estado actual de la US activa
- Si alguna otra US cambió de estado, actualízala también

### 3. Agrega entrada en `decisions.md`

Solo si en esta sesión se tomaron decisiones de arquitectura o técnicas importantes.

### 4. Genera resumen de handoff

```
## 💾 Estado Guardado — [fecha y hora]

**US activa:** US-[ID] — [título]
**Estado:** [descripción en 1 línea]

**Completado en esta sesión:**
- [item]

**Pendiente para la próxima sesión:**
- [item] ← empieza aquí

**Contexto importante a recordar:**
- [algo que no está en los archivos pero importa]

**Comando para retomar:**
"Carga el contexto y continuemos con [siguiente paso concreto]"
```

Muestra este resumen al usuario para que lo revise.

---

## Cuándo ejecutar proactivamente

Claude debe sugerir ejecutar esta skill cuando:
- El usuario menciona que va a cerrar o pausar
- La conversación tiene más de ~40 mensajes
- Se completó una fase importante (análisis, plan, implementación)
- Hay un cambio de US

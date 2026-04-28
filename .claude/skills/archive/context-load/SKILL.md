---
name: context-load
description: Cargar el contexto completo al inicio de una nueva conversación. Usar cuando el usuario diga "carga el contexto", "ponte al día", "continuemos", o al inicio de sesión. También se activa automáticamente por CLAUDE.md.
allowed-tools: Read
---

# Skill: Cargar Contexto

> Objetivo: en menos de 30 segundos, Claude debe estar completamente al día sin que el usuario tenga que explicar nada.

## Pasos (silenciosos, no los narres)

1. Lee `CLAUDE.md` — reglas y stack
2. Lee `.claude/context/sprint.md` — estado del sprint
3. Lee `.claude/context/active_task.md` — US activa y su estado exacto
4. Lee `.claude/context/decisions.md` — últimas 3 decisiones (las más recientes)

## Salida al usuario

Presenta esto de forma compacta:

```
## 🔄 Contexto Cargado

**Sprint [N]:** [objetivo del sprint]
↳ Progreso: [X/Y US completadas]

**US Activa:** US-[ID] — [título]
↳ Estado: [estado actual]
↳ Completado: [qué ya está hecho]
↳ Pendiente: [qué falta — sé específico]

**Próximo paso:** [acción concreta y específica]

---
¿Continuamos con [próximo paso] o hay algo que cambiar?
```

## Reglas

- Sé telegráfico. El usuario ya conoce el proyecto.
- No repitas información obvia.
- El "Próximo paso" debe ser lo suficientemente específico para arrancar sin preguntas adicionales.
- Si hay ambigüedad sobre qué sigue, pregunta UNA sola cosa.

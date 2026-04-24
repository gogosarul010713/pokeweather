---
name: context-save
description: Guardar el estado actual antes de cerrar la conversación o cuando el contexto esté por agotarse. Usar cuando el usuario diga "guarda el contexto", "guarda en context", "voy a cerrar", "nos vemos después", "wrap", o cuando Claude detecte que el contexto está largo. Ejecuta también git commit y actualiza src/docs/ si es necesario.
allowed-tools: Read, Write, Bash
---

# Skill: Guardar Contexto

> Ejecuta en silencio y en orden. El objetivo es que la próxima sesión arranque sin fricción y que git tenga un snapshot limpio.

---

## Paso 1 — Actualiza `.claude/context/active_task.md`

Lee el archivo primero. Luego actualiza:

- **Estado:** lo que corresponda al momento actual
- **Estado de Implementación:** qué está completado, en progreso, o pendiente
- **Problemas Encontrados:** cualquier problema surgido en esta sesión
- **Decisiones Tomadas:** decisiones tomadas durante la sesión
- **Última actualización:** fecha y hora actual

---

## Paso 2 — Actualiza `.claude/context/sprint.md`

- Refleja el estado actual de la US activa
- Si alguna otra US cambió de estado, actualízala también

---

## Paso 3 — Actualiza `.claude/context/decisions.md` (solo si aplica)

Agrega entrada solo si en esta sesión se tomaron decisiones de arquitectura o técnicas importantes.

---

## Paso 4 — Evalúa si `src/docs/` necesita actualización

Criterio: se completó una US, se tomó una decisión arquitectónica relevante, o se documentó algo nuevo.

Si sí aplica:
- US completada: actualiza o crea `src/docs/sprints/sprint-[N]/us/US-[ID].md`
- Decisión de arquitectura: `src/docs/architecture/` o `src/docs/sprints/sprint-[N]/decisions.md`
- Bugfix: `src/docs/bugfixes/`
- Si el estado del sprint cambió: actualiza `src/docs/sprints/00-INDEX.md` y `src/docs/ROADMAP.md`

Si no aplica: omite este paso sin mencionarlo.

---

## Paso 5 — Git commit en la rama actual

Ejecuta:

    git add -A
    git commit -m "chore(context): save session state - [US-ID] [descripción breve de lo hecho]"

- No cambies de rama
- Si hay archivos sensibles (.env, secrets), omítelos con git add selectivo
- Muestra el output del commit en el resumen final

---

## Paso 6 — Genera el resumen de handoff

Presenta esto al finalizar:

    ## Estado Guardado — [fecha y hora]

    US activa: US-[ID] — [título]
    Estado: [descripción en 1 línea]

    Completado en esta sesión:
    - [item]
    - [item]

    Pendiente para la próxima sesión:
    - [item]
    - [item]

    Git: commit [hash corto] en rama [nombre rama]

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    PARA CONTINUAR — copia esto en la próxima conversación:

    Carga el contexto. Venimos de guardar la sesión.
    US activa: US-[ID] — [título].
    Último avance: [1 línea concisa].
    Próximo paso: [acción específica con archivo o función si aplica].
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Reglas

- Ejecuta todos los pasos en orden sin pedir confirmación intermedia.
- No narres lo que estás haciendo — solo muestra el resumen final del Paso 6.
- Si algo falla (ej. git error), reporta el error en el resumen pero no abortes los pasos restantes.
- El bloque "PARA CONTINUAR" debe ser suficientemente específico para arrancar la siguiente sesión sin preguntas adicionales.
- Nunca omitas el git commit salvo que el usuario lo indique explícitamente.
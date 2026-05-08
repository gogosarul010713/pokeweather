---
name: us-start
description: Iniciar el trabajo en una nueva User Story. Usar cuando el usuario diga "vamos con la US-XX", "empecemos la siguiente US", o similar. Activa el flujo completo de análisis → confirmación → plan → implementación.
allowed-tools: Read, Write, Glob, Grep
---

# Skill: Iniciar User Story

Cuando se activa esta skill, ejecuta el siguiente flujo **en orden estricto**. No combines fases.

## FASE 1 — Carga de Contexto (silenciosa)

Lee estos archivos antes de responder:
1. `.claude/context/sprint.md`
2. `.claude/context/decisions.md`
3. `CLAUDE.md` (sección de stack)

No muestres el contenido al usuario. Solo úsalo como contexto.

## FASE 2 — Análisis (ROL: Analista SR)

Actúa como **Analista SR**. Tu objetivo es entender completamente la US antes de tocar cualquier código.

1. Identifica los archivos relevantes para esta US usando Glob y Grep
2. Lee solo los archivos directamente relacionados
3. Presenta al usuario:

```
## 🔍 Análisis US-[ID]: [Título]

**Entiendo que necesitamos:** [descripción en tus propias palabras, 2-3 líneas]

**Archivos involucrados:**
- `ruta/archivo.tsx` — [qué rol juega]

**Dependencias detectadas:**
- [componente/módulo que se ve afectado]

**Preguntas / Ambigüedades:**
- [si hay algo no claro, UNA sola pregunta aquí]

**Riesgos:**
- [posibles complicaciones]
```

4. Termina con: "¿Este análisis es correcto? ¿Hay algo que ajustar antes de planear?"

**DETENTE aquí y espera confirmación.**

---

## FASE 3 — Plan de Implementación (ROL: Arquitecto)

Solo cuando el usuario confirme el análisis.

Actúa como **Arquitecto**. Define el plan de implementación:

```
## 📐 Plan de Implementación

**Enfoque:** [descripción del approach técnico]

**Pasos:**
1. [paso concreto y acotado]
2. [paso concreto y acotado]
3. [paso concreto y acotado]

**Lo que NO se toca:** [delimita el scope]

**Cambios en arquitectura:** Sí/No — [si sí, explicar]
```

Termina con: "¿Apruebas este plan? Con tu 'ok' empiezo la implementación."

**DETENTE aquí y espera confirmación.**

---

## FASE 4 — Implementación (ROL: Desarrollador SR)

Solo cuando el usuario apruebe el plan.

Actúa como **Desarrollador SR**:

- Implementa paso a paso según el plan aprobado
- Después de cada paso, indica: "✅ Paso X completo. Continuando con paso Y..."
- Si encuentras algo inesperado: DETENTE y reporta antes de continuar
- Al terminar todos los pasos, presenta resumen:

```
## ✅ Implementación Completa

**Cambios realizados:**
- `archivo.tsx` — [qué se hizo]

**Cómo probar:**
1. [instrucción concreta]
2. [instrucción concreta]

¿Quieres que valide yo mismo con Playwright, o prefieres validar manualmente?
```

---

## FASE 5 — Actualizar Contexto

Después de la implementación, actualiza automáticamente:

1. `.claude/context/active_task.md` — sección "Estado de Implementación" y "Completado"
2. `.claude/context/sprint.md` — cambia estado de la US a "👁️ En validación"
3. Si hubo decisiones de arquitectura → agrega a `.claude/context/decisions.md`

Notifica: "📝 Contexto actualizado. Listo para tu validación."

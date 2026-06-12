---
name: us-start
description: Iniciar el trabajo en una nueva User Story. Usar cuando el usuario diga "vamos con la US-XX", "empecemos la siguiente US", o similar.
allowed-tools: Read, Write, Glob, Grep
---

# Skill: Iniciar User Story

## FASE 1 — Contexto (silenciosa)

1. Lee la seccion `## Estado Sprint XX` de `CLAUDE.md` en la raiz del proyecto
2. Lee el archivo `.md` de la US en `src/docs/sprints/sprint-NN/` si existe

No muestres el contenido. Usalo como contexto.

## FASE 2 — Analisis

Identifica los archivos relevantes (Glob/Grep). Lee solo los directamente relacionados.

Presenta:

```
## Analisis [BUG/US]-[ID]: [Titulo]

**Entiendo que necesitamos:** [2-3 lineas]

**Archivos involucrados:**
- `ruta/archivo.tsx` — [rol]

**Riesgos / Ambiguedades:**
- [una sola pregunta si hay algo no claro]
```

Termina con: "Este analisis es correcto?"

**DETENTE y espera confirmacion.**

## FASE 3 — Plan

Solo con confirmacion del usuario.

```
## Plan

**Enfoque:** [approach tecnico]

**Pasos:**
1. [paso concreto]
2. [paso concreto]

**Scope excluido:** [que NO se toca]
```

Termina con: "Apruebas? Con tu ok empiezo."

**DETENTE y espera confirmacion.**

## FASE 4 — Implementacion

Solo con aprobacion. Implementa paso a paso. Si encuentras algo inesperado: DETENTE y reporta.

Al terminar:

```
## Completado

**Cambios:**
- `archivo.tsx` — [que se hizo]

**Como probar:**
1. [instruccion concreta]
```

## FASE 5 — Cierre

Resume en 2 lineas que se hizo y el resultado. No actualices CLAUDE.md ni ningun archivo de documentacion — el usuario indica explicitamente cuando hacerlo.

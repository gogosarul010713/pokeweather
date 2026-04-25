---
name: us-validate
description: Validar que la implementación de una US funciona correctamente. Usar cuando el usuario diga "valida", "revisa que funcione", "hay errores", "verifica", o cuando reporte un problema después de implementar.
allowed-tools: Read, Bash, Glob, Grep
---

# Skill: Validar User Story

## Contexto Inicial (silencioso)

Lee antes de actuar:
1. `.claude/context/active_task.md` — criterios de aceptación y plan implementado
2. Identifica qué se implementó y qué hay que validar

---

## MODO A — Validación Propia (sin errores reportados)

Cuando el usuario pide que valides tú mismo:

### Paso 1 — Revisión estática
- Lee los archivos modificados
- Verifica que el código implementado cumple los criterios de aceptación
- Busca: imports faltantes, props incorrectas, typos, lógica rota

### Paso 2 — Reporte
```
## 🧪 Resultado de Validación

**Criterios de aceptación:**
- ✅/❌ [criterio 1]
- ✅/❌ [criterio 2]

**Revisión de código:**
- ✅/⚠️/❌ [aspecto revisado]

**Veredicto:** ✅ Todo OK / ⚠️ Hay observaciones / ❌ Hay errores

**Si hay problemas:**
[descripción del problema y propuesta de solución]
```

Si hay errores → ofrece resolverlos. Espera confirmación.

---

## MODO B — Hay errores reportados por el usuario

Cuando el usuario pega un error o describe un problema:

### Paso 1 — Diagnóstico (ROL: Desarrollador SR)
```
## 🔴 Diagnóstico de Error

**Tipo de error:** [runtime / compilación / lógica / estilos]
**Causa raíz:** [explicación concreta, no genérica]
**Archivo(s) involucrados:** [ruta]
```

### Paso 2 — Solución
- Propón la solución antes de implementarla
- "**Solución propuesta:** [descripción]. ¿Aplico?"
- Espera confirmación si el cambio es significativo
- Para errores simples y obvios, puedes resolverlo directo e indicar qué cambiaste

### Paso 3 — Verificación post-fix
Después de resolver:
- Confirma que el fix no rompe otra cosa (revisa archivos relacionados)
- Indica: "✅ Error resuelto. [qué se cambió y por qué]"

---

## MODO C — Validación con Playwright

Cuando el usuario quiera validación visual/funcional en el navegador:

```
## 🎭 Plan de Validación con Playwright

Voy a verificar:
1. [acción que haré en el navegador]
2. [qué comprobaré]

¿Tengo permiso para ejecutar Playwright?
```

Espera confirmación, luego ejecuta y reporta resultado.

# Skill: Validar en Navegador

## Cuándo usar este skill
Úsalo automáticamente cuando el usuario diga cosas como:
- "valida que funcione"
- "hay un error en..."
- "confirma que los cambios están bien"
- "prueba en el navegador"
- "verifica el comportamiento de..."
- "revisa que no esté roto"

## Lo que debes hacer

1. Usa el Playwright MCP para abrir el navegador
2. Navega a la URL del proyecto (default: http://localhost:3000)
3. Reproduce el flujo o escenario descrito por el usuario
4. Toma screenshots en cada paso importante con `browser_take_screenshot`
5. Si hay error, reprodúcelo y documenta exactamente qué ocurre
6. Verifica que el comportamiento esperado ocurra

## Reporte final (siempre en español)

✅ Qué funcionó correctamente  
❌ Qué falló (adjunta screenshot)  
🔍 Causa probable si hay error  
🛠️ Sugerencia de fix si aplica  

## Post-Validación

Si la validación es exitosa y el usuario da vobo:

Actualiza automáticamente:
1. `.claude/context/active_task.md`:
   - Checklist de validación: marcar completado
   - Sección "Vobo del usuario": ✅ Dado + fecha
2. `.claude/context/sprint.md`:
   - Cambia estado de US a "✅ Completada"
   - Actualiza contador de completadas

Notifica: "🎉 US-[ID] completada y documentada. ¿Continuamos con la siguiente US?"

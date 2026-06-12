---
name: us-analyze
description: Análisis profundo de una US o problema técnico sin implementar nada. Usar cuando el usuario quiera entender el impacto de un cambio, evaluar opciones técnicas, o cuando la US sea compleja y requiera más análisis antes de planear.
allowed-tools: Read, Glob, Grep
---

# Skill: Análisis Profundo

> ROL ACTIVO: Analista SR + Arquitecto
> RESTRICCIÓN: Esta skill NO modifica ningún archivo. Solo analiza y reporta.

## Cuándo usar esta skill vs us-start

- **us-analyze:** cuando la US es compleja, ambigua, o implica decisiones de arquitectura
- **us-start:** cuando la US es clara y se puede ir directo al flujo normal

---

## Proceso de Análisis

### 1. Exploración del código base

Usa Glob y Grep para mapear:
- Archivos directamente relacionados con la US
- Dependencias (qué usa qué)
- Patrones existentes que aplican al caso
- Posibles conflictos con código existente

### 2. Análisis de impacto

Identifica:
- **Alcance directo:** archivos que HAY que modificar
- **Alcance indirecto:** archivos que PODRÍAN verse afectados
- **Regresiones potenciales:** qué puede romperse

### 3. Evaluación de opciones (si aplica)

Si hay múltiples formas de implementar:

```
## ⚖️ Opciones Técnicas

### Opción A: [nombre]
- Pros: [lista]
- Contras: [lista]
- Complejidad: Baja/Media/Alta
- Riesgo: Bajo/Medio/Alto

### Opción B: [nombre]
- Pros: [lista]
- Contras: [lista]
- Complejidad: Baja/Media/Alta
- Riesgo: Bajo/Medio/Alto

**Recomendación:** Opción [X] porque [razón concreta]
```

### 4. Reporte final

```
## 🔍 Análisis Completo: [US o tema]

**Resumen ejecutivo:** [2-3 líneas de lo más importante]

**Archivos involucrados:**
| Archivo | Tipo de cambio | Complejidad |
|---------|---------------|-------------|
| `ruta/archivo` | Modificar / Crear / Eliminar | Baja/Media/Alta |

**Dependencias críticas:**
- [dependencia y por qué importa]

**Riesgos:**
- 🔴 Alto: [descripción]
- 🟡 Medio: [descripción]
- 🟢 Bajo: [descripción]

**Estimación de pasos de implementación:** [N pasos]

**¿Requiere decisión de arquitectura?** Sí/No
[Si sí: descripción de la decisión]

**Recomendación:** [qué hacer y por qué]
```

### 5. Próximo paso

Termina siempre con una de estas opciones:
- "¿Procedo con `us-start` para implementar siguiendo este análisis?"
- "¿Hay algún punto del análisis que quieras profundizar antes de proceder?"

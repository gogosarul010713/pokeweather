# 📐 D-010: Selección de BI Tool — Looker Studio vs Metabase

**Fecha:** 2026-04-15  
**Contexto:** Epic Dashboard MVP para análisis de precisión climática  
**Investigación:** Externa (Claude.ai validó 3 opciones: Looker Studio, Metabase, Superset)  
**Estado:** ✅ DECIDIDO

---

## 🎯 Decisión: Looker Studio para Sprint 10 MVP

### Opción Elegida

```
✅ Looker Studio
   Costo: $0/mes
   Setup: 2-3 horas
   Mantenimiento: Cero (SaaS)
   Poder: Suficiente para MVP
```

### Opciones Descartadas

```
❌ Metabase
   Razón: Overkill para MVP (más poder del necesario)
   Mejor para: Sprint 12+ si necesitamos análisis avanzado
   
❌ Superset
   Razón: Curva de aprendizaje muy alta (4-6 horas setup)
   Mejor para: Equipos con experiencia en BI
```

---

## 📊 Comparativa Técnica

| Aspecto | Looker Studio | Metabase | Superset |
|---------|---------------|----------|----------|
| **Costo/mes** | $0 | $0 (Docker) o $100+ | $0 |
| **Setup time** | 2-3h | 1-2h + Docker | 4-6h |
| **Mantenimiento** | Cero (SaaS) | Moderado (Docker) | Alto (self-hosted) |
| **Visualizaciones** | 20+ tipos | 30+ tipos | 40+ tipos |
| **SQL Nativo** | ✅ Sí (BigQuery) | ✅ Sí | ✅ Sí |
| **Para 4-6 dashboards** | ✅ Perfecto | ✅ Overkill | ✅ Overkill |
| **Curva aprendizaje** | 🟢 Baja (drag-drop) | 🟡 Media | 🔴 Alta |
| **Escalabilidad** | 🟢 Fácil migrar | 🟢 Ya escalable | 🟢 Ya escalable |
| **Integración BigQuery** | 🟢 Nativa | 🟢 Conector oficial | 🟡 Requiere setup |
| **Para MVP** | 🟢 IDEAL | 🟡 Más poder | 🔴 Overkill |

---

## 💡 Razones de la Decisión

### 1. Costo: $0/mes
- **Looker Studio:** Completamente gratis
- **Metabase:** $0 si self-hosted (Docker), pero requiere servidor ($6-12/mes en DigitalOcean)
- **Impacto:** Presupuesto limitado → Looker gana

### 2. Setup: 2-3 horas vs 4-6 horas
- **Looker Studio:** 
  - Firebase Extension: 30 min
  - SQL View: 45 min
  - Dashboards: 1-1.5h
  - Total: 2-3h
  
- **Metabase:** 
  - Firebase Extension: 30 min
  - SQL View: 45 min
  - Docker setup: 1-2h
  - Dashboards: 2h
  - Total: 4-6h

- **Impacto:** MVP rápido → Looker gana

### 3. Mantenimiento: Cero vs Moderado
- **Looker Studio:** Google mantiene todo (updates automáticos, seguridad, backups)
- **Metabase Docker:** Tú mantienes (actualizaciones, patches, monitoreo)
- **Contexto:** 1 dev solo → Looker gana (cero ops)

### 4. Para MVP: Suficiente vs Overkill
- **Preguntas de negocio a responder:**
  - ¿Qué tan precisa es nuestra predicción? → Looker ✅
  - ¿Cuáles tipos son más predecibles? → Looker ✅
  - ¿Dónde fallamos? → Looker ✅
  - ¿Hay patrones temporales? → Looker ✅
  
- **Looker Studio tiene:**
  - Scorecards ✅
  - Line/Bar/Pie charts ✅
  - Tables con sorting ✅
  - Filtros interactivos ✅
  - Heatmaps ✅
  
- **Looker Studio NO tiene (pero no necesitamos ahora):**
  - Drill-down avanzado (lo tienes de forma básica)
  - Custom SQL queries ad-hoc (lo haces en BigQuery)
  - Embedding autenticado (si lo necesitas después)

- **Impacto:** MVP no requiere poder extra → Looker gana

### 5. Escalabilidad: Fácil transición a Metabase
Si después decimos "necesitamos más poder":
- Datos ya están en BigQuery (no re-exportar)
- Metabase se conecta a BigQuery directamente
- Migración: 1-2 horas
- **No estamos atrapados** → Looker es apuesta segura

---

## ⚠️ Gotchas Identificados & Solucionados

### Gotcha 1: Array de snapshots no se expande en BigQuery
```
❌ PROBLEMA: Firestore snapshots: ForecastSnapshot[]
           → BigQuery importa como JSON string
           
✅ SOLUCIÓN: SQL view que UNNEST los arrays
           → Filas planas (una por snapshot)
           
📝 TEMPLATE: Dado en US-1002
🎯 IMPACTO: +45 min setup, write once use forever
```

### Gotcha 2: TTL 7 días en Firestore
```
❌ PROBLEMA: Después de 7 días, Firestore elimina documentos
           
✅ REALIDAD: BigQuery mantiene changelog permanente
           → Tienes histórico de 6+ meses sin costo extra
           
🎯 IMPACTO: Ventaja (no desaparecen datos)
```

### Gotcha 3: Streaming inserts en BigQuery
```
⚠️ NOTA: Firebase Extension usa streaming inserts
        Free tier: 100K streaming inserts/day
        Tu volumen: ~2,100 docs/mes ≈ 70/day
        
✅ SEGURO: Estás muy por debajo del límite
```

---

## 📋 Plan B: Metabase como Siguiente Opción

### Escenario de Activación

Si después de Sprint 10, Looker Studio:
- ❌ NO puede hacer visualización X OR
- ❌ Tiene limitaciones en drill-down OR
- ❌ No soporta feature Y que necesitamos OR
- ❌ Usuario dice "necesito más poder"

### Procedimiento Plan B

**Paso 1:** Documentar exactamente qué no funciona en Looker
```
Ejemplo: "Necesito drill-down de ciudad → horarios"
```

**Paso 2:** Evaluar si es realmente necesario
```
Pregunta: ¿Vale la pena 4-6 horas de setup por esto?
Respuesta: Si SÍ → activar Plan B
```

**Paso 3:** Implementar Metabase (Sprint 12+)
```
Setup: Firebase Extension (ya existe) 
     → BigQuery (ya existe)
     → Metabase Docker (nuevo)
     
Time: 2-3 horas (vs 4-6 primera vez, porque BigQuery ya está)

Costo: $0 (Docker en local/DigitalOcean) o $100/mes (Cloud)
```

**Paso 4:** Migrar dashboards (30-60 min por dashboard)
```
Looker → Metabase no es 1:1, pero es fácil:
- Looker Chart → Metabase Chart (diferente UI, mismo resultado)
- Filtros → Filtros (misma lógica)
```

### Decisión de Activación (Criterios)

**Activar Plan B si:**
- [ ] 2+ features clave no funcionan en Looker OR
- [ ] Usuario pide explícitamente "más poder analítico" OR
- [ ] Metabase agregará >20% valor por <4 horas esfuerzo

**NO activar Plan B si:**
- [ ] Looker cubre 80%+ de las preguntas de negocio
- [ ] Problemas son "nice to have" no "must have"
- [ ] Presupuesto/tiempo no lo justifica

---

## 🎬 Implicaciones de la Decisión

### Para Sprint 10
```
Proceder con Looker Studio
↓
6 US (US-1001 a US-1006)
↓
12 SP (5-6 horas)
↓
MVP funcional: 4-6 dashboards básicos
```

### Para Sprint 11-12
```
Opción A (Probable): Looker Studio funciona bien
  → Continuar con features nuevas
  → Si necesitamos: integrar más datos a BigQuery
  
Opción B (Si algo no funciona): Evaluar Metabase
  → Decision point: activar Plan B o encontrar workaround
  → Si Metabase: 2-3h migración, no 4-6h setup
```

---

## 📝 Documentación de la Decisión

**Archivo:** Este documento (D-010)  
**Versión:** 1.0  
**Aprobación:** Validada por Analista SR + Arquitecto SR  
**Fecha:** 2026-04-15  

**Quién necesita saber:**
- ✅ Desarrollador (ejecutar plan)
- ✅ Equipo técnico (arquitectura)
- ✅ Stakeholders (por qué Looker, no Metabase)

---

## 🔗 Referencias

- Plan de Implementación: [`02-PlanImplementacion.md`](02-PlanImplementacion.md)
- US-1001 (Firebase Extension): [`us/US-1001-FirebaseExtensionBigquery.md`](us/US-1001-FirebaseExtensionBigquery.md)
- Investigación externa: `memory/RESEARCH-BRIEF-EPIC-DASHBOARD.md`
- Requerimiento: `memory/REQUERIMIENTO-DASHBOARD.md`

---

**Conclusión:**

✅ **Looker Studio es la decisión correcta para MVP**
- Cero infraestructura
- 2-3 horas setup
- Suficiente para responder preguntas de negocio
- Plan B documentado (Metabase si necesitamos escalar)
- Apuesta segura: fácil migrar después si crece

🚀 **Proceder con Sprint 10**

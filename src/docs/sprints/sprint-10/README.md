# 🎯 Sprint 10 — Epic Dashboard: Analytics para Precisión Climática

**Período:** 2026-04-15 → (TBD)  
**Objetivo:** Crear dashboard interactivo para analizar precisión de predicciones climáticas  
**Estado:** 🚀 En inicio  
**Versión:** v2.1.0-analytics (post v2.0.0-alpha)

---

## 📊 Overview

### Problema
La app Pokémon Weather Explorer predice tipos Pokémon basándose en clima real, pero no tenemos visibilidad de:
- ¿Qué tan precisa es nuestra predicción? (87.3% baseline)
- ¿Cuáles tipos son más predecibles? (Water 90%, Electric 73%)
- ¿Dónde fallamos? (Moscow 70%, Sydney 92%)
- ¿Hay patrones temporales? (mejor 6-14h, peor 20-23h)

### Solución
Dashboard interactivo en **Looker Studio** que responde estas preguntas.

### Arquitectura
```
Firestore (snapshots array)
  ↓ [Firebase Extension]
BigQuery (tabla raw_changelog)
  ↓ [SQL view aplanar]
Looker Studio (4-6 dashboards)
  ↓ [Link/iframe en React]
```

---

## 📋 User Stories (6 US, 12 SP)

| US | Descripción | SP | Estado |
|----|-------------|-----|--------|
| **US-1001** | Firebase Extension + BigQuery setup | 2 | 🔜 Pending |
| **US-1002** | SQL View snapshots_flat | 2 | 🔜 Pending |
| **US-1003** | Looker Studio conexión | 1 | 🔜 Pending |
| **US-1004** | Dashboard Performance Global | 2 | 🔜 Pending |
| **US-1005** | Dashboards Tipos/Ciudades/Horas | 3 | 🔜 Pending |
| **US-1006** | Integración React + Documentación | 2 | 🔜 Pending |

---

## 🏗️ Arquitectura & Decisiones

**Documentación:**
- [`01-DecisionLookerVsMetabase.md`](01-DecisionLookerVsMetabase.md) — Por qué Looker Studio, Plan B con Metabase
- [`02-PlanImplementacion.md`](02-PlanImplementacion.md) — Paso-a-paso detallado

---

## 📈 Metrics Esperadas (Baseline)

```
Precisión Global:        87.3%
Acertados:               1,247 predicciones
Incorrectos:             187 predicciones

Top 3 Tipos (mejores):   Water 90%, Ground 90%, Rock 90%
Top 3 Tipos (peores):    Electric 73%, Flying 75%, Bug 80%

Top 3 Ciudades (mejores): Sydney 92%, Tokyo 91%, London 88%
Top 3 Ciudades (peores):  Moscow 71%, New Delhi 72%, Mumbai 72%

Mejor Hora:              13:00 (90% precisión)
Peor Hora:               23:00 (64% precisión)
```

---

## 📚 Documentos por US

1. **[US-1001: Firebase Extension + BigQuery](us/US-1001-FirebaseExtensionBigquery.md)**
   - Instalar extensión
   - Configurar path
   - Backfill de datos históricos
   - Validación: tabla existe, datos presentes

2. **[US-1002: SQL View snapshots_flat](us/US-1002-SqlViewSnapshotsFlat.md)**
   - Crear view que expande array
   - Template SQL dado
   - Validación: 25,200+ filas planas

3. **[US-1003: Looker Studio Conexión](us/US-1003-LookerStudioConexion.md)**
   - Crear reporte
   - Conectar a BigQuery
   - Test table: datos reales visibles

4. **[US-1004: Dashboard Performance Global](us/US-1004-DashboardPerformanceGlobal.md)**
   - Scorecard: 87.3% precisión
   - Line chart: tendencia 30 días
   - Pie chart: desglose correcto/incorrecto
   - Filtros funcionales

5. **[US-1005: Dashboards Análisis](us/US-1005-DashboardsAnalisis.md)**
   - Dashboard Tipos (Water 90% en top)
   - Dashboard Ciudades (Sydney 92%, Moscow 70%)
   - Dashboard Horarios (pico 13:00, valle 23:00)

6. **[US-1006: Integración React + Docs](us/US-1006-IntegracionReactDocs.md)**
   - Link/iframe en TestingTools
   - Documentación archivada
   - Decision log actualizado
   - Plan B documentado

---

## ⏱️ Timeline

| Fase | Duración | Acumulado |
|------|----------|-----------|
| Firebase Extension (US-1001) | 30-45 min | 30-45 min |
| SQL View (US-1002) | 45-60 min | 1 h 15 min |
| Looker Setup (US-1003) | 15-30 min | 1 h 45 min |
| Dashboard Performance (US-1004) | 30-40 min | 2 h 25 min |
| Dashboards Análisis (US-1005) | 2-2.5 h | 4 h 25 min |
| Integración React (US-1006) | 1.5-2 h | 5 h 55 min |
| **TOTAL** | | **5-6 horas** |

---

## ✅ Criterios de Aceptación Global

El Sprint 10 está **COMPLETADO** cuando:

- [ ] Looker Studio reporte abierto muestra datos reales
- [ ] Dashboard Performance Global: 87.3% ± 5% visible
- [ ] Tabla tipos muestra Water 90% en top 3
- [ ] Tabla ciudades muestra Sydney >90%, Moscow <75%
- [ ] Gráfico horarios muestra tendencia (mejor día, peor noche)
- [ ] Link/iframe funciona en React
- [ ] Toda documentación archivada en `src/docs/sprints/sprint-10/`
- [ ] Decision log D-010 completo (Looker vs Metabase, Plan B)
- [ ] Plan B documentado (si Looker falla, evaluar Metabase)

---

## 🔗 Referencias Rápidas

**Decisiones:**
- [D-010: Looker Studio vs Metabase](01-DecisionLookerVsMetabase.md)

**Plan Detallado:**
- [Plan de Implementación](02-PlanImplementacion.md)

**Firestore Schema:**
- `/weather_catalog/` — Estático (condiciones, tipos)
- `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}` — Dinámico (snapshots con TTL 7d)

**BigQuery:**
- Dataset: `weather_analytics` (creado por extension)
- Tabla: `city_weather_raw_changelog` (automática)
- Vista: `snapshots_flat` (creada en US-1002)

---

## 🚀 Próximo Paso

Comenzar **US-1001: Firebase Extension Setup**

Ver: [`US-1001-FirebaseExtensionBigquery.md`](us/US-1001-FirebaseExtensionBigquery.md)

---

**Última actualización:** 2026-04-15  
**Estado:** Sprint iniciando 🚀

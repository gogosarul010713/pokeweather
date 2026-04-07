# ⚠️ TECHNICAL DEBT — Pokémon Weather Explorer

> Deuda técnica intencional para mantener velocidad en desarrollo de funcionalidades.
> Se pagará después de completar Sprint 7 (Responsive).

---

## 📊 RESUMEN EJECUTIVO

| Área | Deuda | Prioridad | Target Sprint |
|------|-------|-----------|----------------|
| Testing | E2E + Integration | 🟠 ALTA | Sprint 8 |
| Code Quality | SonarCloud setup | 🟡 MEDIA | Sprint 8 |
| Performance | Profiling + optimization | 🔵 BAJA | Sprint 9 |
| Documentation | Inline comments | 🔵 BAJA | Ongoing |

**Total Deuda Estimada**: ~40 horas (1 sprint completo)

---

## 🧪 TESTING DEBT

### Estado
- ✅ Unit tests básicos (weatherService, useStore)
- ✅ E2E smoke tests
- 🟡 **PENDIENTE**: E2E funcionales (12 tests)
- 🟡 **PENDIENTE**: Integration tests (3 tests)

### Tests Documentados Pero No Implementados

```
FALTANTES:
├── E2E: Filtrado de badges OR logic
├── E2E: Auto-scroll LocationFeed smooth
├── E2E: Z-index fix validation
├── E2E: CityTooltip 3 líneas rendering
├── E2E: MapLegend pestañas + toggle
├── E2E: Theme toggle persistence
├── Integration: AccuWeather mock vs real
├── Integration: Refresh automático horario
├── Integration: isExtreme flag alerts
├── Integration: localStorage persistence
├── Responsive: Tablet layout (768px)
└── Responsive: Mobile layout (< 768px)

TOTAL: 12 E2E + 3 Integration = 15 tests
```

### Esfuerzo
- Implementar: ~20 horas
- Mantener: 2-3 horas/sprint

### Plan de Pago
1. **Sprint 6**: Agregar 1-2 integration tests (AccuWeather)
2. **Sprint 7**: Agregar 2-3 E2E responsive tests
3. **Sprint 8**: Batch implementation de todos los tests faltantes

---

## 🔍 CODE QUALITY DEBT

### SonarCloud

**Estado**: Documentación completa, sin implementación
- [ ] GitHub Actions workflow creado
- [ ] sonar-project.properties configurado
- [ ] Quality Gate establecido
- [ ] First scan ejecutado

**Esfuerzo**: ~2 horas setup + 2-3 horas review inicial

**Issues Potenciales Identificados**:
1. localStorage sin try/catch en algunos lugares
2. API calls sin timeout (AccuWeather fetch)
3. Acceso a undefined en mapeos JSON
4. Variables/imports sin usar

### Plan de Pago
- Sprint 8: Setup + first scan
- Sprint 8: Fix CRITICAL + BLOCKER issues
- Ongoing: Monitor y fix MAJOR issues en cada sprint

---

## 🚀 PERFORMANCE DEBT

### Identificado Pero No Optimizado

1. **Bundle Size**
   - Sin tree-shaking de Leaflet
   - Sin code-splitting por ruta
   - Imágenes de clima no optimizadas

2. **Runtime Performance**
   - Sin memoization en componentes pesados (MapView)
   - Sin virtualización en LocationFeed (lista larga)
   - Sin debounce en SearchInput

3. **Caching**
   - IndexedDB setup pero sin análisis de hit rate
   - localStorage sin cleanup automático

### Esfuerzo
- Profiling: 4-5 horas
- Optimization: 8-10 horas

### Plan de Pago
- Sprint 9: Performance audit
- Sprint 9: Implementar mejoras críticas
- Ongoing: Monitoreo con Sentry/Datadog (future)

---

## 📝 DOCUMENTATION DEBT

### Missing Inline Comments
- weatherService.ts: `calculateBadges()` logic (medium complexity)
- MapView.tsx: Filter logic (medium complexity)
- useStore.ts: Zustand store setup (should be documented)

### Missing Type Definitions
- BadgeType exhaustiveness check
- City type optional fields documentation

### Missing README Sections
- [ ] Architecture diagram
- [ ] Setup instructions for new developers
- [ ] Deployment guide
- [ ] Environment variables guide

### Esfuerzo
- Inline comments: 4-5 horas
- README sections: 3-4 horas

### Plan de Pago
- Sprint 6: Add critical comments (setupsperformance-sensitive code)
- Sprint 8: Complete README sections
- Sprint 9: Architecture diagrams

---

## 🔐 SECURITY DEBT

### Identified Issues

1. **API Key Exposure Risk**
   - VITE_ACCUWEATHER_KEY nunca debe hardcodearse
   - ✅ Está bien: usar .env y no commitear
   - ⚠️ Monitorear: rate limiting en frontend

2. **User Input Validation**
   - SearchInput: sin validación de XSS (pero es texto plano)
   - Coordinates: sin validación de rango válido

### Low Priority
- No vulnerabilidades activas identificadas
- Usar SonarCloud para auditoría automatizada (Sprint 8)

---

## 📱 RESPONSIVE DEBT

### Estado
- Desktop (>1024px): ✅ Completo
- Tablet (768-1024px): 🟡 Documentado, no implementado
- Mobile (<768px): 🟡 Documentado, no implementado

### Tareas Pendientes
- Media queries en index.css
- Drawer/Bottom sheet components
- Header compacto para mobile
- Touch event handlers
- Viewport meta tag optimizations

### Esfuerzo
- Tablet: 8-10 horas (Sprint 7)
- Mobile: 12-15 horas (Sprint 7)

---

## 💾 DATOS / SCHEMA DEBT

### Identificados
- Dataset hardcodeado en mockCities.ts (necesitará API admin en future)
- No schema validation para pokedensity-cities.json
- Sin versionado de dataset

### Plan
- Sprint 6+: Si crece dataset, agregar Zod schema validation
- Future: Admin panel para editar ciudades

---

## 📊 DEBT PAYMENT TIMELINE

```
Sprint 6 (AccuWeather Real):
  ├─ +1 integration test (API real)
  └─ +2 inline comments (critical sections)

Sprint 7 (Responsive):
  ├─ +2 E2E responsive tests
  ├─ +5 inline comments
  └─ README sections

Sprint 8 (Quality & Testing):
  ├─ +12 E2E tests completos
  ├─ +3 integration tests
  ├─ SonarCloud setup + scan
  ├─ Fix CRITICAL issues
  └─ Performance profiling

Sprint 9+ (Polish & Optimization):
  ├─ Performance optimization
  ├─ Security audit final
  ├─ Architecture diagrams
  └─ Deployment guide
```

---

## 🎯 RISK ASSESSMENT

| Debt | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Missing E2E tests | HIGH | MEDIUM | Agrega 1-2 tests/sprint |
| No SonarCloud | MEDIUM | LOW | Setup Sprint 8 |
| Performance issues | MEDIUM | LOW | Profile antes de optimize |
| Missing docs | LOW | HIGH | Documentar conforme codeas |

---

## 📋 DEBT REPAYMENT CHECKLIST

### Sprint 6
- [ ] Agregar 1 integration test (AccuWeather mock vs real)
- [ ] Documentar 3-5 funciones críticas

### Sprint 7
- [ ] Agregar 2 E2E tests (responsive)
- [ ] Completar README sections
- [ ] Documentar media query strategy

### Sprint 8
- [ ] Implementar 12 E2E tests
- [ ] Implementar 3 integration tests
- [ ] Setup SonarCloud + GitHub Actions
- [ ] Fix CRITICAL issues encontrados
- [ ] Coverage goal: 60%+

### Sprint 9+
- [ ] Performance profiling
- [ ] Optimization (bundle, runtime)
- [ ] Security audit final
- [ ] Architecture diagrams
- [ ] Full documentation

---

## 💰 EFFORT SUMMARY

| Category | Hours | Sprint |
|----------|-------|--------|
| Testing | 25-30 | 8 |
| SonarCloud | 4-5 | 8 |
| Documentation | 10-12 | 6-8 |
| Performance | 12-15 | 9 |
| **TOTAL** | **51-62** | **Next 4 sprints** |

---

## ✅ RULE: Pay as You Earn

**Regla de oro**: Por cada feature nueva, agrega 1 test simple para ello.

```typescript
// ✅ BIEN: Feature + test pequeño
if (feature !== 'simple-toggle') {
  // Feature code
}
// test: verificar que toggle funciona

// ❌ MALO: Feature sin test
// Acumula deuda
```

---

## 🔗 REFERENCIAS

- Testing docs: `src/docs/09-testing.md`
- SonarCloud: `SONAR_IMPLEMENTATION.md`
- Sprint plan: `src/docs/06-sprints.md`

---

**Última actualización**: 2026-03-23
**Próxima revisión**: Fin de Sprint 6 (estimado 2026-04-05)

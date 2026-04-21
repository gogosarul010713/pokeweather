# 🚀 Plan de Implementación — US-1101/1102/1103 (Sync + Cleanup)

**Sprint:** 10 (Ampliación)  
**Timeline:** 5-7 horas total  
**Complejidad:** 🟡 Media (requires careful testing)  
**Branching:** Continuar en `sprint-10` (no se crea rama nueva)  
**Status:** ✅ Ready to Execute

---

## 📋 Fases de Implementación

### FASE 0: US-1103 — Fix D-018 (30-45 min)

**Por qué primero:** Previene nuevos docs inútiles desde ahora. Debe estar merged antes de testing las otras US.

#### Paso 0.1: Modificar firebaseWeatherService.ts

```bash
Archivo: src/services/firebase/firebaseWeatherService.ts
Línea: ~77-99 (función saveCityForecast)

Agregar:
if (snapshots.length === 0) return

Contexto: Previo al resto de la función
```

**Validación:**
```bash
npm run build  # Sin errores
npm run test -- firebaseWeatherService.test.ts  # Tests pasan
```

#### Paso 0.2: Agregar Tests

```bash
Archivo: src/services/firebase/firebaseWeatherService.test.ts

Tests nuevos:
- should NOT save when snapshots is empty
- should save when snapshots has valid data
- should return early without error

Validación: npm run test -- firebaseWeatherService.test.ts
Coverage: 100% del nuevo código
```

#### Paso 0.3: Actualizar Docs

```bash
Archivo: src/docs/architecture/10-firestore-data-schema.md

Agregar sección "Reglas de Guardado (D-018)"
Documentar: por qué no guardamos sin snapshots
Documentar: impacto histórico (80 docs NULL existentes)
```

#### ✅ Fase 0 Completa cuando:
- Build exitoso sin warnings
- Tests verdes
- firebaseWeatherService no guarda si `snapshots.length === 0`
- Data schema doc actualizado
- Commit creado: `fix(D-018): No guardar documentos sin snapshots`

---

### FASE 1: US-1101 — Control Automático de Sync (2-3 h)

**Dependencia:** Fase 0 completa

#### Paso 1.1: Zustand Store + LocalStorage

```bash
Archivo: src/data/useStore.ts

Agregar a store:
- syncAutomatic: boolean = true
- setSyncAutomatic: (enabled: boolean) => void
- triggerManualSync: async () => Promise<void>

Persistencia: localStorage key 'pwe-sync-automatic'

Validación:
npm run test -- useStore.test.ts
localStorage.getItem('pwe-store') # Contiene syncAutomatic
```

#### Paso 1.2: Integración forecastSyncService

```bash
Archivo: src/services/forecast/forecastSyncService.ts

Cambios:
- syncForecastsOnLoad(options: { automatic: boolean })
- Respetar flag `syncAutomatic` en App.tsx

Validación:
npm run build  # Sin errores
```

#### Paso 1.3: useWeather.ts - scheduleNextRefresh

```bash
Archivo: src/hooks/useWeather.ts

Cambios:
- scheduleNextRefresh(): if (!syncAutomatic) return
- Callback doManualRefresh() para user-triggered sync

Validación:
npm run test -- useWeather.test.ts
```

#### Paso 1.4: TestingTools UI

```bash
Archivo: src/components/UI/TestingTools.tsx

Componentes nuevos:
- CleanupSection (preparar para US-1102)
- SyncSection:
  - Toggle "Sincronización automática"
  - Botón "Sincronizar ahora" (visible si manual)
  - Toast feedback

Validación:
npm run dev  # Verificar UI en localhost:5180
En Testing Tools: toggle funciona, botón aparece/desaparece
```

#### Paso 1.5: Tests Unitarios

```bash
Archivo: src/data/useStore.test.ts (expandir)
Archivo: src/hooks/useWeather.test.ts (expandir)

Tests nuevos:
- toggleSyncMode: automatic → manual
- persistenceToLocalStorage
- triggerManualSync() execution
- scheduleNextRefresh() respects flag

Validación:
npm run test  # All tests green
Coverage: >90% de nuevo código
```

#### ✅ Fase 1 Completa cuando:
- Build exitoso
- Tests verdes
- TestingTools muestra toggle + botón
- LocalStorage persiste flag
- Cambiar toggle dinámicamente actualiza comportamiento
- Commit creado: `feat(US-1101): Manual sync control`

---

### FASE 2: US-1102 — Limpieza Granular (2-3 h)

**Dependencia:** Fase 1 completa

#### Paso 2.1: Crear cleanupService.ts

```bash
Archivo: src/services/cleanup/cleanupService.ts (NUEVO)

Funciones:
- executeCleanup(options): orquestación principal
- Manejo de errores por layer
- Retorna detailed results

Validación:
npm run build  # Sin errores
```

#### Paso 2.2: Limpieza IndexedDB

```bash
Archivo: src/services/cache/cacheService.ts (expandir)

Funciones nuevas:
- cleanupLocalCache(): elimina forecasts + forecasts_index
- cleanupLocalStorage(): resetea timestamps

Validación:
npm run test -- cacheService.test.ts
Verificar que no error si tablas vacías
```

#### Paso 2.3: Cloud Function para Firestore

```bash
Archivo: functions/cleanup.ts (NUEVO)

Función callable:
- cleanupFirestore(data: { nullSnapshots, olderThan7d })
- Solo autenticada
- Queries: WHERE snapshots == [] OR created_at < 7d
- Retorna count de docs eliminados

Validación:
firebase deploy --only functions  # Deploy local
Verificar en Firebase Console
```

#### Paso 2.4: TestingTools UI Modal

```bash
Archivo: src/components/UI/TestingTools.tsx (expandir)

Componentes nuevos:
- CleanupModal: checkboxes + preview counts
- Botón "Limpiar datos"
- Integración con executeCleanup()

Validación:
npm run dev  # Testing Tools modal visible
Click en "Limpiar datos" → muestra modal con checkboxes
Confirmar → ejecuta cleanup
Toast feedback (éxito/error)
```

#### Paso 2.5: Tests Unitarios

```bash
Archivo: src/services/cleanup/cleanupService.test.ts (NUEVO)
Archivo: src/services/cache/cacheService.test.ts (expandir)

Tests:
- cleanupLocalCache removes correct records
- cleanupLocalStorage resets timestamps
- executeCleanup orchestrates all layers
- Mock Cloud Function (no deploy needed en test)

Validación:
npm run test  # All tests green
Coverage: >85%
```

#### Paso 2.6: Documentación Actualizada

```bash
Archivos a actualizar:
- 10-US-1102-CleanupGranular.md: complete implementation notes
- src/docs/architecture/10-firestore-data-schema.md: add cleanup notes
```

#### ✅ Fase 2 Completa cuando:
- Build exitoso
- Tests verdes (mock Cloud Function)
- TestingTools muestra botón "Limpiar datos"
- Modal funcional con 3 checkboxes
- Cleanup ejecuta IndexedDB + LocalStorage
- Cloud Function deployable (verificado locally)
- Commit creado: `feat(US-1102): Granular cleanup`

---

## 🧪 Validación Global (Post-Fases)

### Test de Integración

```bash
# 1. Desarrollo
npm run dev &  # Terminal 1

# 2. Otra terminal, ejecutar tests
npm run test   # Todos deben pasar

# 3. Verificar Build
npm run build  # Sin warnings, bundle < 2 MB
```

### Test Manual en UI

```bash
En localhost:5180 con Testing Tools abierto:

1. US-1103 validation:
   - Abrir DevTools > Network
   - Hacer refresh climático
   - Verificar: NO hay requests guardando docs sin snapshots

2. US-1101 validation:
   - Toggle "Sincronización automática" OFF
   - Botón "Sincronizar ahora" aparece
   - Click en botón → sync manual ejecuta
   - Toggle ON → botón desaparece

3. US-1102 validation:
   - Click "Limpiar datos"
   - Modal muestra 3 checkboxes + counts
   - Seleccionar opciones
   - Click "Confirmar"
   - Toast feedback (éxito)
   - Verificar: IndexedDB limpiado (console: pweCache.showForecastCache())
```

### Test de Data

```bash
# Validar Firestore (después de US-1103)
./scripts/query-predictions.sh --recent 10

# Verificar: nuevos docs tienen snapshots válidos (no NULL)
# Output: snapshots_length > 0 para todos los docs nuevos
```

---

## ✅ Definición de Hecho (DoD) para Sprint 10 Final

**Código:**
- [ ] Todas las US documentadas en `src/docs/sprints/sprint-10/`
- [ ] Build sin warnings
- [ ] Tests >85% coverage, todos verdes
- [ ] Bundle size < 2 MB (sin regresión)

**Funcionalidad:**
- [ ] US-1103: No guardar docs sin snapshots ✅
- [ ] US-1101: Toggle automático/manual de sync ✅
- [ ] US-1102: Botón cleanup granular ✅
- [ ] TestingTools: Ambos controles funcionales ✅

**Documentación:**
- [ ] Todas las US tienen .md en `src/docs/sprints/sprint-10/`
- [ ] Data schema doc actualizado (D-018)
- [ ] README.md de sprint actualizado
- [ ] Decisiones arquitectónicas en decisions.md

**Git:**
- [ ] Rama `sprint-10` con todos los commits
- [ ] Commits bien organizados (1 por subtarea)
- [ ] Commit messages claros (refs de US/D)
- [ ] Ready para merge a `develop`

**Testing:**
- [ ] Manual tests en UI completados
- [ ] Firestore data validated (nuevos docs sin NULL)
- [ ] Caché sincronizado correctamente
- [ ] No regressions en features existentes

---

## 📅 Timeline Estimado

| Fase | US | Subtareas | Tiempo | Hito |
|------|-----|-----------|--------|------|
| 0 | 1103 | 3 | 30-45 min | D-018 implementado |
| 1 | 1101 | 5 | 2-3 h | Manual sync control ✅ |
| 2 | 1102 | 6 | 2-3 h | Cleanup granular ✅ |
| **Total** | **3 US** | **14** | **5-7 h** | **Sprint 10 Ready** |

---

## 🚀 Próximo Paso

Una vez completadas todas las fases:

1. ✅ Actualizar `sprint.md` (final status)
2. ✅ Actualizar `active_task.md` (Sprint 10 Complete)
3. ✅ Crear decision D-019 (si hay nuevas decisiones)
4. 📋 Preparar merge a `develop` (no pushear aún, esperar confirmación)
5. 📋 Iniciar documentación de Sprint 11 (próximo)

---

**¿Listo para comenzar?**

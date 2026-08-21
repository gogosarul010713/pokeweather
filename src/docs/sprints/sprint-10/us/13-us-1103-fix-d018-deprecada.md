# US-1103: Fix D-018 — No Guardar Documentos sin Snapshots

**Sprint:** 10 (Ampliación)  
**Story Points:** 1-2 SP  
**Prioridad:** 🔴 Crítica (impacta desde hoy)  
**Estado:** ⏳ Ready to Implement (debe ir ANTES de US-1101/1102)  
**Rama:** `sprint-10`  
**Decisión Arquitectónica:** D-018

---

## 📋 Descripción

Implementar la **Decisión Arquitectónica D-018**: Modificar `firebaseWeatherService.ts` para NO guardar documentos en Firestore si `snapshots.length === 0`.

**Problema Actual:**
- Hoy: `saveCityForecast()` guarda incluso cuando no hay snapshots válidos
- Resultado: 80 documentos "fantasma" (53% del total) con TODOS los campos NULL
- Impacto: Contaminan Firestore, occupan storage, fuerzan filtering en BigQuery

**Solución:**
- Early return si `snapshots.length === 0`
- **Beneficio:** Reduce writes ~50%, limpia BigQuery, simplifica queries

**Timeline:**
- ✅ D-018 decidida previamente
- ⏳ US-1103 implementa el fix
- ⏳ US-1102 limpia data histórica (retrospectivo)

---

## 🎯 Criterios de Aceptación

- [ ] **firebaseWeatherService.ts:** `saveCityForecast()` NO guarda si `snapshots.length === 0`
- [ ] **Early return:** Método retorna sin error, silencioso
- [ ] **Nuevos documentos:** Solo docs con snapshots válidos se guardan
- [ ] **Reducción writes:** Firestore writes ~50% menos (métricas before/after)
- [ ] **BigQuery:** Nuevos docs en tabla `snapshots_flat` sin NULL rows innecesarias
- [ ] **Zero breaking changes:** Callers no cambian, retorno type igual
- [ ] **Tests:** Cobertura de `saveCityForecast()` con empty/valid snapshots
- [ ] **Documentation:** Actualizar data schema doc con la nueva regla

---

## 🏗️ Cambio Técnico

### Archivo: `src/services/firebase/firebaseWeatherService.ts`

**Antes:**
```typescript
export const saveCityForecast = async (
  city: City,
  snapshots: ForecastSnapshot[]
): Promise<void> => {
  // ... setup code
  
  // Siempre guarda, incluso si snapshots.length === 0
  await setDoc(
    doc(
      db,
      'city_weather',
      city.id,
      'forecasts',
      dateHour
    ),
    forecastDoc
  )
}
```

**Después:**
```typescript
export const saveCityForecast = async (
  city: City,
  snapshots: ForecastSnapshot[]
): Promise<void> => {
  // ← NUEVO: Early return si snapshots vacío
  if (snapshots.length === 0) {
    // No guardar documentos sin snapshots (D-018)
    // Es un cache-hit geoespacial, no tiene predicción válida
    return
  }
  
  // ... setup code
  
  // Guarda solo si snapshots.length > 0
  await setDoc(
    doc(
      db,
      'city_weather',
      city.id,
      'forecasts',
      dateHour
    ),
    forecastDoc
  )
}
```

**Cambio mínimo:** 3 líneas (early return)

---

## 📋 Subtareas

### A: Modificar firebaseWeatherService.ts

**Archivo:** `src/services/firebase/firebaseWeatherService.ts`

**Localización:** ~línea 77-99 (función `saveCityForecast`)

**Cambio:**

```typescript
export const saveCityForecast = async (
  city: City,
  snapshots: ForecastSnapshot[]
): Promise<void> => {
  const db = await getDb()
  
  // ← NUEVO: No guardar si no hay snapshots
  if (snapshots.length === 0) {
    // Documentos sin snapshots son cache-hits geoespaciales
    // (múltiples ciudades con mismo locationKey)
    // No tienen predicción válida, no hay motivo para persistir
    return
  }

  // ... resto del código (sin cambios)
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  const dateHour = formatDateHour(nextHour)

  const forecastDoc: ForecastDoc = {
    city_id: city.id,
    date_hour: dateHour,
    timestamp: nextHour.getTime(),
    created_at: Timestamp.now(),
    ttl: Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
    snapshots,
    calculated_condition: snapshots[0]?.classified ?? 'unknown',
    timezone: city.timezone ?? 0,
    local_time_user: getLocalTimeUser(),
  }

  await setDoc(
    doc(
      db,
      'city_weather',
      city.id,
      'forecasts',
      dateHour
    ),
    forecastDoc
  )
}
```

**Validación:**
- Compilación sin errores
- Tipo retorno sigue siendo `Promise<void>` (compatible)
- Early return no lanza excepciones
- Callers no necesitan cambios

---

### B: Actualizar Data Schema Documentation

**Archivo:** `src/docs/architecture/10-firestore-data-schema.md`

**Agregar sección:**

```markdown
## Reglas de Guardado (D-018)

### No Guardar sin Snapshots

**Regla:** Documentos en `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}` 
se crean SOLO si `snapshots.length > 0`.

**Justificación:**
- `snapshots === []` significa que AccuWeather no retornó pronósticos para esa ciudad/hora
- Usualmente ocurre cuando múltiples ciudades comparten `locationKey` (cache-hit geoespacial)
- Sin snapshots, no hay predicción válida → documento no aporta valor
- Antes (Sprint 10): Estos docs ocupaban 53% del espacio en Firestore (80+ documentos NULL)
- Solución (US-1103): early return en `saveCityForecast()` si `snapshots.length === 0`
- Beneficio: -50% writes, limpieza automática de data, simplificación de queries

**Código:**
```typescript
// En firebaseWeatherService.ts
export const saveCityForecast = async (
  city: City,
  snapshots: ForecastSnapshot[]
): Promise<void> => {
  if (snapshots.length === 0) return  // D-018: No guardar sin snapshots
  
  // ... resto del código
}
```

**Impacto histórico:**
- Documentos viejos (pre-US-1103): Pueden tener `snapshots.length === 0`
- Limpieza: US-1102 proporciona botón para limpiar estos documentos
- Recomendación: Ejecutar cleanup después de US-1103 mergeado
```

---

### C: Tests Unitarios

**Archivo:** `src/services/firebase/firebaseWeatherService.test.ts` (expandir)

```typescript
describe('firebaseWeatherService - D-018', () => {
  it('should NOT save when snapshots is empty', async () => {
    const mockSetDoc = jest.fn()
    jest.spyOn(firebaseModule, 'setDoc').mockImplementation(mockSetDoc)

    const city: City = {
      id: 'madrid',
      lat: 40.4168,
      lng: -3.7038,
      name: 'Madrid',
      // ... other fields
    }
    const emptySnapshots: ForecastSnapshot[] = []

    await saveCityForecast(city, emptySnapshots)

    // setDoc debe NO haber sido llamado
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  it('should save when snapshots has valid data', async () => {
    const mockSetDoc = jest.fn()
    jest.spyOn(firebaseModule, 'setDoc').mockImplementation(mockSetDoc)

    const city: City = {
      id: 'madrid',
      // ... other fields
    }
    const validSnapshots: ForecastSnapshot[] = [
      {
        hour: 22,
        condition_code: 1,
        classified: 'sunny',
        confidence: 0.95,
        temperature_c: 18,
        wind_kmh: 5,
        time_slot: '22:00',
      },
    ]

    await saveCityForecast(city, validSnapshots)

    // setDoc DEBE haber sido llamado
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),  // doc reference
      expect.objectContaining({
        snapshots: validSnapshots,
        calculated_condition: 'sunny',
      })
    )
  })

  it('should return early without error when snapshots empty', async () => {
    const city: City = { /* ... */ }
    const emptySnapshots: ForecastSnapshot[] = []

    // No debe lanzar excepción
    await expect(
      saveCityForecast(city, emptySnapshots)
    ).resolves.toBeUndefined()
  })
})
```

**Validación:**
- Test para empty snapshots → no guarda
- Test para valid snapshots → guarda normalmente
- Test que early return es silent (no error)
- Coverage: 100% del nuevo código

---

## 📊 Impacto Esperado

### Reducción de Writes

**Antes (US-1103):**
- 100 ciudades × 24h = 2,400 intentos de guardado/día
- 80 docs (53%) sin snapshots = ~1,272 writes inútiles/día
- Total: 2,400 writes/día

**Después (US-1103):**
- Solo docs con snapshots se guardan
- ~800 docs con snapshots = ~1,128 writes/día (sin inútiles)
- **Reducción: ~53% menos writes** (-645 writes/día)

**Firestore Cost Impact (Free Tier):**
- Before: 72K writes/mes (2,400/día)
- After: 34K writes/mes (1,128/día)
- **Savings:** 38K writes/mes (53%), bien dentro de 1.5M free tier

### Data Quality

**Firestore después de US-1103:**
- ✅ Nuevos documentos solo si predicción válida
- ✅ Storage ocupado por data con valor
- ✅ BigQuery table `snapshots_flat` sin rows NULL inútiles
- ✅ Queries más rápidas (sin filtering por NULL)

---

## 🔄 Secuencia de Implementación (Sprint 10)

**Orden crítico:**

1. **US-1103 PRIMERO** (1-2 SP, 30-45 min)
   - Implementa D-018 fix
   - Previene nuevos docs sin snapshots
   - Una vez merged, todos los docs nuevos cumplirán la regla

2. **US-1102 DESPUÉS** (3-4 SP, 2-3 h)
   - Limpia data histórica (docs sin snapshots ya existentes)
   - Botón "Limpiar datos" disponible

3. **US-1101 EN PARALELO** (3-4 SP, 2-3 h)
   - Control automático/manual de sync
   - Independiente de 1103/1102

**Timeline total:** ~5-7 h para las 3 US

---

## ✅ Checklist de Implementación

- [ ] Subtarea A: Código Fix
  - [ ] Early return agregado
  - [ ] Compilación sin errores
  - [ ] Callers no cambian
  
- [ ] Subtarea B: Documentación
  - [ ] Data schema doc actualizado
  - [ ] D-018 referenciado
  - [ ] Impacto histórico documentado
  
- [ ] Subtarea C: Tests
  - [ ] Test empty snapshots → no guarda
  - [ ] Test valid snapshots → guarda
  - [ ] Test early return silent
  - [ ] Coverage: 100%
  
- [ ] Final:
  - [ ] Build sin warnings
  - [ ] Branch ready para merge
  - [ ] Commit message claro (refs D-018)

# US-1104: Firebase como Caché Único — Climas

**Sprint:** 10 (Ampliación, Fase 3)  
**Story Points:** 3-4 SP (análisis + implementación)  
**Prioridad:** 🔵 Media (refactorización de arquitectura)  
**Estado:** ⏳ Documentación Fase 1 (Climas solamente)  
**Rama:** `sprint-10`

---

## 📋 Descripción

Refactorizar el flujo de **datos climáticos** para que **Firestore sea la única fuente de verdad**, manteniendo **IndexedDB como caché local** para latencia crítica.

**Cambio arquitectónico:**
- **Antes:** AccuWeather → IndexedDB (caché) → Firestore (persistencia)
- **Después:** AccuWeather → Firestore (source of truth) → IndexedDB (caché local)

**Objetivo:** Simplificar arquitectura dual actual, evitar sincronización innecesaria, mejorar claridad del flujo.

---

## 🔄 Arquitectura Propuesta: Climas

### Diagrama de Flujo

```
┌────────────────────────────────────────────────────────────┐
│ CICLO DE REFRESH (cada 60 min, automático o manual)       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  AccuWeather API                                          │
│       ↓                                                    │
│  Crear ForecastSnapshot[] (12 horas)                      │
│       ↓                                                    │
│  Guardar en Firestore ← SOURCE OF TRUTH ✅                │
│       ↓                                                    │
│  Sincronizar Firestore → IndexedDB (caché local)          │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ EN UI: Mapa/Ciudades — Lectura de Datos                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Usuario abre app / actualiza mapa                        │
│       ↓                                                    │
│  ¿Hay datos en IndexedDB? (caché local)                   │
│       ├─ SÍ (fresco, <60min) → Mostrar INMEDIATO (40ms) ✅│
│       │  └─ FIN. No sincronizar background (sin gasto).  │
│       │                                                    │
│       └─ NO (expirado o no existe)                        │
│          → Consultar Firestore (300-500ms)                │
│          → Guardar en IndexedDB                           │
│          → Mostrar en UI                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 Cambios Técnicos

### Cambio 1: Lectura en Mapa (MapView.tsx, useWeather.ts)

**Antes:**
```typescript
// Carga inicial o refresh
const weatherData = await fetchCityWeatherWithCache(city)
// → Intenta caché, si expirado busca Firestore en background
```

**Después:**
```typescript
const fetchCityWeatherOptimized = async (city: City): Promise<City> => {
  // CAPA 1: Caché local (40ms)
  const cached = await getCachedWeather(city.id)
  
  if (cached && !isExpired(cached.timestamp)) {
    return cached  // ✅ LISTO. FIN. Sin sincronización.
  }
  
  // CAPA 2: Firestore (300-500ms)
  const firestore = await getWeatherFromFirestore(city.id)
  
  if (firestore) {
    await cacheWeather(city.id, firestore)  // Guardar caché
    return firestore
  }
  
  // FALLBACK: Si Firestore falla, retornar lo que había en caché (stale-while-revalidate)
  return cached || { /* data vacía */ }
}
```

**Diferencia clave:** 
- ❌ NO hay sincronización en background si cache está fresco
- ✅ Caché fresco = mostrar inmediato y FIN
- ✅ Cache expirado = obtener Firestore y guardar

---

### Cambio 2: Escritura en Firestore (firebaseWeatherService.ts)

**Ciclo de refresh (sin cambios):**
```typescript
// Cada 60 min (automático) o manual
const refreshCitiesWeather = async (cities: City[]) => {
  for (const city of cities) {
    const snapshots = await fetchCityWeather(city)  // AccuWeather
    await saveCityForecast(city, snapshots)          // Firestore WRITE
    
    // Sincronizar caché en background (no urgente)
    syncFirestoreToCacheAsync(city.id)
  }
}
```

**Sincronización a caché (background, no urgente):**
```typescript
const syncFirestoreToCacheAsync = async (cityId: string) => {
  // Obtener últimos datos de Firestore
  const forecast = await getWeatherFromFirestore(cityId)
  
  // Guardar en IndexedDB
  if (forecast) {
    await cacheWeather(cityId, forecast)
  }
}
```

---

## 📋 Criterios de Aceptación

### Funcionalidad
- [ ] Lectura de clima: IndexedDB primero, fallback Firestore
- [ ] Cache TTL: 60 min (respetado)
- [ ] Si cache fresco: SIN consulta Firestore
- [ ] Si cache expirado: obtener Firestore y guardar
- [ ] Ciclo refresh: AccuWeather → Firestore → caché
- [ ] Fallback offline: si no hay Firestore, mostrar cache stale

### Performance
- [ ] Cache hit: <50ms (IndexedDB lectura)
- [ ] Cache miss: <600ms (Firestore consulta)
- [ ] Bundle size: sin impacto (reutilizar código existente)

### Testing
- [ ] Tests: cache fresco, cache expirado, sin cache, Firestore falla
- [ ] Cobertura: >85%
- [ ] Sin breaking changes

### Documentación
- [ ] Data schema actualizado (flujo caché)
- [ ] README Sprint 10 actualizado (climas vs tabla)
- [ ] Pseudocódigos claros

---

## 🔧 Archivos Afectados

### Modificar:
1. **`src/hooks/useWeather.ts`** — Lógica de lectura optimizada
2. **`src/services/cache/cacheService.ts`** — Métodos caché (si existe)
3. **`src/services/firebase/firebaseWeatherService.ts`** — Lógica Firestore
4. **`src/components/Map/MapView.tsx`** — Uso de la nueva función

### Documentar:
1. **`src/docs/architecture/10-firestore-data-schema.md`** — Agregar sección "Flujo de Caché"
2. **`src/docs/sprints/sprint-10/README.md`** — Actualizar arquitectura general

---

## 🎯 Diferencia vs. Estado Actual

| Aspecto | Actual | Propuesta | Beneficio |
|---------|--------|-----------|-----------|
| **Cache hit** | Mostrar, luego sync en background | Mostrar, FIN | -100ms promedio |
| **Sincronización innecesaria** | Sí (siempre sincroniza) | No (solo si expirado) | -50% writes innecesarias |
| **Claridad de flujo** | Dual, vago | Dual, explícito | Fácil de mantener |
| **Latencia crítica** | 40ms (IndexedDB) | 40ms (IndexedDB) | Igual (✅) |
| **Offline** | Funciona (caché) | Funciona (caché) | Igual (✅) |

---

## 📝 Pseudocódigo Completo

### Lectura en UI (Mapa/Ciudades)

```pseudocode
ALGORITMO ObtenerClimáconCacheOptimizado

ENTRADA: city (City)
SALIDA: enrichedCity (City con clima)

VARIABLES
    cached: CachedWeather
    firestore: ForecastDoc
    tiempo_inicio: timestamp

INICIO
    tiempo_inicio ← AHORA()
    
    // CAPA 1: Caché Local (40ms esperado)
    cached ← ObtenerDelCache(IndexedDB, city.id)
    
    SI cached EXISTE Y NO_EXPIRADO(cached) ENTONCES
        LogDebug("Cache hit: ${AHORA()-tiempo_inicio}ms")
        RETORNAR EnriquecerCity(city, cached)
        // 🎯 FIN. SIN sincronización adicional.
    
    FIN SI
    
    // CAPA 2: Firestore (300-500ms esperado)
    firestore ← ObtenerDeFirestore(city.id)
    
    SI firestore EXISTE ENTONCES
        GuardarEnCache(IndexedDB, city.id, firestore)
        LogDebug("Firestore fetch: ${AHORA()-tiempo_inicio}ms")
        RETORNAR EnriquecerCity(city, firestore)
    
    FIN SI
    
    // FALLBACK: Caché stale (offline)
    SI cached EXISTE ENTONCES
        LogWarn("Cache stale, offline: ${AHORA()-tiempo_inicio}ms")
        RETORNAR EnriquecerCity(city, cached)  // Datos viejos pero mejor que nada
    
    FIN SI
    
    // ERROR: Sin datos
    LogError("Sin datos para ciudad: ${city.id}")
    RETORNAR city  // Vacío
    
FIN ALGORITMO
```

### Ciclo de Refresh (Background)

```pseudocode
ALGORITMO RefrescarClimásAutomático

ENTRADA: cities (City[])

VARIABLES
    timestamps_ultima_sincronizacion: Map<city_id, timestamp>

INICIO
    
    PARA CADA ciudad EN cities EN PARALELO (5 en paralelo) HACER
        
        TRY
            // PASO 1: Obtener pronóstico actual de AccuWeather
            snapshots ← ObtenerDeAccuWeather(ciudad)
            
            // PASO 2: Guardar en Firestore (FUENTE DE VERDAD)
            GuardarEnFirestore(ciudad, snapshots)
            
            // PASO 3: Sincronizar a caché (background, no urgente)
            SincronizarFirestoreACacheAsync(ciudad.id, snapshots)
            
            // Registrar timestamp
            timestamps_ultima_sincronizacion[ciudad.id] ← AHORA()
        
        CATCH error
            LogError("Refresh fallido para ${ciudad.id}: ${error}")
            // Continuar con siguiente ciudad (resiliente)
        
        FIN TRY
    
    FIN PARA
    
    LogInfo("Refresh completado: ${timestamps_ultima_sincronizacion.size}/${cities.length}")
    
FIN ALGORITMO


ALGORITMO SincronizarFirestoreACacheAsync

ENTRADA: city_id (string), snapshots (ForecastSnapshot[])

VARIABLES
    forecast: ForecastDoc

INICIO
    
    TRY
        forecast ← ObtenerDeFirestore(city_id)  // Garantizar que existe
        
        SI forecast EXISTE ENTONCES
            GuardarEnCache(IndexedDB, city_id, forecast)
            LogDebug("Cache sincronizado: ${city_id}")
        FIN SI
    
    CATCH error
        LogWarn("Sync caché fallido (no crítico): ${city_id}")
        // Sin hacer nada — en próxima lectura en UI se intentará Firestore
    
    FIN TRY
    
FIN ALGORITMO
```

---

## 🔀 Comparativa: Climas vs Tabla Predictiva

**Nota:** Esta US (1104) cubre SOLO climas. Tabla predictiva tiene su propia estrategia (Delta Sync) en documentación separada (próxima fase).

| Aspecto | Climas | Tabla Predictiva |
|---------|--------|-----------------|
| **Datos** | Raw weather (temp, wind, condition) | Snapshots (histórico pronóstico) |
| **Frecuencia update** | Cada 60 min (scheduled) | Cada 60 min (scheduled) |
| **Cache strategy** | Simple TTL (59 min) | Delta Sync incremental |
| **Lectura** | Si fresco → mostrar, FIN | Si fresco → verificar nuevos, mergear |
| **Documentación** | Esta (US-1104) | Separada (próxima) |

---

## 📈 Impacto Esperado

### Firestore Writes (Reducción)
```
ANTES:
  - 94 ciudades × 1 write/hora = 94 writes/hora
  - × 24 horas = 2,256 writes/día
  - Sync en background: +0 (async, no contado en writes)

DESPUÉS:
  - Igual: 94 writes/hora (AccuWeather → Firestore)
  - Sync caché: async, no afecta write quota
  - Beneficio: Menos writes INNECESARIAS en background (evitadas)
  - RESULTADO: -0 net (pero arquitectura más clara)
```

### Latencia (Mejora esperada)
```
Cache hit (fresco):
  ANTES: 40ms (caché) + 300-500ms (sync background) = ~370ms promedio
  DESPUÉS: 40ms (caché) + 0ms = 40ms ✅

Cache miss (expirado):
  ANTES: 300-500ms (Firestore)
  DESPUÉS: 300-500ms (Firestore)
  RESULTADO: Igual
```

---

## ⚠️ Consideraciones

### ¿Qué pasa si Firestore está caído?
- UI muestra caché stale (offline-first)
- Usuario ve datos de última vez que sincronizó
- Mejor que error rojo

### ¿Qué pasa si índices no existen?
- Query en `getWeatherFromFirestore()` debe ser simple
- No usar filtros complejos que requieren índices
- Firestore alerta si índice falta

### ¿Impacta tabla predictiva?
- NO — tabla predictiva tiene su propio flujo (Delta Sync)
- Documentación separada próximamente

---

## ✅ Status

- ✅ Análisis completado
- ✅ Pseudocódigos definidos
- ⏳ Implementación pendiente
- ⏳ Testing pendiente

---

**Creado:** 2026-04-21  
**Tipo:** Documentación Arquitectónica (Fase 1 — Climas)  
**Siguiente:** US-1105 (Tabla Predictiva — Delta Sync)

# 🔧 Debugging & Cache Management — Guía Práctica

## 🚀 HABILITAR ACCUWEATHER REAL (Llamadas a API)

### Paso 1: Obtener tu API Key

1. Ve a [AccuWeather.com](https://www.accuweather.com/en/free-weather-api)
2. Regístrate (free tier = 15,000 calls/mes)
3. Copia tu **API Key** de 32 caracteres
4. ⚠️ **NO** lo guardes en GitHub (es un secret)

### Paso 2: Configurar Variable de Entorno

**Opción A: Local (recomendado)**

Crea/edita `.env.local` en raíz del proyecto:
```bash
VITE_ACCUWEATHER_KEY=your_32_char_api_key_here
```

Luego restart servidor:
```bash
npm run dev
```

**Opción B: Temporal en `.env`**

Edita `.env.example`:
```bash
VITE_ACCUWEATHER_KEY=your_32_char_api_key_here
```

⚠️ **Danger**: Esto se commitea a Git. Solo para testing privado.

### Paso 3: Verificar que Funciona

1. Abre `http://localhost:5173`
2. Abre **DevTools** (F12)
3. Consola debería mostrar:
   ```
   ✅ Batch load: 94/94 ciudades, X cache hits, Y API calls, Zms
   ```
4. SyncBadge mostrará "✓ Actualizado hace X min"

---

## 🔍 VERIFICAR QUE EL CACHING FUNCIONA

### Método 1: Inspeccionar Caché Rápidamente

**En Console (F12):**

```javascript
// Resumen visual del caché
await pweCache.cacheSummary()

// Resultado esperado:
// 📍 LocationKeys (localStorage): 94
// 🌦️  Weather data (IndexedDB): 94
// ⏰ Última actualización: Hace 2 minutos
```

### Método 2: Ver Detalles Completos

```javascript
// Inspecciona cada entrada de caché
await pweCache.checkCacheStatus()

// Muestra:
// 📍 LocationKeys en localStorage: 94
//    s2-key-001 → 328409_PC
//    s2-key-002 → 327164_PC
//    ...
// 🌦️ Weather data en IndexedDB: 94 entradas
//    pwe-weather-s2-1:
//      Guardado: 24/03/2026 11:45:30
//      Edad: 120s
```

### Método 3: Ver TTL (Cuándo Expira)

```javascript
// Muestra cuánto tiempo queda antes de que expire cada entrada
await pweCache.showCacheTTL()

// Resultado:
// ✅ Válido | 58min | pwe-weather-s2-1
// ✅ Válido | 57min | pwe-weather-s2-2
// ✅ Válido | 56min | pwe-weather-s2-3
// ...
// Total: 94/94 válidas
```

### Método 4: Verificar Métricas de API

```javascript
// Muestra cuántas llamadas a API se hicieron
await pweCache.showCacheMetrics()

// Resultado esperado:
// Total API calls: 45
// Cache hits: 49
// Execution time: 3750ms
// Accuracy: 99%
```

---

## 📊 ENTENDER EL FLUJO DE CACHING

### Primera Carga (0% cache hit)

```
App init
  ↓
¿Todas ciudades en caché válido? NO
  ↓
setLoadingStatus('loading')
  ↓
[Batch processing 5 ciudades en paralelo]
  ├─ Ciudad 1-5: fetch de API (3 calls cada una)
  ├─ Esperar 200ms
  ├─ Ciudad 6-10: fetch de API
  └─ ...
  ↓
totalCalls = 282 (94 ciudades × 3 endpoints)
cachedHits = 0
executionMs = 3500ms
  ↓
Guardar en IndexedDB + localStorage
  ↓
setLoadingStatus('ready')
setLastUpdated(Date.now())
```

### Segunda Carga (60min después, TTL no expirado)

```
App reinicia
  ↓
¿Todas ciudades en caché válido? SÍ (expiresAt > now)
  ↓
Return cached data inmediatamente (0 calls)
executionMs = 50ms (casi instantáneo)
  ↓
Salta LoadingScreen
Mostra datos de caché
```

### Tercera Carga (61min después, TTL expirado)

```
App reinicia
  ↓
¿Todas ciudades en caché válido? NO (expiresAt < now)
  ↓
[Batch processing, pero muchos hits]
  ├─ Ciudad 1-5: LocationKey en caché ✅ (-1 call cada una)
  ├─ Ciudad 1-5: Forecast NOT en caché ❌ (fetch)
  ├─ Ciudad 1-5: Alerts NOT en caché ❌ (fetch)
  └─ ...
  ↓
totalCalls = 188 (94×2, solo forecast+alerts, no location)
cachedHits = 94 (todos LocationKeys reutilizados)
executionMs = 2800ms
```

---

## 🧹 LIMPIAR CACHÉ

### Opción 1: Desde Console (Recomendado)

```javascript
// ⚠️ Elimina TODOS los datos de caché
await pweCache.clearAllCache()

// Resultado:
// ✅ Eliminados 94 LocationKeys de localStorage
// ✅ Eliminadas 94 entradas de Weather data
// ✅ Eliminado pwe-lastUpdated
//
// 🔄 Caché completamente limpio.
// 💡 Tip: Recarga la app (Ctrl+R) para cargar datos frescos
```

### Opción 2: Desde DevTools

**Opción 2a: IndexedDB (Weather data)**
1. DevTools → Application
2. IndexedDB → idb-keyval
3. Buscar claves con prefijo `pwe-weather-`
4. Eliminar manualmente

**Opción 2b: localStorage (LocationKeys)**
1. DevTools → Application
2. localStorage
3. Buscar claves `pwe-loc-*`
4. Eliminar manualmente

**Opción 2c: Limpiar Todo**
1. DevTools → Application
2. Storage → Clear site data
3. Seleccionar: Cookies, IndexedDB, localStorage
4. Click "Clear"

### Opción 3: Forzar Reload Limpio

```bash
# Terminal: limpiar y reiniciar servidor
npm run dev

# Navegador:
# 1. Hard refresh: Ctrl+Shift+R (o Cmd+Shift+R en Mac)
# 2. DevTools → Network → Disable cache
# 3. Reload
```

---

## ⏰ ÚLTIMA ACTUALIZACIÓN — Cómo Verificar

### Método 1: SyncBadge (UI)

En la app, mira la esquina superior derecha:
```
✓ Actualizado hace 5 min
```

Actualiza cada 60 segundos automáticamente.

### Método 2: localStorage

```javascript
const timestamp = parseInt(localStorage.getItem('pwe-lastUpdated') || '0', 10)
const date = new Date(timestamp)
console.log(`Última actualización: ${date.toLocaleString('es-ES')}`)

// Resultado:
// Última actualización: 24/03/2026 11:45:30
```

### Método 3: Zustand Store (DevTools)

Si tienes [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmkamjcknhkakgaiyyrklhd5gdcbjbbb):

1. DevTools → Redux
2. Inspeccionar state
3. Ver `lastUpdated` (timestamp en ms)

### Método 4: Console Directa

```javascript
// Consola con una línea
console.log(new Date(parseInt(localStorage.pwe-lastUpdated || 0)))
```

---

## 🚨 TROUBLESHOOTING

### Problem: "❌ API Error for [city]"

**Causas:**
1. API Key inválida o expirada
2. Límite de 15,000 calls/mes alcanzado
3. Red no disponible

**Solución:**
```javascript
// Verifica tu API key en .env.local
console.log(import.meta.env.VITE_ACCUWEATHER_KEY)

// Si está vacío, no está configurada
// Si está presente, verifica en AccuWeather dashboard
```

### Problem: "Todas las ciudades en caché pero antiguas"

**Síntoma:** Los datos tienen 2+ horas pero no se actualizan.

**Causa:** El check del caché está fallando (bug potencial).

**Solución:**
```javascript
// Limpia caché manualmente
await pweCache.clearAllCache()

// Recarga la app
window.location.reload()
```

### Problem: "No veo el batch log"

**Síntoma:** Console no muestra "✅ Batch load: X/94 ciudades..."

**Causa:**
- Estás en modo mock (sin VITE_ACCUWEATHER_KEY)
- Todos los datos están en caché (carga instantánea)

**Verificar:**
```javascript
console.log(import.meta.env.VITE_ACCUWEATHER_KEY) // vacío = mock mode
```

---

## 📈 MONITOREAR CONSUMO DE API

### Presupuesto: 15,000 calls/mes (AccuWeather Core Weather Starter)

**Consumo esperado con optimizaciones:**
```
Día 1: 282 calls (primer load)
Día 2: 45 calls (batch + caching)
Día 3: 0 calls (TTL no expirado)
Día 4: 0 calls (TTL no expirado)
...Cada HH:00 (refresh automático):
  - Si TTL válido: 0 calls
  - Si TTL expirado: ~150 calls (LocationKey cache + batch)

Estimado mensual:
- 10 refreshes al día = 10 × 45 = 450 calls
- Ajustar por TTL: 450 × 0.3 = 135 calls/día
- Mensual: 135 × 30 = 4,050 calls ✅ (27% presupuesto)
```

**Monitor en tiempo real:**

```javascript
// Crear un log cada vez que se hace batch load
// En batchWeatherService.ts ya está:
console.log(`✅ Batch load: ${result.successful.length}/94 ciudades, ${result.metrics.totalCalls} API calls`)
```

---

## 🎯 CHECKLIST PARA PRODUCCIÓN

- [ ] VITE_ACCUWEATHER_KEY configurada en .env.local (NO en .env)
- [ ] npm run build sin errores
- [ ] Cache hits > 80% en segundo refresh
- [ ] SyncBadge mostrando "Actualizado hace X min"
- [ ] API calls < 100 por refresh (después de primer load)
- [ ] Consumo mensual estimado < 15,000
- [ ] TTL correctamente limpiando datos viejos (60 min)

---

**Última actualización:** 2026-03-24
**Documentación:** debugCaching.ts + 13-debugging-cache.md

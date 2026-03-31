# 🚀 Setup AccuWeather — Guía Paso a Paso

## 📋 PASO 1: Obtener API Key

### 1.1 Registrarse en AccuWeather

1. Ve a: https://www.accuweather.com/en/free-weather-api
2. Click en **"Register"** → completa el formulario
3. Recibirás un email de confirmación
4. Verifica tu email
 Completado

### 1.2 Copiar tu API Key

1. Después de confirmar, inicia sesión
2. Ve a **My Account** → **API Management**
3. Busca tu plan (debería ser **Core Weather Starter**)
4. Copia la **API Key** (32 caracteres)

**Ejemplo**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

Completado
---

## 🔑 PASO 2: Configurar en tu Máquina

### 2.1 Crear `.env.local`

En la raíz del proyecto (`c:\Workspace\React\pokeweather`), crea un archivo llamado `.env.local`:

```bash
VITE_ACCUWEATHER_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Completado
```

⚠️ **NUNCA** lo guardes en Git. Este archivo es local.

### 2.2 Verificar que existe

```bash
# Terminal (PowerShell o bash):
cat .env.local
# Debería mostrar: VITE_ACCUWEATHER_KEY=...
```

### 2.3 Restart el servidor

```bash
# Terminal:
npm run dev

# Debería mostrar:
# ➜  Local:   http://localhost:5173/
```

---

## ✅ PASO 3: Verificar que Funciona

### 3.1 Abre la App

1. Ve a `http://localhost:5173`
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**

### 3.2 Busca los Logs Esperados

Debería ver algo como:

```
🌍 Loading 94 cities from AccuWeather API...
✅ Batch load: 94/94 ciudades, X cache hits, Y API calls, Zms
```

Si **NO ves estos logs**:
1. Busca mensajes de error rojo
2. Apunta el error exacto
3. Ve a la sección **Troubleshooting** de este documento

### 3.3 Verifica que Cargaron Ciudades

Si ves los logs ✅ arriba:
- Debería haber 94 pins en el mapa
- Sidebar debería mostrar "Ciudades • 94"
- SyncBadge debería mostrar "✓ Actualizado hace X min"

---

## 🧪 PASO 4: Debug si Algo Falla

### Test 1: Verificar API Key está configurada

En Console (F12):

```javascript
console.log(import.meta.env.VITE_ACCUWEATHER_KEY)
```

**Esperado**: Verás los 32 caracteres de tu API key
**Si está vacío**: `.env.local` no está siendo leído. Reinicia el servidor.

### Test 2: Verificar que se ejecuta loadCities

En Console:

```javascript
const { useWeather } = await import('./src/data/useWeather')
const { run } = useWeather()
run((cities) => {
  console.log(`Loaded ${cities.length} cities`)
})
```

**Esperado**: Después de 5-10 segundos, verás "Loaded 94 cities"
**Si muestra error**: Lee el mensaje de error

### Test 3: Ejecutar fetchCityWeather con 1 ciudad

```javascript
const { fetchCityWeather } = await import('./src/data/weatherService')
const apiKey = import.meta.env.VITE_ACCUWEATHER_KEY
const testCity = {
  lat: 35.6595,
  lon: 139.7004,
  name: 'Shibuya',
  id: 'shibuya'
}

try {
  const result = await fetchCityWeather(testCity, apiKey)
  console.log('✅ Success!', result)
} catch (e) {
  console.error('❌ Error:', e.message)
}
```

**Esperado**: Después de 2-3 segundos, verás el objeto City actualizado
**Si falla**: El error te dirá dónde está el problema

### Test 4: Usar debugCaching

```javascript
await pweCache.cacheSummary()
```

**Esperado**:
```
📍 LocationKeys (localStorage): 94
🌦️  Weather data (IndexedDB): 94
```

---

## 🆘 TROUBLESHOOTING

### Problema A: "VITE_ACCUWEATHER_KEY not configured"

**Causa**: `.env.local` no existe o no tiene la API key

**Solución**:
```bash
# Verifica que existe
cat .env.local

# Si no existe, créalo:
echo "VITE_ACCUWEATHER_KEY=your_api_key" > .env.local

# Restart servidor
npm run dev
```

### Problema B: "API key is required" error en console

**Causa**: `.env.local` existe pero no es leído

**Solución**:
```bash
# Stop servidor (Ctrl+C)
npm run dev
# Debería funcionar ahora
```

### Problema C: "401 Unauthorized"

**Causa**: API key es inválida o expirada

**Solución**:
```bash
# Verifica en https://www.accuweather.com/en/developer/apis
# Copia la key nuevamente
# Actualiza .env.local
# Restart servidor
```

### Problema D: "401 API call limit exceeded"

**Causa**: Alcanzaste 15,000 calls/mes

**Solución**:
1. Espera a que se reinicie el cupo mensual, o
2. Upgrade a un plan de pago, o
3. Usa mode test (próxima sesión)

### Problema E: App carga pero "Sin resultados"

**Causa**: Las ciudades no se están cargando

**Debug**:
```javascript
// En console:
1. console.log(import.meta.env.VITE_ACCUWEATHER_KEY)  // ¿tiene valor?
2. Recarga la página (Ctrl+R)
3. Busca "🌍 Loading 94 cities" en los logs
4. Si no está, busca mensajes de error rojo
5. Ejecuta: await pweCache.cacheSummary()  // ¿hay datos?
```

---

## 📊 Consumo Estimado de API

### Primer Load (sin caché)

```
94 ciudades × 3 endpoints = 282 calls
Tiempo: ~5-10 segundos
```

### Reloads dentro de 60 minutos

```
Hits desde caché = ~250 calls ahorrados
Consumo: ~32 calls (solo nuevas)
Tiempo: ~1-2 segundos
```

### Consumo Diario (15 refreshes)

```
Primero: 282 calls
Resto: 32 calls × 14 = 448 calls
Total: 730 calls/día

Consumo mensual: 730 × 30 = 21,900 calls
⚠️ Sobrepasa el presupuesto de 15,000/mes
```

**Solución**: Implementar **Lazy Load** (solo viewport visible) en Sprint 7

---

## ✨ Si Todo Funciona

Felicidades 🎉

El app debería:
- ✅ Cargar 94 ciudades en ~5 segundos
- ✅ Mostrar pins de clima en el mapa
- ✅ Actualizar cada hora automáticamente
- ✅ Usar caché para reloads rápidos
- ✅ Mostrar "Actualizado hace X min" en SyncBadge

---

## 📝 Archivos Importantes

- `.env.local` — Tu API key (local, no en Git)
- `src/data/useWeather.ts` — Hook principal que carga ciudades
- `src/data/weatherService.ts` — Fetch de AccuWeather
- `src/data/batchWeatherService.ts` — Batch processing
- `src/docs/ANALYSIS-DEEP-DEBUG.md` — Análisis detallado si algo falla

---

**Última actualización**: 2026-03-24
**Status**: ✅ Modo Mock Eliminado, API Real Requerida

# Algoritmo de Clasificación de Clima Pokémon GO

> Documento completo para replicar la lógica de clasificación de clima de Pokémon GO en cualquier aplicación.

---

## 1. RESUMEN EJECUTIVO

Pokémon GO usa datos de AccuWeather para determinar el clima **in-game** cada hora. El algoritmo es un **lookup en tabla + override condicional por viento**:

1. Se obtiene el pronóstico horario de AccuWeather (12 horas)
2. El `WeatherIcon` (ID 1-44) de AccuWeather se busca en una tabla de traducción → devuelve un clima PGO base
3. Si el clima base permite override por viento (`canWindy=true`) Y el viento/ráfagas superan umbrales → se fuerza "Windy"
4. El clima PGO final determina qué tipos de Pokémon están potenciados (boosted)

**La lógica real son ~7 líneas de código. Toda la complejidad está en las tablas de mapeo estáticas.**

---

## 2. FUENTE DE DATOS: AccuWeather API

### 2.1 Endpoint de pronóstico horario (12 horas)

```
GET https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/{locationKey}
    ?apikey={API_KEY}
    &metric=true
    &details=true
```

| Parámetro | Descripción |
|-----------|-------------|
| `locationKey` | ID numérico de ubicación de AccuWeather (se obtiene con Geoposition Search) |
| `apikey` | Clave de API AccuWeather |
| `metric=true` | **OBLIGATORIO** — Unidades métricas (km/h, °C). Los umbrales de viento están calibrados en km/h |
| `details=true` | **OBLIGATORIO** — Incluye viento, ráfagas, probabilidades, cobertura nubosa |

### 2.2 Endpoint de búsqueda por geolocalización

Para obtener el `locationKey` a partir de coordenadas:

```
GET https://dataservice.accuweather.com/locations/v1/cities/geoposition/search
    ?apikey={API_KEY}
    &q={lat},{lng}
```

**Respuesta relevante:**
```json
{
  "Key": "226396",
  "LocalizedName": "Shibuya-ku",
  "Country": { "ID": "JP", "LocalizedName": "Japan" }
}
```

El campo `Key` es el `locationKey` que se usa en el endpoint de pronóstico.

### 2.3 Estructura de respuesta del pronóstico

Array de 12 objetos (uno por hora). Campos usados por el algoritmo:

```json
{
  "DateTime": "2026-03-26T14:00:00+09:00",
  "WeatherIcon": 7,
  "IconPhrase": "Cloudy",
  "IsDaylight": true,
  "Temperature": { "Value": 22.5, "Unit": "C" },
  "Wind": {
    "Speed": { "Value": 35.0, "Unit": "km/h" },
    "Direction": { "Degrees": 180, "English": "S" }
  },
  "WindGust": {
    "Speed": { "Value": 42.0, "Unit": "km/h" }
  },
  "PrecipitationProbability": 20,
  "RainProbability": 15,
  "SnowProbability": 0,
  "IceProbability": 0,
  "Rain": { "Value": 0.2, "Unit": "mm" },
  "Snow": { "Value": 0.0, "Unit": "cm" },
  "Ice": { "Value": 0.0, "Unit": "mm" },
  "CloudCover": 85
}
```

### 2.4 Campos que usa el algoritmo para DECIDIR

| Campo | Tipo | Rol |
|-------|------|-----|
| `WeatherIcon` | int (1-44) | **DECISIÓN PRINCIPAL** — determina el clima base vía lookup |
| `Wind.Speed.Value` | double (km/h) | **OVERRIDE** — si > 29, puede forzar Windy |
| `WindGust.Speed.Value` | double (km/h) | **OVERRIDE** — si > 31, puede forzar Windy |

Todos los demás campos son **informativos** (se muestran al usuario pero no afectan la clasificación).

---

## 3. TABLA 1: Catálogo de Climas Pokémon GO (9 tipos)

```
ID | Clima                   | Día | Noche | Tipos Pokémon Potenciados
---|-------------------------|-----|-------|---------------------------
1  | Fog                     | Sí  | Sí    | Dark, Ghost
2  | Rain                    | Sí  | Sí    | Water, Electric, Bug
3  | Snow                    | Sí  | Sí    | Ice, Steel
4  | Clear                   | No  | Sí    | Ground, Fire, Grass
5  | Sunny                   | Sí  | No    | Ground, Fire, Grass
6  | Windy                   | Sí  | Sí    | Dragon, Flying, Psychic
7  | Cloudy                  | Sí  | Sí    | Fairy, Fighting, Poison
8  | Partly Cloudy (Day)     | Sí  | No    | Normal, Rock
9  | Partly Cloudy (Night)   | No  | Sí    | Normal, Rock
```

**Notas:**
- Sunny (5) y Clear (4) potencian los mismos tipos, pero Sunny es de día y Clear de noche.
- Partly Cloudy Day (8) y Night (9) potencian los mismos tipos, diferenciados por hora del día.
- El campo `IsDay`/`IsNight` YA viene resuelto por AccuWeather en el `WeatherIcon` (iconos 1-32 son de día, 33-44 de noche).

### Tipos Pokémon con su color (para UI)

```
ID | Tipo     | Color HEX
---|----------|----------
1  | Normal   | #8a8a59
2  | Fighting | #c03028
3  | Flying   | #a890f0
4  | Poison   | #a040a0
5  | Ground   | #e0c068
6  | Rock     | #b8a038
7  | Bug      | #a8b820
8  | Ghost    | #705898
9  | Steel    | #5598a3
10 | Fire     | #f08030
11 | Water    | #6890f0
12 | Grass    | #78c850
13 | Electric | #f8d030
14 | Psychic  | #f85888
15 | Ice      | #98d8d8
16 | Dragon   | #0876bf
17 | Dark     | #705848
18 | Fairy    | #e898e8
```

---

## 4. TABLA 2: Traducción AccuWeather → Clima PGO (44 iconos)

Esta tabla es el corazón del mapeo. Cada icono de AccuWeather tiene un clima PGO asignado.

### Iconos de Día (1-32)

```
Icon | Descripción AccuWeather       | canWindy | → PGO ID | → Clima PGO
-----|-------------------------------|----------|----------|------------------
1    | Sunny                         | Sí       | 5        | Sunny
2    | Mostly Sunny                  | Sí       | 5        | Sunny
3    | Partly Sunny                  | Sí       | 8        | Partly Cloudy (Day)
4    | Intermittent Clouds           | Sí       | 8        | Partly Cloudy (Day)
5    | Hazy Sunshine                 | Sí       | 7        | Cloudy
6    | Mostly Cloudy                 | Sí       | 7        | Cloudy
7    | Cloudy                        | Sí       | 7        | Cloudy
8    | Dreary (Overcast)             | Sí       | 7        | Cloudy
---  | 9, 10 NO EXISTEN              |          |          |
11   | Fog                           | No       | 1        | Fog
12   | Showers                       | No       | 2        | Rain
13   | Mostly Cloudy w/ Showers      | No       | 7        | Cloudy
14   | Partly Sunny w/ Showers       | No       | 8        | Partly Cloudy (Day)
15   | T-Storms                      | No       | 2        | Rain
16   | Mostly Cloudy w/ T-Storms     | No       | 7        | Cloudy
17   | Partly Sunny w/ T-Storms      | No       | 8        | Partly Cloudy (Day)
18   | Rain                          | No       | 2        | Rain
19   | Flurries                      | No       | 3        | Snow
20   | Mostly Cloudy w/ Flurries     | No       | 7        | Cloudy
21   | Partly Sunny w/ Flurries      | No       | 8        | Partly Cloudy (Day)
22   | Snow                          | No       | 3        | Snow
23   | Mostly Cloudy w/ Snow         | No       | 7        | Cloudy
24   | Ice                           | No       | 3        | Snow
25   | Sleet                         | No       | 3        | Snow
26   | Freezing Rain                 | No       | 2        | Rain
---  | 27, 28 NO EXISTEN             |          |          |
29   | Rain and Snow                 | No       | 2        | Rain
30   | Hot                           | Sí       | 5        | Sunny
31   | Cold                          | Sí       | 3        | Snow
32   | Windy                         | Sí       | 6        | Windy
```

### Iconos de Noche (33-44)

```
Icon | Descripción AccuWeather       | canWindy | → PGO ID | → Clima PGO
-----|-------------------------------|----------|----------|------------------
33   | Clear                         | Sí       | 4        | Clear
34   | Mostly Clear                  | Sí       | 4        | Clear
35   | Partly Cloudy                 | Sí       | 9        | Partly Cloudy (Night)
36   | Intermittent Clouds           | Sí       | 9        | Partly Cloudy (Night)
37   | Hazy Moonlight                | Sí       | 7        | Cloudy
38   | Mostly Cloudy                 | Sí       | 7        | Cloudy
39   | Partly Cloudy w/ Showers      | No       | 9        | Partly Cloudy (Night)
40   | Mostly Cloudy w/ Showers      | No       | 7        | Cloudy
41   | Partly Cloudy w/ T-Storms     | No       | 9        | Partly Cloudy (Night)
42   | Mostly Cloudy w/ T-Storms     | No       | 7        | Cloudy
43   | Mostly Cloudy w/ Flurries     | No       | 3        | Snow
44   | Mostly Cloudy w/ Snow         | No       | 3        | Snow
```

**Patrón clave de `canWindy`:**
- Climas "secos" (sol, nubes, frío, calor) → `canWindy = true`
- Precipitación activa (lluvia, nieve, tormentas, niebla) → `canWindy = false`
- Excepción: iconos 7 y 8 (Cloudy/Dreary) son `canWindy = true` aunque son nublados

---

## 5. ALGORITMO DE CLASIFICACIÓN (Pseudocódigo)

```
CONSTANTES:
  WIND_SPEED_THRESHOLD = 29    // km/h - viento sostenido
  GUST_SPEED_THRESHOLD = 31    // km/h - ráfagas
  WINDY_PGO_ID = 6

FUNCIÓN clasificarClima(datosHora):
    // PASO 1: Buscar el icono AccuWeather en la tabla de traducción
    traduccion = WEATHER_TRANSLATIONS[datosHora.WeatherIcon]

    SI traduccion NO existe:
        ERROR "Icono AccuWeather no reconocido: " + datosHora.WeatherIcon

    // PASO 2: Obtener el clima PGO base
    climaPgoId = traduccion.pgoIconId
    fueOverrideViento = false

    // PASO 3: Evaluar OVERRIDE POR VIENTO EXTREMO
    SI traduccion.canWindy == true:
        SI datosHora.Wind.Speed.Value > WIND_SPEED_THRESHOLD
           O datosHora.WindGust.Speed.Value > GUST_SPEED_THRESHOLD:
            climaPgoId = WINDY_PGO_ID  // Forzar "Windy"
            fueOverrideViento = true

    // PASO 4: Obtener datos del clima PGO final
    climaPgo = PGO_WEATHERS[climaPgoId]

    RETORNAR {
        climaPgo,                              // Clima PGO (id, descripción, tipos boosted)
        iconoAccuWeather: datosHora.WeatherIcon,
        fraseAccuWeather: datosHora.IconPhrase,
        velocidadViento: datosHora.Wind.Speed.Value,
        velocidadRafaga: datosHora.WindGust.Speed.Value,
        fueOverrideViento,
        tiposPotenciados: climaPgo.boostedTypes,
        hora: datosHora.DateTime,
        esDeDia: datosHora.IsDaylight,
        temperatura: datosHora.Temperature.Value,
        unidadTemp: datosHora.Temperature.Unit,
        probLluvia: datosHora.RainProbability,
        probNieve: datosHora.SnowProbability,
        coberturaNubes: datosHora.CloudCover
    }


FUNCIÓN clasificarPronostico(pronostico12horas):
    RETORNAR pronostico12horas.MAP(clasificarClima)
```

---

## 6. REGLAS DE NEGOCIO CLAVE

1. **El `WeatherIcon` es el único dato que determina el clima base.** No se usa temperatura, humedad, probabilidad de lluvia ni cobertura nubosa para la clasificación.

2. **El override de viento es la ÚNICA excepción** que modifica el clima base. Solo aplica cuando:
   - `canWindy = true` en la traducción del icono
   - `Wind.Speed.Value > 29` **OR** `WindGust.Speed.Value > 31` (es OR, no AND)

3. **Precipitación nunca se convierte en Windy.** Aunque haya viento de 100 km/h durante una tormenta (icon 15), sigue siendo Rain porque `canWindy = false`.

4. **Los umbrales están en km/h** porque la API se llama con `metric=true`. Si se usa imperial, los umbrales serían ~18 mph (viento) y ~19 mph (ráfagas).

5. **El cambio de clima en el juego ocurre cada hora en punto** (XX:00). El pronóstico se consulta típicamente ~5 minutos después de la hora.

6. **AccuWeather ya maneja día/noche** en los iconos: 1-32 son de día, 33-44 de noche. No necesitas calcular amanecer/atardecer.

---

## 7. EJEMPLO PASO A PASO

**Dato de AccuWeather:**
```json
{
  "WeatherIcon": 6,
  "IconPhrase": "Mostly Cloudy",
  "Wind": { "Speed": { "Value": 35.2, "Unit": "km/h" } },
  "WindGust": { "Speed": { "Value": 28.0, "Unit": "km/h" } }
}
```

**Paso 1:** Buscar icon 6 → `{ canWindy: true, pgoIconId: 7 }` → Cloudy

**Paso 2:** `canWindy = true`, evaluar viento:
- `Wind.Speed = 35.2 > 29` → **SÍ**
- (No importa que GustSpeed = 28 < 31, basta con que UNO supere)

**Paso 3:** Override → `pgoIconId = 6` → **Windy**

**Resultado:** Clima PGO = **Windy** (potencia Dragon, Flying, Psychic)

---

## 8. DATOS ESTÁTICOS COMPLETOS (formato JavaScript/JSON)

### 8.1 PGO_WEATHERS

```javascript
const PGO_WEATHERS = {
  1: { id: 1, description: "Fog",                   friendly: "fog",           boostedTypes: ["Dark", "Ghost"] },
  2: { id: 2, description: "Rain",                  friendly: "rain",          boostedTypes: ["Water", "Electric", "Bug"] },
  3: { id: 3, description: "Snow",                  friendly: "snow",          boostedTypes: ["Ice", "Steel"] },
  4: { id: 4, description: "Clear",                 friendly: "sunny-clear",   boostedTypes: ["Ground", "Fire", "Grass"] },
  5: { id: 5, description: "Sunny",                 friendly: "sunny-clear",   boostedTypes: ["Ground", "Fire", "Grass"] },
  6: { id: 6, description: "Windy",                 friendly: "windy",         boostedTypes: ["Dragon", "Flying", "Psychic"] },
  7: { id: 7, description: "Cloudy",                friendly: "cloudy",        boostedTypes: ["Fairy", "Fighting", "Poison"] },
  8: { id: 8, description: "Partly Cloudy (Day)",   friendly: "partly-cloudy", boostedTypes: ["Normal", "Rock"] },
  9: { id: 9, description: "Partly Cloudy (Night)", friendly: "partly-cloudy", boostedTypes: ["Normal", "Rock"] },
};
```

### 8.2 WEATHER_TRANSLATIONS

```javascript
const WEATHER_TRANSLATIONS = {
  1:  { id: 1,  iconText: "Sunny",                      canWindy: true,  pgoIconId: 5 },
  2:  { id: 2,  iconText: "Mostly Sunny",               canWindy: true,  pgoIconId: 5 },
  3:  { id: 3,  iconText: "Partly Sunny",               canWindy: true,  pgoIconId: 8 },
  4:  { id: 4,  iconText: "Intermittent Clouds",        canWindy: true,  pgoIconId: 8 },
  5:  { id: 5,  iconText: "Hazy Sunshine",              canWindy: true,  pgoIconId: 7 },
  6:  { id: 6,  iconText: "Mostly Cloudy",              canWindy: true,  pgoIconId: 7 },
  7:  { id: 7,  iconText: "Cloudy",                     canWindy: true,  pgoIconId: 7 },
  8:  { id: 8,  iconText: "Dreary (Overcast)",          canWindy: true,  pgoIconId: 7 },
  11: { id: 11, iconText: "Fog",                        canWindy: false, pgoIconId: 1 },
  12: { id: 12, iconText: "Showers",                    canWindy: false, pgoIconId: 2 },
  13: { id: 13, iconText: "Mostly Cloudy w/ Showers",   canWindy: false, pgoIconId: 7 },
  14: { id: 14, iconText: "Partly Sunny w/ Showers",    canWindy: false, pgoIconId: 8 },
  15: { id: 15, iconText: "T-Storms",                   canWindy: false, pgoIconId: 2 },
  16: { id: 16, iconText: "Mostly Cloudy w/ T-Storms",  canWindy: false, pgoIconId: 7 },
  17: { id: 17, iconText: "Partly Sunny w/ T-Storms",   canWindy: false, pgoIconId: 8 },
  18: { id: 18, iconText: "Rain",                       canWindy: false, pgoIconId: 2 },
  19: { id: 19, iconText: "Flurries",                   canWindy: false, pgoIconId: 3 },
  20: { id: 20, iconText: "Mostly Cloudy w/ Flurries",  canWindy: false, pgoIconId: 7 },
  21: { id: 21, iconText: "Partly Sunny w/ Flurries",   canWindy: false, pgoIconId: 8 },
  22: { id: 22, iconText: "Snow",                       canWindy: false, pgoIconId: 3 },
  23: { id: 23, iconText: "Mostly Cloudy w/ Snow",      canWindy: false, pgoIconId: 7 },
  24: { id: 24, iconText: "Ice",                        canWindy: false, pgoIconId: 3 },
  25: { id: 25, iconText: "Sleet",                      canWindy: false, pgoIconId: 3 },
  26: { id: 26, iconText: "Freezing Rain",              canWindy: false, pgoIconId: 2 },
  29: { id: 29, iconText: "Rain and Snow",              canWindy: false, pgoIconId: 2 },
  30: { id: 30, iconText: "Hot",                        canWindy: true,  pgoIconId: 5 },
  31: { id: 31, iconText: "Cold",                       canWindy: true,  pgoIconId: 3 },
  32: { id: 32, iconText: "Windy",                      canWindy: true,  pgoIconId: 6 },
  33: { id: 33, iconText: "Clear",                      canWindy: true,  pgoIconId: 4 },
  34: { id: 34, iconText: "Mostly Clear",               canWindy: true,  pgoIconId: 4 },
  35: { id: 35, iconText: "Partly Cloudy",              canWindy: true,  pgoIconId: 9 },
  36: { id: 36, iconText: "Intermittent Clouds",        canWindy: true,  pgoIconId: 9 },
  37: { id: 37, iconText: "Hazy Moonlight",             canWindy: true,  pgoIconId: 7 },
  38: { id: 38, iconText: "Mostly Cloudy",              canWindy: true,  pgoIconId: 7 },
  39: { id: 39, iconText: "Partly Cloudy w/ Showers",   canWindy: false, pgoIconId: 9 },
  40: { id: 40, iconText: "Mostly Cloudy w/ Showers",   canWindy: false, pgoIconId: 7 },
  41: { id: 41, iconText: "Partly Cloudy w/ T-Storms",  canWindy: false, pgoIconId: 9 },
  42: { id: 42, iconText: "Mostly Cloudy w/ T-Storms",  canWindy: false, pgoIconId: 7 },
  43: { id: 43, iconText: "Mostly Cloudy w/ Flurries",  canWindy: false, pgoIconId: 3 },
  44: { id: 44, iconText: "Mostly Cloudy w/ Snow",      canWindy: false, pgoIconId: 3 },
};
```

### 8.3 Función de clasificación (JavaScript)

```javascript
const WIND_SPEED_THRESHOLD = 29;  // km/h
const GUST_SPEED_THRESHOLD = 31;  // km/h
const WINDY_PGO_ID = 6;

function classifyWeather(hourlyData) {
  const translation = WEATHER_TRANSLATIONS[hourlyData.WeatherIcon];
  if (!translation) throw new Error(`Icon ${hourlyData.WeatherIcon} desconocido`);

  let pgoIconId = translation.pgoIconId;
  let wasWindOverride = false;

  if (translation.canWindy &&
      (hourlyData.Wind.Speed.Value > WIND_SPEED_THRESHOLD ||
       hourlyData.WindGust.Speed.Value > GUST_SPEED_THRESHOLD)) {
    pgoIconId = WINDY_PGO_ID;
    wasWindOverride = true;
  }

  return { ...PGO_WEATHERS[pgoIconId], wasWindOverride };
}
```

---

## 9. LÍMITES DE LA API Y ESTRATEGIA DE LLAMADAS

### 9.1 Planes disponibles

| Plan | Llamadas/mes | Llamadas/día equiv. | Notas |
|------|-------------|---------------------|-------|
| Essential (gratis) | ~1,500 | ~50 | Solo pruebas |
| **Core Weather Starter** | **15,000** | **~500** | Plan recomendado |
| Developer | ~225,000 | ~7,500 | Para producción |

### 9.2 Cálculo para 104 ciudades (sin optimización)

```
104 ciudades × 24 actualizaciones/día × 30 días = 74,880 llamadas/mes  →  5× el límite
```

Para mantenerse bajo 15,000 llamadas/mes con 104 ciudades hay que combinar dos técnicas:
1. **Deduplicar locationKeys** — ciudades cercanas comparten el mismo key → menos llamadas
2. **Aumentar el TTL del caché** del pronóstico (de 1h a 3-4h)

### 9.3 Deduplicación de locationKeys (ahorra 20-30% de llamadas)

Dos ciudades a menos de ~15 km frecuentemente reciben el **mismo `locationKey`** de AccuWeather porque caen dentro de la misma zona geográfica. Hacer dos llamadas de forecast con el mismo locationKey es un desperdicio — el resultado es byte-for-byte idéntico.

**Ejemplos de ciudades que típicamente comparten locationKey:**
- Shibuya + Shinjuku (Tokio) — 2.5 km de distancia
- Central HK + Wan Chai + TST — 1-3 km
- Chinatown SG + Orchard Road + Little India — 2-3 km
- Le Marais + Trocadéro (París) — 5 km
- Daan + Ximending (Taipei) — 3 km
- Palermo + San Telmo (Buenos Aires) — 6 km

**104 ciudades → estimado ~70-80 locationKeys únicos** (ahorro de ~25 llamadas por ciclo).

**Algoritmo de deduplicación:**

```javascript
// FASE 1: Construir mapa locationKey → [ciudades]
// (llamadas geoposition solo se hacen una vez; se cachean permanentemente)
async function buildLocationKeyMap(cities) {
  const keyToCities = new Map(); // locationKey → [city, city, ...]

  for (const city of cities) {
    const cacheKey = `pgo_loc_${city.lat}_${city.lng}`;
    let locationKey = localStorage.getItem(cacheKey);

    if (!locationKey) {
      const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search`
               + `?apikey=${API_KEY}&q=${city.lat},${city.lng}`;
      const res = await fetch(url).then(r => r.json());
      locationKey = res.Key;
      localStorage.setItem(cacheKey, locationKey); // permanente
      await new Promise(r => setTimeout(r, 500)); // delay para no saturar
    }

    city.locationKey = locationKey;
    if (!keyToCities.has(locationKey)) keyToCities.set(locationKey, []);
    keyToCities.get(locationKey).push(city);
  }

  return keyToCities;
}

// FASE 2: UNA sola llamada de forecast por locationKey único
// (ciudades con el mismo key reciben exactamente los mismos datos)
async function fetchAllForecasts(keyToCities) {
  const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 horas (ver sección 9.4)

  for (const [locationKey, cities] of keyToCities) {
    const cacheKey = `pgo_fc_${locationKey}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    const now = Date.now();

    let forecastData;
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      forecastData = cached.data; // caché válido, 0 llamadas API
    } else {
      const url = `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationKey}`
               + `?apikey=${API_KEY}&metric=true&details=true`;
      forecastData = await fetch(url).then(r => r.json());
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: forecastData }));
      await new Promise(r => setTimeout(r, 500));
    }

    // Distribuir el mismo pronóstico a TODAS las ciudades del grupo
    const classified = forecastData.map(classifyWeather);
    for (const city of cities) {
      city.forecast = classified;
      city.sharedWith = cities.filter(c => c !== city).map(c => c.name);
    }
  }
}
```

**En la UI**, si varias ciudades comparten locationKey, mostrar un indicador:
```
Misma zona AccuWeather que: Wan Chai, Mong Kok
```

### 9.4 Cálculo final con deduplicación

```
~75 keys únicos × 6 ciclos/día (TTL 4h) × 30 días = 13,500 llamadas/mes  →  bajo el límite

Más: ~100 llamadas geoposition iniciales (solo la primera vez)
```

| Configuración | Llamadas/mes | Cabe en 15,000? |
|---------------|-------------|------------------|
| 104 ciudades, TTL 1h, sin dedup | 74,880 | No |
| 104 ciudades, TTL 1h, con dedup (~75 keys) | 54,000 | No |
| 104 ciudades, TTL 4h, con dedup (~75 keys) | **13,500** | **Si** |
| 20 ciudades únicas, TTL 1h | 14,400 | Si |

**Recomendación final:** usar TTL de 4 horas con deduplicación activa.

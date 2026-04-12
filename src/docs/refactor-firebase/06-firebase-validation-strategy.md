# Firebase Validation Strategy — Verificar US-801 & US-802 Datos

**Contexto:** Sprint 8 — Validación de persistencia en Firestore  
**Objetivo:** Confirmar que US-801 (pronósticos) y US-802 (catálogo) guardaron datos correctamente  
**Autor:** Análisis técnico de Claude Code  
**Fecha:** 2026-04-09

---

## 🎯 Datos a Validar

### US-801: Persistir Pronóstico en Firestore
```
Esperado:
├─ /city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}/
│  ├─ city_id: string
│  ├─ city_name: string
│  ├─ country: string
│  ├─ region: string
│  ├─ lat: number
│  ├─ lon: number
│  ├─ date_hour: string (YYYY-MM-DD-HH format)
│  ├─ snapshots: ForecastSnapshot[] (12 items esperados)
│  │  ├─ hour: 0-23
│  │  ├─ raw_condition_code: number
│  │  ├─ raw_condition_text: string
│  │  ├─ classified: string (sunny/partly/cloudy/rain/snow/fog/windy)
│  │  ├─ types: string[] (Pokémon GO types)
│  │  ├─ temperature_c: number
│  │  ├─ wind_kmh: number
│  │  ├─ precipitation_mm: number
│  │  ├─ humidity_pct: number
│  │  ├─ is_windy_override: boolean
│  ├─ ttl: Timestamp (now + 7 days)
│  └─ created_at: Timestamp (now)

Validar:
✓ Mínimo 5 ciudades con datos (Tokyo, London, Sydney, São Paulo, Cairo)
✓ Cada ciudad tiene mínimo 1 documento forecast
✓ Snapshots tienen 12 horas (si no está en caché)
✓ Tipos Pokémon no están vacíos
✓ TTL está calculado correctamente
```

### US-802: Catálogo Estático en Firestore
```
Esperado:
├─ /weather_catalog/conditions
│  └─ { sunny, partly, cloudy, fog, rain, snow, windy }
│     ├─ label: string (español)
│     ├─ emoji: string
│     ├─ accuweather_codes?: number[]
│     ├─ threshold_wind_kmh?: number

├─ /weather_catalog/type_mapping
│  └─ { sunny, partly, cloudy, fog, rain, snow, windy }
│     └─ string[] (Pokémon GO types)

└─ /weather_catalog/rules
   ├─ windy_override: object
   ├─ dedup: object
   ├─ version: "1.0.0"
   └─ last_updated: string (ISO date)

Validar:
✓ 3 documentos existen
✓ Condiciones traducidas al español
✓ Tipos Pokémon son válidos (normal, fire, water, etc)
✓ Rules tienen estructura correcta
✓ version = "1.0.0"
```

---

## 🛠️ 4 Opciones de Validación

### OPCIÓN 1: Firebase Console (Online — Sin Herramientas)

**Descripción:** UI web oficial de Firebase  
**Herramienta:** https://console.firebase.google.com/

**Ventajas:**
- ✅ No requiere instalación
- ✅ Interfaz visual clara
- ✅ Puedo navegar colecciones/documentos
- ✅ Ver Firestore Storage + usage
- ✅ Export JSON si necesario

**Desventajas:**
- ❌ Requiere login manual (OAuth)
- ❌ No automatizable
- ❌ No puedo documentar results en código

**Pasos:**
1. Abrir https://console.firebase.google.com/
2. Seleccionar proyecto: `weather-app-prod-ef50d`
3. Ir a "Firestore Database"
4. Navegar: `city_weather` → seleccionar ciudad → ver documentos
5. Navegar: `weather_catalog` → ver 3 documentos
6. Tomar screenshots + documentar hallazgos

**Tiempo:** 5-10 min

---

### OPCIÓN 2: Firebase CLI + Emulator

**Descripción:** Línea de comandos oficial de Firebase  
**Herramienta:** `firebase` CLI (npm global)

**Instalación:**
```bash
npm install -g firebase-tools
firebase login  # OAuth interactivo
firebase init emulator  # Descargar emulador
```

**Ventajas:**
- ✅ Automatizable (scripts bash)
- ✅ Acceso full a Firestore
- ✅ Puede exportar JSON
- ✅ Emulator = pruebas locales sin tocar prod

**Desventajas:**
- ❌ Instalación + 500MB descarga
- ❌ Requiere Node.js 14+
- ❌ Emulator es simulado (datos reales están en Firestore prod)

**Scripts disponibles:**
```bash
firebase firestore:indexes:list
firebase firestore:delete collection_name --recursive
firebase emulator:start
```

**Tiempo:** 10-15 min instalación + 2-3 min ejecución

---

### OPCIÓN 3: Node.js + firebase-admin SDK

**Descripción:** Script Node que se conecta a Firestore  
**Archivo:** `scripts/validate-firestore.ts`

**Ventajas:**
- ✅ Total control programático
- ✅ Puedo validar datos directamente en código
- ✅ Automatizable (CI/CD)
- ✅ Genera reportes HTML/JSON
- ✅ Puedo comparar vs expected schema

**Desventajas:**
- ❌ Requiere serviceAccountKey (JSON credentials)
- ❌ serviceAccountKey es secreto (no commitear)
- ❌ Toma ~5 min escribir script robusto

**Estructura:**
```typescript
// scripts/validate-firestore.ts
import admin from 'firebase-admin'

const app = admin.initializeApp({
  credential: admin.credential.cert(require('../.env.serviceAccountKey.json')),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
})

const db = admin.firestore(app)

async function validateUS801() {
  const snap = await db.collection('city_weather').get()
  console.log(`✅ Ciudades con datos: ${snap.size}`)
  
  snap.forEach(doc => {
    const data = doc.data()
    console.log(`  - ${data.city_name}: ${data.snapshots.length} snapshots`)
  })
}

async function validateUS802() {
  const conditions = await db.collection('weather_catalog').doc('conditions').get()
  console.log(`✅ Condiciones: ${Object.keys(conditions.data()).length}`)
}

validateUS801()
validateUS802()
```

**Tiempo:** 15-20 min script + 1 min ejecución

---

### OPCIÓN 4: REST API de Firestore

**Descripción:** HTTP requests directas a Firestore API  
**Endpoint:** `https://firestore.googleapis.com/v1/projects/...`

**Ventajas:**
- ✅ Sin instalación (solo curl/fetch)
- ✅ Documentado en API oficial
- ✅ Portable (cualquier lenguaje)

**Desventajas:**
- ❌ Requiere auth token (OAuth complicado)
- ❌ Endpoints verbosos
- ❌ Error messages genéricos

**Token requerido:**
```bash
gcloud auth application-default print-access-token
```

**Tiempo:** 20-30 min de setup + OAuth

---

## 🎯 Recomendación: OPCIÓN 1 + OPCIÓN 3

### Fase 1: Validación Rápida (OPCIÓN 1 — Firebase Console)
**Tiempo:** 5 min
- Abrir Firebase Console
- Visualizar colecciones
- Confirmar datos existen
- Tomar screenshots

### Fase 2: Validación Automatizada (OPCIÓN 3 — Node.js + firebase-admin)
**Tiempo:** 15-20 min

**Por qué:**
1. **Rápido:** Ya tengo SDK en package.json (`firebase`)
2. **Automatizable:** Script reutilizable para futuros sprints
3. **Documentable:** Resultados en código + markdown
4. **Reporteable:** Puedo generar HTML/JSON con hallazgos
5. **CI/CD-ready:** Puede ejecutarse en GitHub Actions

---

## 📝 Plan Ejecución

### PASO 1: Abrir Firebase Console (5 min)
```
1. https://console.firebase.google.com/
2. Proyecto: weather-app-prod-ef50d
3. Firestore Database → Collections
4. Navegar:
   ├─ city_weather/ → 5+ ciudades
   ├─ weather_catalog/conditions → 7 condiciones
   ├─ weather_catalog/type_mapping → 7 tipos
   └─ weather_catalog/rules → 1 documento
5. Documentar en capturas
```

### PASO 2: Crear Script de Validación (15 min)
**Archivo:** `scripts/validate-firestore.ts`

**Funciones:**
```typescript
async function validateUS801_CityWeather()     // Validar pronósticos
async function validateUS802_Conditions()      // Validar condiciones
async function validateUS802_TypeMapping()     // Validar tipos
async function validateUS802_Rules()           // Validar reglas
async function generateReport()                // Generar reporte HTML
```

**Output esperado:**
```
✅ US-801 VALIDATION
  ├─ Cities with data: 5
  │  ├─ Tokyo: 12 snapshots, TTL: 2026-04-16
  │  ├─ London: 12 snapshots, TTL: 2026-04-16
  │  ├─ Sydney: 12 snapshots, TTL: 2026-04-16
  │  ├─ São Paulo: 12 snapshots, TTL: 2026-04-16
  │  └─ Cairo: 12 snapshots, TTL: 2026-04-16
  ├─ Total documents: 5
  ├─ Avg snapshots per city: 12
  └─ Storage size: ~50 KB

✅ US-802 VALIDATION
  ├─ Conditions: 7 (sunny, partly, cloudy, fog, rain, snow, windy)
  ├─ Type mappings: 7
  ├─ Rules version: 1.0.0
  └─ Last updated: 2026-04-08

✅ ALL VALIDATIONS PASSED
```

### PASO 3: Documentar Hallazgos (5 min)
**Archivo:** `src/docs/refactor-firebase/07-firebase-validation-results.md`

Contenido:
- Screenshots de Firebase Console
- Output del script de validación
- Tabla de ciudades + snapshots
- Métricas: documentos, tamaño, TTL
- ✅/❌ checklist vs expected schema

### PASO 4: Guardar Script para Futuros Sprints (5 min)
- Versionar `scripts/validate-firestore.ts`
- Commit: `build(scripts): Add Firebase validation script`
- Documentar en CLAUDE.md: "Para validar Firestore: `npm run validate:firebase`"

---

## 🔐 Credenciales Requeridas

### Para usar `firebase-admin`:

**Necesito:**
1. Archivo JSON de credenciales (serviceAccountKey)
   - **Dónde obtenerlo:**
     - Firebase Console → Project Settings → Service Accounts → Generate Key
   - **Dónde guardarlo:**
     - `.env.serviceAccountKey.json` (⚠️ NO commitear)
     - Agregar a `.gitignore`

2. Variables de entorno:
```
VITE_FIREBASE_PROJECT_ID=weather-app-prod-ef50d
# El serviceAccountKey se carga desde archivo
```

### Para evitar exponer credenciales:

```bash
# .gitignore
.env.serviceAccountKey.json
*.serviceAccountKey.json
```

---

## ✅ Checklist de Validación

### US-801: Pronósticos
- [ ] Mínimo 5 ciudades con documentos
- [ ] Cada ciudad tiene `snapshots` array
- [ ] Snapshots tienen mínimo 1 item (máx 12 esperado)
- [ ] Cada snapshot tiene: `hour`, `classified`, `types`, `temperature_c`
- [ ] `classified` es uno de: sunny, partly, cloudy, fog, rain, snow, windy
- [ ] `types` no está vacío y contiene tipos Pokémon válidos
- [ ] `ttl` es 7 días desde `created_at`
- [ ] `created_at` es timestamp reciente (< 1 hora)

### US-802: Catálogo
- [ ] Documento `weather_catalog/conditions` existe
- [ ] Tiene 7 condiciones (sunny, partly, cloudy, fog, rain, snow, windy)
- [ ] Cada condición tiene: `label` (español), `emoji`
- [ ] Documento `weather_catalog/type_mapping` existe
- [ ] Mapea 7 condiciones → arrays de tipos Pokémon
- [ ] Tipos válidos: normal, fire, water, grass, electric, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy
- [ ] Documento `weather_catalog/rules` existe
- [ ] Rules contienen: `windy_override`, `dedup`, `version`, `last_updated`
- [ ] Version = "1.0.0"

### Métricas Generales
- [ ] Storage < 1 MB (esperado ~100 KB)
- [ ] Documentos < 100 (esperado ~8: 5 ciudades + 3 catálogo)
- [ ] Sin documentos duplicados
- [ ] Timestamps están en UTC

---

## 📊 Estructura del Reporte Final

```markdown
# Firebase Validation Report — 2026-04-09

## Summary
✅ All validations passed
├─ US-801: 5/5 cities validated
├─ US-802: 3/3 catalog documents validated
└─ No errors detected

## Metrics
├─ Total documents: 8
├─ Storage size: 87 KB
├─ Avg snapshots per city: 12
└─ Firestore free tier usage: 0.87%

## US-801 Details
[Tabla de ciudades + snapshots + TTL]

## US-802 Details
[Tabla de condiciones + tipos]

## Conclusions
- ✅ Persistencia funcionando correctamente
- ✅ Datos guardados con estructura esperada
- ✅ TTL calculado correctamente
- ✅ Sin regresiones detectadas
```

---

## 🚀 Próximos Pasos

1. **HOY:** Opción 1 (Firebase Console — validación visual)
2. **Luego:** Opción 3 (Script Node — validación automatizada)
3. **Sprint 9:** Agregar validaciones a CI/CD

---

## 📚 Referencias

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Docs](https://firebase.google.com/docs/cli)
- [firebase-admin SDK](https://firebase.google.com/docs/database/admin/start)
- [Firestore REST API](https://firebase.google.com/docs/firestore/use-rest-api)

---

**Status:** Ready for validation  
**Estimated time:** 25-30 min total (5 min console + 20 min script)

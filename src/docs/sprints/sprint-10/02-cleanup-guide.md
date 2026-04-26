# 🗑️ Firestore Cleanup Guide — Pokémon Weather Explorer

**Última actualización:** 2026-04-19  
**Script:** `scripts/clean-firestore.ts`  
**Sprint:** 10

---

## 📋 Opciones de Limpieza

El script `clean-firestore.ts` ahora soporta **limpieza granular**:

| Comando | Efecto |
|---------|--------|
| `npm run clean:firestore` | Limpia TODO: city_weather + classification_reports |
| `npm run clean:firestore -- --only-city` | Solo city_weather/{city_id}/forecasts/ |
| `npm run clean:firestore -- --only-reports` | Solo classification_reports/ |
| `npm run clean:firestore -- --dry-run` | Simula sin hacer cambios reales |
| `npm run clean:firestore -- --skip-verify` | Salta validación (más rápido) |
| `npm run clean:firestore -- --help` | Muestra ayuda |

---

## 🎯 Casos de Uso Comunes

### 1️⃣ Reset Completo (cuando algo se rompió)

```bash
npm run clean:firestore
```

**Qué limpia:**
- ✅ Elimina TODOS los pronósticos (`city_weather/*/forecasts/*`)
- ✅ Elimina TODOS los reportes manuales (`classification_reports/*`)
- ❌ NO toca `weather_catalog` (datos estáticos de configuración)

**Tiempo:** ~30-60 segundos (batches de 400 docs)

---

### 2️⃣ Reset Solo Pronósticos (mantener reportes)

```bash
npm run clean:firestore -- --only-city
```

**Qué limpia:**
- ✅ `city_weather/{city_id}/forecasts/*` (12-15 documentos por ciudad)
- ❌ `classification_reports/` (se preservan)
- ❌ `weather_catalog` (nunca se toca)

**Cuándo usar:**
- Después de eliminar accidentalmente `city_weather`
- Cuando BigQuery está grabando mal y necesitas datos frescos
- Para testing de schema de nuevos pronósticos

---

### 3️⃣ Reset Solo Reportes (mantener pronósticos)

```bash
npm run clean:firestore -- --only-reports
```

**Qué limpia:**
- ❌ `city_weather/*` (se preservan todos los pronósticos)
- ✅ `classification_reports/*` (reportes manuales de correcciones)
- ❌ `weather_catalog` (nunca se toca)

**Cuándo usar:**
- Usuario reportó error pero quiere mantener datos de pronósticos
- Testing sin contaminación de reportes pasados

---

### 4️⃣ Simular Antes de Ejecutar (—dry-run)

```bash
npm run clean:firestore -- --dry-run
```

**Efecto:**
- Cuenta documentos que SERÍAN eliminados
- NO elimina nada
- Útil para ver el impacto antes de confirmar

**Salida:**
```
📋 Plan:
   • city_weather/{city_id}/forecasts/
   • classification_reports/

🗑️  Simulando limpieza de city_weather → forecasts...
   forecasts: 15 documentos encontrados...
   city_weather (raíz): 5 documentos encontrados...

🗑️  Simulando limpieza de classification_reports...
   classification_reports: 3 documentos encontrados...

✅ city_weather SIMULADA — 15 forecasts + 5 docs raíz
✅ classification_reports SIMULADA — 3 documentos

ℹ️  DRY-RUN: Ningún cambio fue aplicado.
```

---

### 5️⃣ Skip Verificación (más rápido, riesgoso)

```bash
npm run clean:firestore -- --only-city --skip-verify
```

**Efecto:**
- Ejecuta la limpieza
- NO verifica si quedó vacío al final (ahorra 5-10 seg)

**Cuándo usar:**
- Ya has ejecutado antes y confías en el resultado
- Necesitas máxima velocidad

---

## ⚙️ Requisito Previo: Service Account Key

El script necesita credenciales de Firebase Admin SDK. Una sola vez:

### Paso 1: Generar clave en Firebase Console

1. Abre [Firebase Console](https://console.firebase.google.com)
2. Tu proyecto → **Project Settings** (⚙️)
3. Tab **Service Accounts**
4. Click **"Generate New Private Key"** → descarga JSON

### Paso 2: Guardar en proyecto

```bash
# Copiar el JSON descargado a la raíz del proyecto
cp ~/Downloads/weather-app-prod-ef50d-*.json .env.serviceAccountKey.json
```

### Paso 3: Agregar a .gitignore (CRÍTICO)

```bash
# En .gitignore:
.env.serviceAccountKey.json  # ← Nunca commitear credenciales
```

Ahora puedes usar cualquier comando de limpieza.

---

## 📊 Estructura de Datos (referencia)

```
Firebase Firestore
├── city_weather/
│   ├── auckland/ (city_id)
│   │   └── forecasts/
│   │       ├── 2026-04-19-22/ (YYYY-MM-DD-HH)
│   │       ├── 2026-04-19-23/
│   │       └── 2026-04-20-00/
│   ├── sydney/
│   │   └── forecasts/ (similar)
│   └── ... (15+ ciudades)
│
├── classification_reports/
│   ├── doc_id_1/ (manual corrections)
│   ├── doc_id_2/
│   └── ...
│
├── weather_catalog/  ← NUNCA limpiamos esto
│   └── catalog/ (estático, para toda la app)
│
└── weather_analytics/ ← BigQuery export (auto)
    └── (externo a Firestore)
```

---

## 🔍 Validación Post-Limpieza

Después de ejecutar, el script verifica:

✅ **forecasts:** ¿Vacío?  
✅ **classification_reports:** ¿Vacío?  
✅ **weather_catalog:** ¿Preservado?

**Si algo falla:**
```bash
# Algunos docs pueden quedar por TTL de Firestore (hasta 24h)
# Vuelve a ejecutar si es necesario:
npm run clean:firestore -- --only-city
```

---

## 🚨 Errores Comunes

### ❌ `.env.serviceAccountKey.json no encontrado`

```
❌ .env.serviceAccountKey.json no encontrado.
   Genera uno en: Firebase Console → Project Settings → Service Accounts
   Guárdalo en: /path/to/project/.env.serviceAccountKey.json
```

**Solución:**
1. Descarga la clave desde Firebase Console (ver sección "Requisito Previo")
2. Guarda en raíz del proyecto: `.env.serviceAccountKey.json`
3. Vuelve a ejecutar

---

### ❌ `Error: permission-denied`

Probablemente la clave no tiene permisos. Regenera una nueva en Firebase Console.

---

### ⚠️ `Algunos documentos pueden quedar...`

Es normal. Firestore TTL elimina eventual (hasta 24h). Si no puedes esperar:

```bash
# Esperar 10 segundos y reintentar:
sleep 10
npm run clean:firestore -- --only-city
```

---

## 📝 Ejemplos Prácticos

### Scenario A: Te equivocaste, eliminaste `city_weather`

```bash
# Verificar qué tienes (dry-run):
npm run clean:firestore -- --only-city --dry-run

# Luego limpiar de verdad (esperar ~30 seg):
npm run clean:firestore -- --only-city
```

### Scenario B: Testing de nuevo schema

```bash
# Limpiar todo:
npm run clean:firestore

# Luego redeploy con cambios de schema
# El app creará nuevos docs con la estructura correcta
```

### Scenario C: BigQuery está cargando mal

```bash
# Reseteamos city_weather, BigQuery Extension se reconfigura:
npm run clean:firestore -- --only-city

# El Extension recrea la tabla city_weather_raw_changelog
# Nueva exportación comienza inmediatamente
```

---

## 🎯 Flow Recomendado

```
1. Decide qué limpiar (--only-city, --only-reports, o ambos)
2. Ejecuta con --dry-run primero:
   npm run clean:firestore -- [OPTIONS] --dry-run
3. Verifica el output (# de docs encontrados)
4. Confirma ejecutando sin --dry-run:
   npm run clean:firestore -- [OPTIONS]
5. Espera verificación (1-2 min)
6. Verifica en Firebase Console que esté vacío
```

---

## 📞 FAQ

**P: ¿Puedo recuperar datos después de limpiar?**  
R: No. La limpieza es **irreversible**. Usa `--dry-run` primero.

**P: ¿Qué pasa con BigQuery?**  
R: Los datos históricos quedan en BigQuery (7+ días de histórico). Solo se resetean forecasts nuevos.

**P: ¿Cuánto tarda?**  
R: ~30-60 segundos (depende del # de documentos).

**P: ¿Puedo cancelar a mitad?**  
R: Sí. Presiona Ctrl+C. BigQuery puede quedar con datos parciales (se limpia eventualmente).

**P: ¿Es seguro hacerlo en producción?**  
R: No. Solo en desarrollo. Para producción, usar `--dry-run` primero y coordinar con el equipo.

---

## 🔗 Relacionados

- [Firebase Monitoring](FIREBASE-MONITORING.md) — Vigilancia automática
- [Firestore Data Schema](../../architecture/10-firestore-data-schema.md) — Estructura de datos
- [ValidationReport](../sprint-9/VALIDATION-REPORT.md) — Validación de schema

---

**Última ejecución exitosa:** 2026-04-19  
**Próxima revisión:** Después de cambios de schema importantes  
**Sprint:** 10 — Dashboard Looker Studio + QA Setup

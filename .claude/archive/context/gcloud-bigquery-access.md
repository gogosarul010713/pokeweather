# 🔑 Acceso gcloud + BigQuery (Autonomous)

> Claude puede consultar BigQuery directamente sin pasos manuales del usuario.

---

## ✅ Acceso Verificado (2026-04-21)

**Herramientas disponibles en la máquina:**
- ✅ `gcloud` (v565.0.0)
- ✅ `bq` (BigQuery CLI v2.1.31)
- ✅ `gsutil` (v5.36)

**Proyecto Firebase activo:**
```bash
gcloud config list --format="value(core.project)"
→ weather-app-prod-ef50d
```

**Dataset BigQuery:**
```bash
bq ls
→ weather_analytics
```

**Tablas disponibles:**
- `city_weather_raw_changelog` (TABLE) — 2,564 rows, raw Firestore changelog
- `city_weather_raw_latest` (VIEW) — último estado
- `snapshots_flat` (VIEW) — snapshots aplanados

---

## 🚀 Script Preconfigurado

**Ubicación:** `scripts/query-predictions.sh`

```bash
./scripts/query-predictions.sh latest    # Últimas 20 predicciones
./scripts/query-predictions.sh stats     # Estadísticas
./scripts/query-predictions.sh count     # Total de registros
./scripts/query-predictions.sh export    # Exportar a JSON
./scripts/query-predictions.sh hours 24  # Últimas N horas
```

---

## 🔍 Queries Útiles Directas

### Últimas predicciones (CREATE)
```bash
bq query --use_legacy_sql=false --format=pretty "
SELECT
  timestamp,
  json_extract_scalar(PARSE_JSON(data), '$.city_name') as city,
  json_extract_scalar(PARSE_JSON(data), '$.calculated_condition') as condition,
  json_extract_scalar(PARSE_JSON(data), '$.date_hour') as date_hour,
  json_extract_scalar(PARSE_JSON(data), '$.local_time_user') as local_time_user
FROM \`weather-app-prod-ef50d.weather_analytics.city_weather_raw_changelog\`
WHERE operation = 'CREATE'
ORDER BY timestamp DESC
LIMIT 20
"
```

### Estadísticas por operación
```bash
bq query --use_legacy_sql=false "
SELECT operation, COUNT(*) as total
FROM \`weather-app-prod-ef50d.weather_analytics.city_weather_raw_changelog\`
GROUP BY operation
"
```

### Ver esquema
```bash
bq show --schema weather_analytics.snapshots_flat
bq show weather_analytics.city_weather_raw_changelog
```

---

## 📋 Estructura de Datos

### `city_weather_raw_changelog` (Raw)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| timestamp | TIMESTAMP | Cuándo se escribió |
| operation | STRING | CREATE \| UPDATE \| DELETE |
| document_id | STRING | `{YYYY-MM-DD-HH}` |
| data | STRING (JSON) | Todos los campos del documento |

**Campos dentro de `data` JSON:**
- `city_id`, `city_name`, `country`, `region`
- `calculated_condition` (sunny, rain, cloudy, etc.)
- `date_hour` (`YYYY-MM-DD-HH`, redondeado a hora siguiente)
- `local_time_user` (DD/MM HH:MM)
- `timezone` (offset horas: -5, +1, +9, etc.)
- `snapshots[]` (array de 12 horas)

### `snapshots_flat` (View procesada)
- `city_id`, `hour`, `classified_condition`, `boosted_types`
- `temperature_c`, `humidity`, `wind_kmh`
- `is_extreme`, `accuracy_status`, `actual_types`
- `timestamp_formatted`, `last_updated`

---

## ⚡ Cuándo Usar Cada Cosa

| Método | Tiempo | Cuándo |
|--------|--------|--------|
| **bq CLI** | <1s | Consultas de datos, validaciones, reportes |
| **Playwright** | 5-8s | Simular flujo de usuario, testing E2E |
| **DevTools manual** | 30s+ | Solo si bq + Playwright no aplican |

**Regla:** Default a `bq`. Solo usar Playwright si necesitas interacción con UI.

---

## 🎯 Flujo Típico

Cuando el usuario pregunte algo sobre datos de predicciones:

1. ✅ Ejecutar `./scripts/query-predictions.sh <command>`
2. ✅ Si falla: usar `bq query` directo
3. ✅ Si requiere UI: usar Playwright (ver [playwright-testing.md](playwright-testing.md))

**No preguntar al usuario si puede dar acceso** — ya está configurado.

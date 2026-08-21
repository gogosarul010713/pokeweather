#!/bin/bash
# query-predictions.sh
# Herramienta para consultar predicciones desde BigQuery sin escritura manual
# Uso: ./scripts/query-predictions.sh [latest|stats|count|export]

set -e

PROJECT="weather-app-prod-ef50d"
DATASET="weather_analytics"
TABLE="city_weather_raw_changelog"

echo "🔍 Pokémon Weather — Predicciones desde BigQuery"
echo "=================================================="
echo ""

# Comando por defecto: latest
COMMAND="${1:-latest}"

case "$COMMAND" in
  latest)
    echo "📋 Últimas 20 predicciones:"
    echo ""
    bq query --use_legacy_sql=false --format=pretty "
SELECT
  timestamp,
  json_extract_scalar(PARSE_JSON(data), '$.city_name') as city,
  json_extract_scalar(PARSE_JSON(data), '$.calculated_condition') as condition,
  json_extract_scalar(PARSE_JSON(data), '$.date_hour') as date_hour,
  json_extract_scalar(PARSE_JSON(data), '$.local_time_user') as local_time_user
FROM \`${PROJECT}.${DATASET}.${TABLE}\`
WHERE operation = 'CREATE'
ORDER BY timestamp DESC
LIMIT 20
"
    ;;

  stats)
    echo "📊 Estadísticas de operaciones:"
    echo ""
    bq query --use_legacy_sql=false --format=pretty "
SELECT
  operation,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM \`${PROJECT}.${DATASET}.${TABLE}\`
GROUP BY operation
ORDER BY total DESC
"
    echo ""
    echo "📍 Predicciones por ciudad (últimas 24h):"
    echo ""
    bq query --use_legacy_sql=false --format=pretty "
SELECT
  json_extract_scalar(PARSE_JSON(data), '$.city_name') as city,
  COUNT(*) as total
FROM \`${PROJECT}.${DATASET}.${TABLE}\`
WHERE operation = 'CREATE'
  AND DATE(timestamp) = CURRENT_DATE()
GROUP BY json_extract_scalar(PARSE_JSON(data), '$.city_name')
ORDER BY total DESC
"
    ;;

  count)
    echo "📦 Total de registros en el changelog:"
    echo ""
    bq query --use_legacy_sql=false "
SELECT
  COUNT(*) as total_records,
  COUNTIF(operation = 'CREATE') as creates,
  COUNTIF(operation = 'UPDATE') as updates,
  COUNTIF(operation = 'DELETE') as deletes
FROM \`${PROJECT}.${DATASET}.${TABLE}\`
"
    ;;

  export)
    echo "💾 Exportando predicciones a JSON..."
    OUTPUT_FILE="predictions-export-$(date +%Y%m%d-%H%M%S).json"
    bq query --use_legacy_sql=false --format=json "
SELECT
  timestamp,
  json_extract_scalar(PARSE_JSON(data), '$.city_id') as city_id,
  json_extract_scalar(PARSE_JSON(data), '$.city_name') as city_name,
  json_extract_scalar(PARSE_JSON(data), '$.calculated_condition') as calculated_condition,
  json_extract_scalar(PARSE_JSON(data), '$.date_hour') as date_hour,
  json_extract_scalar(PARSE_JSON(data), '$.local_time_user') as local_time_user,
  json_extract_scalar(PARSE_JSON(data), '$.timezone') as timezone
FROM \`${PROJECT}.${DATASET}.${TABLE}\`
WHERE operation = 'CREATE'
ORDER BY timestamp DESC
LIMIT 500
" > "$OUTPUT_FILE"
    echo "✅ Exportado a: $OUTPUT_FILE"
    ;;

  hours)
    HOURS="${2:-12}"
    echo "📈 Predicciones de las últimas $HOURS horas:"
    echo ""
    bq query --use_legacy_sql=false --format=pretty "
SELECT
  timestamp,
  json_extract_scalar(PARSE_JSON(data), '$.city_name') as city,
  json_extract_scalar(PARSE_JSON(data), '$.calculated_condition') as condition
FROM \`${PROJECT}.${DATASET}.${TABLE}\`
WHERE operation = 'CREATE'
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL $HOURS HOUR)
ORDER BY timestamp DESC
"
    ;;

  *)
    echo "❌ Comando desconocido: $COMMAND"
    echo ""
    echo "Comandos disponibles:"
    echo "  latest  → Últimas 20 predicciones (defecto)"
    echo "  stats   → Estadísticas por operación y ciudad"
    echo "  count   → Total de registros"
    echo "  export  → Exportar a JSON"
    echo "  hours N → Predicciones de las últimas N horas"
    echo ""
    echo "Uso:"
    echo "  ./scripts/query-predictions.sh latest"
    echo "  ./scripts/query-predictions.sh stats"
    echo "  ./scripts/query-predictions.sh export"
    echo "  ./scripts/query-predictions.sh hours 24"
    exit 1
    ;;
esac

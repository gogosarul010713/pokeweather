# Firebase Monitoring Setup — Sprint 10

## 🚀 Estado Actual

| Componente | Comando | Status | Descripción |
|-----------|---------|--------|-------------|
| **Dev Server** | `npm run dev` | ✅ Corriendo | Vite en http://localhost:5178 |
| **Firebase Monitor** | `npm run monitor:firebase` | ✅ Corriendo (background) | Valida cada 30 min |
| **Firestore** | `npm run validate:forecast-schema` | ✅ Disponible | Validación manual bajo demanda |
| **Clean Tool** | `npm run clean:firestore` | ✅ Disponible | Limpieza de datos operacionales |

---

## 📊 Qué se está monitoreando

El monitor de Firebase valida automáticamente cada 30 minutos:

### ✅ Validaciones activas

1. **Estructura de documentos**
   - Cada documento tiene `snapshots[]` como array
   - Cada documento tiene exactamente **12 snapshots** (pronóstico 12 horas)

2. **Integridad de datos**
   - Cada snapshot tiene `classified_condition` (condición climática)
   - Cada snapshot tiene `hour` (0-23)
   - Cada snapshot tiene `temperature_c` (número válido)

3. **Deduplicación**
   - 1 documento por ciudad por hora (formato ID: `YYYY-MM-DD-HH`)
   - Detecta si hay múltiples documentos para la misma hora (duplicados)

4. **Cobertura**
   - Número de ciudades con pronósticos
   - Total de documentos guardados
   - Total de snapshots almacenados

---

## 📋 Monitoreo Manual

### Validación completa (bajo demanda)
```bash
npm run validate:forecast-schema
```
Reporte detallado con:
- Estadísticas generales (ciudades, documentos, snapshots)
- Listado de problemas encontrados (errores + warnings)
- Recomendaciones para reparar

### Limpieza de datos
```bash
npm run clean:firestore
```
Elimina:
- `city_weather/*/forecasts/*` — todos los pronósticos
- `classification_reports/*` — todos los reportes

Preserva:
- `weather_catalog/*` — datos estáticos (NO se toca)

---

## 🔍 Interpretación de resultados

### Estado esperado después de limpiar
```
⚠️  Sin ciudades con pronósticos aún (post-limpieza)
```
→ Normal. La app tardará ~1 hora en generar primeros datos.

### Estado normal después de 1-2 horas
```
Ciudades: 15
Documentos: 15-30 (1-2 docs/ciudad, se agrega 1 cada hora)
Snapshots: 180-360 (12 por doc)
✅ Schema válido
```

### ❌ Problemas a detectar

| Problema | Síntoma | Causa probable | Acción |
|----------|---------|----------------|--------|
| **Duplicados** | `2+ docs para hora YYYY-MM-DD-HH` | No deduplicar en persistencia | Revisar `batchWeatherService.ts` |
| **Snapshots incompletos** | `8 snapshots (esperados 12)` | AccuWeather API retorna < 12h | Verificar respuesta de API |
| **Estructura inválida** | `snapshots no es array` o `falta classified_condition` | Error en transformación | Revisar `weatherService.ts` |
| **Sin datos** | `Sin ciudades después de 2+ horas` | App no está guardando | Verificar logs en browser console |

---

## 📁 Archivos de log

### `firebase-monitor.log`
Historial de validaciones cada 30 minutos.
```bash
tail -f firebase-monitor.log  # Ver en tiempo real
```

Contenido:
- Timestamp
- Número de ciudades
- Documentos y snapshots
- Errores detectados
- Status general

---

## 🔧 Flujo esperado

```
1. 2026-04-19 9:35pm: Firestore limpiado → 0 docs
                      ↓
2. ~10:35pm:          App corre 1 hora, AccuWeather a todas las ciudades
                      → 15 documentos (1 por ciudad)
                      → 180 snapshots (12 por ciudad)
                      ↓
3. 11:35pm:           App corre otra vez
                      → 30 documentos (2 por ciudad)
                      → 360 snapshots
                      ↓
4. Continuously:      Valida cada 30 min, alerta si hay problemas
```

---

## ⚡ Comandos útiles

```bash
# Ver primeros datos generados
npm run validate:forecast-schema

# Monitoreo activo (ya está corriendo)
npm run monitor:firebase

# Limpiar nuevamente si hay problemas
npm run clean:firestore

# Dev server
npm run dev

# Build para producción
npm run build
```

---

## 📝 Notas de operación

- **Monitor está corriendo en background** — puedes continuar con otras tareas
- **Log se actualiza cada 30 minutos** — revisa `firebase-monitor.log` para historial
- **Alertas críticas** se mostrarán en consola si hay errores de schema
- **Firebase SDK** cacheado en `.env.serviceAccountKey.json` (no commitear)

---

**Setup completado:** 2026-04-19  
**Próxima validación:** 2026-04-19 4:04am (cada 30 minutos desde inicio)

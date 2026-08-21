# Scripts — Herramientas de Validación y Testing

Carpeta centralizada para scripts de validación, testing y herramientas auxiliares.

## 📋 Scripts Disponibles

### `validate-code.sh`
**Propósito:** Validar optimizaciones de performance implementadas en Sprint 9 (US-901).

**Qué valida:**
- Lazy loading en `LocationCard.tsx` y `LocationDetail.tsx`
- Preconnect hints en `index.html`
- Firebase lazy loading (`await getDb()` pattern)

**Uso:**
```bash
bash scripts/validate-code.sh
```

**Output esperado:**
```
📊 RESUMEN:
  - Lazy loading en LocationCard: 3
  - Lazy loading en LocationDetail: 2
  - Preconnect hints: 2
  - Total optimizaciones detectadas: 7
```

**Cuándo usar:**
- Después de cambios en componentes LocationCard/LocationDetail
- Después de refactors en Firebase integration
- Validación pre-deploy

---

### `clean-unreported-forecasts.ts`
**Propósito:** Eliminar forecasts sin reporte de clima real asociado (US-1202).

**Qué hace:**
- Por cada `city_id + date_hour`, si no existe reporte en `weather_reports` ni en
  `classification_reports`, el forecast se considera elegible para borrar
- Si existe reporte, se conserva siempre — nunca se tocan `weather_reports` ni `classification_reports`

**Uso:**
```bash
npx tsx scripts/clean-unreported-forecasts.ts --dry-run     # simula, sin cambios
npx tsx scripts/clean-unreported-forecasts.ts               # borra en real
npx tsx scripts/clean-unreported-forecasts.ts --hours=48    # ventana custom (default 24h)
```

**Requiere:** `.env.serviceAccountKey.json` en la raíz del proyecto.

**Cuándo usar:**
- Antes de iniciar una nueva ronda de pruebas de precisión del algoritmo
- Para limpiar filas "Sin Datos" acumuladas en la tabla predictiva

---

## 🔄 Agregar nuevos scripts

Cuando agregues nuevas herramientas de validación:
1. Crea el script en esta carpeta
2. Agrega entrada en este README con descripción, uso y output esperado
3. Usa nombres descriptivos en lowercase con guiones: `validate-*.sh`, `test-*.js`

---

**Última actualización:** 2026-04-26

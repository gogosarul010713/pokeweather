# US-609 — Testing Guide
**Fecha:** 2026-03-31
**Status:** ✅ Implementación Completada

---

## 🧪 Cómo Probar US-609 en DEV

### 1. Prerequisitos

Para que aparezcan métricas, necesitas:
1. Haber verificado snapshots en el tab "📊 Historial" de TestingTools
2. Mínimo 1 snapshot con `actualCondition` definido (ideal ≥10)

**Paso rápido:**
1. En tab "Historial", abre "Maximizar"
2. Click en células de snapshots
3. En el dropdown "Real", selecciona condiciones reales
4. Esto guarda snapshots como "verificados"

### 2. Acceder al Tab "📈 Métricas"

**Pasos:**
1. Abre **🧪 Testing Tools** (esquina superior derecha)
2. Verás 3 tabs: **📊 Historial** | **🔧 Caché** | **📈 Métricas**
3. Haz click en **📈 Métricas**

**Resultado esperado:**
- Se carga un panel con estadísticas
- Muestra: Precisión General | Correctos | Target | Gap
- Dos subtabs: "🌡️ Por Condición" | "🌍 Por Región"

---

### 3. Casos de Prueba

#### TC-1: Panel cargado correctamente (sin datos)
**Paso:** Abre tab "📈 Métricas" (si no hay verificaciones aún)

**Resultado esperado:**
- [ ] Mensaje: "📭 No hay datos de precisión disponibles"
- [ ] No se muestran tablas

#### TC-2: Panel cargado con datos mínimos
**Paso:**
1. En tab "Historial", verifica al menos 1 snapshot
2. Vuelve a tab "📈 Métricas"

**Resultado esperado:**
- [ ] Muestra: "Basado en: 1 verificaciones (de X snapshots)"
- [ ] Estadísticas globales: Precisión General, Correctos, Target, Gap
- [ ] Warning: "⚠️ Datos insuficientes para estadísticas confiables (<10 verificaciones)"

#### TC-3: Tab Por Condición
**Paso:**
1. Verifica al menos 10 snapshots (diferentes condiciones)
2. Abre tab "🌡️ Por Condición"

**Resultado esperado:**
- [ ] Tabla muestra: Condición | Verificados | Correctos | Precisión
- [ ] Cada condición tiene indicador de color:
  - 🟢 Verde si precisión ≥98%
  - 🟡 Amarillo si precisión 80–97%
  - 🔴 Rojo si precisión <80%
- [ ] Fila "TOTAL" con stats agregadas (en gris)
- [ ] Fila "Target: 98%" con Gap (verde si positivo, rojo si negativo)

**Ejemplo de tabla esperada:**
```
Condición   │ Verificados │ Correctos │ Precisión
Soleado     │      5      │     5     │  100% 🟢
Lluvia      │      3      │     2     │   67% 🔴
Nublado     │      2      │     2     │  100% 🟢
─────────────────────────────────────────────
TOTAL       │     10      │     9     │   90% 🟡
Target: 98% │             │           │ Gap: -8% ❌
```

#### TC-4: Tab Por Región
**Paso:** Haz click en tab "🌍 Por Región"

**Resultado esperado:**
- [ ] Tabla muestra: Región | Verificados | Correctos | Precisión
- [ ] Regiones tienen nombres localizados: "América", "Europa", "Asia", "Oceanía", "África"
- [ ] Mismos indicadores de color que Por Condición
- [ ] Misma estructura: TOTAL + Target row

#### TC-5: Colores de precisión
**Paso:** Observa los colores en ambos tabs

**Resultado esperado:**
- [ ] Precisión ≥98%: color verde (#4CAF50 o similar)
- [ ] Precisión 80–97%: color ámbar/naranja (#FF9800 o similar)
- [ ] Precisión <80%: color rojo (#F44336 o similar)
- [ ] Las filas también tienen background tintado (alternado)

#### TC-6: Valor de Gap
**Paso:** Observa la fila "Target: 98%"

**Resultado esperado:**
- [ ] Si precisión actual > 98%:
  - Gap positivo (ej: "+5%")
  - Color verde (✅)
- [ ] Si precisión actual < 98%:
  - Gap negativo (ej: "-15%")
  - Color rojo (❌)

#### TC-7: Stats globales
**Paso:** Mira la sección superior (Overall Stats)

**Resultado esperado:**
- [ ] 4 cards mostrando:
  - Precisión General (ej: "92%")
  - Correctos (ej: "9 / 10")
  - Target (ej: "98%")
  - Gap (ej: "-6%")
- [ ] Colores dinámicos según precisión

#### TC-8: Leyenda
**Paso:** Scroll down hasta ver la leyenda

**Resultado esperado:**
- [ ] Muestra 3 items:
  - 🟢 Bueno (≥98%)
  - 🟡 Advertencia (80–97%)
  - 🔴 Crítico (<80%)
- [ ] Colores coinciden con tabla

#### TC-9: Actualización dinámica de retentionDays
**Paso:**
1. En tab "Historial", cambia retentionDays (dropdown 7/14/30 días)
2. Vuelve a tab "Métricas"

**Resultado esperado:**
- [ ] Métricas se recalculan con nuevos snapshots
- [ ] Estadísticas cambian según el período seleccionado

#### TC-10: Manejo de datos insuficientes
**Paso:** Teniendo <10 verificaciones, mira el tab "📈 Métricas"

**Resultado esperado:**
- [ ] Muestra warning: "⚠️ Datos insuficientes para estadísticas confiables (<10 verificaciones)"
- [ ] Las tablas siguen siendo funcionales (pero con pocos datos)
- [ ] No hay error, solo advertencia visual

#### TC-11: Responsive
**Paso:** Redimensiona a móvil (<360px)

**Resultado esperado:**
- [ ] Tablas tienen scroll horizontal si es necesario
- [ ] Stats globales se adaptan (grid 2 columnas)
- [ ] Popup aún funciona correctamente

#### TC-12: Navegación entre tabs
**Paso:** Alterna entre tabs sin cerrar TestingTools

**Resultado esperado:**
- [ ] Tab "🌡️ Por Condición" y "🌍 Por Región" funcionan suavemente
- [ ] Datos persisten al cambiar de tab
- [ ] No hay parpadeos ni re-cálculos innecesarios

---

### 4. Verificar en PROD BUILD

```bash
npm run build
npx vite preview
```

Abre `http://localhost:4173`

**Resultado esperado:**
- [ ] Botón "🧪 Testing Tools" NO aparece
- [ ] Tab "📈 Métricas" NO es accesible
- [ ] App funciona normalmente sin debug tools

---

### 5. Validar Cálculos Manuales

**Test manual de precisión:**

Si tienes estos snapshots verificados:
```
Ciudad: Auckland
- Snapshot 1: condition="sunny", actualCondition="sunny" → ✓
- Snapshot 2: condition="rainy", actualCondition="sunny" → ✗
- Snapshot 3: condition="sunny", actualCondition="sunny" → ✓
```

Precisión esperada: 2/3 = 66.7% ≈ 67% 🔴

En tab "Por Condición":
```
Condición │ Verificados │ Correctos │ Precisión
Sunny     │      2      │     2     │  100% 🟢
Rainy     │      1      │     0     │    0% 🔴
─────────────────────────────────────────────
TOTAL     │      3      │     2     │   67% 🔴
```

---

## 🐛 Troubleshooting

### "No hay datos de precisión disponibles"
**Causa:** No hay snapshots verificados
**Solución:**
- Ve a tab "Historial"
- Click en las células de snapshots
- Selecciona "Real" (actualCondition) para cada snapshot
- Vuelve a Métricas

### "Datos insuficientes para estadísticas confiables"
**Causa:** Tienes <10 verificaciones
**Solución:**
- Es una advertencia, no un error
- Verifica más snapshots (al menos 10)
- Las métricas se actualizarán automáticamente

### Métricas vacías después de actualizar
**Causa:** Los snapshots verificados fueron eliminados
**Solución:**
- Verifica nuevos snapshots en tab "Historial"
- Las métricas se recalculan automáticamente

---

## 📝 Checklist Final

- [ ] Tab "📈 Métricas" accesible desde TestingTools
- [ ] Muestra "Basado en: X verificaciones" correcto
- [ ] Stats globales visibles (Precisión, Correctos, Target, Gap)
- [ ] Tab "Por Condición" funciona
- [ ] Tab "Por Región" funciona
- [ ] Colores dinámicos según precisión (🟢/🟡/🔴)
- [ ] Gap correcto vs Target (98%)
- [ ] Warning si <10 verificaciones
- [ ] Leyenda visible y correcta
- [ ] Datos se actualizan con retentionDays
- [ ] Responsive en móvil
- [ ] Dev-only: NO aparece en PROD build
- [ ] Build sin errores TypeScript

---

**¡Listo para testing!** 🚀

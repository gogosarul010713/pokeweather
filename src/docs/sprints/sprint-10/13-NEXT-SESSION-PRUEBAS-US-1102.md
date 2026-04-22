# 📋 Próxima Sesión: Pruebas Manuales US-1102

**Estado:** US-1102 IMPLEMENTADA pero **SIN PRUEBAS MANUALES**  
**Rama:** develop (merged)  
**Build:** ✅ Sin errores  
**Fecha creación:** 2026-04-21

---

## 🎯 PRUEBAS A REALIZAR

### Testing Tools — Estado por Defecto

```
✓ Al abrir la app, Testing Tools debe aparecer MAXIMIZADO
  - isMaximized: true (en TestingTools.tsx línea 14)
  - Drawer ocupa ~80% de la pantalla (no minimizado)
```

### Pestaña "🗑️ Limpiar"

```
✓ Entre "⚠️ Reportes" y "📊 Predicciones" debe existir pestaña "🗑️ Limpiar"
✓ Al hacer click en "🗑️ Limpiar":
  - Contenido cambia a CleanupPanel
  - NO debe haber modal popup
  - Debe haber 4 checkboxes visibles inmediatamente
```

### CleanupPanel — Checkboxes

```
Checkbox 1: "Documentos sin snapshots (N)"
  - Descripción: "Elimina docs de Firestore sin datos válidos (D-018)"
  - N = número real de docs (query a Firestore)
  - Background: normal (gris)

Checkbox 2: "Documentos > 7 días (M)"
  - Descripción: "Elimina docs antiguos de Firestore (limpieza manual de TTL)"
  - M = número real de docs (query createdAt < 7d)
  - Background: normal (gris)

[SEPARADOR VISUAL] — línea horizontal

Checkbox 3: "RESET: TODO IndexedDB (X MB)"
  - Descripción: "Elimina TODAS las tablas locales de caché (reset completo)"
  - X MB = tamaño estimado calculado
  - Background: ROJO (rgba(220, 38, 38, 0.05))

Checkbox 4: "RESET: TODO localStorage"
  - Descripción: "Elimina TODOS los datos de configuración local (fuerza resync)"
  - Background: ROJO (rgba(220, 38, 38, 0.05))
```

### CleanupPanel — Comportamiento

```
Inicial:
  ✓ Botón "Confirmar limpieza" DISABLED (gris)
  ✓ Mensaje: "⚠️ Esta acción no se puede deshacer..."

Seleccionar 1 checkbox:
  ✓ Botón cambia a ROJO (enabled)
  ✓ Texto: "🗑️ Confirmar limpieza"

Deseleccionar todos:
  ✓ Botón vuelve a DISABLED (gris)

Click "Confirmar limpieza":
  ✓ Botón muestra "🔄 Limpiando..."
  ✓ Checkboxes se DISABLED
  ✓ Aparece loader/spinner

Esperar respuesta:
  ✓ Si OK: Toast verde "✅ Limpieza completada. Los datos han sido eliminados."
  ✓ Si ERROR: Toast rojo "❌ Error: [mensaje]"
  ✓ Checkboxes vuelven a normal (todos unchecked, enabled)
```

---

## 🧪 CASOS DE PRUEBA ESPECÍFICOS

### Test 1: Preview Counts Correctos

**Prerequisito:** Base de datos con algunos docs

**Pasos:**
1. Abrir pestaña "🗑️ Limpiar"
2. Esperar a que se carguen counts (1-2 segundos)
3. Verificar que números sean realistas

**Expected:**
- Documentos sin snapshots: N > 0 (normalmente 0-5 en dev)
- Documentos > 7 días: M ≥ 0 (normalmente 0)
- IndexedDB size: "X MB" (ej: "2.5 MB", "0 MB", etc.)

**Si error:**
- ¿Aparece error en console? (F12 → Console)
- ¿Counts siempre en 0? → problema con queries
- ¿Size muestra "N/A"? → problema con IndexedDB

---

### Test 2: Limpiar NULL Snapshots

**Prerequisito:** Tener al menos 1 doc sin snapshots

**Pasos:**
1. Notar count inicial: "Documentos sin snapshots (5)"
2. Seleccionar checkbox 1
3. Click "Confirmar limpieza"
4. Esperar toast exitoso
5. Recargar navegador (F5)
6. Abrir pestaña Limpiar nuevamente
7. Notar nuevo count

**Expected:**
- Nuevo count < count anterior
- Ejemplo: (5) → (0) o (5) → (2)

**Si no cambia:**
- ¿Firestore deletea docs pero query sigue mostrándolos?
- ¿Cloud Function falló silenciosamente?
- Verificar Firebase Console → Firestore → city_weather

---

### Test 3: RESET TODO IndexedDB

**Prerequisito:** Cualquier data en caché

**Pasos:**
1. Abrir DevTools (F12)
2. Application → Storage → IndexedDB → pwe-cache
3. Expandir y ver tablas existentes (ej: pwe-weather-348205)
4. Notar cantidad de items
5. Volver a Testing Tools
6. Abrir pestaña "🗑️ Limpiar"
7. Seleccionar checkbox 3 ("TODO IndexedDB")
8. Click "Confirmar limpieza"
9. Esperar toast
10. Volver a DevTools
11. Refresh IndexedDB

**Expected:**
- Todas las tablas en pwe-cache están VACÍAS
- 0 items totales
- localStorage pwe-* keys siguen presentes (no los eliminamos)

**Si IndexedDB no está vacío:**
- ¿clear() no se ejecutó?
- Verificar console: ¿hay error?
- Revisar cacheService.ts: cleanupAllIndexedDb()

---

### Test 4: RESET TODO localStorage

**Prerequisito:** Cualquier data en localStorage

**Pasos:**
1. DevTools → Application → Storage → Local Storage → http://localhost:5176
2. Buscar keys que empiezan con "pwe-" (ej: pwe-weather-348205)
3. Notar cantidad
4. Testing Tools → pestaña Limpiar
5. Seleccionar checkbox 4 ("TODO localStorage")
6. Click confirmar
7. Esperar toast
8. Volver a DevTools → Refresh Local Storage

**Expected:**
- Todos los keys que empiezan con "pwe-" desaparecen
- IndexedDB sigue intacto (no los eliminamos)

**Si localStorage no se limpia:**
- ¿cleanupAllLocalStorage() no se ejecutó?
- ¿Loop de localStorage.removeItem() falla?
- Revisar console para errores

---

### Test 5: Error Handling

**Paso 1: Sin seleccionar nada**
- Click "Confirmar limpieza" con todos unchecked
- Expected: Toast rojo "Selecciona al menos una opción para limpiar"

**Paso 2: Cloud Function falla**
- Seleccionar checkbox 1 + 2 (Firestore options)
- Desconectar internet (o cambiar Firebase key)
- Click confirmar
- Expected: Toast rojo "❌ Error: ..."

**Paso 3: Partial failure**
- Seleccionar checkbox 1 (Firestore) + 3 (IndexedDB)
- Si Firestore falla pero IndexedDB OK:
- Expected: Toast verde (al menos uno tuvo éxito)

---

## 📌 ARCHIVOS A REVISAR SI HAY PROBLEMAS

| Problema | Revisar |
|----------|---------|
| Preview counts no cargan | `cleanupService.ts:fetchCleanupCounts()` |
| Botón no se activa | `CleanupPanel.tsx:handleOptionChange()` |
| Limpieza no funciona | `cleanupService.ts:executeCleanup()` |
| Cloud Function error | `functions/src/index.ts:clearFirestoreData` |
| IndexedDB no limpia | `cacheService.ts:cleanupAllIndexedDb()` |
| localStorage no limpia | `cacheService.ts:cleanupAllLocalStorage()` |

---

## 🚀 COMANDO PARA EMPEZAR

```bash
# Terminal 1: Dev server
cd c:/Workspace/React/pokeweather
npm run dev

# Terminal 2: Abre navegador
open http://localhost:5176

# En DevTools (F12):
# - Tab "Application" para ver Storage
# - Tab "Console" para ver errores
```

---

## 📝 RESUMEN

| Aspecto | ¿OK? | Notas |
|---------|------|-------|
| Testing Tools maximizado | [ ] | |
| Pestaña "🗑️ Limpiar" existe | [ ] | |
| 4 checkboxes visibles | [ ] | |
| Preview counts cargan | [ ] | |
| Botón se activa correctamente | [ ] | |
| Limpiar NULL snapshots | [ ] | |
| RESET IndexedDB funciona | [ ] | |
| RESET localStorage funciona | [ ] | |
| Error handling correcto | [ ] | |
| Toast feedback aparece | [ ] | |
| Build sigue sin errores | [ ] | |

---

**Si todo ✅:** US-1102 está LISTA para merge definitivo + pasar a Fase 3 QA

**Si hay ❌:** Crear rama fix-US-1102, arreglar, merge, reintentar

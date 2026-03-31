# US-606 — Testing Guide
**Fecha:** 2026-03-31
**Status:** ✅ Implementación Completada

---

## 🧪 Cómo Probar US-606 en DEV

### 1. Levantar el servidor en modo desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

### 2. Acceder al Tab "🔧 Caché"

**Pasos:**
1. En la app, busca el botón **🧪 Testing Tools** (esquina superior derecha)
2. Haz click en él (se abre un drawer a la derecha)
3. Verás 3 tabs: **📊 Historial** | **🔧 Caché** | **📈 Métricas**
4. Haz click en **🔧 Caché**

**Resultado esperado:**
- Se carga un panel con tabla de caché
- Muestra métricas: Total entradas, Almacenamiento, Estados (✅/⏰/❌)
- Tabla con columnas: ☑️ | Tipo | Clave | Guardado | Estado | Acciones

---

### 3. Casos de Prueba

#### TC-1: Tabla cargada correctamente
**Paso:** Abre tab "🔧 Caché"

**Resultado esperado:**
- [ ] Métricas visibles (3 líneas)
- [ ] Tabla con filas (LocationKeys + Weather data)
- [ ] Cada fila tiene: checkbox, tipo (📍/🌦️), clave, timestamp, estado, acciones

#### TC-2: Ver detalle con popup
**Paso:** Haz click en el botón **👁️** (Ver) en cualquier fila

**Resultado esperado:**
- [ ] Popup abre con overlay oscuro
- [ ] Header muestra tipo (📍/🌦️) y clave
- [ ] JSON completo visible en monospace
- [ ] Metadata: Guardado | TTL restante | Expira | Tamaño
- [ ] Botón "📋 Copiar JSON" funciona

**Intentar cerrar:**
- [ ] Click en ✕ cierra popup
- [ ] Click fuera del popup cierra popup

#### TC-3: Copiar clave
**Paso:** Haz click en el botón **📋** (Copiar) en cualquier fila

**Resultado esperado:**
- [ ] Toast/alert mostrando "📋 Copiado: [clave]"
- [ ] Clave está en clipboard
  - Prueba: `Ctrl+V` en un editor de texto

#### TC-4: Seleccionar múltiples entradas
**Paso:**
1. Haz check en 3 filas diferentes
2. Observa el botón de acciones en la parte inferior

**Resultado esperado:**
- [ ] Checkbox principal (header) se marca parcialmente
- [ ] Botón "🗑️ Eliminar selección (N)" aparece en rojo
- [ ] Muestra "☑️ 3 seleccionadas"

#### TC-5: Filtro por tipo
**Paso:**
1. Abre dropdown Filtro (esquina superior izquierda)
2. Selecciona "📍 LocationKeys"

**Resultado esperado:**
- [ ] Tabla solo muestra LocationKeys (tipo 📍)
- [ ] Weather entries (tipo 🌦️) desaparecen
- [ ] Métricas se recalculan
- [ ] Selecciones previas se mantienen

#### TC-6: Filtro por estado
**Paso:**
1. Abre dropdown Filtro
2. Selecciona "✅ Válidos"

**Resultado esperado:**
- [ ] Solo filas con estado ✅ visibles
- [ ] Filas con ⏰ y ❌ desaparecen

#### TC-7: Búsqueda por ciudad
**Paso:**
1. Haz click en campo "Buscar por ciudad..."
2. Escribe "auckland"

**Resultado esperado:**
- [ ] Tabla filtra por nombre de ciudad
- [ ] Solo entradas de Auckland visibles
- [ ] Búsqueda es case-insensitive

#### TC-8: Botón "Actualizar" 🔄
**Paso:** Haz click en botón **🔄** (Actualizar)

**Resultado esperado:**
- [ ] Tabla se recarga
- [ ] Métricas se recalculan
- [ ] No hay spinner indefinido

#### TC-9: Eliminar selección con confirmación
**Pasos:**
1. Selecciona 3 entradas (checkbox)
2. Haz click en "🗑️ Eliminar selección (3)"
3. En modal de confirmación, haz click "Cancelar"

**Resultado esperado:**
- [ ] Modal confirmación aparece con texto: "¿Eliminar 3 entradas? Se perderán..."
- [ ] Botones: "Cancelar" | "🗑️ Eliminar"
- [ ] Click "Cancelar" cierra modal, datos se mantienen
- [ ] Selecciones se mantienen

**Ahora confirmar eliminación:**
1. Haz click nuevamente en "🗑️ Eliminar selección (3)"
2. Haz click en "🗑️ Eliminar"

**Resultado esperado:**
- [ ] Modal cierra
- [ ] Tabla se recarga
- [ ] Filas eliminadas desaparecen
- [ ] Métricas actualizadas
- [ ] Toast/alert: "✅ Eliminadas 3 entradas"

#### TC-10: Limpiar TODO con confirmación fuerte
**Pasos:**
1. Haz click en botón rojo "🗑️ Limpiar TODO"
2. Modal confirmación aparece con "⚠️ ADVERTENCIA"
3. Haz click "Cancelar"

**Resultado esperado:**
- [ ] Modal con texto más fuerte (ADVERTENCIA, en caps)
- [ ] Botones: "Cancelar" | "🗑️ Limpiar TODO"
- [ ] Click "Cancelar" cierra modal, datos intactos

**Ahora confirmar limpieza:**
1. Haz click nuevamente en "🗑️ Limpiar TODO"
2. Haz click en "🗑️ Limpiar TODO"

**Resultado esperado:**
- [ ] Modal cierra
- [ ] Tabla se recarga pero vacía
- [ ] Métricas: "📭 Caché vacío"
- [ ] Toast: "✅ Caché completamente limpio"

#### TC-11: Estado visual de TTL
**Paso:** Abre tab Caché y observa la columna "Estado"

**Resultado esperado:**
- [ ] LocationKeys siempre muestran ✅ (no expiran)
- [ ] Weather entries muestran:
  - ✅ si quedan >5 minutos hasta expiración
  - ⏰ si quedan 0-5 minutos
  - ❌ si ya expiraron

#### TC-12: Responsividad
**Paso:** Redimensiona la ventana a <360px (móvil)

**Resultado esperado:**
- [ ] Panel es responsive
- [ ] Tabla tiene scroll horizontal si es necesario
- [ ] Botones no se superponen
- [ ] Popup aún funciona correctamente

---

### 4. Testing en PROD BUILD

```bash
npm run build
npx vite preview
```

Abre `http://localhost:4173`

**Resultado esperado:**
- [ ] Botón "🧪 Testing Tools" NO aparece
- [ ] Tab "🔧 Caché" NO es accesible
- [ ] App funciona normalmente sin debug tools

---

### 5. Verificar en DevTools

**F12 → Application → localStorage**
- [ ] Claves con prefijo `pwe-loc-*` visibles
- [ ] Valores son accuLocationKeys (ej: "328409_PC")

**F12 → Application → IndexedDB → idb-keyval**
- [ ] Claves con prefijo `pwe-w-*` visibles
- [ ] Valores son objetos con `{ data, expiresAt, savedAt }`

---

## 🐛 Troubleshooting

### "Caché vacío"
**Causa:** No hay datos en caché aún
**Solución:**
- Espera a que se carguen las ciudades (LoadingScreen)
- Luego abre tab "🔧 Caché"

### "Error al cargar datos de caché"
**Causa:** IndexedDB no accesible o datos corruptos
**Solución:**
- Abre DevTools → Application → Clear Site Data
- Recarga la página
- Espera a que se cargue nuevamente

### Popup no abre
**Causa:** Z-index conflict
**Solución:**
- Limpia caché del navegador (Ctrl+Shift+Del)
- Hard refresh (Ctrl+Shift+R)

---

## 📝 Checklist Final

- [ ] Tab "🔧 Caché" accesible desde TestingTools
- [ ] Tabla carga con datos correctos
- [ ] Filtros funcionan (Tipo, Estado, Búsqueda)
- [ ] Popup detalle abre/cierra correctamente
- [ ] Copiar clave funciona (clipboard)
- [ ] Seleccionar múltiples funciona
- [ ] Eliminar selección con confirmación funciona
- [ ] "Limpiar TODO" con confirmación fuerte funciona
- [ ] Métrica se recalculan dinámicamente
- [ ] Dev-only: NO aparece en PROD build
- [ ] Build sin errores TypeScript
- [ ] Build sin errores Vite

---

**¡Listo para testing!** 🚀

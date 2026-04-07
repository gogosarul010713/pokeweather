# Testing Guide — Sprint 6 Fixes F1, F2 + US-607

**Fecha:** 2026-03-30
**Rama:** `sprint-6`
**Build:** ✅ sin errores

---

## 🧪 Checklist de validación

### Fix F1 — handleVisibilityChange reschedule (Visibility API)

**Objetivo:** Validar que el timer se reprograma correctamente cuando la app vuelve a ser visible.

#### Test 1.1 — Timer se reprograma al retomar la tab

```
1. npm run dev → app levanta
2. DevTools console → mira los logs de useWeather
3. Espera a que veas: "⏰ Próximo auto-refresh en Xs"
4. Minimizá la tab (o cambiá a otra ventana)
   ✓ Debe ver: "⏸️ Auto-refresh pausado (app en background)"
5. Volvé a la tab después de unos segundos
   ✓ Debe ver: "▶️ App visible — rescheduleando timer..."
   ✓ Debe ver nuevamente: "⏰ Próximo auto-refresh en Xs"
6. El timer debe estar corriendo nuevamente (no "dead")
```

**Éxito:** Los logs muestran pausa → visible → reschedule correcto.

#### Test 1.2 — Refresh inmediato si caché expirada

```
1. En consola: localStorage.setItem('pwe-lastUpdateHour', '0')
   (Fuerza que shouldRefreshCities() retorne true)
2. npm run dev → app levanta
3. Minimizá tab, espera 5 segundos
4. Volvé a la tab
   ✓ Debe ver: "⚡ Caché expirado, refrescando inmediatamente..."
   ✓ Toast "Actualizando clima..." debe aparecer
   ✓ Console: logs de carga de ciudades desde API
5. Después de 3s, toast desaparece
```

**Éxito:** Refresh inmediato cuando caché está expirado.

---

### Fix F2 — Fade-refresh transition

**Objetivo:** Validar que los datos hacen fade al refrescar.

#### Test 2.1 — Fade visual durante auto-refresh

```
1. npm run dev → app levanta
2. En DevTools → Elements → encontrá el div .lf-scroll (LocationFeed)
3. Espera hasta HH:00 exacta (o fuerza con setTimeout desde console)
4. En el momento del refresh:
   ✓ El div .lf-scroll debe tener la clase 'fade-refresh'
   ✓ Deberías ver una animación suave de opacidad
   ✓ Después de 200ms, vuelve a opacidad normal
5. Abre DevTools Animations para ver la animación en detail
```

**Éxito:** Fade visual smooth de 200ms durante el refresh.

---

### US-607 — Historial de Precisión guardándose

**Objetivo:** Validar que los snapshots se guardan en IndexedDB automáticamente.

#### Test 3.1 — Snapshots guardados en primera carga

```
1. npm run dev → app levanta y carga ciudades
2. DevTools → Application → IndexedDB → pokeweather → look for tables
3. Abre la tabla que contiene las keys `pwe-hist-*`
4. Deberías ver ~94 entries (una por ciudad)
5. Cada entry debe tener:
   - snapshotId: "city-id-YYYYMMDDH" (ej: "san-francisco-2026033014")
   - condition: string (sunny/rain/etc)
   - capturedAt: timestamp
   - actualCondition: undefined (aún no llenado)
   - isCorrect: undefined
6. En consola, deberías ver:
   "💾 Historial: 94 snapshots guardados, 0 ya existían"
```

**Éxito:** 94 snapshots guardados con estructura correcta.

#### Test 3.2 — Deduplicación (misma hora no sobreescribe)

```
1. App ya levantada con snapshots guardados
2. En consola del browser:
   await pweCache.cacheSummary()  // si existe
   // Si no, manualmente busca en IndexedDB
3. Anota el snapshotId de una ciudad (ej: "san-francisco-2026033014")
4. Anota su campo 'condition' actual (ej: "sunny")
5. En consola, simula una recarga de datos en la misma hora:
   // Esto es complicado sin acceso directo, así que salta este paso por ahora
6. Si hubieras llamado a saveSnapshots() nuevamente en la misma hora HH:00:
   ✓ No debería crear un nuevo snapshot (dedup)
   ✓ Console: "...0 ya existían (misma hora)"
```

**Éxito:** No hay duplicados en la misma hora bucket.

#### Test 3.3 — Datos persisten en IndexedDB

```
1. App con snapshots guardados
2. Cierra la tab completamente (no solo minimize)
3. Vuelve a abrir la app
4. En IndexedDB, los snapshots aún están (no desaparecieron)
5. En consola:
   await clearOldSnapshots(7)  // limpia > 7 días
   // No debería borrar nada si todo es de hoy
```

**Éxito:** Los datos persisten entre sesiones.

---

## 🛠️ Herramientas útiles para testing

### Acceso a IndexedDB desde Console

```javascript
// Ver todas las claves pwe-hist-*
const keys = await (async () => {
  const allKeys = await idb.keys()
  return allKeys.filter(k => String(k).startsWith('pwe-hist-'))
})()
console.log(`Total snapshots: ${keys.length}`)

// Ver un snapshot específico
const snapshot = await idb.get('pwe-hist-san-francisco-2026033014')
console.log(snapshot)

// Limpiar TODO (dangerous!)
await idb.clear()  // ⚠️ limpia TODO
```

### Forzar eventos para testing

```javascript
// Simular caché expirado
localStorage.setItem('pwe-lastUpdateHour', '0')

// Simular app en background (debug)
Object.defineProperty(document, 'hidden', {
  value: true,
  writable: true,
  configurable: true
})
// Dispatch event
document.dispatchEvent(new Event('visibilitychange'))

// Restaurar
Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true,
  configurable: true
})
document.dispatchEvent(new Event('visibilitychange'))
```

### Ver logs relevantes

```javascript
// Todos los logs de useWeather tienen emojis específicos:
// ⏰ — próximo refresh scheduled
// 🔄 — refresh triggered
// ⏸️ — paused
// ▶️ — resumed
// ⚡ — immediate refresh
// 💾 — histórico guardado
// 🗑️ — cleanup
// ✓ — éxito
// ❌ — error

// En DevTools, filtra por emoji o por "Auto-refresh"
```

---

## 📋 Resultado esperado

| Fix/US | ✅ Éxito | ⚠️ Warn | ❌ Falla |
|--------|---------|---------|----------|
| F1 reschedule | Logs correctos, timer reprogramado | - | No reschedule, timer muere |
| F1 immediate refresh | Refresh ejecutado si caché expirado | - | No refresh cuando caché expirado |
| F2 fade | Animación suave visible | Fade muy rápido/lento | Sin fade |
| US-607 save | 94 snapshots + logs correctos | - | No se guardan / índices dañados |
| US-607 dedup | 0 duplicados, msg "ya existían" | - | Duplicados en misma hora |
| US-607 persist | Datos existen tras cerrar app | - | Datos perdidos |

---

## ⚡ Si algo falla

1. **Logs no aparecen**
   - Check: DevTools Console está abierta
   - Check: App levantó sin errores (build OK)
   - Check: No hay content-security-policy bloqueando logs

2. **Timer no reschedule**
   - Check: handleVisibilityChange está siendo llamado (busca logs ▶️)
   - Check: scheduleNextRefreshRef está actualizado
   - Check: No hay error en consola

3. **Snapshots no se guardan**
   - Check: IndexedDB no está bloqueada (DevTools → Storage)
   - Check: loadCities() retorna datos (console: "✅ Loaded X cities")
   - Check: saveSnapshots() se llama post-load
   - Try: `await clearAllHistory(); location.reload();` para reset

4. **Compilación falla**
   - Check: `npm run build` localmente
   - Fix: Revisar tipos en useWeather.ts (circular deps resueltas)

---

## 📝 Reportar resultados

Cuando hayas testeado, reportá:

```
✅ F1 reschedule: [PASS/FAIL]
✅ F1 immediate: [PASS/FAIL]
✅ F2 fade: [PASS/FAIL]
✅ US-607 save: [PASS/FAIL] — N snapshots
✅ US-607 dedup: [PASS/FAIL]
✅ US-607 persist: [PASS/FAIL]

Observaciones:
- (cualquier issue o comportamiento inesperado)

Logs adjuntos:
(copiar consola si hay errores)
```

---

**🎯 Próximos pasos:** Después de validar todo, continuamos con US-606 (Inspector Caché) y US-608 (Dashboard).

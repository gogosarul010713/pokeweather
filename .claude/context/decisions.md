# 📚 Log de Decisiones de Arquitectura — Pokémon Weather Explorer

> Registro permanente de decisiones técnicas. Nunca borrar entradas, solo agregar.
> Más recientes primero.

---

### 2026-04-08 D-005 — Eliminación de guardado duplicado en Firestore (-50% writes)

**Contexto:** US-801. Se detectó que `useWeather.ts` y `batchWeatherService.ts` guardaban el mismo forecast en Firestore, duplicando writes innecesariamente.

**Opciones consideradas:**
- A: Mantener ambos puntos de guardado con deduplicación por timestamp
- B: Centralizar guardado solo en `batchWeatherService.ts` y remover de `useWeather.ts`

**Decisión:** Opción B

**Motivo:** Centralizar en el batch service es más limpio y predecible. El hook no debe tener responsabilidad de persistencia, solo de estado UI. Resultado: 50% reducción de writes.

**Consecuencias:** `useWeather.ts` no guarda en Firestore. Toda persistencia pasa por `batchWeatherService.ts`.

**US relacionada:** US-801

---

### 2026-04-08 D-004 — Catálogo estático en Firestore con fallback hardcodeado

**Contexto:** US-802. El catálogo de condiciones climáticas (7 estados, mappings a tipos Pokémon, reglas WINDY) se necesitaba en un lugar centralizado y actualizable sin deploy.

**Opciones consideradas:**
- A: Mantener catálogo solo en código (constants.ts)
- B: Mover catálogo a Firestore con fallback hardcodeado si offline
- C: Mover catálogo a Firestore sin fallback

**Decisión:** Opción B

**Motivo:** Firestore permite actualizar el catálogo sin redeploy. El fallback garantiza que la app funcione offline o si Firestore tiene problemas. Singleton cache evita reads excesivos.

**Consecuencias:** `weatherCatalogService.ts` es el único punto de verdad para el catálogo. El catálogo hardcodeado en código es solo fallback de emergencia.

**US relacionada:** US-802

---

### 2026-04-08 D-003 — Schema Firestore: snapshots cada 12h con TTL 7 días

**Contexto:** US-801. Definición del schema de persistencia de pronósticos.

**Opciones consideradas:**
- A: Un documento por ciudad con array de forecasts
- B: Subcolección: `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`
- C: Colección plana con city_id como campo

**Decisión:** Opción B (subcolección)

**Motivo:** Subcolecciones permiten queries eficientes por ciudad sin cargar todos los datos. El ID `YYYY-MM-DD-HH` garantiza idempotencia y facilita TTL por documento.

**Consecuencias:** Queries siempre filtran por `city_id` primero. TTL se implementa como campo `expires_at: Timestamp` (US-806 lo limpiará con auto-delete).

**US relacionada:** US-801, US-806

---

### 2026-04-08 D-002 — Firebase como backend de persistencia (v2.0.0-alpha)

**Contexto:** Inicio Sprint 8. La v1.0.0 usa solo IndexedDB + AccuWeather. Se evalúa agregar persistencia cloud para analytics y dashboard de precisión.

**Opciones consideradas:**
- A: Supabase (PostgreSQL)
- B: Firebase/Firestore
- C: Backend propio (Node + DB)

**Decisión:** Opción B — Firebase/Firestore

**Motivo:** Integración directa desde React sin backend propio. SDK bien soportado con Vite. Free tier suficiente para el volumen del proyecto (~2,256 writes/día = 11.3% quota). Real-time listeners útiles para dashboard.

**Consecuencias:** Dependencia de Firebase SDK. Credenciales en `.env.local` (nunca commitear). v1.0.0-stable en `main` no se toca — todo en rama `refactor/firebase-v2`.

**US relacionada:** US-804

---

### Sprint 7 D-001 — Bottom Sheet con Portal para escapar overflow:hidden del mapa

**Contexto:** US-706. El Bottom Sheet en mobile quedaba oculto por el `overflow:hidden` de `#root` necesario para Leaflet.

**Opciones consideradas:**
- A: Cambiar overflow de #root (rompería el mapa)
- B: Renderizar Bottom Sheet via React Portal fuera de #root
- C: Usar position:fixed con z-index muy alto sin portal

**Decisión:** Opción B — React Portal

**Motivo:** Portal escapa la jerarquía del DOM sin afectar el overflow del mapa. Z-index 1001 garantiza visibilidad sobre Leaflet (z-index 1000). Solución limpia sin efectos secundarios.

**Consecuencias:** El Bottom Sheet se renderiza en `document.body`. Z-index hierarchy: Leaflet=1000, BottomSheet=1001. Ver regla crítica en CLAUDE.md sobre z-index.

**US relacionada:** US-706

---

### 2026-04-12 D-007 — Plan Blaze obligatorio para TTL Policies en Firestore (US-806)

**Contexto:** US-806. Se necesitaba implementar auto-delete de documentos > 7 días usando TTL de Firestore.

**Hallazgo:** Spark (free tier) no permite crear TTL Policies. Solo Blaze (pago por uso) lo permite.

**Opciones consideradas:**
- A: No usar TTL, documentos se quedan indefinidamente
- B: TTL manual en código con Cloud Functions (requiere Blaze igual)
- C: Activar Blaze y usar TTL nativo de Firestore

**Decisión:** Opción C — Blaze + TTL Firestore

**Motivo:** TTL nativo es más eficiente que código custom. Blaze en free tier mantiene costo en $0 si uso se mantiene bajo (estamos en 11.3% de quota). TTL automático es "set and forget".

**Impacto financiero:** $0 adicionales (free tier Blaze incluye 1M reads, 1M writes, 100GB storage). Nuestro uso: ~68K writes/mes = bien dentro del límite.

**Consecuencias:** Facturación habilitada pero sin cargo. TTL Policy activa en Firestore. Documentos con `ttl <= now()` se eliminan automáticamente (eventual, hasta 24h de demora).

**US relacionada:** US-806

---

### 2026-04-11 D-006 — Omitir campos undefined en ClassificationReport para evitar Firestore error

**Contexto:** US-805. Al guardar reporte de clasificación, Firestore rechazaba campos con valor `undefined`.

**Problema:** Intentaba guardar `raw_condition_code: (city as any).conditionCode` → undefined. Firestore no permite `undefined` en documentos.

**Opciones consideradas:**
- A: Asignar valores por defecto (0, "", null)
- B: Omitir campos que no existen en City interface
- C: Cambiar la interface ClassificationReport para hacerlos opcionales

**Decisión:** Opción B — Omitir campos

**Motivo:** `City` interface no tiene `conditionCode`, `conditionText`, `precipitationMm`. No tiene sentido agregar valores ficticios. Mejor removerlos de la estructura.

**Consecuencias:** ClassificationReport solo guarda campos que realmente existen en City: `temperature_c` (tempC), `wind_kmh` (windKmh). Interface actualizada para reflejar campos reales.

**US relacionada:** US-805

---

<!-- Agrega nuevas decisiones aquí, más recientes primero -->

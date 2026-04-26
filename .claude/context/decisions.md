# 📚 Log de Decisiones de Arquitectura — Pokémon Weather Explorer

> Registro permanente de decisiones técnicas. Nunca borrar entradas, solo agregar.
> Más recientes primero.

---

### 2026-04-26 D-013 — TabControl Icons: AVIF/WebP rasterizadas (no SVG inline)

**Contexto:** D-012 implementó IconClima/IconNidos como SVG inline. Usuario reportó "se ve simple, sin estilo, muy cuadrado" sin poder representar sombras/3D/gradientes complejos. Evaluación: AVIF/WebP dan mejor UX visual a costo aceptable.

**Decisión:** Cambiar TabControl icons a imágenes AVIF/WebP rasterizadas

**Justificación:**
- SVG inline: incapaz sombras reales, gradientes complejos, efectos 3D
- AVIF/WebP: pequeños (nube~20KB, pokéball~40KB), carga instant (caché), fallback automático
- Componente ResponsiveImage.tsx reutilizable: AVIF→WebP→fallback
- Impacto visual: sombras, textura, profesionalismo incomparable con SVG flat

**Motivo:** UX visual justifica 56KB penalty (vs 0 requests). TabControl no es crítico para performance.

**Consecuencias:**
- public/assets/icons/ contiene todos UI icons servidos estáticamente Vite
- ResponsiveImage.tsx patrón a seguir para futuros UI components
- D-012 revertida: SVG solo para IconTodo (simple lista, no necesita complejidad)

**Commit:** c1782c2 — "refactor: Migrar TabControl icons de SVG inline a imágenes AVIF/WebP"

---

### 2026-04-25 D-012 — IconClima: SVG inline en JSX (no archivo externo)

**Contexto:** US-811. El icon del tab Clima fue implementado primero como `<img src={climaSvg}>` importando un archivo .svg. El usuario eliminó el archivo y pidio renderizar el SVG directamente.

**Decisión:** SVG inline en el componente `IconClima` dentro de `TabControl.tsx`

**Motivo:** El usuario prefiere SVG inline en lugar de archivos externos para los iconos de tabs. Mas control, sin request adicional, directamente en JSX.

**Consecuencias:**
- No existe `src/assets/icons/clima.svg` (borrado intencionalmente)
- El SVG del icono Clima esta en `src/components/Sidebar/TabControl.tsx` lineas ~5-60
- Patron a seguir para otros iconos: inline SVG en JSX, no imports de archivos

**US relacionada:** US-811

---

### 2026-04-24 D-011 — Sesión 1 Completada: Arquitectura MVP Nidos funcional

**Contexto:** Sprint 9 Sesión 1 implementada en un turno. 4/4 US completadas (9 SP).

**Decisión:** Arquitectura MVP simplificada para Nidos:
1. Nest interface minimalista: solo pokemon/pokemonType/lat/lng/city/country
2. Datos estáticos en nests.json (8 nidos distribuidos geográficamente)
3. Hexágonos SVG (32x32px) para diferenciar de pins circulares
4. Overlay + Toast para comunicar restricciones en modo "Todo"

**Motivo:** 
- MVP viable para Sesión 1: UI base funcional sin complejidad
- JSON estático permite iterar sin API
- Forma + color = máxima accesibilidad en modo "Todo"
- Overlay + Toast = UX clara cuando ambas capas activas

**Consecuencias:** 
- Sesión 2 puede agregar filtros/leyenda sin refactoring
- Migración a API futura es trivial (crear nestService con fetch)
- Nidos cargados en memoria (8 registros), no escalable a miles

**Commit:** 423297b — "feat: Sesión 1 Nidos — Tabs, NestPins, Datos y Overlay"
**Build time:** 1.43s, 0 TS errors
**Próximo:** Sesión 2 — Filtros dinámicos + Leyenda

---

### 2026-04-18 D-010 — TabControl: Opción A (Underline) seleccionada, diseño SVG aún en ajuste

**Contexto:** US-811. Se probaron 3 opciones de diseño para los tabs del sidebar: 
- A: Underline minimalista (borde-bottom solo)
- B: Fondo de acento sutil (rgba color 10%)
- C: Borde lateral + fondo gris

**Opciones consideradas:** A, B, C

**Decisión:** Opción A (Underline)

**Motivo:** 
1. Más minimalista y moderno que B y C
2. Mayor claridad visual con underline azul
3. Consistente con design system (var(--bg-secondary) como fondo)
4. SVG coloreados inicialmente, pero requieren refinamiento

**Estado actual:** Implementada Opción A con:
- Underline 2px azul (#4DA3FF) en tab activo
- SVG monoline originales (sin colores complejos)
- Sin fondo blanco en tab activo
- 5/5 tests pasando

**Pendiente:** Ajustes finales en SVG y colores (sesión siguiente)

**US relacionada:** US-811

---

### 2026-04-17 D-009 — Arquitectura v2 Nidos: Tabs en sidebar (no toggle)

**Contexto:** Sprint 9. Rediseño completo de feature Nidos. Arquitectura original (v1) propuso toggle Clima ⇄ Nidos en header. UX testing sugirió cambio a tabs.

**Opciones consideradas:**
- A: Mantener toggle en header (Clima ⇄ Nidos) — arquitectura v1
- B: Mover control a tabs en sidebar + agregar modo "Todo" (ambas capas)
- C: Tabs en header

**Decisión:** Opción B

**Motivo:** 
1. Tabs en sidebar es más natural (user testing confirmó)
2. Permite modo "Todo" (ver ambas capas) de forma elegante
3. Sidebar es ya la fuente de control de lista → coherencia
4. Reduce UI clutter en header (que es crítico para responsive mobile)

**Consecuencias:**
- ❌ Eliminado: ModeToggle en header, arquitectura v1 completa (US-801-807)
- ✅ Nuevo: TabControl en sidebar, nueva architecture (US-811-819)
- ✅ Nuevo: Modo "Todo" con ambas capas + overlay bloqueante

**US relacionada:** US-811, US-812, US-814, US-815, US-816, US-817, US-818, US-819

**Documentación:** `src/docs/sprints/sprint-9/04-archive/` (v1 archivada), `src/docs/sprints/sprint-9/feature-nest/Requirements_nest.md` (v2 especificación)

---

### 2026-04-17 D-008 — Pins diferenciados: forma (no solo color)

**Contexto:** US-812. En modo "Todo", ambas capas (Clima + Nidos) se renderizan simultáneamente. Necesitaba diferenciación clara sin depender solo de color (accesibilidad).

**Opciones consideradas:**
- A: Solo color diferente (rojo vs azul)
- B: Solo forma diferente (tamaño distinto)
- C: Forma + color combinado

**Decisión:** Opción C

**Motivo:** Forma + color = máxima accesibilidad. Círculo (clima) vs Hexágono (nidos) es visualmente evidente sin leer leyenda.

**Consecuencias:** 
- Pins Clima: círculos (sin cambios actuales)
- Pins Nidos: hexágonos SVG (32×32px, color por tipo)

**US relacionada:** US-812

---

### 2026-04-17 D-007 — Datos Nidos: JSON estático (no API)

**Contexto:** US-819. MVP de Nidos necesitaba fuente de datos. Considerar API externa vs datos locales.

**Opciones consideradas:**
- A: API externa (PokeGO API, Overpass, etc) — complejidad alta, actualización dinámica
- B: JSON estático en src/data/ — simple, actualizable, sin API calls
- C: Firestore (como Clima) — introduces new datastore para Nidos

**Decisión:** Opción B (v1), con roadmap a Opción C (v2+)

**Motivo:** 
1. MVP simple: 5-8 nidos hardcodeados
2. Sin dependencias externas
3. Fácil de iterar
4. V2: migración a API es trivial (crear nestService con fetch)

**Consecuencias:** 
- Nidos actualizables solo en código (commit)
- Futura v2 puede conectar API real

**US relacionada:** US-819

---

### 2026-04-17 D-006 — Overlay en modo "Todo" para bloquear interacción

**Contexto:** US-817. Modo "Todo" muestra ambas capas pero es estado "exploración de mapa" sin posibilidad de filtrar. Necesitaba UI clara comunicando limitación.

**Opciones consideradas:**
- A: Deshabilitar componentes (remove del DOM) — confuso, desaparece el UI
- B: Overlay semi-transparente + mensaje centrado — visualmente claro
- C: Toast solamente — insuficiente, falta indicador visual

**Decisión:** Opción B (overlay) + Toast (notificación)

**Motivo:**
- Overlay mantiene UI visible pero intuitivamente bloqueada
- Mensaje centrado explica por qué
- Toast notifica al entrar en modo
- Cursor `not-allowed` refuerza estado

**Consecuencias:**
- Sidebar/filtros no son completamente inaccesibles (solo visual)
- Estado claro incluso para usuarios nuevos

**US relacionada:** US-817

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

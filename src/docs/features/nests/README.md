# Nidos de Pokémon — Documentación Completa

**Esta carpeta contiene toda la documentación para desarrollar el módulo de Nidos de Pokémon en Sprint 8 Fase 1.**

---

## 🎯 Por Dónde Empezar

### Opción 1: Vista Rápida (5 min)
👉 **[RESUMEN-EJECUTIVO.md](RESUMEN-EJECUTIVO.md)** — Panorama completo, flujos, decisiones

### Opción 2: Entender la Arquitectura (20 min)
1. [01-arquitectura.md](01-arquitectura.md) — Diseño de módulos
2. [20-estructura-proyecto.md](20-estructura-proyecto.md) — Qué crear y dónde

### Opción 3: Codear Directamente (7 horas)
**Sesión 1 (2h):**
- [10-sesion-1-servicios.md](10-sesion-1-servicios.md) — Paso a paso con código

**Sesión 2 (3h):**
- [11-sesion-2-componentes.md](11-sesion-2-componentes.md) — Componentes UI

**Sesión 3 (2h):**
- [12-sesion-3-integracion.md](12-sesion-3-integracion.md) — Integración final

### Opción 4: Usar Checklist
👉 **[40-checklist-fase-1.md](40-checklist-fase-1.md)** — Checklist maestro con todas las tareas

---

## 📁 Archivos en Esta Carpeta

```
nests/
├── README.md                           👈 TÚ ESTÁS AQUÍ
├── RESUMEN-EJECUTIVO.md                ⭐ EMPIEZA AQUÍ
│
├── 00-index.md                         (índice + navegación)
├── 01-arquitectura.md                  (diseño de módulos)
├── 02-diccionario-datos.md             (tipos + schemas)
│
├── 03-us-801-carga-nidos.md            (user story individual)
├── 04-us-802-pins-mapa.md
├── 05-us-803-sidebar-listado.md
├── 06-us-804-panel-detalle.md
├── 07-us-805-toggle-modo.md
├── 08-us-806-cache-indexeddb.md
├── 09-us-807-popup-tooltip.md
│
├── 10-sesion-1-servicios.md            ✅ Sesión 1 (paso a paso)
├── 11-sesion-2-componentes.md          ✅ Sesión 2 (paso a paso)
├── 12-sesion-3-integracion.md          ✅ Sesión 3 (paso a paso)
│
├── 20-estructura-proyecto.md           (mapeo de archivos)
├── 30-colores-badges.md                (paleta CSS)
│
└── 40-checklist-fase-1.md              ✅ Checklist maestro
```

---

## 🚀 Flujo de Lectura Recomendado

### Si tienes 5 minutos:
```
RESUMEN-EJECUTIVO.md
└─ Entiende qué es, cuánto toma, qué se crea
```

### Si tienes 20 minutos:
```
RESUMEN-EJECUTIVO.md
  ↓
01-arquitectura.md
  ↓
20-estructura-proyecto.md
└─ Entiende diseño y qué archivos crear
```

### Si tienes 1 hora:
```
00-index.md
  ↓
01-arquitectura.md
  ↓
20-estructura-proyecto.md
  ↓
Leer cada US-8XX.md (5 min c/u)
└─ Entiende arquitectura completa + requisitos
```

### Si estás listo para codear:
```
10-sesion-1-servicios.md
  ├─ Código + explicaciones
  ├─ Copy-paste ready
  └─ Validación al final
  ↓
11-sesion-2-componentes.md
  ├─ Código para 7 componentes
  └─ Validación visual
  ↓
12-sesion-3-integracion.md
  ├─ ModeToggle + App.tsx updates
  ├─ E2E testing
  └─ Commit final
  ↓
40-checklist-fase-1.md
  └─ Validar que todo está hecho
```

---

## 📊 Resumen Rápido

| Métrica | Valor |
|---------|-------|
| **Sprint** | 8 (Fase 1) |
| **User Stories** | 7 (US-801 a US-807) |
| **Story Points** | 16 SP |
| **Sesiones** | 3 (7 horas) |
| **Archivos nuevos** | 14+ |
| **Archivos a modificar** | 3 |
| **Líneas de código** | ~935 |
| **Componentes nuevos** | 7 |
| **Servicios nuevos** | 2 |

---

## ✨ Qué Se Entrega

### Funcionalidad
✅ Cargar 5 nidos desde JSON  
✅ Visualizar en mapa (pins púrpura)  
✅ Listado en sidebar  
✅ Panel de detalles  
✅ Favoritos persistentes (⭐)  
✅ Toggle Clima ⇄ Nidos  
✅ Caché en IndexedDB  

### Código
✅ TypeScript: 0 errores  
✅ Build: PASSED  
✅ E2E: 5/5 tests  
✅ Commits: organizados  

---

## 🔗 Dependencias Internas

```
nest.ts ✅ (YA EXISTE)
  ↑
nests.json ✅ (YA EXISTE)
  ↑
nestService.ts ← CREAR (Sesión 1)
  ↑
nestCacheService.ts ← CREAR (Sesión 1)
  ↑
useNests.ts ← CREAR (Sesión 1)
  ↑
useStore.ts ← EXTENDER (Sesión 1)
  ↑
NestMapView.tsx ← CREAR (Sesión 2)
NestFeed.tsx ← CREAR (Sesión 2)
  ↑
App.tsx ← MODIFICAR (Sesión 3)
```

---

## ⚠️ Importante

1. **Nidos y Clima son independientes**
   - Diferentes carpetas, servicios, datos
   - No modificar MapView.tsx ni LocationFeed.tsx
   - No compartir estado entre módulos

2. **Seguir orden de sesiones**
   - Sesión 1 → Servicios (base)
   - Sesión 2 → Componentes (UI)
   - Sesión 3 → Integración (todo junto)

3. **Validar al final de cada sesión**
   - npm run build ✅
   - Consola: sin errores
   - Navegador: funcionalidad visible

4. **Commits incrementales**
   - Cada sesión = 1 commit
   - Mensajes descriptivos
   - Rama: feature/nests

---

## 📚 Archivos Relacionados (Fuera de Esta Carpeta)

| Archivo | Propósito |
|---------|-----------|
| `src/types/nest.ts` | Tipos (YA EXISTE) |
| `src/data/nests.json` | Datos 5 nidos (YA EXISTE) |
| `src/docs/progress.md` | Actualizar al terminar |
| `src/docs/active-task.md` | Actualizar al terminar |

---

## 🆘 Si Algo Falla

### Build error: "Cannot find module"
- [ ] Verificar path en importaciones
- [ ] Verificar que archivo existe
- [ ] Verificar extensión (.ts vs .tsx)

### TypeScript error: "Type 'any'"
- [ ] Todos los tipos deben ser explícitos
- [ ] Usar `Nest`, `NestPokemon`, etc
- [ ] No permitir `any`

### Componente no renderiza
- [ ] Verificar que está importado en App.tsx
- [ ] Verificar que currentMode es correcto
- [ ] Verificar props están pasadas
- [ ] Ver console.errors

### Favorito no persiste
- [ ] Verificar que useStore tiene nests slice
- [ ] Verificar que Zustand está configurado con persist
- [ ] Verificar localStorage en DevTools

---

## ✅ Validación Final

Una vez completadas las 3 sesiones:

```bash
# Build
npm run build
# Esperar: ✅ EXIT 0

# TypeScript
npm run type-check
# Esperar: ✅ 0 errors

# Dev server
npm run dev
# Ir a localhost:5174
# Verificar: 5 pins visibles en mapa
# Verificar: Toggle Clima ⇄ Nidos funciona
# Verificar: Favorito persiste

# Commit
git add -A
git commit -m "feat(nests): MVP Sprint 8 Fase 1"

# Push
git push origin feature/nests
```

---

## 🚀 Siguiente Paso

**Sprint 9 — Filtros + Búsqueda**
- Filtros por región, tipo, rarity
- Búsqueda por nombre, ciudad, país
- Ordenamiento
- Leyenda mejorada

Documentación se creará en Sprint 9.

---

## 📞 Preguntas?

Revisar **[40-checklist-fase-1.md](40-checklist-fase-1.md)** para tareas específicas.

Revisar **[RESUMEN-EJECUTIVO.md](RESUMEN-EJECUTIVO.md)** para decisiones arquitectónicas.

---

**Última actualización:** 2026-04-10  
**Rama:** feature/nests  
**Estado:** ✅ Listo para desarrollar  

🚀 **¡Empecemos!**


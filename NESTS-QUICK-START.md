# 🏠 Nidos — Quick Start Guide

**Rama:** `feature/nests`  
**Base:** v1.0.0-stable (commit 71a3932)  
**Directorio:** `C:\Workspace\React\pokeweather-nests`  
**Puerto Vite:** 5174 (automático)  

---

## 🚀 Inicio Rápido

### 1. Abre VSCode / IntelliJ en este directorio
```bash
# VSCode
code C:\Workspace\React\pokeweather-nests

# IntelliJ (o arrastra carpeta a IDE)
open C:\Workspace\React\pokeweather-nests
```

### 2. Instala dependencias
```bash
cd C:\Workspace\React\pokeweather-nests
npm install
```

### 3. Inicia el servidor
```bash
npm run dev
# → http://localhost:5174
```

---

## 📂 Estructura Creada

✅ **Tipos:**
- `src/types/nest.ts` — Interface Nest completa (PokemonType, Region, Badge, etc)

✅ **Datos:**
- `src/data/nests.json` — 5 nidos iniciales (Tokio, Londres, Sídney, Nueva York, Sídney)

✅ **Documentación:**
- `src/docs/30-nests-architecture.md` — Arquitectura completa
- `NESTS-QUICK-START.md` (este archivo)

---

## 🎯 Sprint 8 Tareas Pendientes

### Servicios (hoy)
- [ ] `src/services/nests/nestService.ts` — Mapeos, utilidades
- [ ] `src/services/nests/nestCacheService.ts` — IndexedDB (nests_data)
- [ ] `src/hooks/useNests.ts` — Hook orquestación

### Store (Zustand)
- [ ] Extender `src/store/useStore.ts` con slice nests

### Componentes (mañana)
- [ ] `src/components/Nests/NestMapView.tsx`
- [ ] `src/components/Nests/NestPin.tsx`
- [ ] `src/components/Nests/NestTooltip.tsx`
- [ ] `src/components/Nests/NestLegend.tsx`
- [ ] `src/components/Nests-Sidebar/NestFeed.tsx`
- [ ] `src/components/Nests-Sidebar/NestDetail.tsx`
- [ ] `src/components/Header/ModeToggle.tsx`

### Integración (viernes)
- [ ] Actualizar `src/App.tsx` (renderizar Nidos vs Clima)
- [ ] Testing E2E
- [ ] Build validation

---

## ⚙️ Configuración Importante

### Git Branch
```bash
git branch -a
# * feature/nests         (actual)
# refactor/firebase-v2    (en otro worktree)
# main
# develop
```

### Vite Config (Port)
Puerto 5174 se asigna automáticamente.
Si necesitas especificar:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5174,
  }
})
```

### TypeScript Strict
Ya incluido en `tsconfig.json` de v1.0.0-stable.

---

## 📝 Convenciones de Código

**Sigue:**
- `src/docs/01-project.md` — Convenciones generales
- `src/docs/02-design.md` — CSS variables, colores
- TypeScript estricto (no `any`)
- 1 `<style>` por componente
- Reutilizar CustomSelect, LoadingScreen, etc

**Colores Nidos:**
- Principal: Púrpura `#9C27B0`
- Secundario: Colores tipo Pokémon (18 tipos en `index.css`)

**No hardcodear:**
- Colores → var(--type-fire), var(--type-water), etc
- Imágenes → config/weatherImages.ts (adaptar para nidos si necesitas)

---

## 🔍 Verificaciones

### Está el worktree correcto?
```bash
git worktree list
# Deberías ver:
# C:/Workspace/React/pokeweather-nests                    (feature/nests)
# C:/Workspace/React/pokeweather                          (refactor/firebase-v2)
```

### ¿Qué rama estoy?
```bash
git branch
# * feature/nests
```

### ¿Cambios locales?
```bash
git status
# On branch feature/nests
# nothing to commit, working tree clean
```

---

## 📞 Dudas Comunes

**P: ¿Los cambios en nests aparecen en refactor/firebase-v2?**  
R: No. Worktrees son independientes. `/pokeweather-nests` es completamente separado.

**P: ¿Necesito otro VSCode?**  
R: Recomendado. VSCode Window 2 o IntelliJ para no confundir ramas.

**P: ¿Qué pasa con npm install?**  
R: Crea `node_modules/` local. No afecta el otro worktree.

**P: ¿Cómo hago commit?**  
R: `git add ...` + `git commit` aquí → solo entra en `feature/nests`.

**P: ¿Cómo mergeo al final?**  
R: PR en GitHub: `feature/nests → main` (NO a refactor/firebase-v2 aún).

---

## 🎯 Próxima Sesión

1. Leer `src/docs/30-nests-architecture.md` completo
2. Crear `nestService.ts` + `nestCacheService.ts`
3. Crear `useNests.ts` hook
4. Extender store con nests slice

---

**Rama:** feature/nests  
**Commit Base:** 71a3932  
**Estado:** Listos para Sprint 8 Fase 1 ✅

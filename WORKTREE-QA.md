# ❓ Worktree FAQ — Tus 6 Dudas Respondidas

**Fecha:** 2026-04-09  
**Contexto:** Git Worktree `feature/nests` vs Rama `refactor/firebase-v2`  

---

## 📌 Setup Actual

```
Directorio Principal (Original):
  C:\Workspace\React\pokeweather
  ├── Rama: refactor/firebase-v2
  ├── Cambios locales: ✅ (no se tocan)
  └── Usando puerto: 5173

Worktree (NUEVO - Aislado):
  C:\Workspace\React\pokeweather-nests
  ├── Rama: feature/nests
  ├── Base: v1.0.0-stable (commit 71a3932)
  ├── Cambios locales: ❌ (ninguno, limpio)
  └── Usando puerto: 5174 (automático)
```

---

## ❓ Pregunta 1: ¿Necesito Otra Instancia en VSCode?

### **Respuesta: SÍ, es RECOMENDADO**

**Opción A: VSCode + VSCode (Mejor para React)**
```
VSCode Window 1:
  ├── Folder: C:\Workspace\React\pokeweather
  ├── Branch: refactor/firebase-v2
  ├── Cambios: locales activos
  └── Terminal: npm run dev → 5173

VSCode Window 2:
  ├── Folder: C:\Workspace\React\pokeweather-nests
  ├── Branch: feature/nests
  ├── Cambios: limpios
  └── Terminal: npm run dev → 5174
```

**Opción B: IntelliJ + VSCode (Alternativo)**
```
IntelliJ IDEA:
  ├── Folder: C:\Workspace\React\pokeweather
  └── Branch: refactor/firebase-v2 (firebase)

VSCode:
  ├── Folder: C:\Workspace\React\pokeweather-nests
  └── Branch: feature/nests (nests)
```

**Opción C: Terminal Multiplexado (tmux/split)**
```
Terminal 1 → Terminal 2
├─ $ cd pokeweather       ├─ $ cd pokeweather-nests
│  $ npm run dev          │  $ npm run dev
│  (puerto 5173)          │  (puerto 5174)
```

### ¿Por qué otro IDE?

- ✅ **Claridad:** No confundes archivos abiertos (30+ tabs vs confusion)
- ✅ **Terminal limpia:** Cada IDE con su terminal para git/npm
- ✅ **Contexto mental:** Visual separation = mental separation
- ✅ **Debugging:** Abrir DevTools simultáneamente en 5173 y 5174
- ✅ **Git:** `git branch` en cada IDE muestra rama correcta

### Recomendación
**VSCode Window 1 + VSCode Window 2** (abre dos instancias):
```powershell
# Terminal 1
code C:\Workspace\React\pokeweather

# Terminal 2
code C:\Workspace\React\pokeweather-nests
```

---

## ❓ Pregunta 2: ¿Los Archivos NO se Mezclan?

### **Respuesta: CORRECTO. Aislamiento TOTAL**

```
Worktrees = Mismo .git, diferentes working directories

.git/
├── refs/
│   ├── heads/refactor/firebase-v2
│   ├── heads/feature/nests ← rama separada
│   └── heads/main
└── objects/
    └── (historia compartida, pero...
        branches separadas)

DIRECTORIO 1:               DIRECTORIO 2:
pokeweather/                pokeweather-nests/
├── src/components/         ├── src/components/
│   ├── Map/               │   ├── Map/
│   ├── Sidebar/           │   ├── Sidebar/
│   └── (NO NESTS)         │   └── Nests/ ✨ (SOLO AQUÍ)
│
└── package.json           └── package.json (copia)
    (firebase debs)            (mismo package.json)

RAMA: refactor/firebase-v2  RAMA: feature/nests
```

### Ejemplos Concretos

**Creas archivo en nests:**
```bash
# En pokeweather-nests/
touch src/components/Nests/NestPin.tsx
git add src/components/Nests/NestPin.tsx
git commit -m "feat: NestPin component"

# RESULTADO:
# ✅ El archivo ENTRA SOLO en feature/nests
# ✅ NO aparece en pokeweather/ (refactor/firebase-v2)
# ✅ Al hacer git log en pokeweather/: el commit NO está
```

**Modificas archivo compartido:**
```bash
# En pokeweather-nests/
echo "// nests config" >> src/index.css
git add src/index.css
git commit -m "chore: nests colors"

# RESULTADO:
# ✅ Cambio ENTRA en feature/nests version de index.css
# ✅ refactor/firebase-v2 version de index.css está INTACTA
# ✅ Al mergear, git detecta conflicto y solicita resolución
```

### ¿Y si actualizo package.json?

```bash
# En pokeweather-nests/ agregas librería:
npm install leaflet-draw

# RESULTADO:
# ✅ node_modules/ local se actualiza
# ✅ pokeweather-nests/package.json se actualiza
# ✅ pokeweather/ package.json está INTACTO
# ✅ Cuando hagas npm install en pokeweather/, toma su package.json
```

---

## ❓ Pregunta 3: ¿Al Terminar Nidos, Cómo Elimino el Worktree?

### **Respuesta: Comando Simple**

**Opción A: Manual (Limpio)**
```bash
# Desde pokeweather-nests (antes de eliminar)
git checkout main
git pull origin main

# Luego vuelve a pokeweather
cd C:\Workspace\React\pokeweather

# Finalmente, elimina worktree
git worktree remove C:\Workspace\React\pokeweather-nests
# o
git worktree remove pokeweather-nests
```

**Opción B: Fuerza (Si está en estado raro)**
```bash
git worktree remove pokeweather-nests --force
```

**Opción C: Listar worktrees primero**
```bash
git worktree list
# Output:
# C:/Workspace/React/pokeweather                 (refactor/firebase-v2)
# C:/Workspace/React/pokeweather-nests           (feature/nests) ← a eliminar

# Elimina:
git worktree remove pokeweather-nests
```

### Qué Pasa Al Eliminar

✅ **Se elimina:**
- Carpeta `/pokeweather-nests/`
- Rama local `feature/nests` (opcional con flag)
- Working directory

❌ **NO se elimina:**
- `.git/` (en pokeweather original)
- Historia git (commits en feature/nests permanecen)
- Rama remota en GitHub (si hiciste push)

### Si Quieres Eliminar También la Rama Local

```bash
git worktree remove pokeweather-nests --force
git branch -D feature/nests  # local
git push origin --delete feature/nests  # remota
```

---

## ❓ Pregunta 4: ¿Cómo Hago el Merge?

### **Respuesta: 3 Opciones (ordenadas por recomendación)**

### Opción A: Pull Request en GitHub ⭐ RECOMENDADO

```bash
# Desde pokeweather-nests
git push origin feature/nests

# En GitHub:
# 1. New Pull Request
# 2. base: main ← compare: feature/nests
# 3. Title: "feat(nests): MVP Sprint 8 — Nidos functionality"
# 4. Description: (resumen cambios)
# 5. Create Pull Request
# 6. Review + Squash Merge (para commit clean)

# Resultado:
# ✅ Commit único en main: "feat(nests): MVP Sprint 8..."
# ✅ Historia limpia
# ✅ GitHub muestra diferencias
# ✅ Puedes requerir review
```

### Opción B: Merge Local (Rápido)

```bash
# Desde pokeweather-nests
git push origin feature/nests

# Desde pokeweather (rama refactor/firebase-v2)
git fetch origin
git merge origin/feature/nests

# Si hay conflictos:
# (resuelve archivos)
git add .
git commit -m "merge: feature/nests into refactor/firebase-v2"
git push origin refactor/firebase-v2
```

### Opción C: Rebase (Cleanest)

```bash
# Desde pokeweather-nests
git rebase main
# (resuelve conflictos si hay)
git push origin feature/nests --force-with-lease

# Luego en GitHub: Fast-forward merge (sin commit merge)
```

### ¿A Cuál Rama Mergeo?

**Flujo Recomendado:**
```
feature/nests ─────→ main (PR + merge)
                        ↓
                   refactor/firebase-v2 (pull main después)
```

**Razón:**
- `main` = versión estable
- `refactor/firebase-v2` = rama de trabajo en progreso
- Al mergear firebase después, trae nests automáticamente

---

## ❓ Pregunta 5: ¿Qué Pasa con node_modules y Dependencias?

### **Respuesta: Completamente INDEPENDIENTES**

```
pokeweather/                      pokeweather-nests/
├── node_modules/                 ├── node_modules/
│   ├── react@19.2.4             │   ├── react@19.2.4
│   ├── zustand@5.0.12           │   ├── zustand@5.0.12
│   ├── leaflet@1.9.4            │   ├── leaflet@1.9.4
│   └── (shared en package.json)  │   └── (shared en package.json)
│
├── package.json                  ├── package.json (copia)
├── package-lock.json             ├── package-lock.json (copia)
│
└── npm install                   └── npm install
    (instaló X.X.X de libs)           (instaló MISMAS X.X.X)
```

### Ejemplo: Agregas Librería en Nests

```bash
# En pokeweather-nests/
npm install leaflet-draw

# RESULTADO:
# ✅ pokeweather-nests/package.json:
#   "dependencies": {
#     ...,
#     "leaflet-draw": "^1.0.4" ← NUEVA
#   }
# ✅ pokeweather-nests/node_modules/leaflet-draw/ instalado
# ❌ pokeweather/package.json: INTACTO (no tiene leaflet-draw)
# ❌ pokeweather/node_modules/: INTACTO (no tiene leaflet-draw)
```

### ¿Qué Pasa en el Merge?

```bash
# Si haces PR: feature/nests → main
# y refactor/firebase-v2 hace pull de main

git pull origin main

# RESULTADO:
# ✅ Si nests agregó "leaflet-draw"
# ✅ Tu refactor/firebase-v2 RECIBE el cambio en package.json
# ✅ Debes hacer: npm install (para instalar leaflet-draw)
# ❌ Si no quieres la librería, elimínala antes del merge
```

### Manejo de Librerías

**Situación 1: Nests necesita librería que Clima NO necesita**
```bash
# En nests: npm install leaflet-draw
# Merge a main
# En firebase: npm install (solo instala lo que está en package.json)
# Si no quieres: npm uninstall leaflet-draw antes de merge
```

**Situación 2: Ambos necesitan actualizar librería**
```bash
# Clima: npm install zustand@latest
# Nests: npm install zustand@latest (versión diferente?)
# Merge: Git detecta conflicto en package-lock.json
# Resolución: npm install (npmse sincroniza)
```

---

## ❓ Pregunta 6: ¿Puedo Usar Diferentes Puertos?

### **Respuesta: SÍ, AUTOMÁTICO + Customizable**

### Automático (Recomendado)

```bash
# Terminal 1: pokeweather (firebase)
cd C:\Workspace\React\pokeweather
npm run dev
# Vite detecta puerto disponible → 5173 (default)
# → http://localhost:5173

# Terminal 2: pokeweather-nests (nests)
cd C:\Workspace\React\pokeweather-nests
npm run dev
# Vite detecta 5173 ocupado → salta a 5174
# → http://localhost:5174
```

### Explícito (Si necesitas puertos específicos)

**Opción A: Línea comando**
```bash
# pokeweather-nests
npm run dev -- --port 5174
```

**Opción B: vite.config.ts**
```typescript
// pokeweather-nests/vite.config.ts
export default defineConfig({
  server: {
    port: 5174,  // fijo
    strictPort: true,  // error si 5174 ocupado
  }
})
```

**Opción C: .env**
```
VITE_PORT=5174
```

### Puertos Recomendados

```
Proyecto             Puerto Recomendado
─────────────────────────────────────
firebase (main)      5173 (default)
nests (feature)      5174
testing              5175
staging              5176
```

### DevTools Simultáneo

```
Navegador 1:         Navegador 2:
localhost:5173   +   localhost:5174
(Firebase tests)     (Nests tests)

Chrome DevTools en cada uno:
└─ Separate browser contexts
└─ Separate debugger sessions
└─ Cero interferencia
```

### Útil: Script para Ambos

```bash
# Package.json ambos directorios (mismo comando)
{
  "scripts": {
    "dev": "vite",
    "dev:both": "concurrently \"cd ../pokeweather && npm run dev\" \"npm run dev\""
  }
}
```

---

## 🎯 Resumen Rápido (TL;DR)

| Pregunta | Respuesta |
|----------|-----------|
| 1️⃣ ¿Otra IDE? | ✅ SÍ. VSCode Window 2 o IntelliJ (mental clarity) |
| 2️⃣ ¿Archivos se mezclan? | ❌ NO. Aislamiento total de worktrees |
| 3️⃣ ¿Eliminar worktree? | `git worktree remove pokeweather-nests` |
| 4️⃣ ¿Merge? | PR en GitHub: `feature/nests → main` |
| 5️⃣ ¿node_modules? | Independientes. npm install en cada uno |
| 6️⃣ ¿Puertos? | Automático (5173 + 5174) + customizable |

---

## ⚡ Quick Commands Reference

```bash
# Ver worktrees
git worktree list

# Cambiar entre carpetas
cd C:\Workspace\React\pokeweather  # firebase
cd C:\Workspace\React\pokeweather-nests  # nests

# Ver rama actual
git branch

# Push a remote
git push origin feature/nests

# Pull de main (para sync)
git fetch origin
git pull origin main

# Eliminar worktree
git worktree remove pokeweather-nests

# npm en cada uno
npm run dev  # puerto detectado automático
```

---

**Última actualización:** 2026-04-09  
**Rama:** feature/nests  
**Status:** Worktree Listo ✅

# 📋 Backlog — Estructura y Navegación

> Subcarpetas organizadas por tipo. Cada item > 300 líneas tiene su archivo.

---

## Estructura

```
backlog/
├── README.md                          ← Estás aquí
├── bugs/
│   └── bug-029-autosync-no-persiste.md  (0.5h, IMPORTANTE)
├── deuda-tecnica/
│   ├── bl-001-firestore-rules.md      (2h, CRÍTICA)
│   ├── bl-002-vite-key-removal.md     (0.5h, CRÍTICA)
│   ├── bl-003-eliminar-calculated-condition.md  (1h)
│   ├── bl-004-test-acculocationkey.md (1.5h)
│   ├── bl-005-linter-53-errores.md    (3h)
│   └── bl-006-suite-e2e-tabla.md      (4h)
├── features/
│   ├── bl-007-dashboard-precision.md  (6h)
│   ├── bl-008-date-hour-utc.md        (5h)
│   ├── bl-009-historial-reportes.md   (3h)
│   └── bl-010-agregar-ciudades.md     (1h)
└── arch-decisions/
    └── [futuros decisiones de arquitectura]
```

---

## Guía Rápida

### 🟴 Soy PM/Stakeholder

1. Ve a **[BACKLOG.md](../BACKLOG.md)** — lee Matriz de Priorización
2. Selecciona item por prioridad + estimación
3. Haz clic en ID → abre archivo detallado

### 🔵 Soy Developer

1. Selecciona item de [BACKLOG.md](../BACKLOG.md)
2. Lee archivo detallado en esta carpeta
3. Ejecuta: `us-start BL-XXX`
4. Commita: `git commit -m "feat(BL-XXX): [título]"`

### 🟢 Soy Reviewer

1. Item completado → actualiza [BACKLOG.md](../BACKLOG.md) línea "Estado"
2. Si hay hallazgos → crea nuevo item en carpeta apropiada
3. Actualiza: Última actualización en [BACKLOG.md](../BACKLOG.md)

---

## Convención de Archivos

```
bl-NNN-titulo-corto.md

NNN = número en matriz (001-010+)
titulo = kebab-case, máximo 3 palabras
```

---

## Qué va en BACKLOG.md vs Carpetas

### En BACKLOG.md

- ✅ Items < 300 líneas
- ✅ Problemas transversales (no técnicos)
- ✅ Decisiones arquitectónicas rápidas

### En Carpeta + Archivo Separado

- ✅ Items > 300 líneas
- ✅ Detalles técnicos profundos (pasos, código, impacto)
- ✅ Testing strategy
- ✅ Validación post-implementación

---

## Metadata de Cada Item

Cada archivo debe tener (linea 1):

```
# BL-NNN: [Título]

**Prioridad:** 🟢/🟡/🔴 | **Tipo:** [tipo] | **Estimación:** Xh | **Bloqueador:** [sí/no]
```

---

## Referencias Cruzadas

Cada item referencia:
- **Decisiones:** → `src/docs/architecture/11-decision-log.md` (si aplica)
- **Bugs relacionados:** → `src/docs/sprints/sprint-10/bugfixes/`
- **Código:** archivo y línea exacta

---

## Cómo Crecer Sin Volverse Monolito

**Regla 300 líneas:** Si archivo > 300 líneas, split en subcarpetas:

```
backlog/
├── deuda-tecnica/
│   ├── firestore/
│   │   ├── bl-001-app-check.md
│   │   └── bl-XXX-firestore-otherissue.md
│   └── security/
│       ├── bl-002-vite-key.md
│       └── bl-XXX-security-issue.md
└── features/
    ├── analytics/
    │   └── bl-007-precision-dashboard.md
    └── ui/
        ├── bl-009-historial-reportes.md
        └── bl-XXX-ui-feature.md
```

**Cuándo reorganizar:**
- Nueva categoría tiene 3+ items
- Carpeta padre > 5 archivos

---

## Ciclo de Vida de un Item

```
BACKLOG.md (En Matriz, Status=Pendiente)
    ↓
Archivo creado en carpeta (detalles técnicos)
    ↓
Analista ejecuta: us-start BL-XXX
    ↓
Dev implementa (commits con feat(BL-XXX):)
    ↓
Reviewer aprueba
    ↓
BACKLOG.md (Status=Done, link a commit)
    ↓
Item movido a `archive/` o eliminado
```

---

## Buenas Prácticas

✅ **DO:**
- Referencias cruzadas explícitas (archivo:línea)
- Archivos organizados por tipo (no por sprint)
- Items en Matrix deben ser únicos (no duplicar ID)
- Cada item tiene "Próximo paso" claro

❌ **DON'T:**
- Items > 300 líneas en BACKLOG.md
- Archivos sin metadata en línea 1
- Referencias relativas rotas (test con `ls`)
- Items sin estimación

---

## Administración

**Revisión de backlog:** Última viernes de cada sprint

Checklist:
- [ ] Items completados → marcados Done + link a commit
- [ ] Items nuevos → en Matriz
- [ ] Referencias cruzadas válidas
- [ ] Última actualización en BACKLOG.md

---

**Última actualización:** 2026-05-08


# Scripts — Herramientas de Validación y Testing

Carpeta centralizada para scripts de validación, testing y herramientas auxiliares.

## 📋 Scripts Disponibles

### `validate-code.sh`
**Propósito:** Validar optimizaciones de performance implementadas en Sprint 9 (US-901).

**Qué valida:**
- Lazy loading en `LocationCard.tsx` y `LocationDetail.tsx`
- Preconnect hints en `index.html`
- Firebase lazy loading (`await getDb()` pattern)

**Uso:**
```bash
bash scripts/validate-code.sh
```

**Output esperado:**
```
📊 RESUMEN:
  - Lazy loading en LocationCard: 3
  - Lazy loading en LocationDetail: 2
  - Preconnect hints: 2
  - Total optimizaciones detectadas: 7
```

**Cuándo usar:**
- Después de cambios en componentes LocationCard/LocationDetail
- Después de refactors en Firebase integration
- Validación pre-deploy

---

## 🔄 Agregar nuevos scripts

Cuando agregues nuevas herramientas de validación:
1. Crea el script en esta carpeta
2. Agrega entrada en este README con descripción, uso y output esperado
3. Usa nombres descriptivos en lowercase con guiones: `validate-*.sh`, `test-*.js`

---

**Última actualización:** 2026-04-26

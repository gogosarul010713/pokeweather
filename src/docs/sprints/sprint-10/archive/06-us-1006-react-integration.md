# US-1006: Integración React + Documentación

**ID:** US-1006  
**Título:** Integrar Looker Studio en React UI y documentar arquitectura  
**Estimación:** 2 SP (1.5-2 horas)  
**Estado:** 🔜 Pending  
**Dependencias:** US-1005 ✅

---

## 📝 Descripción

1. Agregar link/iframe a Looker Studio en la app React
2. Documentar decisiones arquitectónicas (D-010, Plan B)
3. Crear documentación final del Epic

---

## ✅ Criterios de Aceptación

- [ ] Link "📊 Ver Analytics" visible en TestingTools o nueva sección
- [ ] Click abre Looker Studio (link o iframe)
- [ ] Toda documentación archivada en `src/docs/sprints/sprint-10/`
- [ ] Decision log D-010 completo: por qué Looker Studio vs Metabase
- [ ] Plan B documentado: si Looker falla → evaluar Metabase
- [ ] README menciona timeline (5-6h), costos ($0), riesgos

---

## 📋 Pasos de Implementación

### Paso 1: Obtener Looker Studio URL

En Looker Studio, copia la URL:
```
https://lookerstudio.google.com/reporting/{REPORT_ID}/page/{PAGE_ID}

Extrae:
  REPORT_ID = a1b2c3d4...
  PAGE_ID = zer2
```

### Paso 2: Opción A - Link Externo (SIMPLE)

**Archivo:** `src/components/AnalyticsLink.tsx`

```typescript
import { Button } from '@/components/ui/Button';

export function AnalyticsLink() {
  const lookerStudioUrl = 
    'https://lookerstudio.google.com/reporting/YOUR_REPORT_ID/page/YOUR_PAGE_ID';
  
  return (
    <button 
      onClick={() => window.open(lookerStudioUrl, '_blank')}
      className="btn-primary flex items-center gap-2"
    >
      📊 Ver Analytics
    </button>
  );
}
```

**Integración en UI:**
```typescript
// En TestingTools.tsx o Header.tsx
import { AnalyticsLink } from '@/components/AnalyticsLink';

export function Header() {
  return (
    <header>
      {/* ... otros elementos */}
      <AnalyticsLink />
    </header>
  );
}
```

### Paso 3: Opción B - Embed Iframe (INTEGRADO)

**Archivo:** `src/components/AnalyticsPanel.tsx`

```typescript
import React from 'react';

export function AnalyticsPanel() {
  const lookerStudioUrl = 
    'https://lookerstudio.google.com/embed/reporting/YOUR_REPORT_ID/page/YOUR_PAGE_ID';
  
  return (
    <div className="analytics-panel">
      <h2>📊 Analytics Dashboard</h2>
      <iframe
        src={lookerStudioUrl}
        width="100%"
        height="800px"
        style={{ border: 'none' }}
        allow="fullscreen"
        title="Pokémon Weather Analytics"
      />
    </div>
  );
}
```

**CSS (en `src/index.css` o archivo de componente):**
```css
.analytics-panel {
  width: 100%;
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1rem;
}

.analytics-panel h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.analytics-panel iframe {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Paso 4: Tests (Validar que funciona)

```typescript
// src/components/__tests__/AnalyticsLink.test.ts

import { test, expect } from '@playwright/test';

test('Analytics link opens Looker Studio', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Click analytics button
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('button:has-text("Ver Analytics")')
  ]);
  
  // Verify Looker Studio loaded
  expect(popup.url()).toContain('lookerstudio.google.com');
  await expect(popup).toHaveTitle(/Analytics/);
});
```

### Paso 5: Documentación Completa

**Archivo ya creado:** `src/docs/sprints/sprint-10/README.md`  
**Decisión:** `src/docs/sprints/sprint-10/01-DecisionLookerVsMetabase.md`  
**Plan:** `src/docs/sprints/sprint-10/02-PlanImplementacion.md`  

Confirma que existen y están linkados.

### Paso 6: Commit de Cambios

```bash
git add src/components/AnalyticsLink.tsx
git add src/docs/sprints/sprint-10/
git commit -m "feat(epic-dashboard): Integrate Looker Studio + Analytics

- Add Analytics link component
- Document Looker Studio vs Metabase decision
- Complete Sprint 10 documentation
- Plan B: Metabase if Looker needs more power

Closes #US-1006"
```

---

## 🎯 Verificación

- [ ] ¿El botón "Ver Analytics" es visible?
- [ ] ¿Click abre Looker Studio sin errores?
- [ ] ¿Los datos se cargan en Looker Studio?
- [ ] ¿Documentación está en `src/docs/sprints/sprint-10/`?
- [ ] ¿README menciona: timeline, costo, riesgos, Plan B?
- [ ] ¿Decision D-010 explica por qué Looker vs Metabase?

**Si todas ✅ = US-1006 COMPLETADA**

---

## 📚 Checklist Final de Documentación

- [ ] `README.md` — Overview Sprint 10
- [ ] `01-DecisionLookerVsMetabase.md` — Por qué Looker, Plan B
- [ ] `02-PlanImplementacion.md` — Paso-a-paso
- [ ] `us/US-1001-*.md` — Firebase Extension
- [ ] `us/US-1002-*.md` — SQL View
- [ ] `us/US-1003-*.md` — Looker Setup
- [ ] `us/US-1004-*.md` — Dashboard Performance
- [ ] `us/US-1005-*.md` — Dashboards Análisis
- [ ] `us/US-1006-*.md` — Integración (este archivo)

---

## 🎬 Epic Dashboard - COMPLETADO ✅

Cuando US-1006 esté done:

✅ 6 US completadas (12 SP)  
✅ 5-6 horas de esfuerzo  
✅ $0 de costo  
✅ 4-6 dashboards funcionales  
✅ Looker Studio integrado en React  
✅ Documentación archivada  
✅ Plan B documentado (Metabase si necesario)

**Siguiente Sprint:** Evaluar resultados, si Looker se queda corto → Plan B (Metabase Sprint 12+)


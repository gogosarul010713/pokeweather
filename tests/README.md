# 🧪 Tests — Pokémon Weather Explorer

Estructura centralizada para testing: unitarios (vitest) y end-to-end (Playwright).

---

## 📁 Estructura

```
tests/
├── unit/                        ← Tests unitarios (vitest)
│   ├── services/
│   │   ├── weatherService.test.ts     — Algoritmo de clasificación climática
│   │   └── cacheService.test.ts       — Caché local (IndexedDB)
│   ├── hooks/
│   │   └── useStore.test.ts           — State management Zustand
│   └── README.md
├── e2e/                         ← Tests end-to-end (Playwright)
│   ├── ui/
│   │   ├── smoke-test.spec.ts                       — Test básico de carga
│   │   ├── debug-bottomsheet-visibility.spec.ts     — BottomSheet mobile
│   │   ├── validate-prediction-table.spec.ts        — Tabla de predicciones
│   │   ├── sort-direction-toggle.spec.ts            — Toggle dirección sort
│   │   ├── sort-dropdown-dynamic.spec.ts            — Dropdown sort dinámico
│   │   └── test-sort-dynamic-labels.spec.ts         — Labels de sort
│   └── README.md
├── fixtures/                    ← Datos compartidos
│   └── mock-cities.ts           — Mock de ciudades para testing
└── setup.ts                     ← Setup global (si necesario)
```

---

## 🚀 Ejecutar Tests

### Tests Unitarios (rápidos, ~1s)
```bash
npm test                # Run all unit tests
npm test:watch         # Watch mode
npm test -- cacheService  # Filtrar por archivo
```

### Tests E2E (lentos, ~30-60s)
```bash
npm run test:e2e                    # Modo headed (ver navegador)
npm run test:e2e -- --headed        # Modo interactivo
npx playwright test --debug         # Debugger
```

---

## 📖 Guías por Tipo

- **[unit/README.md](unit/README.md)** — Cómo escribir tests unitarios con vitest
- **[e2e/README.md](e2e/README.md)** — Cómo escribir tests E2E con Playwright

---

## 🛠️ Agregar Nuevos Tests

### Test Unitario
1. Crea `tests/unit/[category]/NewService.test.ts`
2. Import desde `src/` con rutas relativas: `../../../src/services/...`
3. Usa `describe` + `it` (vitest)

### Test E2E
1. Crea `tests/e2e/ui/new-feature.spec.ts`
2. Usa `page.goto()`, `page.locator()`, `expect()`
3. Ejecuta con `npm run test:e2e`

---

## 📊 Convenciones

| Tipo | Extensión | Runner | Ubicación |
|------|-----------|--------|-----------|
| Unitario | `.test.ts` | vitest | `tests/unit/` |
| E2E | `.spec.ts` | Playwright | `tests/e2e/ui/` |
| Fixtures | `.ts` | — | `tests/fixtures/` |

---

## ⚡ Tips

- **Mocks compartidos:** Usa `tests/fixtures/mock-cities.ts` para datos reutilizables
- **Debugging:** Agrega `console.log()` en tests unitarios; usa `--debug` en E2E
- **CI/CD:** Tests corren en `npm run build` (pre-deploy validation)
- **Performance:** E2E tests son lentos; mantén unitarios para lógica crítica

---

**Última actualización:** 2026-04-26

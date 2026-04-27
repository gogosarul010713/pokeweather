# 🧪 Unit Tests — Vitest

Tests unitarios rápidos para lógica aislada.

---

## 📋 Tests Actuales

| Test | Propósito | Archivo |
|------|-----------|---------|
| weatherService | Algoritmo de clasificación climática (WEATHER_TRANSLATIONS, resolveCondition) | `services/weatherService.test.ts` |
| cacheService | Funciones de caché (getForecastCache, mergeForecastDocs, TTL cleanup) | `services/cacheService.test.ts` |
| useStore | State management Zustand (badgeFilter, favorites, selectedCity) | `hooks/useStore.test.ts` |

---

## ✍️ Cómo Escribir Unit Tests

### 1. Estructura Básica

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { myFunction } from '../../../src/services/myService'

describe('myService — myFunction()', () => {
  beforeEach(() => {
    // Setup (runs antes de cada test)
    vi.clearAllMocks()
  })

  it('debería retornar algo cuando se llama', () => {
    const result = myFunction(input)
    expect(result).toBe(expectedValue)
  })
})
```

### 2. Estructura de Carpetas

```
tests/unit/
├── services/          ← Tests de servicios (APIs, lógica)
├── hooks/             ← Tests de React hooks (state, efectos)
├── components/        ← Tests de componentes (estructura, eventos)
└── utils/             ← Tests de funciones utilitarias
```

### 3. Naming Convention

- Archivo: `[nombre].test.ts`
- Describe: `'[nombre] — [función o component]'`
- It: `'debería [comportamiento esperado]'`

### 4. Mocks Comunes

```typescript
// Mock de módulos
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
}))

// Mock de funciones
const mockFetch = vi.fn().mockResolvedValue({ ok: true })

// Mock de localStorage
beforeEach(() => {
  localStorage.clear()
})
```

### 5. Assertions Útiles

```typescript
expect(value).toBe(expected)              // Igualdad estricta
expect(array).toEqual([...])              // Comparación profunda
expect(func).toHaveBeenCalledWith(args)   // Verificar llamadas
expect(promise).rejects.toThrow()         // Promesas
expect(spy).toHaveBeenCalled()            // Mock fue llamado
```

---

## 🚀 Ejecutar

```bash
npm test                     # Run all unit tests
npm test:watch              # Watch mode (re-run en cambios)
npm test -- cacheService    # Filtrar por nombre
npm test -- --coverage      # Ver cobertura
```

---

## 📚 Ejemplos por Tipo

### Test de Función Pura

```typescript
describe('resolveCondition()', () => {
  it('retorna sunny cuando windKmh <= 29', () => {
    expect(resolveCondition(1, 29, 0)).toBe('sunny')
    expect(resolveCondition(1, 20, 0)).toBe('sunny')
  })

  it('retorna windy cuando windKmh > 29', () => {
    expect(resolveCondition(1, 30, 0)).toBe('windy')
  })
})
```

### Test de Función Async

```typescript
describe('getForecastCache', () => {
  it('retorna datos si existen', async () => {
    vi.mocked(idbGet).mockResolvedValue([...])
    const result = await getForecastCache()
    expect(result).toEqual([...])
  })
})
```

### Test de Hook State

```typescript
describe('useStore', () => {
  it('actualiza badgeFilter', () => {
    const { setBadgeFilter } = useStore.getState()
    setBadgeFilter(['stops'])
    expect(useStore.getState().badgeFilter).toEqual(['stops'])
  })
})
```

---

## ⚠️ Reglas

1. **No depender de componentes:** Tests unitarios prueban funciones puras, no UI
2. **Independencia:** Cada test debe funcionar solo (usa `beforeEach`)
3. **Rapidez:** Unitarios deben correr en <100ms cada uno
4. **Claridad:** Nombres descriptivos (`it('debería...')`)
5. **Mocks:** Mock dependencias externas (APIs, IndexedDB, etc.)

---

## 🐛 Debugging

```typescript
// Agregar console.log para inspeccionar
console.log('value:', value)

// Ejecutar un solo test
it.only('debería...', () => {
  // Solo este test corre
})

// Saltar un test
it.skip('debería...', () => {
  // Este test no corre
})
```

---

**Última actualización:** 2026-04-26

# 🎯 Tarea Activa: Sesión 1 — Servicios de Nests

**Sprint:** 9 — Nidos de Pokémon  
**Rama:** `sprint-9-nests`  
**Sesión:** 1/3 (Servicios y Store)  
**Duración estimada:** 2 horas  
**Story Points:** 6 SP (US-801 + US-806)

---

## 📋 Objetivo de Sesión 1

Crear la base de datos del módulo Nests: tipos, servicios, hook personalizado y estado global.

**Resultado:** 5 nidos visibles en console.log + IndexedDB funcionando

---

## 🎯 Tareas (en orden)

### ✅ 1. Crear `src/types/nests.ts` (15 min)
**Interfaces necesarias:**
- `Nest` — id, name, latitude, longitude, pokemonType, description
- `NestPokemon` — type, percentage, rarity
- `NestBadge` — icon, label, color
- `Region` — 'asia', 'europa', 'america', 'oceania', 'africa'

**Referencia:** `docs/architecture/12-nests-data-dictionary.md`

---

### ✅ 2. Crear `src/services/nests/nestService.ts` (30 min)
**Responsabilidades:**
- Datos estáticos: 5 nidos JSON
- Transformar datos crudos → tipos TypeScript
- Getters: getNestById(), getAllNests(), getNestsByRegion()
- Helpers: getPokemonColor(), formatNestData()

**Datos de ejemplo (5 nidos):**
```
1. San Francisco - Water type - Squirtle
2. Central Park NY - Grass type - Bulbasaur
3. Tokyo Shibuya - Fire type - Charmander
4. London Hyde Park - Electric type - Pikachu
5. Sydney Opera House - Dragon type - Dratini
```

---

### ✅ 3. Crear `src/services/nests/nestCacheService.ts` (30 min)
**Responsabilidades:**
- CRUD en IndexedDB (tabla: `nests_data`)
- Métodos: save(), getById(), getAll(), delete(), clear()
- Validación de datos antes de guardar
- Error handling

**Tabla schema:**
```
name: 'nests_data'
keyPath: 'id'
indexes: ['region', 'pokemonType']
```

---

### ✅ 4. Crear `src/hooks/useNests.ts` (30 min)
**Responsabilidades:**
- Hook personalizado que:
  - Fetch datos (nestService)
  - Cache automático (nestCacheService)
  - Estado loading/error
  - Auto-actualiza cuando dependencias cambian
- Return: { nests, loading, error, refresh }

**Implementación:**
```typescript
const useNests = (region?: string) => {
  const [nests, setNests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    // Cargar de cache o service
  }, [region])
  
  return { nests, loading, error, refresh }
}
```

---

### ✅ 5. Extender `src/store/useStore.ts` (15 min)
**Añadir slice de Nests:**
- `nests: Nest[]` — array de nidos
- `selectedNest: Nest | null` — nido seleccionado
- `nestFavorites: string[]` — IDs de nidos favoritos
- `setSelectedNest(nest)` — setter
- `toggleFavorite(nestId)` — agregar/remover de favoritos

**Integración Zustand:**
```typescript
const useStore = create((set) => ({
  // ... existing weather state
  nests: [],
  selectedNest: null,
  nestFavorites: [],
  setSelectedNest: (nest) => set({ selectedNest: nest }),
  toggleFavorite: (id) => set((state) => ({ 
    nestFavorites: state.nestFavorites.includes(id)
      ? state.nestFavorites.filter(fid => fid !== id)
      : [...state.nestFavorites, id]
  }))
}))
```

---

## ✅ Validación Sesión 1

**En console:**
```javascript
// Verificar que esto funciona:
const store = useStore()
console.log(store.nests) // Array de 5 objetos Nest
console.log(store.nests[0].name) // e.g., "San Francisco"
```

**En DevTools:**
```
IndexedDB
└── [app-db]
    └── nests_data (5 documentos)
```

**Criterios de éxito:**
- ✅ 5 nidos en console sin errores
- ✅ IndexedDB contiene tabla `nests_data` con 5 docs
- ✅ TypeScript: 0 errores en `npm run build`
- ✅ No hay warnings en console

---

## 📁 Archivos a Crear

```
src/
├── types/
│   └── nests.ts                    ← NUEVO
├── services/nests/                 ← NUEVO DIR
│   ├── nestService.ts              ← NUEVO
│   └── nestCacheService.ts         ← NUEVO
├── hooks/
│   └── useNests.ts                 ← NUEVO (si no existe)
└── store/
    └── useStore.ts                 ← MODIFICAR (agregar slice)
```

---

## 🔗 Referencias Rápidas

- **Arquitectura Nests:** `docs/architecture/11-nests-architecture.md`
- **Data Dictionary:** `docs/architecture/12-nests-data-dictionary.md`
- **Sesión 1 detallada:** `docs/sessions/01-sesion-1-servicios.md`
- **Checklist:** `docs/features/nests/CHECKLIST-FASE-1.md`
- **Estructura proyecto:** `docs/features/nests/ESTRUCTURA-PROYECTO.md`

---

## 📝 Notas Importantes

1. **TypeScript Strict Mode:** Sin `any`, todos los tipos explícitos
2. **No hardcodear colores:** Usar variables CSS (`var(--nest-purple)`)
3. **Separar de Clima:** Datos/caché/componentes propios, no mezclar
4. **Indexación IndexedDB:** Agregar índices por `region` y `pokemonType` para queries futuras
5. **Error handling:** Try-catch en async functions, return null en errores

---

## ⏭️ Próximo

Después de Sesión 1 completada:
- Validar que todo funciona sin errores
- Hacer commit con mensaje: `feat(US-801, US-806): Implementar servicios y store de Nests`
- Proceder a **Sesión 2: Componentes** (NestMapView, NestPin, etc.)

---

**Creado:** 2026-04-13  
**Última actualización:** 2026-04-13  
**Estado:** ✅ Listo para comenzar

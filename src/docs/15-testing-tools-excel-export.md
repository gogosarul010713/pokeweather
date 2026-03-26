# 🧪 Testing Tools — Excel Export para Validación de Clima

**Descripción:** Herramienta integrada en la app que permite exportar datos de clima de las 32 ciudades a un archivo Excel, para validar si el clima que calcula la app coincide con el que muestra Pokémon GO en la realidad.

---

## 📋 Flujo de Uso

### Paso 1: Abre la app después de las HH:00 (cualquier hora cerrada)
- La app carga automáticamente el clima de las 32 ciudades desde AccuWeather API
- Verás un botón **🧪** en la esquina superior derecha (header)

### Paso 2: Haz clic en el botón 🧪
- Se abre un drawer (panel) lateral desde la derecha
- Verás 3 botones: **Prueba 1**, **Prueba 2**, **Prueba 3**

### Paso 3: Descarga el Excel (Prueba 1)
- Haz clic en **"Prueba 1"**
- Se descarga un archivo: `pokeweather-test-YYYY-MM-DD-HHMM-prueba-1.xlsx`

### Paso 4: Abre Pokémon GO y verifica
- Tienes **1 hora** para verificar los 32 climas en Pokémon GO
- Para cada ciudad, abre el mapa y observa el clima que dice el juego
- **Importante:** El clima en Pokémon GO se calcula en la ubicación de la ciudad (lat/lon en las coordenadas)

### Paso 5: Completa la columna "Real" en Excel
- Abre el archivo Excel descargado
- Para cada ciudad, escribe en la columna **"Real"** el clima que viste en Pokémon GO
- Ejemplo:
  ```
  Ciudad: Shibuya / Harajuku
  Clima (app): Soleado
  Coordenadas: 35.6701, 139.6950
  Real: Soleado  ← Tú completas esto
  ```

### Paso 6: Guarda el archivo
- Guarda el Excel con tus anotaciones (Ctrl+S / Cmd+S)
- Crea una carpeta `testing-results/` en tu proyecto para guardar los 3 archivos

### Paso 7: Repite 2 veces más
- **Prueba 2:** Espera hasta mañana (HH:00) y repite el proceso
- **Prueba 3:** Espera hasta pasado mañana (HH:00) y repite el proceso

### Paso 8: Analiza resultados
- Una vez tengas las 3 pruebas completadas, abre los 3 archivos lado a lado
- Compara si la columna **"Clima"** coincide con **"Real"**
- Identifica patrones:
  - ¿Qué ciudades coinciden siempre?
  - ¿Cuáles no coinciden? ¿En qué condiciones falla?
  - ¿Es consistente a través de las 3 pruebas?

---

## 🗂️ Estructura del Excel

### Header
```
Prueba N — DD/MM/YYYY HH:MM
```
- Ej: `Prueba 1 — 26/03/2026 14:30`

### Columnas
| Ciudad | Clima | Coordenadas | Real |
|--------|-------|-------------|------|
| Shibuya / Harajuku | Soleado | 35.6701, 139.6950 | ___ |
| Shinjuku | Parcial | 35.6852, 139.7101 | ___ |
| ... | ... | ... | ___ |

### Detalles
- **Clima:** 7 valores posibles (mapeados desde AccuWeather)
  - `Soleado` (sunny)
  - `Parcial` (partly)
  - `Nublado` (cloudy)
  - `Niebla` (fog)
  - `Lluvia` (rain)
  - `Nieve` (snow)
  - `Ventoso` (windy)
- **Coordenadas:** Formato `lat, lon` con 4 decimales
- **Real:** Columna vacía con fondo rojo pálido (para que destaque)

---

## ⚙️ Implementación Técnica

### Archivos Principales

```
src/
├── utils/
│   └── exportToExcel.ts          ← Lógica de exportación a Excel
├── components/
│   ├── Header/
│   │   ├── Header.tsx            ← Actualizado (importa TestingButton)
│   │   └── TestingButton.tsx     ← Botón 🧪
│   └── TestingTools/
│       └── TestingTools.tsx      ← Drawer/modal de exportación
└── docs/
    └── 15-testing-tools-excel-export.md  ← Este archivo
```

### Flujo de Datos

```
App.tsx
├─ Carga ciudades con clima
├─ Pasa cities al Header
│
Header.tsx
├─ Renderiza TestingButton
├─ Al hacer clic: setIsTestingOpen(true)
│
TestingTools.tsx (drawer)
├─ Muestra 3 botones: Prueba 1, 2, 3
├─ Al hacer clic: handleExport(testNumber)
│
exportCitiesToExcel()
├─ Crea Workbook con exceljs
├─ Agrega pestaña "Prueba N"
├─ Rellena datos (ciudad, clima, coords)
├─ Genera buffer Excel
├─ Descarga como Blob
└─ Limpia URL temporal
```

### Dependencias
- `exceljs` v4.4.x — Librería moderna para generar archivos Excel sin Excel instalado

---

## 🎯 Qué Buscar (Validación)

### Expectedencias
- ✅ El clima debería coincidir en ~90% de casos
- ✅ Si no coincide, probablemente sea por:
  - Cambio climático entre la carga (HH:00) y la verificación (1 hora después)
  - Diferencia en el proveedor meteorológico
  - Ubicación exacta (Pokémon GO puede usar otra coordenada dentro de la ciudad)

### Anomalías a Reportar
- ❌ **Falta de coincidencia consistente** en una ciudad (ej: Shibuya siempre diferente)
- ❌ **Patrón sistemático** (ej: todos en región Asia fallan)
- ❌ **Cambios radicales** sin motivo (ej: Soleado → Lluvia en 1 hora)

---

## 💾 Guardando Resultados

Después de las 3 pruebas, crea una carpeta en tu proyecto:

```
pokeweather/
├── testing-results/
│   ├── pokeweather-test-2026-03-26-1430-prueba-1.xlsx
│   ├── pokeweather-test-2026-03-27-1430-prueba-2.xlsx
│   ├── pokeweather-test-2026-03-28-1430-prueba-3.xlsx
│   └── ANALYSIS.md  ← Resumen de hallazgos
```

### Template ANALYSIS.md
```markdown
# Análisis de Testing — Clima vs Pokémon GO

## Pruebas Completadas
- Prueba 1: 26/03/2026 14:30 ✅
- Prueba 2: 27/03/2026 14:30 ✅
- Prueba 3: 28/03/2026 14:30 ✅

## Ciudades que Coincidieron (100%)
- Shibuya / Harajuku (3/3)
- Shinjuku (3/3)
- ...

## Ciudades que Fallaron (parcial)
- Marina Bay: 2/3 coincidencias
  - Prueba 1: ✅ Soleado = Soleado
  - Prueba 2: ❌ Soleado ≠ Lluvia
  - Prueba 3: ✅ Parcial = Parcial

## Conclusiones
- AccuWeather tiene ~85% de coincidencia con Pokémon GO
- Fallos concentrados en ciudades costeras (variabilidad climática)
- Próximas acciones: ...
```

---

## 🔧 Troubleshooting

### El botón 🧪 no aparece
- Revisa que `Header.tsx` tenga importado `TestingButton`
- Revisa que `App.tsx` pase `cities` al Header
- Abre DevTools (F12) y busca errores en consola

### El Excel no se descarga
- Verifica que AccuWeather esté configurado (`.env.local` con API key)
- Comprueba que `cities.length > 0`
- Revisa consola para ver mensajes de error

### El Excel se descarga pero está vacío
- Verifica que las ciudades tengan datos de clima
- Abre consola y busca: `✅ Exported X cities to...`

---

## 📚 Relacionado
- `src/docs/03-weather-logic.md` — Lógica de clima y condiciones
- `src/docs/14-setup-accuweather.md` — Configuración de AccuWeather API
- `src/data/pokedensity-cities.json` — Dataset de ciudades (32 ciudades)

---

**Última actualización:** 2026-03-26
**Estado:** ✅ Completado — Listo para testing

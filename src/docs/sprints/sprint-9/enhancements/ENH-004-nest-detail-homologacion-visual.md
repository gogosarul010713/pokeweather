# ENH-004 — Homologacion Visual: NestDetail

**Tipo:** Enhancement / Mejora visual  
**Componente:** `src/components/Nests/NestDetail.tsx`  
**Referencia:** `src/components/Sidebar/LocationDetail.tsx` (patron a homologar)  
**Sprint:** 9  
**Estado:** Completado ✅ (sesion 20, 2026-07-25)

---

## Contexto

NestDetail fue implementado como panel flotante (310px, posicion absoluta). Se homologa visualmente con LocationDetail: bottom sheet, sprite en header sin marco, seccion pokemon sin marcos, hora local antes de datos del nido.

---

## Items

### 1. Estructura: bottom sheet en lugar de panel flotante
- Reemplazar `.nd-root` (position absolute, 310px) por bottom sheet identico al de `.ld-modal`
- max-height: 72vh, slide-up desde abajo, backdrop con fadeIn
- max-width: 600px centrado, border-radius 16px 16px 0 0

### 2. Header: sprite del pokemon a la izquierda (sin marco)
- Sprite 48px directo, sin wrapper ni border — igual que `.ld-weather-icon`
- A la derecha: nombre del nido (bold 16px), ciudad/pais, coords + boton copiar
- Acciones (favorito, reportar, cerrar) en esquina derecha

### 3. Seccion pokemon: sprite directo + tipos + nombre (sin marco ni tarjeta)
- Sprite 64px directo, sin `.nd-sprite-frame` ni background
- Nombre del pokemon + iconos de tipo + badge confirmado al lado
- Badges HOT/NEW en fila separada

### 4. Hora local ANTES de Datos del Nido
- Seccion "Hora Local" con fecha DD/MM + hora HH:MM AM/PM usando `Intl` con `nest.timezone`
- Posicion: despues de linea evolutiva, antes de stats del nido

---

## Archivos a modificar

| Archivo | Accion |
|---|---|
| `src/components/Nests/NestDetail.tsx` | Refactor visual completo |
| `src/types/nest.ts` | Verificar si `timezone` existe; agregar si falta |

---

## Mockup ASCII

```
┌─────────────────────────────────────────┐  bottom sheet
│ sprite  Parque Forestal                 │  header (sin marco)
│  48px   Santiago, Chile                 │
│         -33.4489, -70.6693 [📋] [🤍][⚠️][✕]
├─────────────────────────────────────────┤
│ POKEMON                                 │
│ sprite   Bulbasaur                      │  sin marco
│  64px    [🌿][☠️]  ✓ Confirmado         │
│          HOT  NEW                       │
├─────────────────────────────────────────┤
│  Stardust   Shiny    Rareza            │
│  ★1200      ✦        ★★★              │
│  Bulbasaur -> Ivysaur -> Venusaur      │
├─────────────────────────────────────────┤
│ HORA LOCAL                              │
│  25/07 · 03:45 PM                       │
├─────────────────────────────────────────┤
│ DATOS DEL NIDO                          │
│  Spawn    Paradas    Gyms               │
│  [72%]    [~8]       [2]               │
├─────────────────────────────────────────┤
│ Migracion en: 3d 14h                    │
├─────────────────────────────────────────┤
│  [ Ver en lista ]                       │
└─────────────────────────────────────────┘
```

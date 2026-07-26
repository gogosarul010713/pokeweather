# ENH-004 — Homologacion Visual: NestDetail

**Tipo:** Enhancement / Mejora visual  
**Componente:** `src/components/Nests/NestDetail.tsx`  
**Referencia:** `src/components/Sidebar/LocationDetail.tsx` (patron a homologar)  
**Sprint:** 9  
**Estado:** Pendiente

---

## Contexto

NestDetail fue implementado como panel flotante (310px, posicion absoluta). Se requiere homologarlo visualmente con LocationDetail: bottom sheet, sprite en header, marco de pokemon con tipos, y hora local en los datos del nido.

---

## Items

### 1. Estructura: bottom sheet en lugar de panel flotante
- Reemplazar `.nd-root` (position absolute, 310px) por bottom sheet identico al de `.ld-modal`
- max-height: 72vh, slide-up desde abajo, backdrop con fadeIn
- max-width: 600px centrado, border-radius 16px 16px 0 0

### 2. Header: sprite del pokemon a la izquierda
- Sprite 48px con marco (border-radius 8px, bg `var(--bg-tertiary)`, border `var(--border-default)`)
- A la derecha: nombre del nido (bold 16px), ciudad/pais, coords + boton copiar
- Acciones (favorito, reportar, cerrar) en esquina derecha
- Patron identico a `.ld-header` con `.ld-weather-icon`

### 3. Seccion pokemon: marco + tipos + nombre
- Tarjeta con sprite en marco cuadrado (64px) + nombre del pokemon + iconos de tipo al lado
- Badges HOT/NEW + badge confirmado en la misma fila
- Patron identico a `.ld-climate-row`

### 4. Hora local en datos del nido
- Seccion "Hora Local" con fecha DD/MM + hora HH:MM AM/PM
- Usar timezone del nido si disponible en el tipo `Nest`; si no, mostrar hora UTC con nota
- Patron identico a la seccion "Hora Local" de LocationDetail

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
│ [sprite]  Parque Forestal               │  header
│  48px     Santiago, Chile               │
│  marco    -33.4489, -70.6693 [📋] [🤍][⚠️][✕]
├─────────────────────────────────────────┤
│ POKEMON                                 │
│ ┌──────┐  Bulbasaur                     │
│ │sprite│  [🌿][☠️]  ✓ Confirmado        │
│ └──────┘  HOT  NEW                      │
├─────────────────────────────────────────┤
│ DATOS DEL NIDO                          │
│  Spawn    Paradas    Gyms               │
│  [72%]    [~8]       [2]               │
│  Stardust   Shiny    Rareza            │
│  ★1200      ✦        ★★★              │
├─────────────────────────────────────────┤
│ HORA LOCAL                              │
│  25/07 · 03:45 PM                       │
├─────────────────────────────────────────┤
│ Migracion en: 3d 14h                    │
├─────────────────────────────────────────┤
│  [ Ver en lista ]                       │
└─────────────────────────────────────────┘
```

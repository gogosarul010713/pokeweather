# Mockup 03 — Distancia + ETA: Barra Inferior

**Fecha:** 2026-08-12
**Estado:** Aprobado
**Aplicar en:** US-907 (ajuste visual post-implementacion inicial)

---

## Decision

Variante aprobada: **Barra inferior separada** del cuerpo de la card.

## Diseno

### NestCard (`nc-bar`)
- Franja con `background: var(--bg-tertiary)` y `border-top: 1px solid var(--border-subtle)`
- Alineada con `nc-info` (no con el sprite): `padding-left = sprite(40) + gap(10) + padding(12) = 62px`
- Estado active: `padding-left: 60px` (border-left de 3px consume 2px del padding)
- Sin zona: elemento ausente — card compacta sin guiones ni placeholders

### LocationCard (`lc-bar`)
- Mismo patron que NestCard
- Offset = `weather(36) + gap(8) + padding(10) = 54px`
- Estado active: `padding-left: 52px`

### Datos en la barra
- **Distancia**: icono pin SVG + valor `X.X km`
- **Tiempo**: icono reloj SVG + valor `~N min`
- Separados por divisor vertical (`1px`, `var(--border-default)`)
- Ambos en `var(--home)` (cian) — misma jerarquia, complementarios
- Font: 11px, 700, `font-variant-numeric: tabular-nums`
- Sin label de texto ("en auto", "distancia", etc.) — los iconos son suficientes

## Variantes descartadas

| Variante | Motivo de descarte |
|---|---|
| A — Pill dividida | Buena jerarquia visual pero ocupa espacio dentro del nc-info compitiendo con r3 |
| C — Badge esquina | Distancia en nc-right compite con badges de estado (✓ HOT NEW spawn%) |
| D — Inline con iconos | Mejora minima sobre el estado anterior; sigue siendo plano |

## Tokens usados

| Token | Valor dark | Uso |
|---|---|---|
| `--home` | `#22D3EE` | color de ambos valores y sus iconos |
| `--bg-tertiary` | `#1C2333` | fondo de la barra |
| `--border-subtle` | `rgba(255,255,255,0.06)` | borde superior de la barra |
| `--border-default` | `rgba(255,255,255,0.12)` | divisor vertical entre valores |

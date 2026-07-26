# Pokeweather Design System — Sync Notes

## Configuracion clave

- Shape: `package` (sin Storybook, sin dist publicado)
- Entry: siempre usar `--entry ./.design-sync/ds-entry.mjs` al correr resync
- Node modules: `./node_modules`

## Fix critico — ds-entry.mjs

El synth entry generado automaticamente (`export * from './Comp.tsx'`) NO re-exporta defaults ES modules.
Resultado: 37/41 componentes ausentes de `window.PokeweatherDS` (`[BUNDLE_EXPORT]`).

**Fix aplicado (2026-07-13):** `.design-sync/ds-entry.mjs` usa el patron:
```js
import X from '../src/components/.../X.tsx';
export { X };
```
en lugar de `export { default as X } from '...'`.

Para componentes con named export (BottomSheetPortal, LayerToggles, ResponsiveImage):
```js
export { X } from '../src/components/.../X.tsx';
```

Siempre pasar `--entry ./.design-sync/ds-entry.mjs` al driver. Sin esto, el synth entry vuelve a fallar.

## Comando de re-sync

```bash
node .ds-sync/resync.mjs \
  --config .design-sync/config.json \
  --node-modules ./node_modules \
  --entry ./.design-sync/ds-entry.mjs \
  --out ./ds-bundle \
  --remote .design-sync/.cache/remote-sync.json
```

## Re-sync risks

- Si se agrega un nuevo componente a `componentSrcMap`, actualizar `ds-entry.mjs` manualmente (import/export segun si usa default o named export)
- `[FONT_REMOTE]` para "Exo 2": fuente servida en runtime via Google Fonts — comportamiento esperado
- 1 token CSS faltante (bajo el umbral) — no critico

## Known render warns

- `[FONT_REMOTE] "Exo 2"` — esperado, fuente en runtime

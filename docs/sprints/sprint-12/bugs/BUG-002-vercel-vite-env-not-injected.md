# BUG-002 -- Vercel no inyecta VITE_CARTO_KEY en bundle de produccion

**Sprint:** 12
**Status:** Closed
**Severity:** High
**Reported:** 2026-09-02

---

## Description

Al desplegar en una cuenta nueva de Vercel, `VITE_CARTO_KEY` configurada en el dashboard no llegaba al bundle de produccion. El mapa mostraba el watermark "API KEY REQUIRED" de Carto aunque la variable existia en Environment Variables.

## Reproduction

1. Configurar `VITE_CARTO_KEY` en Vercel dashboard como tipo "Config", environment "Preview and Production"
2. Hacer redeploy (con o sin cache)
3. Buscar en el bundle: `curl -s <url>/assets/index-*.js | grep -o "cb1_[a-zA-Z0-9_]*"`
4. **Resultado actual:** la key no aparece en el bundle

**Expected result:** `cb1_2rn4_1_...` embebida en el bundle por Vite

---

## Root Cause

Dos causas combinadas:

1. `VITE_CARTO_KEY` fue creada con environment **"Preview"** unicamente, nunca "Production". El CLI `vercel env ls` lo confirmo: la variable aparecia solo en Preview.
2. Los redeploies desde el dashboard reutilizaban el bundle cacheado del deploy anterior (que no tenia la variable), incluso con "Use existing Build Cache" desmarcado.

---

## Fix

| Accion | Detalle |
|--------|---------|
| `vercel link --project pokeweather2 --yes` | Re-linkear CLI al proyecto correcto (nueva cuenta) |
| `vercel env rm VITE_CARTO_KEY preview --yes` | Eliminar variable incorrecta |
| `vercel env add VITE_CARTO_KEY production` | Agregar con environment correcto |
| `vercel --prod --yes` | Deploy directo via CLI (no redeploy desde dashboard) |

Key usada: `cb1_2rn4_1_725f3485b25faf9764942f16` (registrada en carto.com/basemaps/apikey con dominios `pokeweather2.vercel.app` y el dominio de preview)

---

## Closure Criteria

- [x] `curl .../assets/index-*.js | grep "cb1_2rn4"` retorna la key en produccion
- [x] `curl https://a.basemaps.cartocdn.com/light_all/0/0/0.png?key=<key>` retorna HTTP 200
- [x] Watermark no visible en `pokeweather2.vercel.app`

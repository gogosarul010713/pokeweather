import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC = resolve(ROOT, 'src/services/weather/weatherClassify.ts')
const DST = resolve(ROOT, 'functions/src/shared/weatherClassify.ts')

const HEADER = `// ════════════════════════════════════════════════════════════════════════════
// AUTOGENERADO desde src/services/weather/weatherClassify.ts
// NO EDITAR ESTE ARCHIVO. Cualquier cambio aqui sera sobrescrito.
// Para modificar el algoritmo: editar el archivo fuente y ejecutar
//   npm run sync:classify   (o cualquier build de functions).
// Decision arquitectonica: D-042 (src/docs/architecture/11-decision-log.md)
// ════════════════════════════════════════════════════════════════════════════
`

const source = readFileSync(SRC, 'utf-8')
mkdirSync(dirname(DST), { recursive: true })
writeFileSync(DST, HEADER + '\n' + source, 'utf-8')

console.log(`[sync-classify] ${SRC} -> ${DST}`)

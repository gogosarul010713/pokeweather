import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(__dirname, '../../..')
const SRC = resolve(ROOT, 'src/services/weather/weatherClassify.ts')
const DST = resolve(ROOT, 'functions/src/shared/weatherClassify.ts')

describe('Sincronizacion weatherClassify frontend <-> CF (D-042)', () => {
  it('la copia generada existe', () => {
    expect(existsSync(DST)).toBe(true)
  })

  it('el contenido de la copia coincide byte-a-byte con el source (sin header)', () => {
    const src = readFileSync(SRC, 'utf-8')
    const dst = readFileSync(DST, 'utf-8')

    // Quitar header autogenerado: bloque de comentarios hasta la primera linea vacia doble
    const dstNoHeader = dst.replace(/^\/\/ [\s\S]*?\/\/ ═+\n\n/, '')

    expect(dstNoHeader).toBe(src)
  })
})

import { describe, it, expect } from 'vitest'

// Replica la funcion a implementar en weatherService.ts
function findCurrentSlot<T extends { EpochDateTime: number }>(
  slots: T[],
  nowMs: number
): T {
  if (slots.length === 0) throw new Error('No slots available')

  const nowSec = Math.floor(nowMs / 1000)
  let best = slots[0]
  for (const slot of slots) {
    if (slot.EpochDateTime <= nowSec && slot.EpochDateTime > best.EpochDateTime) {
      best = slot
    }
  }
  const anyPast = slots.some(s => s.EpochDateTime <= nowSec)
  return anyPast ? best : slots[0]
}

describe('findCurrentSlot — BUG-028', () => {
  const makeSlots = (epochsSeconds: number[]) =>
    epochsSeconds.map((e, i) => ({ EpochDateTime: e, icon: i }))

  it('retorna el slot mas reciente que es <= ahora', () => {
    // slots: 14:00, 15:00, 16:00 — ahora son las 15:20
    const slots = makeSlots([1749765600, 1749769200, 1749772800])
    const now = 1749769200 + 20 * 60  // 15:20 en segundos
    const result = findCurrentSlot(slots, now * 1000)
    expect(result.EpochDateTime).toBe(1749769200) // slot de las 15:00
  })

  it('si todos los slots son futuros, retorna slots[0]', () => {
    const slots = makeSlots([1749772800, 1749776400])
    const now = 1749769200 // antes del primer slot
    const result = findCurrentSlot(slots, now * 1000)
    expect(result.EpochDateTime).toBe(1749772800)
  })

  it('retorna slots[0] cuando hay exactamente un slot y es pasado', () => {
    const slots = makeSlots([1749765600])
    const now = 1749769200
    const result = findCurrentSlot(slots, now * 1000)
    expect(result.EpochDateTime).toBe(1749765600)
  })

  it('maneja el caso donde AccuWeather ya roto — slot[0] es la hora siguiente', () => {
    // AccuWeather roto: slots[0] = 16:00, slots[1] = 17:00 — ahora son las 15:45
    // Ningun slot es pasado, usar slots[0] como fallback
    const slots = makeSlots([1749772800, 1749776400]) // 16:00 y 17:00
    const now = 1749771000 // 15:30
    const result = findCurrentSlot(slots, now * 1000)
    expect(result.EpochDateTime).toBe(1749772800) // slots[0] como fallback
  })

  it('lanza error si el array esta vacio', () => {
    expect(() => findCurrentSlot([], Date.now())).toThrow('No slots available')
  })
})

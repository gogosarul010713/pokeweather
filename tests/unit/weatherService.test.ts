import { describe, it, expect } from 'vitest'
import { calculateBadges, BADGE_ICONS } from '../../src/data/weatherService'
import {
  testCitiesForQuartiles,
  perfectBadgeCity,
  singleBadgeCity,
  twoBadgeCity,
} from '../fixtures/mock-cities'

describe('weatherService — calculateBadges()', () => {
  it('debería calcular badges correctamente basado en cuartiles', () => {
    // 4 ciudades: low, mid, high, super
    // Q1 (top 25%): density >= 100, gyms >= 50, rating >= 4
    const badgeCalculator = calculateBadges(testCitiesForQuartiles)

    const lowBadges = badgeCalculator(testCitiesForQuartiles[0])
    const midBadges = badgeCalculator(testCitiesForQuartiles[1])
    const highBadges = badgeCalculator(testCitiesForQuartiles[2])
    const superBadges = badgeCalculator(testCitiesForQuartiles[3])

    expect(lowBadges).toEqual([]) // Nada en top 25%
    expect(midBadges).toEqual([]) // Nada en top 25%
    expect(highBadges.length).toBeGreaterThan(0) // En top 25%
    expect(superBadges.length).toBeGreaterThan(0) // En top 25%
  })

  it('debería retornar SOLO "best" si tiene las 3 categorías', () => {
    const cities = [perfectBadgeCity]
    const badgeCalculator = calculateBadges(cities)
    const badges = badgeCalculator(perfectBadgeCity)

    // Debe ser exclusivo: si tiene todas 3 → solo retorna 'best'
    expect(badges).toEqual(['best'])
    expect(badges).not.toContain('stops')
    expect(badges).not.toContain('gyms')
    expect(badges).not.toContain('community')
  })

  it('debería retornar SOLO categorías individuales si no tiene todas 3', () => {
    const cities = [singleBadgeCity, twoBadgeCity]

    const singleCalc = calculateBadges([singleBadgeCity])
    const singleBadges = singleCalc(singleBadgeCity)

    // Solo tiene densidad en top 25% → solo 'stops'
    expect(singleBadges).toContain('stops')
    expect(singleBadges).not.toContain('best')

    const twoCalc = calculateBadges([twoBadgeCity])
    const twoBadges = twoCalc(twoBadgeCity)

    // Tiene densidad + gyms en top 25% → 'stops' + 'gyms', NO 'best'
    expect(twoBadges).toContain('stops')
    expect(twoBadges).toContain('gyms')
    expect(twoBadges).not.toContain('best')
  })

  it('debería asignar "community" si rating >= 4.0', () => {
    const cityWithHighRating = {
      ...testCitiesForQuartiles[3],
      density: 10, // low
      gyms: 5,     // low
      rating: 4.5, // >= 4.0
    }

    const badgeCalculator = calculateBadges([cityWithHighRating])
    const badges = badgeCalculator(cityWithHighRating)

    expect(badges).toContain('community')
  })

  it('debería NO asignar "community" si rating < 4.0', () => {
    const cityWithLowRating = {
      ...testCitiesForQuartiles[0],
      rating: 3.5, // < 4.0
    }

    const badgeCalculator = calculateBadges([cityWithLowRating])
    const badges = badgeCalculator(cityWithLowRating)

    expect(badges).not.toContain('community')
  })

  it('BADGE_ICONS debería incluir todas las categorías', () => {
    expect(BADGE_ICONS).toHaveProperty('stops')
    expect(BADGE_ICONS).toHaveProperty('gyms')
    expect(BADGE_ICONS).toHaveProperty('community')
    expect(BADGE_ICONS).toHaveProperty('best')

    // Verificar que son emojis válidos
    expect(typeof BADGE_ICONS.stops).toBe('string')
    expect(typeof BADGE_ICONS.gyms).toBe('string')
    expect(typeof BADGE_ICONS.community).toBe('string')
    expect(typeof BADGE_ICONS.best).toBe('string')
  })

  it('debería manejar array vacío sin errores', () => {
    const badgeCalculator = calculateBadges([])

    // No debe lanzar error
    expect(() => {
      badgeCalculator(perfectBadgeCity)
    }).not.toThrow()
  })

  it('debería manejar ciudades con datos inconsistentes', () => {
    const invalidCity = {
      ...perfectBadgeCity,
      density: -10, // Densidad negativa
      gyms: -5,
      rating: 0,
    }

    const badgeCalculator = calculateBadges([invalidCity])

    // Debe manejar gracefully sin lanzar error
    expect(() => {
      badgeCalculator(invalidCity)
    }).not.toThrow()
  })
})

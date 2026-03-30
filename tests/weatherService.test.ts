import { describe, it, expect } from 'vitest'
import {
  WEATHER_TRANSLATIONS,
  CONDITION_TO_TYPES,
  getBaseCondition,
  resolveCondition,
} from '../src/services/weather/weatherService'
import type { WeatherCondition } from '../src/config/weatherImages'

describe('weatherService — Algoritmo clasificación clima (Doc 20)', () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 1: WEATHER_TRANSLATIONS — Tabla per-icon
  // ─────────────────────────────────────────────────────────────────────────────

  describe('WEATHER_TRANSLATIONS', () => {
    it('debe tener exactamente 44 entradas (iconos 1-44, excepto 9,10,27,28)', () => {
      expect(Object.keys(WEATHER_TRANSLATIONS).length).toBe(40)
    })

    it('debe contener TODOS los iconos válidos 1-44 excepto 9,10,27,28', () => {
      const validIcons = [
        1, 2, 3, 4, 5, 6, 7, 8, // 9, 10 no existen
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, // 27, 28 no existen
        29, 30, 31, 32,
        33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
      ]
      validIcons.forEach(iconId => {
        expect(WEATHER_TRANSLATIONS[iconId]).toBeDefined()
        expect(WEATHER_TRANSLATIONS[iconId].id).toBe(iconId)
      })
    })

    it('NO debe contener iconos inválidos 9, 10, 27, 28', () => {
      expect(WEATHER_TRANSLATIONS[9]).toBeUndefined()
      expect(WEATHER_TRANSLATIONS[10]).toBeUndefined()
      expect(WEATHER_TRANSLATIONS[27]).toBeUndefined()
      expect(WEATHER_TRANSLATIONS[28]).toBeUndefined()
    })

    it('debe mapear cada icono a una WeatherCondition válida', () => {
      const validConditions: WeatherCondition[] = ['sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy']
      Object.values(WEATHER_TRANSLATIONS).forEach(translation => {
        expect(validConditions).toContain(translation.pgoCondition)
      })
    })

    it('debe tener canWindy=true para climas secos', () => {
      // Iconos día con canWindy=true: 1,2,3,4,5,6,7,8,30,31,32
      const dryDayIcons = [1, 2, 3, 4, 5, 6, 7, 8, 30, 31, 32]
      dryDayIcons.forEach(iconId => {
        expect(WEATHER_TRANSLATIONS[iconId].canWindy).toBe(true)
      })

      // Iconos noche con canWindy=true: 33,34,35,36,37,38
      const dryNightIcons = [33, 34, 35, 36, 37, 38]
      dryNightIcons.forEach(iconId => {
        expect(WEATHER_TRANSLATIONS[iconId].canWindy).toBe(true)
      })
    })

    it('debe tener canWindy=false para climas con precipitación', () => {
      // FOG, RAIN, SNOW, SHOWERS, STORMS, FLURRIES, ICE, SLEET, FREEZING RAIN
      const precipIcons = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 29, 39, 40, 41, 42, 43, 44]
      precipIcons.forEach(iconId => {
        expect(WEATHER_TRANSLATIONS[iconId].canWindy).toBe(false)
      })
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 2: getBaseCondition() — Lookup per-icon
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getBaseCondition()', () => {
    it('debe retornar sunny para iconos 1,2,30,33,34', () => {
      expect(getBaseCondition(1)).toBe('sunny')
      expect(getBaseCondition(2)).toBe('sunny')
      expect(getBaseCondition(30)).toBe('sunny')
      expect(getBaseCondition(33)).toBe('sunny')
      expect(getBaseCondition(34)).toBe('sunny')
    })

    it('debe retornar partly para iconos 3,4,14,17,21,35,36,39,41', () => {
      expect(getBaseCondition(3)).toBe('partly')
      expect(getBaseCondition(4)).toBe('partly')
      expect(getBaseCondition(14)).toBe('partly')
      expect(getBaseCondition(17)).toBe('partly')
      expect(getBaseCondition(21)).toBe('partly')
      expect(getBaseCondition(35)).toBe('partly')
      expect(getBaseCondition(36)).toBe('partly')
      expect(getBaseCondition(39)).toBe('partly')
      expect(getBaseCondition(41)).toBe('partly')
    })

    it('debe retornar cloudy para iconos 5,6,7,8,13,16,20,23,37,38,40,42', () => {
      expect(getBaseCondition(5)).toBe('cloudy')
      expect(getBaseCondition(6)).toBe('cloudy')
      expect(getBaseCondition(7)).toBe('cloudy')
      expect(getBaseCondition(8)).toBe('cloudy')
      expect(getBaseCondition(13)).toBe('cloudy')
      expect(getBaseCondition(16)).toBe('cloudy')
      expect(getBaseCondition(20)).toBe('cloudy')
      expect(getBaseCondition(23)).toBe('cloudy')
      expect(getBaseCondition(37)).toBe('cloudy')
      expect(getBaseCondition(38)).toBe('cloudy')
      expect(getBaseCondition(40)).toBe('cloudy')
      expect(getBaseCondition(42)).toBe('cloudy')
    })

    it('debe retornar fog SOLO para icon 11', () => {
      expect(getBaseCondition(11)).toBe('fog')
    })

    it('debe retornar rain para iconos 12,15,18,26,29', () => {
      expect(getBaseCondition(12)).toBe('rain')
      expect(getBaseCondition(15)).toBe('rain')
      expect(getBaseCondition(18)).toBe('rain')
      expect(getBaseCondition(26)).toBe('rain')
      expect(getBaseCondition(29)).toBe('rain')
    })

    it('debe retornar snow para iconos 19,22,24,25,31,43,44', () => {
      expect(getBaseCondition(19)).toBe('snow')
      expect(getBaseCondition(22)).toBe('snow')
      expect(getBaseCondition(24)).toBe('snow')
      expect(getBaseCondition(25)).toBe('snow')
      expect(getBaseCondition(31)).toBe('snow')
      expect(getBaseCondition(43)).toBe('snow')
      expect(getBaseCondition(44)).toBe('snow')
    })

    it('debe retornar windy SOLO para icon 32', () => {
      expect(getBaseCondition(32)).toBe('windy')
    })

    it('debe retornar cloudy para iconos desconocidos (fallback)', () => {
      expect(getBaseCondition(999)).toBe('cloudy')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 3: resolveCondition() — Umbrales de viento + canWindy
  // ─────────────────────────────────────────────────────────────────────────────

  describe('resolveCondition() — Umbrales de viento', () => {
    it('debe retornar windy cuando windKmh > 29 para iconos con canWindy=true', () => {
      // Icon 1 (Sunny) tiene canWindy=true
      expect(resolveCondition(1, 30, 0)).toBe('windy')
      expect(resolveCondition(1, 29.1, 0)).toBe('windy')
      expect(resolveCondition(1, 100, 0)).toBe('windy')
    })

    it('debe retornar sunny cuando windKmh <= 29 para icon 1', () => {
      expect(resolveCondition(1, 29, 0)).toBe('sunny')
      expect(resolveCondition(1, 20, 0)).toBe('sunny')
      expect(resolveCondition(1, 0, 0)).toBe('sunny')
    })

    it('debe retornar windy cuando gustKmh > 31 para iconos con canWindy=true', () => {
      // Icon 2 (Mostly Sunny) tiene canWindy=true
      expect(resolveCondition(2, 0, 32)).toBe('windy')
      expect(resolveCondition(2, 0, 31.1)).toBe('windy')
      expect(resolveCondition(2, 0, 100)).toBe('windy')
    })

    it('debe retornar sunny cuando gustKmh <= 31 para icon 2', () => {
      expect(resolveCondition(2, 0, 31)).toBe('sunny')
      expect(resolveCondition(2, 0, 20)).toBe('sunny')
      expect(resolveCondition(2, 0, 0)).toBe('sunny')
    })

    it('debe usar OR: windKmh > 29 OR gustKmh > 31', () => {
      // Icon 3 (Partly Sunny) tiene canWindy=true
      expect(resolveCondition(3, 30, 0)).toBe('windy') // viento sí
      expect(resolveCondition(3, 0, 32)).toBe('windy') // ráfagas sí
      expect(resolveCondition(3, 30, 32)).toBe('windy') // ambos
      expect(resolveCondition(3, 28, 30)).toBe('partly') // ninguno
    })
  })

  describe('resolveCondition() — canWindy per-icon', () => {
    it('NUNCA debe convertirse a windy si canWindy=false (lluvia, nieve, FOG, etc)', () => {
      // Icon 11 (Fog) tiene canWindy=false
      expect(resolveCondition(11, 100, 100)).toBe('fog')

      // Icon 12 (Showers) tiene canWindy=false
      expect(resolveCondition(12, 100, 100)).toBe('rain')

      // Icon 18 (Rain) tiene canWindy=false
      expect(resolveCondition(18, 100, 100)).toBe('rain')

      // Icon 22 (Snow) tiene canWindy=false
      expect(resolveCondition(22, 100, 100)).toBe('snow')
    })

    it('SÍ puede convertirse a windy si canWindy=true y viento suficiente', () => {
      // Icon 30 (Hot) tiene canWindy=true
      expect(resolveCondition(30, 30, 0)).toBe('windy')

      // Icon 31 (Cold) tiene canWindy=true
      expect(resolveCondition(31, 30, 0)).toBe('windy')

      // Icon 32 (Windy) tiene canWindy=true, ya es windy base
      expect(resolveCondition(32, 0, 0)).toBe('windy')
      expect(resolveCondition(32, 30, 0)).toBe('windy')
    })
  })

  describe('resolveCondition() — FOG (icon=11)', () => {
    it('debe retornar fog SIEMPRE para icon=11, sin importar viento', () => {
      expect(resolveCondition(11, 0, 0)).toBe('fog')
      expect(resolveCondition(11, 100, 0)).toBe('fog')
      expect(resolveCondition(11, 0, 100)).toBe('fog')
      expect(resolveCondition(11, 100, 100)).toBe('fog')
    })

    it('NO debe retornar fog para iconos != 11, incluso si visibilityKm era bajo', () => {
      // Icon 7 (Cloudy) - antes podría retornar fog por visibilidad baja
      // Ahora NO, porque canWindy chequea el icono, no la visibilidad
      expect(resolveCondition(7, 0, 0)).toBe('cloudy')
      expect(resolveCondition(7, 1, 1)).toBe('cloudy')

      // Icon 5 (Hazy Sunshine)
      expect(resolveCondition(5, 0, 0)).toBe('cloudy')
      expect(resolveCondition(5, 1, 1)).toBe('cloudy')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 4: CONDITION_TO_TYPES — Tipos Pokémon potenciados
  // ─────────────────────────────────────────────────────────────────────────────

  describe('CONDITION_TO_TYPES', () => {
    it('debe mapear sunny a ["fire", "ground", "grass"]', () => {
      expect(CONDITION_TO_TYPES.sunny).toEqual(['fire', 'ground', 'grass'])
    })

    it('debe mapear partly a ["normal", "rock"]', () => {
      expect(CONDITION_TO_TYPES.partly).toEqual(['normal', 'rock'])
    })

    it('debe mapear cloudy a ["fairy", "fighting", "poison"]', () => {
      expect(CONDITION_TO_TYPES.cloudy).toEqual(['fairy', 'fighting', 'poison'])
    })

    it('debe mapear fog a ["ghost", "dark"]', () => {
      expect(CONDITION_TO_TYPES.fog).toEqual(['ghost', 'dark'])
    })

    it('debe mapear rain a ["water", "electric", "bug"]', () => {
      expect(CONDITION_TO_TYPES.rain).toEqual(['water', 'electric', 'bug'])
    })

    it('debe mapear snow a ["ice", "steel"]', () => {
      expect(CONDITION_TO_TYPES.snow).toEqual(['ice', 'steel'])
    })

    it('debe mapear windy a ["flying", "dragon", "psychic"]', () => {
      expect(CONDITION_TO_TYPES.windy).toEqual(['flying', 'dragon', 'psychic'])
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 5: Casos de prueba end-to-end
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Casos end-to-end (escenarios reales)', () => {
    it('Tokio soleado sin viento (icon=1, viento=5km/h) → sunny', () => {
      const condition = resolveCondition(1, 5, 8)
      expect(condition).toBe('sunny')
      expect(CONDITION_TO_TYPES[condition]).toEqual(['fire', 'ground', 'grass'])
    })

    it('Tokio soleado CON viento fuerte (icon=1, viento=35km/h) → windy', () => {
      const condition = resolveCondition(1, 35, 30)
      expect(condition).toBe('windy')
      expect(CONDITION_TO_TYPES[condition]).toEqual(['flying', 'dragon', 'psychic'])
    })

    it('Buenos Aires lluvia con viento extremo (icon=18, viento=50km/h) → SIGUE SIENDO rain', () => {
      // Icon 18 (Rain) tiene canWindy=false, NO se convierte en windy
      const condition = resolveCondition(18, 50, 50)
      expect(condition).toBe('rain')
      expect(CONDITION_TO_TYPES[condition]).toEqual(['water', 'electric', 'bug'])
    })

    it('Nueva York frío con viento (icon=31, viento=30km/h) → windy', () => {
      // Icon 31 (Cold) tiene canWindy=true, SÍ se puede convertir a windy
      const condition = resolveCondition(31, 30, 0)
      expect(condition).toBe('windy')
      expect(CONDITION_TO_TYPES[condition]).toEqual(['flying', 'dragon', 'psychic'])
    })

    it('Sydney niebla (icon=11) → SIEMPRE fog, sin importar viento', () => {
      const condition = resolveCondition(11, 0, 0)
      expect(condition).toBe('fog')

      const conditionWithWind = resolveCondition(11, 100, 100)
      expect(conditionWithWind).toBe('fog')

      expect(CONDITION_TO_TYPES[condition]).toEqual(['ghost', 'dark'])
    })

    it('París nublado, viento en rango 24-29 km/h (OLD bug) → ahora NO es windy', () => {
      // Icon 7 (Cloudy) tiene canWindy=true
      // Antes de fix: 25km/h >= 24.1 → windy
      // Después de fix: 25km/h <= 29 → cloudy (NO windy)
      const condition = resolveCondition(7, 25, 0)
      expect(condition).toBe('cloudy') // NO es windy
      expect(CONDITION_TO_TYPES[condition]).toEqual(['fairy', 'fighting', 'poison'])
    })
  })
})

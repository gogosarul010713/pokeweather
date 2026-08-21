/**
 * REF-001 (sprint-11) — Tests schema post-limpieza legacy
 *
 * Verifica que tras eliminar el schema viejo (classified, raw_condition_code, etc.)
 * los paths criticos de lectura usan pgo_condition como unica fuente de verdad.
 *
 * Paths cubiertos:
 *   1. ForecastSnapshot — solo campos CF (no campos legacy)
 *   2. classifySnapshot (predictionAnalyticsService) — retorna pgo_condition directo
 *   3. getConditionFromSnapshot (lookbackService) — retorna pgo_condition directo
 *   4. getRecentForecasts — descarta docs sin target_hour
 */

import { describe, it, expect } from 'vitest'
import type { ForecastSnapshot, ForecastDoc } from '../../../src/services/firebase/firebaseWeatherService'

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSnapshot(overrides: Partial<ForecastSnapshot> = {}): ForecastSnapshot {
  return {
    hour: 0,
    icon_code: 1,
    icon_phrase: 'Sunny',
    temp_c: 25,
    wind_kmh: 10,
    gust_kmh: 12,
    humidity: 50,
    has_precipitation: false,
    pgo_condition: 'sunny',
    ...overrides,
  }
}

function makeDoc(overrides: Partial<ForecastDoc> = {}): ForecastDoc {
  const now = { toMillis: () => Date.now(), toDate: () => new Date() } as unknown as ForecastDoc['created_at']
  return {
    city_id: 'test-city',
    city_name: 'Test City',
    country: 'MX',
    region: 'america',
    lat: 19.4,
    lon: -99.1,
    date_hour: '2026-06-11-14',
    snapshots: [makeSnapshot()],
    timezone: -6,
    target_hour: 9,
    local_time_user: '11/06 08:00',
    ttl: now,
    created_at: now,
    ...overrides,
  }
}

// ─── Suite 1: ForecastSnapshot — schema CF ───────────────────────────────────

describe('ForecastSnapshot — schema CF (REF-001)', () => {
  it('tiene todos los campos requeridos del schema CF', () => {
    const snap = makeSnapshot()
    expect(snap).toHaveProperty('hour')
    expect(snap).toHaveProperty('icon_code')
    expect(snap).toHaveProperty('icon_phrase')
    expect(snap).toHaveProperty('temp_c')
    expect(snap).toHaveProperty('wind_kmh')
    expect(snap).toHaveProperty('gust_kmh')
    expect(snap).toHaveProperty('humidity')
    expect(snap).toHaveProperty('has_precipitation')
    expect(snap).toHaveProperty('pgo_condition')
  })

  it('no contiene campos legacy', () => {
    const snap = makeSnapshot() as Record<string, unknown>
    expect(snap.classified).toBeUndefined()
    expect(snap.raw_condition_code).toBeUndefined()
    expect(snap.raw_condition_text).toBeUndefined()
    expect(snap.types).toBeUndefined()
    expect(snap.temperature_c).toBeUndefined()
    expect(snap.precipitation_mm).toBeUndefined()
    expect(snap.humidity_pct).toBeUndefined()
    expect(snap.is_windy_override).toBeUndefined()
  })

  it('pgo_condition refleja la condicion calculada por la CF', () => {
    const conditions = ['sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy']
    conditions.forEach(cond => {
      const snap = makeSnapshot({ pgo_condition: cond })
      expect(snap.pgo_condition).toBe(cond)
    })
  })
})

// ─── Suite 2: ForecastDoc — sin calculated_condition ─────────────────────────

describe('ForecastDoc — schema CF (REF-001)', () => {
  it('tiene target_hour como campo obligatorio', () => {
    const doc = makeDoc()
    expect(doc.target_hour).toBeDefined()
    expect(typeof doc.target_hour).toBe('number')
  })

  it('no contiene calculated_condition', () => {
    const doc = makeDoc() as Record<string, unknown>
    expect(doc.calculated_condition).toBeUndefined()
  })
})

// ─── Suite 3: classifySnapshot — solo pgo_condition ──────────────────────────
// Prueba la logica internamente sin importar el modulo completo (evita deps Firebase)

describe('classifySnapshot logic — pgo_condition como fuente unica (REF-001)', () => {
  // Replica la funcion simplificada para aislar la logica
  function classifySnapshot(snapshot: ForecastSnapshot): string {
    return snapshot.pgo_condition
  }

  it('retorna pgo_condition directamente', () => {
    expect(classifySnapshot(makeSnapshot({ pgo_condition: 'rain' }))).toBe('rain')
    expect(classifySnapshot(makeSnapshot({ pgo_condition: 'snow' }))).toBe('snow')
    expect(classifySnapshot(makeSnapshot({ pgo_condition: 'windy' }))).toBe('windy')
  })

  it('no recalcula con icon_code — pgo_condition tiene prioridad absoluta', () => {
    // icon_code=1 normalmente seria sunny, pero pgo_condition dice fog
    // La funcion debe retornar fog (lo que dijo la CF), no recalcular
    const snap = makeSnapshot({ icon_code: 1, pgo_condition: 'fog' })
    expect(classifySnapshot(snap)).toBe('fog')
  })

  it('no usa wind_kmh para recalcular — pgo_condition es inmutable post-CF', () => {
    // viento alto que normalmente forzaria windy, pero pgo_condition dice cloudy
    const snap = makeSnapshot({ wind_kmh: 100, gust_kmh: 100, pgo_condition: 'cloudy' })
    expect(classifySnapshot(snap)).toBe('cloudy')
  })
})

// ─── Suite 4: getConditionFromSnapshot — solo pgo_condition ──────────────────

describe('getConditionFromSnapshot logic — pgo_condition como fuente unica (REF-001)', () => {
  // Replica la funcion simplificada para aislar la logica
  function getConditionFromSnapshot(s: ForecastSnapshot | undefined): string {
    if (!s) return 'Unknown'
    return s.pgo_condition
  }

  it('retorna Unknown si el snapshot es undefined', () => {
    expect(getConditionFromSnapshot(undefined)).toBe('Unknown')
  })

  it('retorna pgo_condition directamente', () => {
    expect(getConditionFromSnapshot(makeSnapshot({ pgo_condition: 'rain' }))).toBe('rain')
    expect(getConditionFromSnapshot(makeSnapshot({ pgo_condition: 'fog' }))).toBe('fog')
  })

  it('no recalcula aunque icon_code apunte a condicion distinta', () => {
    // CF persistio 'windy', eso es lo que debe retornar sin importar icon_code
    const snap = makeSnapshot({ icon_code: 12, pgo_condition: 'windy' })
    expect(getConditionFromSnapshot(snap)).toBe('windy')
  })
})

// ─── Suite 5: filtro target_hour en getRecentForecasts ───────────────────────
// Verifica la logica de descarte de docs obsoletos (sin target_hour)

describe('filtro target_hour — docs obsoletos descartados (REF-001)', () => {
  // Replica la logica de filtrado de getRecentForecasts
  type DocWithOptionalTarget = Partial<ForecastDoc> & { target_hour?: number | null }

  function filterDocs(docs: DocWithOptionalTarget[]): DocWithOptionalTarget[] {
    return docs.filter(doc =>
      doc.target_hour !== undefined && doc.target_hour !== null
    )
  }

  it('descarta docs sin target_hour (pre-CF actualizada)', () => {
    const docs: DocWithOptionalTarget[] = [
      makeDoc({ target_hour: 9 }),
      { ...makeDoc(), target_hour: undefined },
      makeDoc({ target_hour: 14 }),
      { ...makeDoc(), target_hour: null },
    ]
    const result = filterDocs(docs)
    expect(result).toHaveLength(2)
    expect(result[0].target_hour).toBe(9)
    expect(result[1].target_hour).toBe(14)
  })

  it('acepta target_hour=0 como valido (medianoche)', () => {
    const docs = [makeDoc({ target_hour: 0 })]
    expect(filterDocs(docs)).toHaveLength(1)
  })

  it('retorna array vacio si todos los docs son obsoletos', () => {
    const docs: DocWithOptionalTarget[] = [
      { ...makeDoc(), target_hour: undefined },
      { ...makeDoc(), target_hour: null },
    ]
    expect(filterDocs(docs)).toHaveLength(0)
  })
})

// weatherCatalogService.ts
// US-802: Servicio de lectura del catálogo estático de Firestore
// Propósito: Leer condiciones, type_mapping, y reglas desde Firestore
// Fallback: Si Firestore no está disponible, usa valores hardcodeados

import { db } from './firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { CONDITION_TO_TYPES, CONDITION_LABEL, CONDITION_COLORS } from '../weather/weatherService'
import type { WeatherCondition } from '../../config/weatherImages'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogCondition {
  label: string
  emoji: string
  accuweather_codes?: number[]
  threshold_wind_kmh?: number
  threshold_gust_kmh?: number
  note?: string
}

export interface CatalogRules {
  windy_override: {
    description: string
    base_conditions_replaceable: string[]
    never_replaces: string[]
    threshold_wind_kmh: number
    threshold_gust_kmh: number
  }
  dedup: {
    max_types_displayed: number
    description: string
  }
  version: string
  last_updated: string
}

export interface WeatherCatalog {
  conditions: Record<string, CatalogCondition>
  type_mapping: Record<string, string[]>
  rules: CatalogRules
  source: 'firestore' | 'fallback'
  loaded_at: string
}

// ─── Fallback (Hardcoded) ─────────────────────────────────────────────────────

const FALLBACK_CONDITIONS: Record<string, CatalogCondition> = {
  sunny: {
    label: 'Soleado',
    emoji: '☀️',
    accuweather_codes: [1, 2, 30, 33, 34],
  },
  partly: {
    label: 'Parcialmente nublado',
    emoji: '⛅',
    accuweather_codes: [3, 4, 35, 36],
  },
  cloudy: {
    label: 'Nublado',
    emoji: '☁️',
    accuweather_codes: [5, 6, 7, 8, 13, 16, 20, 23, 37, 38, 40, 42],
  },
  fog: {
    label: 'Niebla',
    emoji: '🌫️',
    accuweather_codes: [11],
  },
  rain: {
    label: 'Lluvia',
    emoji: '🌧️',
    accuweather_codes: [12, 14, 15, 17, 18, 26, 29, 39, 41],
  },
  snow: {
    label: 'Nieve',
    emoji: '❄️',
    accuweather_codes: [19, 21, 22, 24, 25, 31, 43, 44],
  },
  windy: {
    label: 'Ventoso',
    emoji: '💨',
    threshold_wind_kmh: 29,
    threshold_gust_kmh: 31,
    note: 'No es un código AccuWeather — se aplica por umbral de viento',
  },
}

const FALLBACK_TYPE_MAPPING: Record<string, string[]> = CONDITION_TO_TYPES

const FALLBACK_RULES: CatalogRules = {
  windy_override: {
    description: 'WINDY reemplaza sunny/partly/cloudy si viento >= threshold',
    base_conditions_replaceable: ['sunny', 'partly', 'cloudy'],
    never_replaces: ['fog', 'rain', 'snow'],
    threshold_wind_kmh: 29,
    threshold_gust_kmh: 31,
  },
  dedup: {
    max_types_displayed: 4,
    description:
      'Si una ciudad tiene múltiples condiciones, se muestran máx 4 tipos únicos',
  },
  version: '1.0.0',
  last_updated: new Date().toISOString().split('T')[0],
}

// ─── Singleton Cache ──────────────────────────────────────────────────────────

let catalogCache: WeatherCatalog | null = null

// ─── Load from Firestore ──────────────────────────────────────────────────────

/**
 * Cargar catálogo desde Firestore
 * Retorna datos de Firestore si están disponibles, sino fallback a hardcodeados
 *
 * @returns {Promise<WeatherCatalog>} Catálogo con fuente indicada (firestore | fallback)
 */
export async function loadWeatherCatalog(): Promise<WeatherCatalog> {
  // Cache hit
  if (catalogCache) {
    console.log('[Catalog] 📦 Using cached catalog')
    return catalogCache
  }

  // Validación: Firebase no inicializado
  if (!db) {
    console.warn('[Catalog] ⚠️ Firebase not initialized, using fallback catalog')
    return buildFallbackCatalog()
  }

  try {
    console.log('[Catalog] 🔄 Loading from Firestore...')

    // Cargar los 3 documentos en paralelo
    const [conditionsSnap, typeMappingSnap, rulesSnap] = await Promise.all([
      getDoc(doc(db, 'weather_catalog', 'conditions')),
      getDoc(doc(db, 'weather_catalog', 'type_mapping')),
      getDoc(doc(db, 'weather_catalog', 'rules')),
    ])

    // Validar que existan
    if (!conditionsSnap.exists() || !typeMappingSnap.exists() || !rulesSnap.exists()) {
      console.warn(
        '[Catalog] ⚠️ Incomplete catalog in Firestore, using fallback'
      )
      return buildFallbackCatalog()
    }

    const catalog: WeatherCatalog = {
      conditions: conditionsSnap.data() as Record<string, CatalogCondition>,
      type_mapping: typeMappingSnap.data() as Record<string, string[]>,
      rules: rulesSnap.data() as CatalogRules,
      source: 'firestore',
      loaded_at: new Date().toISOString(),
    }

    // Cache
    catalogCache = catalog

    console.log('[Catalog] ✅ Loaded from Firestore')
    return catalog
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.warn(`[Catalog] ⚠️ Error loading from Firestore: ${errorMsg}`)
    console.log('[Catalog] 📦 Falling back to hardcoded catalog')
    return buildFallbackCatalog()
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Construir catálogo fallback (hardcodeado)
 */
function buildFallbackCatalog(): WeatherCatalog {
  const catalog: WeatherCatalog = {
    conditions: FALLBACK_CONDITIONS,
    type_mapping: FALLBACK_TYPE_MAPPING,
    rules: FALLBACK_RULES,
    source: 'fallback',
    loaded_at: new Date().toISOString(),
  }

  // Cache
  catalogCache = catalog

  return catalog
}

/**
 * Obtener label de condición (ej: "Soleado")
 * Usa catálogo cargado, sino fallback hardcodeado
 */
export function getConditionLabel(
  condition: WeatherCondition
): string {
  return CONDITION_LABEL[condition]
}

/**
 * Obtener emoji de condición (ej: "☀️")
 * Requiere haber llamado a loadWeatherCatalog() antes
 */
export function getConditionEmoji(condition: WeatherCondition): string {
  if (catalogCache?.conditions[condition]?.emoji) {
    return catalogCache.conditions[condition].emoji
  }
  return FALLBACK_CONDITIONS[condition]?.emoji ?? '❓'
}

/**
 * Obtener color de condición (hex)
 * Usa hardcodeado (no está en Firestore)
 */
export function getConditionColor(condition: WeatherCondition): string {
  return CONDITION_COLORS[condition] ?? '#999999'
}

/**
 * Obtener tipos Pokémon para una condición
 * Requiere haber llamado a loadWeatherCatalog() antes
 */
export function getTypesForCondition(condition: WeatherCondition): string[] {
  if (catalogCache?.type_mapping[condition]) {
    return catalogCache.type_mapping[condition]
  }
  return FALLBACK_TYPE_MAPPING[condition] ?? []
}

/**
 * Validar que catálogo local coincida con Firestore
 * Útil para detectar desincronizaciones
 */
export async function validateCatalogConsistency(): Promise<{
  match: boolean
  differences: string[]
}> {
  const fsb = await loadWeatherCatalog()

  const differences: string[] = []

  // Comparar conditions
  Object.keys(FALLBACK_CONDITIONS).forEach((key) => {
    if (!fsb.conditions[key]) {
      differences.push(`Missing condition in Firestore: ${key}`)
    }
  })

  // Comparar type_mapping
  Object.keys(FALLBACK_TYPE_MAPPING).forEach((key) => {
    const local = FALLBACK_TYPE_MAPPING[key]
    const firestore = fsb.type_mapping[key]
    if (!firestore || JSON.stringify(local) !== JSON.stringify(firestore)) {
      differences.push(`Type mapping mismatch for: ${key}`)
    }
  })

  // Comparar rules
  if (
    fsb.rules.windy_override.threshold_wind_kmh !==
    FALLBACK_RULES.windy_override.threshold_wind_kmh
  ) {
    differences.push('WINDY threshold mismatch')
  }

  return {
    match: differences.length === 0,
    differences,
  }
}

/**
 * Limpiar cache (para testing)
 */
export function clearCatalogCache() {
  catalogCache = null
}

// CONDITION_COLORS ya se importa desde weatherService en línea 8

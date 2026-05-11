/**
 * lookbackService.ts
 * BUG-021: Lookback lazy on-demand via getDoc por date_hour ID directo.
 *
 * Reemplaza generateLookback() que tenia 3 bugs:
 *   A) s.hour === targetHour — hour es indice (0-11), no hora local
 *   B) busqueda por created_at +-15min en lugar de ID directo
 *   C) ventana 24h insuficiente para filas al borde
 */

import { getDb } from '../firebase/firebaseConfig'
import { resolveCondition } from '../weather/weatherService'
import type { ForecastSnapshot } from '../firebase/firebaseWeatherService'

export interface LookbackEntry {
  dateHour: string
  hoursAgo: number
  condition: string
  isMatch: boolean | null
}

/**
 * Clasifica un snapshot usando icon_code (schema Cloud Function).
 * Fallback a classified para schema viejo del cliente React.
 */
function classifyFromSnapshot(s: ForecastSnapshot | undefined): string {
  if (!s) return 'Unknown'

  const iconCode = s.icon_code ?? s.raw_condition_code ?? 0
  const windKmh = s.wind_kmh ?? 0
  const gustKmh = s.gust_kmh ?? windKmh

  if (iconCode > 0) {
    return resolveCondition(iconCode, windKmh, gustKmh)
  }

  return s.classified || 'Unknown'
}

/**
 * Calcula el offset de array para acceder al snapshot que predice targetHour.
 *
 * Schema Cloud Function: snapshots[0] predice (localExecHour + 1),
 * snapshots[1] predice (localExecHour + 2), ..., snapshots[11] predice (localExecHour + 12).
 * "localExecHour" = hora local de la ciudad en el momento de ejecucion.
 *
 * @param dateHour   "YYYY-MM-DD-HH" (hora UTC de ejecucion de la CF)
 * @param targetHour Hora local de la ciudad que queremos predecir (0-23)
 * @param timezone   Offset en horas de la ciudad (ej: 12 para Auckland, -6 para Mexico)
 * @returns indice valido [0-11] o -1 si el documento no cubre targetHour
 */
function computeOffset(dateHour: string, targetHour: number, timezone: number): number {
  const execHourUtc = parseInt(dateHour.split('-')[3], 10)
  if (isNaN(execHourUtc)) return -1

  const localExecHour = ((execHourUtc + timezone) % 24 + 24) % 24

  // snapshots[i] predice la hora (localExecHour + 1 + i) % 24.
  // Para encontrar el indice que predice targetHour:
  //   offset = (targetHour - localExecHour - 1 + 24) % 24
  // Valido solo si 0 <= offset <= 11
  const offset = ((targetHour - localExecHour - 1) + 24) % 24

  if (offset > 11) return -1
  return offset
}

/**
 * Genera los N date_hours anteriores a dateHour (resta 1h por paso).
 * dateHour = "YYYY-MM-DD-HH"
 */
function getPreviousDateHours(dateHour: string, count: number): string[] {
  const parts = dateHour.split('-')
  if (parts.length !== 4) return []

  const year  = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day   = parseInt(parts[2], 10)
  const hour  = parseInt(parts[3], 10)

  const base = new Date(Date.UTC(year, month, day, hour))
  const results: string[] = []

  for (let i = 1; i <= count; i++) {
    const d = new Date(base.getTime() - i * 60 * 60 * 1000)
    const yy = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    const hh = String(d.getUTCHours()).padStart(2, '0')
    results.push(`${yy}-${mm}-${dd}-${hh}`)
  }

  return results
}

/**
 * Obtiene el lookback de las ultimas 12 horas para una ciudad/hora especifica.
 *
 * - Genera 12 date_hours anteriores por calculo aritmetico
 * - Lee cada documento por ID directo (getDoc) — sin ventana temporal
 * - Calcula el offset correcto por timezone
 * - Clasifica con icon_code (schema Cloud Function)
 *
 * @param cityId         ID de la ciudad (ej: "auckland-waterfront")
 * @param dateHour       date_hour de la fila actual (ej: "2026-05-11-14")
 * @param targetHour     Hora local de la ciudad que se esta analizando (0-23)
 * @param timezone       Offset en horas de la ciudad
 * @param actualCondition Condicion confirmada (should_be) si existe, para calcular isMatch
 */
export async function fetchLookback(
  cityId: string,
  dateHour: string,
  targetHour: number,
  timezone: number,
  actualCondition: string | null
): Promise<LookbackEntry[]> {
  const { doc, getDoc } = await import('firebase/firestore')
  const db = await getDb()

  if (!db) {
    console.warn('[Lookback] Firestore not initialized')
    return []
  }

  const previousDateHours = getPreviousDateHours(dateHour, 12)
  const entries: LookbackEntry[] = []

  await Promise.all(
    previousDateHours.map(async (dh, i) => {
      const offset = computeOffset(dh, targetHour, timezone)
      if (offset === -1) return

      try {
        const docRef = doc(db, 'city_weather', cityId, 'forecasts', dh)
        const snap = await getDoc(docRef)

        if (!snap.exists()) return

        const data = snap.data()
        const snapshots: ForecastSnapshot[] = data?.snapshots ?? []
        const snapshot = snapshots[offset]

        if (!snapshot) return

        const condition = classifyFromSnapshot(snapshot)
        const isMatch = actualCondition ? condition === actualCondition : null

        entries.push({
          dateHour: dh,
          hoursAgo: i + 1,
          condition,
          isMatch,
        })
      } catch (err) {
        console.warn(`[Lookback] Error reading ${cityId}/${dh}:`, err)
      }
    })
  )

  return entries.sort((a, b) => a.hoursAgo - b.hoursAgo)
}

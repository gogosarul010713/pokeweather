import { getDb } from './firebaseConfig'
import type { Timestamp } from 'firebase/firestore'
import type { City } from '../../store/useStore'

/**
 * Classification Report — dataset para mejora del algoritmo
 * Registra cuándo el sistema falló en clasificar correctamente
 */
export interface ClassificationReport {
  report_id?: string
  city_id: string
  city_name: string
  timestamp: Timestamp
  date_hour: string // "2026-04-08-14" — la hora del pronóstico siendo reportado

  // Clasificación actual (lo que el sistema dijo)
  classified_as: string
  classified_types: string[]

  // Clasificación correcta (lo que el usuario dice)
  should_be: string
  should_be_types: string[]

  // Contexto del pronóstico original (disponibles desde City)
  temperature_c: number
  wind_kmh: number

  // Metadata
  comment: string
  reporter: 'user'
  ttl: Timestamp // +30 días (auto-delete)
}

/**
 * Guardar reporte de clasificación incorrecta en Firestore
 */
export async function saveClassificationReport(
  city: City,
  currentCondition: string,
  currentTypes: string[],
  correctCondition: string,
  correctTypes: string[],
  comment: string,
  dateHour?: string
): Promise<string> {
  // Dynamic import Firestore functions (lazy)
  const { collection, addDoc, Timestamp } = await import('firebase/firestore')

  // Lazy initialize Firebase if needed
  const db = await getDb()

  try {
    if (!db) {
      throw new Error('Firebase no inicializado')
    }

    const now = Timestamp.now()
    const ttlDate = new Date(now.toDate().getTime() + 30 * 24 * 60 * 60 * 1000)

    const report: Omit<ClassificationReport, 'report_id'> = {
      city_id: city.id,
      city_name: city.name,
      timestamp: now,
      date_hour: dateHour || new Date().toISOString().slice(0, 13).replace('T', '-'),

      classified_as: currentCondition,
      classified_types: currentTypes,

      should_be: correctCondition,
      should_be_types: correctTypes,

      // Campos opcionales disponibles en City
      temperature_c: city.tempC,
      wind_kmh: city.windKmh,
      // raw_condition_code, raw_condition_text, precipitation_mm no existen en City

      comment: comment.slice(0, 200),
      reporter: 'user',
      ttl: new Timestamp(Math.floor(ttlDate.getTime() / 1000), 0),
    }

    const docRef = await addDoc(collection(db!, 'classification_reports'), report)
    console.log(`[Firebase] ✅ Reporte guardado: ${docRef.id}`)
    return docRef.id
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al guardar reporte:', err)
    throw err
  }
}

/**
 * Obtener reportes de las últimas 24h
 */
export async function getRecentClassificationReports(
  hours: number = 24
): Promise<ClassificationReport[]> {
  // Dynamic import Firestore functions (lazy)
  const { collection, getDocs, Timestamp } = await import('firebase/firestore')

  // Lazy initialize Firebase if needed
  const db = await getDb()

  try {
    const minDate = new Timestamp(
      Math.floor((Date.now() - hours * 60 * 60 * 1000) / 1000),
      0
    )

    if (!db) {
      console.warn('[Firebase] Firestore not initialized, returning empty reports')
      return []
    }

    // Fallback: obtener sin where/orderBy para evitar índice, procesar en memoria
    const allReports = await getDocs(collection(db, 'classification_reports'))

    const filtered = allReports.docs
      .map((doc) => ({
        report_id: doc.id,
        ...doc.data(),
      } as ClassificationReport))
      .filter((report) => report.timestamp >= minDate)
      .sort(
        (a, b) =>
          (b.timestamp?.toDate()?.getTime() || 0) -
          (a.timestamp?.toDate()?.getTime() || 0)
      )

    return filtered
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al leer reportes:', err)
    return []
  }
}

/**
 * Obtener reportes de una ciudad específica
 */
export async function getCityClassificationReports(
  cityId: string
): Promise<ClassificationReport[]> {
  // Dynamic import Firestore functions (lazy)
  const { collection, getDocs } = await import('firebase/firestore')

  // Lazy initialize Firebase if needed
  const db = await getDb()

  try {
    if (!db) {
      console.warn('[Firebase] Firestore not initialized, returning empty reports')
      return []
    }

    const allReports = await getDocs(collection(db, 'classification_reports'))

    const filtered = allReports.docs
      .map((doc) => ({
        report_id: doc.id,
        ...doc.data(),
      } as ClassificationReport))
      .filter((report) => report.city_id === cityId)
      .sort(
        (a, b) =>
          (b.timestamp?.toDate()?.getTime() || 0) -
          (a.timestamp?.toDate()?.getTime() || 0)
      )

    return filtered
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al leer reportes de ciudad:', err)
    return []
  }
}

/**
 * Verificar si ya existe reporte para esta ciudad+hora en la sesión actual
 * Evita duplicados dentro de 1 hora
 */
export async function isDuplicateReport(
  cityId: string,
  dateHour: string
): Promise<boolean> {
  // Dynamic import Firestore functions (lazy)
  const { collection, getDocs } = await import('firebase/firestore')

  // Lazy initialize Firebase if needed
  const db = await getDb()

  try {
    if (!db) {
      console.warn('[Firebase] Firestore not initialized, skipping duplicate check')
      return false
    }

    const allReports = await getDocs(collection(db, 'classification_reports'))

    const exists = allReports.docs.some((doc) => {
      const data = doc.data() as Omit<ClassificationReport, 'report_id'>
      return data.city_id === cityId && data.date_hour === dateHour
    })

    return exists
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al verificar duplicado:', err)
    return false
  }
}

/**
 * Guardar reporte de clima real observado en tabla predictiva
 * Similar a saveClassificationReport pero con propósito diferente
 */
export async function saveWeatherReport(
  cityId: string,
  cityName: string,
  predictedCondition: string,
  reportedCondition: string,
  queryTime: string | Date,
  source: 'prediction-table' | 'location-detail' = 'prediction-table'
): Promise<string> {
  // Dynamic import Firestore functions (lazy)
  const { collection, addDoc, Timestamp } = await import('firebase/firestore')

  // Lazy initialize Firebase if needed
  const db = await getDb()

  try {
    if (!db) {
      throw new Error('Firebase no inicializado')
    }

    const now = Timestamp.now()
    const ttlDate = new Date(now.toDate().getTime() + 30 * 24 * 60 * 60 * 1000)

    // Convertir queryTime a timestamp
    let queryTimeDate: Date
    if (typeof queryTime === 'string') {
      queryTimeDate = new Date(queryTime)
    } else if (queryTime instanceof Date) {
      queryTimeDate = queryTime
    } else {
      queryTimeDate = new Date()
    }

    const report = {
      city_id: cityId,
      city_name: cityName,
      timestamp: now,
      date_hour: queryTimeDate.toISOString().slice(0, 13).replace('T', '-'),

      // Clima predicho vs reportado
      predicted_condition: predictedCondition,
      reported_condition: reportedCondition,

      // Metadata
      source: source,
      reporter: 'user',
      ttl: new Timestamp(Math.floor(ttlDate.getTime() / 1000), 0),
    }

    const docRef = await addDoc(collection(db!, 'weather_reports'), report)
    console.log(`[Firebase] ✅ Reporte de clima guardado: ${docRef.id}`)
    return docRef.id
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al guardar reporte de clima:', err)
    throw err
  }
}

/**
 * Obtener reportes de clima real (weather_reports)
 * BUG-008 FIX: Agregada para sincronizar tabla después de reportar
 * @param hours - últimas N horas (default 24)
 * @returns array de reportes con estructura para predictionAnalyticsService
 */
export async function getRecentWeatherReports(
  hours: number = 24
): Promise<Array<{ city_id: string; date_hour: string; reported_condition: string }>> {
  const { collection, getDocs, Timestamp } = await import('firebase/firestore')
  const db = await getDb()

  try {
    const minDate = new Timestamp(
      Math.floor((Date.now() - hours * 60 * 60 * 1000) / 1000),
      0
    )

    if (!db) {
      console.warn('[Firebase] Firestore not initialized, returning empty weather reports')
      return []
    }

    // Leer desde 'weather_reports' (donde saveWeatherReport() guarda)
    const allReports = await getDocs(collection(db, 'weather_reports'))

    const filtered = allReports.docs
      .map((doc) => ({
        city_id: doc.data().city_id,
        date_hour: doc.data().date_hour,
        reported_condition: doc.data().reported_condition,
      }))
      .filter((report) => {
        // El timestamp está en el documento original
        const docData = allReports.docs.find((d) => d.data().city_id === report.city_id && d.data().date_hour === report.date_hour)?.data()
        return docData?.timestamp >= minDate
      })

    console.log(`[Firebase] ✅ Loaded ${filtered.length} weather reports from last ${hours}h`)
    return filtered
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al leer weather reports:', err)
    return []
  }
}

export default {
  saveClassificationReport,
  getRecentClassificationReports,
  getCityClassificationReports,
  isDuplicateReport,
  saveWeatherReport,
  getRecentWeatherReports,
}

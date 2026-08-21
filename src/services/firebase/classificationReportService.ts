import { getDb } from './firebaseConfig'

// saveClassificationReport, isDuplicateReport, getCityClassificationReports, ClassificationReport
// y getRecentClassificationReports eliminados en REF-003/REF-004: ClassificationReportModal era
// huerfano (no montado), classification_reports en Firestore nunca se escribia. Ver D-046/D-047.

/**
 * Guardar reporte de clima real observado en tabla predictiva
 * Escribe en coleccion 'weather_reports' (distinta de 'classification_reports')
 * Usado por WeatherReportModal (boton reporte en PredictionAnalysisTable)
 */
export async function saveWeatherReport(
  cityId: string,
  cityName: string,
  predictedCondition: string,
  reportedCondition: string,
  queryTime: string | Date,
  source: 'prediction-table' | 'location-detail' = 'prediction-table',
  knownDateHour?: string
): Promise<string> {
  const { collection, addDoc, Timestamp } = await import('firebase/firestore')
  const db = await getDb()

  try {
    if (!db) {
      throw new Error('Firebase no inicializado')
    }

    const now = Timestamp.now()
    const ttlDate = new Date(now.toDate().getTime() + 30 * 24 * 60 * 60 * 1000)

    let queryTimeDate: Date
    if (typeof queryTime === 'string') {
      queryTimeDate = new Date(queryTime)
    } else if (queryTime instanceof Date) {
      queryTimeDate = queryTime
    } else {
      queryTimeDate = new Date()
    }

    let dateHour: string
    if (knownDateHour) {
      dateHour = knownDateHour
    } else {
      const reportNextHour = new Date(queryTimeDate)
      reportNextHour.setHours(reportNextHour.getHours() + 1, 0, 0, 0)
      const yyyy = reportNextHour.getFullYear()
      const mm = String(reportNextHour.getMonth() + 1).padStart(2, '0')
      const dd = String(reportNextHour.getDate()).padStart(2, '0')
      const hh = String(reportNextHour.getHours()).padStart(2, '0')
      dateHour = `${yyyy}-${mm}-${dd}-${hh}`
    }

    const report = {
      city_id: cityId,
      city_name: cityName,
      timestamp: now,
      date_hour: dateHour,
      predicted_condition: predictedCondition,
      reported_condition: reportedCondition,
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

export interface WeatherReport {
  city_id: string
  city_name: string
  date_hour: string
  predicted_condition: string
  reported_condition: string
  timestamp: { seconds: number; nanoseconds: number }
}

/**
 * Obtener reportes de clima real (weather_reports) para columna REAL de tabla predictiva
 * y para calculo de metricas de precision (US-1201).
 */
export async function getAllWeatherReports(): Promise<WeatherReport[]> {
  const { collection, getDocs } = await import('firebase/firestore')
  const db = await getDb()
  if (!db) return []
  try {
    const snap = await getDocs(collection(db, 'weather_reports'))
    return snap.docs.map(doc => {
      const d = doc.data()
      return {
        city_id: d.city_id,
        city_name: d.city_name ?? '',
        date_hour: d.date_hour,
        predicted_condition: d.predicted_condition ?? '',
        reported_condition: d.reported_condition,
        timestamp: d.timestamp,
      }
    })
  } catch (err) {
    console.error('[Firebase] Error al leer todos los weather reports:', err)
    return []
  }
}

export async function getRecentWeatherReports(
  hours: number = 24
): Promise<WeatherReport[]> {
  const { collection, getDocs, query, where, Timestamp } = await import('firebase/firestore')
  const db = await getDb()

  try {
    if (!db) {
      console.warn('[Firebase] Firestore not initialized, returning empty weather reports')
      return []
    }

    const minDate = new Timestamp(
      Math.floor((Date.now() - hours * 60 * 60 * 1000) / 1000),
      0
    )

    const q = query(
      collection(db, 'weather_reports'),
      where('timestamp', '>=', minDate)
    )
    const snap = await getDocs(q)

    const reports = snap.docs.map((doc) => {
      const d = doc.data()
      return {
        city_id: d.city_id,
        city_name: d.city_name ?? '',
        date_hour: d.date_hour,
        predicted_condition: d.predicted_condition ?? '',
        reported_condition: d.reported_condition,
        timestamp: d.timestamp,
      }
    })

    console.log(`[Firebase] ✅ Loaded ${reports.length} weather reports from last ${hours}h`)
    return reports
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al leer weather reports:', err)
    return []
  }
}


import { getDb } from './firebaseConfig'

// saveClassificationReport, isDuplicateReport, getCityClassificationReports y ClassificationReport
// eliminados en REF-003 (2026-06-14): ClassificationReportModal era huerfano (no montado),
// classification_reports en Firestore nunca se escribia. Ver D-046 en decision-log.

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

/**
 * Obtener reportes de clima real (weather_reports) para columna REAL de tabla predictiva
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

    const allReports = await getDocs(collection(db, 'weather_reports'))

    const filtered = allReports.docs
      .map((doc) => ({
        city_id: doc.data().city_id,
        date_hour: doc.data().date_hour,
        reported_condition: doc.data().reported_condition,
      }))
      .filter((report) => {
        const docData = allReports.docs.find(
          (d) => d.data().city_id === report.city_id && d.data().date_hour === report.date_hour
        )?.data()
        return docData?.timestamp >= minDate
      })

    console.log(`[Firebase] ✅ Loaded ${filtered.length} weather reports from last ${hours}h`)
    return filtered
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al leer weather reports:', err)
    return []
  }
}

/**
 * Leer classification_reports (coleccion legacy — siempre vacia, clasificaciones
 * nunca se escribieron porque ClassificationReportModal estaba sin montar).
 * Se mantiene para compatibilidad con predictionAnalyticsService hasta REF-003 completo.
 */
export async function getRecentClassificationReports(
  hours: number = 24
): Promise<Array<{ city_id: string; date_hour: string; classified_as: string; should_be: string }>> {
  const { collection, getDocs, Timestamp } = await import('firebase/firestore')
  const db = await getDb()

  try {
    const minDate = new Timestamp(
      Math.floor((Date.now() - hours * 60 * 60 * 1000) / 1000),
      0
    )

    if (!db) return []

    const allReports = await getDocs(collection(db, 'classification_reports'))

    return allReports.docs
      .map((doc) => ({
        city_id: doc.data().city_id,
        date_hour: doc.data().date_hour,
        classified_as: doc.data().classified_as,
        should_be: doc.data().should_be,
        timestamp: doc.data().timestamp,
      }))
      .filter((r) => r.timestamp >= minDate)
  } catch (err) {
    console.error('[Firebase] ⚠️ Error al leer classification reports:', err)
    return []
  }
}

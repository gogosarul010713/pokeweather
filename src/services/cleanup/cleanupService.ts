import * as cacheService from '../cache/cacheService'
import { getDb } from '../firebase/firebaseConfig'

export interface CleanupOptions {
  nullSnapshots: boolean
  olderThan7d: boolean
  allIndexedDb: boolean
  allLocalStorage: boolean
  cascadeDeleteAll: boolean
}

export interface CleanupCounts {
  nullDocs: number
  oldDocs: number
  cacheSize: string
  cascadeDocs: number
  reportsDocs: number
}

export interface CleanupResults {
  firestore: { deleted: number; reportsDeleted: number; error: string | null }
  indexedDb: { deleted: number; error: string | null }
  localStorage: { cleared: boolean; error: string | null }
}

/**
 * Obtiene conteos de datos a limpiar (para preview en modal)
 * @returns Promesa con counts de docs NULL, viejos, cascade, y tamaño caché
 */
export const fetchCleanupCounts = async (): Promise<CleanupCounts> => {
  try {
    const db = await getDb()
    const { collection, query, where, getDocs, collectionGroup } = await import('firebase/firestore')

    // Query 1: Docs sin snapshots (snapshots array vacío)
    let nullDocsCount = 0
    try {
      const nullQuery = query(
        collectionGroup(db, 'forecasts'),
        where('snapshots', '==', [])
      )
      const nullDocs = await getDocs(nullQuery)
      nullDocsCount = nullDocs.size
    } catch {
      nullDocsCount = 0
    }

    // Query 2: Docs > 7 días
    let oldDocsCount = 0
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { Timestamp } = await import('firebase/firestore')
      const timestamp = Timestamp.fromDate(sevenDaysAgo)

      const oldQuery = query(
        collectionGroup(db, 'forecasts'),
        where('created_at', '<', timestamp)
      )
      const oldDocs = await getDocs(oldQuery)
      oldDocsCount = oldDocs.size
    } catch {
      oldDocsCount = 0
    }

    // Query 3: Cascade delete total (NUEVA - count de city_weather)
    let cascadeDocsCount = 0
    try {
      const cascadeQuery = await getDocs(collection(db, 'city_weather'))
      cascadeDocsCount = cascadeQuery.size
    } catch {
      cascadeDocsCount = 0
    }

    // Tamaño de caché local
    const cacheSize = await cacheService.getIndexedDbSize()

    // Query 4: Count de weather_reports + classification_reports (D-035)
    let reportsCount = 0
    try {
      const [wrDocs, crDocs] = await Promise.all([
        getDocs(collection(db, 'weather_reports')),
        getDocs(collection(db, 'classification_reports')),
      ])
      reportsCount = wrDocs.size + crDocs.size
    } catch {
      reportsCount = 0
    }

    return {
      nullDocs: nullDocsCount,
      oldDocs: oldDocsCount,
      cacheSize,
      cascadeDocs: cascadeDocsCount,
      reportsDocs: reportsCount,
    }
  } catch (error) {
    console.error('Failed to fetch cleanup counts:', error)
    return {
      nullDocs: 0,
      oldDocs: 0,
      cacheSize: '0 MB',
      cascadeDocs: 0,
      reportsDocs: 0,
    }
  }
}

/**
 * Ejecuta la limpieza selectiva según opciones elegidas
 * @param options Opciones a limpiar (nullSnapshots, olderThan7d, allIndexedDb, allLocalStorage)
 * @returns Promesa con resultados detallados por layer
 */
export const executeCleanup = async (options: CleanupOptions): Promise<CleanupResults> => {
  const results: CleanupResults = {
    firestore: { deleted: 0, reportsDeleted: 0, error: null },
    indexedDb: { deleted: 0, error: null },
    localStorage: { cleared: false, error: null },
  }

  try {
    // 1. Limpieza IndexedDB (local)
    if (options.allIndexedDb) {
      try {
        const { deletedRecords } = await cacheService.cleanupAllIndexedDb()
        results.indexedDb.deleted = deletedRecords
      } catch (error) {
        results.indexedDb.error = (error as Error).message
      }
    }

    // 2. Limpieza localStorage (local)
    if (options.allLocalStorage) {
      try {
        cacheService.cleanupAllLocalStorage()
        results.localStorage.cleared = true
      } catch (error) {
        results.localStorage.error = (error as Error).message
      }
    }

    // 3. Limpieza Firestore (cloud)
    if (options.nullSnapshots || options.olderThan7d || options.cascadeDeleteAll) {
      try {
        await getDb() // Ensure Firebase is initialized
        const apiKey = import.meta.env.VITE_CRON_SECRET

        if (!apiKey) {
          throw new Error('VITE_CRON_SECRET not configured. Check .env.local')
        }

        // Call HTTP endpoint directly with API Key header
        const cloudFunctionUrl = 'https://us-central1-weather-app-prod-ef50d.cloudfunctions.net/clearFirestoreData'

        const payload = {
          nullSnapshots: options.nullSnapshots,
          olderThan7d: options.olderThan7d,
          cascadeDeleteAll: options.cascadeDeleteAll,
        }

        console.log('🔍 Calling Cloud Function via HTTP endpoint')
        console.log('   URL:', cloudFunctionUrl)
        console.log('   Payload:', payload)
        console.log('   API Key:', apiKey.substring(0, 10) + '...')

        const response = await fetch(cloudFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          let errorData: any
          try {
            errorData = await response.json()
          } catch {
            errorData = { message: await response.text() }
          }

          console.error('❌ Cloud Function error response:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          })

          throw new Error(
            `HTTP ${response.status}: ${errorData.message || errorData.error || 'Unknown error'}`
          )
        }

        const data = await response.json()
        console.log('✅ Cloud Function response:', data)
        console.log('   Deleted:', data.deletedCount, 'documents')
        console.log('   Reports deleted:', data.reportsDeleted ?? 0, '(D-035)')
        results.firestore.deleted = data.deletedCount ?? 0
        results.firestore.reportsDeleted = data.reportsDeleted ?? 0
      } catch (error) {
        console.error('❌ Cloud Function error:', error)
        results.firestore.error = (error as Error).message
      }
    }

    // Validar que al menos uno fue exitoso
    const hadErrors =
      results.firestore.error || results.indexedDb.error || results.localStorage.error
    const hadSuccess =
      results.firestore.deleted > 0 ||
      results.indexedDb.deleted > 0 ||
      results.localStorage.cleared

    if (hadErrors && !hadSuccess) {
      throw new Error('Cleanup failed completely. Please try again.')
    }

    return results
  } catch (error) {
    throw new Error(`Cleanup failed: ${(error as Error).message}`)
  }
}

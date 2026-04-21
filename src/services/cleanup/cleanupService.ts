import { httpsCallable, getFunctions } from 'firebase/functions'
import * as cacheService from '../cache/cacheService'
import { getDb } from '../firebase/firebaseConfig'

export interface CleanupOptions {
  nullSnapshots: boolean
  olderThan7d: boolean
  allIndexedDb: boolean
  allLocalStorage: boolean
}

export interface CleanupCounts {
  nullDocs: number
  oldDocs: number
  cacheSize: string
}

export interface CleanupResults {
  firestore: { deleted: number; error: string | null }
  indexedDb: { deleted: number; error: string | null }
  localStorage: { cleared: boolean; error: string | null }
}

/**
 * Obtiene conteos de datos a limpiar (para preview en modal)
 * @returns Promesa con counts de docs NULL, viejos, y tamaño caché
 */
export const fetchCleanupCounts = async (): Promise<CleanupCounts> => {
  try {
    // Contar docs sin snapshots en Firestore
    const db = await getDb()
    const { collection, query, where, getDocs } = await import('firebase/firestore')

    // Query 1: Docs sin snapshots (snapshots array vacío)
    let nullDocsCount = 0
    try {
      const nullQuery = query(
        collection(db, 'city_weather'),
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
        collection(db, 'city_weather'),
        where('created_at', '<', timestamp)
      )
      const oldDocs = await getDocs(oldQuery)
      oldDocsCount = oldDocs.size
    } catch {
      oldDocsCount = 0
    }

    // Tamaño de caché local
    const cacheSize = await cacheService.getIndexedDbSize()

    return {
      nullDocs: nullDocsCount,
      oldDocs: oldDocsCount,
      cacheSize,
    }
  } catch (error) {
    console.error('Failed to fetch cleanup counts:', error)
    return {
      nullDocs: 0,
      oldDocs: 0,
      cacheSize: '0 MB',
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
    firestore: { deleted: 0, error: null },
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
    if (options.nullSnapshots || options.olderThan7d) {
      try {
        await getDb() // Ensure Firebase is initialized
        const functions = getFunctions()
        const clearFirestore = httpsCallable(functions, 'clearFirestoreData')

        const response = await clearFirestore({
          nullSnapshots: options.nullSnapshots,
          olderThan7d: options.olderThan7d,
        })

        results.firestore.deleted = (response.data as any).deletedCount ?? 0
      } catch (error) {
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

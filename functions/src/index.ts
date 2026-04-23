import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import { syncWeatherLogic } from './syncWeatherLogic.js'

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

// ────────────────────────────────────────────────────────────────────
// SCHEDULED TRIGGER: Executes automatically at HH:15 UTC every day
// ────────────────────────────────────────────────────────────────────
export const syncWeatherScheduled = functions.pubsub
  .schedule('15 * * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log(`[${new Date().toISOString()}] Scheduled sync triggered`)
      const result = await syncWeatherLogic()
      console.log(`[${new Date().toISOString()}] Scheduled sync completed:`, result)
      return result
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled sync error:`, error)
      throw error
    }
  })

// ────────────────────────────────────────────────────────────────────
// HTTP TRIGGER: Manual endpoint for testing (requires CRON_SECRET)
// ────────────────────────────────────────────────────────────────────
export const syncWeatherManual = functions.https.onRequest(
  async (req, res) => {
    // Verify CRON_SECRET from header
    const secret = req.headers['x-cron-secret']
    const expectedSecret = process.env.CRON_SECRET

    if (!secret || !expectedSecret || secret !== expectedSecret) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing x-cron-secret header',
      })
      return
    }

    try {
      console.log(`[${new Date().toISOString()}] Manual sync triggered`)
      const result = await syncWeatherLogic()
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Manual sync error:`, error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    }
  }
)

// ────────────────────────────────────────────────────────────────────
// HTTP ENDPOINT: Cleanup Firestore data (secured with API key header)
// ────────────────────────────────────────────────────────────────────
interface ClearFirestoreRequest {
  nullSnapshots?: boolean
  olderThan7d?: boolean
  cascadeDeleteAll?: boolean
}

export const clearFirestoreData = functions.https.onRequest(
  async (req, res) => {
    // CORS headers — required for all responses including preflight
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key')

    // Handle CORS preflight — must respond 204 before auth check
    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }

    // Verify API key from header
    const apiKey = req.headers['x-api-key'] as string
    const expectedApiKey = process.env.CLEANUP_SECRET

    if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
      console.error('[clearFirestoreData] Unauthorized - missing or invalid API key')
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid x-api-key header',
      })
      return
    }

    // Parse body if it's a string (Firebase doesn't auto-parse JSON)
    let data: ClearFirestoreRequest
    try {
      if (typeof req.body === 'string') {
        data = JSON.parse(req.body) as ClearFirestoreRequest
      } else {
        data = req.body as ClearFirestoreRequest
      }
    } catch (parseError) {
      console.error('[clearFirestoreData] Invalid JSON body:', req.body, parseError)
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid JSON in request body',
      })
      return
    }

    console.log('[clearFirestoreData] Authorized with API key, data:', data)

    let totalDeleted = 0
    const startTime = Date.now()
    const operationType = data.cascadeDeleteAll ? 'cascade' : data.nullSnapshots ? 'null' : 'ttl'

    try {
      // Batch delete con chunking (máx 500 ops por batch)
      const executeBatchDelete = async (docs: any[]) => {
        let batch = db.batch()
        let batchCount = 0

        for (const doc of docs) {
          batch.delete(doc.ref)
          batchCount++

          // Commit cada 500 operaciones
          if (batchCount >= 500) {
            await batch.commit()
            batch = db.batch()
            batchCount = 0
          }
        }

        // Commit final
        if (batchCount > 0) {
          await batch.commit()
        }

        return docs.length
      }

      // 1. Cascade delete TODO /city_weather + subcoleccion forecasts
      // Firestore NO elimina subcolecciones automaticamente al borrar el padre
      if (data.cascadeDeleteAll) {
        // Primero eliminar todos los docs de la subcoleccion forecasts
        const allForecasts = await db.collectionGroup('forecasts').get()
        const forecastsDeleted = await executeBatchDelete(allForecasts.docs)

        // Luego eliminar los documentos raiz de city_weather
        const allCityDocs = await db.collection('city_weather').get()
        const cityDocsDeleted = await executeBatchDelete(allCityDocs.docs)

        totalDeleted = forecastsDeleted + cityDocsDeleted
        console.log('[clearFirestoreData] cascade:', { forecastsDeleted, cityDocsDeleted })
      }

      // 2. Delete docs with empty snapshots (D-018)
      // Note: array equality filter requires composite index — fetch all and filter in memory instead
      if (data.nullSnapshots && !data.cascadeDeleteAll) {
        const allForecasts = await db.collectionGroup('forecasts').get()
        const nullDocs = allForecasts.docs.filter(doc => {
          const snapshots = doc.data().snapshots
          return !snapshots || (Array.isArray(snapshots) && snapshots.length === 0)
        })
        totalDeleted = await executeBatchDelete(nullDocs)
      }

      // 3. Delete docs older than 7 days
      if (data.olderThan7d && !data.cascadeDeleteAll) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const timestamp = admin.firestore.Timestamp.fromDate(sevenDaysAgo)

        const oldSnapshot = await db
          .collectionGroup('forecasts')
          .where('created_at', '<', timestamp)
          .get()

        totalDeleted = await executeBatchDelete(oldSnapshot.docs)
      }

      const duration = Date.now() - startTime

      // Audit logging
      console.log('[CLEANUP_SUCCESS]', {
        type: operationType,
        deleted: totalDeleted,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      })

      res.status(200).json({
        success: true,
        deletedCount: totalDeleted,
        message: `Successfully deleted ${totalDeleted} documents`,
      })
    } catch (error) {
      // Error logging
      console.error('[CLEANUP_ERROR]', {
        type: operationType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Cleanup failed',
      })
    }
  }
)

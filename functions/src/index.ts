import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
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
        success: true,
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
// CALLABLE FUNCTION: Cleanup Firestore data (requires authentication)
// ────────────────────────────────────────────────────────────────────
interface ClearFirestoreRequest {
  nullSnapshots: boolean
  olderThan7d: boolean
}

export const clearFirestoreData = functions.https.onCall(
  async (data: ClearFirestoreRequest, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      )
    }

    let totalDeleted = 0

    try {
      // 1. Delete docs with empty snapshots (D-018)
      if (data.nullSnapshots) {
        const nullSnapshot = await db
          .collectionGroup('forecasts')
          .where('snapshots', '==', [])
          .get()

        const batch = db.batch()
        nullSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref)
        })
        await batch.commit()
        totalDeleted += nullSnapshot.size
      }

      // 2. Delete docs older than 7 days
      if (data.olderThan7d) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const timestamp = admin.firestore.Timestamp.fromDate(sevenDaysAgo)

        const oldSnapshot = await db
          .collectionGroup('forecasts')
          .where('created_at', '<', timestamp)
          .get()

        const batch = db.batch()
        oldSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref)
        })
        await batch.commit()
        totalDeleted += oldSnapshot.size
      }

      return {
        success: true,
        deletedCount: totalDeleted,
        message: `Successfully deleted ${totalDeleted} documents`,
      }
    } catch (error) {
      console.error('Firestore cleanup error:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
)

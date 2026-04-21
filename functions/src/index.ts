import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { syncWeatherLogic } from './syncWeatherLogic.js'

// Initialize Firebase Admin
admin.initializeApp()

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

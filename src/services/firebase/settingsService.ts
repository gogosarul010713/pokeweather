/**
 * settingsService — User settings persistence in Firestore
 * Handles auto-sync toggle and other app preferences
 */

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDb } from './firebaseConfig'

const SETTINGS_DOC = 'app-config'
const SETTINGS_COLLECTION = 'settings'

/**
 * Initialize settings document with defaults if it doesn't exist
 * Called on app startup to ensure /settings/app-config exists
 * Handles backward compatibility: if doc exists, preserves existing values
 */
export async function initializeSettings(): Promise<void> {
  try {
    const db = await getDb()
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)

    // Use merge: true to preserve existing fields if doc already exists
    await setDoc(
      settingsRef,
      {
        autoSyncEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    )

    console.log('[settingsService] Settings initialized with merge strategy')
  } catch (error) {
    console.error('[settingsService] Error initializing settings:', error)
    // Non-fatal: if this fails, app still works with defaults
  }
}

/**
 * Get auto-sync setting from Firestore
 * Returns default true if document doesn't exist (backward compatibility)
 */
export async function getAutoSyncSetting(): Promise<boolean> {
  try {
    const db = await getDb()
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
    const snapshot = await getDoc(settingsRef)

    if (!snapshot.exists()) {
      console.log('[settingsService] Settings doc not found, using default: true')
      await initializeSettings()
      return true
    }

    const value = snapshot.data()?.autoSyncEnabled ?? true
    console.log(`[settingsService] getAutoSyncSetting: ${value}`)
    return value
  } catch (error) {
    console.error('[settingsService] Error getting auto-sync setting:', error)
    return true
  }
}

/**
 * Update auto-sync setting in Firestore
 * Called when user toggles the UI control
 * Updates timestamp for audit trail
 */
export async function updateAutoSyncSetting(enabled: boolean): Promise<void> {
  try {
    const db = await getDb()
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)

    await setDoc(
      settingsRef,
      {
        autoSyncEnabled: enabled,
        updatedAt: new Date(),
      },
      { merge: true }
    )

    console.log(
      `[settingsService] Updated autoSyncEnabled to ${enabled} at ${new Date().toISOString()}`
    )
  } catch (error) {
    console.error('[settingsService] Error updating auto-sync setting:', error)
    throw error
  }
}

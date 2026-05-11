/**
 * Firebase configuration — Lazy Singleton Pattern (US-901)
 * Credentials from environment variables (VITE_FIREBASE_*)
 * Safe for frontend: APIKey is restricted in Firebase Console
 *
 * Firebase SDK is dynamically imported on first access.
 * This reduces main bundle size (890KB → ~300KB lazy-loaded).
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate that required env vars are set
const requiredEnvVars = [
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
]

const missingVars = requiredEnvVars.filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
)

if (missingVars.length > 0) {
  console.warn(
    `⚠️ Firebase: Missing environment variables: ${missingVars.join(', ')}`,
    'Weather persistence will not be available. Check .env.local'
  )
}

// ─── Lazy Singleton State ────────────────────────────────────────────────

let app: ReturnType<typeof import('firebase/app').initializeApp> | null = null
let db: ReturnType<typeof import('firebase/firestore').getFirestore> | null = null
let auth: ReturnType<typeof import('firebase/auth').getAuth> | null = null
let initialized = false
let authReady = false
let initPromise: Promise<void> | null = null

// ─── Lazy Initialization ─────────────────────────────────────────────────

/**
 * Ensure Firebase is initialized (lazy singleton pattern)
 * First call triggers dynamic import + initialization.
 * Subsequent calls reuse the same instance.
 *
 * @returns Promise<void> — resolves when Firebase is ready (or fails silently if env vars missing)
 */
async function ensureInitialized(): Promise<void> {
  // Already initialized
  if (initialized) return

  // Initialization in progress — wait for it
  if (initPromise) return initPromise

  // Start initialization
  initPromise = (async () => {
    try {
      if (!firebaseConfig.projectId) {
        console.warn('[Firebase] Skipping initialization: projectId not set')
        initialized = true
        return
      }

      // Dynamic import Firebase modules
      const { initializeApp: initApp } = await import('firebase/app')
      const { getFirestore: getFs } = await import('firebase/firestore')
      const { getAuth, signInAnonymously } = await import('firebase/auth')

      // Initialize
      app = initApp(firebaseConfig)
      db = getFs(app)
      auth = getAuth(app)

      // Enable Anonymous auth for cleanup functions
      try {
        const result = await signInAnonymously(auth)
        authReady = true
        console.log('✅ Anonymous auth signed in:', result.user?.uid)
      } catch (e) {
        authReady = false
        console.error('❌ Anonymous auth failed:', (e as Error).message, e)
      }

      initialized = true

      console.log('✅ Firebase initialized (lazy):', firebaseConfig.projectId)
      console.log('   Auth ready:', authReady, '| User:', auth.currentUser?.uid)
    } catch (error) {
      console.error('❌ Firebase initialization failed (lazy):', error)
      initialized = true
      // Don't rethrow — allow app to continue without Firebase
    }
  })()

  return initPromise
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Get Firestore instance (triggers lazy initialization if needed)
 * @returns Firestore instance or null if initialization failed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDb(): Promise<any> {
  await ensureInitialized()
  return db
}

/**
 * Get Firebase app instance (triggers lazy initialization if needed)
 * @returns Firebase app instance or null if initialization failed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getApp(): Promise<any> {
  await ensureInitialized()
  return app
}

/**
 * Get Auth instance (triggers lazy initialization if needed)
 * @returns Auth instance or null if initialization failed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAuth_Instance(): Promise<any> {
  await ensureInitialized()
  return auth
}

/**
 * Check if Anonymous auth is ready
 * @returns true if signInAnonymously() succeeded
 */
export async function isAuthReady(): Promise<boolean> {
  await ensureInitialized()
  return authReady
}

// ─── Backward Compatibility (Deprecated) ─────────────────────────────────

/**
 * @deprecated Use getDb() instead
 * These are lazy getters that may be null until first await getDb() call
 */
export { app, db }

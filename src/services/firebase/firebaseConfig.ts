import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

/**
 * Firebase configuration
 * Credentials from environment variables (VITE_FIREBASE_*)
 * Safe for frontend: APIKey is restricted in Firebase Console
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

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null
let db: ReturnType<typeof getFirestore> | null = null

try {
  if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    console.log('✅ Firebase initialized:', firebaseConfig.projectId)
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error)
}

export { app, db }

#!/usr/bin/env npx tsx
/**
 * scripts/seedWeatherCatalog.ts
 * Seed script para popular /weather_catalog en Firestore
 *
 * Uso: npx tsx scripts/seedWeatherCatalog.ts
 *
 * Carga:
 * - /weather_catalog/conditions (7 condiciones + AccuWeather codes)
 * - /weather_catalog/type_mapping (condition → Pokémon types)
 * - /weather_catalog/rules (WINDY override, dedup, version)
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import * as dotenv from 'dotenv'

// Cargar .env.local
dotenv.config({ path: '.env.local' })

// ─── Firebase Config ──────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

// Validar que Firebase esté configurado
const missingVars = [
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
].filter((key) => !process.env[key])

if (missingVars.length > 0) {
  console.error(
    `❌ ERROR: Missing Firebase env vars: ${missingVars.join(', ')}`
  )
  console.error('   Update .env.local with Firebase credentials')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ─── Catalog Data ─────────────────────────────────────────────────────────────

// Extraído de weatherService.ts — fuente de verdad
const CONDITIONS = {
  sunny: {
    label: 'Soleado',
    emoji: '☀️',
    accuweather_codes: [1, 2, 30, 33, 34], // Día: 1,2,30 | Noche: 33,34
  },
  partly: {
    label: 'Parcialmente nublado',
    emoji: '⛅',
    accuweather_codes: [3, 4, 35, 36], // Día: 3,4 | Noche: 35,36
  },
  cloudy: {
    label: 'Nublado',
    emoji: '☁️',
    accuweather_codes: [5, 6, 7, 8, 13, 16, 20, 23, 37, 38, 40, 42], // Día: 5,6,7,8,13,16,20,23 | Noche: 37,38,40,42
  },
  fog: {
    label: 'Niebla',
    emoji: '🌫️',
    accuweather_codes: [11],
  },
  rain: {
    label: 'Lluvia',
    emoji: '🌧️',
    accuweather_codes: [12, 14, 15, 17, 18, 26, 29, 39, 41], // Día: 12,14,15,17,18,26,29 | Noche: 39,41
  },
  snow: {
    label: 'Nieve',
    emoji: '❄️',
    accuweather_codes: [19, 21, 22, 24, 25, 31, 43, 44], // Día: 19,21,22,24,25,31 | Noche: 43,44
  },
  windy: {
    label: 'Ventoso',
    emoji: '💨',
    threshold_wind_kmh: 29,
    threshold_gust_kmh: 31,
    note: 'No es un código AccuWeather — se aplica por umbral de viento',
  },
}

const TYPE_MAPPING = {
  sunny: ['fire', 'ground', 'grass'],
  partly: ['normal', 'rock'],
  cloudy: ['fairy', 'fighting', 'poison'],
  fog: ['ghost', 'dark'],
  rain: ['water', 'electric', 'bug'],
  snow: ['ice', 'steel'],
  windy: ['flying', 'dragon', 'psychic'],
}

const RULES = {
  windy_override: {
    description:
      'WINDY reemplaza sunny/partly/cloudy/rain si viento >= threshold',
    base_conditions_replaceable: ['sunny', 'partly', 'cloudy'],
    never_replaces: ['fog', 'rain', 'snow'],
    threshold_wind_kmh: 29,
    threshold_gust_kmh: 31,
  },
  dedup: {
    max_types_displayed: 4,
    description:
      'Si una ciudad tiene múltiples condiciones, se muestran máx 4 tipos únicos',
  },
  version: '1.0.0',
  last_updated: new Date().toISOString().split('T')[0], // YYYY-MM-DD
}

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seedWeatherCatalog() {
  try {
    console.log('🌍 Seeding /weather_catalog...')
    console.log('   Project:', firebaseConfig.projectId)
    console.log()

    // 1. Upload conditions
    console.log('📝 Uploading /weather_catalog/conditions...')
    await setDoc(doc(db, 'weather_catalog', 'conditions'), CONDITIONS, {
      merge: false,
    })
    console.log('   ✅ Conditions saved (7 weather states)')

    // 2. Upload type mapping
    console.log('📝 Uploading /weather_catalog/type_mapping...')
    await setDoc(doc(db, 'weather_catalog', 'type_mapping'), TYPE_MAPPING, {
      merge: false,
    })
    console.log('   ✅ Type mapping saved (7 conditions)')

    // 3. Upload rules
    console.log('📝 Uploading /weather_catalog/rules...')
    await setDoc(doc(db, 'weather_catalog', 'rules'), RULES, {
      merge: false,
    })
    console.log('   ✅ Rules saved (WINDY, dedup, version)')

    console.log()
    console.log('✅ ========================================')
    console.log('   Weather Catalog Seeding Complete!')
    console.log('   ========================================')
    console.log()
    console.log('📊 Data uploaded:')
    console.log('   • /weather_catalog/conditions')
    console.log('   • /weather_catalog/type_mapping')
    console.log('   • /weather_catalog/rules')
    console.log()
    console.log('🔍 Verify in Firestore Console:')
    console.log(`   https://console.firebase.google.com/project/${firebaseConfig.projectId}`)
    console.log()

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

seedWeatherCatalog()

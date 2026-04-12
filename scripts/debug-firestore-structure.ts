#!/usr/bin/env node
/**
 * scripts/debug-firestore-structure.ts
 * Script de DEBUG para entender la estructura real de Firestore
 *
 * Objetivo: Ver qué documentos existen y qué campos tienen
 * (sin filtros que puedan ocultar datos)
 */

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

async function initializeFirebase() {
  try {
    const serviceAccountPath = path.resolve(process.cwd(), '.env.serviceAccountKey.json')

    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ .env.serviceAccountKey.json not found')
      process.exit(1)
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'))

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || serviceAccount.project_id,
    })

    console.log('✅ Firebase initialized\n')
    return admin.firestore()
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🔍 DEBUG: Firestore Structure\n')
  const db = await initializeFirebase()

  // ─────────────────────────────────────────────────────────────────
  // 1. Ver documentos en city_weather (TOP LEVEL)
  // ─────────────────────────────────────────────────────────────────
  console.log('═'.repeat(80))
  console.log('📍 LEVEL 1: city_weather (cities)')
  console.log('═'.repeat(80))

  const citiesSnap = await db.collection('city_weather').get()
  console.log(`\n✅ Found ${citiesSnap.size} city documents:\n`)

  for (const cityDoc of citiesSnap.docs) {
    const cityData = cityDoc.data()
    console.log(`   🏙️  ${cityDoc.id}`)
    console.log(`       - city_name: ${cityData.city_name}`)
    console.log(`       - lat: ${cityData.lat}, lon: ${cityData.lon}`)
    console.log(`       - keys in doc: ${Object.keys(cityData).join(', ')}`)
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. Ver structure de CADA ciudad (subcollections)
  // ─────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(80))
  console.log('📍 LEVEL 2: city_weather/{city_id}/forecasts (subcollection)')
  console.log('═'.repeat(80))

  let totalForecastDocs = 0

  for (const cityDoc of citiesSnap.docs) {
    const forecastsSnap = await cityDoc.ref.collection('forecasts').get()

    console.log(`\n   🏙️  ${cityDoc.id}`)
    console.log(`       📊 ${forecastsSnap.size} forecast documents`)

    if (forecastsSnap.size > 0) {
      // Mostrar primer documento completo
      const firstForecast = forecastsSnap.docs[0]
      const forecastData = firstForecast.data()

      console.log(`\n       📄 Sample (first document):`)
      console.log(`          ID: ${firstForecast.id}`)
      console.log(`          Fields:`)

      Object.entries(forecastData).forEach(([key, value]) => {
        if (typeof value === 'object' && value?.constructor?.name === 'Timestamp') {
          console.log(`            - ${key}: [Timestamp] ${value.toDate().toISOString()}`)
        } else if (Array.isArray(value)) {
          console.log(
            `            - ${key}: [Array] ${value.length} items ${typeof value[0] === 'string' ? `["${value[0]}", ...]` : '[...]'}`
          )
        } else if (typeof value === 'object') {
          console.log(`            - ${key}: [Object] ${JSON.stringify(value).substring(0, 50)}...`)
        } else {
          console.log(`            - ${key}: ${value}`)
        }
      })

      // Mostrar todos los docs de esta ciudad
      console.log(`\n       All documents in this city:`)
      forecastsSnap.docs.forEach((doc, idx) => {
        const data = doc.data()
        console.log(
          `          ${idx + 1}. ${doc.id} - snapshots: ${(data.snapshots || []).length}, created_at: ${data.created_at ? '✅' : '❌'}`
        )
      })

      totalForecastDocs += forecastsSnap.size
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. Intentar collectionGroup query (como en el script original)
  // ─────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(80))
  console.log('📍 LEVEL 3: collectionGroup("forecasts") query')
  console.log('═'.repeat(80))

  console.log('\n   🔍 Query sin filtros:')
  const allForecastsSnap = await db.collectionGroup('forecasts').limit(10).get()
  console.log(`   Found: ${allForecastsSnap.size} documents (limit 10)`)

  console.log('\n   🔍 Query CON filtro (created_at >= 24h ago):')
  const minDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const filteredSnap = await db
    .collectionGroup('forecasts')
    .where('created_at', '>=', admin.firestore.Timestamp.fromDate(minDate))
    .limit(10)
    .get()

  console.log(`   Found: ${filteredSnap.size} documents`)
  if (filteredSnap.size === 0) {
    console.log(`   ⚠️  No documents matched. Check if created_at field exists and is recent.`)
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. Ver weather_catalog
  // ─────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(80))
  console.log('📍 LEVEL 1: weather_catalog')
  console.log('═'.repeat(80))

  const catalogSnap = await db.collection('weather_catalog').get()
  console.log(`\n✅ Found ${catalogSnap.size} catalog documents:\n`)

  for (const doc of catalogSnap.docs) {
    const data = doc.data()
    const keys = Object.keys(data)
    console.log(`   📄 ${doc.id}`)
    console.log(`       Keys: ${keys.length > 5 ? keys.slice(0, 5).join(', ') + '...' : keys.join(', ')}`)

    if (doc.id === 'conditions') {
      const conditionKeys = Object.keys(data)
      console.log(`       Conditions: ${conditionKeys.join(', ')}`)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. SUMMARY
  // ─────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(80))
  console.log('📊 SUMMARY')
  console.log('═'.repeat(80))

  console.log(`\n📈 Statistics:`)
  console.log(`   - Cities with city_weather docs: ${citiesSnap.size}`)
  console.log(`   - Total forecast documents: ${totalForecastDocs}`)
  console.log(`   - Catalog documents: ${catalogSnap.size}`)

  console.log(`\n⚠️  If forecast count is 0:`)
  console.log(`   - Check if forecasts subcollection exists in Firebase Console`)
  console.log(`   - Check if snapshots are being saved by the app`)
  console.log(`   - Check batchWeatherService.ts → saveCityForecast() logs`)

  console.log(`\n✅ Next step:`)
  console.log(`   - Run the app: npm run dev`)
  console.log(`   - Load some cities to trigger forecast persistence`)
  console.log(`   - Re-run: npm run validate:firebase`)

  process.exit(0)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

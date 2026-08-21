#!/usr/bin/env node
/**
 * scripts/validate-firestore.ts
 * Validación de datos en Firestore para US-801 (pronósticos) y US-802 (catálogo)
 *
 * Uso:
 *   npm run validate:firebase
 *   npx tsx scripts/validate-firestore.ts
 *
 * Requiere:
 *   VITE_FIREBASE_PROJECT_ID en .env.local
 *   .env.serviceAccountKey.json (credenciales, NO commitear)
 */

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

// ─────────────────────────────────────────────────────────────────────────────

interface ValidationResult {
  section: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: Record<string, unknown>
}

const results: ValidationResult[] = []

// ─────────────────────────────────────────────────────────────────────────────
// INIT FIREBASE
// ─────────────────────────────────────────────────────────────────────────────

async function initializeFirebase() {
  try {
    // Cargar credenciales desde archivo
    const serviceAccountPath = path.resolve(process.cwd(), '.env.serviceAccountKey.json')

    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ ERROR: .env.serviceAccountKey.json not found')
      console.error(`   Expected at: ${serviceAccountPath}`)
      console.error('   To get it: Firebase Console → Project Settings → Service Accounts → Generate Key')
      process.exit(1)
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'))

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || serviceAccount.project_id,
    })

    console.log('✅ Firebase initialized')
    return admin.firestore()
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error)
    process.exit(1)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// US-801: VALIDAR PRONÓSTICOS
// ─────────────────────────────────────────────────────────────────────────────

async function validateUS801(db: admin.firestore.Firestore) {
  console.log('\n📊 Validating US-801 (Pronósticos)...')

  try {
    // ⚠️ NOTE: city_weather collection appears to be empty or not accessible
    // Pero collectionGroup('forecasts') SÍ retorna documentos
    // Usar collectionGroup sin filtro created_at (evita error FAILED_PRECONDITION de índice)

    const forecastsSnap = await db
      .collectionGroup('forecasts')
      .orderBy('created_at', 'desc')
      .get()

    if (forecastsSnap.empty) {
      results.push({
        section: 'US-801',
        status: 'FAIL',
        message: 'No forecast documents found in any city',
      })
      console.log('   ❌ No forecasts found')
      return
    }

    const forecastCount = forecastsSnap.size
    const cityMap = new Map<string, {
      city_id: string
      city_name: string
      country: string
      region: string
      snapshot_count: number
      forecast_docs: number
      samples: unknown[]
    }>()

    let totalSnapshots = 0
    let totalIncompleteDocs = 0

    // Procesar cada documento forecast
    for (const forecastDoc of forecastsSnap.docs) {
      const data = forecastDoc.data()
      const snapshots = data.snapshots || []
      const cityId = data.city_id
      const cityName = data.city_name

      // Contar snapshots
      totalSnapshots += snapshots.length

      // Agrupar por ciudad
      if (!cityMap.has(cityId)) {
        cityMap.set(cityId, {
          city_id: cityId,
          city_name: cityName,
          country: data.country || 'unknown',
          region: data.region || 'unknown',
          snapshot_count: 0,
          forecast_docs: 0,
          samples: [],
        })
      }

      const cityEntry = cityMap.get(cityId)!
      cityEntry.snapshot_count += snapshots.length
      cityEntry.forecast_docs += 1
      if (cityEntry.samples.length < 2) {
        cityEntry.samples.push({
          doc_id: forecastDoc.id,
          snapshot_count: snapshots.length,
          created_at: data.created_at?.toDate?.().toISOString() || 'N/A',
        })
      }

      // Validar snapshots
      if (snapshots.length > 0) {
        const firstSnapshot = snapshots[0]
        if (!firstSnapshot.classified || !firstSnapshot.types || firstSnapshot.types.length === 0) {
          totalIncompleteDocs++
        }
      }
    }

    // Resumen
    const cityCount = cityMap.size
    const avgSnapshotsPerDoc = (totalSnapshots / forecastCount).toFixed(2)

    const cityDetails = Array.from(cityMap.values()).reduce(
      (acc, city) => {
        acc[city.city_name] = {
          city_id: city.city_id,
          country: city.country,
          region: city.region,
          forecast_documents: city.forecast_docs,
          total_snapshots: city.snapshot_count,
          avg_snapshots_per_doc: (city.snapshot_count / city.forecast_docs).toFixed(2),
          samples: city.samples,
        }
        return acc
      },
      {} as Record<string, unknown>
    )

    results.push({
      section: 'US-801',
      status: 'PASS',
      message: `Found ${forecastCount} forecast documents across ${cityCount} cities`,
      details: {
        cities: cityCount,
        total_forecast_documents: forecastCount,
        total_snapshots: totalSnapshots,
        avg_snapshots_per_doc: avgSnapshotsPerDoc,
        incomplete_docs: totalIncompleteDocs,
        city_details: cityDetails,
      },
    })

    console.log(`   ✅ ${cityCount} cities found`)
    console.log(`   ✅ ${forecastCount} forecast documents`)
    console.log(`   ✅ ${totalSnapshots} total snapshots (avg ${avgSnapshotsPerDoc} per doc)`)
    if (totalIncompleteDocs > 0) {
      console.log(`   ⚠️  ${totalIncompleteDocs} documents with incomplete snapshots`)
    }
  } catch (error: unknown) {
    // Fallback si hay error con índices (FAILED_PRECONDITION)
    if (error?.code === 9 || error?.details?.includes('FAILED_PRECONDITION')) {
      console.log('   ⚠️  Index not available, retrying without orderBy...')

      try {
        const forecastsSnap = await db.collectionGroup('forecasts').get()

        if (forecastsSnap.empty) {
          results.push({
            section: 'US-801',
            status: 'FAIL',
            message: 'No forecast documents found (even without filters)',
          })
          console.log('   ❌ No forecasts found')
          return
        }

        const forecastCount = forecastsSnap.size
        const cityMap = new Map<string, unknown>()
        let totalSnapshots = 0

        for (const forecastDoc of forecastsSnap.docs) {
          const data = forecastDoc.data()
          const snapshots = data.snapshots || []
          const cityId = data.city_id

          totalSnapshots += snapshots.length

          if (!cityMap.has(cityId)) {
            cityMap.set(cityId, {
              city_id: cityId,
              city_name: data.city_name,
              forecast_docs: 0,
              snapshot_count: 0,
            })
          }

          const entry = cityMap.get(cityId)
          entry.forecast_docs += 1
          entry.snapshot_count += snapshots.length
        }

        const cityCount = cityMap.size

        results.push({
          section: 'US-801',
          status: 'PASS',
          message: `Found ${forecastCount} forecast documents across ${cityCount} cities (fallback query)`,
          details: {
            cities: cityCount,
            total_forecast_documents: forecastCount,
            total_snapshots: totalSnapshots,
            note: 'Query executed without orderBy due to missing index',
          },
        })

        console.log(`   ✅ ${cityCount} cities found (fallback)`)
        console.log(`   ✅ ${forecastCount} forecast documents`)
        console.log(`   ✅ ${totalSnapshots} total snapshots`)
        return
      } catch (fallbackError) {
        results.push({
          section: 'US-801',
          status: 'FAIL',
          message: `Error validating pronósticos (even fallback failed): ${fallbackError}`,
        })
        console.log(`   ❌ Error: ${fallbackError}`)
      }
    } else {
      results.push({
        section: 'US-801',
        status: 'FAIL',
        message: `Error validating pronósticos: ${error}`,
      })
      console.log(`   ❌ Error: ${error}`)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// US-802: VALIDAR CATÁLOGO ESTÁTICO
// ─────────────────────────────────────────────────────────────────────────────

async function validateUS802(db: admin.firestore.Firestore) {
  console.log('\n📊 Validating US-802 (Catálogo)...')

  try {
    const EXPECTED_CONDITIONS = ['sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy']
    let catalogStatus = 'PASS'
    const catalogDetails: Record<string, unknown> = {}

    // ─ Validar Condiciones
    console.log('   Checking conditions...')
    const conditionsDoc = await db.collection('weather_catalog').doc('conditions').get()

    if (!conditionsDoc.exists) {
      catalogStatus = 'FAIL'
      results.push({
        section: 'US-802-conditions',
        status: 'FAIL',
        message: 'Document weather_catalog/conditions not found',
      })
      console.log('   ❌ conditions document not found')
    } else {
      const conditions = Object.keys(conditionsDoc.data() || {})
      const missingConditions = EXPECTED_CONDITIONS.filter(c => !conditions.includes(c))

      if (missingConditions.length > 0) {
        catalogStatus = 'WARN'
        console.log(`   ⚠️  Missing conditions: ${missingConditions.join(', ')}`)
      } else {
        console.log(`   ✅ All 7 conditions present`)
      }

      catalogDetails.conditions = {
        found: conditions.length,
        expected: EXPECTED_CONDITIONS.length,
        missing: missingConditions,
        items: conditions,
      }
    }

    // ─ Validar Type Mapping
    console.log('   Checking type_mapping...')
    const typeMappingDoc = await db.collection('weather_catalog').doc('type_mapping').get()

    if (!typeMappingDoc.exists) {
      catalogStatus = 'FAIL'
      results.push({
        section: 'US-802-types',
        status: 'FAIL',
        message: 'Document weather_catalog/type_mapping not found',
      })
      console.log('   ❌ type_mapping document not found')
    } else {
      const typeMapping = typeMappingDoc.data() || {}
      const mappedConditions = Object.keys(typeMapping)
      const allTypesFlat = Object.values(typeMapping).flatMap((types: unknown) =>
        Array.isArray(types) ? types : []
      )
      const uniqueTypes = [...new Set(allTypesFlat)]

      console.log(`   ✅ Type mapping for ${mappedConditions.length} conditions`)
      console.log(`   ✅ ${uniqueTypes.length} unique Pokémon types`)

      catalogDetails.type_mapping = {
        conditions_mapped: mappedConditions.length,
        expected_conditions: EXPECTED_CONDITIONS.length,
        unique_types: uniqueTypes.length,
        sample_types: uniqueTypes.slice(0, 5),
      }
    }

    // ─ Validar Rules
    console.log('   Checking rules...')
    const rulesDoc = await db.collection('weather_catalog').doc('rules').get()

    if (!rulesDoc.exists) {
      catalogStatus = 'FAIL'
      results.push({
        section: 'US-802-rules',
        status: 'FAIL',
        message: 'Document weather_catalog/rules not found',
      })
      console.log('   ❌ rules document not found')
    } else {
      const rules = rulesDoc.data() || {}
      const version = rules.version || 'unknown'

      console.log(`   ✅ Rules version: ${version}`)

      if (rules.windy_override && rules.dedup) {
        console.log(`   ✅ Rules structure valid`)
      } else {
        catalogStatus = 'WARN'
        console.log(`   ⚠️  Rules structure incomplete`)
      }

      catalogDetails.rules = {
        version,
        has_windy_override: !!rules.windy_override,
        has_dedup: !!rules.dedup,
        last_updated: rules.last_updated || 'unknown',
      }
    }

    results.push({
      section: 'US-802',
      status: catalogStatus as 'PASS' | 'FAIL' | 'WARN',
      message: 'Catálogo estático validado',
      details: catalogDetails,
    })
  } catch (error) {
    results.push({
      section: 'US-802',
      status: 'FAIL',
      message: `Error validating catálogo: ${error}`,
    })
    console.log(`   ❌ Error: ${error}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAR REPORTE
// ─────────────────────────────────────────────────────────────────────────────

function generateReport() {
  console.log('\n' + '═'.repeat(80))
  console.log('📋 VALIDATION REPORT')
  console.log('═'.repeat(80))

  const now = new Date().toISOString().split('T')[0]
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warned = results.filter(r => r.status === 'WARN').length

  console.log(`\nDate: ${now}`)
  console.log(`Passed: ✅ ${passed}`)
  console.log(`Failed: ❌ ${failed}`)
  console.log(`Warned: ⚠️  ${warned}`)

  // Detalles
  console.log('\n' + '─'.repeat(80))
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`\n${icon} [${r.section}] ${r.message}`)

    if (r.details) {
      console.log('   Details:')
      Object.entries(r.details).forEach(([key, value]) => {
        if (typeof value === 'object') {
          console.log(`     ${key}:`)
          console.log('       ' + JSON.stringify(value, null, 2).split('\n').join('\n       '))
        } else {
          console.log(`     ${key}: ${value}`)
        }
      })
    }
  })

  console.log('\n' + '═'.repeat(80))
  const allPassed = failed === 0
  const summary = allPassed ? '✅ ALL VALIDATIONS PASSED' : '❌ SOME VALIDATIONS FAILED'
  console.log(summary)
  console.log('═'.repeat(80) + '\n')

  // Guardar JSON
  const reportPath = path.resolve(process.cwd(), 'firebase-validation-report.json')
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        date: now,
        summary: {
          passed,
          failed,
          warned,
        },
        results,
      },
      null,
      2
    )
  )
  console.log(`📄 Report saved to: ${reportPath}`)

  process.exit(allPassed ? 0 : 1)
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔥 Firebase Validation Script')
  console.log('=' + '='.repeat(79) + '\n')

  const db = await initializeFirebase()

  await validateUS801(db)
  await validateUS802(db)

  generateReport()
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

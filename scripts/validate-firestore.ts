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
  details?: Record<string, any>
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
    const citiesSnap = await db.collection('city_weather').get()

    if (citiesSnap.empty) {
      results.push({
        section: 'US-801',
        status: 'FAIL',
        message: 'No city_weather documents found',
      })
      console.log('   ❌ No cities found')
      return
    }

    const cityCount = citiesSnap.size
    const cityDetails: Record<string, any> = {}
    let totalSnapshots = 0
    let snapshotsCompleteCount = 0

    for (const cityDoc of citiesSnap.docs) {
      const data = cityDoc.data()
      const snapshots = data.snapshots || []
      const isComplete = snapshots.length === 12
      const ttl = data.ttl?.toDate ? data.ttl.toDate() : new Date(data.ttl)
      const createdAt = data.created_at?.toDate
        ? data.created_at.toDate()
        : new Date(data.created_at)

      cityDetails[data.city_name] = {
        city_id: data.city_id,
        snapshots_count: snapshots.length,
        complete: isComplete,
        ttl: ttl.toISOString().split('T')[0],
        created_at: createdAt.toISOString(),
        types_sample: snapshots[0]?.types || [],
      }

      totalSnapshots += snapshots.length
      if (isComplete) snapshotsCompleteCount++

      // Validar cada snapshot
      if (snapshots.length > 0) {
        const firstSnapshot = snapshots[0]
        if (!firstSnapshot.classified || !firstSnapshot.types || firstSnapshot.types.length === 0) {
          results.push({
            section: 'US-801',
            status: 'WARN',
            message: `${data.city_name}: snapshot incompleto`,
            details: { snapshot: firstSnapshot },
          })
        }
      }
    }

    // Resumen
    const avgSnapshots = totalSnapshots / cityCount
    const completionPercent = ((snapshotsCompleteCount / cityCount) * 100).toFixed(1)

    results.push({
      section: 'US-801',
      status: 'PASS',
      message: `Found ${cityCount} cities with forecast data`,
      details: {
        cities: cityCount,
        total_snapshots: totalSnapshots,
        avg_snapshots_per_city: avgSnapshots.toFixed(2),
        complete_count: `${snapshotsCompleteCount}/${cityCount} (${completionPercent}%)`,
        city_details: cityDetails,
      },
    })

    console.log(`   ✅ ${cityCount} cities found`)
    console.log(`   ✅ ${totalSnapshots} total snapshots (avg ${avgSnapshots.toFixed(1)} per city)`)
    console.log(`   ✅ ${completionPercent}% complete (12 snapshots)`)
  } catch (error) {
    results.push({
      section: 'US-801',
      status: 'FAIL',
      message: `Error validating pronósticos: ${error}`,
    })
    console.log(`   ❌ Error: ${error}`)
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
    const catalogDetails: Record<string, any> = {}

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
      const allTypesFlat = Object.values(typeMapping).flatMap((types: any) =>
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

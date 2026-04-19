#!/usr/bin/env node
/**
 * scripts/clean-firestore.ts
 * Elimina TODOS los documentos de colecciones operacionales.
 * Preserva: weather_catalog (datos estáticos de configuración)
 *
 * Colecciones eliminadas:
 *   - city_weather/{city_id}/forecasts/* (pronósticos horarios)
 *   - classification_reports/*           (reportes de clasificación manual)
 *
 * Uso:
 *   npx tsx scripts/clean-firestore.ts
 *
 * Requiere:
 *   .env.serviceAccountKey.json en la raíz del proyecto
 *   (Firebase Console → Project Settings → Service Accounts → Generate Key)
 */

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

const BATCH_SIZE = 400 // Firestore max es 500, usamos 400 con margen

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

async function initFirebase(): Promise<admin.firestore.Firestore> {
  const keyPath = path.resolve(process.cwd(), '.env.serviceAccountKey.json')

  if (!fs.existsSync(keyPath)) {
    console.error('\n❌ .env.serviceAccountKey.json no encontrado.')
    console.error('   Genera uno en: Firebase Console → Project Settings → Service Accounts → Generate new private key')
    console.error(`   Guárdalo en: ${keyPath}\n`)
    process.exit(1)
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  const db = admin.firestore()
  console.log(`✅ Firebase conectado (proyecto: ${serviceAccount.project_id})`)
  return db
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Elimina todos los documentos de una query en batches.
 * Retorna el total de documentos eliminados.
 */
async function deleteQueryInBatches(
  db: admin.firestore.Firestore,
  query: admin.firestore.Query,
  label: string
): Promise<number> {
  let totalDeleted = 0

  while (true) {
    const snap = await query.limit(BATCH_SIZE).get()
    if (snap.empty) break

    const batch = db.batch()
    snap.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()

    totalDeleted += snap.size
    process.stdout.write(`\r   ${label}: ${totalDeleted} documentos eliminados...`)
  }

  process.stdout.write('\n')
  return totalDeleted
}

// ─────────────────────────────────────────────────────────────────────────────
// LIMPIAR city_weather (subcolecciones forecasts)
// ─────────────────────────────────────────────────────────────────────────────

async function cleanCityWeather(db: admin.firestore.Firestore): Promise<void> {
  console.log('\n🗑️  Limpiando city_weather → forecasts...')

  // 1. Obtener todos los documentos de forecast via collectionGroup
  const forecastQuery = db.collectionGroup('forecasts')
  const deleted = await deleteQueryInBatches(db, forecastQuery, 'forecasts')

  // 2. Eliminar documentos raíz de city_weather (los padres {city_id})
  const citySnap = await db.collection('city_weather').get()
  if (!citySnap.empty) {
    const batch = db.batch()
    citySnap.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
    console.log(`   city_weather (raíz): ${citySnap.size} documentos eliminados`)
  }

  console.log(`✅ city_weather limpiado — ${deleted} forecasts + ${citySnap.size} docs raíz`)
}

// ─────────────────────────────────────────────────────────────────────────────
// LIMPIAR classification_reports
// ─────────────────────────────────────────────────────────────────────────────

async function cleanClassificationReports(db: admin.firestore.Firestore): Promise<void> {
  console.log('\n🗑️  Limpiando classification_reports...')

  const query = db.collection('classification_reports')
  const deleted = await deleteQueryInBatches(db, query, 'classification_reports')

  console.log(`✅ classification_reports limpiado — ${deleted} documentos`)
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICACIÓN POST-LIMPIEZA
// ─────────────────────────────────────────────────────────────────────────────

async function verifyClean(db: admin.firestore.Firestore): Promise<void> {
  console.log('\n🔍 Verificación post-limpieza...')

  const [forecastsSnap, reportsSnap, catalogSnap] = await Promise.all([
    db.collectionGroup('forecasts').limit(1).get(),
    db.collection('classification_reports').limit(1).get(),
    db.collection('weather_catalog').limit(1).get(),
  ])

  const forecastOk = forecastsSnap.empty
  const reportsOk  = reportsSnap.empty
  const catalogOk  = !catalogSnap.empty

  console.log(`   forecasts:              ${forecastOk ? '✅ vacío' : '⚠️  aún tiene documentos'}`)
  console.log(`   classification_reports: ${reportsOk  ? '✅ vacío' : '⚠️  aún tiene documentos'}`)
  console.log(`   weather_catalog:        ${catalogOk  ? '✅ preservado (no tocado)' : '⚠️  parece vacío'}`)

  if (!forecastOk || !reportsOk) {
    console.log('\n⚠️  Algunos documentos pueden quedar por TTL o demora de índices. Vuelve a ejecutar si es necesario.')
  } else {
    console.log('\n🎉 Firestore limpiado correctamente.')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║  Firestore Clean — Pokémon Weather Explorer  ║')
  console.log('║  Preserva: weather_catalog                   ║')
  console.log('║  Elimina:  city_weather, classification_reports ║')
  console.log('╚══════════════════════════════════════════════╝')

  const db = await initFirebase()

  await cleanCityWeather(db)
  await cleanClassificationReports(db)
  await verifyClean(db)

  process.exit(0)
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err)
  process.exit(1)
})

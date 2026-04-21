#!/usr/bin/env node
/**
 * scripts/clean-firestore.ts
 * Limpia colecciones operacionales de Firestore.
 * Preserva: weather_catalog (datos estáticos de configuración)
 *
 * Colecciones que puede eliminar:
 *   - city_weather/{city_id}/forecasts/* (pronósticos horarios)
 *   - classification_reports/*           (reportes de clasificación manual)
 *
 * Uso:
 *   npx tsx scripts/clean-firestore.ts [OPTIONS]
 *
 * Opciones:
 *   --all              Limpia city_weather + classification_reports (default)
 *   --only-city        Solo limpia city_weather/{city_id}/forecasts/
 *   --only-reports     Solo limpia classification_reports/
 *   --dry-run          Simula la limpieza sin hacer cambios reales
 *   --skip-verify      Salta la verificación post-limpieza (más rápido)
 *   --help             Muestra esta ayuda
 *
 * Ejemplos:
 *   npx tsx scripts/clean-firestore.ts                  # limpia TODO (default)
 *   npx tsx scripts/clean-firestore.ts --only-city      # solo city_weather
 *   npx tsx scripts/clean-firestore.ts --only-reports   # solo reportes
 *   npx tsx scripts/clean-firestore.ts --dry-run        # simula sin cambios
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
// CLI ARGUMENT PARSING
// ─────────────────────────────────────────────────────────────────────────────

interface CleanOptions {
  cleanCityWeather: boolean
  cleanClassificationReports: boolean
  dryRun: boolean
  skipVerify: boolean
}

function parseArgs(): CleanOptions {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Firestore Clean — Pokémon Weather Explorer              ║
╚═══════════════════════════════════════════════════════════╝

OPCIONES:
  --all              Limpia city_weather + classification_reports (default)
  --only-city        Solo limpia city_weather/{city_id}/forecasts/
  --only-reports     Solo limpia classification_reports/
  --dry-run          Simula la limpieza sin hacer cambios reales
  --skip-verify      Salta la verificación post-limpieza (más rápido)
  --help             Muestra esta ayuda

EJEMPLOS:
  npx tsx scripts/clean-firestore.ts                  # limpia TODO
  npx tsx scripts/clean-firestore.ts --only-city      # solo city_weather
  npx tsx scripts/clean-firestore.ts --only-reports   # solo reportes
  npx tsx scripts/clean-firestore.ts --dry-run        # simula sin cambios

NOTA:
  weather_catalog (datos estáticos) NUNCA se toca.
    `)
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run')
  const skipVerify = args.includes('--skip-verify')

  let cleanCityWeather = true
  let cleanClassificationReports = true

  if (args.includes('--only-city')) {
    cleanClassificationReports = false
  } else if (args.includes('--only-reports')) {
    cleanCityWeather = false
  }

  return { cleanCityWeather, cleanClassificationReports, dryRun, skipVerify }
}

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
 *
 * @param dryRun - Si true, solo cuenta sin eliminar
 */
async function deleteQueryInBatches(
  db: admin.firestore.Firestore,
  query: admin.firestore.Query,
  label: string,
  dryRun: boolean = false
): Promise<number> {
  let totalDeleted = 0

  while (true) {
    const snap = await query.limit(BATCH_SIZE).get()
    if (snap.empty) break

    if (!dryRun) {
      const batch = db.batch()
      snap.docs.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
    }

    totalDeleted += snap.size
    const action = dryRun ? 'documentos encontrados' : 'documentos eliminados'
    process.stdout.write(`\r   ${label}: ${totalDeleted} ${action}...`)
  }

  process.stdout.write('\n')
  return totalDeleted
}

// ─────────────────────────────────────────────────────────────────────────────
// LIMPIAR city_weather (subcolecciones forecasts)
// ─────────────────────────────────────────────────────────────────────────────

async function cleanCityWeather(db: admin.firestore.Firestore, dryRun: boolean = false): Promise<void> {
  const action = dryRun ? 'Simulando limpieza de' : 'Limpiando'
  console.log(`\n🗑️  ${action} city_weather → forecasts...`)

  // 1. Obtener todos los documentos de forecast via collectionGroup
  const forecastQuery = db.collectionGroup('forecasts')
  const deleted = await deleteQueryInBatches(db, forecastQuery, 'forecasts', dryRun)

  // 2. Eliminar documentos raíz de city_weather (los padres {city_id})
  const citySnap = await db.collection('city_weather').get()
  if (!citySnap.empty) {
    if (!dryRun) {
      const batch = db.batch()
      citySnap.docs.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
    }
    const msg = dryRun ? 'encontrados' : 'eliminados'
    console.log(`   city_weather (raíz): ${citySnap.size} documentos ${msg}`)
  }

  const msg = dryRun ? 'SIMULADA' : 'completada'
  console.log(`✅ city_weather ${msg} — ${deleted} forecasts + ${citySnap.size} docs raíz`)
}

// ─────────────────────────────────────────────────────────────────────────────
// LIMPIAR classification_reports
// ─────────────────────────────────────────────────────────────────────────────

async function cleanClassificationReports(db: admin.firestore.Firestore, dryRun: boolean = false): Promise<void> {
  const action = dryRun ? 'Simulando limpieza de' : 'Limpiando'
  console.log(`\n🗑️  ${action} classification_reports...`)

  const query = db.collection('classification_reports')
  const deleted = await deleteQueryInBatches(db, query, 'classification_reports', dryRun)

  const msg = dryRun ? 'SIMULADA' : 'completada'
  console.log(`✅ classification_reports ${msg} — ${deleted} documentos`)
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICACIÓN POST-LIMPIEZA
// ─────────────────────────────────────────────────────────────────────────────

async function verifyClean(
  db: admin.firestore.Firestore,
  opts: CleanOptions
): Promise<void> {
  console.log('\n🔍 Verificación post-operación...')

  const [forecastsSnap, reportsSnap, catalogSnap] = await Promise.all([
    db.collectionGroup('forecasts').limit(1).get(),
    db.collection('classification_reports').limit(1).get(),
    db.collection('weather_catalog').limit(1).get(),
  ])

  const forecastOk = forecastsSnap.empty
  const reportsOk  = reportsSnap.empty
  const catalogOk  = !catalogSnap.empty

  if (opts.cleanCityWeather) {
    console.log(`   forecasts:              ${forecastOk ? '✅ vacío' : '⚠️  aún tiene documentos'}`)
  }
  if (opts.cleanClassificationReports) {
    console.log(`   classification_reports: ${reportsOk  ? '✅ vacío' : '⚠️  aún tiene documentos'}`)
  }
  console.log(`   weather_catalog:        ${catalogOk  ? '✅ preservado (no tocado)' : '⚠️  parece vacío'}`)

  if (opts.dryRun) {
    console.log('\nℹ️  DRY-RUN: Ningún cambio fue aplicado.')
  } else if (forecastOk && reportsOk) {
    console.log('\n🎉 Firestore limpiado correctamente.')
  } else if (!forecastOk || !reportsOk) {
    console.log('\n⚠️  Algunos documentos pueden quedar por TTL o demora de índices. Vuelve a ejecutar si es necesario.')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs()

  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  Firestore Clean — Pokémon Weather Explorer         ║')
  console.log('║  Preserva: weather_catalog (datos estáticos)        ║')
  if (opts.dryRun) {
    console.log('║  Modo: DRY-RUN (sin cambios reales)                 ║')
  }
  console.log('╚══════════════════════════════════════════════════════╝')

  // Mostrar qué se va a limpiar
  console.log('\n📋 Plan:')
  if (opts.cleanCityWeather) {
    console.log('   • city_weather/{city_id}/forecasts/')
  }
  if (opts.cleanClassificationReports) {
    console.log('   • classification_reports/')
  }
  if (!opts.cleanCityWeather && !opts.cleanClassificationReports) {
    console.log('   • (nada seleccionado)')
  }
  console.log()

  const db = await initFirebase()

  if (opts.cleanCityWeather) {
    await cleanCityWeather(db, opts.dryRun)
  }
  if (opts.cleanClassificationReports) {
    await cleanClassificationReports(db, opts.dryRun)
  }

  if (!opts.skipVerify) {
    await verifyClean(db, opts)
  } else if (opts.dryRun) {
    console.log('\nℹ️  DRY-RUN: Ningún cambio fue aplicado.')
  }

  process.exit(0)
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err)
  process.exit(1)
})

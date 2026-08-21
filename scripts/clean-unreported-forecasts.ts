#!/usr/bin/env node
/**
 * scripts/clean-unreported-forecasts.ts
 * Elimina forecasts de city_weather/{city_id}/forecasts/ que NO tienen
 * un reporte de clima real asociado (ni en weather_reports ni en
 * classification_reports). US-1202.
 *
 * Regla: por cada city_id + date_hour, si no existe reporte, el forecast
 * es elegible para borrar. Si existe reporte, se conserva siempre.
 *
 * Uso:
 *   npx tsx scripts/clean-unreported-forecasts.ts [OPTIONS]
 *
 * Opciones:
 *   --dry-run   Simula la limpieza sin hacer cambios reales
 *   --hours=N   Ventana de tiempo en horas (default: 24, igual que la tabla predictiva)
 *   --help      Muestra esta ayuda
 *
 * Ejemplos:
 *   npx tsx scripts/clean-unreported-forecasts.ts --dry-run
 *   npx tsx scripts/clean-unreported-forecasts.ts
 *   npx tsx scripts/clean-unreported-forecasts.ts --hours=48
 *
 * Requiere:
 *   .env.serviceAccountKey.json en la raíz del proyecto
 *   (Firebase Console → Project Settings → Service Accounts → Generate Key)
 */

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

const BATCH_SIZE = 400 // Firestore max es 500, usamos 400 con margen
const DEFAULT_HOURS = 24 // mismo rango que usa la tabla predictiva

// ─────────────────────────────────────────────────────────────────────────────
// CLI ARGUMENT PARSING
// ─────────────────────────────────────────────────────────────────────────────

interface Options {
  dryRun: boolean
  hours: number
}

function parseArgs(): Options {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Clean Unreported Forecasts — Pokémon Weather Explorer   ║
╚═══════════════════════════════════════════════════════════╝

OPCIONES:
  --dry-run   Simula la limpieza sin hacer cambios reales
  --hours=N   Ventana de tiempo en horas (default: ${DEFAULT_HOURS})
  --help      Muestra esta ayuda

EJEMPLOS:
  npx tsx scripts/clean-unreported-forecasts.ts --dry-run
  npx tsx scripts/clean-unreported-forecasts.ts
  npx tsx scripts/clean-unreported-forecasts.ts --hours=48

NOTA:
  weather_reports y classification_reports NUNCA se tocan.
  Solo se eliminan forecasts sin reporte asociado.
    `)
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run')
  const hoursArg = args.find(a => a.startsWith('--hours='))
  const hours = hoursArg ? parseInt(hoursArg.split('=')[1], 10) : DEFAULT_HOURS

  return { dryRun, hours: isNaN(hours) ? DEFAULT_HOURS : hours }
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
// LOGICA: construir indice de reportes existentes
// ─────────────────────────────────────────────────────────────────────────────

async function buildReportIndex(
  db: admin.firestore.Firestore,
  minDate: admin.firestore.Timestamp
): Promise<Set<string>> {
  const index = new Set<string>()

  const [weatherReportsSnap, classificationReportsSnap] = await Promise.all([
    db.collection('weather_reports').where('timestamp', '>=', minDate).get(),
    db.collection('classification_reports').where('timestamp', '>=', minDate).get(),
  ])

  weatherReportsSnap.docs.forEach(doc => {
    const d = doc.data()
    index.add(`${d.city_id}|${d.date_hour}`)
  })

  classificationReportsSnap.docs.forEach(doc => {
    const d = doc.data()
    index.add(`${d.city_id}|${d.date_hour}`)
  })

  return index
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGICA: identificar y eliminar forecasts sin reporte
// ─────────────────────────────────────────────────────────────────────────────

async function cleanUnreportedForecasts(
  db: admin.firestore.Firestore,
  opts: Options
): Promise<void> {
  const minDate = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - opts.hours * 60 * 60 * 1000)
  )

  console.log(`\n🔍 Analizando forecasts de las últimas ${opts.hours}h...`)

  const reportIndex = await buildReportIndex(db, minDate)
  console.log(`   Reportes encontrados: ${reportIndex.size} combinaciones city_id|date_hour`)

  // NOTA: Firestore requiere índice COLLECTION_GROUP para where() en collectionGroup.
  // Igual que getRecentForecasts() en firebaseWeatherService.ts, filtramos en memoria.
  const allForecastsSnap = await db.collectionGroup('forecasts').get()
  const forecastsInRange = allForecastsSnap.docs.filter(doc => {
    const ts = doc.data().created_at as admin.firestore.Timestamp | undefined
    return ts && ts.toMillis() >= minDate.toMillis()
  })
  console.log(`   Forecasts revisados: ${forecastsInRange.length}`)

  const toDelete: admin.firestore.QueryDocumentSnapshot[] = []
  const byCity = new Map<string, number>()

  forecastsInRange.forEach(doc => {
    const d = doc.data()
    const key = `${d.city_id}|${d.date_hour}`
    if (!reportIndex.has(key)) {
      toDelete.push(doc)
      byCity.set(d.city_id, (byCity.get(d.city_id) ?? 0) + 1)
    }
  })

  const conserved = forecastsInRange.length - toDelete.length

  console.log(`\n📋 Resultado:`)
  console.log(`   Con reporte (conservados): ${conserved}`)
  console.log(`   Sin reporte (elegibles):   ${toDelete.length}`)

  if (toDelete.length > 0) {
    console.log(`\n   Por ciudad:`)
    Array.from(byCity.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([cityId, count]) => {
        console.log(`     ${cityId}: ${count}`)
      })
  }

  if (opts.dryRun) {
    console.log('\nℹ️  DRY-RUN: Ningún cambio fue aplicado.')
    return
  }

  if (toDelete.length === 0) {
    console.log('\n✅ Nada que eliminar.')
    return
  }

  console.log(`\n🗑️  Eliminando ${toDelete.length} forecasts sin reporte...`)
  let deleted = 0
  for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
    const chunk = toDelete.slice(i, i + BATCH_SIZE)
    const batch = db.batch()
    chunk.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
    deleted += chunk.length
    process.stdout.write(`\r   ${deleted}/${toDelete.length} eliminados...`)
  }
  process.stdout.write('\n')

  console.log(`\n✅ Limpieza completada — ${deleted} forecasts eliminados.`)
  console.log('ℹ️  Si la app tiene cache local (IndexedDB), recarga para ver los cambios.')
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs()

  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  Clean Unreported Forecasts — Pokémon Weather Explorer ║')
  if (opts.dryRun) {
    console.log('║  Modo: DRY-RUN (sin cambios reales)                 ║')
  }
  console.log('╚══════════════════════════════════════════════════════╝')

  const db = await initFirebase()
  await cleanUnreportedForecasts(db, opts)

  process.exit(0)
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err)
  process.exit(1)
})

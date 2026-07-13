#!/usr/bin/env node
/**
 * scripts/migrate-clear-condition.ts
 * Corrige documentos historicos de Firestore donde iconos nocturnos despejados
 * (AccuWeather 33/34) fueron clasificados como pgo_condition: "sunny".
 * Los actualiza a pgo_condition: "clear" (D-050, US-1207).
 *
 * Uso:
 *   npx tsx scripts/migrate-clear-condition.ts [--dry-run]
 *
 * Opciones:
 *   --dry-run   Muestra los cambios sin aplicarlos
 *   --help      Muestra esta ayuda
 *
 * Requiere:
 *   .env.serviceAccountKey.json en la raiz del proyecto
 */

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

const BATCH_SIZE = 400
const ICONS_TO_MIGRATE = [33, 34]

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

async function initFirebase(): Promise<admin.firestore.Firestore> {
  const keyPath = path.resolve(process.cwd(), '.env.serviceAccountKey.json')

  if (!fs.existsSync(keyPath)) {
    console.error('\n❌ .env.serviceAccountKey.json no encontrado.')
    console.error('   Genera uno en: Firebase Console → Project Settings → Service Accounts → Generate new private key')
    console.error(`   Guardalo en: ${keyPath}\n`)
    process.exit(1)
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  const db = admin.firestore()
  console.log(`✅ Firebase conectado (proyecto: ${serviceAccount.project_id})`)
  return db
}

// ─────────────────────────────────────────────────────────────────────────────
// MIGRACION
// ─────────────────────────────────────────────────────────────────────────────

interface MigrationStats {
  docsScanned: number
  docsWithChanges: number
  snapshotsFixed: number
}

async function migrateClearCondition(
  db: admin.firestore.Firestore,
  dryRun: boolean
): Promise<MigrationStats> {
  const stats: MigrationStats = { docsScanned: 0, docsWithChanges: 0, snapshotsFixed: 0 }

  const forecastsSnap = await db.collectionGroup('forecasts').get()
  stats.docsScanned = forecastsSnap.size

  console.log(`\n📊 Documentos forecast encontrados: ${stats.docsScanned}`)

  let batch = db.batch()
  let batchCount = 0

  for (const doc of forecastsSnap.docs) {
    const data = doc.data()
    const snapshots: any[] = data.snapshots ?? []

    let changed = false
    const updatedSnapshots = snapshots.map((s: any) => {
      if (ICONS_TO_MIGRATE.includes(s.icon_code) && s.pgo_condition === 'sunny') {
        changed = true
        stats.snapshotsFixed++
        return { ...s, pgo_condition: 'clear' }
      }
      return s
    })

    if (!changed) continue

    stats.docsWithChanges++

    if (dryRun) {
      const fixedCount = snapshots.filter(
        (s: any) => ICONS_TO_MIGRATE.includes(s.icon_code) && s.pgo_condition === 'sunny'
      ).length
      console.log(`   [DRY-RUN] ${doc.ref.path} — ${fixedCount} snapshots a corregir`)
      continue
    }

    batch.update(doc.ref, { snapshots: updatedSnapshots })
    batchCount++

    if (batchCount >= BATCH_SIZE) {
      await batch.commit()
      process.stdout.write(`\r   Commits aplicados: ${stats.docsWithChanges} docs...`)
      batch = db.batch()
      batchCount = 0
    }
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit()
    process.stdout.write('\n')
  }

  return stats
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    console.log(`
Migracion clear condition — Pokemon Weather Explorer

Corrige snapshots donde icon_code IN [33, 34] y pgo_condition === "sunny"
actualizandolos a pgo_condition: "clear" (D-050).

OPCIONES:
  --dry-run   Muestra cambios sin aplicarlos
  --help      Muestra esta ayuda

EJEMPLOS:
  npx tsx scripts/migrate-clear-condition.ts --dry-run   # preview
  npx tsx scripts/migrate-clear-condition.ts             # ejecutar en DEV
    `)
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run')

  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  Migracion clear condition — Pokemon Weather         ║')
  console.log(`║  Modo: ${dryRun ? 'DRY-RUN (sin cambios reales)          ' : 'REAL — aplicara cambios en Firestore  '}║`)
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('\nTarget: snapshots con icon_code IN [33, 34] y pgo_condition === "sunny"')
  console.log('Accion: pgo_condition "sunny" → "clear"\n')

  const db = await initFirebase()
  const stats = await migrateClearCondition(db, dryRun)

  console.log('\n─── Resultado ───────────────────────────────────────')
  console.log(`  Documentos escaneados:    ${stats.docsScanned}`)
  console.log(`  Documentos con cambios:   ${stats.docsWithChanges}`)
  console.log(`  Snapshots corregidos:     ${stats.snapshotsFixed}`)

  if (dryRun) {
    console.log('\nℹ️  DRY-RUN: ningun cambio fue aplicado.')
    console.log('   Ejecuta sin --dry-run para aplicar la migracion.')
  } else {
    console.log('\n✅ Migracion completada.')
  }

  process.exit(0)
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * scripts/monitor-firebase.ts
 * Monitorea Firestore en tiempo real cada 30 minutos
 * Valida schema y detecta problemas automáticamente
 *
 * Uso:
 *   npm run monitor:firebase
 *   (corre continuamente hasta Ctrl+C)
 */

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

interface MonitorResult {
  timestamp: string
  cities: number
  totalDocs: number
  totalSnapshots: number
  errors: string[]
  warnings: string[]
  docsByCity: Record<string, number>
}

const MONITOR_INTERVAL = 30 * 60 * 1000 // 30 minutos
const RESULTS_FILE = path.resolve(process.cwd(), 'firebase-monitor.log')

// ─────────────────────────────────────────────────────────────────────────────

async function initFirebase(): Promise<admin.firestore.Firestore> {
  const keyPath = path.resolve(process.cwd(), '.env.serviceAccountKey.json')
  if (!fs.existsSync(keyPath)) {
    console.error('❌ .env.serviceAccountKey.json no encontrado')
    process.exit(1)
  }

  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
  return admin.firestore()
}

// ─────────────────────────────────────────────────────────────────────────────

async function checkFirebase(db: admin.firestore.Firestore): Promise<MonitorResult> {
  const timestamp = new Date().toISOString()
  const errors: string[] = []
  const warnings: string[] = []
  const docsByCity: Record<string, number> = {}
  let totalDocs = 0
  let totalSnapshots = 0

  // 1. Obtener ciudades
  const citySnapshot = await db.collection('city_weather').get()
  const cities = citySnapshot.docs.map(d => d.id)

  if (cities.length === 0) {
    warnings.push('Sin ciudades con pronósticos aún (post-limpieza)')
    return { timestamp, cities: 0, totalDocs: 0, totalSnapshots: 0, errors, warnings, docsByCity }
  }

  // 2. Validar cada ciudad
  for (const cityId of cities) {
    const forecastsRef = db.collection('city_weather').doc(cityId).collection('forecasts')
    const forecastSnapshot = await forecastsRef.get()
    const docCount = forecastSnapshot.size

    docsByCity[cityId] = docCount
    totalDocs += docCount

    forecastSnapshot.docs.forEach(doc => {
      const data = doc.data()
      const snapshots = (data.snapshots as unknown[]) || []
      totalSnapshots += snapshots.length

      // Validar snapshots
      if (!Array.isArray(snapshots)) {
        errors.push(`${cityId}/${doc.id}: 'snapshots' no es array`)
      } else if (snapshots.length !== 12) {
        errors.push(`${cityId}/${doc.id}: ${snapshots.length} snapshots (esperados 12)`)
      } else {
        // Validar estructura de cada snapshot
        snapshots.forEach((snap, idx) => {
          if (!snap.classified_condition) {
            errors.push(`${cityId}/${doc.id}[${idx}]: falta classified_condition`)
          }
        })
      }
    })

    // Detectar duplicados en la misma hora
    const hourMap = new Map<string, number>()
    forecastSnapshot.docs.forEach(doc => {
      const hour = doc.id // Formato: YYYY-MM-DD-HH
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
    })

    hourMap.forEach((count, hour) => {
      if (count > 1) {
        errors.push(`${cityId}: ${count} docs para hora ${hour} (duplicados)`)
      }
    })
  }

  // 3. Validación de volumen
  const expectedDocs = cities.length * 24 // Idealmente 1 doc por ciudad por hora en 24h

  if (totalDocs === 0) {
    warnings.push('Aún sin datos (app acaba de iniciar)')
  } else if (totalDocs < expectedDocs * 0.5) {
    warnings.push(`Datos incompletos: ${totalDocs}/${expectedDocs} docs esperados`)
  }

  return { timestamp, cities: cities.length, totalDocs, totalSnapshots, errors, warnings, docsByCity }
}

// ─────────────────────────────────────────────────────────────────────────────

function formatResult(result: MonitorResult): string {
  const lines = [
    `\n[${result.timestamp}]`,
    `Ciudades: ${result.cities}`,
    `Documentos: ${result.totalDocs}`,
    `Snapshots: ${result.totalSnapshots}`,
  ]

  // Detalles por ciudad
  if (Object.keys(result.docsByCity).length > 0) {
    lines.push(`Docs por ciudad: ${JSON.stringify(result.docsByCity)}`)
  }

  // Errores
  if (result.errors.length > 0) {
    lines.push(`❌ ERRORES (${result.errors.length}):`)
    result.errors.slice(0, 3).forEach(err => lines.push(`   • ${err}`))
    if (result.errors.length > 3) {
      lines.push(`   ... y ${result.errors.length - 3} más`)
    }
  }

  // Warnings
  if (result.warnings.length > 0) {
    lines.push(`⚠️  WARNINGS (${result.warnings.length}):`)
    result.warnings.forEach(w => lines.push(`   • ${w}`))
  }

  // Status
  if (result.errors.length === 0 && result.warnings.length === 0 && result.totalDocs > 0) {
    lines.push(`✅ Schema válido`)
  }

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const db = await initFirebase()

  console.log('╔════════════════════════════════════════╗')
  console.log('║  Firebase Monitor — Real-time Validator ║')
  console.log('║  Intervalo: cada 30 minutos             ║')
  console.log('║  Log: firebase-monitor.log              ║')
  console.log('║  Presiona Ctrl+C para detener           ║')
  console.log('╚════════════════════════════════════════╝\n')

  // Ejecutar primera validación inmediatamente
  console.log('🔍 Iniciando validación...\n')
  const result = await checkFirebase(db)
  const formatted = formatResult(result)
  console.log(formatted)

  // Guardar en log
  fs.appendFileSync(RESULTS_FILE, formatted + '\n' + '─'.repeat(50) + '\n')

  // Monitor continuo
  setInterval(async () => {
    const result = await checkFirebase(db)
    const formatted = formatResult(result)
    console.clear()
    console.log('╔════════════════════════════════════════╗')
    console.log('║  Firebase Monitor — Real-time Validator ║')
    console.log('╚════════════════════════════════════════╝')
    console.log(formatted)
    fs.appendFileSync(RESULTS_FILE, formatted + '\n' + '─'.repeat(50) + '\n')

    // Alerta si hay errores críticos
    if (result.errors.length > 0) {
      console.log('\n🚨 ALERTA: Se detectaron problemas en el schema!')
      console.log('   Revisa el log: firebase-monitor.log')
    }
  }, MONITOR_INTERVAL)

  // Mantener proceso vivo
  process.on('SIGINT', () => {
    console.log('\n\n👋 Monitor detenido.')
    console.log(`📋 Log guardado en: ${RESULTS_FILE}`)
    process.exit(0)
  })
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})

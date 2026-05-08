#!/usr/bin/env node
/**
 * scripts/validate-forecast-schema.ts
 * Valida que los pronósticos en Firestore cumplan el esquema esperado:
 * - 1 documento por ciudad por hora
 * - Cada documento tiene exactamente 12 snapshots (pronósticos de 12h)
 * - Estructura de datos válida
 *
 * Uso:
 *   npx tsx scripts/validate-forecast-schema.ts
 */

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

interface ValidationIssue {
  cityId: string
  hour: string
  issue: string
  severity: 'ERROR' | 'WARN' | 'INFO'
}

const issues: ValidationIssue[] = []
let totalDocuments = 0
const citiesChecked = new Set<string>()

// ─────────────────────────────────────────────────────────────────────────────

async function initFirebase(): Promise<admin.firestore.Firestore> {
  const keyPath = path.resolve(process.cwd(), '.env.serviceAccountKey.json')

  if (!fs.existsSync(keyPath)) {
    console.error('❌ .env.serviceAccountKey.json no encontrado')
    process.exit(1)
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  return admin.firestore()
}

// ─────────────────────────────────────────────────────────────────────────────

interface ForecastSnapshot {
  hour?: number
  temperature_c?: number
  classified_condition?: string
  confidence?: number
  // otros campos que puedan existir
  [key: string]: any
}

interface ForecastDoc {
  snapshots?: ForecastSnapshot[]
  created_at?: any
  expires_at?: any
  ttl?: any
  [key: string]: any
}

async function validateCityForecasts(
  db: admin.firestore.Firestore,
  cityId: string
): Promise<void> {
  console.log(`\n   📍 Validando ${cityId}...`)

  const forecastsRef = db.collection('city_weather').doc(cityId).collection('forecasts')
  const snapshot = await forecastsRef.get()

  if (snapshot.empty) {
    issues.push({
      cityId,
      hour: 'N/A',
      issue: 'Ciudad sin pronósticos',
      severity: 'WARN',
    })
    console.log(`      ⚠️  Sin pronósticos`)
    return
  }

  const docs = snapshot.docs
  const hourMap = new Map<string, number>()

  docs.forEach(doc => {
    totalDocuments++
    const docData = doc.data() as ForecastDoc
    const docId = doc.id // Formato esperado: YYYY-MM-DD-HH

    // Contar por hora
    hourMap.set(docId, (hourMap.get(docId) || 0) + 1)

    // Validar formato de ID
    if (!docId.match(/^\d{4}-\d{2}-\d{2}-\d{2}$/)) {
      issues.push({
        cityId,
        hour: docId,
        issue: `ID inválido. Esperado: YYYY-MM-DD-HH, recibido: ${docId}`,
        severity: 'ERROR',
      })
    }

    // Validar snapshots
    const snapshots = docData.snapshots as ForecastSnapshot[] | undefined
    if (!Array.isArray(snapshots)) {
      issues.push({
        cityId,
        hour: docId,
        issue: `Campo 'snapshots' no es un array. Tipo: ${typeof snapshots}`,
        severity: 'ERROR',
      })
      return
    }

    if (snapshots.length !== 12) {
      issues.push({
        cityId,
        hour: docId,
        issue: `${snapshots.length} snapshots encontrados. Esperados: 12`,
        severity: 'ERROR',
      })
    }

    // Validar cada snapshot
    snapshots.forEach((snap, idx) => {
      if (!snap.classified_condition) {
        issues.push({
          cityId,
          hour: docId,
          issue: `Snapshot ${idx}: falta 'classified_condition'`,
          severity: 'ERROR',
        })
      }
      if (typeof snap.hour !== 'number' || snap.hour < 0 || snap.hour > 23) {
        issues.push({
          cityId,
          hour: docId,
          issue: `Snapshot ${idx}: 'hour' inválido (${snap.hour}). Esperado: 0-23`,
          severity: 'ERROR',
        })
      }
      if (typeof snap.temperature_c !== 'number') {
        issues.push({
          cityId,
          hour: docId,
          issue: `Snapshot ${idx}: 'temperature_c' no es número`,
          severity: 'WARN',
        })
      }
    })
  })

  // Detectar duplicados (múltiples docs con el mismo hora)
  hourMap.forEach((count, hour) => {
    if (count > 1) {
      issues.push({
        cityId,
        hour,
        issue: `${count} documentos para la misma hora. Esperado: 1 (posible duplicado)`,
        severity: 'ERROR',
      })
    }
  })

  const docCount = docs.length
  const statusEmoji = issues.filter(i => i.cityId === cityId && i.severity === 'ERROR').length === 0 ? '✅' : '❌'
  console.log(`      ${statusEmoji} ${docCount} documentos`)
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗')
  console.log('║  Validación de Schema Forecast — Firestore         ║')
  console.log('║  Esperado: 1 doc/ciudad/hora con 12 snapshots     ║')
  console.log('╚═══════════════════════════════════════════════════╝')

  const db = await initFirebase()
  console.log('✅ Firebase conectado\n')

  // Obtener ciudades únicas
  console.log('📍 Obteniendo ciudades...')
  const citySnapshot = await db.collection('city_weather').get()

  if (citySnapshot.empty) {
    console.log('   ⚠️  No hay ciudades con pronósticos')
    process.exit(0)
  }

  const cities = citySnapshot.docs.map(d => d.id)
  console.log(`   Encontradas ${cities.length} ciudades\n`)

  console.log('🔍 Validando estructura...')
  for (const cityId of cities) {
    citiesChecked.add(cityId)
    await validateCityForecasts(db, cityId)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORTE
  // ─────────────────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(55))
  console.log('📊 REPORTE DE VALIDACIÓN')
  console.log('═'.repeat(55))

  console.log(`\nEstadísticas generales:`)
  console.log(`  • Ciudades analizadas: ${citiesChecked.size}`)
  console.log(`  • Documentos totales:  ${totalDocuments}`)
  console.log(`  • Pronósticos esperados: ${citiesChecked.size * 24 * 12} (24h/ciudad × 12 snapshots)`)

  const errors = issues.filter(i => i.severity === 'ERROR')
  const warns = issues.filter(i => i.severity === 'WARN')

  console.log(`\nProblemas encontrados:`)
  console.log(`  • Errores: ${errors.length}`)
  console.log(`  • Advertencias: ${warns.length}`)

  if (errors.length === 0 && warns.length === 0) {
    console.log('\n✅ Schema válido. Todos los datos cumplen la estructura esperada.')
    console.log('   (1 documento por ciudad/hora, 12 snapshots por documento)\n')
    process.exit(0)
  }

  // Agrupar por tipo de error
  if (errors.length > 0) {
    console.log('\n🔴 ERRORES:')
    const errorsByType = new Map<string, ValidationIssue[]>()
    errors.forEach(err => {
      const key = err.issue.split('\n')[0]
      if (!errorsByType.has(key)) errorsByType.set(key, [])
      errorsByType.get(key)!.push(err)
    })

    errorsByType.forEach((items, type) => {
      console.log(`\n  ${type}`)
      items.slice(0, 5).forEach(item => {
        console.log(`    • ${item.cityId} / ${item.hour}`)
      })
      if (items.length > 5) {
        console.log(`    ... y ${items.length - 5} más`)
      }
    })
  }

  if (warns.length > 0) {
    console.log('\n🟡 ADVERTENCIAS:')
    const warnsByType = new Map<string, ValidationIssue[]>()
    warns.forEach(w => {
      const key = w.issue.split('\n')[0]
      if (!warnsByType.has(key)) warnsByType.set(key, [])
      warnsByType.get(key)!.push(w)
    })

    warnsByType.forEach((items, type) => {
      console.log(`\n  ${type}`)
      items.slice(0, 3).forEach(item => {
        console.log(`    • ${item.cityId} / ${item.hour}`)
      })
      if (items.length > 3) {
        console.log(`    ... y ${items.length - 3} más`)
      }
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECOMENDACIONES
  // ─────────────────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(55))
  console.log('💡 RECOMENDACIONES')
  console.log('═'.repeat(55))

  const hasDuplicates = errors.some(e => e.issue.includes('Esperado: 1'))
  const hasWrongSnapshots = errors.some(e => e.issue.includes('snapshots encontrados'))
  const hasMalformedDocs = errors.some(e => e.issue.includes('no es un array'))

  if (hasDuplicates) {
    console.log(`\n⚠️  Se detectaron DUPLICADOS (múltiples docs para la misma hora).
   Esto indica que el sistema está guardando varias veces por hora.
   Causa probable: falta de deduplicación en batchWeatherService.ts`)
  }

  if (hasWrongSnapshots) {
    console.log(`\n⚠️  Se encontraron documentos con número incorrecto de snapshots.
   Esto indica que los pronósticos no se guardan completos (deberían ser 12h).
   Causa probable: AccuWeather API está retornando menos de 12 horas`)
  }

  if (hasMalformedDocs) {
    console.log(`\n⚠️  Se encontraron documentos con estructura inválida.
   Campo 'snapshots' debería ser un array pero no lo es.
   Causa probable: cambio en el schema de guardado`)
  }

  if (errors.length === 0 && warns.length === 0) {
    console.log(`\n✅ Sin problemas. El schema es correcto.`)
  }

  console.log()
  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err.message)
  process.exit(1)
})

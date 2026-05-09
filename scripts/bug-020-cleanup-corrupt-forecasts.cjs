/**
 * BUG-020 cleanup: borra docs en city_weather/{cityId}/forecasts/{dateHour}
 * con accuLocationKey == null (origen frontend dev, NO escritos por la CF).
 *
 * Uso:
 *   node scripts/bug-020-cleanup-corrupt-forecasts.cjs           # dry-run
 *   node scripts/bug-020-cleanup-corrupt-forecasts.cjs --apply   # borra real
 *
 * Requiere: gcloud auth application-default login (ya hecho).
 * Proyecto: weather-app-prod-ef50d
 */

const admin = require('firebase-admin')

const APPLY = process.argv.includes('--apply')
const PROJECT_ID = 'weather-app-prod-ef50d'

admin.initializeApp({ projectId: PROJECT_ID })
const db = admin.firestore()

;(async () => {
  console.log(`[BUG-020] Modo: ${APPLY ? 'APPLY (borra real)' : 'DRY-RUN'}`)
  console.log(`[BUG-020] Proyecto: ${PROJECT_ID}`)

  const citiesSnap = await db.collection('city_weather').get()
  console.log(`[BUG-020] Ciudades encontradas: ${citiesSnap.size}`)

  let totalCorrupt = 0
  let totalDeleted = 0
  const corruptByCity = {}

  for (const cityDoc of citiesSnap.docs) {
    const cityId = cityDoc.id
    const forecastsSnap = await db
      .collection('city_weather')
      .doc(cityId)
      .collection('forecasts')
      .get()

    const corruptDocs = []
    forecastsSnap.forEach((d) => {
      const data = d.data() || {}
      // Heurística: docs escritos por el frontend NO incluyen accuLocationKey.
      // Los escritos por la CF SÍ lo incluyen.
      if (data.accuLocationKey === undefined || data.accuLocationKey === null) {
        corruptDocs.push({ id: d.id, ref: d.ref })
      }
    })

    if (corruptDocs.length > 0) {
      corruptByCity[cityId] = corruptDocs.map((c) => c.id)
      totalCorrupt += corruptDocs.length

      if (APPLY) {
        const batches = []
        let batch = db.batch()
        let count = 0
        for (const doc of corruptDocs) {
          batch.delete(doc.ref)
          count++
          if (count === 400) {
            batches.push(batch.commit())
            batch = db.batch()
            count = 0
          }
        }
        if (count > 0) batches.push(batch.commit())
        await Promise.all(batches)
        totalDeleted += corruptDocs.length
        console.log(`[BUG-020] ✅ Borrados ${corruptDocs.length} docs en ${cityId}`)
      } else {
        console.log(`[BUG-020] DRY: ${cityId} -> ${corruptDocs.length} docs corruptos:`)
        corruptDocs.forEach((c) => console.log(`         - ${c.id}`))
      }
    }
  }

  console.log('\n[BUG-020] ─── Resumen ───')
  console.log(`Ciudades con corrupción: ${Object.keys(corruptByCity).length}`)
  console.log(`Docs corruptos detectados: ${totalCorrupt}`)
  if (APPLY) console.log(`Docs borrados: ${totalDeleted}`)
  else console.log('(dry-run, no se borró nada — re-correr con --apply)')

  console.log('\nDetalle por ciudad:')
  console.log(JSON.stringify(corruptByCity, null, 2))

  process.exit(0)
})().catch((err) => {
  console.error('[BUG-020] Error:', err)
  process.exit(1)
})

import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

async function analyze() {
  const keyPath = path.resolve(process.cwd(), '.env.serviceAccountKey.json')
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'))

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  const db = admin.firestore()

  console.log('Analizando estructura de documentos en Firestore...\n')

  const citySnapshot = await db.collection('city_weather').get()
  const cities = citySnapshot.docs.map(d => d.id)

  for (const cityId of cities.slice(0, 3)) { // Primeras 3 ciudades
    console.log(`\n📍 ${cityId.toUpperCase()}`)
    const forecastsRef = db.collection('city_weather').doc(cityId).collection('forecasts')
    const forecastSnapshot = await forecastsRef.get()

    console.log(`   Total documentos: ${forecastSnapshot.size}`)

    forecastSnapshot.docs.forEach((doc, idx) => {
      const data = doc.data()
      const snapshots = data.snapshots || []
      console.log(`\n   Doc ${idx + 1}:`)
      console.log(`     ID: ${doc.id}`)
      console.log(`     snapshots.length: ${snapshots.length}`)
      if (snapshots.length > 0) {
        console.log(`     First snapshot.hour: ${snapshots[0].hour}`)
        console.log(`     First snapshot.classified: ${snapshots[0].classified}`)
      }
    })
  }

  process.exit(0)
}

analyze().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

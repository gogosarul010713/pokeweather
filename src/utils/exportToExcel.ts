import { Workbook } from 'exceljs'
import type { City } from '../store/useStore'

interface ExportOptions {
  testNumber: 1 | 2 | 3
  timestamp: Date
}

/**
 * Exporta datos de ciudades a un archivo Excel con formato para testing de clima
 * El archivo puede ser abierto múltiples veces (3 iteraciones) en 3 pestañas diferentes
 */
export async function exportCitiesToExcel(cities: City[], options: ExportOptions): Promise<void> {
  const { testNumber, timestamp } = options

  // Formato de timestamp: "2026-03-26 14:30"
  const dateStr = timestamp.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const timeStr = timestamp.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const headerTimestamp = `${dateStr} ${timeStr}`

  // Crear libro Excel
  const workbook = new Workbook()

  // ─ Si el archivo ya existe en IndexedDB/localStorage (simular multi-iteración) ─
  // Por ahora creamos un libro nuevo con UNA pestaña
  // El usuario descargará 3 veces y combinará manualmente o guardaremos las 3 en mismo archivo

  const worksheet = workbook.addWorksheet(`Prueba ${testNumber}`)

  // ─ HEADER ─
  // Merge cells para título con timestamp
  worksheet.mergeCells('A1:D1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = `Prueba ${testNumber} — ${headerTimestamp}`
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF1F77E3' } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.getRow(1).height = 24

  // Fila vacía
  worksheet.getRow(2).height = 8

  // ─ ENCABEZADOS DE COLUMNAS ─
  const headers = [
    'Ciudad',
    'Clima',
    'Real',
    'Coordenadas',
    'IconID',
    'Viento (km/h)',
    'Ráfagas (km/h)',
    'Visibilidad (km)',
    'Cálculo',
  ]
  const headerRow = worksheet.getRow(3)
  headers.forEach((header, idx) => {
    const cell = headerRow.getCell(idx + 1)
    cell.value = header
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F77E3' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    }
  })
  headerRow.height = 20

  // ─ DATOS ─
  cities.forEach((city, idx) => {
    const rowNum = 4 + idx
    const row = worksheet.getRow(rowNum)

    // 1. Ciudad
    const cityCell = row.getCell(1)
    cityCell.value = city.name
    cityCell.alignment = { horizontal: 'left', vertical: 'middle' }

    // 2. Clima (nombre legible)
    const climaCell = row.getCell(2)
    climaCell.value = translateCondition(city.condition)
    climaCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // 3. Real (vacío para que el usuario lo llene)
    const realCell = row.getCell(3)
    realCell.value = ''
    realCell.alignment = { horizontal: 'center', vertical: 'middle' }
    realCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEEEEE' } }

    // 4. Coordenadas
    const coordCell = row.getCell(4)
    coordCell.value = `${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}`
    coordCell.alignment = { horizontal: 'center', vertical: 'middle' }
    coordCell.font = { size: 9, color: { argb: 'FF666666' } }

    // 5. IconID (para debugging)
    const iconCell = row.getCell(5)
    iconCell.value = city.weatherIcon
    iconCell.alignment = { horizontal: 'center', vertical: 'middle' }
    iconCell.font = { size: 9, color: { argb: 'FF999999' } }

    // 6. Viento (km/h)
    const windCell = row.getCell(6)
    windCell.value = city.windKmh.toFixed(1)
    windCell.alignment = { horizontal: 'center', vertical: 'middle' }
    windCell.font = { size: 9, color: { argb: 'FF999999' } }

    // 7. Ráfagas (km/h)
    const gustCell = row.getCell(7)
    gustCell.value = city.gustKmh.toFixed(1)
    gustCell.alignment = { horizontal: 'center', vertical: 'middle' }
    gustCell.font = { size: 9, color: { argb: 'FF999999' } }

    // 8. Visibilidad (km)
    const visibilityCell = row.getCell(8)
    visibilityCell.value = city.visibilityKm.toFixed(1)
    visibilityCell.alignment = { horizontal: 'center', vertical: 'middle' }
    visibilityCell.font = { size: 9, color: { argb: 'FF999999' } }

    // 9. Cálculo paso a paso
    const calcCell = row.getCell(9)
    const calcText = generateCalculationText(city)
    calcCell.value = calcText
    calcCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    calcCell.font = { size: 8, color: { argb: 'FF666666' } }

    // Bordes sutiles
    ;[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((colNum) => {
      const cell = row.getCell(colNum)
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      }
    })

    row.height = 40  // Más alto para el cálculo
  })

  // ─ ANCHO DE COLUMNAS ─
  worksheet.columns = [
    { width: 22 }, // Ciudad
    { width: 12 }, // Clima
    { width: 12 }, // Real
    { width: 18 }, // Coordenadas
    { width: 10 }, // IconID
    { width: 14 }, // Viento
    { width: 14 }, // Ráfagas
    { width: 14 }, // Visibilidad
    { width: 50 }, // Cálculo (ancho mayor)
  ]

  // ─ DESCARGAR ─
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  // Nombre del archivo: pokeweather-test-YYYY-MM-DD-HHmm-prueba-N.xlsx
  const fileDateStr = timestamp.toISOString().slice(0, 16).replace('T', '-').replace(':', '')
  const fileName = `pokeweather-test-${fileDateStr}-prueba-${testNumber}.xlsx`

  // Descargar usando blob URL
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()

  // Limpiar
  URL.revokeObjectURL(url)

  console.log(`✅ Exported ${cities.length} cities to ${fileName}`)
}

/**
 * Traduce condition code a nombre legible en español
 */
function translateCondition(condition: string): string {
  const map: Record<string, string> = {
    sunny: 'Soleado',
    partly: 'Parcial',
    cloudy: 'Nublado',
    fog: 'Niebla',
    rain: 'Lluvia',
    snow: 'Nieve',
    windy: 'Ventoso',
  }
  return map[condition] || condition
}

/**
 * Genera el texto de cálculo paso a paso para debugging
 * Muestra la lógica exacta usada para determinar el clima
 */
function generateCalculationText(city: City): string {
  // Umbrales de viento para override a Windy (Doc 20)
  const WINDY_WIND_KMH = 29    // km/h - viento sostenido
  const WINDY_GUST_KMH = 31    // km/h - ráfagas

  const lines: string[] = []
  lines.push(`IconID: ${city.weatherIcon}`)

  // Paso 1: Determinar condición base
  const baseCondition = getBaseConditionName(city.weatherIcon)
  lines.push(`Base: ${baseCondition}`)

  // Paso 2: Verificar FOG (visibilidad < 1km)
  if (city.visibilityKm < 1) {
    lines.push(`→ Visibility ${city.visibilityKm.toFixed(1)}km < 1km = FOG`)
    lines.push(`Resultado: NIEBLA`)
    return lines.join('\n')
  }

  // Paso 3: Verificar WINDY (solo si base es sunny/partly/cloudy)
  const isWindy =
    city.windKmh >= WINDY_WIND_KMH || city.gustKmh >= WINDY_GUST_KMH
  if (isWindy && ['Soleado', 'Parcial', 'Nublado'].includes(baseCondition)) {
    lines.push(`Wind: ${city.windKmh.toFixed(1)}km/h, Gust: ${city.gustKmh.toFixed(1)}km/h`)
    lines.push(`→ ${city.windKmh.toFixed(1)} >= ${WINDY_WIND_KMH} OR ${city.gustKmh.toFixed(1)} >= ${WINDY_GUST_KMH} = WINDY`)
    lines.push(`Resultado: VENTOSO`)
    return lines.join('\n')
  }

  // Fallback
  lines.push(`Resultado: ${translateCondition(city.condition)}`)
  return lines.join('\n')
}

/**
 * Mapeo de iconID a nombre base de condición
 */
function getBaseConditionName(iconId: number): string {
  const map: Record<number, string> = {
    // Sunny
    1: 'Soleado', 2: 'Soleado', 3: 'Soleado', 4: 'Soleado',
    30: 'Soleado', 33: 'Soleado', 34: 'Soleado',
    // Partly
    5: 'Parcial', 6: 'Parcial', 35: 'Parcial', 36: 'Parcial',
    // Cloudy
    7: 'Nublado', 8: 'Nublado', 11: 'Nublado', 37: 'Nublado', 38: 'Nublado',
    // Rain
    12: 'Lluvia', 13: 'Lluvia', 14: 'Lluvia', 15: 'Lluvia',
    16: 'Lluvia', 17: 'Lluvia', 40: 'Lluvia', 41: 'Lluvia', 42: 'Lluvia',
    // Snow
    19: 'Nieve', 20: 'Nieve', 21: 'Nieve', 22: 'Nieve', 23: 'Nieve',
    24: 'Nieve', 25: 'Nieve', 26: 'Nieve', 29: 'Nieve', 43: 'Nieve', 44: 'Nieve',
  }
  return map[iconId] || 'Desconocido'
}

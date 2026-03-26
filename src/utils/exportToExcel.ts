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
  const headers = ['Ciudad', 'Clima', 'Coordenadas', 'Real']
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

    // Ciudad
    const cityCell = row.getCell(1)
    cityCell.value = city.name
    cityCell.alignment = { horizontal: 'left', vertical: 'middle' }

    // Clima (nombre legible)
    const climaCell = row.getCell(2)
    climaCell.value = translateCondition(city.condition)
    climaCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // Coordenadas
    const coordCell = row.getCell(3)
    coordCell.value = `${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}`
    coordCell.alignment = { horizontal: 'center', vertical: 'middle' }
    coordCell.font = { size: 9, color: { argb: 'FF666666' } }

    // Real (vacío para que el usuario lo llene)
    const realCell = row.getCell(4)
    realCell.value = '' // El usuario lo llenaremos en Pokémon GO
    realCell.alignment = { horizontal: 'center', vertical: 'middle' }
    realCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEEEEE' } } // Rojo muy pálido

    // Bordes sutiles
    ;[1, 2, 3, 4].forEach((colNum) => {
      const cell = row.getCell(colNum)
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      }
    })

    row.height = 18
  })

  // ─ ANCHO DE COLUMNAS ─
  worksheet.columns = [
    { width: 25 }, // Ciudad
    { width: 14 }, // Clima
    { width: 20 }, // Coordenadas
    { width: 14 }, // Real
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

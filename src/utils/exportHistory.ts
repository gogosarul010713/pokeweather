import ExcelJS from 'exceljs'
import { CONDITION_NAMES } from '../config/conditionEmojis'
import type { WeatherSnapshot } from '../services/history/weatherHistoryService'

/**
 * Exportar historial de snapshots a Excel
 * Crea un archivo con columnas: Fecha, Hora, Ciudad, País, Región, Condición App, Real, Correcto
 */
export async function exportHistoryToExcel(snapshots: WeatherSnapshot[]): Promise<void> {
  if (snapshots.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  // Crear workbook
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Historial')

  // Definir columnas
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Hora', key: 'hora', width: 8 },
    { header: 'Ciudad', key: 'ciudad', width: 18 },
    { header: 'País', key: 'pais', width: 15 },
    { header: 'Región', key: 'region', width: 12 },
    { header: 'Condición App', key: 'condicionApp', width: 16 },
    { header: 'Real', key: 'real', width: 16 },
    { header: 'Correcto', key: 'correcto', width: 10 },
  ]

  // Estilos para el header
  worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F77E3' },
  }
  worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' }

  // Añadir datos (ordenados por fecha + hora)
  const sortedSnapshots = [...snapshots].sort((a, b) => b.capturedAt - a.capturedAt)

  sortedSnapshots.forEach((snapshot, index) => {
    const date = new Date(snapshot.capturedAt)
    const fecha = date.toLocaleDateString('es-ES')
    const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    const condicionAppName = CONDITION_NAMES[snapshot.condition as keyof typeof CONDITION_NAMES] || snapshot.condition

    let realValue = '-'
    let correctoValue = '-'
    let correctoColor = 'FF9E9E9E' // gris

    if (snapshot.actualCondition) {
      realValue = CONDITION_NAMES[snapshot.actualCondition as keyof typeof CONDITION_NAMES] || snapshot.actualCondition

      if (snapshot.isCorrect === true) {
        correctoValue = 'Sí'
        correctoColor = 'FF4CAF50' // verde
      } else if (snapshot.isCorrect === false) {
        correctoValue = 'No'
        correctoColor = 'FFF44336' // rojo
      }
    }

    const row = worksheet.addRow({
      fecha,
      hora,
      ciudad: snapshot.cityName,
      pais: snapshot.cityCountry,
      region: snapshot.cityRegion,
      condicionApp: condicionAppName,
      real: realValue,
      correcto: correctoValue,
    })

    // Colorear celda "Correcto"
    if (row.getCell('correcto')) {
      row.getCell('correcto').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: correctoColor },
      }
      row.getCell('correcto').font = { color: { argb: 'FFFFFFFF' }, bold: true }
      row.getCell('correcto').alignment = { horizontal: 'center' }
    }

    // Colorear filas alternas para mejor legibilidad
    if (index % 2 === 1) {
      for (let i = 1; i <= 8; i++) {
        const cell = row.getCell(i)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' },
        }
      }
    }

    // Alineación
    row.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  // Generar archivo
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  // Descargar
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pokeweather-history-${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

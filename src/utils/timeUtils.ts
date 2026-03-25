/**
 * Utilidades de tiempo compartidas
 */

/**
 * Calcula milisegundos hasta la próxima hora exacta (HH:00:00)
 * @example
 * // A las 3:45:30 pm retorna ~14,400,000 ms (4 minutos 30 segundos)
 * msUntilNextHour() // => 270000
 */
export const msUntilNextHour = (): number => {
  const now = new Date()
  const next = new Date(now)
  next.setHours(next.getHours() + 1, 0, 0, 0)
  return next.getTime() - now.getTime()
}

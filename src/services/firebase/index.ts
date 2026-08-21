/**
 * Firebase services barrel export
 * Import from '@/services/firebase'
 */
export { app, db } from './firebaseConfig'
export type { ForecastSnapshot, ForecastDoc } from './firebaseWeatherService'

export {
  loadWeatherCatalog,
  getConditionLabel,
  getConditionEmoji,
  getConditionColor,
  getTypesForCondition,
  validateCatalogConsistency,
  clearCatalogCache,
} from './weatherCatalogService'
export type {
  CatalogCondition,
  CatalogRules,
  WeatherCatalog
} from './weatherCatalogService'

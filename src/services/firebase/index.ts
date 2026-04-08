/**
 * Firebase services barrel export
 * Import from '@/services/firebase'
 */
export { app, db } from './firebaseConfig'
export { saveCityForecast } from './firebaseWeatherService'
export type { ForecastSnapshot, ForecastDoc } from './firebaseWeatherService'

// Feature flags — toggle via .env.local (VITE_FF_* = 'true' | 'false')
// US-1204: ocultar boton "Reportar clima" y WeatherReportModal
export const FF_WEATHER_REPORT = import.meta.env.VITE_FF_WEATHER_REPORT !== 'false'

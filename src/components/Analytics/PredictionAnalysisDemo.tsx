/**
 * Demo/Testing del componente PredictionAnalysisTable
 * Carga datos reales de Firestore o usa mock data como fallback
 * US-1007: Prediction Analysis Table
 */

import { useEffect, useState } from 'react';
import { PredictionAnalysisTable, type PredictionRow } from './PredictionAnalysisTable';
import { fetchPredictions } from '../../services/predictions/predictionAnalyticsService';

function generateMockData(): PredictionRow[] {
  const cities = ['sydney', 'tokyo', 'london'];
  const conditions: Array<'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy'> =
    ['sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy'];
  const cityNames: Record<string, string> = {
    sydney: 'Sydney',
    tokyo: 'Tokyo',
    london: 'London',
  };

  const rows: PredictionRow[] = [];

  // Generar 48 predicciones (24 horas x 3 ciudades)
  for (let h = 0; h < 24; h++) {
    cities.forEach(cityId => {
      const prediction = conditions[Math.floor(Math.random() * conditions.length)];
      const hasReport = Math.random() > 0.3; // 70% tienen reporte de confirmación
      const isCorrect = hasReport && Math.random() > 0.15; // 85% de acierto si hay reporte

      let actual: string | null = null;
      if (hasReport) {
        actual = isCorrect ? prediction : conditions[Math.floor(Math.random() * conditions.length)];
      }

      // Generar lookback 12h con condiciones climáticas
      const lookback12h = hasReport && isCorrect === false
        ? Array.from({ length: 6 }, (_, i) => ({
            hoursAgo: 6 - i,
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            wouldBeCorrect: i === 1 || i === 4, // Simular 2 que habrían acertado
            timestamp: `${String((h - 6 + i) % 24).padStart(2, '0')}:00`,
          }))
        : [];

      rows.push({
        queryTime: new Date(`2026-04-18T${String(h).padStart(2, '0')}:30:00Z`),
        hour: h,
        cityId,
        cityName: cityNames[cityId],
        timezone: cityId === 'sydney' ? 10 : cityId === 'tokyo' ? 9 : 0,
        localTimeUser: `18/04 ${String(h).padStart(2, '0')}:30`,
        prediction,
        actual,
        correct: hasReport ? isCorrect : null,
        lookback12h,
      });
    });
  }

  return rows;
}

export function PredictionAnalysisDemo() {
  const [rows, setRows] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPredictions() {
      try {
        setLoading(true);
        setError(null);

        // Intentar cargar datos reales
        const realData = await fetchPredictions();

        if (realData.length > 0) {
          // Éxito: usar datos reales
          setRows(realData);
          console.log(`[PredictionDemo] ✅ Loaded ${realData.length} real predictions from Firestore`);
        } else {
          // No hay datos, usar mock
          console.warn('[PredictionDemo] ⚠️ No predictions in Firestore, using mock data');
          setRows(generateMockData());
        }
      } catch (err) {
        // Error al cargar: usar mock
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[PredictionDemo] Error loading predictions:`, msg);
        setError(`Error loading predictions: ${msg}`);
        setRows(generateMockData());
      } finally {
        setLoading(false);
      }
    }

    loadPredictions();
  }, []);

  return (
    <div style={{ padding: '20px', background: 'var(--bg-primary)' }}>
      {loading && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
          ⏳ Cargando predicciones...
        </div>
      )}
      {error && (
        <div style={{ color: 'var(--ui-warning)', fontSize: '12px', marginBottom: '12px' }}>
          ⚠️ {error}
        </div>
      )}
      {!loading && rows.length > 0 && (
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {rows.length === generateMockData().length ? '📊 Mock data' : '✅ Real data from Firestore'}
        </div>
      )}
      <PredictionAnalysisTable rows={rows} title="Análisis de Predicciones" />
    </div>
  );
}

export default PredictionAnalysisDemo;

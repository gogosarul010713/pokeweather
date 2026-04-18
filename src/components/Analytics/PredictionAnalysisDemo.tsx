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
  const types = ['Water', 'Fire', 'Electric', 'Grass', 'Ground', 'Normal'];
  const cityNames: Record<string, string> = {
    sydney: 'Sydney',
    tokyo: 'Tokyo',
    london: 'London',
  };

  const rows: PredictionRow[] = [];

  // Generar 48 predicciones (24 horas x 3 ciudades)
  for (let h = 0; h < 24; h++) {
    cities.forEach(cityId => {
      const prediction = types[Math.floor(Math.random() * types.length)];
      const confidence = Math.round(60 + Math.random() * 35);
      const isCorrect = Math.random() > 0.15; // 85% de acierto en promedio

      let actual = prediction;
      if (!isCorrect) {
        // Si no es correcto, elige un tipo diferente
        const alternatives = types.filter(t => t !== prediction);
        actual = alternatives[Math.floor(Math.random() * alternatives.length)];
      }

      // Generar lookback 12h si falló
      const lookback12h = !isCorrect
        ? Array.from({ length: 12 }, (_, i) => ({
            hoursAgo: 12 - i,
            pokemonType: types[Math.floor(Math.random() * types.length)],
            wouldBeCorrect: i === 2 || i === 7, // Simular 2 que habrían acertado
          }))
        : [];

      rows.push({
        queryTime: `2026-04-17T${String(h).padStart(2, '0')}:00:00Z`,
        hour: h,
        cityId,
        cityName: cityNames[cityId],
        prediction,
        confidence,
        actual,
        correct: isCorrect,
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

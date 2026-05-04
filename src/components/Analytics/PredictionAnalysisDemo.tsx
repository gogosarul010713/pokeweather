/**
 * Demo/Testing del componente PredictionAnalysisTable
 * Carga datos reales de Firestore o usa mock data como fallback
 * US-1007: Prediction Analysis Table
 */

import { useEffect, useState } from 'react';
import { PredictionAnalysisTable, type PredictionRow } from './PredictionAnalysisTable';
import { fetchPredictions } from '../../services/predictions/predictionAnalyticsService';
import {
  getPredictionsCacheMetadata,
  setPredictionsCacheMetadata,
  mergeForecastDocs,
  isPredictionsCacheValid,
} from '../../services/cache/cacheService';
import { getRecentForecasts } from '../../services/firebase/firebaseWeatherService';

function generateMockData(): PredictionRow[] {
  const cities = ['sydney', 'tokyo', 'london'];
  const conditions: Array<'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy'> =
    ['sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy'];
  const cityNames: Record<string, string> = {
    sydney: 'Sydney',
    tokyo: 'Tokyo',
    london: 'London',
  };
  const cityCoords: Record<string, { lat: number; lon: number }> = {
    sydney: { lat: -33.8688, lon: 151.2093 },
    tokyo: { lat: 35.6762, lon: 139.6503 },
    london: { lat: 51.5074, lon: -0.1278 },
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

      const coords = cityCoords[cityId] || { lat: 0, lon: 0 };
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
        lat: coords.lat,
        lon: coords.lon,
      });
    });
  }

  return rows;
}

interface PredictionAnalysisDemoProps {
  refreshKey?: number;
}

type DataSource = 'firestore' | 'mock' | 'empty';

export function PredictionAnalysisDemo({ refreshKey = 0 }: PredictionAnalysisDemoProps) {
  const [rows, setRows] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('empty');

  // BUG-011 FIX: Función de refetch para llamar después de reportar clima
  const handleReportSuccess = async () => {
    try {
      console.log('[PredictionDemo] Refetching after weather report...');
      const realData = await fetchPredictions();
      if (realData.length > 0) {
        setRows(realData);
        setDataSource('firestore');
        console.log(`[PredictionDemo] ✅ Refetch completado: ${realData.length} predictions`);
      } else {
        setRows([]);
        setDataSource('empty');
      }
    } catch (err) {
      console.warn('[PredictionDemo] Refetch error:', err);
      // No es crítico, mantiene datos anteriores
    }
  };

  useEffect(() => {
    async function loadPredictions() {
      try {
        setLoading(true);
        setError(null);

        // BUG-011 FIX: Si refreshKey > 0, asume que vino de cleanup → bypass caché y leer Firestore directo
        // Esto evita que cache stale enmascare el estado real (Firestore vacío post-cleanup)
        const fromCleanup = refreshKey > 0;

        // US-1105: CAPA 1 — Cargar caché local (40ms, inmediato), saltar si vino de cleanup
        const cachedMetadata = fromCleanup ? null : await getPredictionsCacheMetadata();

        if (cachedMetadata && isPredictionsCacheValid(cachedMetadata)) {
          // Caché válido: mostrar inmediato usando los docs del metadata
          try {
            const realData = await fetchPredictions(cachedMetadata.documents);
            if (realData.length > 0) {
              setRows(realData);
              setDataSource('firestore');
              console.log(`[PredictionDemo] ✅ Cache hit (${cachedMetadata.documents.length} docs)`);
            } else {
              setRows([]);
              setDataSource('empty');
            }
          } catch {
            console.warn('[PredictionDemo] Cache fetch error');
            setRows([]);
            setDataSource('empty');
          }

          // CAPA 2 — Delta sync en background (no bloquea)
          (async () => {
            try {
              const lastSync = cachedMetadata.lastSyncTime ?? 0;
              const newDocs = await getRecentForecasts('24h', lastSync);

              if (newDocs.length > 0) {
                const merged = mergeForecastDocs(cachedMetadata.documents, newDocs);
                await setPredictionsCacheMetadata(merged);
                console.log(`[PredictionDemo] ✅ Delta sync completado: ${newDocs.length} nuevos docs`);
              } else {
                console.log('[PredictionDemo] Delta sync: sin cambios');
              }
            } catch (err) {
              console.warn('[PredictionDemo] Delta sync error (no crítico):', err);
            }
          })();
        } else {
          // FALLBACK — Caché inválido, no existe, o post-cleanup: leer TODO desde Firestore
          console.log(`[PredictionDemo] ${fromCleanup ? 'Post-cleanup' : 'Cache miss'}, loading from Firestore...`);
          const realData = await fetchPredictions();

          if (realData.length > 0) {
            setRows(realData);
            setDataSource('firestore');
            const allDocs = await getRecentForecasts('24h');
            if (allDocs.length > 0) {
              await setPredictionsCacheMetadata(allDocs);
            }
            console.log(`[PredictionDemo] ✅ Loaded ${realData.length} real predictions`);
          } else {
            // BUG-011 FIX: Sin datos en Firestore → estado vacío explícito (NO mock fallback engañoso)
            console.warn('[PredictionDemo] ⚠️ No predictions in Firestore — empty state');
            setRows([]);
            setDataSource('empty');
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[PredictionDemo] Error loading predictions:`, msg);
        setError(`Error loading predictions: ${msg}`);
        setRows([]);
        setDataSource('empty');
      } finally {
        setLoading(false);
      }
    }

    loadPredictions();
  }, [refreshKey]);

  const handleLoadMockData = () => {
    setRows(generateMockData());
    setDataSource('mock');
  };

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
          {dataSource === 'mock'
            ? '📊 Mock data (datos simulados — no representan estado real)'
            : '✅ Real data from Firestore'}
        </div>
      )}
      {!loading && rows.length === 0 && dataSource === 'empty' && (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            border: '1px dashed var(--border-default)',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>
            Sin predicciones disponibles
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Firestore no tiene datos de pronóstico.<br />
            Sincroniza desde la pestaña <strong>Sincronización</strong> o espera a la siguiente HH:00.
          </div>
          <button
            onClick={handleLoadMockData}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            📊 Cargar datos mock (testing)
          </button>
        </div>
      )}
      {rows.length > 0 && (
        <PredictionAnalysisTable rows={rows} title="Análisis de Predicciones" onReportSuccess={handleReportSuccess} />
      )}
    </div>
  );
}

export default PredictionAnalysisDemo;

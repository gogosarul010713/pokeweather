import React, { useState, useMemo } from 'react';
import { WEATHER_IMAGES, CONDITION_LABEL } from '../../config/weatherImages';
import type { WeatherCondition } from '../../config/weatherImages';

/**
 * Tipos de datos
 */
export interface LookbackItem {
  hoursAgo: number;
  condition: string; // Condición climática: "sunny", "rain", "cloudy", etc.
  wouldBeCorrect: boolean;
  timestamp?: string; // "HH:MM" para mostrar en lookback
}

export interface PredictionRow {
  queryTime: string | Date; // ISO string o Date object
  hour: number;
  cityId: string;
  cityName: string;
  prediction: string; // Condición climática: "sunny", "rain", "cloudy", etc.
  actual: string | null; // Condición climática o null si "Sin datos"
  correct: boolean | null; // null si aún no hay reporte de confirmación
  lookback12h: LookbackItem[];
}

interface Props {
  rows: PredictionRow[];
  title?: string;
}


/**
 * Formatea queryTime a "DD/MM HH:MM UTC"
 */
function formatQueryTime(queryTime: string | Date): string {
  const date = typeof queryTime === 'string' ? new Date(queryTime) : queryTime;
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

/**
 * PredictionAnalysisTable: Tabla detallada de predicciones con lookback 12h
 */
type SortColumn = 'hora' | 'ciudad' | 'prediccion' | 'real' | 'resultado' | null;
type SortDirection = 'asc' | 'desc';

export function PredictionAnalysisTable({ rows, title = 'Predicciones Detalladas' }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openLookbacks, setOpenLookbacks] = useState<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const PAGE_SIZE = 20;

  // Ordenamiento (solo página actual, 20 filas)
  const sortedPageRows = useMemo(() => {
    if (!sortColumn) return rows;

    const sorted = [...rows].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortColumn) {
        case 'hora':
          aVal = new Date(a.queryTime).getTime();
          bVal = new Date(b.queryTime).getTime();
          break;
        case 'ciudad':
          aVal = a.cityName.toLowerCase();
          bVal = b.cityName.toLowerCase();
          break;
        case 'prediccion':
          aVal = a.prediction.toLowerCase();
          bVal = b.prediction.toLowerCase();
          break;
        case 'real':
          aVal = (a.actual ?? 'zzz').toLowerCase();
          bVal = (b.actual ?? 'zzz').toLowerCase();
          break;
        case 'resultado':
          // null < false < true
          aVal = a.correct === null ? -1 : a.correct ? 1 : 0;
          bVal = b.correct === null ? -1 : b.correct ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [rows, sortColumn, sortDirection]);

  // Paginación (sobre filas ya ordenadas)
  const totalPages = Math.max(1, Math.ceil(sortedPageRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageRows = sortedPageRows.slice(startIdx, startIdx + PAGE_SIZE);

  const toggleLookback = (globalIdx: number) => {
    const newSet = new Set(openLookbacks);
    if (newSet.has(globalIdx)) {
      newSet.delete(globalIdx);
    } else {
      newSet.add(globalIdx);
    }
    setOpenLookbacks(newSet);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Alternar dirección si es la misma columna
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nueva columna, empezar con asc
      setSortColumn(column);
      setSortDirection('asc');
    }
    // Resetear a página 1
    setCurrentPage(1);
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return ' ⇅';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const handleExportCSV = () => {
    const headers = ['Hora UTC', 'Ciudad', 'Predicción', 'Real', 'Resultado'];
    const lines = [headers.join(',')];

    sortedPageRows.forEach(row => {
      const time = formatQueryTime(row.queryTime) + ' UTC';
      const real = row.actual ?? 'Sin datos';
      const resultado = row.correct === null ? 'No confirmado' : row.correct ? 'Acierto' : 'Fallo';
      lines.push(
        `"${time}","${row.cityName}","${row.prediction}","${real}","${resultado}"`
      );
    });

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'predictions.csv';
    link.click();

    showToast('✓ CSV exportado');
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(rows, null, 2)).then(() => {
      showToast('✓ JSON copiado');
    });
  };

  const showToast = (msg: string) => {
    const el = document.getElementById('prediction-toast');
    if (el) {
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2000);
    }
  };

  return (
    <div className="prediction-analysis-table">
      <style>{`
        .prediction-analysis-table {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .pat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-default);
        }

        .pat-header h3 {
          margin: 0;
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--text-primary);
        }

        .pat-count {
          margin-left: auto;
          font-family: 'Rajdhani', monospace;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .pat-actions {
          display: flex;
          gap: 6px;
          margin-left: 12px;
        }

        .pat-btn {
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pat-btn:hover {
          background: rgba(88, 166, 255, 0.1);
          color: var(--ui-accent);
          border-color: var(--ui-accent);
        }

        .pat-table-wrap {
          overflow-x: auto;
          border-top: 1px solid var(--border-default);
        }

        .pat-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .pat-table thead th {
          padding: 9px 12px;
          text-align: left;
          font-family: 'Rajdhani', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-default);
          background: rgba(0, 0, 0, 0.15);
          white-space: nowrap;
        }

        .pat-table tbody tr {
          border-bottom: 1px solid var(--border-subtle);
          transition: background 0.15s;
        }

        .pat-table tbody tr:hover {
          background: rgba(88, 166, 255, 0.05);
        }

        .pat-table td {
          padding: 10px 12px;
          vertical-align: middle;
        }

        .pat-time {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .pat-city {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 12px;
        }

        .pat-city.sydney::before { content: '●'; color: var(--ui-accent); }
        .pat-city.tokyo::before  { content: '●'; color: #f472b6; }
        .pat-city.london::before { content: '●'; color: var(--ui-accent); }

        .pat-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
          border: 1px solid currentColor;
          white-space: nowrap;
        }

        .pat-result {
          font-weight: 700;
          font-size: 12px;
        }

        .pat-result.hit  { color: var(--ui-success); }
        .pat-result.miss { color: var(--ui-error); }

        .pat-btn-lookback {
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid var(--ui-error);
          background: rgba(248, 81, 73, 0.08);
          color: var(--ui-error);
          font-family: 'Rajdhani', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .pat-btn-lookback:hover {
          background: rgba(248, 81, 73, 0.15);
        }

        .pat-btn-lookback.success {
          border-color: var(--ui-success);
          background: rgba(63, 185, 80, 0.08);
          color: var(--ui-success);
        }

        .pat-btn-lookback.success:hover {
          background: rgba(63, 185, 80, 0.15);
        }

        .pat-lookback-row td {
          padding: 0;
          background: rgba(248, 81, 73, 0.02);
        }

        .pat-lookback-row.success td {
          background: rgba(63, 185, 80, 0.02);
        }

        .pat-lookback-panel {
          padding: 12px 16px;
          border-top: 1px solid rgba(248, 81, 73, 0.15);
          border-bottom: 1px solid rgba(248, 81, 73, 0.15);
        }

        .pat-lookback-title {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          font-weight: 700;
          color: var(--ui-error);
          letter-spacing: 0.5px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          text-transform: uppercase;
        }

        .pat-lookback-title.success {
          color: var(--ui-success);
        }

        .pat-lookback-title.error {
          color: var(--ui-error);
        }

        .pat-lookback-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 8px;
        }

        .pat-lookback-item {
          padding: 6px 6px;
          border-radius: 6px;
          border: 1px solid var(--border-subtle);
          font-family: 'Rajdhani', monospace;
          font-size: 10px;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-align: center;
          background: var(--bg-tertiary);
        }

        .pat-lookback-item.hit {
          border-color: var(--ui-success);
          background: rgba(63, 185, 80, 0.12);
          color: var(--ui-success);
        }

        .pat-lookback-hours {
          font-size: 9px;
          opacity: 0.8;
          font-weight: 600;
        }

        .pat-lookback-ago {
          font-size: 8px;
          opacity: 0.6;
        }

        .pat-lookback-condition {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 10px;
          font-weight: 600;
          margin-top: 2px;
        }

        .pat-lookback-check {
          font-size: 12px;
          font-weight: 700;
          color: var(--ui-success);
        }

        .pat-pagination {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-top: 1px solid var(--border-default);
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .pat-page-info {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          color: var(--text-secondary);
          margin-right: 6px;
        }

        .pat-page-btn {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .pat-page-btn:hover:not(:disabled),
        .pat-page-btn.active {
          background: rgba(88, 166, 255, 0.1);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .pat-page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pat-toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--ui-success);
          color: var(--ui-success);
          padding: 8px 14px;
          border-radius: 6px;
          font-family: 'Rajdhani', monospace;
          font-size: 12px;
          z-index: 999;
          transform: translateY(50px);
          opacity: 0;
          transition: all 0.3s;
        }

        .pat-toast.show {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>

      {/* Header */}
      <div className="pat-header">
        <h3>{title}</h3>
        <span className="pat-count">{rows.length} predicciones</span>
        <div className="pat-actions">
          <button className="pat-btn" onClick={handleExportCSV}>
            📥 CSV
          </button>
          <button className="pat-btn" onClick={handleCopyJSON}>
            📋 JSON
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="pat-table-wrap">
        <table className="pat-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('hora')}>
                Hora UTC{renderSortIcon('hora')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('ciudad')}>
                Ciudad{renderSortIcon('ciudad')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('prediccion')}>
                Predicción{renderSortIcon('prediccion')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('real')}>
                Real{renderSortIcon('real')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('resultado')}>
                Resultado{renderSortIcon('resultado')}
              </th>
              <th>Lookback</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => {
              const globalIdx = startIdx + idx;
              const isOpen = openLookbacks.has(globalIdx);
              const time = formatQueryTime(row.queryTime);

              // Condiciones climáticas (no tipos Pokémon)
              const predCondition = (row.prediction || 'Unknown').toLowerCase() as WeatherCondition;
              const actualCondition = (row.actual || 'Unknown').toLowerCase() as WeatherCondition;
              const hasLookback = row.lookback12h.length > 0;
              const hasActual = row.actual !== null;

              // Información de predicción (siempre disponible)
              const predWeatherImg = WEATHER_IMAGES[predCondition] || '/weather/cloudy.png';
              const predLabel = CONDITION_LABEL[predCondition] || row.prediction;

              // Información de real (puede ser null)
              const actualWeatherImg = hasActual ? (WEATHER_IMAGES[actualCondition] || '/weather/cloudy.png') : '';
              const actualLabel = hasActual ? (CONDITION_LABEL[actualCondition] || row.actual) : '';

              return (
                <React.Fragment key={`row-${globalIdx}`}>
                  {/* Main row */}
                  <tr>
                    <td className="pat-time">{time}</td>
                    <td>
                      <span className={`pat-city ${row.cityId}`}>{row.cityName}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={predWeatherImg} alt={predLabel} style={{ width: '20px', height: '20px' }} />
                        <span>{predLabel}</span>
                      </div>
                    </td>
                    <td>
                      {hasActual && actualWeatherImg ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img src={actualWeatherImg} alt={actualLabel || ''} style={{ width: '20px', height: '20px' }} />
                          <span>{actualLabel}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Sin datos</span>
                      )}
                    </td>
                    <td>
                      {row.correct === null ? (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>No confirmado</span>
                      ) : (
                        <span className={`pat-result ${row.correct ? 'hit' : 'miss'}`}>
                          {row.correct ? '✓ Acierto' : '✕ Fallo'}
                        </span>
                      )}
                    </td>
                    <td>
                      {hasLookback && (
                        <button
                          className={`pat-btn-lookback ${row.correct === true ? 'success' : ''}`}
                          onClick={() => toggleLookback(globalIdx)}
                        >
                          LOOKBACK
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Lookback row (expandible) */}
                  {isOpen && hasLookback && (
                    <tr className={`pat-lookback-row ${row.correct === true ? 'success' : ''}`} key={`lookback-${globalIdx}`}>
                      <td colSpan={6}>
                        <div className="pat-lookback-panel">
                          <div className={`pat-lookback-title ${row.correct === true ? 'success' : 'error'}`}>
                            🔍 Lookback 12h — {row.lookback12h.filter(x => x.wouldBeCorrect).length}/{row.lookback12h.length} acertarían
                          </div>
                          <div className="pat-lookback-grid">
                            {row.lookback12h.map((item, i) => {
                              const itemCondition = (item.condition || 'Unknown').toLowerCase() as WeatherCondition;
                              const itemWeatherImg = WEATHER_IMAGES[itemCondition] || '/weather/cloudy.png';
                              const itemLabel = CONDITION_LABEL[itemCondition] || item.condition;

                              return (
                                <div
                                  key={`${globalIdx}-lb-${i}`}
                                  className={`pat-lookback-item ${item.wouldBeCorrect ? 'hit' : ''}`}
                                >
                                  <div className="pat-lookback-hours">{item.timestamp}</div>
                                  <div className="pat-lookback-ago">-{item.hoursAgo}h</div>
                                  <div className="pat-lookback-condition">
                                    <img src={itemWeatherImg} alt={itemLabel} style={{ width: '16px', height: '16px' }} />
                                    <span>{itemLabel}</span>
                                  </div>
                                  {item.wouldBeCorrect && <div className="pat-lookback-check">✓</div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pat-pagination">
        <span className="pat-page-info">
          Página {safePage} de {totalPages}
        </span>
        <button
          className="pat-page-btn"
          onClick={() => setCurrentPage(safePage - 1)}
          disabled={safePage === 1}
        >
          ← Ant
        </button>
        {Array.from(
          { length: Math.min(5, totalPages) },
          (_, i) => Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i
        ).map(page => (
          <button
            key={page}
            className={`pat-page-btn ${page === safePage ? 'active' : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="pat-page-btn"
          onClick={() => setCurrentPage(safePage + 1)}
          disabled={safePage === totalPages}
        >
          Sig →
        </button>
      </div>

      {/* Toast */}
      <div id="prediction-toast" className="pat-toast" />
    </div>
  );
}

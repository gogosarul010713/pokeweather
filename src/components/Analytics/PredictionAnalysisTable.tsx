import React, { useState } from 'react';

/**
 * Tipos de datos
 */
export interface LookbackItem {
  hoursAgo: number;
  pokemonType: string;
  wouldBeCorrect: boolean;
}

export interface PredictionRow {
  queryTime: string | Date; // ISO string o Date object
  hour: number;
  cityId: string;
  cityName: string;
  prediction: string;
  confidence: number;
  actual: string;
  correct: boolean;
  lookback12h: LookbackItem[];
}

interface Props {
  rows: PredictionRow[];
  title?: string;
}

const TYPE_ICONS: Record<string, string> = {
  Water: '💧',
  Fire: '🔥',
  Electric: '⚡',
  Grass: '🌿',
  Ground: '⛰️',
  Normal: '⭐',
  Ice: '🧊',
  Rock: '🪨',
  Flying: '🪶',
  Poison: '☠️',
  Psychic: '🧠',
  Bug: '🐛',
  Ghost: '👻',
  Dark: '🌑',
  Steel: '⚙️',
  Dragon: '🐉',
  Fairy: '✨',
  Fighting: '🥊',
};

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
export function PredictionAnalysisTable({ rows, title = 'Predicciones Detalladas' }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openLookbacks, setOpenLookbacks] = useState<Set<number>>(new Set());
  const PAGE_SIZE = 20;

  // Paginación
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIdx, startIdx + PAGE_SIZE);

  const toggleLookback = (globalIdx: number) => {
    const newSet = new Set(openLookbacks);
    if (newSet.has(globalIdx)) {
      newSet.delete(globalIdx);
    } else {
      newSet.add(globalIdx);
    }
    setOpenLookbacks(newSet);
  };

  const handleExportCSV = () => {
    const headers = ['Hora UTC', 'Ciudad', 'Predicción', 'Real', 'Acierto', 'Confianza'];
    const lines = [headers.join(',')];

    rows.forEach(row => {
      const time = formatQueryTime(row.queryTime) + ' UTC';
      const acierto = row.correct ? 'SÍ' : 'NO';
      lines.push(
        `"${time}","${row.cityName}","${row.prediction}","${row.actual}","${acierto}","${row.confidence}%"`
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

        .pat-badge.water    { color: var(--type-water);    background: rgba(104, 144, 240, 0.1); }
        .pat-badge.fire     { color: var(--type-fire);     background: rgba(255, 107, 53, 0.1); }
        .pat-badge.electric { color: var(--type-electric); background: rgba(248, 208, 48, 0.1); }
        .pat-badge.grass    { color: var(--type-grass);    background: rgba(120, 200, 80, 0.1); }
        .pat-badge.ground   { color: var(--type-ground);   background: rgba(194, 160, 98, 0.1); }
        .pat-badge.normal   { color: var(--type-normal);   background: rgba(168, 168, 120, 0.1); }
        .pat-badge.ice      { color: var(--type-ice);      background: rgba(152, 216, 216, 0.1); }
        .pat-badge.rock     { color: var(--type-rock);     background: rgba(182, 161, 54, 0.1); }
        .pat-badge.flying   { color: var(--type-flying);   background: rgba(126, 200, 227, 0.1); }
        .pat-badge.poison   { color: var(--type-poison);   background: rgba(163, 62, 161, 0.1); }
        .pat-badge.psychic  { color: var(--type-psychic);  background: rgba(248, 88, 136, 0.1); }
        .pat-badge.bug      { color: var(--type-bug);      background: rgba(168, 184, 32, 0.1); }
        .pat-badge.ghost    { color: var(--type-ghost);    background: rgba(112, 88, 152, 0.1); }
        .pat-badge.dark     { color: var(--type-dark);     background: rgba(112, 88, 72, 0.1); }
        .pat-badge.steel    { color: var(--type-steel);    background: rgba(184, 184, 208, 0.1); }
        .pat-badge.dragon   { color: var(--type-dragon);   background: rgba(112, 56, 248, 0.1); }
        .pat-badge.fairy    { color: var(--type-fairy);    background: rgba(238, 153, 172, 0.1); }

        .pat-result {
          font-weight: 700;
          font-size: 12px;
        }

        .pat-result.hit  { color: var(--ui-success); }
        .pat-result.miss { color: var(--ui-error); }

        .pat-confidence {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 90px;
        }

        .pat-conf-bar {
          flex: 1;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .pat-conf-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.2s;
        }

        .pat-conf-val {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          color: var(--text-secondary);
          min-width: 35px;
          text-align: right;
        }

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
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .pat-lookback-item {
          padding: 5px 8px;
          border-radius: 6px;
          border: 1px solid var(--border-subtle);
          font-family: 'Rajdhani', monospace;
          font-size: 10px;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 60px;
          text-align: center;
        }

        .pat-lookback-item.hit {
          border-color: var(--ui-success);
          background: rgba(63, 185, 80, 0.08);
          color: var(--ui-success);
        }

        .pat-lookback-hours {
          font-size: 9px;
          opacity: 0.7;
        }

        .pat-lookback-type {
          font-size: 11px;
          font-weight: 700;
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
              <th>Hora UTC</th>
              <th>Ciudad</th>
              <th>Predicción</th>
              <th>Real</th>
              <th>Resultado</th>
              <th>Confianza</th>
              <th>Lookback</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => {
              const globalIdx = startIdx + idx;
              const isOpen = openLookbacks.has(globalIdx);
              const time = formatQueryTime(row.queryTime);
              const confColor = row.confidence >= 85 ? 'var(--ui-success)' :
                                row.confidence >= 70 ? 'var(--ui-warning)' :
                                'var(--ui-error)';
              const typeKeyPred = row.prediction.toLowerCase();
              const typeKeyActual = row.actual.toLowerCase();
              const hasLookback = row.lookback12h.length > 0;

              return (
                <React.Fragment key={`row-${globalIdx}`}>
                  {/* Main row */}
                  <tr>
                    <td className="pat-time">{time}</td>
                    <td>
                      <span className={`pat-city ${row.cityId}`}>{row.cityName}</span>
                    </td>
                    <td>
                      <span className={`pat-badge ${typeKeyPred}`}>
                        {TYPE_ICONS[row.prediction] || '?'} {row.prediction}
                      </span>
                    </td>
                    <td>
                      <span className={`pat-badge ${typeKeyActual}`}>
                        {TYPE_ICONS[row.actual] || '?'} {row.actual}
                      </span>
                    </td>
                    <td>
                      <span className={`pat-result ${row.correct ? 'hit' : 'miss'}`}>
                        {row.correct ? '✓ Acierto' : '✕ Fallo'}
                      </span>
                    </td>
                    <td>
                      <div className="pat-confidence">
                        <div className="pat-conf-bar">
                          <div
                            className="pat-conf-fill"
                            style={{
                              width: `${row.confidence}%`,
                              backgroundColor: confColor,
                            }}
                          />
                        </div>
                        <span className="pat-conf-val">{row.confidence}%</span>
                      </div>
                    </td>
                    <td>
                      {hasLookback && (
                        <button
                          className={`pat-btn-lookback ${row.correct ? 'success' : ''}`}
                          onClick={() => toggleLookback(globalIdx)}
                        >
                          LOOKBACK
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Lookback row (expandible) */}
                  {isOpen && hasLookback && (
                    <tr className={`pat-lookback-row ${row.correct ? 'success' : ''}`} key={`lookback-${globalIdx}`}>
                      <td colSpan={7}>
                        <div className="pat-lookback-panel">
                          <div className={`pat-lookback-title ${row.correct ? 'success' : 'error'}`}>
                            🔍 Lookback 12h —{' '}
                            {row.lookback12h.filter(x => x.wouldBeCorrect).length} predicción(es)
                            habría(n) acertado · Real:{' '}
                            <span className={`pat-badge ${typeKeyActual}`} style={{ fontSize: '10px' }}>
                              {TYPE_ICONS[row.actual] || '?'} {row.actual}
                            </span>
                          </div>
                          <div className="pat-lookback-grid">
                            {row.lookback12h.map((item, i) => (
                              <div
                                key={`${globalIdx}-lb-${i}`}
                                className={`pat-lookback-item ${item.wouldBeCorrect ? 'hit' : ''}`}
                              >
                                <div className="pat-lookback-hours">-{item.hoursAgo}h</div>
                                <div className="pat-lookback-type">
                                  {TYPE_ICONS[item.pokemonType] || '?'} {item.pokemonType}
                                </div>
                                <div>{item.wouldBeCorrect ? '✓' : '·'}</div>
                              </div>
                            ))}
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
          (_, i) => Math.max(1, safePage - 2 + i)
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

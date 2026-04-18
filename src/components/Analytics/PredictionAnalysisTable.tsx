import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { WEATHER_IMAGES, CONDITION_LABEL } from '../../config/weatherImages';
import type { WeatherCondition } from '../../config/weatherImages';

export interface LookbackItem {
  hoursAgo: number;
  condition: string;
  wouldBeCorrect: boolean;
  timestamp?: string;
}

export interface PredictionRow {
  queryTime: string | Date;
  hour: number;
  cityId: string;
  cityName: string;
  prediction: string;
  actual: string | null;
  correct: boolean | null;
  lookback12h: LookbackItem[];
}

interface Props {
  rows: PredictionRow[];
  title?: string;
}

function formatQueryTime(queryTime: string | Date): string {
  const date = typeof queryTime === 'string' ? new Date(queryTime) : queryTime;
  if (isNaN(date.getTime())) return 'N/A';
  const day    = String(date.getUTCDate()).padStart(2, '0');
  const month  = String(date.getUTCMonth() + 1).padStart(2, '0');
  const hours  = String(date.getUTCHours()).padStart(2, '0');
  const mins   = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${mins}`;
}

function WeatherBadge({ condition }: { condition: string }) {
  const cond = condition.toLowerCase() as WeatherCondition;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img
        src={WEATHER_IMAGES[cond] || '/weather/cloudy.png'}
        alt={condition}
        style={{ width: '20px', height: '20px' }}
      />
      <span>{CONDITION_LABEL[cond] || condition}</span>
    </div>
  );
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <span className="pat-sort-icon">⇅</span>;
  return <span className="pat-sort-icon active">{sorted === 'asc' ? '↑' : '↓'}</span>;
}

const PAGE_SIZES = [10, 20, 50, 100];

export function PredictionAnalysisTable({ rows, title = 'Predicciones Detalladas' }: Props) {
  const [sorting, setSorting]             = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter]   = useState('');
  const [openLookbacks, setOpenLookbacks] = useState<Set<string>>(new Set());

  const toggleLookback = (key: string) => {
    setOpenLookbacks(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const columnHelper = createColumnHelper<PredictionRow>();

  const columns = useMemo(() => [
    columnHelper.accessor('queryTime', {
      id: 'hora',
      header: 'Hora UTC',
      cell: info => (
        <span className="pat-time">{formatQueryTime(info.getValue())}</span>
      ),
      sortingFn: (a, b) =>
        new Date(a.original.queryTime).getTime() - new Date(b.original.queryTime).getTime(),
      filterFn: (row, _id, value) =>
        formatQueryTime(row.original.queryTime).toLowerCase().includes(value.toLowerCase()),
    }),
    columnHelper.accessor('cityName', {
      id: 'ciudad',
      header: 'Ciudad',
      cell: info => (
        <span className={`pat-city ${info.row.original.cityId}`}>
          {info.getValue()}
        </span>
      ),
      filterFn: 'includesString',
    }),
    columnHelper.accessor('prediction', {
      id: 'prediccion',
      header: 'Predicción',
      cell: info => <WeatherBadge condition={info.getValue()} />,
      filterFn: (row, _id, value) =>
        (CONDITION_LABEL[row.original.prediction.toLowerCase() as WeatherCondition] || row.original.prediction)
          .toLowerCase().includes(value.toLowerCase()),
    }),
    columnHelper.accessor('actual', {
      id: 'real',
      header: 'Real',
      cell: info => {
        const val = info.getValue();
        return val
          ? <WeatherBadge condition={val} />
          : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Sin datos</span>;
      },
      filterFn: (row, _id, value) => {
        const val = row.original.actual;
        const label = val
          ? (CONDITION_LABEL[val.toLowerCase() as WeatherCondition] || val)
          : 'sin datos';
        return label.toLowerCase().includes(value.toLowerCase());
      },
    }),
    columnHelper.accessor('correct', {
      id: 'resultado',
      header: 'Resultado',
      cell: info => {
        const c = info.getValue();
        if (c === null)
          return <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>No confirmado</span>;
        return (
          <span className={`pat-result ${c ? 'hit' : 'miss'}`}>
            {c ? '✓ Acierto' : '✕ Fallo'}
          </span>
        );
      },
      sortingFn: (a, b) => {
        const toN = (v: boolean | null) => (v === null ? -1 : v ? 1 : 0);
        return toN(a.original.correct) - toN(b.original.correct);
      },
      filterFn: (row, _id, value) => {
        const c = row.original.correct;
        const label = c === null ? 'no confirmado' : c ? 'acierto' : 'fallo';
        return label.includes(value.toLowerCase());
      },
    }),
    columnHelper.display({
      id: 'lookback',
      header: 'Lookback',
      cell: info => {
        const row = info.row.original;
        if (!row.lookback12h.length) return null;
        const key    = info.row.id;
        const isOpen = openLookbacks.has(key);
        return (
          <button
            className={`pat-btn-lookback ${row.correct === true ? 'success' : ''}`}
            onClick={() => toggleLookback(key)}
          >
            {isOpen ? 'CERRAR' : 'LOOKBACK'}
          </button>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ], [openLookbacks]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalFiltered = table.getFilteredRowModel().rows.length;

  const handleExportCSV = () => {
    const headers = ['Hora UTC', 'Ciudad', 'Predicción', 'Real', 'Resultado'];
    const lines = [headers.join(',')];
    table.getFilteredRowModel().rows.forEach(({ original: r }) => {
      const real      = r.actual ?? 'Sin datos';
      const resultado = r.correct === null ? 'No confirmado' : r.correct ? 'Acierto' : 'Fallo';
      lines.push(`"${formatQueryTime(r.queryTime)} UTC","${r.cityName}","${r.prediction}","${real}","${resultado}"`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'predictions.csv';
    a.click();
    showToast('✓ CSV exportado');
  };

  const handleCopyJSON = () => {
    const data = table.getFilteredRowModel().rows.map(r => r.original);
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => showToast('✓ JSON copiado'));
  };

  const showToast = (msg: string) => {
    const el = document.getElementById('prediction-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
  };

  return (
    <div className="prediction-analysis-table">
      <style>{`
        .prediction-analysis-table {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Header ─────────────────────────────────────── */
        .pat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-default);
          flex-wrap: wrap;
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
          font-family: 'Rajdhani', monospace;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .pat-actions {
          display: flex;
          gap: 6px;
          margin-left: auto;
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

        /* ── Toolbar: búsqueda global ────────────────────── */
        .pat-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(0,0,0,0.06);
        }
        .pat-search-wrap {
          position: relative;
          flex: 1;
          max-width: 320px;
        }
        .pat-search-icon {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: var(--text-secondary);
          pointer-events: none;
        }
        .pat-search {
          width: 100%;
          padding: 5px 8px 5px 28px;
          border-radius: 4px;
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          box-sizing: border-box;
        }
        .pat-search:focus {
          outline: none;
          border-color: var(--ui-accent);
        }
        .pat-search::placeholder {
          color: var(--text-secondary);
          opacity: 0.6;
        }
        .pat-filter-count {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          color: var(--text-secondary);
          margin-left: auto;
        }
        .pat-clear-btn {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
        }
        .pat-clear-btn:hover {
          color: var(--ui-error);
          border-color: var(--ui-error);
        }

        /* ── Table ──────────────────────────────────────── */
        .pat-table-wrap {
          overflow-x: auto;
        }
        .pat-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        /* ── Column headers ─────────────────────────────── */
        .pat-table thead th {
          padding: 0;
          text-align: left;
          background: rgba(0, 0, 0, 0.15);
          border-bottom: 1px solid var(--border-default);
          white-space: nowrap;
        }
        .pat-th-inner {
          display: flex;
          flex-direction: column;
        }
        .pat-th-label {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px 4px;
          font-family: 'Rajdhani', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        }
        .pat-th-label:hover {
          color: var(--text-primary);
        }
        .pat-sort-icon {
          font-size: 10px;
          opacity: 0.4;
        }
        .pat-sort-icon.active {
          opacity: 1;
          color: var(--ui-accent);
        }
        .pat-th-filter {
          padding: 0 8px 6px;
        }
        .pat-col-filter {
          width: 100%;
          padding: 3px 6px;
          border-radius: 3px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px;
          box-sizing: border-box;
        }
        .pat-col-filter:focus {
          outline: none;
          border-color: var(--ui-accent);
        }
        .pat-col-filter::placeholder {
          color: var(--text-secondary);
          opacity: 0.5;
        }

        /* ── Rows ───────────────────────────────────────── */
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
        .pat-result {
          font-weight: 700;
          font-size: 12px;
        }
        .pat-result.hit  { color: var(--ui-success); }
        .pat-result.miss { color: var(--ui-error); }

        /* ── Lookback ───────────────────────────────────── */
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
        .pat-btn-lookback:hover { background: rgba(248, 81, 73, 0.15); }
        .pat-btn-lookback.success {
          border-color: var(--ui-success);
          background: rgba(63, 185, 80, 0.08);
          color: var(--ui-success);
        }
        .pat-btn-lookback.success:hover { background: rgba(63, 185, 80, 0.15); }

        .pat-lookback-row td {
          padding: 0;
          background: rgba(248, 81, 73, 0.02);
        }
        .pat-lookback-row.success td { background: rgba(63, 185, 80, 0.02); }
        .pat-lookback-panel {
          padding: 12px 16px;
          border-top: 1px solid rgba(248, 81, 73, 0.15);
          border-bottom: 1px solid rgba(248, 81, 73, 0.15);
        }
        .pat-lookback-title {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          text-transform: uppercase;
        }
        .pat-lookback-title.success { color: var(--ui-success); }
        .pat-lookback-title.error   { color: var(--ui-error); }
        .pat-lookback-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 8px;
        }
        .pat-lookback-item {
          padding: 6px;
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
        .pat-lookback-hours   { font-size: 9px; opacity: 0.8; font-weight: 600; }
        .pat-lookback-ago     { font-size: 8px; opacity: 0.6; }
        .pat-lookback-condition {
          display: flex; align-items: center; gap: 2px;
          font-size: 10px; font-weight: 600; margin-top: 2px;
        }
        .pat-lookback-check { font-size: 12px; font-weight: 700; color: var(--ui-success); }

        /* ── Empty state ────────────────────────────────── */
        .pat-empty {
          padding: 40px 16px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 13px;
        }

        /* ── Pagination ─────────────────────────────────── */
        .pat-pagination {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-top: 1px solid var(--border-default);
          flex-wrap: wrap;
        }
        .pat-page-info {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .pat-page-size-label {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          color: var(--text-secondary);
          margin-left: 12px;
        }
        .pat-page-size-select {
          padding: 3px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px;
          cursor: pointer;
        }
        .pat-page-btns {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
        }
        .pat-page-btn {
          min-width: 28px;
          height: 28px;
          padding: 0 6px;
          border-radius: 4px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .pat-page-btn:hover:not(:disabled) {
          background: rgba(88, 166, 255, 0.1);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }
        .pat-page-btn.active {
          background: rgba(88, 166, 255, 0.15);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }
        .pat-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pat-page-sep {
          color: var(--text-secondary);
          font-size: 12px;
          padding: 0 2px;
        }

        /* ── Toast ─────────────────────────────────────── */
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
        .pat-toast.show { transform: translateY(0); opacity: 1; }
      `}</style>

      {/* ── Header ── */}
      <div className="pat-header">
        <h3>{title}</h3>
        <span className="pat-count">{rows.length} predicciones</span>
        <div className="pat-actions">
          <button className="pat-btn" onClick={handleExportCSV}>📥 CSV</button>
          <button className="pat-btn" onClick={handleCopyJSON}>📋 JSON</button>
        </div>
      </div>

      {/* ── Toolbar búsqueda global ── */}
      <div className="pat-toolbar">
        <div className="pat-search-wrap">
          <span className="pat-search-icon">🔍</span>
          <input
            className="pat-search"
            type="text"
            placeholder="Buscar en toda la tabla..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>
        {(globalFilter || columnFilters.length > 0) && (
          <button
            className="pat-clear-btn"
            onClick={() => { setGlobalFilter(''); setColumnFilters([]); }}
          >
            ✕ Limpiar filtros
          </button>
        )}
        <span className="pat-filter-count">
          {totalFiltered !== rows.length
            ? `${totalFiltered} de ${rows.length} resultados`
            : `${rows.length} resultados`}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="pat-table-wrap">
        <table className="pat-table">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort   = header.column.getCanSort();
                  const canFilter = header.column.getCanFilter();
                  return (
                    <th key={header.id}>
                      <div className="pat-th-inner">
                        <div
                          className="pat-th-label"
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          style={{ cursor: canSort ? 'pointer' : 'default' }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <SortIcon sorted={header.column.getIsSorted()} />}
                        </div>
                        {canFilter && (
                          <div className="pat-th-filter">
                            <input
                              className="pat-col-filter"
                              type="text"
                              placeholder="Filtrar..."
                              value={(header.column.getFilterValue() as string) ?? ''}
                              onChange={e => header.column.setFilterValue(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="pat-empty">Sin resultados para los filtros aplicados.</div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => {
                const original = row.original;
                const isOpen   = openLookbacks.has(row.id);
                const hasLb    = original.lookback12h.length > 0;
                return (
                  <>
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>

                    {isOpen && hasLb && (
                      <tr
                        key={`lb-${row.id}`}
                        className={`pat-lookback-row ${original.correct === true ? 'success' : ''}`}
                      >
                        <td colSpan={columns.length}>
                          <div className="pat-lookback-panel">
                            <div className={`pat-lookback-title ${original.correct === true ? 'success' : 'error'}`}>
                              🔍 Lookback 12h — {original.lookback12h.filter(x => x.wouldBeCorrect).length}/{original.lookback12h.length} acertarían
                            </div>
                            <div className="pat-lookback-grid">
                              {original.lookback12h.map((item, i) => {
                                const cond  = item.condition.toLowerCase() as WeatherCondition;
                                return (
                                  <div
                                    key={`${row.id}-lb-${i}`}
                                    className={`pat-lookback-item ${item.wouldBeCorrect ? 'hit' : ''}`}
                                  >
                                    <div className="pat-lookback-hours">{item.timestamp}</div>
                                    <div className="pat-lookback-ago">-{item.hoursAgo}h</div>
                                    <div className="pat-lookback-condition">
                                      <img
                                        src={WEATHER_IMAGES[cond] || '/weather/cloudy.png'}
                                        alt={item.condition}
                                        style={{ width: '16px', height: '16px' }}
                                      />
                                      <span>{CONDITION_LABEL[cond] || item.condition}</span>
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
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="pat-pagination">
        <span className="pat-page-info">
          Página {pageIndex + 1} de {table.getPageCount()}
        </span>

        <span className="pat-page-size-label">Filas:</span>
        <select
          className="pat-page-size-select"
          value={pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
        >
          {PAGE_SIZES.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <div className="pat-page-btns">
          {/* Primera página */}
          <button
            className="pat-page-btn"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="Primera página"
          >
            ««
          </button>

          {/* Anterior */}
          <button
            className="pat-page-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Página anterior"
          >
            ‹ Ant
          </button>

          {/* Números de página (ventana de 5) */}
          {Array.from(
            { length: Math.min(5, table.getPageCount()) },
            (_, i) => Math.max(0, Math.min(pageIndex - 2, table.getPageCount() - 5)) + i
          ).map(p => (
            <button
              key={p}
              className={`pat-page-btn ${p === pageIndex ? 'active' : ''}`}
              onClick={() => table.setPageIndex(p)}
            >
              {p + 1}
            </button>
          ))}

          {/* Siguiente */}
          <button
            className="pat-page-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Página siguiente"
          >
            Sig ›
          </button>

          {/* Última página */}
          <button
            className="pat-page-btn"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="Última página"
          >
            »»
          </button>
        </div>
      </div>

      <div id="prediction-toast" className="pat-toast" />
    </div>
  );
}

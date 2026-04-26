import { useState, useMemo, Fragment } from 'react';
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
import WeatherReportModal from './WeatherReportModal';

export interface LookbackItem {
  hoursAgo: number;
  condition: string;
  wouldBeCorrect: boolean | null; // null = sin reporte manual todavía
  timestamp?: string;
}

export interface PredictionRow {
  queryTime: string | Date;
  hour: number;
  cityId: string;
  cityName: string;
  timezone: number;
  localTimeUser: string;
  prediction: string;
  actual: string | null;
  correct: boolean | null;
  lookback12h: LookbackItem[];
  lat: number;
  lon: number;
}

interface Props {
  rows: PredictionRow[];
  title?: string;
  onReportSuccess?: () => void | Promise<void>;
}


function getCityLocalTime(queryTime: string | Date | number, timezone: number): string {
  // Manejar números (milisegundos desde caché)
  let date: Date
  if (typeof queryTime === 'number') {
    date = new Date(queryTime)
  } else if (typeof queryTime === 'string') {
    date = new Date(queryTime)
  } else {
    date = queryTime
  }

  if (isNaN(date.getTime())) {
    console.warn('[getCityLocalTime] Invalid date:', { queryTime, timezone, dateTime: date.getTime() })
    return 'N/A'
  }

  if (typeof timezone !== 'number' || isNaN(timezone)) {
    console.warn('[getCityLocalTime] Invalid timezone:', { timezone, typeof: typeof timezone })
    return 'N/A'
  }

  const utcTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const cityDate = new Date(utcTime + timezone * 60 * 60 * 1000);
  const day = String(cityDate.getDate()).padStart(2, '0');
  const month = String(cityDate.getMonth() + 1).padStart(2, '0');
  const hours = String(cityDate.getHours()).padStart(2, '0');
  const mins = String(cityDate.getMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${mins}`;
}

type GroupBy = 'hora' | 'ciudad' | 'clima';

const GROUP_SORTS: Record<GroupBy, SortingState> = {
  hora:   [{ id: 'horaLocal',  desc: true  }],
  ciudad: [{ id: 'ciudad',     desc: false }, { id: 'horaLocal', desc: true }],
  clima:  [{ id: 'prediccion', desc: false }, { id: 'horaLocal', desc: true }],
};

function getHourBucket(localTimeUser: string): string {
  if (!localTimeUser || localTimeUser === 'N/A') return 'Sin fecha';
  const parts = localTimeUser.split(' ');
  if (parts.length < 2) return localTimeUser;
  const [date, time] = parts;
  const hour = time.split(':')[0];
  return `${date} ${hour}:00`;
}

function getGroupKey(row: PredictionRow, groupBy: GroupBy): string {
  switch (groupBy) {
    case 'hora':   return getHourBucket(row.localTimeUser);
    case 'ciudad': return row.cityName;
    case 'clima':  return row.prediction.toLowerCase();
  }
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

export function PredictionAnalysisTable({ rows, title = 'Predicciones Detalladas', onReportSuccess }: Props) {
  const [sorting, setSorting]             = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter]   = useState('');
  const [openLookbacks, setOpenLookbacks] = useState<Set<string>>(new Set());
  const [reportingRow, setReportingRow]   = useState<PredictionRow | null>(null);
  const [copiedCoords, setCopiedCoords]   = useState<string | null>(null);
  const [groupBy, setGroupBy]             = useState<GroupBy>('hora');

  const toggleLookback = (key: string) => {
    setOpenLookbacks(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleReportSuccess = async () => {
    showToast('✓ Reporte enviado correctamente');
    // BUG-008 FIX: Refetch datos después de reportar
    if (onReportSuccess) {
      try {
        await onReportSuccess();
      } catch (err) {
        console.warn('[PredictionAnalysisTable] Error in onReportSuccess callback:', err);
      }
    }
  };

  const columnHelper = createColumnHelper<PredictionRow>();

  const columns = useMemo(() => [
    columnHelper.accessor('localTimeUser', {
      id: 'horaLocal',
      header: 'Tu Hora Local',
      cell: info => (
        <span className="pat-time">{info.getValue()}</span>
      ),
      filterFn: (row, _id, value) =>
        row.original.localTimeUser.toLowerCase().includes(value.toLowerCase()),
      sortingFn: (a, b) =>
        a.original.localTimeUser.localeCompare(b.original.localTimeUser),
    }),
    columnHelper.accessor((row) => getCityLocalTime(row.queryTime, row.timezone), {
      id: 'horaCiudad',
      header: 'Hora Local (Ciudad)',
      cell: info => (
        <span className="pat-time">{info.getValue()}</span>
      ),
      filterFn: (row, _id, value) =>
        getCityLocalTime(row.original.queryTime, row.original.timezone)
          .toLowerCase().includes(value.toLowerCase()),
      sortingFn: (a, b) => {
        const timeA = getCityLocalTime(a.original.queryTime, a.original.timezone);
        const timeB = getCityLocalTime(b.original.queryTime, b.original.timezone);
        return timeA.localeCompare(timeB);
      },
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
      header: 'Condición Predicha',
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
        const key    = info.row.id;
        const isOpen = openLookbacks.has(key);
        const hasData = row.lookback12h.length > 0;
        return (
          <button
            className={`pat-btn-lookback ${row.correct === true ? 'success' : ''}`}
            onClick={() => toggleLookback(key)}
            disabled={!hasData}
            title={hasData ? 'Ver histórico de 12h' : 'Sin datos de histórico'}
          >
            {!hasData ? 'SIN DATOS' : isOpen ? 'CERRAR' : 'LOOKBACK'}
          </button>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: 'reportar',
      header: '⚠️',
      cell: info => (
        <button
          className="pat-btn-report"
          onClick={() => setReportingRow(info.row.original)}
          title="Reportar clima real"
          type="button"
        >
          ⚠️
        </button>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: 'copiarCoords',
      header: '📋',
      cell: info => {
        const row = info.row.original;
        const rowId = info.row.id;
        const isCopied = copiedCoords === rowId;
        return (
          <button
            className={`pat-btn-coords ${isCopied ? 'copied' : ''}`}
            onClick={() => {
              navigator.clipboard.writeText(`${row.lat.toFixed(4)}, ${row.lon.toFixed(4)}`);
              setCopiedCoords(rowId);
              setTimeout(() => setCopiedCoords(null), 2000);
            }}
            title={isCopied ? 'Copiado' : 'Copiar coordenadas'}
            type="button"
          >
            {isCopied ? '✓' : '📋'}
          </button>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ], [openLookbacks, reportingRow, copiedCoords]);

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
    initialState: { pagination: { pageSize: 20 }, sorting: [{ id: 'horaLocal', desc: true }] },
  });

  const handleGroupByChange = (mode: GroupBy) => {
    setGroupBy(mode);
    setSorting(GROUP_SORTS[mode]);
    table.setPageIndex(0);
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalFiltered = table.getFilteredRowModel().rows.length;

  const handleExportCSV = () => {
    const headers = ['Tu Hora Local', 'Hora Local (Ciudad)', 'Ciudad', 'Condición Predicha', 'Real', 'Resultado'];
    const lines = [headers.join(',')];
    table.getFilteredRowModel().rows.forEach(({ original: r }) => {
      const real      = r.actual ?? 'Sin datos';
      const resultado = r.correct === null ? 'No confirmado' : r.correct ? 'Acierto' : 'Fallo';
      const horaCiudad = getCityLocalTime(r.queryTime, r.timezone);
      lines.push(`"${r.localTimeUser}","${horaCiudad}","${r.cityName}","${r.prediction}","${real}","${resultado}"`);
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
        .pat-btn-lookback:hover:not(:disabled) { background: rgba(248, 81, 73, 0.15); }
        .pat-btn-lookback:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: rgba(248, 81, 73, 0.04);
        }
        .pat-btn-lookback.success {
          border-color: var(--ui-success);
          background: rgba(63, 185, 80, 0.08);
          color: var(--ui-success);
        }
        .pat-btn-lookback.success:hover:not(:disabled) { background: rgba(63, 185, 80, 0.15); }
        .pat-btn-lookback.success:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: rgba(63, 185, 80, 0.04);
        }

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

        /* ── Action buttons (Reportar + Copiar coords) ── */
        .pat-btn-report, .pat-btn-coords {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          font-size: 14px;
          transition: all 150ms ease;
          line-height: 1;
        }

        .pat-btn-report:hover, .pat-btn-coords:hover {
          color: var(--text-primary);
          transform: scale(1.1);
        }

        .pat-btn-coords.copied {
          color: var(--ui-success);
        }

        /* ── Group headers ──────────────────────────────── */
        .pat-group-header td {
          padding: 5px 12px;
          background: rgba(88, 166, 255, 0.06);
          border-top: 2px solid var(--border-default);
          border-bottom: 1px solid var(--border-subtle);
        }
        .pat-group-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pat-group-hour {
          font-family: 'Rajdhani', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--ui-accent);
        }
        .pat-group-count {
          font-family: 'Rajdhani', monospace;
          font-size: 10px;
          color: var(--text-secondary);
        }

        /* ── Group-by toggle ───────────────────────────── */
        .pat-group-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pat-group-toggle-label {
          font-family: 'Rajdhani', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-right: 4px;
          white-space: nowrap;
        }
        .pat-group-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .pat-group-btn:hover {
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }
        .pat-group-btn.active {
          background: rgba(88, 166, 255, 0.12);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
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

        <div className="pat-group-toggle">
          <span className="pat-group-toggle-label">Agrupar:</span>
          {(['hora', 'ciudad', 'clima'] as GroupBy[]).map(mode => (
            <button
              key={mode}
              className={`pat-group-btn ${groupBy === mode ? 'active' : ''}`}
              onClick={() => handleGroupByChange(mode)}
            >
              {mode === 'hora'   ? '⏰ Hora'   :
               mode === 'ciudad' ? '🏙️ Ciudad' :
                                   '🌤️ Clima'}
            </button>
          ))}
        </div>

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
              (() => {
                const pageRows = table.getRowModel().rows;
                const bucketCounts = new Map<string, number>();
                pageRows.forEach(r => {
                  const b = getGroupKey(r.original, groupBy);
                  bucketCounts.set(b, (bucketCounts.get(b) || 0) + 1);
                });

                let lastBucket = '';
                const result: JSX.Element[] = [];

                for (const row of pageRows) {
                  const bucket = getGroupKey(row.original, groupBy);

                  if (bucket !== lastBucket) {
                    lastBucket = bucket;
                    const count = bucketCounts.get(bucket) || 0;
                    const cond = bucket as WeatherCondition;
                    result.push(
                      <tr key={`group-${bucket}`} className="pat-group-header">
                        <td colSpan={columns.length}>
                          <div className="pat-group-row">
                            {groupBy === 'clima' ? (
                              <img
                                src={WEATHER_IMAGES[cond] || '/weather/cloudy.png'}
                                alt={bucket}
                                style={{ width: 14, height: 14 }}
                              />
                            ) : (
                              <span className="pat-group-hour">
                                {groupBy === 'hora' ? '⏰' : '🏙️'}
                              </span>
                            )}
                            <span className="pat-group-hour">
                              {groupBy === 'clima'
                                ? (CONDITION_LABEL[cond] || bucket)
                                : bucket}
                            </span>
                            <span className="pat-group-count">{count} prediccion{count !== 1 ? 'es' : ''}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const original = row.original;
                  const isOpen   = openLookbacks.has(row.id);
                  const hasLb    = original.lookback12h.length > 0;

                  result.push(
                    <Fragment key={row.id}>
                      <tr>
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
                                🔍 Lookback 12h — {original.lookback12h.length} predicciones anteriores{(() => { const confirmed = original.lookback12h.filter(x => x.wouldBeCorrect !== null); return confirmed.length > 0 ? ` · ${confirmed.filter(x => x.wouldBeCorrect).length}/${confirmed.length} confirmados acertaron` : ''; })()}
                              </div>
                              <div className="pat-lookback-grid">
                                {original.lookback12h.map((item, i) => {
                                  const cond  = item.condition.toLowerCase() as WeatherCondition;
                                  const itemTime = item.timestamp ? getCityLocalTime(item.timestamp, original.timezone) : 'N/A';
                                  return (
                                    <div
                                      key={`${row.id}-lb-${i}`}
                                      className={`pat-lookback-item ${item.wouldBeCorrect ? 'hit' : ''}`}
                                    >
                                      <div className="pat-lookback-hours">{itemTime}</div>
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
                    </Fragment>
                  );
                }

                return result;
              })()
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

      {/* Weather Report Modal */}
      {reportingRow && (
        <WeatherReportModal
          cityId={reportingRow.cityId}
          cityName={reportingRow.cityName}
          prediction={reportingRow.prediction}
          queryTime={reportingRow.queryTime}
          onClose={() => setReportingRow(null)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}

import { useRef, useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'

const DEBOUNCE_MS = 200

export default function SearchInput() {
  const setSearchQuery = useStore((s) => s.setSearchQuery)
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSearchQuery(v), DEBOUNCE_MS)
  }

  const handleClear = () => {
    setValue('')
    setSearchQuery('')
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <>
      <style>{`
        .fb-search {
          position: relative;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .fb-search-icon {
          position: absolute;
          left: 9px;
          width: 13px;
          height: 13px;
          color: var(--text-muted);
          pointer-events: none;
          flex-shrink: 0;
        }

        .fb-search-input {
          height: 28px;
          min-width: 180px;
          padding: 0 28px 0 28px;
          border-radius: 14px;
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          outline: none;
          transition: border-color 0.15s;
        }

        .fb-search-input::placeholder {
          color: var(--text-secondary);
        }

        .fb-search-input:focus {
          border-color: var(--ui-accent);
        }

        .fb-search-clear {
          position: absolute;
          right: 8px;
          width: 16px;
          height: 16px;
          border: none;
          background: var(--bg-elevated);
          color: var(--text-muted);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 11px;
          line-height: 1;
          padding: 0;
          transition: color 0.12s;
        }

        .fb-search-clear:hover {
          color: var(--text-primary);
        }

        /* Mobile responsive */
        @media (max-width: 767px) {
          .fb-search-input {
            min-width: auto;
            max-width: 160px;
            font-size: 11px;
            height: 26px;
            padding: 0 24px 0 24px;
          }
        }
      `}</style>

      <div className="fb-search">
        {/* Ícono lupa */}
        <svg className="fb-search-icon" viewBox="0 0 13 13" fill="none">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>

        <input
          className="fb-search-input"
          type="text"
          placeholder="Buscar ciudad..."
          value={value}
          onChange={handleChange}
          aria-label="Buscar ciudad"
        />

        {/* Botón X — solo si hay texto */}
        {value && (
          <button className="fb-search-clear" onClick={handleClear} aria-label="Limpiar búsqueda">
            ✕
          </button>
        )}
      </div>
    </>
  )
}

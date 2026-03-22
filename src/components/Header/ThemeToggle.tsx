import { useStore } from '../../data/useStore'

export default function ThemeToggle() {
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)

  return (
    <>
      <style>{`
        .tt-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.15s, background 0.15s, transform 0.15s;
        }

        .tt-btn:hover {
          border-color: var(--ui-accent);
          background: var(--bg-elevated);
          transform: rotate(20deg);
        }
      `}</style>

      <button
        className="tt-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </>
  )
}

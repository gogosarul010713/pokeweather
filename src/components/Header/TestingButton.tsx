interface TestingButtonProps {
  onClick: () => void
}

export default function TestingButton({ onClick }: TestingButtonProps) {
  return (
    <>
      <style>{`
        .testing-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 20px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
          color: var(--text-primary);
        }

        .testing-btn:hover {
          background-color: var(--bg-tertiary);
        }

        .testing-btn:active {
          transform: scale(0.95);
        }
      `}</style>

      <button
        className="testing-btn"
        onClick={onClick}
        title="Herramientas de Testing — Exportar datos a Excel"
        aria-label="Testing Tools"
      >
        🧪
      </button>
    </>
  )
}

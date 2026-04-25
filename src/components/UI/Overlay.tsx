interface OverlayProps {
  isActive: boolean
  message: React.ReactNode
  zIndex?: number
}

export default function Overlay({ isActive, message, zIndex = 100 }: OverlayProps) {
  if (!isActive) return null

  return (
    <>
      <style>{`
        .overlay-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: all;
          z-index: ${zIndex};
        }

        .overlay-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          pointer-events: auto;
          cursor: not-allowed;
        }

        .overlay-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .overlay-icon {
          font-size: 32px;
          line-height: 1;
        }

        .overlay-message p {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
          max-width: 80%;
        }
      `}</style>

      <div className="overlay-wrapper">
        <div className="overlay-background" />
        <div className="overlay-message">
          <div className="overlay-icon">🔒</div>
          <p>{message}</p>
        </div>
      </div>
    </>
  )
}

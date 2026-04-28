interface OverlayFilterPanelProps {
  isActive: boolean
  message: React.ReactNode
  zIndex?: number
}

export default function OverlayFilterPanel({ isActive, message, zIndex = 50 }: OverlayFilterPanelProps) {
  if (!isActive) return null

  return (
    <>
      <style>{`
        .ovfp-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: all;
          z-index: ${zIndex};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ovfp-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          pointer-events: auto;
          cursor: not-allowed;
        }

        .ovfp-content {
          position: relative;
          z-index: 1;
          pointer-events: none;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          max-width: 100%;
        }

        .ovfp-icon {
          font-size: 24px;
          line-height: 1;
        }

        .ovfp-message p {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
          word-wrap: break-word;
        }
      `}</style>

      <div className="ovfp-wrapper">
        <div className="ovfp-background" />
        <div className="ovfp-content">
          <div className="ovfp-icon">🔒</div>
          <div className="ovfp-message">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </>
  )
}

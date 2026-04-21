/**
 * AnalyticsPage: Página dedicada para análisis de predicciones
 * Puede ser renderizado como overlay/modal o página completa
 */

import { PredictionAnalysisDemo } from './PredictionAnalysisDemo';

interface AnalyticsPageProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function AnalyticsPage({ onClose, isModal = false }: AnalyticsPageProps) {
  return (
    <div className="analytics-page">
      <style>{`
        .analytics-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
        }

        .analytics-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
          background: var(--bg-secondary);
        }

        .analytics-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .analytics-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 6px 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .analytics-close:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .analytics-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }

        .analytics-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .analytics-modal-container {
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          width: 100%;
          max-width: 1200px;
          height: 80vh;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .analytics-modal-container {
            max-width: 100%;
            height: 90vh;
            max-height: none;
          }

          .analytics-header {
            padding: 16px;
          }

          .analytics-content {
            padding: 16px;
          }
        }
      `}</style>

      {isModal ? (
        <div className="analytics-modal-overlay" onClick={onClose}>
          <div className="analytics-modal-container" onClick={(e) => e.stopPropagation()}>
            <Header onClose={onClose} />
            <div className="analytics-content">
              <PredictionAnalysisDemo />
            </div>
          </div>
        </div>
      ) : (
        <>
          {onClose && <Header onClose={onClose} />}
          <div className="analytics-content">
            <PredictionAnalysisDemo />
          </div>
        </>
      )}
    </div>
  );
}

function Header({ onClose }: { onClose?: () => void }) {
  return (
    <div className="analytics-header">
      <div className="analytics-title">
        <span>📊</span>
        <span>Análisis de Predicciones</span>
      </div>
      {onClose && (
        <button
          className="analytics-close"
          onClick={onClose}
          title="Cerrar"
          aria-label="Cerrar"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default AnalyticsPage;

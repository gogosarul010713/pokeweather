import { useState } from 'react'
import { getRetentionDays, setRetentionDays } from '../../services/history/weatherHistoryService'
import HistoryGrid from './HistoryGrid'
import CachePanel from './CachePanel'
import PrecisionMetrics from './PrecisionMetrics'
import type { City } from '../../store/useStore'

interface TestingToolsProps {
  cities: City[]
  isOpen: boolean
  onClose: () => void
}

type TabType = 'historial' | 'cache' | 'metricas'

export default function TestingTools({ cities, isOpen, onClose }: TestingToolsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('historial')
  const [retentionDays, setRetentionDaysLocal] = useState<7 | 14 | 30>(
    (getRetentionDays() as 7 | 14 | 30) || 7
  )
  const [isMaximized, setIsMaximized] = useState(false)

  const handleRetentionChange = (days: 7 | 14 | 30) => {
    setRetentionDaysLocal(days)
    setRetentionDays(days)
  }

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  return (
    <>
      <style>{`
        .tt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          display: ${isOpen ? 'block' : 'none'};
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .tt-drawer {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 360px;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-default);
          z-index: 2001;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease-out;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease-out;
        }

        .tt-drawer.maximized {
          right: 0;
          left: 0;
          width: 100%;
          border-left: none;
          border-radius: 0;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .tt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .tt-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tt-header-actions {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .tt-button-icon {
          background: none;
          border: none;
          font-size: 18px;
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

        .tt-button-icon:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .tt-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .tt-close:hover {
          background-color: var(--bg-tertiary);
        }

        .tt-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--border-default);
          padding: 0;
          background: var(--bg-primary);
          flex-shrink: 0;
        }

        .tt-tab {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
          text-align: center;
        }

        .tt-tab:hover {
          color: var(--text-primary);
        }

        .tt-tab.active {
          color: var(--text-primary);
          border-bottom-color: #1F77E3;
        }

        .tt-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tt-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tt-section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tt-section-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          line-height: 1.5;
        }

        .tt-button {
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .tt-button-primary {
          background: linear-gradient(135deg, #1F77E3, #1856B4);
          color: white;
        }

        .tt-button-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 119, 227, 0.3);
        }

        .tt-button-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .tt-button-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .tt-button-secondary:hover:not(:disabled) {
          background: var(--bg-quaternary);
        }

        .tt-info {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          padding: 12px;
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .tt-city-count {
          font-weight: 600;
          color: var(--text-primary);
        }

        .tt-button-group {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }
      `}</style>

      {/* Overlay */}
      {isOpen && <div className="tt-overlay" onClick={onClose} />}

      {/* Drawer */}
      {isOpen && (
        <div className={`tt-drawer ${isMaximized ? 'maximized' : ''}`}>
          {/* Header */}
          <div className="tt-header">
            <h2 className="tt-title">🧪 Testing Tools</h2>
            <div className="tt-header-actions">
              <button
                className="tt-button-icon"
                onClick={handleToggleMaximize}
                title={isMaximized ? 'Minimizar' : 'Maximizar'}
                aria-label={isMaximized ? 'Minimizar' : 'Maximizar'}
              >
                {isMaximized ? '⛶' : '⛶'}
              </button>
              <button className="tt-close" onClick={onClose} title="Cerrar" aria-label="Cerrar">
                ✕
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tt-tabs">
            <button
              className={`tt-tab ${activeTab === 'historial' ? 'active' : ''}`}
              onClick={() => setActiveTab('historial')}
            >
              📊 Historial
            </button>
            <button
              className={`tt-tab ${activeTab === 'cache' ? 'active' : ''}`}
              onClick={() => setActiveTab('cache')}
            >
              🔧 Caché
            </button>
            <button
              className={`tt-tab ${activeTab === 'metricas' ? 'active' : ''}`}
              onClick={() => setActiveTab('metricas')}
            >
              📈 Métricas
            </button>
          </div>

          {/* Content */}
          <div className="tt-content">
            {/* Tab: Historial */}
            {activeTab === 'historial' && (
              <HistoryGrid
                cities={cities}
                retentionDays={retentionDays}
                onRetentionChange={handleRetentionChange}
              />
            )}

            {/* Tab: Caché */}
            {activeTab === 'cache' && <CachePanel />}

            {/* Tab: Métricas */}
            {activeTab === 'metricas' && <PrecisionMetrics retentionDays={retentionDays} />}
          </div>
        </div>
      )}
    </>
  )
}

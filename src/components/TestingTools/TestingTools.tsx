import { useState } from 'react'
import { exportCitiesToExcel } from '../../utils/exportToExcel'
import { getRetentionDays, setRetentionDays } from '../../services/history/weatherHistoryService'
import HistoryGrid from './HistoryGrid'
import type { City } from '../../store/useStore'

interface TestingToolsProps {
  cities: City[]
  isOpen: boolean
  onClose: () => void
}

type TabType = 'historial' | 'pruebas' | 'metricas'

export default function TestingTools({ cities, isOpen, onClose }: TestingToolsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('historial')
  const [retentionDays, setRetentionDaysLocal] = useState<7 | 14 | 30>(
    (getRetentionDays() as 7 | 14 | 30) || 7
  )
  const [isExporting, setIsExporting] = useState(false)

  const handleRetentionChange = (days: 7 | 14 | 30) => {
    setRetentionDaysLocal(days)
    setRetentionDays(days)
  }

  const handleExport = async (testNumber: 1 | 2 | 3) => {
    setIsExporting(true)
    try {
      await exportCitiesToExcel(cities, {
        testNumber,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error al exportar. Ver consola.')
    } finally {
      setIsExporting(false)
    }
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
        <div className="tt-drawer">
          {/* Header */}
          <div className="tt-header">
            <h2 className="tt-title">🧪 Testing Tools</h2>
            <button className="tt-close" onClick={onClose}>
              ✕
            </button>
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
              className={`tt-tab ${activeTab === 'pruebas' ? 'active' : ''}`}
              onClick={() => setActiveTab('pruebas')}
            >
              📥 Pruebas
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

            {/* Tab: Pruebas */}
            {activeTab === 'pruebas' && (
              <>
                {/* Exportar a Excel */}
                <div className="tt-section">
                  <h3 className="tt-section-title">Exportar Pruebas de Clima</h3>
                  <p className="tt-section-desc">
                    Descarga los datos climáticos actuales de las <span className="tt-city-count">{cities.length}</span> ciudades.
                    Tendrás una hora para verificar cada uno en Pokémon GO.
                  </p>

                  <div className="tt-button-group">
                    <button
                      className="tt-button tt-button-primary"
                      onClick={() => handleExport(1)}
                      disabled={isExporting || cities.length === 0}
                      title="Exporta los datos de hoy (Prueba 1)"
                    >
                      {isExporting ? '⏳' : '📥'} Prueba 1
                    </button>
                    <button
                      className="tt-button tt-button-primary"
                      onClick={() => handleExport(2)}
                      disabled={isExporting || cities.length === 0}
                      title="Exporta los datos para mañana (Prueba 2)"
                    >
                      {isExporting ? '⏳' : '📥'} Prueba 2
                    </button>
                    <button
                      className="tt-button tt-button-primary"
                      onClick={() => handleExport(3)}
                      disabled={isExporting || cities.length === 0}
                      title="Exporta los datos para el tercer día (Prueba 3)"
                    >
                      {isExporting ? '⏳' : '📥'} Prueba 3
                    </button>
                  </div>

                  <div className="tt-info">
                    <strong>📋 Formato:</strong> Cada archivo contiene las {cities.length} ciudades con columnas: Ciudad,
                    Clima, Coordenadas, y Real (que tú llenarás después de verificar en Pokémon GO).
                  </div>

                  <div className="tt-info">
                    <strong>📅 Workflow:</strong>
                    <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      <li>Haz clic en "Prueba 1" → descarga el archivo</li>
                      <li>Abre Pokémon GO y verifica los {cities.length} climas (tienes 1 hora)</li>
                      <li>Completa la columna "Real" en Excel con lo que viste</li>
                      <li>Repite 2 veces más (Prueba 2 y 3) en días diferentes</li>
                      <li>Compara resultados para detectar inconsistencias</li>
                    </ol>
                  </div>
                </div>

                {/* Info adicional */}
                <div className="tt-section">
                  <h3 className="tt-section-title">Notas</h3>
                  <div className="tt-info">
                    El clima que ves aquí proviene de <strong>AccuWeather API</strong>. Pokémon GO usa su propio servicio
                    meteorológico, así que puede haber diferencias ocasionales.
                  </div>
                </div>
              </>
            )}

            {/* Tab: Métricas (placeholder para US-609) */}
            {activeTab === 'metricas' && (
              <div className="tt-section">
                <h3 className="tt-section-title">Métricas de Precisión</h3>
                <div className="tt-info">
                  Próximamente: Precisión por condición climática vs. target 98% 📈
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

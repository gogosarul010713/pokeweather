import { useState } from 'react'
import { CONDITION_LABEL } from '../../config/weatherImages'
import { saveWeatherReport } from '../../services/firebase/classificationReportService'

const CONDITIONS: Array<{ value: string; label: string; emoji: string }> = [
  { value: 'sunny', label: 'Soleado', emoji: '☀️' },
  { value: 'partly', label: 'Parcial', emoji: '⛅' },
  { value: 'cloudy', label: 'Nublado', emoji: '☁️' },
  { value: 'rain', label: 'Lluvia', emoji: '🌧️' },
  { value: 'snow', label: 'Nieve', emoji: '❄️' },
  { value: 'fog', label: 'Niebla', emoji: '🌫️' },
  { value: 'windy', label: 'Ventoso', emoji: '💨' },
]

interface WeatherReportModalProps {
  cityId: string
  cityName: string
  prediction: string
  queryTime: string | Date
  dateHour: string
  onClose: () => void
  onSuccess?: (reportedCondition: string) => void
}

export default function WeatherReportModal({
  cityId,
  cityName,
  prediction,
  queryTime,
  dateHour,
  onClose,
  onSuccess,
}: WeatherReportModalProps) {
  const [selectedCondition, setSelectedCondition] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const predictionLabel = CONDITION_LABEL[prediction as keyof typeof CONDITION_LABEL] || prediction

  const handleSubmit = async () => {
    if (!selectedCondition) {
      setErrorMsg('Selecciona una condición')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      await saveWeatherReport(
        cityId,
        cityName,
        prediction,
        selectedCondition,
        queryTime,
        'prediction-table',
        dateHour
      )

      setIsLoading(false)
      onSuccess?.(selectedCondition)
      onClose()
    } catch (err) {
      console.error('Error al guardar reporte:', err)
      setErrorMsg('Error al enviar reporte. Intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .wrm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1100;
          animation: fadeIn 150ms ease;
        }

        .wrm-modal {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-height: 80vh;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-default);
          border-radius: 16px 16px 0 0;
          z-index: 1101;
          display: flex;
          flex-direction: column;
          animation: slideUp 250ms ease;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
        }

        .wrm-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .wrm-title {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--text-primary);
        }

        .wrm-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .wrm-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wrm-section-label {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--text-secondary);
        }

        .wrm-info-box {
          padding: 10px 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          font-family: 'Exo 2', sans-serif;
          font-size: 13px;
          color: var(--text-primary);
        }

        .wrm-dropdown {
          width: 100%;
          padding: 10px 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: 'Exo 2', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .wrm-dropdown:hover {
          border-color: var(--border-strong);
        }

        .wrm-dropdown:focus {
          outline: none;
          border-color: var(--ui-accent, #58a6ff);
          box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.1);
        }

        .wrm-error {
          padding: 10px 12px;
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 6px;
          color: #ff4757;
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
        }

        .wrm-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--border-default);
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .wrm-btn {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-primary);
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .wrm-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        .wrm-btn-primary {
          background: var(--ui-accent, #58a6ff);
          color: white;
          border-color: var(--ui-accent, #58a6ff);
        }

        .wrm-btn-primary:hover {
          background: rgba(88, 166, 255, 0.9);
          border-color: rgba(88, 166, 255, 0.9);
        }

        .wrm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .wrm-modal {
            max-height: 85vh;
          }
        }
      `}</style>

      <div className="wrm-backdrop" onClick={onClose} />

      <div className="wrm-modal">
        <div className="wrm-header">
          <div className="wrm-title">📊 Reportar clima real</div>
        </div>

        <div className="wrm-content">
          {/* Predicción */}
          <div className="wrm-section">
            <div className="wrm-section-label">Predicción para {cityName}</div>
            <div className="wrm-info-box">
              {predictionLabel}
            </div>
          </div>

          {/* Seleccionar clima real */}
          <div className="wrm-section">
            <div className="wrm-section-label">¿Cuál fue el clima real?</div>
            <select
              className="wrm-dropdown"
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value)
                setErrorMsg('')
              }}
            >
              <option value="">Seleccionar...</option>
              {CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.emoji} {cond.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {errorMsg && <div className="wrm-error">{errorMsg}</div>}
        </div>

        <div className="wrm-footer">
          <button
            className="wrm-btn"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="wrm-btn wrm-btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || !selectedCondition}
            type="button"
          >
            {isLoading ? 'Enviando...' : 'Reportar'}
          </button>
        </div>
      </div>
    </>
  )
}

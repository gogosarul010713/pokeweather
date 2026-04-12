import { useState } from 'react'
import type { City } from '../../store/useStore'
import { CONDITION_LABEL } from '../../services/weather/weatherService'
import { saveClassificationReport, isDuplicateReport } from '../../services/firebase/classificationReportService'

const CONDITIONS: Array<{ value: string; label: string; emoji: string }> = [
  { value: 'sunny', label: 'Soleado', emoji: '☀️' },
  { value: 'partly', label: 'Parcial', emoji: '⛅' },
  { value: 'cloudy', label: 'Nublado', emoji: '☁️' },
  { value: 'rain', label: 'Lluvia', emoji: '🌧️' },
  { value: 'snow', label: 'Nieve', emoji: '❄️' },
  { value: 'fog', label: 'Niebla', emoji: '🌫️' },
  { value: 'windy', label: 'Ventoso', emoji: '💨' },
]

interface ClassificationReportModalProps {
  city: City
  onClose: () => void
  onSuccess?: () => void
}

export default function ClassificationReportModal({
  city,
  onClose,
  onSuccess,
}: ClassificationReportModalProps) {
  const [selectedCondition, setSelectedCondition] = useState('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const currentConditionLabel =
    CONDITION_LABEL[city.condition as keyof typeof CONDITION_LABEL] ||
    city.condition

  const handleSubmit = async () => {
    if (!selectedCondition) {
      setErrorMsg('Selecciona una condición')
      return
    }

    if (selectedCondition === city.condition) {
      setErrorMsg('Selecciona una condición diferente a la actual')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      const dateHour = new Date()
        .toISOString()
        .slice(0, 13)
        .replace('T', '-')

      const isDuplicate = await isDuplicateReport(city.id, dateHour)
      if (isDuplicate) {
        setErrorMsg('Ya existe un reporte para esta ciudad en esta hora')
        setIsLoading(false)
        return
      }

      // TODO: Obtener correctTypes basado en selectedCondition
      // Para ahora, asumir que el sistema las calcula
      const correctTypes: string[] = []

      await saveClassificationReport(
        city,
        city.condition,
        city.boostedTypes,
        selectedCondition,
        correctTypes,
        comment,
        dateHour
      )

      // Feedback visual
      setIsLoading(false)
      onSuccess?.()
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
        .crm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1100;
          animation: fadeIn 150ms ease;
        }

        .crm-modal {
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

        .crm-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .crm-title {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--text-primary);
        }

        .crm-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .crm-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .crm-section-label {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--text-secondary);
        }

        .crm-info-box {
          padding: 10px 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          font-family: 'Exo 2', sans-serif;
          font-size: 13px;
          color: var(--text-primary);
        }

        .crm-dropdown {
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

        .crm-dropdown:hover {
          border-color: var(--border-strong);
        }

        .crm-dropdown:focus {
          outline: none;
          border-color: var(--ui-accent, #58a6ff);
          box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.1);
        }

        .crm-textarea {
          width: 100%;
          padding: 10px 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: 'Exo 2', sans-serif;
          font-size: 13px;
          resize: vertical;
          min-height: 80px;
          transition: all 150ms ease;
        }

        .crm-textarea:hover {
          border-color: var(--border-strong);
        }

        .crm-textarea:focus {
          outline: none;
          border-color: var(--ui-accent, #58a6ff);
          box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.1);
        }

        .crm-char-count {
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          color: var(--text-secondary);
          text-align: right;
        }

        .crm-error {
          padding: 10px 12px;
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 6px;
          color: #ff4757;
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
        }

        .crm-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--border-default);
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .crm-btn {
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

        .crm-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        .crm-btn-primary {
          background: var(--ui-accent, #58a6ff);
          color: white;
          border-color: var(--ui-accent, #58a6ff);
        }

        .crm-btn-primary:hover {
          background: rgba(88, 166, 255, 0.9);
          border-color: rgba(88, 166, 255, 0.9);
        }

        .crm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .crm-modal {
            max-height: 85vh;
          }
        }
      `}</style>

      <div className="crm-backdrop" onClick={onClose} />

      <div className="crm-modal">
        <div className="crm-header">
          <div className="crm-title">⚠️ Reportar clasificación incorrecta</div>
        </div>

        <div className="crm-content">
          {/* Clasificación actual */}
          <div className="crm-section">
            <div className="crm-section-label">Clasificado como</div>
            <div className="crm-info-box">
              {currentConditionLabel}
              {city.boostedTypes.length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Tipos: {city.boostedTypes.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Seleccionar condición correcta */}
          <div className="crm-section">
            <div className="crm-section-label">¿Cuál es la condición correcta?</div>
            <select
              className="crm-dropdown"
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

          {/* Comentario opcional */}
          <div className="crm-section">
            <div className="crm-section-label">Comentario (opcional)</div>
            <textarea
              className="crm-textarea"
              placeholder="¿Por qué crees que es incorrecto?"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 200))}
            />
            <div className="crm-char-count">
              {comment.length}/200
            </div>
          </div>

          {/* Error */}
          {errorMsg && <div className="crm-error">{errorMsg}</div>}
        </div>

        <div className="crm-footer">
          <button
            className="crm-btn"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="crm-btn crm-btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || !selectedCondition}
            type="button"
          >
            {isLoading ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
      </div>
    </>
  )
}

/**
 * src/components/TestingTools/CacheDetailPopup.tsx
 * Popup para ver detalle de una entrada de caché (JSON + metadata)
 * US-606: Inspector Visual de Caché
 */

import { useState } from 'react'
import type { CacheDetailPopupProps } from '../../types/cache'
import {
  formatTimestamp,
  getTimeUntilExpiration,
  formatBytes,
} from '../../utils/cacheDebugHelper'

export default function CacheDetailPopup({
  entry,
  isOpen,
  onClose,
}: CacheDetailPopupProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !entry) return null

  const handleCopyJSON = async () => {
    try {
      const json = JSON.stringify(entry.value, null, 2)
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      <div className="cdp-overlay" onClick={handleBackdropClick}>
        <div className="cdp-modal">
          {/* Header */}
          <div className="cdp-header">
            <div className="cdp-title">
              {entry.type === 'locationKey' ? '📍' : '🌦️'} {entry.key}
            </div>
            <button className="cdp-close" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </div>

          {/* JSON Viewer */}
          <div className="cdp-json-container">
            <pre className="cdp-json">
              {JSON.stringify(entry.value, null, 2)}
            </pre>
          </div>

          {/* Metadata */}
          <div className="cdp-metadata">
            <div className="cdp-metadata-row">
              <span className="cdp-label">📝 Guardado:</span>
              <span className="cdp-value">{formatTimestamp(entry.savedAt)}</span>
            </div>

            {entry.expiresAt && (
              <>
                <div className="cdp-metadata-row">
                  <span className="cdp-label">⏱️ TTL restante:</span>
                  <span className="cdp-value">{getTimeUntilExpiration(entry.expiresAt)}</span>
                </div>
                <div className="cdp-metadata-row">
                  <span className="cdp-label">⏰ Expira en:</span>
                  <span className="cdp-value">{formatTimestamp(entry.expiresAt)}</span>
                </div>
              </>
            )}

            <div className="cdp-metadata-row">
              <span className="cdp-label">📦 Tamaño:</span>
              <span className="cdp-value">{formatBytes(entry.size)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="cdp-footer">
            <button
              className="cdp-button cdp-button-copy"
              onClick={handleCopyJSON}
              disabled={copied}
            >
              {copied ? '✅ Copiado' : '📋 Copiar JSON'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .cdp-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 200ms ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .cdp-modal {
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          animation: slideUp 200ms ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .cdp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-primary);
          gap: 12px;
        }

        .cdp-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
          word-break: break-all;
          flex: 1;
        }

        .cdp-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 18px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 200ms ease;
        }

        .cdp-close:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .cdp-json-container {
          flex: 1;
          overflow: auto;
          padding: 16px;
          background: var(--bg-primary);
          border-radius: 4px;
          margin: 0 16px;
        }

        .cdp-json {
          margin: 0;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 11px;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.4;
        }

        .cdp-metadata {
          padding: 12px 16px;
          border-top: 1px solid var(--border-primary);
          background: var(--bg-primary);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 12px;
        }

        .cdp-metadata-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cdp-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .cdp-value {
          color: var(--text-primary);
          font-family: 'Monaco', 'Courier New', monospace;
          word-break: break-all;
        }

        .cdp-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border-primary);
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .cdp-button {
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid var(--border-primary);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 200ms ease;
        }

        .cdp-button:hover:not(:disabled) {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .cdp-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cdp-button-copy {
          background: var(--success);
          color: white;
          border-color: var(--success);
        }

        .cdp-button-copy:hover:not(:disabled) {
          background: var(--success);
          filter: brightness(1.1);
        }
      `}</style>
    </>
  )
}

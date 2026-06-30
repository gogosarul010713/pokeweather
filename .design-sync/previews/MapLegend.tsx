// MapLegend preview — renderiza el componente real directamente
// (no necesita MapContainer, es un panel overlay absoluto)

import MapLegend from 'pokeweather'
import { useStore } from '../../src/store/useStore'

useStore.setState({
  badgeFilter: ['stops', 'gyms'],
  showBadgesOnPins: true,
})

export function MapLegend() {
  return (
    <>
      <style>{`
        .mlp-root {
          padding: 20px;
          font-family: 'Exo 2', sans-serif;
          background: var(--bg-primary);
          border-radius: 8px;
          border: 1px solid var(--border-default);
        }

        .mlp-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .mlp-note {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .mlp-container {
          position: relative;
          background: #1a1f2e;
          border-radius: 8px;
          height: 300px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          overflow: hidden;
          border: 1px solid var(--border-subtle, var(--border-default));
        }

        .mlp-map-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .mlp-label {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          font-family: 'Exo 2', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
      `}</style>

      <div className="mlp-root">
        <div className="mlp-title">MapLegend — Leyenda con pestanas (Clima / Categorias)</div>

        <div className="mlp-note">
          Panel colapsable con dos pestanas: condiciones climaticas (puntos de color) y
          filtros de categorias con toggle de badges en pines.
          Estado inicial: badgeFilter = [stops, gyms], showBadgesOnPins = true.
        </div>

        {/* Simulacion de mapa con leyenda en esquina */}
        <div className="mlp-container">
          <div className="mlp-map-bg" />
          <div className="mlp-label">Fondo de mapa (simulado)</div>
          <MapLegend />
        </div>
      </div>
    </>
  )
}

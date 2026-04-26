import { useStore } from '../../store/useStore'
import { ResponsiveImage } from '../UI/ResponsiveImage'

const IconClima = () => (
  <ResponsiveImage
    avifSrc="/assets/icons/nube_avif.avif"
    webpSrc="/assets/icons/nube_webp.webp"
    alt="Ícono de clima"
    width={40}
    height={40}
  />
)

const IconNidos = () => (
  <ResponsiveImage
    avifSrc="/assets/icons/pokenido_avif.avif"
    webpSrc="/assets/icons/pokenido_webp.webp"
    alt="Ícono de nidos"
    width={46}
    height={46}
  />
)

const IconTodo = () => (
  <ResponsiveImage
    avifSrc="/assets/icons/mapa_avif.avif"
    webpSrc="/assets/icons/mapa_webp.webp"
    alt="Ícono de mapa - ambas capas"
    width={46}
    height={46}
  />
)

export default function TabControl() {
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)

  const handleTabClick = (tab: 'clima' | 'nidos' | 'todo') => {
    setActiveTab(tab)
  }

  return (
    <>
      <style>{`
        .tab-control {
          padding: 4px 6px 2px 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-bottom: 0.5px solid var(--border-default);
        }

        .tab-buttons {
          display: flex;
          flex-direction: row;
          gap: 1px;
          width: 100%;
        }

        .tab-button {
          flex: 1;
          padding: 3px 8px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          border-radius: 0;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-weight: 400;
          color: var(--text-muted);
          font-size: 13px;
          transition: all 200ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tab-button svg,
        .tab-button picture {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tab-button picture img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          object-position: center;
        }

        .tab-button:first-child picture {
          width: 40px;
          height: 40px;
        }

        .tab-button:hover {
          color: var(--text-primary);
        }

        .tab-button.tab-active {
          background: transparent;
          color: var(--text-primary);
          font-weight: 500;
          border-bottom: 2px solid #4DA3FF;
        }
      `}</style>

      <div className="tab-control">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'clima' ? 'tab-active' : ''}`}
            onClick={() => handleTabClick('clima')}
            type="button"
            title="Ver ciudades y clima"
          >
            <IconClima />
            <span>Clima</span>
          </button>

          <button
            className={`tab-button ${activeTab === 'nidos' ? 'tab-active' : ''}`}
            onClick={() => handleTabClick('nidos')}
            type="button"
            title="Ver nidos de Pokémon"
          >
            <IconNidos />
            <span>Nidos</span>
          </button>

          <button
            className={`tab-button ${activeTab === 'todo' ? 'tab-active' : ''}`}
            onClick={() => handleTabClick('todo')}
            type="button"
            title="Ver ambas capas simultáneamente"
          >
            <IconTodo />
            <span>Todo</span>
          </button>
        </div>
      </div>
    </>
  )
}

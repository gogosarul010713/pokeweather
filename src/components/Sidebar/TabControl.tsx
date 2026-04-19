import { useStore } from '../../store/useStore'
import climaSvg from '../../assets/icons/clima.svg'

// SVG Icons
const IconClima = ({ width = 60 } = {}) => (
  <img src={climaSvg} alt="Clima" width={width} height="auto" style={{ display: 'block' }} />
)

const IconNidos = ({ width = 60, height = 40 } = {}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 50 280 130" width={width} height={height}>
    <defs>
      <clipPath id="nestClip">
        <path d="M -92,8 Q -96,55 -66,74 Q -34,84 0,84 Q 34,84 66,74 Q 96,55 92,8 Q 46,-2 0,-4 Q -46,-2 -92,8 Z"/>
      </clipPath>
      <clipPath id="nestFrontClip">
        <path d="M -92,8 Q -46,20 0,24 Q 46,20 92,8 Q 96,55 66,74 Q 34,84 0,84 Q -34,84 -66,74 Q -96,55 -92,8 Z"/>
      </clipPath>
    </defs>
    <g transform="translate(140, 105)">
      {/* Nido base */}
      <path d="M -92,8 Q -96,55 -66,74 Q -34,84 0,84 Q 34,84 66,74 Q 96,55 92,8 Q 46,-2 0,-4 Q -46,-2 -92,8 Z" fill="#c8a056" stroke="#7a4e18" strokeWidth="3" strokeLinejoin="round"/>
      <g clipPath="url(#nestClip)">
        <path d="M -90,2  Q 0,10  90,2"  fill="none" stroke="#a07030" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M -90,14 Q 0,22  90,14" fill="none" stroke="#dbb870" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M -90,24 Q 0,32  90,24" fill="none" stroke="#a07030" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M -86,35 Q 0,44  86,35" fill="none" stroke="#dbb870" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M -80,46 Q 0,55  80,46" fill="none" stroke="#a07030" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M -70,57 Q 0,65  70,57" fill="none" stroke="#dbb870" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M -56,67 Q 0,74  56,67" fill="none" stroke="#a07030" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M -92,8  Q -40,50  -10,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M -70,-2 Q -20,42   10,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M -40,-4 Q  10,38   40,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M -10,-4 Q  40,36   70,78" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  20,-4 Q  66,34   90,60" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  50,-2 Q  88,26   92,45" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  92,8  Q  40,50   10,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  70,-2 Q  20,42  -10,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  40,-4 Q -10,38  -40,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  10,-4 Q -40,36  -70,78" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M -20,-4 Q -66,34  -90,60" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </g>
      {/* Pokéball */}
      <path d="M -50,-8 A 50,50 0 0 1 50,-8 Z" fill="#f2a882" stroke="#3a4d5c" strokeWidth="2.8"/>
      <path d="M -50,-8 A 50,50 0 0 0 50,-8 Z" fill="#c2dde8" stroke="#3a4d5c" strokeWidth="2.8"/>
      <circle cx="0" cy="-8" r="50" fill="none" stroke="#3a4d5c" strokeWidth="2.8"/>
      <line x1="-50" y1="-8" x2="50" y2="-8" stroke="#3a4d5c" strokeWidth="2.8"/>
      <circle cx="0" cy="-8" r="12" fill="#3a4d5c"/>
      <circle cx="0" cy="-8" r="7.5" fill="#ffffff" stroke="#3a4d5c" strokeWidth="2"/>
      <ellipse cx="-15" cy="-25" rx="9" ry="5" fill="rgba(255,255,255,0.42)" transform="rotate(-35,-15,-25)"/>
      {/* Frente del nido */}
      <path d="M -92,8 Q -46,20 0,24 Q 46,20 92,8 Q 96,55 66,74 Q 34,84 0,84 Q -34,84 -66,74 Q -96,55 -92,8 Z" fill="#c8a056" stroke="none"/>
      <g clipPath="url(#nestFrontClip)">
        <path d="M -90,14 Q 0,22  90,14" fill="none" stroke="#dbb870" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M -90,24 Q 0,32  90,24" fill="none" stroke="#a07030" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M -86,35 Q 0,44  86,35" fill="none" stroke="#dbb870" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M -80,46 Q 0,55  80,46" fill="none" stroke="#a07030" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M -70,57 Q 0,65  70,57" fill="none" stroke="#dbb870" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M -56,67 Q 0,74  56,67" fill="none" stroke="#a07030" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M -92,8  Q -40,50  -10,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M -60,8  Q -10,48   20,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M -20,8  Q  30,44   55,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  20,8  Q  65,40   80,72" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  60,8  Q  88,30   92,50" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  92,8  Q  40,50   10,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  55,8  Q  10,46  -20,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M  15,8  Q -30,44  -56,82" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M -25,8  Q -70,38  -86,68" fill="none" stroke="#8b5a20" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </g>
      {/* Contornos */}
      <path d="M -92,8 Q -96,55 -66,74 Q -34,84 0,84 Q 34,84 66,74 Q 96,55 92,8" fill="none" stroke="#7a4e18" strokeWidth="3" strokeLinecap="round"/>
      <path d="M -92,8 Q -46,20 0,24 Q 46,20 92,8" fill="none" stroke="#7a4e18" strokeWidth="3" strokeLinecap="round"/>
      {/* Ramitas izquierda */}
      <path d="M -92,8  Q -112,-4  -126,-14" fill="none" stroke="#6a3e10" strokeWidth="5" strokeLinecap="round"/>
      <path d="M -92,8  Q -112,-4  -126,-14" fill="none" stroke="#a06828" strokeWidth="3" strokeLinecap="round"/>
      <path d="M -92,18 Q -114,12  -128,6"   fill="none" stroke="#6a3e10" strokeWidth="5" strokeLinecap="round"/>
      <path d="M -92,18 Q -114,12  -128,6"   fill="none" stroke="#a06828" strokeWidth="3" strokeLinecap="round"/>
      <path d="M -110,-2 Q -118,-10 -120,-18" fill="none" stroke="#6a3e10" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M -110,-2 Q -118,-10 -120,-18" fill="none" stroke="#a06828" strokeWidth="2" strokeLinecap="round"/>
      {/* Ramitas derecha */}
      <path d="M  92,8  Q  112,-4   126,-14" fill="none" stroke="#6a3e10" strokeWidth="5" strokeLinecap="round"/>
      <path d="M  92,8  Q  112,-4   126,-14" fill="none" stroke="#a06828" strokeWidth="3" strokeLinecap="round"/>
      <path d="M  92,18 Q  114,12   128,6"   fill="none" stroke="#6a3e10" strokeWidth="5" strokeLinecap="round"/>
      <path d="M  92,18 Q  114,12   128,6"   fill="none" stroke="#a06828" strokeWidth="3" strokeLinecap="round"/>
      <path d="M  110,-2 Q  118,-10  120,-18" fill="none" stroke="#6a3e10" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M  110,-2 Q  118,-10  120,-18" fill="none" stroke="#a06828" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>
)

const IconTodo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M7 8h10M7 12h10M7 16h10"/>
  </svg>
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
          padding: 6px 6px 4px 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-bottom: 0.5px solid var(--border-default);
        }

        .tab-buttons {
          display: flex;
          flex-direction: row;
          gap: 2px;
          width: 100%;
        }

        .tab-button {
          flex: 1;
          padding: 4px 8px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          border-radius: 0;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font-weight: 400;
          color: var(--text-muted);
          font-size: 13px;
          transition: all 200ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tab-button svg {
          flex-shrink: 0;
          width: 60px;
          height: auto;
          max-height: 45px;
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

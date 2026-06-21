import { useStore } from '../../store/useStore'
import FilterPanelClima from './FilterPanelClima'
import FilterPanelNests from './FilterPanelNests'
import OverlayFilterPanel from '../UI/OverlayFilterPanel'

export default function FilterPanel() {
  const activeTab = useStore((s) => s.activeTab)
  const isTodo = activeTab === 'todo'

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        height: '100%',
      }}
    >
      {!isTodo && activeTab === 'clima' && <FilterPanelClima />}
      {!isTodo && activeTab === 'nidos' && <FilterPanelNests />}

      {isTodo && (
        <OverlayFilterPanel
          isActive={true}
          message="Activa Clima o Nidos para filtrar"
          zIndex={50}
        />
      )}
    </div>
  )
}

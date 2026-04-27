import { useStore } from '../../store/useStore'
import FilterPanelClima from './FilterPanelClima'
import FilterPanelNests from './FilterPanelNests'
import Overlay from '../UI/Overlay'

export default function FilterPanel() {
  const activeTab = useStore((s) => s.activeTab)

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {activeTab === 'clima' && <FilterPanelClima />}
      {activeTab === 'nidos' && <FilterPanelNests />}

      {activeTab === 'todo' && (
        <Overlay
          isActive={true}
          message="No se puede filtrar cuando Todo está activo"
          zIndex={50}
        />
      )}
    </div>
  )
}

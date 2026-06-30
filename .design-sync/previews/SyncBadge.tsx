import { useStore } from '../../src/store/useStore'
import SyncBadge from 'pokeweather/src/components/UI/SyncBadge'

export function SyncBadgeReady() {
  useStore.setState({ loadingStatus: 'ready', lastUpdated: Date.now() })
  return (
    <div style={{ padding: 16 }}>
      <SyncBadge />
    </div>
  )
}

export function SyncBadgeLoading() {
  useStore.setState({ loadingStatus: 'loading', lastUpdated: null })
  return (
    <div style={{ padding: 16 }}>
      <SyncBadge />
    </div>
  )
}

export function SyncBadgeError() {
  useStore.setState({ loadingStatus: 'error', lastUpdated: null })
  return (
    <div style={{ padding: 16 }}>
      <SyncBadge />
    </div>
  )
}

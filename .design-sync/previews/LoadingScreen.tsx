import { useStore } from '../../src/store/useStore'
import LoadingScreen from 'pokeweather/src/components/UI/LoadingScreen'

export function LoadingScreenWithProgress() {
  useStore.setState({
    loadingStatus: 'loading',
    loadingProgress: { cityName: 'Tokyo', current: 3, total: 20, percent: 15 },
  })
  return (
    <div style={{ position: 'relative', height: 400, overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <LoadingScreen mode="initial" />
    </div>
  )
}

export function LoadingScreenRefreshMode() {
  useStore.setState({
    loadingStatus: 'loading',
    loadingProgress: { cityName: 'Paris', current: 8, total: 20, percent: 40 },
  })
  return (
    <div style={{ position: 'relative', height: 400, overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <LoadingScreen mode="refresh" />
    </div>
  )
}

export function LoadingScreenIdle() {
  useStore.setState({
    loadingStatus: 'ready',
    loadingProgress: { cityName: '', current: 0, total: 0, percent: 0 },
  })
  return (
    <div style={{ position: 'relative', height: 200, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        LoadingScreen oculta (loadingStatus: ready)
      </span>
      <LoadingScreen mode="initial" />
    </div>
  )
}

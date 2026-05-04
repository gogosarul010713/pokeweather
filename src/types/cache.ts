/**
 * src/types/cache.ts
 * Tipos TypeScript para Inspector Visual de Caché (US-606)
 */

export interface CacheEntry {
  id: string                    // clave única
  type: 'locationKey' | 'weather'
  key: string                   // nombre de la clave
  value: string | number | boolean | Record<string, unknown>  // valor serializado
  savedAt: number               // timestamp guardado (ms)
  expiresAt?: number            // timestamp expiración (ms, solo weather)
  size: number                  // bytes
}

export interface CacheMetrics {
  totalEntries: number
  locationKeyCount: number
  weatherCount: number
  validCount: number
  expiredCount: number
  expiringCount: number
  totalSize: number             // bytes
  storagePercentage: number     // 0-100
}

export type CacheEntryStatus = 'valid' | 'expiring' | 'expired'
export type CacheFilterType = 'all' | 'locationKeys' | 'weather' | 'valid' | 'expired'

export interface CacheDetailPopupProps {
  entry: CacheEntry | null
  isOpen: boolean
  onClose: () => void
}

export interface CachePanelState {
  entries: CacheEntry[]
  metrics: CacheMetrics
  selectedIds: Set<string>
  filter: CacheFilterType
  searchQuery: string
  isDetailPopupOpen: boolean
  detailEntry: CacheEntry | null
  isLoading: boolean
}

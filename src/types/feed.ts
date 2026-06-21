import type { City } from '../store/useStore'
import type { Nest } from './nest'

export interface FeedItem {
  id: string
  name: string
  location: string      // ciudad, pais -- para mostrar bajo el nombre
  lat: number
  lon: number
  climaData: City | null
  nidoData: Nest | null
}

export type NavPinType = 'search' | 'radar'

export interface NavPinState {
  lat: number
  lon: number
  type: NavPinType
  label?: string
}

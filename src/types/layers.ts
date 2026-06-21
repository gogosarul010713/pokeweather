export type LayerKey = 'clima' | 'nidos' | 'gyms' | 'stops' | 'rutas'

export interface ActiveLayers {
  clima: boolean
  nidos: boolean
  gyms: boolean
  stops: boolean
  rutas: boolean
}

export const DEFAULT_LAYERS: ActiveLayers = {
  clima: true,
  nidos: false,
  gyms: false,
  stops: false,
  rutas: false,
}

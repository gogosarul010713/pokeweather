import FeedHeader from 'pokeweather'

export function Default() {
  return <FeedHeader label="Ciudades" />
}

export function WithCustomIcon() {
  return <FeedHeader label="Nidos activos" icon="🐣" />
}

export function ClimaLabel() {
  return <FeedHeader label="Ciudades con clima cargado" icon="🌤️" />
}

export function WithCount() {
  return <FeedHeader label="42 resultados" icon="📋" />
}

export function NidosLabel() {
  return <FeedHeader label="Nidos — Tokyo" icon="🗺️" />
}

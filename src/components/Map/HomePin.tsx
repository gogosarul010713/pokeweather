import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'
import { useStore } from '../../store/useStore'

interface HomePinProps {
  mapRef: React.RefObject<LeafletMap | null>
}

// Pin estatico: teardrop naranja rotado, emoji casa centrado
const HOME_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
  <defs>
    <filter id="hp-shadow" x="-40%" y="-20%" width="180%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
  </defs>
  <!-- teardrop rotado 45deg segun mockup: circulo arriba-izq, punta abajo-der -->
  <g transform="translate(16,16) rotate(-45) translate(-14,-14)">
    <path d="M14 0 C6.27 0 0 6.27 0 14 C0 21.73 14 28 14 28 C14 28 28 21.73 28 14 C28 6.27 21.73 0 14 0Z"
      fill="var(--home,#FF6B35)"
      stroke="rgba(255,255,255,0.35)"
      stroke-width="2"
      filter="url(#hp-shadow)"
      style="filter:drop-shadow(0 0 8px var(--home-glow,rgba(255,107,53,0.5)))"/>
  </g>
  <text x="16" y="20" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.95)">🏠</text>
  <!-- cola -->
  <rect x="15" y="38" width="2" height="6" rx="1" fill="var(--home,#FF6B35)" opacity="0.6"/>
</svg>`

// Radar: 3 ondas concentricas naranjas + pin central
const HOME_RADAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <defs>
    <style>
      .hp-w1 { animation: hp-pulse-out 2.8s ease-out infinite 0s; transform-origin: 40px 40px; }
      .hp-w2 { animation: hp-pulse-out 2.8s ease-out infinite 0.9s; transform-origin: 40px 40px; }
      .hp-w3 { animation: hp-pulse-out 2.8s ease-out infinite 1.8s; transform-origin: 40px 40px; }
      @keyframes hp-pulse-out {
        0%   { transform: scale(0.05); opacity: 0.9; }
        100% { transform: scale(1);    opacity: 0; }
      }
    </style>
    <filter id="hp-glow">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="var(--home-glow,rgba(255,107,53,0.5))"/>
    </filter>
  </defs>
  <!-- area tenue -->
  <circle cx="40" cy="40" r="38" fill="var(--home-dim,rgba(255,107,53,0.08))"/>
  <!-- borde punteado exterior -->
  <circle cx="40" cy="40" r="37" fill="none" stroke="rgba(255,107,53,0.25)" stroke-width="1" stroke-dasharray="4 3"/>
  <!-- 3 ondas -->
  <circle class="hp-w1" cx="40" cy="40" r="36" fill="none" stroke="var(--home,#FF6B35)" stroke-width="1.5"/>
  <circle class="hp-w2" cx="40" cy="40" r="36" fill="none" stroke="var(--home,#FF6B35)" stroke-width="1.5"/>
  <circle class="hp-w3" cx="40" cy="40" r="36" fill="none" stroke="var(--home,#FF6B35)" stroke-width="1.5"/>
  <!-- pin central: teardrop rotado -->
  <g transform="translate(40,40) rotate(-45) translate(-8,-8)">
    <path d="M8 0 C3.58 0 0 3.58 0 8 C0 12.42 8 16 8 16 C8 16 16 12.42 16 8 C16 3.58 12.42 0 8 0Z"
      fill="var(--home,#FF6B35)"
      stroke="rgba(255,255,255,0.35)"
      stroke-width="1.5"
      filter="url(#hp-glow)"/>
  </g>
  <text x="40" y="44" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.95)">🏠</text>
</svg>`

export default function HomePin({ mapRef }: HomePinProps) {
  const homeLocation = useStore((s) => s.homeLocation)
  const markerRef = useRef<L.Marker | null>(null)
  const radarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
    if (radarTimerRef.current) {
      clearTimeout(radarTimerRef.current)
      radarTimerRef.current = null
    }

    if (!homeLocation) return

    const makeIcon = (svg: string, size: [number, number], anchor: [number, number]) =>
      L.divIcon({
        html: `<div style="animation:hp-drop .45s cubic-bezier(0.34,1.2,0.64,1) both">${svg}<style>@keyframes hp-drop{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}</style></div>`,
        className: '',
        iconSize: size,
        iconAnchor: anchor,
      })

    const label = homeLocation.label ?? 'Mi Zona'

    const marker = L.marker([homeLocation.lat, homeLocation.lon], {
      icon: makeIcon(HOME_RADAR_SVG, [80, 80], [40, 40]),
      zIndexOffset: 1500,
    })

    // Label flotante lateral como en el mockup
    marker.bindPopup(
      `<span style="font-size:12px;font-family:'Exo 2',sans-serif;color:var(--home,#FF6B35);font-weight:600">🏠 ${label}</span>`,
      { offset: [50, -10], closeButton: false, className: 'hp-popup', autoClose: false, closeOnClick: false }
    )

    marker.addTo(map)
    setTimeout(() => marker.openPopup(), 300)
    markerRef.current = marker

    // Despues de 3s: pin estatico, popup sigue abierto
    radarTimerRef.current = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.setIcon(makeIcon(HOME_SVG, [32, 44], [16, 44]))
      }
    }, 3000)

    return () => {
      marker.remove()
      markerRef.current = null
      if (radarTimerRef.current) clearTimeout(radarTimerRef.current)
    }
  }, [homeLocation, mapRef])

  return (
    <style>{`
      .hp-popup .leaflet-popup-content-wrapper {
        background: var(--bg-overlay, #252D3D);
        color: var(--home, #FF6B35);
        border-radius: 6px;
        padding: 3px 9px;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        border: 1px solid var(--home, #FF6B35);
      }
      .hp-popup .leaflet-popup-tip { background: var(--bg-overlay, #252D3D); }
      .hp-popup .leaflet-popup-content { margin: 5px 0; }
    `}</style>
  )
}

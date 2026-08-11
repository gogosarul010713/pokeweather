import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'
import { useStore } from '../../store/useStore'

interface HomePinProps {
  mapRef: React.RefObject<LeafletMap | null>
}

// Pin estatico: circulo cian 12px + border blanco (v3 mockup)
const HOME_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
  <circle cx="10" cy="10" r="6" fill="var(--home,#22D3EE)" stroke="#fff" stroke-width="2"/>
  <circle cx="10" cy="10" r="9" fill="none" stroke="var(--home,#22D3EE)" stroke-width="1" opacity="0.35"/>
</svg>`

// Radar: 3 ondas concentricas cian + pin central (activo 3s al fijar zona)
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
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="var(--home-glow,rgba(34,211,238,0.32))"/>
    </filter>
  </defs>
  <circle cx="40" cy="40" r="38" fill="var(--home-dim,rgba(34,211,238,0.14))"/>
  <circle cx="40" cy="40" r="37" fill="none" stroke="rgba(34,211,238,0.25)" stroke-width="1" stroke-dasharray="4 3"/>
  <circle class="hp-w1" cx="40" cy="40" r="36" fill="none" stroke="var(--home,#22D3EE)" stroke-width="1.5"/>
  <circle class="hp-w2" cx="40" cy="40" r="36" fill="none" stroke="var(--home,#22D3EE)" stroke-width="1.5"/>
  <circle class="hp-w3" cx="40" cy="40" r="36" fill="none" stroke="var(--home,#22D3EE)" stroke-width="1.5"/>
  <circle cx="40" cy="40" r="6" fill="var(--home,#22D3EE)" stroke="#fff" stroke-width="2" filter="url(#hp-glow)"/>
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

    const place = homeLocation.label ?? ''
    const coords = `${homeLocation.lat.toFixed(4)}, ${homeLocation.lon.toFixed(4)}`

    const makeCallout = () => `
      <div style="display:flex;flex-direction:column;gap:1px">
        <span style="font-size:9px;font-weight:700;color:var(--home,#22D3EE);display:flex;align-items:center;gap:4px">
          <span>&#127968;</span> Mi Zona
        </span>
        ${place ? `<span style="font-size:8px;font-weight:600;color:var(--text-primary,#E6EDF3)">${place}</span>` : ''}
        <span style="font-size:7.5px;color:var(--text-secondary,#7D8590);font-variant-numeric:tabular-nums">${coords}</span>
      </div>`

    const marker = L.marker([homeLocation.lat, homeLocation.lon], {
      icon: makeIcon(HOME_RADAR_SVG, [80, 80], [40, 40]),
      zIndexOffset: 1500,
    })

    marker.bindPopup(makeCallout(), {
      offset: [0, -44], closeButton: false, className: 'hp-popup', autoClose: false, closeOnClick: false
    })

    marker.addTo(map)
    setTimeout(() => marker.openPopup(), 300)
    markerRef.current = marker

    // Despues de 3s: pin estatico circulo cian
    radarTimerRef.current = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.setIcon(makeIcon(HOME_SVG, [20, 20], [10, 10]))
        markerRef.current.closePopup()
        markerRef.current.unbindPopup()
        markerRef.current.bindPopup(makeCallout(), {
          offset: [0, -18], closeButton: false, className: 'hp-popup', autoClose: false, closeOnClick: false
        })
        markerRef.current.openPopup()
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
        border-radius: 7px;
        padding: 6px 9px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 1px solid var(--border-default, rgba(255,255,255,0.12));
        min-width: 110px;
      }
      .hp-popup .leaflet-popup-tip { background: var(--bg-overlay, #252D3D); }
      .hp-popup .leaflet-popup-content { margin: 0; }
    `}</style>
  )
}

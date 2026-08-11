import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'
import { useStore } from '../../store/useStore'
import type { HomeLocation } from '../../types/homeLocation'

interface NavPinProps {
  mapRef: React.RefObject<LeafletMap | null>
}

const TEARDROP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
  <defs>
    <filter id="np-shadow" x="-40%" y="-20%" width="180%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.45)"/>
    </filter>
  </defs>
  <path d="M14 0 C6.27 0 0 6.27 0 14 C0 24.5 14 40 14 40 C14 40 28 24.5 28 14 C28 6.27 21.73 0 14 0Z"
    fill="var(--ui-accent,#58A6FF)" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" filter="url(#np-shadow)"/>
  <circle cx="14" cy="14" r="5" fill="rgba(255,255,255,0.92)"/>
</svg>`

const RADAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <style>
      .np-pulse { animation: np-pulse 1.6s ease-in-out infinite; transform-origin: 24px 24px; }
      .np-ripple { animation: np-ripple 2s ease-out infinite; transform-origin: 24px 24px; }
      .np-radar { animation: np-spin 3s linear infinite; transform-origin: 24px 24px; }
      @keyframes np-pulse { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.35);opacity:.2} }
      @keyframes np-ripple { 0%{transform:scale(.6);opacity:.5} 100%{transform:scale(3.2);opacity:0} }
      @keyframes np-spin { to{transform:rotate(360deg)} }
    </style>
  </defs>
  <!-- Halo expansivo -->
  <circle class="np-ripple" cx="24" cy="24" r="10" fill="none" stroke="rgba(88,166,255,0.4)" stroke-width="1.5"/>
  <!-- Anillo pulsante -->
  <circle class="np-pulse" cx="24" cy="24" r="12" fill="rgba(88,166,255,0.45)" stroke="none"/>
  <!-- Barrido radar -->
  <g class="np-radar">
    <path d="M24 24 L24 6 A18 18 0 0 1 36.7 11.3 Z" fill="rgba(88,166,255,0.3)"/>
  </g>
  <!-- Punto central -->
  <circle cx="24" cy="24" r="7" fill="#58A6FF" stroke="rgba(255,255,255,1)" stroke-width="2.5"
    style="filter:drop-shadow(0 0 4px rgba(88,166,255,0.6))"/>
</svg>`

export default function NavPin({ mapRef }: NavPinProps) {
  const navPin = useStore((s) => s.navPin)
  const setHomeLocation = useStore((s) => s.setHomeLocation)
  const setNavPin = useStore((s) => s.setNavPin)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    if (!navPin) return

    const isSearch = navPin.type === 'search'
    const svg = isSearch ? TEARDROP_SVG : RADAR_SVG
    const size: [number, number] = isSearch ? [28, 40] : [48, 48]
    const anchor: [number, number] = isSearch ? [14, 40] : [24, 24]

    const icon = L.divIcon({
      html: `<div style="animation:np-drop .45s cubic-bezier(0.34,1.2,0.64,1) both">${svg}<style>@keyframes np-drop{from{transform:translateY(-24px);opacity:0}to{transform:translateY(0);opacity:1}}</style></div>`,
      className: '',
      iconSize: size,
      iconAnchor: anchor,
    })

    const marker = L.marker([navPin.lat, navPin.lon], {
      icon,
      zIndexOffset: 2000,
    })

    const popupContent = isSearch
      ? `<div style="display:flex;flex-direction:column;gap:6px">
           <span>${navPin.label ?? ''}</span>
           <button
             data-fijar="1"
             style="padding:4px 8px;background:#FF6B35;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-family:'Exo 2',sans-serif"
           >📍 Fijar como mi zona</button>
         </div>`
      : (navPin.label ?? '')

    if (isSearch || navPin.label) {
      marker.bindPopup(popupContent, {
        offset: isSearch ? [0, -36] : [0, -20],
        closeButton: false,
        className: 'np-popup',
      })
      setTimeout(() => marker.openPopup(), 500)
    }

    // Delegacion de click para el boton dentro del popup
    function onPopupClick(e: MouseEvent) {
      if ((e.target as HTMLElement).dataset.fijar) {
        const loc: HomeLocation = { lat: navPin!.lat, lon: navPin!.lon, label: navPin!.label }
        setHomeLocation(loc)
        setNavPin(null)
      }
    }
    map.on('popupopen', () => {
      marker.getPopup()?.getElement()?.addEventListener('click', onPopupClick)
    })

    marker.addTo(map)
    markerRef.current = marker

    return () => {
      marker.remove()
      markerRef.current = null
    }
  }, [navPin, mapRef, setHomeLocation, setNavPin])

  return (
    <style>{`
      .np-popup .leaflet-popup-content-wrapper {
        background: var(--bg-overlay, #252D3D);
        color: var(--text-primary, #E6EDF3);
        border-radius: 8px;
        padding: 4px 10px;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .np-popup .leaflet-popup-tip { background: var(--bg-overlay, #252D3D); }
      .np-popup .leaflet-popup-content { margin: 6px 0; }
    `}</style>
  )
}

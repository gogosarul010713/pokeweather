import { useState, useRef, useEffect } from 'react'

interface BottomSheetProps {
  children: React.ReactNode
}

// Snap positions (as % of viewport height)
const SNAP_POSITIONS = {
  collapsed: 5,
  middle: 40,
  expanded: 80,
}

function findClosestSnap(currentPercent: number): number {
  const snaps = [SNAP_POSITIONS.collapsed, SNAP_POSITIONS.middle, SNAP_POSITIONS.expanded]
  return snaps.reduce((closest, snap) =>
    Math.abs(snap - currentPercent) < Math.abs(closest - currentPercent)
      ? snap
      : closest
  )
}

export default function BottomSheet({ children }: BottomSheetProps) {
  const [sheetHeightPercent, setSheetHeightPercent] = useState(SNAP_POSITIONS.middle)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ y: 0, heightPercent: 0 })

  const rootRef = useRef<HTMLDivElement>(null)
  const dragListenerRef = useRef<{ move: (e: MouseEvent | TouchEvent) => void; end: () => void } | null>(null)

  // Get viewport height for calculations
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 812

  // Handle drag start (mouse + touch)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as React.MouseEvent).clientY
    setIsDragging(true)
    setDragStart({ y: clientY, heightPercent: sheetHeightPercent })
  }

  // Create and attach drag listeners
  useEffect(() => {
    if (!isDragging) return

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0]?.clientY : (e as MouseEvent).clientY

      const deltaY = clientY - dragStart.y
      // Moving down = positive deltaY = reducing height
      // Moving up = negative deltaY = increasing height
      const deltaPercent = (deltaY / viewportHeight) * 100

      let newHeightPercent = dragStart.heightPercent - deltaPercent

      // Clamp between min (collapsed) and max (expanded)
      newHeightPercent = Math.max(SNAP_POSITIONS.collapsed, Math.min(newHeightPercent, SNAP_POSITIONS.expanded))

      setSheetHeightPercent(newHeightPercent)
    }

    const handleDragEnd = () => {
      const closestSnap = findClosestSnap(sheetHeightPercent)
      setSheetHeightPercent(closestSnap)
      setIsDragging(false)

      // Cleanup listeners
      if (dragListenerRef.current) {
        document.removeEventListener('mousemove', dragListenerRef.current.move)
        document.removeEventListener('touchmove', dragListenerRef.current.move)
        document.removeEventListener('mouseup', dragListenerRef.current.end)
        document.removeEventListener('touchend', dragListenerRef.current.end)
        dragListenerRef.current = null
      }
    }

    // Store listeners for cleanup
    dragListenerRef.current = {
      move: handleDragMove,
      end: handleDragEnd,
    }

    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('touchmove', handleDragMove, { passive: false })
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)

    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('touchmove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging, dragStart, sheetHeightPercent, viewportHeight])

  return (
    <>
      <style>{`
        .bs-root {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--bs-height);
          z-index: 50;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          transition: var(--bs-transition);
          user-select: var(--bs-user-select);
          -webkit-user-select: var(--bs-user-select);
        }

        .bs-handle-area {
          padding: 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        .bs-handle-area:active {
          cursor: grabbing;
        }

        .bs-handle {
          width: 40px;
          height: 4px;
          background: var(--border-default);
          border-radius: 2px;
          pointer-events: none;
        }

        .bs-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;  /* Critical: allows flex:1 with scrollable content */
          display: flex;
          flex-direction: column;
        }

        /* Scrollbar styling */
        .bs-content::-webkit-scrollbar {
          width: 4px;
        }

        .bs-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .bs-content::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 2px;
        }

        .bs-content::-webkit-scrollbar-thumb:hover {
          background: var(--border-strong);
        }
      `}</style>

      <div
        className="bs-root"
        ref={rootRef}
        style={{
          '--bs-height': `${sheetHeightPercent}vh`,
          '--bs-transition': isDragging ? 'none' : 'height 0.3s ease',
          '--bs-user-select': isDragging ? 'none' : 'auto',
        } as React.CSSProperties}
      >
        {/* Drag Handle */}
        <div
          className="bs-handle-area"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="bs-handle" />
        </div>

        {/* Content (LocationFeed will be here) */}
        <div className="bs-content">
          {children}
        </div>
      </div>
    </>
  )
}

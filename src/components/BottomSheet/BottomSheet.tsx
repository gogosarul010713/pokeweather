import { useState, useRef, useEffect } from 'react'

interface BottomSheetProps {
  children: React.ReactNode
  cityCount?: number
}

const SNAP_POSITIONS = {
  collapsed: 5,
  middle: 40,
  expanded: 80,
}

function findClosestSnap(currentPercent: number): number {
  const snaps = [SNAP_POSITIONS.collapsed, SNAP_POSITIONS.middle, SNAP_POSITIONS.expanded]
  return snaps.reduce((closest, snap) =>
    Math.abs(snap - currentPercent) < Math.abs(closest - currentPercent) ? snap : closest
  )
}

export default function BottomSheet({ children, cityCount }: BottomSheetProps) {
  const [sheetHeightPercent, setSheetHeightPercent] = useState(SNAP_POSITIONS.middle)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ y: 0, heightPercent: 0 })
  const sheetHeightRef = useRef(sheetHeightPercent)

  // Keep ref in sync with state so drag handlers always have fresh value
  useEffect(() => {
    sheetHeightRef.current = sheetHeightPercent
  }, [sheetHeightPercent])

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY
    dragStartRef.current = { y: clientY, heightPercent: sheetHeightRef.current }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e
        ? (e as TouchEvent).touches[0]?.clientY ?? 0
        : (e as MouseEvent).clientY

      const viewportHeight = window.innerHeight
      const deltaPercent = ((clientY - dragStartRef.current.y) / viewportHeight) * 100
      const next = Math.max(
        SNAP_POSITIONS.collapsed,
        Math.min(dragStartRef.current.heightPercent - deltaPercent, SNAP_POSITIONS.expanded)
      )
      setSheetHeightPercent(next)
    }

    const handleDragEnd = () => {
      setSheetHeightPercent(findClosestSnap(sheetHeightRef.current))
      setIsDragging(false)
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
  }, [isDragging])

  return (
    <>
      <style>{`
        .bs-root {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--bs-height);
          z-index: 1001;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          transition: var(--bs-transition);
          user-select: none;
          -webkit-user-select: none;
        }

        .bs-handle-area {
          padding: 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: grab;
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
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .bs-content::-webkit-scrollbar { width: 4px; }
        .bs-content::-webkit-scrollbar-track { background: transparent; }
        .bs-content::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
        .bs-content::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

        .bs-collapsed-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }
      `}</style>

      <div
        className="bs-root"
        style={{
          '--bs-height': `${sheetHeightPercent}vh`,
          '--bs-transition': isDragging ? 'none' : 'height 0.3s ease',
        } as React.CSSProperties}
      >
        <div className="bs-handle-area" onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
          <div className="bs-handle" />
          {sheetHeightPercent === SNAP_POSITIONS.collapsed && cityCount !== undefined && cityCount > 0 && (
            <span className="bs-collapsed-badge">{cityCount} ciudad{cityCount !== 1 ? 'es' : ''}</span>
          )}
        </div>
        <div className="bs-content">
          {children}
        </div>
      </div>
    </>
  )
}

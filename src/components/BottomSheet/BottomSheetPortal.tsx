import { createPortal } from 'react-dom'
import BottomSheet from './BottomSheet'

interface BottomSheetPortalProps {
  children: React.ReactNode
  cityCount?: number
  miZonaActive?: boolean
}

/**
 * Portal wrapper for BottomSheet that renders outside #root
 * This escapes the overflow: hidden stacking context and ensures
 * the sheet is always visible in the viewport on mobile.
 */
export function BottomSheetPortal({ children, cityCount, miZonaActive }: BottomSheetPortalProps) {
  const portalElement = document.getElementById('bottom-sheet-root')

  if (!portalElement) {
    console.warn('⚠️ bottom-sheet-root not found in DOM')
    return null
  }

  return createPortal(
    <BottomSheet cityCount={cityCount} miZonaActive={miZonaActive}>{children}</BottomSheet>,
    portalElement
  )
}

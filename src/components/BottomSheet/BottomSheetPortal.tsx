import { createPortal } from 'react-dom'
import BottomSheet from './BottomSheet'

interface BottomSheetPortalProps {
  children: React.ReactNode
}

/**
 * Portal wrapper for BottomSheet that renders outside #root
 * This escapes the overflow: hidden stacking context and ensures
 * the sheet is always visible in the viewport on mobile.
 */
export function BottomSheetPortal({ children }: BottomSheetPortalProps) {
  const portalElement = document.getElementById('bottom-sheet-root')

  if (!portalElement) {
    console.warn('⚠️ bottom-sheet-root not found in DOM')
    return null
  }

  return createPortal(
    <BottomSheet>{children}</BottomSheet>,
    portalElement
  )
}

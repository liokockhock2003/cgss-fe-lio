import { inActiveClass } from '@/utilities/formatter.ts'
import type { Column } from '@tanstack/react-table'
import { CSSProperties } from 'react'

export const getCommonPinningStyles = (column: Column<unknown>): CSSProperties => {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right')

  const width = column.getSize()

  // if (column.id === '2023-4') {
  //   console.log(width)
  // }

  return column.getCanPin() ?
      {
        boxShadow:
          isLastLeftPinnedColumn ? '-2px 0 2px -2px gray inset'
          : isFirstRightPinnedColumn ? '2px 0 2px -2px gray inset'
          : undefined,

        ...(isPinned ? { opacity: 0.95, position: 'sticky', zIndex: 1 } : {}),
        ...(isPinned === 'left' ? { left: `${column.getStart('left') - 1}px` } : {}),
        ...(isPinned === 'right' ? { right: `${column.getAfter('right') - 1}px` } : {}),
        width,
      }
    : {}
}

export const isTotalCol = (col: { id: string }) => col.id.includes('total')

export const cellClassActiveInActive = ({ row }) => (row.original.status === 'inactive' ? inActiveClass : '')

export function useSkipper() {
  const shouldSkipRef = useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}

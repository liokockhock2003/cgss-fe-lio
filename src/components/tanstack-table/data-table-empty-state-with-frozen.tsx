import { TableCell, TableRow } from '@/components/ui/table.tsx'
import type { Table } from '@tanstack/react-table'

export const DataTableEmptyStateWithFrozen = (table: Table<unknown>) => {
  const left = table.getLeftVisibleLeafColumns()
  const center = table.getCenterVisibleLeafColumns()
  const right = table.getRightVisibleLeafColumns()

  const lefSize = useMemo(() => left.reduce((acc, b) => acc + b.getSize(), 0), [left])
  const rightSize = useMemo(() => right.reduce((acc, b) => acc + b.getSize(), 0), [right])

  return (
    <TableRow>
      <TableCell
        colSpan={left.length}
        style={{
          boxShadow: 'gray -2px 0px 2px -2px inset',
          opacity: 0.95,
          position: 'sticky',
          zIndex: 1,
          left: '-1px',
          width: lefSize,
        }}
      />

      <TableCell colSpan={center.length} className='text-center'>
        No results.
      </TableCell>

      <TableCell
        colSpan={right.length}
        style={{
          boxShadow: 'gray 2px 0px 2px -2px inset',
          opacity: 0.95,
          position: 'sticky',
          zIndex: 1,
          right: '-1px',
          width: rightSize,
        }}
      />
    </TableRow>
  )
}

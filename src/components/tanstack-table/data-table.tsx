// https://github.com/shadcn-ui/ui/blob/main/apps/www/app/(app)/examples/tasks/page.tsx
import { getCommonPinningStyles } from '@/components/tanstack-table/utils.tsx'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'
import { cn } from '@/utilities/cn.ts'
import { flexRender } from '@tanstack/react-table'
import { DataTablePagination } from './data-table-pagination.tsx'

export function DataTable({ table }) {
  return (
    <>
      <div className='border [&>div]:overscroll-x-contain rounded-md'>
        <Table className='h-[fit-content]'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnRelativeDepth = header.depth - header.column.depth

                  if (!header.isPlaceholder && columnRelativeDepth > 1 && header.id === header.column.id) {
                    return null
                  }

                  let rowSpan = 1
                  if (header.isPlaceholder) {
                    const leafs = header.getLeafHeaders()
                    rowSpan = leafs[leafs.length - 1].depth - header.depth
                  }

                  const headerClass: string =
                    typeof header.column.columnDef.meta?.headerClass === 'function' ?
                      header.column.columnDef.meta?.headerClass({ column: header.column })
                    : (header.column.columnDef.meta?.headerClass ?? '')

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn('border-x p-0', headerClass)}
                      rowSpan={rowSpan}
                      style={{ ...getCommonPinningStyles(header.column) }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ?
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className=''>
                  {row.getVisibleCells().map((cell) => {
                    const cellClass: string =
                      typeof cell.column.columnDef.meta?.cellClass === 'function' ?
                        cell.column.columnDef.meta?.cellClass({ row })
                      : (cell.column.columnDef.meta?.cellClass ?? '')

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn('border-x p-0', cellClass)}
                        style={{ ...getCommonPinningStyles(cell.column) }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            : table.options?.meta?.emptyState ?
              table.options.meta.emptyState(table)
            : <TableRow>
                {/* make it work with frozen states, calc left and right frozen and colspan in the middle and display this */}
                <TableCell colSpan={table._getColumnDefs().length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            }
          </TableBody>

          {table.getRowModel().rows?.length ?
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className='bg-background border-x'
                      style={{ ...getCommonPinningStyles(header.column) }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                    </th>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          : null}
        </Table>
      </div>
      {table.options?.meta?.disablePagination ? null : (
        <div className='pt-4'>
          <DataTablePagination table={table} />
        </div>
      )}
    </>
  )
}

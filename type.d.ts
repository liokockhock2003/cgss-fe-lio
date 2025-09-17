import '@tanstack/react-table'
import type { Column, Row, RowData } from '@tanstack/react-table'
import { ReactNode } from 'react'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData = unknown, TValue = unknown> {
    headerClass?: string | ((payload: { column: Column<TData, TValue> }) => string)
    cellClass?: string | ((payload: { row: Row<TData> }) => string)
    displayAs?: string | ReactNode
    columnInfo?: Partial<{ year: number; month: number }>
  }
}

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    disablePagination?: boolean
    updateData?: (rowId: string, colId: string, value: unknown) => void
    emptyState?: () => ReactNode
  }
}

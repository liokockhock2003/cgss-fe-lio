import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { isTotalCol } from '@/components/tanstack-table/utils.tsx'
import { CompanyConfigurationQuery } from '@/store/query/company-configuration.ts'
import { valueFormatter } from '@/utilities/formatter.ts'
import type { Column, Row, Table } from '@tanstack/react-table'
import { lastDayOfMonth } from 'date-fns'
import Decimal from 'decimal.js'
import { get } from 'lodash-es'
import { JSX } from 'react'

export function CellTotal<T extends { status: 'active' | 'inactive' }>({
  column,
  row,
}: {
  table: Table<T>
  row: Row<T>
  column: Column<T>
}) {
  // const isActive = row.original.status === 'active'
  const activitiesStartFrom = new Date(CompanyConfigurationQuery.getData()?.activitiesStartFrom)

  const n = useMemo(() => {
    const parentColumns = column.parent.columns
    const total = parentColumns.reduce((acc: Decimal, col) => {
      const [year, month] = col.id.split('-')
      if (isTotalCol(col) || lastDayOfMonth(new Date(+year, +month - 1, 1)) <= activitiesStartFrom) return acc

      // @ts-ignore
      return acc.add(get(row, `original.${col.columnDef.accessorKey}`, 0) as number)
    }, new Decimal(0))

    return valueFormatter(total.toNumber())
  }, [column.parent.columns, row])

  // const onToggle = () => {
  //   if (!isYearLatest) return
  //
  //   const found = table.getAllColumns().find((i) => i.id === column.parent.id)
  //   const isTotalVisible = found.columns.find(isTotalCol)?.getIsVisible()
  //
  //   found.columns.forEach((col) => {
  //     const totalCol = isTotalCol(col)
  //     col.toggleVisibility(totalCol ? !isTotalVisible : isTotalVisible)
  //   })
  // }

  return <div className='px-4 h-full flex items-center justify-end w-full'>{n}</div>
  // return (
  //   <Tooltip>
  //     <TooltipTrigger
  //       // onClick={onToggle}
  //       className={cn(
  //         'px-4 h-full flex items-center justify-end w-full',
  //         // isYearLatest || !isActive ? 'cursor-pointer' : 'pointer-events-none',
  //       )}>
  //       {n}
  //     </TooltipTrigger>
  //     <TooltipContent>
  //       {isActive ?
  //         <span>
  //           Click here to view <br /> monthly emissions
  //         </span>
  //       : <span>Disabled</span>}
  //     </TooltipContent>
  //   </Tooltip>
  // )
}

export function CellTotalHeader<T>({
  column,
  subtitle = ChemicalSymbol('TONCO2E'),
}: {
  table: Table<T>
  column: Column<T>
  subtitle?: string | JSX.Element
}) {
  // const [{ year }] = useGlobalFilter()
  // const found = table.getAllColumns().find((i) => i.id === column.id)
  // const isTotalVisible = found.columns.find(isTotalCol)?.getIsVisible()
  //
  // const onToggle = () => {
  //   found.columns.forEach((col) => {
  //     const totalCol = isTotalCol(col)
  //     col.toggleVisibility(totalCol ? !isTotalVisible : isTotalVisible)
  //   })
  // }

  return (
    <div className='flex items-center gap-x-2 px-4'>
      <div className='flex gap-x-1 items-center'>
        <span className='text-foreground'>{column.id}</span>
        <span className='text-muted-foreground'>({subtitle})</span>
      </div>
      {/*{year === 'latest' ?*/}
      {/*  <Tooltip>*/}
      {/*    <TooltipTrigger asChild>*/}
      {/*      <Button variant='link' className='p-0' onClick={onToggle}>*/}
      {/*        {isTotalVisible ?*/}
      {/*          <EyeClosed className='h-4 w-5' />*/}
      {/*        : <Eye className='h-4 w-5' />}*/}
      {/*      </Button>*/}
      {/*    </TooltipTrigger>*/}
      {/*    <TooltipContent>*/}
      {/*      Click here to view <br /> monthly emissions*/}
      {/*    </TooltipContent>*/}
      {/*  </Tooltip>*/}
      {/*: null}*/}
    </div>
  )
}

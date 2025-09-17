import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { cn } from '@/utilities/cn.ts'
import { valueFormatter } from '@/utilities/formatter.ts'
import { createColumnHelper } from '@tanstack/react-table'
import Decimal from 'decimal.js'
import { fromPairs, get } from 'lodash-es'
import type { TEmissionSummary } from './api.ts'

export type EmissionSummaryTableType =
  | { type: 'parent'; label: string }
  | { type: 'child'; scope: Record<string, Decimal>; label: string }
  | { type: 'subtotal'; scope: Record<string, Decimal>; label: string }
  | { type: 'total'; scope: Record<string, Decimal>; label: string }

export const isScopeExist = (
  item: EmissionSummaryTableType,
): item is Exclude<EmissionSummaryTableType, { type: 'parent' }> => {
  return item.type !== 'parent' && item?.scope !== undefined
}

const columnHelper = createColumnHelper<EmissionSummaryTableType>()

const config = {
  scope1: [
    { key: 'sc', label: 'Stationary Combustion' },
    { key: 'mc', label: 'Mobile Combustion' },
    { key: 'pe', label: 'Process Emission' },
    { key: 'fe', label: 'Fugitive Emission' },
  ],
  scope2: [
    { key: 'cooling', label: 'Cooling' },
    { key: 'electric', label: 'Electricity' },
    { key: 'heat', label: 'Heat' },
    { key: 'steam', label: 'Steam' },
  ],
  scope3: [
    { key: 'ec', label: 'Employee Commuting' },
    { key: 'bt', label: 'Business Travel' },
    { key: 'up', label: 'Upstream transportation & distribution' },
    { key: 'dw', label: 'Downstream transportation & distribution' },
    { key: 'wg', label: 'Waste Generated' },
  ],
} as const

export const transform = (response: TEmissionSummary['response'][]) => {
  const calcScope = calc(response)

  const result: Root = {
    scope1: calcScope('scope1'),
    scope2: calcScope('scope2'),
    scope3: calcScope('scope3'),
    total: response.reduce((acc, c) => {
      const scope1 = config.scope1.map((s) => s.key).reduce((sum, key) => sum.add(c.scope1?.[key] ?? 0), new Decimal(0))
      const scope2 = config.scope2.map((s) => s.key).reduce((sum, key) => sum.add(c.scope2?.[key] ?? 0), new Decimal(0))
      const scope3 = config.scope3.map((s) => s.key).reduce((sum, key) => sum.add(c.scope3?.[key] ?? 0), new Decimal(0))
      acc[c.label] = scope1.add(scope2).add(scope3).toFixed(2)
      return acc
    }, {}),
  }

  return {
    rows: [
      ...['scope1', 'scope2', 'scope3'].flatMap((scope) => {
        const scopeKey = scope as keyof typeof config
        const scopeConfig = config[scope]
        return [
          { type: 'parent', label: scopeKey.toUpperCase() },

          ...scopeConfig.map(({ key, label }) => ({
            type: 'child',
            scope: result[scopeKey][key],
            label,
          })),

          { type: 'subtotal', scope: result[scopeKey].subtotal, label: 'Sub total' },
        ]
      }),
      { type: 'total', scope: result.total, label: 'TOTAL' },
    ],
    colDef: [
      columnHelper.accessor('label', {
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ getValue, row }) => (
          <div
            className={cn(
              'whitespace-nowrap p-4 flex justify-between items-center bg-background',
              ['subtotal', 'child'].includes(row.original.type) ? 'pl-8' : '',
            )}>
            <span>{getValue() || '-'}</span>
          </div>
        ),
        meta: { displayAs: 'Label', headerClass: () => 'px-4' },
      }),
      ...response.reverse().map((r) => {
        return columnHelper.display({
          id: r.label,
          size: 120,
          header: () => <div className='px-4 text-center'>{r.label}</div>,
          cell: ({ row }) =>
            row.original.type === 'parent' ?
              ''
            : <div className='p-2 flex items-center justify-end h-full w-full whitespace-nowrap tabular-nums'>
                {valueFormatter(new Decimal(get(row.original, `scope.${r.label}` as string, '0')).toNumber())}
              </div>,
          meta: {
            cellClass: ({ row }) =>
              cn(
                ['subtotal', 'total'].includes(row.original.type) ? 'font-bolder' : '',
                row.original.type === 'parent' ? 'border-x-0' : '',
              ),
          },
        })
      }),
    ],
  }
}

export interface Root {
  scope1: { [K in keyof (typeof config.scope1)[number]]: Record<string, string> } & { subtotal: Record<string, string> }
  scope2: { [K in keyof (typeof config.scope2)[number]]: Record<string, string> } & { subtotal: Record<string, string> }
  scope3: { [K in keyof (typeof config.scope3)[number]]: Record<string, string> } & { subtotal: Record<string, string> }
  total: Record<string, string>
}

const calc =
  (response: TEmissionSummary['response'][]) =>
  <T extends keyof Omit<Root, 'total'>>(whichScope: T): Root[T] => {
    return {
      ...Object.fromEntries(
        config[whichScope].map(({ key }) => [
          key,
          fromPairs(
            response.map((item) => [
              item.label,
              new Decimal(item[whichScope]?.[key] ?? 0).toDecimalPlaces(2).toNumber(),
            ]),
          ),
        ]),
      ),
      subtotal: response.reduce((acc, c) => {
        const value = config[whichScope].reduce((sum, { key }) => sum.add(c[whichScope]?.[key] ?? 0), new Decimal(0))
        acc[c.label] = value.toFixed(2)
        return acc
      }, {}),
    } as Root[T]
  }

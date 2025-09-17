import { ChemicalConvert, ChemicalSymbol, gwp_symbols } from '@/components/common-icon.tsx'
import { CellInlineEdit } from '@/components/tanstack-table/cell/cell-inline-edit.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  type EmissionFactorDropdown,
  type EmissionFactorResponse,
  EmissionFactoryQuery,
} from '@/store/query/emission-factor.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { createColumnHelper } from '@tanstack/react-table'
import { orderBy, sortBy } from 'lodash-es'
import { Check, LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type Response = { id: number; year: number; GWP: EmissionFactorResponse['GWP'] }
type Transformed = Record<string, { value: number }> & EmissionFactorDropdown['GWP']

const columnHelper = createColumnHelper()

export const queryFn = async () => {
  const params = { filter: { fields: ['id', 'year', 'GWP'] } }

  return await axios
    .get(`/${EmissionFactoryQuery.uniqueKey}`, { params })
    .then((i) => i.data)
    .then((response: Response[]) => {
      const output = response.reduce((acc, c) => {
        sortBy(c.GWP, ['name']).forEach((i) => {
          const { value, ...rest } = i

          const obj = (acc.has(i.id) ? acc.get(i.id) : rest) as Transformed
          obj[c.year + ''] = { value }
          acc.set(i.id, obj)
        })
        return acc
      }, new Map<string, Transformed>())

      const rowData = Array.from(output.values())

      const columns = [
        columnHelper.accessor('name', {
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue }) => (
            <div className='whitespace-nowrap p-4 capitalize'>
              {/* @ts-ignore */}
              {getValue()}
            </div>
          ),
          meta: { displayAs: 'Name', headerClass: 'px-4' },
        }),

        columnHelper.accessor('symbol', {
          enableSorting: false,
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue }) => {
            const value = getValue() as unknown as Parameters<typeof ChemicalSymbol>[0]

            return (
              <div className='whitespace-nowrap p-4 capitalize'>
                <div className='flex gap-x-2 justify-between items-center'>
                  <span>{ChemicalSymbol(value) ?? ChemicalConvert(value)}</span>

                  {gwp_symbols.includes(value as unknown as never) ?
                    <Check className='size-5' />
                  : null}
                </div>
              </div>
            )
          },
          meta: { displayAs: 'Symbol', headerClass: 'px-4' },
        }),

        ...orderBy(response, ['year'], 'asc').map(({ year }) => {
          return columnHelper.group({
            id: `${year}-wrapper`,
            header: () => year,
            meta: { headerClass: 'px-4' },
            columns: [
              // @ts-ignore
              columnHelper.accessor(`${year}.value`, {
                id: `${year}.value`,
                size: 200,
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                meta: { displayAs: 'Value', headerClass: 'px-2', cellClass: 'px-4' },
                cell: (info) => <CellInlineEdit info={info} />,
              }),

              // @ts-ignore
              columnHelper.accessor(`${year}.url`, {
                id: `${year}.url`,
                maxSize: 300,
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                meta: { displayAs: 'Url', headerClass: 'px-2', cellClass: 'px-4' },
                cell: () => (
                  <div className='flex gap-x-2 items-center relative'>
                    <Input placeholder='reference' className='min-w-[150px] pr-7' disabled={true} />
                    <Link className='capitalize absolute right-[10px]' to={''}>
                      <LinkIcon className='size-4 hover:text-primary' />
                    </Link>
                  </div>
                ),
              }),
            ],
          })
        }),
      ]

      return { rowData, columns, response }
    })
}

import { CommonIcon, gwp_symbols } from '@/components/common-icon.tsx'
import { CellInlineEdit } from '@/components/tanstack-table/cell/cell-inline-edit.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { Input } from '@/components/ui/input.tsx'
import { type EmissionFactorDropdown, EmissionFactoryQuery } from '@/store/query/emission-factor.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { createColumnHelper } from '@tanstack/react-table'
import { orderBy, sortBy } from 'lodash-es'
import { LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export type Transformed = Record<string, { heat_content: number; CO2: number; N2O: number; CH4: number }> &
  EmissionFactorDropdown['stationary_combustion'][number]

const columnHelper = createColumnHelper<Transformed>()

export const queryFn = async () => {
  const params = { filter: { fields: ['id', 'year', 'stationary_combustion'] } }

  return await axios
    .get(`/${EmissionFactoryQuery.uniqueKey}`, { params })
    .then((i) => i.data)
    .then((response) => {
      const output = response.reduce((acc, c) => {
        sortBy(c.stationary_combustion, ['state', 'name']).forEach((i) => {
          const { CO2, CH4, N2O, heat_content, ...rest } = i

          const obj = (acc.has(i.id) ? acc.get(i.id) : rest) as Transformed
          obj[c.year + ''] = { CO2, CH4, N2O, heat_content }
          acc.set(i.id, obj)
        })
        return acc
      }, new Map<string, Transformed>())

      const rowData = Array.from(output.values())

      const columns = [
        columnHelper.accessor('name', {
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue, row }) => (
            <div className='whitespace-nowrap flex justify-between items-center px-4 py-2'>
              <div className=''>{getValue()}</div>
              <div className='flex  flex-col justify-center items-center gap-x-2'>
                <CommonIcon type={row.original.state} className='size-5' />
                {row.original.unit}
              </div>
            </div>
          ),
          meta: { displayAs: 'Name', headerClass: 'px-4' },
        }),

        ...orderBy(response, ['year'], 'asc').map(({ year }) => {
          return columnHelper.group({
            id: `${year}-wrapper`,
            header: () => year,
            meta: { headerClass: 'px-2' },
            columns: [
              columnHelper.accessor(`${year}.heat_content`, {
                id: `${year}.heat_content`,
                size: 150,
                meta: { displayAs: 'Heat Content', headerClass: 'px-4', cellClass: 'px-2' },
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                cell: (info) => <CellInlineEdit info={info} />,
              }),

              ...gwp_symbols.map((field) =>
                columnHelper.accessor(`${year}.${field}`, {
                  id: `${year}.${field}`,
                  size: 200,
                  header: ({ column }) => <DataTableColumnHeader column={column} />,
                  meta: { displayAs: field, headerClass: 'px-2', cellClass: 'px-2' },
                  cell: (info) => <CellInlineEdit info={info} />,
                }),
              ),

              columnHelper.accessor(`${year}.url`, {
                id: `${year}.url`,
                maxSize: 300,
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                meta: { displayAs: 'Url', headerClass: 'px-2', cellClass: 'px-2' },
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

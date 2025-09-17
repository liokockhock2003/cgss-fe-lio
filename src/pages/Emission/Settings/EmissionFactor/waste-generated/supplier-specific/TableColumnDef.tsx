import { CellInlineEdit } from '@/components/tanstack-table/cell/cell-inline-edit.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { Input } from '@/components/ui/input.tsx'
import { EmissionFactorResponse, EmissionFactoryQuery } from '@/store/query/emission-factor.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { createColumnHelper } from '@tanstack/react-table'
import { orderBy } from 'lodash-es'
import { LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type TWasteGenerated = EmissionFactorResponse['waste_generated_supplier_specific_method']
export type Transformed = Record<string, Omit<TWasteGenerated[number], 'name' | 'id'>> & {
  id: TWasteGenerated[number]['id']
  name: TWasteGenerated[number]['name']
}

const columnHelper = createColumnHelper<Transformed>()

export const queryFn = async () => {
  const params = { filter: { fields: ['id', 'year', 'waste_generated_supplier_specific_method'] } }

  return await axios
    .get(`/${EmissionFactoryQuery.uniqueKey}`, { params })
    .then<{ id: number; waste_generated_supplier_specific_method: TWasteGenerated; year: number }[]>((i) => i.data)
    .then((response) => {
      const output = response.reduce((acc, c) => {
        c.waste_generated_supplier_specific_method.forEach((i) => {
          const { name, id, ...rest } = i
          const obj = (acc.has(i.id) ? acc.get(i.id) : { name, id }) as Transformed
          obj[c.year + ''] = rest
          acc.set(i.id, obj)
        })

        return acc
      }, new Map<string, Transformed>())

      const rowData = Array.from(output.values())

      const columns = [
        columnHelper.accessor('name', {
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue }) => (
            <div className='whitespace-nowrap flex justify-between items-center'>
              <div>{getValue()}</div>
            </div>
          ),
          meta: { displayAs: 'Name', headerClass: 'px-4', cellClass: 'p-2' },
        }),

        ...orderBy(response, ['year'], 'asc').map(({ year }) => {
          return columnHelper.group({
            id: `${year}-wrapper`,
            header: () => year,
            meta: { headerClass: 'px-4' },
            columns: [
              columnHelper.accessor(`${year}.value`, {
                id: `${year}.value`,
                size: 150,
                meta: { displayAs: 'Value', headerClass: 'px-4', cellClass: 'p-2' },
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                cell: (info) => {
                  return (
                    <>
                      {/*{info.getValue()} --*/}
                      <CellInlineEdit info={info} />
                    </>
                  )
                },
              }),
              columnHelper.accessor(`${year}.url`, {
                id: `${year}.url`,
                maxSize: 300,
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                meta: { displayAs: 'Url', headerClass: 'px-2', cellClass: 'p-2' },
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

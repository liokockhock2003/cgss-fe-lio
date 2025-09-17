import { CellInlineEdit } from '@/components/tanstack-table/cell/cell-inline-edit.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { Input } from '@/components/ui/input.tsx'
import { EmissionFactorResponse, EmissionFactoryQuery } from '@/store/query/emission-factor.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { createColumnHelper } from '@tanstack/react-table'
import { orderBy } from 'lodash-es'
import { LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type TWasteGenerated = EmissionFactorResponse['waste_generated']
export type Transformed = Record<string, Omit<TWasteGenerated[number], 'material' | 'id'>> & {
  id: TWasteGenerated[number]['id']
  material: TWasteGenerated[number]['material']
}

const columnHelper = createColumnHelper<Transformed>()

export const queryFn = async () => {
  const params = { filter: { fields: ['id', 'year', 'waste_generated'] } }

  return await axios
    .get(`/${EmissionFactoryQuery.uniqueKey}`, { params })
    .then<{ id: number; waste_generated: TWasteGenerated; year: number }[]>((i) => i.data)
    .then((response) => {
      const output = response.reduce((acc, c) => {
        c.waste_generated.forEach((i) => {
          const { material, id, ...rest } = i
          const obj = (acc.has(i.id) ? acc.get(i.id) : { material, id }) as Transformed
          obj[c.year + ''] = rest
          acc.set(i.id, obj)
        })

        return acc
      }, new Map<string, Transformed>())

      const rowData = Array.from(output.values())

      const columns = [
        columnHelper.accessor('material', {
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue }) => (
            <div className='whitespace-nowrap flex justify-between items-center'>
              <div>{getValue()}</div>
            </div>
          ),
          meta: { displayAs: 'Material', headerClass: 'px-4', cellClass: 'p-2' },
        }),

        ...orderBy(response, ['year'], 'asc').map(({ year }) => {
          return columnHelper.group({
            id: `${year}-wrapper`,
            header: () => year,
            meta: { headerClass: 'px-4' },
            columns: [
              columnHelper.accessor(`${year}.recycled`, {
                id: `${year}.recycled`,
                size: 150,
                meta: { displayAs: 'Recycled', headerClass: 'px-4', cellClass: 'p-2' },
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                cell: (info) => <CellInlineEdit info={info} />,
              }),

              columnHelper.accessor(`${year}.landfilled`, {
                id: `${year}.landfilled`,
                size: 150,
                meta: { displayAs: 'Landfilled', headerClass: 'px-4', cellClass: 'p-2' },
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                cell: (info) => <CellInlineEdit info={info} />,
              }),

              columnHelper.accessor(`${year}.combusted`, {
                id: `${year}.combusted`,
                size: 150,
                meta: { displayAs: 'Combusted', headerClass: 'px-4', cellClass: 'p-2' },
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                cell: (info) => <CellInlineEdit info={info} />,
              }),
              columnHelper.accessor(`${year}.composted`, {
                id: `${year}.composted`,
                size: 150,
                meta: { displayAs: 'Composted', headerClass: 'px-4', cellClass: 'p-2' },
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                cell: (info) => <CellInlineEdit info={info} />,
              }),

              columnHelper.accessor(`${year}.anaerobically_digested_dry`, {
                id: `${year}.anaerobically_digested_dry`,
                size: 150,
                meta: {
                  displayAs: 'Anaerobically Dry',
                  headerClass: 'px-4',
                  cellClass: 'p-2',
                },
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                cell: (info) => <CellInlineEdit info={info} />,
              }),

              columnHelper.accessor(`${year}.anaerobically_digested_wet`, {
                id: `${year}.anaerobically_digested_wet`,
                size: 150,
                meta: {
                  displayAs: 'Anaerobically Wet',
                  headerClass: 'px-4',
                  cellClass: 'p-2',
                },
                header: ({ column }) => <DataTableColumnHeader column={column} />,
                cell: (info) => <CellInlineEdit info={info} />,
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

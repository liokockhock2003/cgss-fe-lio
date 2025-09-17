import { gwp_symbols } from '@/components/common-icon.tsx'
import { CellInlineEdit } from '@/components/tanstack-table/cell/cell-inline-edit.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { Input } from '@/components/ui/input.tsx'
import { type EmissionFactorResponse, EmissionFactoryQuery } from '@/store/query/emission-factor.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { createColumnHelper } from '@tanstack/react-table'
import { orderBy, sortBy } from 'lodash-es'
import { LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type Response = Pick<EmissionFactorResponse, 'id' | 'year' | 'mobile_combustion'>
type Transformed = Record<string, { CO2: number; N2O: number; CH4: number }>

type Litre = { id: string; fuel_type: string }
type Distance = { vehicle_type: string; fuel_type: string; litreId: string; id: string }

const columnHelper = createColumnHelper<Litre & Distance & Transformed>()

export const queryFn = async () => {
  const params = { filter: { fields: ['id', 'year', 'mobile_combustion'] } }

  return await axios
    .get(`/${EmissionFactoryQuery.uniqueKey}`, { params })
    .then((i) => i.data)
    .then((response: Response[]) => {
      const [distance, litre] = response.reduce(
        ([distanceMap, litreMap], c) => {
          sortBy(c.mobile_combustion.distance, 'vehicle_type').forEach((d) => {
            const { CO2, CH4, N2O, ...rest } = d

            const obj = distanceMap.has(d.id) ? distanceMap.get(d.id) : { ...rest, type: 'distance' }
            obj[c.year + ''] = { CO2, CH4, N2O }
            distanceMap.set(d.id, obj)
          })

          sortBy(c.mobile_combustion.litre, 'fuel_type').forEach((d) => {
            const { CO2, CH4, N2O, ...rest } = d

            const obj = litreMap.has(d.id) ? litreMap.get(d.id) : { ...rest, type: 'litre' }
            obj[c.year + ''] = { CO2, CH4, N2O }
            litreMap.set(d.id, obj)
          })

          return [distanceMap, litreMap]
        },
        [new Map(), new Map()],
      )

      const rowData = {
        distance: Array.from(distance.values()),
        litre: Array.from(litre.values()),
      } as { litre: (Litre & Transformed)[]; distance: (Distance & Transformed)[] }

      const columns = [
        columnHelper.accessor('vehicle_type', {
          id: 'distance-type',
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue }) => <div className='whitespace-nowrap px-4 capitalize'>{getValue()}</div>,
          meta: { displayAs: 'Vehicle Type', headerClass: 'px-4' },
        }),
        columnHelper.accessor('fuel_type', {
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue }) => <div className='whitespace-nowrap px-4 capitalize'>{getValue()}</div>,
          meta: { displayAs: 'Fuel Type', headerClass: 'px-4' },
        }),
        columnHelper.accessor('litreId', {
          id: 'distance-litreId',
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue }) => <div className='whitespace-nowrap px-4 '>{getValue()}</div>,
          meta: { displayAs: 'Litre?', headerClass: 'px-4' },
        }),

        columnHelper.accessor('id', {
          id: 'litre-id',
          header: ({ column }) => <DataTableColumnHeader column={column} />,
          cell: ({ getValue }) => <div className='whitespace-nowrap px-4'>{getValue()}</div>,
          meta: { displayAs: 'Litre id', headerClass: 'px-4' },
        }),

        ...orderBy(response, ['year'], 'asc').map(({ year }) => {
          return columnHelper.group({
            id: `${year}-wrapper`,
            header: () => year,
            meta: { headerClass: 'px-2' },
            columns: [
              ...gwp_symbols.map((field) =>
                columnHelper.accessor(`${year}.${field}`, {
                  id: `${year}.${field}`,
                  size: 200,
                  header: ({ column }) => <DataTableColumnHeader column={column} />,
                  meta: { displayAs: field, headerClass: 'px-2', cellClass: 'p-2' },
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

      return { rowData, response, columns }
    })
}

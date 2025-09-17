import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/components/ui/form.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { q$ } from '@/store'
import { cn } from '@/utilities/cn.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { get } from 'lodash-es'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

type fields = 'EF_MobileCombustionDistanceId' | 'fuelType'
type DynamicFormName = `${string}.${fields}` | fields

export const FormFuelTypeAndVehicleType = () => {
  const dropdownMobileCombustionQuery = q$.General.EmissionFactoryQuery.useSuspenseDropdown('mobile_combustion')

  const { popoverStates, handleOpenChangeWith } = usePopoverStates({ openFuelType: false, openEFMobileCombustion: false }) // prettier-ignore

  const form = useFormContext<{ [key in DynamicFormName]: string }>()
  const parentContext = useFormField()

  const formPathPrefix = parentContext.name ? `${parentContext.name}.` : ''
  const pathFuelType = (formPathPrefix + 'fuelType') as DynamicFormName
  const pathEF_MobileCombustionDistanceIdPath = (formPathPrefix + 'EF_MobileCombustionDistanceId') as DynamicFormName // prettier-ignore

  const fuelTypesList = useMemo(() => {
    const fts = dropdownMobileCombustionQuery.data?.distance.map((ft) => ft.fuel_type)
    return [...new Set(fts)].sort()
  }, [dropdownMobileCombustionQuery.data])

  const vehicleDistanceList = useMemo(() => {
    return (
      dropdownMobileCombustionQuery.data?.distance.filter((v) => v.fuel_type === get(form.getValues(), pathFuelType)) ??
      []
    )
  }, [dropdownMobileCombustionQuery.data, form.watch(pathFuelType)])

  // mostly for edit path, where we want to set the initial state
  useEffect(() => {
    if (dropdownMobileCombustionQuery.isLoading) return

    const found = dropdownMobileCombustionQuery.data.distance.find(
      (i) => i.id === get(form.getValues(), pathEF_MobileCombustionDistanceIdPath),
    )

    form.setValue(pathFuelType, found?.fuel_type)
  }, [dropdownMobileCombustionQuery.status])

  return (
    <>
      <FormField
        control={form.control}
        name={pathFuelType}
        render={({ field }) => (
          <FormItem>
            <FormLabel className='block'>Fuel type</FormLabel>
            <FormControl>
              <Popover open={popoverStates.openFuelType} onOpenChange={handleOpenChangeWith('openFuelType')} modal>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={popoverStates.openFuelType}
                    className='justify-between w-full truncate'>
                    {field.value ?
                      <span className='capitalize truncate'>{field.value}</span>
                    : <span className='text-gray-500 truncate'>Select Fuel-type</span>}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='p-0' align='start'>
                  <Command>
                    <CommandInput placeholder='Search fuels' />
                    <CommandList>
                      <CommandEmpty>No fuel-type found.</CommandEmpty>
                      <CommandGroup>
                        {fuelTypesList.map((ft, i) => (
                          <CommandItem
                            className='capitalize'
                            key={i}
                            value={ft}
                            onSelect={(currentValue) => {
                              field.onChange(currentValue)
                              form.setValue(pathEF_MobileCombustionDistanceIdPath, '')
                              handleOpenChangeWith('openFuelType', false)
                            }}>
                            <Check className={cn('mr-2 h-4 w-4', field.value === ft ? 'opacity-100' : 'opacity-0')} />
                            {ft}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={pathEF_MobileCombustionDistanceIdPath}
        render={({ field }) => (
          <FormItem className={form.watch(pathFuelType) ? '' : 'cursor-not-allowed'}>
            <FormLabel className='block'>Vehicle type</FormLabel>
            <FormControl>
              <Popover
                open={popoverStates.openEFMobileCombustion}
                onOpenChange={handleOpenChangeWith('openEFMobileCombustion')}
                modal>
                <PopoverTrigger asChild>
                  <Button
                    disabled={!form.watch(pathFuelType)}
                    variant='outline'
                    role='combobox'
                    aria-expanded={popoverStates.openEFMobileCombustion}
                    className='justify-between w-full truncate'>
                    {field.value ?
                      <span className='capitalize truncate'>
                        {
                          dropdownMobileCombustionQuery.data?.distance?.find(
                            (vehicle) => vehicle.id === get(form.getValues(), pathEF_MobileCombustionDistanceIdPath),
                          )?.vehicle_type
                        }
                      </span>
                    : form.watch(pathFuelType) ?
                      <span className='text-gray-500 overflow-hidden text-ellipsis truncate'>
                        Search vehicle of {form.watch(pathFuelType)} type
                      </span>
                    : <span className='truncate'>Please Select Fuel-type first</span>}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='p-0' align='start'>
                  <Command>
                    <CommandInput placeholder='Search vechicles' />
                    <CommandList>
                      <CommandEmpty>No vehicle found.</CommandEmpty>
                      <CommandGroup>
                        {vehicleDistanceList.map((vehicle) => (
                          <CommandItem
                            className='capitalize'
                            key={vehicle.id}
                            value={vehicle.id}
                            onSelect={(currentValue) => {
                              field.onChange(currentValue)
                              handleOpenChangeWith('openEFMobileCombustion', false)
                            }}>
                            <Check
                              className={cn('mr-2 h-4 w-4', field.value === vehicle.id ? 'opacity-100' : 'opacity-0')}
                            />
                            {vehicle.vehicle_type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

/** this is use together with <Suspense> */
export const FormFuelTypeAndVehicleTypeLoading = () => {
  return (
    <>
      <FormItem>
        <FormLabel className='block'>Fuel type</FormLabel>
        <FormControl>
          <Button disabled variant='outline' className='justify-between w-full'>
            Loading ...
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel className='block'>Vehicle type</FormLabel>
        <FormControl>
          <Button disabled variant='outline' className='justify-between w-full'>
            Loading ...
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </FormControl>
      </FormItem>
    </>
  )
}

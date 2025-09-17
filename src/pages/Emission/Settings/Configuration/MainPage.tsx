import { isAccessible } from '@/components/LayoutNewDashbord/isPriorityAccessible.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card.tsx'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Label } from '@/components/ui/label.tsx'
import { MultipleSelector4 } from '@/components/ui/multi-select4.tsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { MobileCombustionApi } from '@/pages/Emission/Scope1/mobile-combustion/api.ts'
import { ProcessEmissionApi } from '@/pages/Emission/Scope1/processes-emission/api.ts'
import { StationaryCombustionApi } from '@/pages/Emission/Scope1/stationary-combustion/api.ts'
import { Scope2Api } from '@/pages/Emission/Scope2/api.ts'
import { BusinessTravelApi } from '@/pages/Emission/Scope3/upstream/business-travel/api.ts'
import { EmployeeCommutingApi } from '@/pages/Emission/Scope3/upstream/employee-commuting/api.ts'
import { UdtdApi } from '@/pages/Emission/Scope3/upstream/upstream-transportation-and-distribution/api.ts'
import { WasteGeneratedApi } from '@/pages/Emission/Scope3/upstream/waste-generated/api.ts'
import { EmissionSummaryApi } from '@/pages/Emission/Summary/api.ts'
import { q$, useAuthUser } from '@/store'
import { Priority } from '@/store/authUser.context.ts'
import { CompanyConfigurationQuery } from '@/store/query/company-configuration.ts'
import { queryClient } from '@/store/query/query-client'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import * as v from 'valibot'

const minStartDate = new Date(2000, 0)

const scope3OptOutCalculation = [
  { label: 'Business Travel', value: 'business-travel' },
  { label: 'Employee Commuting', value: 'employee-commuting' },
  { label: 'Upstream', value: 'upstream' },
  { label: 'Downstream', value: 'downstream' },
  { label: 'Waste Generated', value: 'waste-generated' },
]

const ConfigurationSchema = v.pipe(
  v.object({
    calendarType: v.union([v.literal('normal'), v.literal('financial')]),
    defaultBaseline: v.pipe(v.number(), v.minValue(minStartDate.getFullYear()), v.maxValue(new Date().getFullYear())),
    activitiesStartFrom: v.pipe(
      v.number(),
      v.minValue(minStartDate.getFullYear()),
      v.maxValue(new Date().getFullYear()),
    ),
    optOutCalc: v.array(v.string()),
  }),

  v.forward(
    v.partialCheck(
      [['activitiesStartFrom'], ['defaultBaseline']],
      (input) => input.defaultBaseline >= input.activitiesStartFrom,
      'Baseline year need to be more or equal to activities year',
    ),
    ['defaultBaseline'],
  ),
)

type TConfigurationSchema = v.InferInput<typeof ConfigurationSchema>

function MainPage() {
  const { authUser } = useAuthUser()
  const isAllowed = isAccessible(authUser.priority)(Priority.adminCompany)

  const financialYearStartMonth = q$.General.CompanyInfoQuery.financialYearStartMonth()

  const confQuery = useSuspenseQuery(CompanyConfigurationQuery.fetch())

  // @ts-ignore
  const form = useForm<TConfigurationSchema>({
    values: {
      defaultBaseline: confQuery?.data.defaultBaseline,
      activitiesStartFrom:
        confQuery?.data.activitiesStartFrom ? new Date(confQuery?.data.activitiesStartFrom).getFullYear() : undefined,
      calendarType:
        confQuery?.data.activitiesStartFrom ?
          new Date(confQuery?.data.activitiesStartFrom).getMonth() === 0 ?
            'normal'
          : 'financial'
        : 'normal',
      optOutCalc:
        Object.entries(confQuery?.data?.optOutCalc ?? {}).reduce((acc, [key, value]) => {
          if (value) acc.push(key)
          return acc
        }, []) ?? [],
    },
    resolver: valibotResolver(ConfigurationSchema),
  })

  const mutation = useMutation({
    ...CompanyConfigurationQuery.mutationOption({
      type: 'create',
      toastMsg: 'Updated',
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [CompanyConfigurationQuery.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [EmissionSummaryApi.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [StationaryCombustionApi.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [MobileCombustionApi.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [ProcessEmissionApi.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [Scope2Api.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [BusinessTravelApi.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [EmployeeCommutingApi.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [UdtdApi.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: [WasteGeneratedApi.main.uniqueKey] })
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      },
    }),
  })

  const yearsOptions = useMemo(() => {
    return Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i)
  }, [])

  const onSubmit = async (values: TConfigurationSchema) => {
    try {
      const { calendarType, activitiesStartFrom, optOutCalc, ...rest } = v.parse(ConfigurationSchema, values)

      const remapped = {
        ...rest,
        activitiesStartFrom: `${activitiesStartFrom}-${((calendarType === 'normal' ? 1 : financialYearStartMonth) + '').padStart(2, '0')}-01T00:00:00.000Z`,
        optOutCalc: scope3OptOutCalculation.reduce(
          (acc, { value }) => {
            acc[value] = optOutCalc.includes(value)
            return acc
          },
          {} as { [key: string]: boolean },
        ),
      }

      await mutation.mutateAsync(remapped)
    } catch (error) {
      console.log({ error })
    }
  }

  if (!isAllowed) {
    return <Navigate to='/emission/dashboard' />
  }

  return (
    <Card className='h-full flex pt-6'>
      <CardContent className='h-full flex-1'>
        <CardTitle className='flex items-center gap-2 mb-0'>Configurations</CardTitle>
        <CardDescription className='flex-col @xs/header:hidden @md/header:flex'>
          <span>{`Please set these configurations`} </span>
          <span>{`to continue using this system`}</span>
        </CardDescription>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='h-full flex  flex-col gap-4 pt-5'>
            <div className='max-w-2xl gap-y-6 flex flex-col'>
              {financialYearStartMonth > 1 ?
                <FormField
                  control={form.control}
                  name='calendarType'
                  render={({ field }) => (
                    <FormItem className='p-2 gap-2 sticky top-[-4px] bg-background z-1'>
                      <FormLabel>Calendar Type:</FormLabel>

                      <RadioGroup
                        value={field.value}
                        className='flex gap-x-2'
                        onValueChange={(e: 'financial' | 'normal') => form.setValue('calendarType', e)}>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='financial' id='financial' />
                          <Label className='w-full cursor-pointer' htmlFor='financial'>
                            Financial
                          </Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='normal' id='normal' />
                          <Label className='w-full cursor-pointer' htmlFor='normal'>
                            Normal
                          </Label>
                        </div>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              : null}

              <FormField
                control={form.control}
                name='activitiesStartFrom'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Activities Start at:
                      <span className='ml-2 text-muted-foreground'>
                        (the minimum date for all {`Scope's`} activities and production input)
                      </span>
                    </FormLabel>

                    <Select
                      value={field.value as unknown as string}
                      onValueChange={(selectedYear) => field.onChange(+selectedYear)}>
                      <div className='flex gap-2 items-center'>
                        <SelectTrigger className='max-w-[250px]'>
                          <SelectValue placeholder='Select years' />
                        </SelectTrigger>
                        {field.value ?
                          <span className='ml-2 text-muted-foreground'>
                            {format(
                              new Date(
                                field.value,
                                form.watch('calendarType') === 'normal' ? 0 : financialYearStartMonth - 1,
                                1,
                              ),
                              'do MMMM yyyy',
                            )}
                          </span>
                        : ''}
                      </div>
                      <SelectContent>
                        <SelectGroup>
                          {yearsOptions.map((year, i) => (
                            <SelectItem
                              key={i}
                              value={
                                (year - (form.watch('calendarType') === 'financial' ? 1 : 0)) as unknown as string
                              }>
                              {form.watch('calendarType') === 'financial' ? 'FY ' : ''}
                              {year}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='defaultBaseline'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Baseline:</FormLabel>

                    <Select
                      value={field.value as unknown as string}
                      onValueChange={(selectedYear) => field.onChange(+selectedYear)}>
                      <div className='flex gap-2 items-center'>
                        <SelectTrigger className='max-w-[250px]'>
                          <SelectValue placeholder='Select baseline' />
                        </SelectTrigger>
                        {field.value ?
                          <span className='ml-2 text-muted-foreground'>
                            {field.value} or FY{field.value}
                          </span>
                        : ''}
                      </div>
                      <SelectContent>
                        <SelectGroup>
                          {yearsOptions.map((year, i) => (
                            <SelectItem key={i} value={year as unknown as string}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='optOutCalc'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opt-out calculation:</FormLabel>

                    <MultipleSelector4
                      placeholder='All opt-in'
                      enableSearch={false}
                      values={field.value}
                      align='start'
                      options={scope3OptOutCalculation}
                      onChange={(e) => field.onChange(e)}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-row justify-start space-x-2 py-4'>
                <Button disabled={mutation.isPending} type='submit' className='flex gap-x-2'>
                  {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

MainPage.displayName = 'Configuration.MainPage'
export const Component = MainPage

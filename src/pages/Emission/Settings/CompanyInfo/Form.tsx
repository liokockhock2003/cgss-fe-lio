import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading'
import { FormStatus } from '@/components/reusable-forms/FormStatus.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { MultipleSelector4 } from '@/components/ui/multi-select4.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { q$ } from '@/store'
import { CompanyInfoResponse } from '@/store/query/company-info.ts'
import { cn } from '@/utilities/cn.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { DialogDescription } from '@radix-ui/react-dialog'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { kebabCase } from 'lodash-es'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

const CompanyInfoSSchema = v.object({
  id: v.optional(v.number()),
  name: v.pipe(v.string(), v.nonEmpty('Please enter your "Name"'), v.maxLength(30, 'Your "Name" is too long.')),
  slug: v.pipe(v.string(), v.nonEmpty('Please enter your "Slug"'), v.maxLength(30, 'Your "Slug" is too long.')),
  theme: v.union([v.literal('green'), v.literal('blue')]),
  features: v.pipe(v.array(v.union([v.literal('plant'), v.literal('emission')])), v.minLength(1)),
  addresses: v.pipe(
    v.array(
      v.pipe(v.string(), v.nonEmpty('Please enter your "Addresses"'), v.maxLength(50, 'Your "Addresses" is too long.')),
    ),
    v.minLength(1),
  ),
  contactInfo: v.object({
    name: v.string(),
    email: v.pipe(
      v.string(),
      v.nonEmpty('Please enter your email.'),
      v.email('The email is badly formatted.'),
      v.maxLength(30, 'Your email is too long.'),
    ),
    contactNo: v.string(),
  }),
  expiredAt: v.optional(v.date()),
  status: v.union([v.literal('on'), v.literal('off')]),
  metadata: v.optional(
    v.object({
      maxGroups: v.pipe(v.number(), v.minValue(2)),
      financialYearStartMonth: v.pipe(v.number(), v.minValue(1), v.maxValue(12)),
      icon: v.pipe(v.string(), v.minLength(3)),
    }),
  ),
})

export type TCompanyInfoSSchema = v.InferInput<typeof CompanyInfoSSchema>

CompanyInfoForm.displayName = 'CompanyInfoForm'

export function CompanyInfoForm(props: { payload?: CompanyInfoResponse; onClose: () => void }) {
  const type = props.payload ? 'edit' : 'create'
  const form = useForm<TCompanyInfoSSchema>({
    defaultValues:
      props.payload ?
        {
          name: props.payload.name,
          id: props.payload?.id,
          slug: props.payload.slug,
          theme: 'blue',
          features: props.payload.features,
          addresses: props.payload.addresses,
          contactInfo: props.payload.contactInfo,
          expiredAt: props.payload.expiredAt ?? undefined,
          status: props.payload.status === 'active' ? 'on' : 'off',
          metadata: props.payload.metadata,
        }
      : {
          name: '',
          theme: 'blue',
          slug: '',
          features: [],
          addresses: [],
          contactInfo: undefined,
          expiredAt: undefined,
          status: 'on',
          metadata: {},
        },
    resolver: valibotResolver(CompanyInfoSSchema),
  })

  const mutation = useMutation(
    q$.General.CompanyInfoQuery.mutationOption({
      type,
      onSuccess: () => {
        if (type === 'create') form.reset()

        q$.invalidateQuery(q$.General.CompanyInfoQuery.lists())
        props.onClose()
      },
    }),
  )

  return (
    <Form {...form}>
      <Dialog open onOpenChange={props.onClose}>
        <DialogContent>
          <form
            className='overflow-hidden flex flex-col'
            onSubmit={form.handleSubmit(async () => {
              const status = form.getValues().status === 'on' ? 'active' : 'inactive'
              const extra = type === 'edit' ? { id: props.payload.id } : {}

              await mutation.mutateAsync({ ...form.getValues(), ...extra, status })
            })}>
            <DialogHeader>
              <DialogTitle className='flex items-center'>
                {type === 'edit' ? 'Edit' : 'Create'} company info
              </DialogTitle>
              <DialogDescription>Please be double cautious changing anything here</DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} />

            <DialogBody className='space-y-5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex gap-x-1'>
                      Name
                      {form.watch('name') ?
                        <pre> ({form.watch('slug')})</pre>
                      : null}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='eg: demo'
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                          form.setValue('slug', kebabCase(e.target.value))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='features'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='select-feature'>Features</FormLabel>

                    <MultipleSelector4
                      enableSearch={false}
                      values={field.value}
                      align='start'
                      options={[
                        { label: 'Emission', value: 'emission' },
                        { label: 'Plant', value: 'plant' },
                      ]}
                      onChange={(e) => field.onChange(e)}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='expiredAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expired At (not working yet)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}>
                            {field.value ? format(field.value, 'yyyy-MM-dd') : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          showOutsideDays={false}
                          fromMonth={new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormStatus />

              <div className='mt-6 p-4 flex flex-col gap-4 border border-gray-300 dark:border-gray-800 rounded'>
                <h4 className='text-base font-bold'>Contact Info</h4>
                <FormField
                  control={form.control}
                  name='contactInfo.name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='eg: John Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contactInfo.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='eg: johndoe@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contactInfo.contactNo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact No</FormLabel>
                      <FormControl>
                        <Input placeholder='eg: 60145633241' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='mt-6 p-4 flex flex-col gap-4 border border-gray-300 dark:border-gray-800 rounded'>
                <h4 className='text-base font-bold'>Metadata</h4>

                <div className='grid lg:grid-cols-[1fr_400px] gap-4'>
                  <FormField
                    control={form.control}
                    name='metadata.maxGroups'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Groups</FormLabel>
                        <FormControl>
                          <Input placeholder='number of maxGroup this company can have' type='number' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='metadata.financialYearStartMonth'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Financial Start At month
                          <span className='ml-2 text-muted-foreground'>(default start at January)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='if the company wish to use FY instead of normal calendar year'
                            type='number'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='metadata.icon'
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormLabel>Icon/Image path</FormLabel>
                        <FormControl>
                          <Input placeholder='icon path' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button variant='secondary' type='button' onClick={props.onClose}>
                {type === 'create' ? 'Reset' : 'Cancel'}
              </Button>

              <Button disabled={mutation.isPending} type='submit' className='flex gap-x-2'>
                {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
                {type === 'create' ? 'Create' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  )
}

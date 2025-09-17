import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { FormStatus } from '@/components/reusable-forms/FormStatus.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'
import { q$ } from '@/store'
import type { GroupByResponse } from '@/store/query/group-by'
import { queryClient } from '@/store/query/query-client.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { type QueryKey, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

const GroupBySchema = v.object({
  id: v.optional(v.number()),
  name: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your "Group Scope By"'),
    v.maxLength(30, 'Your "Group Scope By" is too long.'),
  ),
  status: v.union([v.literal('on'), v.literal('off')]),
})

export type TGroupBySchema = v.InferInput<typeof GroupBySchema>

ManageGroupByForm.displayName = 'ManageGroupByForm'
export function ManageGroupByForm(props: { queryKey: QueryKey; payload?: GroupByResponse; onClose: () => void }) {
  const type = props.payload ? 'edit' : 'create'
  const form = useForm<TGroupBySchema>({
    values:
      props.payload ?
        {
          name: props.payload.name,
          status: props.payload.status === 'active' ? 'on' : 'off',
          id: props.payload?.id,
        }
      : undefined,
    resolver: valibotResolver(GroupBySchema),
  })

  const mutation = useMutation(q$.General.GroupByQuery.mutationOption({ type }))

  return (
    <Form {...form}>
      <Dialog open onOpenChange={props.onClose}>
        <DialogContent>
          <form
            className='overflow-hidden flex flex-col'
            onSubmit={form.handleSubmit(async () => {
              mutation.mutate({
                ...(form.getValues() as TGroupBySchema & { id: number }), // a bit hack, create action doest have id
                status: form.getValues().status === 'on' ? 'active' : 'inactive',
              })

              await queryClient.invalidateQueries({ queryKey: props.queryKey })

              props.onClose()
            })}>
            <DialogHeader>
              <DialogTitle>Add New Group</DialogTitle>
              <DialogDescription>eg: Department A, Team B or your own creativity</DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} />

            <DialogBody className='space-y-5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Department A' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormStatus />
            </DialogBody>

            <DialogFooter>
              <Button variant='secondary' type='button' onClick={props.onClose}>
                Cancel
              </Button>

              <Button disabled={mutation.isPending} type='submit' className='flex gap-x-2'>
                {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
                {type === 'create' ? 'Add new' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  )
}

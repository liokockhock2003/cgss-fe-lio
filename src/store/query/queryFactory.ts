import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { queryOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

/**
 * is possible model must follow lb4 controller api
 * @param model
 * @param baseUrl
 * @constructor
 */
export function QueryFactory<TModel>(model: string, baseUrl = model) {
  const qObject = {
    baseUrl,
    qk: () => [model],

    createUrl: (id?: number) => `/${baseUrl}${id ? `/${id}` : ''}`,

    lists: () => [...qObject.qk(), 'list'],
    list<TModelList = TModel[], TResult = TModelList>(
      options?: Partial<{
        onSuccess: (responseData: TModelList) => Promise<TResult>
        onError: (reason: unknown) => void
        queryKey: string[]
        urlManipulation?: (url: string) => string

        _isSingleItem: number // this is used by details api below
      }>,
    ) {
      const action = {
        onSuccess: (data: TModelList) => data,
        onError: (error: unknown) => console.error(error),
        queryKey: qObject.lists(),
        urlManipulation: (url: string) => url,
        ...options,
      } as typeof options

      const url = action.urlManipulation(qObject.createUrl(action._isSingleItem))

      return (lb4Filter = undefined) => {
        return queryOptions({
          queryKey: [...action.queryKey, lb4Filter].filter(Boolean),
          queryFn: async () => {
            return await axios
              .get(url, lb4Filter)
              .then<TModelList>((i) => i.data)
              .then((d) => action.onSuccess(d))
            // .catch((e) => action.onError(e))
          },
        })
      }
    },

    details: (id: number) => [...qObject.qk(), 'detail', `${id}`],
    detail: <TModel>(id: number, args?) =>
      qObject.list<TModel>({ _isSingleItem: id, queryKey: qObject.details(id), ...args }),

    mutationOption<T extends { id: number }>(_action: {
      type: 'edit' | 'create' | 'delete' | 'soft-delete'
      onSuccess?: (a: T) => void
      urlManipulation?: (url: string) => string
      toastMsg?: string | ((prevValue: string) => string)
    }) {
      const {
        type,
        onSuccess,
        urlManipulation,
        toastMsg: description,
      } = {
        onSuccess: () => {},
        urlManipulation: (_) => _,
        ..._action,
      }

      return {
        // TODO: update payload TS type based on type
        async mutationFn(payload) {
          const { id, ...others } = payload
          const [http, extendedUrl, payloadBody] = {
            create: ['post', '', others],
            edit: ['patch', `/${id}`, others],
            delete: ['delete', `/${id}`],
            'soft-delete': ['patch', `/${id}/soft-delete`], // this will update deletedAt, deletedId in BE
          }[type]

          const url = urlManipulation(`${baseUrl}${extendedUrl}`)

          return axios[http](url, payloadBody).catch((error) => {
            // DuplicateEntry
            throw new AxiosError(error.response.data?.error?.message, error.response.data?.error?.statusCode)
          })
        },

        onSuccess: (_, prevValue) => {
          const toastDescription =
            typeof description === 'string'
              ? description
              : typeof description === 'function'
                ? description(prevValue)
                : { edit: 'Edited', create: 'Created', delete: 'Deleted' }[type] // prettier-ignore

          toast({ description: toastDescription })

          onSuccess(prevValue as T)
          q$.invalidateQuery(qObject.lists(), qObject.details((prevValue as unknown as T)?.id))
        },
      }
    },
  }

  return qObject
}

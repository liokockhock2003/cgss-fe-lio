export const toHumanizeDigits = (n: number) => String(n.toLocaleString(undefined, { maximumFractionDigits: 2 }))

export const shortIt = (str: string, length = 30) => {
  return str.length > 30 ? `${str.slice(0, length)}...` : str
}

type ApiTransformed = {
  create: unknown
  duplicate: unknown
  edit: {
    [key: string]: never
  } & { id: string | number }
}

export const apiTransformed = <T extends keyof ApiTransformed>(actionType: T, payload: ApiTransformed[T]) => {
  return (
    {
      create: ['post', '', payload],
      duplicate: ['post', '', payload],
      edit: ['patch', `/${(payload as ApiTransformed['edit']).id}`, payload],
    } as const
  )[actionType]
}

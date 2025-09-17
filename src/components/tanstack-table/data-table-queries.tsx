import type { ColumnSort, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'
import { createParser, parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

// The page index parser is zero-indexed internally,
// but one-indexed when rendered in the URL,
// to align with your UI and what users might expect.
export const pageIndexParser = createParser<number>({
  parse: (query) => {
    const page = parseAsInteger.parse(query)
    return page === null ? null : page - 1
  },
  serialize: (value) => {
    return parseAsInteger.serialize(value + 1)
  },
})

export const pageSizes = [10, 25, 50, 100]
const pageSizeParser = createParser<number>({
  parse: (query) => {
    const size = parseAsInteger.parse(query)
    return pageSizes.includes(size) ? size : pageSizes[0]
  },
  serialize: (value) => {
    return parseAsInteger.serialize(value)
  },
})

const sortingParse = createParser<ColumnSort>({
  parse: (query) => {
    const [id, desc] = query.split(':')
    return { id, desc: desc === 'desc' }
  },
  serialize: (value) => {
    return `${value.id}:${value.desc ? 'desc' : 'asc'}`
  },
})

const tableParsers = {
  pageIndex: pageIndexParser.withDefault(0).withOptions({ clearOnDefault: true }),
  pageSize: pageSizeParser.withDefault(10).withOptions({ clearOnDefault: true }),
  sorting: parseAsArrayOf(sortingParse).withOptions({ clearOnDefault: true }).withDefault([]),
  q: parseAsString.withOptions({ clearOnDefault: true }).withDefault(''),
}

export const useTableParsers = () => {
  return useQueryStates(tableParsers, { urlKeys: { pageIndex: 'page', pageSize: 'size', sorting: 'sort' } })
}

export function useTableQueries() {
  const [state, setState] = useTableParsers()

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => setState((old) => (typeof updater === 'function' ? updater(old) : updater)),
    [state],
  )

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      setState((old) => {
        const sorting = typeof updater === 'function' ? updater(old.sorting) : updater
        return { sorting }
      })
    },
    [state],
  )

  const reset = useCallback(() => {
    setState({ pageIndex: 0 })
  }, [])

  return [state, setState, { reset, onSortingChange, onPaginationChange }] as const
}

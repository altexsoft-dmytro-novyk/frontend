import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUsersList } from '@/api/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import type { UserListItem } from '@/types/domain'

export type StatusTab = 'active' | 'dismissed'

const PAGE_SIZE = 25

function matches(person: UserListItem, q: string): boolean {
  if (!q) return true
  const haystack =
    `${person.firstName} ${person.lastName} ${person.workEmail} ${person.position} ` +
    `${person.country} ${person.city}`
  return haystack.toLowerCase().includes(q.toLowerCase())
}

export const usePeoplePage = () => {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('status') as StatusTab) === 'dismissed' ? 'dismissed' : 'active'
  const search = params.get('q') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const debouncedSearch = useDebounce(search, 250)

  const [pendingSearch, setPendingSearch] = useState(search)

  const query = useUsersList(
    tab === 'dismissed' ? { pageSize: 200, employmentStatus: 'dismissed' } : { pageSize: 200 }
  )

  const setParam = (key: string, value: string | null) => {
    setParams(
      prev => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  const onSearchChange = (value: string) => {
    setPendingSearch(value)
    setParam('q', value || null)
  }

  const setTab = (value: StatusTab) =>
    setParam('status', value === 'dismissed' ? 'dismissed' : null)
  const setPage = (value: number) => setParam('page', value > 1 ? String(value) : null)

  const items = query.data?.items
  const filtered = useMemo(
    () =>
      (items ?? [])
        .filter(p => matches(p, debouncedSearch))
        .sort((a, b) =>
          `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
        ),
    [items, debouncedSearch]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return {
    tab,
    setTab,
    search: pendingSearch,
    onSearchChange,
    rows: pageRows,
    totalCount: filtered.length,
    page: safePage,
    totalPages,
    setPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

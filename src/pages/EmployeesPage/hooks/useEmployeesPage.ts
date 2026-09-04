import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEmployees } from '@/api/hooks/useEmployees'
import { httpStatus } from '@/lib/http'
import type { EmployeeListItem, EmployeeListParams } from '@/types/api'

const PAGE_SIZE = 25

const BIRTH_DAY_RANGE = { min: 1, max: 31 } as const
const BIRTH_MONTH_RANGE = { min: 1, max: 12 } as const

/** Text filters that map 1:1 to a string `GET /users` query param. */
export const TEXT_FILTER_KEYS = [
  'firstName',
  'lastName',
  'position',
  'country',
  'city',
  'workEmail',
  'workPhone',
  'companyJoinDate',
] as const

/** Filters the backend types as an integer. */
export const NUMBER_FILTER_KEYS = ['birthDay', 'birthMonth'] as const

export type EmployeeFilterKey =
  | (typeof TEXT_FILTER_KEYS)[number]
  | (typeof NUMBER_FILTER_KEYS)[number]
  | 'employmentStatus'

const ALL_FILTER_KEYS: EmployeeFilterKey[] = [
  ...TEXT_FILTER_KEYS,
  ...NUMBER_FILTER_KEYS,
  'employmentStatus',
]

export type EmployeesPageStatus =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'forbidden'
  | 'badRequest'
  | 'error'

export type EmployeeFilters = Record<EmployeeFilterKey, string>

const isEmploymentStatus = (value: string | null): value is 'active' | 'dismissed' =>
  value === 'active' || value === 'dismissed'

/** Parse to an integer within `[min, max]`, or `undefined` when out of range / not a number. */
const parseIntInRange = (
  raw: string | null | undefined,
  { min, max }: { min: number; max: number }
): number | undefined => {
  const trimmed = raw?.trim()
  if (!trimmed) {
    return undefined
  }
  const value = Number(trimmed)
  if (!Number.isInteger(value) || value < min || value > max) {
    return undefined
  }
  return value
}

/**
 * URL query state is the single source of truth for the directory: the parsed
 * params drive `GET /users` and the query cache key, and every control writes
 * back to the URL so a filtered view is linkable and survives a reload.
 */
export const useEmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl = Math.max(1, Math.trunc(Number(searchParams.get('page'))) || 1)

  const filters = useMemo<EmployeeFilters>(() => {
    const collected = {} as EmployeeFilters
    for (const key of ALL_FILTER_KEYS) {
      collected[key] = searchParams.get(key) ?? ''
    }
    return collected
  }, [searchParams])

  const params = useMemo<EmployeeListParams>(() => {
    const next: EmployeeListParams = { page: pageFromUrl, pageSize: PAGE_SIZE }
    for (const key of TEXT_FILTER_KEYS) {
      const value = searchParams.get(key)?.trim()
      if (value) {
        next[key] = value
      }
    }
    // Out-of-range day/month values are dropped, not sent — the backend would
    // answer 400 and there is nothing meaningful to query for "month 13".
    const birthDay = parseIntInRange(searchParams.get('birthDay'), BIRTH_DAY_RANGE)
    if (birthDay !== undefined) {
      next.birthDay = birthDay
    }
    const birthMonth = parseIntInRange(searchParams.get('birthMonth'), BIRTH_MONTH_RANGE)
    if (birthMonth !== undefined) {
      next.birthMonth = birthMonth
    }
    const employmentStatus = searchParams.get('employmentStatus')
    if (isEmploymentStatus(employmentStatus)) {
      next.employmentStatus = employmentStatus
    }
    return next
  }, [pageFromUrl, searchParams])

  const query = useEmployees(params)

  const rows: EmployeeListItem[] = query.data?.items ?? []
  const errorStatus = httpStatus(query.error)

  let status: EmployeesPageStatus
  if (query.isError) {
    if (errorStatus === 403) {
      status = 'forbidden'
    } else if (errorStatus === 400) {
      status = 'badRequest'
    } else {
      status = 'error'
    }
  } else if (query.isLoading) {
    status = 'loading'
  } else if (rows.length === 0) {
    status = 'empty'
  } else {
    status = 'ready'
  }

  /** Replace the whole filter set in one navigation; any change resets to page 1. */
  const applyFilters = (nextFilters: Partial<EmployeeFilters>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      for (const key of ALL_FILTER_KEYS) {
        const value = (nextFilters[key] ?? '').trim()
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
      }
      next.delete('page')
      return next
    })
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const goToPage = (nextPage: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (nextPage <= 1) {
        next.delete('page')
      } else {
        next.set('page', String(nextPage))
      }
      return next
    })
  }

  return {
    rows,
    page: query.data?.page ?? pageFromUrl,
    pageSize: query.data?.pageSize ?? PAGE_SIZE,
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    status,
    isFetching: query.isFetching,
    filters,
    hasActiveFilters: ALL_FILTER_KEYS.some(key => filters[key] !== ''),
    applyFilters,
    clearFilters,
    goToPage,
    refetch: query.refetch,
  }
}

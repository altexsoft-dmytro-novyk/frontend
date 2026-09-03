import { useMemo, useState } from 'react'
import { useEmployees } from '@/api/hooks/useEmployees'
import { useDebounce } from '@/hooks/useDebounce'
import { httpStatus } from '@/lib/http'
import { fullName } from '@/lib/employeeFormatters'
import type { EmployeeListItem } from '@/types/api'

/** The directory has no substring search, so the picker pulls a wide first page
 * and filters it client-side; the exact-match inputs below reach anyone that
 * page doesn't contain. */
const PICKER_PAGE_SIZE = 100

export type PersonPickerStatus = 'loading' | 'ready' | 'empty' | 'forbidden' | 'error'

export interface PickerPerson {
  id: string
  name: string
  position: string
  workEmail: string
}

export interface PickerFilters {
  firstName: string
  lastName: string
  workEmail: string
}

const EMPTY_FILTERS: PickerFilters = { firstName: '', lastName: '', workEmail: '' }

const toPickerPerson = (row: EmployeeListItem): PickerPerson => ({
  id: row.id,
  name: fullName(row),
  position: row.position,
  workEmail: row.workEmail,
})

export const usePersonPicker = (excludeIds: string[]) => {
  const [quickFilter, setQuickFilter] = useState('')
  const [filters, setFilters] = useState<PickerFilters>(EMPTY_FILTERS)
  const debouncedFilters = useDebounce(filters, 400)

  const query = useEmployees({
    page: 1,
    pageSize: PICKER_PAGE_SIZE,
    firstName: debouncedFilters.firstName.trim() || undefined,
    lastName: debouncedFilters.lastName.trim() || undefined,
    workEmail: debouncedFilters.workEmail.trim() || undefined,
  })

  const status: PersonPickerStatus = query.isError
    ? httpStatus(query.error) === 403
      ? 'forbidden'
      : 'error'
    : query.isLoading
      ? 'loading'
      : 'ready'

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds])
  const totalMatches = query.data?.total ?? 0
  const fetchedCount = query.data?.items?.length ?? 0

  const people = useMemo(() => {
    const items = query.data?.items ?? []
    const needle = quickFilter.trim().toLowerCase()
    return items
      .filter(row => !excluded.has(row.id))
      .filter(row => {
        if (!needle) {
          return true
        }
        return `${fullName(row)} ${row.workEmail} ${row.position}`.toLowerCase().includes(needle)
      })
      .map(toPickerPerson)
  }, [query.data, quickFilter, excluded])

  const resolvedStatus: PersonPickerStatus =
    status === 'ready' && people.length === 0 ? 'empty' : status

  return {
    quickFilter,
    setQuickFilter,
    filters,
    setFilters,
    people,
    status: resolvedStatus,
    /** `true` when the directory holds more matches than the fetched page — the
     * exact-match inputs are the way to reach the rest. */
    truncated: fetchedCount > 0 && totalMatches > fetchedCount,
    fetchedCount,
    totalMatches,
  }
}

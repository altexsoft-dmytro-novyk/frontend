import { useState, type FormEvent } from 'react'
import type { EmployeeFilters as EmployeeFilterValues } from '../../../hooks/useEmployeesPage'

interface UseEmployeeFiltersArgs {
  filters: EmployeeFilterValues
  onApply: (next: Partial<EmployeeFilterValues>) => void
}

/**
 * Local draft of the filter inputs. The URL stays the source of truth — the
 * draft only holds what the user is typing until they submit (Enter or the
 * Apply button). When the URL changes underneath it (back/forward,
 * clear-filters), the draft re-syncs during render — `filters` is referentially
 * stable between renders, so the comparison only trips on a real URL change.
 */
export const useEmployeeFilters = ({ filters, onApply }: UseEmployeeFiltersArgs) => {
  const [draft, setDraft] = useState<EmployeeFilterValues>(filters)
  const [syncedFilters, setSyncedFilters] = useState<EmployeeFilterValues>(filters)

  if (syncedFilters !== filters) {
    setSyncedFilters(filters)
    setDraft(filters)
  }

  const setValue = (key: keyof EmployeeFilterValues, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    onApply(draft)
  }

  return { draft, setValue, submit }
}

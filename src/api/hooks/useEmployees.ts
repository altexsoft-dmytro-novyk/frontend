import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getEmployeesApiCall } from '@/api/employees'
import { httpStatus } from '@/lib/http'
import type { EmployeeListParams } from '@/types/api'

/**
 * `GET /users` — the paginated, filterable employee directory. The query key
 * carries the parsed params so a filter/page change is a fresh cache entry;
 * `keepPreviousData` keeps the current page on screen while the next one loads.
 *
 * Retry only what is worth retrying: a transport failure (no response) or a
 * `5xx`. `400` (bad filter value), `401` (dead session — the global interceptor
 * already redirects) and `403` (missing `user-management:list`) are terminal.
 */
export const useEmployees = (params: EmployeeListParams) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployeesApiCall(params),
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (failureCount >= 1) {
        return false
      }
      const status = httpStatus(error)
      return status === undefined || status >= 500
    },
  })
}

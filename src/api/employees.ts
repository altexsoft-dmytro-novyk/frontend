/**
 * Employee directory request functions (`services/backend` Story 1.5).
 */

import { apiClient } from '@/api/client'
import type { EmployeeListItem, EmployeeListParams, PaginatedResponse } from '@/types/api'

/**
 * Drop `undefined` / `null` / empty-string params before they reach the wire.
 * `GET /users` rejects any query key outside its allowlist with `400`, and an
 * empty filter must mean "no filter", not `?country=`.
 */
const pruneParams = (params: EmployeeListParams): Record<string, string | number> => {
  const pruned: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    pruned[key] = value as string | number
  }
  return pruned
}

export const getEmployeesApiCall = (
  params: EmployeeListParams
): Promise<PaginatedResponse<EmployeeListItem>> =>
  apiClient.get<PaginatedResponse<EmployeeListItem>>('/users', { params: pruneParams(params) })

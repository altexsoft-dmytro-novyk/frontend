import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { getEmployeeApiCall } from '@/api/profile'

/**
 * `GET /users/:id` — the S1 identity card + the `canEdit` write hint.
 *
 * A `403` (S1 audience is empty over this target, incl. a nonexistent id) and a
 * `404` are terminal — the screen renders the "profile unavailable" panel and
 * must not retry. Only a transport failure or a `5xx` is worth retrying.
 */
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeApiCall(id),
    enabled: id.length > 0,
    retry: (failureCount, error) => {
      if (failureCount >= 1) {
        return false
      }
      if (!isAxiosError(error)) {
        return true
      }
      const status = error.response?.status
      return status === undefined || status >= 500
    },
  })
}

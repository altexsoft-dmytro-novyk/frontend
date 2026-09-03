import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { getCareerEventsApiCall } from '@/api/profile'

/**
 * `GET /users/:id/events` — the career timeline + its own `canEdit` hint.
 *
 * A `403` is terminal and expected: the timeline read audience excludes the
 * colleague audience, so most viewers of someone else's profile get it. The
 * section then shows "not available at your access level", never an error
 * panel — so a `403` must not retry.
 */
export const useCareerEvents = (id: string) => {
  return useQuery({
    queryKey: ['employee', id, 'events'],
    queryFn: () => getCareerEventsApiCall(id),
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

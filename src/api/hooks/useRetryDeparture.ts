import { useMutation, useQueryClient } from '@tanstack/react-query'
import { retryDepartureApiCall } from '@/api/departures'

/**
 * `POST /users/:id/departures/:departureId/retry` — accelerate a `retry_wait`
 * departure (`202`). On success the departure status query is invalidated so the
 * view reflects the fresh state. `409 { error: 'departure_not_retryable' }` and
 * `404` are handled by the caller (refetch + a note / "no longer available").
 */
export const useRetryDeparture = (id: string, departureId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => retryDepartureApiCall(id, departureId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'departure', departureId] })
    },
  })
}

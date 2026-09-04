import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reparentDepartureApiCall } from '@/api/departures'
import type { ReparentDeparturePayload } from '@/types/api'

/**
 * `POST /users/:id/departure-reparenting` — reassigns every platform-owned
 * blocker to one target in a single transaction. On success the profile card and
 * access-journal queries are invalidated (one `AccessJournal` row per kind was
 * written).
 */
export const useReparentDeparture = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReparentDeparturePayload) => reparentDepartureApiCall(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
    },
  })
}

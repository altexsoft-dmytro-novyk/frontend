import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recordDepartureApiCall } from '@/api/departures'
import type { RecordDeparturePayload } from '@/types/api'

interface RecordDepartureVariables {
  payload: RecordDeparturePayload
  /** A client `crypto.randomUUID()` — stable across a byte-identical resubmit,
   * fresh when the form values change or after blocker re-parenting. */
  idempotencyKey: string
}

/**
 * `POST /users/:id/departures`. On a clean `201` the sibling profile card and
 * access-journal queries are invalidated (re-parenting may have moved edges, and
 * the schedule itself is journal-relevant); the caller reads the returned
 * `DepartureView` to drive the status view.
 */
export const useRecordDeparture = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: RecordDepartureVariables) =>
      recordDepartureApiCall(id, payload, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
    },
  })
}

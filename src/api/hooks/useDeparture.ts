import { useQuery } from '@tanstack/react-query'
import { getDepartureApiCall } from '@/api/departures'
import { httpStatus } from '@/lib/http'
import type { DepartureView } from '@/types/api'

/** Poll interval while the worker is actively moving the row (`processing` /
 * `retry_wait`). ~15 s — slow enough not to hammer the API, fast enough that the
 * status view lands on `applied` / `retry_wait` without a manual refresh. */
const ACTIVE_REFETCH_MS = 15000

/**
 * `GET /users/:id/departures/:departureId` — the scheduled departure's status.
 *
 * Enabled only once a `departureId` is known (it comes from the record `POST`
 * response / the `?departure=` URL param — never guessed). `403` (the capability
 * is not broadly seeded) and `404` (unknown / not this user's) are terminal — no
 * retry. While `state` is `processing` / `retry_wait` the query refetches on a
 * short interval; otherwise polling is off.
 */
export const useDeparture = (id: string, departureId: string | null) => {
  return useQuery({
    queryKey: ['employee', id, 'departure', departureId],
    queryFn: () => getDepartureApiCall(id, departureId as string),
    enabled: id.length > 0 && departureId !== null && departureId.length > 0,
    refetchInterval: query => {
      const state = (query.state.data as DepartureView | undefined)?.state
      return state === 'processing' || state === 'retry_wait' ? ACTIVE_REFETCH_MS : false
    },
    retry: (failureCount, error) => {
      if (failureCount >= 1) {
        return false
      }
      const status = httpStatus(error)
      if (status === 403 || status === 404) {
        return false
      }
      return status === undefined || status >= 500
    },
  })
}

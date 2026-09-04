import { useQuery } from '@tanstack/react-query'
import { getRelationshipsApiCall } from '@/api/organisation'
import { httpStatus } from '@/lib/http'
import type { CurrentEdgeView } from '@/types/api'

/**
 * `GET /users/:id/relationships` (Story 6.1) — the authoritative current
 * manager (`direct`) and People Partner (`people_partner`) edges.
 *
 * Same reader gate as `useAccessJournal`: a `403` is terminal and expected (it
 * admits only the subject's current manager / assigned People Partner or an
 * `org:relationships:write` holder). A `404` (not an active user) is terminal
 * too. Only a transport failure or a `5xx` is retried, once — the section then
 * falls back to the journal-derived hint.
 */
export const useRelationships = (id: string) => {
  return useQuery({
    queryKey: ['employee', id, 'relationships'],
    queryFn: () => getRelationshipsApiCall(id),
    enabled: id.length > 0,
    retry: (failureCount, error) => {
      if (failureCount >= 1) {
        return false
      }
      const status = httpStatus(error)
      return status === undefined || status >= 500
    },
  })
}

/** The `direct` (reporting-line manager) edge from a relationships payload, or
 * `null` when the employee has no current manager. */
export const pickManagerEdge = (data: CurrentEdgeView[] | undefined): CurrentEdgeView | null =>
  data?.find(edge => edge.type === 'direct') ?? null

/** The `people_partner` edge from a relationships payload, or `null` when the
 * employee has no current People Partner. */
export const pickPeoplePartnerEdge = (
  data: CurrentEdgeView[] | undefined
): CurrentEdgeView | null => data?.find(edge => edge.type === 'people_partner') ?? null

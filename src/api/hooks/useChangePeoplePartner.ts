import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changePeoplePartnerApiCall } from '@/api/organisation'

export interface ChangePeoplePartnerVars {
  targetId: string
  /** The current People Partner edge's `target.id`, when the authoritative
   * relationships read knows it — sent as the optimistic-concurrency token. */
  expectedCurrentTargetId?: string
}

/**
 * `PUT /users/:id/relationships/people-partner` — assign-or-replace. When
 * `expectedCurrentTargetId` is forwarded the write is optimistic-concurrency
 * checked (a stale token answers `409`). On success the relationships,
 * access-journal and profile card queries are invalidated.
 */
export const useChangePeoplePartner = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ targetId, expectedCurrentTargetId }: ChangePeoplePartnerVars) =>
      changePeoplePartnerApiCall(id, targetId, expectedCurrentTargetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'relationships'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
    },
  })
}

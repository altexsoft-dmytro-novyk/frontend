import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removePeoplePartnerApiCall } from '@/api/organisation'

/**
 * `DELETE /users/:id/relationships/people-partner` — removal. When
 * `expectedCurrentTargetId` is forwarded the write is optimistic-concurrency
 * checked (a stale token answers `409`). On success the relationships,
 * access-journal and profile card queries are invalidated.
 */
export const useRemovePeoplePartner = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expectedCurrentTargetId?: string) =>
      removePeoplePartnerApiCall(id, expectedCurrentTargetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'relationships'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
    },
  })
}

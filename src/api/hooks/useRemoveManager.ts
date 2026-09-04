import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRelationshipApiCall } from '@/api/organisation'

/**
 * `DELETE /users/:id/relationships/:relationshipId` — hard delete of the
 * current `direct` (reporting-line manager) edge. Only offered when the
 * authoritative relationships read gives an edge with a `relationshipId`. On
 * success the relationships, access-journal and profile-card queries are
 * invalidated.
 */
export const useRemoveManager = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (relationshipId: string) => deleteRelationshipApiCall(id, relationshipId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'relationships'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
    },
  })
}

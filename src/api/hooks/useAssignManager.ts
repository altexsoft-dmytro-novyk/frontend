import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignManagerApiCall } from '@/api/organisation'

/**
 * `POST /users/:id/relationships` — first manager assignment.
 *
 * On success the authoritative relationships read, the access-journal query and
 * the sibling profile card query are invalidated so all three reflect the new
 * edge (the card query is not mounted on this screen, but the profile screen
 * re-reads it fresh).
 */
export const useAssignManager = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetId: string) => assignManagerApiCall(id, targetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'relationships'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
    },
  })
}

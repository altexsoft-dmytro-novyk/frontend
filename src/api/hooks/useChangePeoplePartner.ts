import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changePeoplePartnerApiCall } from '@/api/organisation'

/**
 * `PUT /users/:id/relationships/people-partner` — unconditional
 * assign-or-replace. On success the access-journal and profile card queries are
 * invalidated.
 */
export const useChangePeoplePartner = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetId: string) => changePeoplePartnerApiCall(id, targetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
    },
  })
}

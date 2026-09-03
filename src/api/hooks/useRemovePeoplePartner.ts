import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removePeoplePartnerApiCall } from '@/api/organisation'

/**
 * `DELETE /users/:id/relationships/people-partner` — unconditional removal. On
 * success the access-journal and profile card queries are invalidated.
 */
export const useRemovePeoplePartner = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => removePeoplePartnerApiCall(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
    },
  })
}

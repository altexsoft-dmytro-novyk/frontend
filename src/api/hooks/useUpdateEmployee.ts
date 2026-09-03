import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEmployeeApiCall } from '@/api/profile'
import type { UpdateIdentityCardPayload } from '@/types/api'

/**
 * `PATCH /users/:id`. On success only the card query is invalidated (`exact` so
 * the sibling `['employee', id, 'events']` timeline is not needlessly refetched)
 * and the card re-renders from a fresh `GET` — the PATCH body is the whole user
 * row, not the card envelope, so it is not trusted directly.
 */
export const useUpdateEmployee = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateIdentityCardPayload) => updateEmployeeApiCall(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true }),
  })
}

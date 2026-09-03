import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCareerEventApiCall } from '@/api/profile'
import type { CreateCareerEventPayload } from '@/types/api'

/**
 * `POST /users/:id/events`. On success the timeline query is invalidated so the
 * new row appears after a refetch.
 */
export const useCreateCareerEvent = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCareerEventPayload) => createCareerEventApiCall(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee', id, 'events'] }),
  })
}

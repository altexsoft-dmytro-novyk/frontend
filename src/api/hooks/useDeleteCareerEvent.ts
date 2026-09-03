import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCareerEventApiCall } from '@/api/profile'

/**
 * `DELETE /users/:id/events/:eventId` → `204`. On success the timeline query is
 * invalidated so the row disappears after a refetch. A `403`/`404` leaves the
 * list unchanged and surfaces as an inline error.
 */
export const useDeleteCareerEvent = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => deleteCareerEventApiCall(id, eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee', id, 'events'] }),
  })
}

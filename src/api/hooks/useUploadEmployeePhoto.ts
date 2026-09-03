import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadEmployeePhotoApiCall } from '@/api/profile'

/**
 * `PUT /users/:id/photo` (Self-only). On success only the card query is
 * invalidated (`exact` so the sibling `['employee', id, 'events']` timeline is
 * not needlessly refetched) and the header avatar re-renders from the fresh
 * photo URL.
 */
export const useUploadEmployeePhoto = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadEmployeePhotoApiCall(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true }),
  })
}

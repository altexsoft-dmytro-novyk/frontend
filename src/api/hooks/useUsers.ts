import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { getUserApiCall, getUsersApiCall, patchUserApiCall, uploadPhotoApiCall } from '@/api/users'
import type { PatchIdentityBody, UserListQuery } from '@/types/domain'

export const useUsersList = (query: UserListQuery) =>
  useQuery({
    queryKey: queryKeys.users(query),
    queryFn: () => getUsersApiCall(query),
    placeholderData: keepPreviousData,
  })

export const useUser = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.user(id ?? ''),
    queryFn: () => getUserApiCall(id as string),
    enabled: Boolean(id),
    retry: false,
  })

export const usePatchUser = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PatchIdentityBody) => patchUserApiCall(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user(id) })
    },
  })
}

export const useUploadPhoto = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadPhotoApiCall(id, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user(id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

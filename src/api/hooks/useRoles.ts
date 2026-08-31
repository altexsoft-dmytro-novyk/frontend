import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { getRolesApiCall, revokePolicyApiCall } from '@/api/roles'

export const useRoles = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.roles,
    queryFn: getRolesApiCall,
    enabled,
    retry: false,
  })

export const useRevokePolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, policyId }: { userId: string; policyId: string }) =>
      revokePolicyApiCall(userId, policyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles }),
  })
}

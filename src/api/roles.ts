import { apiClient } from '@/api/client'
import type { RolePolicy } from '@/types/domain'

export const getRolesApiCall = () => apiClient.get<RolePolicy[]>('/roles')

export const revokePolicyApiCall = (userId: string, policyId: string) =>
  apiClient.delete<void>(`/users/${userId}/policies/${policyId}`)

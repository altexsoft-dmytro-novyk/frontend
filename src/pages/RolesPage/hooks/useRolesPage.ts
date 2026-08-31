import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useRevokePolicy, useRoles } from '@/api/hooks/useRoles'

export const useRolesPage = () => {
  const { t } = useTranslation()
  const rolesQuery = useRoles()
  const revoke = useRevokePolicy()

  const revokeHolder = async (roleId: string, userId: string) => {
    try {
      await revoke.mutateAsync({ userId, policyId: roleId })
      toast.success(t('roles.revoked'))
    } catch {
      toast.error(t('common.somethingWentWrong'))
    }
  }

  return {
    roles: rolesQuery.data ?? [],
    isLoading: rolesQuery.isLoading,
    isError: rolesQuery.isError,
    refetch: rolesQuery.refetch,
    revokeHolder,
    isRevoking: revoke.isPending,
  }
}

import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PermissionNoticeProps {
  /** Section-scoped so the two sections never share a `data-testid`. */
  testId: string
}

/**
 * Shown in place of the write actions once any write has returned `403` —
 * `org:relationships:write` is not broadly seeded, so most actors hit this.
 */
export const PermissionNotice = ({ testId }: PermissionNoticeProps) => {
  const { t } = useTranslation()
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={testId}>
      <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {t('organisation.permissionNotice')}
    </p>
  )
}

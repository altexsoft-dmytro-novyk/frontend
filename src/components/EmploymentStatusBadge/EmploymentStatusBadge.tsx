import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { EmploymentStatus } from '@/types/domain'

interface EmploymentStatusBadgeProps {
  status: EmploymentStatus
}

export const EmploymentStatusBadge = ({ status }: EmploymentStatusBadgeProps) => {
  const { t } = useTranslation()
  return (
    <Badge variant={status === 'active' ? 'secondary' : 'outline'}>
      {t(`profile.status.${status}`)}
    </Badge>
  )
}

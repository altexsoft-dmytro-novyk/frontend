import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SectionAccess } from '@/api/hooks/useProfileSections'

interface SectionCardProps {
  title: string
  icon: LucideIcon
  status: SectionAccess
  /** Rendered on the right of the header (e.g. an Edit button) when status is 'ok'. */
  headerAction?: ReactNode
  children: ReactNode
}

/**
 * Wraps one profile section. A `404` from the backend means the viewer is not in
 * that section's audience — the card renders nothing at all (matrix parity: the
 * section is "not rendered and not returned").
 */
export const SectionCard = ({
  title,
  icon: Icon,
  status,
  headerAction,
  children,
}: SectionCardProps) => {
  const { t } = useTranslation()

  if (status === 'none') return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        {status === 'ok' && headerAction}
      </CardHeader>
      <CardContent>
        {status === 'loading' && <Skeleton className="h-16 w-full" />}
        {status === 'error' && (
          <p className="text-sm text-muted-foreground">{t('profile.sectionError')}</p>
        )}
        {status === 'ok' && children}
      </CardContent>
    </Card>
  )
}

import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { DerivedCurrent } from '../../helpers/journalDerived'

interface DerivedValueProps {
  derived: DerivedCurrent
  /** Section-scoped so the two sections never share a `data-testid`. */
  testIdPrefix: string
  /** The name picked during this visit, shown in preference to the journal-derived
   * id right after a successful mutation. */
  justAssignedName?: string | null
}

/**
 * The "current" manager / People Partner value. It is only ever a best-effort
 * hint derived from the access-journal rows (or the just-completed action) —
 * never an authoritative read, so it is always labelled as history-derived.
 */
export const DerivedValue = ({ derived, testIdPrefix, justAssignedName }: DerivedValueProps) => {
  const { t } = useTranslation()

  if (justAssignedName) {
    return (
      <p
        className="flex flex-wrap items-center gap-2 text-sm text-foreground"
        data-testid={`${testIdPrefix}-just-assigned`}
      >
        <span className="font-medium">{justAssignedName}</span>
        <Badge variant="secondary">{t('organisation.derived.justAssigned')}</Badge>
      </p>
    )
  }

  if (derived.state === 'loading') {
    return (
      <div
        role="status"
        aria-label={t('organisation.derived.loading')}
        data-testid={`${testIdPrefix}-loading`}
      >
        <Skeleton className="h-4 w-40" />
      </div>
    )
  }

  if (derived.state === 'unknown') {
    return (
      <p className="text-sm text-muted-foreground" data-testid={`${testIdPrefix}-unknown`}>
        {t('organisation.derived.unavailable')}
      </p>
    )
  }

  if (derived.state === 'none') {
    return (
      <p className="text-sm text-muted-foreground" data-testid={`${testIdPrefix}-none`}>
        {t('organisation.derived.none')}
      </p>
    )
  }

  return (
    <p
      className="flex flex-wrap items-center gap-2 text-sm text-foreground"
      data-testid={`${testIdPrefix}-assigned`}
    >
      <span className="font-mono text-xs">{derived.targetUserId}</span>
      <Badge variant="outline" className="border-provenance-derived text-provenance-derived">
        {t('organisation.derived.fromHistory')}
      </Badge>
    </p>
  )
}

import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { CurrentEdgeState } from '../../hooks/useEmployeeOrganisationPage'

interface DerivedValueProps {
  state: CurrentEdgeState
  /** Section-scoped so the two sections never share a `data-testid`. */
  testIdPrefix: string
  /** The name picked during this visit, shown in preference to everything else
   * right after a successful mutation. */
  justAssignedName?: string | null
}

/**
 * The "current" manager / People Partner value. When the authoritative
 * relationships read is available it shows the edge's person by name; otherwise
 * it falls back to a best-effort hint derived from the access-journal rows,
 * always labelled as history-derived.
 */
export const DerivedValue = ({ state, testIdPrefix, justAssignedName }: DerivedValueProps) => {
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

  const loading =
    state.kind === 'loading' || (state.kind === 'derived' && state.derived.state === 'loading')
  if (loading) {
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

  if (state.kind === 'authoritative') {
    if (state.edge) {
      return (
        <p
          className="flex flex-wrap items-center gap-2 text-sm text-foreground"
          data-testid={`${testIdPrefix}-current`}
        >
          <span className="font-medium">
            {state.edge.target.firstName} {state.edge.target.lastName}
          </span>
        </p>
      )
    }
    return (
      <p className="text-sm text-muted-foreground" data-testid={`${testIdPrefix}-none`}>
        {t('organisation.derived.noneCurrent')}
      </p>
    )
  }

  const derived = state.derived

  if (derived.state === 'unknown') {
    return (
      <p className="text-sm text-muted-foreground" data-testid={`${testIdPrefix}-unknown`}>
        {t('organisation.derived.unavailable')}
      </p>
    )
  }

  if (derived.state === 'assigned') {
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

  return (
    <p className="text-sm text-muted-foreground" data-testid={`${testIdPrefix}-none`}>
      {t('organisation.derived.none')}
    </p>
  )
}

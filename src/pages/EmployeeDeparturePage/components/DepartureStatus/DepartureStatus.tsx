import { CalendarX, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatePanel } from '@/components/StatePanel/StatePanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatIsoDate } from '@/lib/employeeFormatters'
import { formatTimestamp } from '@/lib/datetime'
import { useDepartureStatus } from './hooks/useDepartureStatus'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

interface DepartureStatusProps {
  routeId: string
  departureId: string
  backToProfile: string
  onBackToForm: () => void
}

const STATE_BADGE: Record<string, BadgeVariant> = {
  scheduled: 'secondary',
  processing: 'outline',
  // `retry_wait` is a normal, self-healing worker state — not an error.
  retry_wait: 'secondary',
  applied: 'default',
}

const KNOWN_STATES = new Set(['scheduled', 'processing', 'retry_wait', 'applied'])

export const DepartureStatus = ({
  routeId,
  departureId,
  backToProfile,
  onBackToForm,
}: DepartureStatusProps) => {
  const { t } = useTranslation()
  const { phase, view, note, longRetry, retryNow, isRetrying, refetch } = useDepartureStatus({
    routeId,
    departureId,
  })

  if (phase === 'loading') {
    return (
      <div
        className="space-y-3"
        data-testid="departure-status-loading"
        role="status"
        aria-live="polite"
        aria-label={t('departure.status.loading')}
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (phase === 'gone') {
    return (
      <StatePanel
        icon={CalendarX}
        title={t('departure.status.gone.title')}
        body={t('departure.status.gone.body')}
        actions={[{ label: t('departure.status.gone.backToForm'), onClick: onBackToForm }]}
        testId="departure-status-gone"
      />
    )
  }

  if (phase === 'forbidden') {
    return (
      <StatePanel
        icon={TriangleAlert}
        title={t('departure.status.forbidden.title')}
        body={t('departure.status.forbidden.body')}
        link={{ label: t('departure.status.forbidden.back'), to: backToProfile }}
        testId="departure-status-forbidden"
      />
    )
  }

  if (phase === 'error' || !view) {
    return (
      <StatePanel
        icon={TriangleAlert}
        title={t('departure.status.error.title')}
        body={t('departure.status.error.body')}
        actions={[{ label: t('departure.status.error.retry'), onClick: refetch }]}
        testId="departure-status-error"
      />
    )
  }

  const isNonScheduled = view.state !== 'scheduled'
  const badgeVariant = STATE_BADGE[view.state] ?? 'outline'
  const stateLabel = KNOWN_STATES.has(view.state)
    ? t(`departure.status.state.${view.state}`)
    : view.state

  const rows: { label: string; value: string }[] = [
    { label: t('departure.status.field.effectiveDate'), value: formatIsoDate(view.effectiveDate) },
    {
      label: t('departure.status.field.dueAt'),
      value: formatTimestamp(view.dueAt, view.effectiveTimeZone),
    },
    { label: t('departure.status.field.effectiveTimeZone'), value: view.effectiveTimeZone },
    { label: t('departure.status.field.reason'), value: view.reason },
    { label: t('departure.status.field.createdAt'), value: formatTimestamp(view.createdAt) },
  ]
  if (isNonScheduled) {
    rows.push({
      label: t('departure.status.field.attempts'),
      value: String(view.attempts ?? 0),
    })
    rows.push({
      label: t('departure.status.field.lastError'),
      value: view.lastError ?? t('departure.status.lastErrorNone'),
    })
  }
  if (view.state === 'applied' && view.appliedAt) {
    rows.push({
      label: t('departure.status.field.appliedAt'),
      value: formatTimestamp(view.appliedAt),
    })
  }

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 sm:p-5"
      data-testid="departure-status"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="departure-phase-heading"
          tabIndex={-1}
          className="text-sm font-semibold text-foreground outline-none"
        >
          {t('departure.status.title')}
        </h2>
        <Badge variant={badgeVariant} data-testid="departure-status-badge">
          {stateLabel}
        </Badge>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
        {rows.map(row => (
          <div key={row.label} className="contents">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {row.label}
            </dt>
            <dd className="text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      {view.state === 'applied' ? (
        <p
          className="mt-4 text-sm text-muted-foreground"
          data-testid="departure-status-applied-note"
        >
          {t('departure.status.applied.body')}
        </p>
      ) : null}

      {view.state === 'retry_wait' ? (
        <div className="mt-4 space-y-2">
          {longRetry ? (
            <p
              className="text-sm text-muted-foreground"
              role="status"
              data-testid="departure-status-retry-advisory"
            >
              {t('departure.status.retryAdvisory')}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={isRetrying}
            onClick={() => void retryNow()}
            data-testid="departure-retry-now"
          >
            {isRetrying ? t('departure.status.retry.retrying') : t('departure.status.retry.now')}
          </Button>
        </div>
      ) : null}

      {note ? (
        <p
          className="mt-3 text-sm text-muted-foreground"
          role="status"
          data-testid="departure-status-note"
        >
          {note}
        </p>
      ) : null}
    </section>
  )
}
